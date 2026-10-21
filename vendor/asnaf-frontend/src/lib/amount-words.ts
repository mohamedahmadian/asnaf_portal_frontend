const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه']
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده']
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون']

function chunkToWords(value: number) {
  const parts: string[] = []
  const hundred = Math.floor(value / 100)
  const rest = value % 100
  if (hundred) parts.push(hundreds[hundred] ?? '')
  if (rest >= 10 && rest < 20) {
    parts.push(teens[rest - 10] ?? '')
  } else {
    const ten = Math.floor(rest / 10)
    const one = rest % 10
    if (ten) parts.push(tens[ten] ?? '')
    if (one) parts.push(ones[one] ?? '')
  }
  return parts.filter(Boolean).join(' و ')
}

/** Whole rial/toman-style amounts, up to the trillions (15 digits). */
export function integerToPersianWords(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) return ''
  if (value === 0) return 'صفر'
  const chunks: number[] = []
  let remaining = value
  while (remaining > 0) {
    chunks.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }
  const parts: string[] = []
  for (let index = chunks.length - 1; index >= 0; index -= 1) {
    const chunk = chunks[index] ?? 0
    if (!chunk) continue
    const words = chunkToWords(chunk)
    const scale = scales[index] ?? ''
    parts.push(scale ? `${words} ${scale}` : words)
  }
  return parts.join(' و ')
}
