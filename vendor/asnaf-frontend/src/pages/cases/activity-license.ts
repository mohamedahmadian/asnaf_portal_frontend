import { toPng } from 'html-to-image'
import face400 from '@fontsource/vazirmatn/400.css?raw'
import face700 from '@fontsource/vazirmatn/700.css?raw'
import face800 from '@fontsource/vazirmatn/800.css?raw'
import arabic400 from '@fontsource/vazirmatn/files/vazirmatn-arabic-400-normal.woff2?url'
import latin400 from '@fontsource/vazirmatn/files/vazirmatn-latin-400-normal.woff2?url'
import latinExt400 from '@fontsource/vazirmatn/files/vazirmatn-latin-ext-400-normal.woff2?url'
import arabic700 from '@fontsource/vazirmatn/files/vazirmatn-arabic-700-normal.woff2?url'
import latin700 from '@fontsource/vazirmatn/files/vazirmatn-latin-700-normal.woff2?url'
import latinExt700 from '@fontsource/vazirmatn/files/vazirmatn-latin-ext-700-normal.woff2?url'
import arabic800 from '@fontsource/vazirmatn/files/vazirmatn-arabic-800-normal.woff2?url'
import latin800 from '@fontsource/vazirmatn/files/vazirmatn-latin-800-normal.woff2?url'
import latinExt800 from '@fontsource/vazirmatn/files/vazirmatn-latin-ext-800-normal.woff2?url'
import { formatGregorianDate, formatJalaliDate, localizeDigits } from '../../lib/datetime'
import { activityLicenseSheetCss } from './activity-license-styles'

const LICENSE_FONT = 'Vazirmatn, Vazir, Tahoma, sans-serif'
const FONT_SAMPLE = 'سلام وزیر ABC 0123'

const FONT_FILES: Record<string, string> = {
  'vazirmatn-arabic-400-normal.woff2': arabic400,
  'vazirmatn-latin-400-normal.woff2': latin400,
  'vazirmatn-latin-ext-400-normal.woff2': latinExt400,
  'vazirmatn-arabic-700-normal.woff2': arabic700,
  'vazirmatn-latin-700-normal.woff2': latin700,
  'vazirmatn-latin-ext-700-normal.woff2': latinExt700,
  'vazirmatn-arabic-800-normal.woff2': arabic800,
  'vazirmatn-latin-800-normal.woff2': latin800,
  'vazirmatn-latin-ext-800-normal.woff2': latinExt800,
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

let cachedFontFaceCss: Promise<string> | null = null

function licenseFontFaceCss() {
  if (cachedFontFaceCss) return cachedFontFaceCss
  cachedFontFaceCss = (async () => {
    const origin = window.location.href
    const embedded = await Promise.all(
      Object.entries(FONT_FILES).map(async ([name, file]) => {
        const res = await fetch(new URL(file, origin).href)
        if (!res.ok) throw new Error(`font ${name}`)
        return [name, await blobToDataUrl(await res.blob())] as const
      }),
    )
    const dataUrls = Object.fromEntries(embedded)
    const faces = `${face400}\n${face700}\n${face800}`
      .replace(/font-display:\s*swap/g, 'font-display: block')
      .replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '')
      .replace(/url\(\.\/files\/([^)]+)\)/g, (full, name: string) => {
        const file = dataUrls[name]
        return file ? `url("${file}")` : full
      })
    return `${faces}\n${faces.replace(/font-family:\s*'Vazirmatn'/g, "font-family: 'Vazir'")}`
  })()
  cachedFontFaceCss.catch(() => {
    cachedFontFaceCss = null
  })
  return cachedFontFaceCss
}

export type ActivityLicense = {
  licenseNumber: string
  issuedAt: string | null
  expiresAt: string | null
  requestNumber: string | null
  trackingCode: string | null
  firstName: string
  lastName: string
  lastNameEn: string | null
  gender: 'MALE' | 'FEMALE' | null
  birthDate: string | null
  nationalityIso2?: string | null
  nationalityFa: string | null
  nationalityEn: string | null
  passportNumber: string | null
  phone: string | null
  tradeName: string | null
  activityTitle: string | null
  activityTitleEn: string | null
  photoId: string | null
  signerName: string | null
  signerTitle: string | null
  signatureId: string | null
  address: string | null
  addressEn: string | null
  plaque: string | null
  floor: string | null
  unitNo: string | null
  postalCode: string | null
  cityNameFa: string | null
  cityNameEn: string | null
  complexName: string | null
  complexNameEn: string | null
}

