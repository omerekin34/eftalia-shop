'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { getIlcelerSorted, getMahallelerSorted, getTumIlIsimleri } from '@/lib/turkiye-il-ilce'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const triggerClass =
  'h-auto min-h-[42px] w-full justify-between rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm font-normal text-[#4d3523] hover:bg-white hover:text-[#4d3523]'

type TurkiyeIlIlceFieldsProps = {
  ilValue: string
  ilceValue: string
  mahalleValue: string
  onIlChange: (il: string) => void
  onIlceChange: (ilce: string) => void
  onMahalleChange: (mahalle: string) => void
}

function SearchableLocationPicker({
  type,
  value,
  options,
  placeholder,
  emptyText,
  disabled,
  listClassName,
  onSelect,
}: {
  type: 'il' | 'ilce' | 'mahalle'
  value: string
  options: string[]
  placeholder: string
  emptyText: string
  disabled?: boolean
  listClassName?: string
  onSelect: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(triggerClass, disabled && 'cursor-not-allowed opacity-60')}
        >
          <span className={cn('truncate text-left', !value && 'text-[#7d5f45]/70')}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,360px)] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const q = search.trim().toLocaleLowerCase('tr-TR')
            if (!q) return 1
            const hay = itemValue.toLocaleLowerCase('tr-TR')
            return hay.includes(q) ? 1 : 0
          }}
        >
          <CommandInput
            placeholder={
              type === 'il' ? 'İl ara…' : type === 'ilce' ? 'İlçe ara…' : 'Mahalle ara…'
            }
            className="h-10"
          />
          <CommandList className={listClassName ?? 'max-h-[300px]'}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={`${type}-${item}`}
                  value={item}
                  onSelect={() => {
                    // cmdk normalizes value; use closure so Türkçe (İ/ı) stays correct
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 size-4 shrink-0', value === item ? 'opacity-100' : 'opacity-0')} />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function TurkiyeIlIlceFields({
  ilValue,
  ilceValue,
  mahalleValue,
  onIlChange,
  onIlceChange,
  onMahalleChange,
}: TurkiyeIlIlceFieldsProps) {
  const iller = useMemo(() => getTumIlIsimleri(), [])
  const ilceler = useMemo(() => {
    const base = getIlcelerSorted(ilValue)
    if (ilceValue && !base.includes(ilceValue)) {
      return [...base, ilceValue].sort((a, b) =>
        a.localeCompare(b, 'tr', { sensitivity: 'base' })
      )
    }
    return base
  }, [ilValue, ilceValue])

  const mahalleler = useMemo(() => {
    const base = getMahallelerSorted(ilValue, ilceValue)
    if (mahalleValue && !base.includes(mahalleValue)) {
      return [...base, mahalleValue].sort((a, b) =>
        a.localeCompare(b, 'tr', { sensitivity: 'base' })
      )
    }
    return base
  }, [ilValue, ilceValue, mahalleValue])

  const ilceDisabled = !ilValue || ilceler.length === 0
  const mahalleDisabled = !ilValue || !ilceValue || mahalleler.length === 0

  return (
    <>
      <div className="min-w-0">
        <SearchableLocationPicker
          type="il"
          value={ilValue}
          options={iller}
          placeholder="İl seçin"
          emptyText="İl bulunamadı."
          onSelect={onIlChange}
        />
      </div>
      <div className="min-w-0">
        <SearchableLocationPicker
          type="ilce"
          value={ilceValue}
          options={ilceler}
          placeholder={!ilValue ? 'Önce il seçin' : 'İlçe seçin'}
          emptyText="İlçe bulunamadı."
          disabled={ilceDisabled}
          onSelect={(ilce) => {
            onIlceChange(ilce)
            onMahalleChange('')
          }}
        />
      </div>
      <div className="min-w-0 sm:col-span-2">
        <SearchableLocationPicker
          type="mahalle"
          value={mahalleValue}
          options={mahalleler}
          placeholder={
            !ilValue ? 'Önce il seçin' : !ilceValue ? 'Önce ilçe seçin' : 'Mahalle seçin'
          }
          emptyText="Mahalle bulunamadı."
          disabled={mahalleDisabled}
          listClassName="max-h-[min(50vh,420px)]"
          onSelect={onMahalleChange}
        />
      </div>
    </>
  )
}
