import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerDetails, getCustomerOrders } from '@/lib/shopify'
import {
  getCustomerSpinWheelRewardRaw,
  getWheelDiscountRewards,
  setCustomerSpinWheelRewardRaw,
} from '@/lib/shopify-admin'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'
const MIN_TOTAL_SPEND = 5000

/** Her bir Shopify kupon türü çark üzerinde kaç dilim kaplasın (örn. 3 → her koddan 3 dilim). */
function getSegmentsPerPrize(): number {
  const raw = Number(process.env.WHEEL_SEGMENTS_PER_PRIZE ?? '3')
  if (!Number.isFinite(raw)) return 3
  return Math.max(1, Math.min(12, Math.floor(raw)))
}

type WheelReward = { code: string; label: string }

function expandWheelSegments(pool: WheelReward[]): WheelReward[] {
  if (!pool.length) return []
  const repeat = getSegmentsPerPrize()
  const out: WheelReward[] = []
  for (let r = 0; r < repeat; r += 1) {
    for (const item of pool) {
      out.push(item)
    }
  }
  return out
}

type StoredReward = {
  code: string
  label: string
  usedAt: string
  totalSpendAtSpin: number
  spinIndex: number
}

type SpinRewardState = {
  version: 2
  rewards: StoredReward[]
}

function parseExistingReward(raw: string) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as
      | SpinRewardState
      | { label?: string; code?: string; usedAt?: string; totalSpendAtSpin?: number }
    if (Array.isArray((parsed as SpinRewardState)?.rewards)) {
      const rewards = (parsed as SpinRewardState).rewards.filter((reward) => reward?.code)
      return { version: 2 as const, rewards }
    }

    if ((parsed as { code?: string })?.code) {
      return {
        version: 2 as const,
        rewards: [
          {
            code: String((parsed as { code?: string }).code || ''),
            label: String((parsed as { label?: string }).label || 'Ödül Kuponu'),
            usedAt: String((parsed as { usedAt?: string }).usedAt || new Date().toISOString()),
            totalSpendAtSpin: Number((parsed as { totalSpendAtSpin?: number }).totalSpendAtSpin || 0),
            spinIndex: 1,
          },
        ],
      }
    }
    return null
  } catch {
    return null
  }
}