export type LicenseField = {
  fa: string
  en: string
  faValue: string
  enValue: string
}

export type LicenseRow = {
  id: string
  fields: LicenseField[]
}

export type LicenseView = {
  org: string
  orgEn: string
  title: string
  titleEn: string
  rows: LicenseRow[]
  photoUrl: string | null
  signerName: string | null
  signerTitle: string | null
  signatureUrl: string | null
}

export type LicenseCopy = {
  org: string
  orgEn: string
  title: string
  titleEn: string
  number: string
  numberEn: string
  issued: string
  issuedEn: string
  expires: string
  expiresEn: string
  name: string
  nameEn: string
  gender: string
  genderEn: string
  male: string
  maleEn: string
  female: string
  femaleEn: string
  birth: string
  birthEn: string
  nationality: string
  nationalityEn: string
  passport: string
  passportEn: string
  address: string
  addressEn: string
  phone: string
  phoneEn: string
  activity: string
  activityEn: string
  trade: string
  tradeEn: string
  plaque: string
  floor: string
  unit: string
  postal: string
}

function text(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

function faDigits(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? localizeDigits(trimmed, 'fa') : '—'
}

function addressLine(
  license: ActivityLicense,
  copy: LicenseCopy,
  side: 'fa' | 'en',
) {
  const complex = side === 'fa' ? license.complexName : license.complexNameEn || license.complexName
  const city = side === 'fa' ? license.cityNameFa : license.cityNameEn || license.cityNameFa
  const plaque = side === 'fa' ? copy.plaque : 'No.'
  const floor = side === 'fa' ? copy.floor : 'Floor'
  const unit = side === 'fa' ? copy.unit : 'Unit'
  const postal = side === 'fa' ? copy.postal : 'Postal'
  const street = side === 'fa' ? license.address : license.addressEn
  const parts = [
    complex,
    street,
    license.plaque ? `${plaque} ${license.plaque}` : null,
    license.floor ? `${floor} ${license.floor}` : null,
    license.unitNo ? `${unit} ${license.unitNo}` : null,
    city,
    license.postalCode ? `${postal} ${license.postalCode}` : null,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
  if (!parts.length) return '—'
  return side === 'fa' ? localizeDigits(parts.join('، '), 'fa') : parts.join(', ')
}

function faDate(value: string | null) {
  return value ? formatJalaliDate(value, 'fa') : '—'
}

function enDate(value: string | null) {
  return value ? formatGregorianDate(value, 'en') : '—'
}

function field(fa: string, en: string, faValue: string, enValue: string): LicenseField {
  return { fa, en, faValue, enValue }
}

function row(id: string, ...fields: LicenseField[]): LicenseRow {
  return { id, fields }
}

export function buildLicenseView(
  license: ActivityLicense,
  copy: LicenseCopy,
  photoUrl: string | null,
  signatureUrl: string | null = null,
): LicenseView {
  const fullName = `${license.firstName} ${license.lastName}`.replace(/\s+/g, ' ').trim()
  const genderFa = license.gender === 'MALE' ? copy.male : license.gender === 'FEMALE' ? copy.female : null
  const genderEn = license.gender === 'MALE' ? copy.maleEn : license.gender === 'FEMALE' ? copy.femaleEn : null
  const rows = [
    row('number', field(copy.number, copy.numberEn, faDigits(license.licenseNumber), license.licenseNumber)),
    row('trade', field(copy.trade, copy.tradeEn, text(license.tradeName), text(license.tradeName))),
    row(
      'dates',
      field(copy.issued, copy.issuedEn, faDate(license.issuedAt), enDate(license.issuedAt)),
      field(copy.expires, copy.expiresEn, faDate(license.expiresAt), enDate(license.expiresAt)),
    ),
    row('name', field(copy.name, copy.nameEn, text(fullName), text(license.lastNameEn))),
    row(
      'identity',
      field(copy.gender, copy.genderEn, text(genderFa), text(genderEn)),
      field(copy.birth, copy.birthEn, faDate(license.birthDate), enDate(license.birthDate)),
      field(
        copy.nationality,
        copy.nationalityEn,
        text(license.nationalityFa),
        text(license.nationalityEn || license.nationalityFa),
      ),
    ),
    row('address', field(copy.address, copy.addressEn, addressLine(license, copy, 'fa'), addressLine(license, copy, 'en'))),
    row('phone', field(copy.phone, copy.phoneEn, faDigits(license.phone), text(license.phone))),
    row(
      'activity',
      field(copy.activity, copy.activityEn, text(license.activityTitle), text(license.activityTitleEn || license.activityTitle)),
    ),
  ]
  return {
    org: copy.org,
    orgEn: copy.orgEn,
    title: copy.title,
    titleEn: copy.titleEn,
    photoUrl,
    signerName: license.signerName?.trim() || null,
    signerTitle: license.signerTitle?.trim() || null,
    signatureUrl,
    rows,
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fieldHtml(item: LicenseField, stacked: boolean) {
  if (!stacked) {
    return `<div><div class="license-sheet__label">${escapeHtml(item.fa)}</div><div class="license-sheet__value">${escapeHtml(item.faValue)}</div></div>
        <div class="license-sheet__en"><div class="license-sheet__label">${escapeHtml(item.en)}</div><div class="license-sheet__value">${escapeHtml(item.enValue)}</div></div>`
  }
  return `<div class="license-sheet__cell">
        <div class="license-sheet__label">${escapeHtml(item.fa)}</div>
        <div class="license-sheet__value">${escapeHtml(item.faValue)}</div>
        <div class="license-sheet__en-line">${escapeHtml(item.en)}: ${escapeHtml(item.enValue)}</div>
      </div>`
}

function activityLicenseArticle(view: LicenseView) {
  const rows = view.rows
    .map((item) => {
      const grouped = item.fields.length > 1
      const cols = grouped ? ` style="grid-template-columns:repeat(${item.fields.length},minmax(0,1fr))"` : ''
      const body = grouped
        ? item.fields.map((entry) => fieldHtml(entry, true)).join('')
        : fieldHtml(item.fields[0], false)
      return `<div class="license-sheet__row${grouped ? ' license-sheet__row--group' : ''}"${cols}>${body}</div>`
    })
    .join('')
  const photo = view.photoUrl
    ? `<div class="license-sheet__photo"><img src="${escapeHtml(view.photoUrl)}" alt="" /></div>`
    : ''
  const showStamp = Boolean(view.signatureUrl || view.signerName || view.signerTitle)
  const stamp = showStamp
    ? `<div class="license-sheet__stamp">${
        view.signatureUrl ? `<img src="${escapeHtml(view.signatureUrl)}" alt="" />` : ''
      }${view.signerName ? `<div class="license-sheet__signer">${escapeHtml(view.signerName)}</div>` : ''}${
        view.signerTitle ? `<div class="license-sheet__role">${escapeHtml(view.signerTitle)}</div>` : ''
      }</div>`
    : ''
  return `<article class="license-sheet license-sheet--page" dir="rtl" lang="fa">
  <aside class="license-sheet__band">
    ${photo}
    <div class="license-sheet__brand">
      <svg class="license-sheet__mark" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="28" r="10" fill="#f0c14d"/><path d="M8 46c8-8 14-8 22 0s14 8 22 0 14-8 12 0" fill="none" stroke="#7ec8e3" stroke-width="3"/><path d="M8 54c8-8 14-8 22 0s14 8 22 0 14-8 12 0" fill="none" stroke="#fff" stroke-width="3"/></svg>
      <div class="license-sheet__org">${escapeHtml(view.org)}</div>
      <div class="license-sheet__org-en">${escapeHtml(view.orgEn)}</div>
      <div class="license-sheet__title">${escapeHtml(view.title)}</div>
      <div class="license-sheet__title-en">${escapeHtml(view.titleEn)}</div>
    </div>
  </aside>
  <div class="license-sheet__body">${rows}<div class="license-sheet__foot">${stamp}</div></div>
</article>`
}

async function activityLicenseFragment(view: LicenseView) {
  const fontCss = await licenseFontFaceCss()
  return `<style>${fontCss}${activityLicenseSheetCss}.license-sheet{font-family:${LICENSE_FONT}}</style>${activityLicenseArticle(view)}`
}

export async function activityLicenseHtml(view: LicenseView) {
  const fragment = await activityLicenseFragment(view)
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(view.title)}</title>
<style>
  html,body{margin:0;background:#eef3f8;font-family:${LICENSE_FONT};color:#14222b}
  @page{size:A4 landscape;margin:0}
  @media print{
    html,body{box-sizing:border-box;width:100%;height:100%;margin:0;padding:0;background:#fff;overflow:hidden}
    body{display:flex;min-height:100vh}
    .license-sheet{flex:1 1 auto;width:100%;height:100%;min-height:100vh}
    .license-sheet,.license-sheet__band{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style></head><body>${fragment}</body></html>`
}

export function licenseCopy(t: (key: string) => string): LicenseCopy {
  return {
    org: t('cases.licenseDoc.org'),
    orgEn: t('cases.licenseDoc.orgEn'),
    title: t('cases.licenseDoc.title'),
    titleEn: t('cases.licenseDoc.titleEn'),
    number: t('cases.licenseDoc.number'),
    numberEn: t('cases.licenseDoc.numberEn'),
    issued: t('cases.licenseDoc.issued'),
    issuedEn: t('cases.licenseDoc.issuedEn'),
    expires: t('cases.licenseDoc.expires'),
    expiresEn: t('cases.licenseDoc.expiresEn'),
    name: t('cases.licenseDoc.name'),
    nameEn: t('cases.licenseDoc.nameEn'),
    gender: t('cases.licenseDoc.gender'),
    genderEn: t('cases.licenseDoc.genderEn'),
    male: t('cases.licenseDoc.male'),
    maleEn: t('cases.licenseDoc.maleEn'),
    female: t('cases.licenseDoc.female'),
    femaleEn: t('cases.licenseDoc.femaleEn'),
    birth: t('cases.licenseDoc.birth'),
    birthEn: t('cases.licenseDoc.birthEn'),
    nationality: t('cases.licenseDoc.nationality'),
    nationalityEn: t('cases.licenseDoc.nationalityEn'),
    passport: t('cases.licenseDoc.passport'),
    passportEn: t('cases.licenseDoc.passportEn'),
    address: t('cases.licenseDoc.address'),
    addressEn: t('cases.licenseDoc.addressEn'),
    phone: t('cases.licenseDoc.phone'),
    phoneEn: t('cases.licenseDoc.phoneEn'),
    activity: t('cases.licenseDoc.activity'),
    activityEn: t('cases.licenseDoc.activityEn'),
    trade: t('cases.licenseDoc.trade'),
    tradeEn: t('cases.licenseDoc.tradeEn'),
    plaque: t('cases.licenseDoc.plaque'),
    floor: t('cases.licenseDoc.floor'),
    unit: t('cases.licenseDoc.unit'),
    postal: t('cases.licenseDoc.postal'),
  }
}

export async function downloadActivityLicense(filename: string, view: LicenseView) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.position = 'fixed'
  host.style.insetInlineStart = '-10000px'
  host.style.top = '0'
  host.style.width = '297mm'
  host.style.height = '210mm'
  host.style.background = '#fff'
  host.innerHTML = await activityLicenseFragment(view)
  document.body.appendChild(host)
  try {
    const sheet = host.querySelector('.license-sheet')
    if (!(sheet instanceof HTMLElement)) return
    await Promise.all([
      ...[...host.querySelectorAll('img')].map((img) => img.decode().catch(() => undefined)),
      document.fonts.load('400 16px Vazirmatn', FONT_SAMPLE),
      document.fonts.load('700 16px Vazirmatn', FONT_SAMPLE),
      document.fonts.load('800 16px Vazirmatn', FONT_SAMPLE),
      document.fonts.ready,
    ])
    const dataUrl = await toPng(sheet, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`
    link.click()
  } finally {
    host.remove()
  }
}

export async function printActivityLicense(html: string) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.insetInlineStart = '0'
  frame.style.top = '0'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  frame.style.width = '1123px'
  frame.style.height = '794px'
  frame.style.border = '0'
  document.body.appendChild(frame)
  const win = frame.contentWindow
  const doc = frame.contentDocument
  if (!win || !doc) {
    frame.remove()
    return
  }
  let started = false
  const run = () => {
    if (started) return
    started = true
    win.focus()
    win.print()
  }
  win.addEventListener('afterprint', () => frame.remove(), { once: true })
  doc.open()
  doc.write(html)
  doc.close()
  await Promise.all([
    ...[...doc.images].map((img) => img.decode().catch(() => undefined)),
    doc.fonts.load(`400 16px Vazirmatn`, FONT_SAMPLE),
    doc.fonts.load(`700 16px Vazirmatn`, FONT_SAMPLE),
    doc.fonts.load(`800 16px Vazirmatn`, FONT_SAMPLE),
    doc.fonts.ready,
  ]).catch(() => undefined)
  run()
  window.setTimeout(() => {
    if (frame.isConnected) frame.remove()
  }, 60_000)
}
