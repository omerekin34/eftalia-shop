'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { SpinWheelModal } from '@/components/storefront/spin-wheel-modal'

export function SpinWheelLauncher() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const openModal = () => setIsModalOpen(true)
    window.addEventListener('eftalia:open-spin-wheel', openModal)
    return () => {
      window.removeEventListener('eftalia:open-spin-wheel', openModal)
    }
  }, [])

  return (
    <>
      <div className="fixed bottom-24 right-5 z-[95]">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Şans çarkını aç"
          className="group relative h-14 w-14 rounded-full border border-[#d8b588] bg-gradient-to-br from-[#6f2130] via-[#8d2d42] to-[#b06b2f] p-0.5 shadow-[0_12px_30px_-16px_rgba(91,31,42,0.75)] transition-transform hover:scale-105"
        >
          <span className="absolute inset-[3px] rounded-full border border-white/25" />
          <span
            className="absolute inset-[7px] rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, #f6e2c8, #d8a56f, #f6e2c8, #a75a36, #f6e2c8)',
              animation: 'spin 2.8s linear infinite',
            }}
          />
          <span className="absolute inset-[18px] rounded-full bg-[#5B1F2A]/95" />
          <Sparkles className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[#f4d8b6] transition-colors group-hover:text-white" />
        </button>
      </div>

      <SpinWheelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