async function getStatusByToken(token: string) {
  const [customer, orders, rewards] = await Promise.all([
    getCustomerDetails(token),
    getCustomerOrders(token),
    getWheelDiscountRewards(),
  ])
  if (!customer) return { error: 'Müşteri bulunamadı.', status: 404 as const }

  const adminRewardRawResult = await getCustomerSpinWheelRewardRaw(customer.id)
  const rewardRaw = adminRewardRawResult.ok ? adminRewardRawResult.rawValue : customer.spinWheelRewardRaw || ''

  const totalSpend = orders.reduce((sum: number, order: any) => {
    const amount = Number(order?.totalPrice?.amount || 0)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)
  const eligible = totalSpend >= MIN_TOTAL_SPEND

  const parsedState = parseExistingReward(rewardRaw)
  const storedRewards = parsedState?.rewards || []
  // 5000 TL altındaysa önceki eski kazanımlar UI'da gösterilmesin ve hak kilitli kalsın.
  const rewardsWon = eligible ? storedRewards : []
  const latestReward = rewardsWon[rewardsWon.length - 1] || null
  const alreadyUsed = Boolean(latestReward)

  const wheelExpanded = expandWheelSegments(rewards)

  return {
    status: 200 as const,
    customerId: customer.id,
    rewardPool: rewards,
    payload: {
      ok: true,
      eligible,
      totalSpend,
      requiredSpend: MIN_TOTAL_SPEND,
      availableSpins: eligible ? 1 : 0,
      usedSpins: alreadyUsed ? 1 : 0,
      remainingSpins: eligible && !alreadyUsed ? 1 : 0,
      alreadyUsed,
      reward: latestReward,
      rewardsWon,
      rewardSlots: wheelExpanded.length,
      segmentsPerPrize: getSegmentsPerPrize(),
      wheelSegments: wheelExpanded.map(({ label }) => ({ label })),
    },
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const rewards = await getWheelDiscountRewards()
  const wheelExpanded = expandWheelSegments(rewards as WheelReward[])

  if (!token) {
    return NextResponse.json(
      {
        ok: true,
        authenticated: false,
        eligible: false,
        totalSpend: 0,
        requiredSpend: MIN_TOTAL_SPEND,
        availableSpins: 0,
        usedSpins: 0,
        remainingSpins: 0,
        alreadyUsed: false,
        reward: null,
        rewardsWon: [],
        rewardSlots: wheelExpanded.length,
        segmentsPerPrize: getSegmentsPerPrize(),
        wheelSegments: wheelExpanded.map(({ label }) => ({ label })),
      },
      { status: 200 }
    )
  }

  const result = await getStatusByToken(token)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ authenticated: true, ...result.payload }, { status: 200 })
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

    const status = await getStatusByToken(token)
    if ('error' in status) {
      return NextResponse.json({ error: status.error }, { status: status.status })
    }

    if (status.payload.alreadyUsed && status.payload.reward) {
      return NextResponse.json(
        {
          ok: true,
          alreadyUsed: true,
          reward: status.payload.reward,
          rewardsWon: status.payload.rewardsWon,
          totalSpend: status.payload.totalSpend,
          requiredSpend: MIN_TOTAL_SPEND,
          availableSpins: status.payload.availableSpins,
          usedSpins: status.payload.usedSpins,
          remainingSpins: status.payload.remainingSpins,
          rewardSlots: status.payload.rewardSlots,
        },
        { status: 200 }
      )
    }

    const totalSpend = status.payload.totalSpend

    if (totalSpend < MIN_TOTAL_SPEND) {
      return NextResponse.json(
        {
          error: `Çarkıfelek için en az ${MIN_TOTAL_SPEND} TL alışveriş gereklidir.`,
          eligible: false,
          totalSpend,
          requiredSpend: MIN_TOTAL_SPEND,
          availableSpins: status.payload.availableSpins,
          usedSpins: status.payload.usedSpins,
          remainingSpins: status.payload.remainingSpins,
          rewardSlots: status.payload.rewardSlots,
        },
        { status: 403 }
      )
    }

    if (status.payload.remainingSpins <= 0) {
      return NextResponse.json(
        {
          ok: true,
          alreadyUsed: true,
          reward: status.payload.reward,
          rewardsWon: status.payload.rewardsWon,
          totalSpend,
          requiredSpend: MIN_TOTAL_SPEND,
          availableSpins: status.payload.availableSpins,
          usedSpins: status.payload.usedSpins,
          remainingSpins: 0,
          rewardSlots: status.payload.rewardSlots,
        },
        { status: 200 }
      )
    }

    const rewards = status.rewardPool
    if (!rewards.length) {
      return NextResponse.json(
        { error: 'Çark kuponları yapılandırılmamış. Lütfen mağaza yöneticisine başvurun.' },
        { status: 503 }
      )
    }
    const expanded = expandWheelSegments(rewards)
    if (!expanded.length) {
      return NextResponse.json(
        { error: 'Çark dilimleri oluşturulamadı. Kupon listesini kontrol edin.' },
        { status: 503 }
      )
    }
    const segmentIndex = Math.floor(Math.random() * expanded.length)
    const reward = expanded[segmentIndex]
    const nextUsedSpins = status.payload.usedSpins + 1
    const rewardPayload: StoredReward = {
      ...reward,
      usedAt: new Date().toISOString(),
      totalSpendAtSpin: totalSpend,
      spinIndex: nextUsedSpins,
    }
    const nextState: SpinRewardState = {
      version: 2,
      rewards: [...status.payload.rewardsWon, rewardPayload],
    }
    const saveResult = await setCustomerSpinWheelRewardRaw(status.customerId, JSON.stringify(nextState))
    if (!saveResult.ok) {
      return NextResponse.json(
        {
          error: `Ödül Shopify hesabına işlenemedi: ${saveResult.error}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      alreadyUsed: false,
      reward: rewardPayload,
      rewardsWon: nextState.rewards,
      totalSpend,
      requiredSpend: MIN_TOTAL_SPEND,
      availableSpins: status.payload.availableSpins,
      usedSpins: nextUsedSpins,
      remainingSpins: Math.max(0, status.payload.availableSpins - nextUsedSpins),
      rewardSlots: status.payload.rewardSlots,
      rewardIndex: segmentIndex >= 0 ? segmentIndex : 0,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Çarkıfelek sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 500 }
    )
  }
}
