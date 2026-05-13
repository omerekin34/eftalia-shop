import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function captchaSecret() {
  return (
    process.env.MEMBERSHIP_CAPTCHA_SECRET ||
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    'eftalia-dev-captcha-key'
  )
}

export const MEMBERSHIP_CAPTCHA_COOKIE = 'eftalia_membership_captcha'

export function createMembershipCaptchaToken() {
  const buf = randomBytes(12)
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += CHARS[buf[i] % CHARS.length]
  }
  const exp = Date.now() + 15 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ code, exp }), 'utf8').toString('base64url')
  const sig = createHmac('sha256', captchaSecret()).update(payload).digest('base64url')
  return { code, token: `${payload}.${sig}` }
}

export function verifyMembershipCaptchaToken(token: string | undefined, answer: string) {
  if (!token || !answer?.trim()) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const expected = createHmac('sha256', captchaSecret()).update(payload).digest('base64url')
  try {
    if (expected.length !== sig.length) return false
    if (!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8'))) return false
  } catch {
    return false
  }
  let data: { code?: string; exp?: number }
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { code?: string; exp?: number }
  } catch {
    return false
  }
  if (!data.code || typeof data.exp !== 'number' || Date.now() > data.exp) return false
  return data.code.toLowerCase() === answer.trim().toLowerCase()
}
