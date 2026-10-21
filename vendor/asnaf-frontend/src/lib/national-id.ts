import { parseDigitString, toLatinDigits } from './datetime'

export function normalizeLegalNationalId(input: string) {
  return parseDigitString(input)
}

export function isValidIranianLegalNationalId(input: string) {
  return /^\d{11}$/.test(normalizeLegalNationalId(input))
}

export function normalizeNationalId(input: string) {
  const digits = parseDigitString(input)
  if (digits.length === 9) {
    return digits.padStart(10, '0')
  }
  return digits
}

/** شماره گذرنامه: حروف و رقم لاتین، بدون فاصله. */
export function normalizePassportNumber(input: string) {
  return toLatinDigits(input.trim()).replace(/[\s-]/g, '').toUpperCase()
}

export function isValidIranianNationalId(input: string) {
  const id = normalizeNationalId(input)
  if (!/^\d{10}$/.test(id) || /^(\d)\1{9}$/.test(id)) {
    return false
  }

  const check = Number(id[9])
  const sum = id
    .slice(0, 9)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0)
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}
