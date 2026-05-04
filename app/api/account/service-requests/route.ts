import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { AccountOrder } from '@/components/storefront/account-orders-section'
import type { ServiceTicket } from '@/components/storefront/account-service-requests-panel'
import { getCustomerDetails, getCustomerOrders, setCustomerTicketMetafield } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

const RETURN_REASONS = new Set([
  'Ürün hasarlı / kusurlu',
  'Yanlış ürün gönderildi',
  'Beden / ölçü uyumsuzluğu',
  'Ürün beklentimi karşılamadı',
  'Diğer',
])

const CANCEL_REASONS = new Set([
  'Siparişi vermekten vazgeçtim',
  'Yanlışlıkla sipariş verdim',
  'Teslimat süresi / tarih uygun değil',
  'Ödeme / adres değişikliği',
  'Diğer',
])

const MAX_TICKETS = 40

function cloneTicketList(raw: Array<ServiceTicket | null | undefined> | null | undefined): ServiceTicket[] {
  return (raw ?? []).filter((t): t is ServiceTicket => Boolean(t))
}

function hasPendingForOrder(list: ServiceTicket[], orderNumber: number) {
  return list.some(
    (t) =>
      Number(t.orderNumber) === orderNumber &&
      (t.status === 'beklemede' || t.status === 'inceleniyor')
  )
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      type?: string
      orderId?: string
      orderNumber?: number
      reason?: string
      note?: string
    }

    const type = body.type === 'cancel' ? 'cancel' : 'return'
    const orderId = String(body.orderId || '').trim()
    const orderNumber = Number(body.orderNumber)
    const reason = String(body.reason || '').trim()
    const note = String(body.note || '').trim().slice(0, 2000)

    if (!orderId || !Number.isFinite(orderNumber)) {
      return NextResponse.json({ error: 'Sipariş bilgisi eksik.' }, { status: 400 })
    }
    if (!reason || reason.length < 3) {
      return NextResponse.json({ error: 'Lütfen bir iptal / iade nedeni seçin veya yazın.' }, { status: 400 })
    }

    const allowed = type === 'cancel' ? CANCEL_REASONS : RETURN_REASONS
    if (!allowed.has(reason)) {
      return NextResponse.json({ error: 'Geçersiz talep nedeni.' }, { status: 400 })
    }
    if (reason === 'Diğer' && note.length < 8) {
      return NextResponse.json(
        { error: '"Diğer" seçildiğinde lütfen açıklama alanına kısa bir not yazın (en az 8 karakter).' },
        { status: 400 }
      )
    }

    const [details, orders] = await Promise.all([getCustomerDetails(token), getCustomerOrders(token)])
    if (!details) {
      return NextResponse.json({ error: 'Hesap bilgisi alınamadı.' }, { status: 401 })
    }

    const orderMatch = (orders as AccountOrder[]).find(
      (o) => o.id === orderId && Number(o.orderNumber) === orderNumber
    )
    if (!orderMatch) {
      return NextResponse.json({ error: 'Bu sipariş hesabınıza ait görünmüyor.' }, { status: 403 })
    }

    const list =
      type === 'cancel' ? cloneTicketList(details.cancelTickets) : cloneTicketList(details.returnTickets)
    if (list.length >= MAX_TICKETS) {
      return NextResponse.json({ error: 'Maksimum talep sayısına ulaşıldı. Destek ile iletişime geçin.' }, { status: 400 })
    }
    if (hasPendingForOrder(list, orderNumber)) {
      return NextResponse.json(
        { error: 'Bu sipariş için zaten bekleyen bir talebiniz var. Güncelleme için destekten yazabilirsiniz.' },
        { status: 400 }
      )
    }

    const ticket = {
      id: randomUUID(),
      orderId,
      orderNumber,
      reason,
      ...(note ? { note } : {}),
      status: 'beklemede',
      createdAt: new Date().toISOString(),
    }

    list.push(ticket)

    const key = type === 'cancel' ? 'cancel_requests' : 'return_requests'
    await setCustomerTicketMetafield(token, key, list)

    return NextResponse.json({ ok: true, ticket })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Talep kaydedilemedi.' },
      { status: 400 }
    )
  }
}
