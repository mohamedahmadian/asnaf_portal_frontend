import { useTranslation } from 'react-i18next'
import { integerToPersianWords } from '../../lib/amount-words'
import { groupAmountInput, parseGroupedAmount } from '../../lib/datetime'
import { fieldClassName } from './Form'

export function AmountInput({
  id,
  value,
  onChange,
  required,
  onBlur,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  onBlur?: () => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const display = groupAmountInput(value, locale)
  const amount = parseGroupedAmount(display)
  const words = amount == null ? '' : integerToPersianWords(amount)

  return (
    <>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className={`${fieldClassName} digit-field`}
        value={display}
        onChange={(event) => onChange(groupAmountInput(event.target.value, locale))}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={onBlur}
        required={required}
      />
      {words ? (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
          {t('common.amountEquivalentLabel')}
          <span className="rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-800 ring-1 ring-teal-200">
            {words}
          </span>
        </p>
      ) : null}
    </>
  )
}
