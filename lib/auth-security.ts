import { NextRequest } from 'next/server'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type PasswordCheckResult = {
  valid: boolean
  message?: string
}

type RateLimitStoreEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
  remaining: number
}

const rateLimitStore = new Map<string, RateLimitStoreEntry>()
const UPSTASH_REDIS_REST_URL = String(process.env.UPSTASH_REDIS_REST_URL || '').trim()
const UPSTASH_REDIS_REST_TOKEN = String(process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()

export function getRequestIp(request: NextRequest | Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

function checkRateLimitInMemory(options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = rateLimitStore.get(options.key)

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(options.limit - 1, 0),
    }
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
      remaining: 0,
    }
  }

  existing.count += 1
  rateLimitStore.set(options.key, existing)
  return {
    allowed: true,
    retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    remaining: Math.max(options.limit - existing.count, 0),
  }
}

async function checkRateLimitInUpstash(options: RateLimitOptions): Promise<RateLimitResult | null> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  const endpoint = `${UPSTASH_REDIS_REST_URL}/pipeline`
  const key = `rl:${options.key}`
  const ttlSeconds = Math.max(Math.ceil(options.windowMs / 1000), 1)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, ttlSeconds, 'NX'],
        ['TTL', key],
      ]),
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const result = (await response.json()) as Array<{ result?: number }>
    const count = Number(result?.[0]?.result ?? 0)
    const ttl = Number(result?.[2]?.result ?? ttlSeconds)
    const retryAfterSeconds = Math.max(ttl > 0 ? ttl : ttlSeconds, 1)

    return {
      allowed: count <= options.limit,
      retryAfterSeconds,
      remaining: Math.max(options.limit - count, 0),
    }
  } catch {
    return null
  }
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const upstashResult = await checkRateLimitInUpstash(options)
  if (upstashResult) {
    return upstashResult
  }

  return checkRateLimitInMemory(options)
}

export function validateStrongPassword(password: string): PasswordCheckResult {
  if (password.length < 10) {
    return { valid: false, message: 'Şifre en az 10 karakter olmalıdır.' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir küçük harf içermelidir.' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir büyük harf içermelidir.' }
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Şifre en az bir rakam içermelidir.' }
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir sembol içermelidir.' }
  }

  return { valid: true }
}
