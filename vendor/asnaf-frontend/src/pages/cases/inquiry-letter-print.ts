import face400 from '@fontsource/vazirmatn/400.css?raw'
import face700 from '@fontsource/vazirmatn/700.css?raw'
import arabic400 from '@fontsource/vazirmatn/files/vazirmatn-arabic-400-normal.woff2?url'
import latin400 from '@fontsource/vazirmatn/files/vazirmatn-latin-400-normal.woff2?url'
import latinExt400 from '@fontsource/vazirmatn/files/vazirmatn-latin-ext-400-normal.woff2?url'
import arabic700 from '@fontsource/vazirmatn/files/vazirmatn-arabic-700-normal.woff2?url'
import latin700 from '@fontsource/vazirmatn/files/vazirmatn-latin-700-normal.woff2?url'
import latinExt700 from '@fontsource/vazirmatn/files/vazirmatn-latin-ext-700-normal.woff2?url'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { formatDate, localizeDigits, toLatinDigits } from '../../lib/datetime'
import type { CaseInquiryLetter } from './inquiry-types'
import { inquiryLetterBlank, inquiryLetterVariableKeys } from './inquiry-letter-variables'

export type LetterText = (key: string) => string

const LETTER_TEXT: Record<string, string> = {
  'cases.letterheadAddress': 'آدرس',
  'cases.letterheadPhone': 'تلفن',
  'cases.letterheadWebsite': 'وب‌سایت',
  'cases.letterIssuedAt': 'تاریخ صدور',
  'cases.letterNo': 'شماره نامه',
  'cases.inquiriesDownloadAllFile': 'نامه‌های-استعلام.zip',
}

function letterText(key: string, t?: LetterText) {
  const value = t?.(key)?.trim()
  return value || LETTER_TEXT[key] || key
}

function letterTokenValue(token: string, fields: Record<string, string>) {
  const key = Object.prototype.hasOwnProperty.call(fields, token) ? token : inquiryLetterVariableKeys.get(token)
  if (!key) return ''
  return (fields[key] ?? '').trim()
}

export function fillInquiryLetter(template: string, fields: Record<string, string>) {
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, raw: string) => letterTokenValue(raw.trim(), fields) || inquiryLetterBlank)
}

export function fillInquiryLetterHtml(template: string, fields: Record<string, string>) {
  return template.split(/(\{\{\s*[^{}]+?\s*\}\})/g).map((part) => {
    const match = /^\{\{\s*([^{}]+?)\s*\}\}$/.exec(part)
    if (!match) return escapeHtml(part)
    return `<b>${escapeHtml(letterTokenValue(match[1].trim(), fields) || inquiryLetterBlank)}</b>`
  }).join('')
}

export function presentInquiryLetter(letter: CaseInquiryLetter, locale: string) {
  const fields = {
    ...letter.fields,
    date: letter.fields.date ? formatDate(letter.fields.date, locale) : '',
    letterNo: localizeDigits(letter.letterNo || letter.fields.letterNo || '', locale),
    nationalId: localizeDigits(letter.fields.nationalId ?? '', locale),
    identityCertificateNo: localizeDigits(letter.fields.identityCertificateNo ?? '', locale),
    trackingCode: localizeDigits(letter.fields.trackingCode ?? '', locale),
    phone: localizeDigits(letter.fields.phone ?? '', locale),
  }
  return {
    title: fillInquiryLetter(letter.letterTitle, fields),
    body: fillInquiryLetter(letter.letterBody, fields),
    bodyHtml: fillInquiryLetterHtml(letter.letterBody, fields),
  }
}

export type LetterPaper = 'A4' | 'A5'

const LETTER_PAGES: Record<LetterPaper, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
}

const LETTER_DESIGN = { w: 210, h: 296 }

function paperSpec(paper: LetterPaper) {
  const page = LETTER_PAGES[paper]
  const scale = Math.min(page.w / LETTER_DESIGN.w, page.h / LETTER_DESIGN.h)
  return { ...page, scale }
}

export function inquiryLetterFilename(centerName: string) {
  const safe = centerName.replace(/[\\/:*?"<>|]/g, ' ').trim() || 'letter'
  return `${safe}.png`
}

const LETTER_FONT = 'Vazirmatn, ui-sans-serif, system-ui, sans-serif'

const FONT_FILES: Record<string, string> = {
  'vazirmatn-arabic-400-normal.woff2': arabic400,
  'vazirmatn-latin-400-normal.woff2': latin400,
  'vazirmatn-latin-ext-400-normal.woff2': latinExt400,
  'vazirmatn-arabic-700-normal.woff2': arabic700,
  'vazirmatn-latin-700-normal.woff2': latin700,
  'vazirmatn-latin-ext-700-normal.woff2': latinExt700,
}

function letterFontFaceCss() {
  const origin = typeof window === 'undefined' ? '' : window.location.href
  return `${face400}\n${face700}`
    .replace(/font-display:\s*swap/g, 'font-display: block')
    .replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '')
    .replace(/url\(\.\/files\/([^)]+)\)/g, (full, name: string) => {
      const file = FONT_FILES[name]
      if (!file || !origin) return full
      return `url("${new URL(file, origin).href}")`
    })
}

const LETTER_STYLE = `
.inquiry-letter-page{box-sizing:border-box;background:#fff}
.inquiry-letter{box-sizing:border-box;width:210mm;min-height:296mm;padding:16mm 16mm 14mm;color:#1c2b2b;background:#fff;font-family:${LETTER_FONT};line-height:2;display:flex;flex-direction:column}
.inquiry-letter__head,.inquiry-letter__title,.inquiry-letter__body,.inquiry-letter__sign,.inquiry-letter__foot{flex:0 0 auto}
.inquiry-letter__head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding-bottom:4px;border-bottom:3px solid #2ebdb6}
.inquiry-letter__brand{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}
.inquiry-letter__logo{display:block;max-height:72px;max-width:140px;object-fit:contain}
.inquiry-letter__org{margin:0;font-weight:700;font-size:15px;line-height:1.35}
.inquiry-letter__meta{display:flex;flex-direction:column;align-items:flex-start;flex:none;gap:2px;font-size:13px;line-height:1.45;text-align:start}
.inquiry-letter__meta b{font-weight:700}
.inquiry-letter__title{margin:22px 0 12px;text-align:center;font-size:16px;font-weight:700}
.inquiry-letter__body{white-space:pre-wrap;font-size:14px}
.inquiry-letter__body b{font-weight:700}
.inquiry-letter__sign{margin-top:48px;margin-inline-start:auto;min-width:140px;text-align:center}
.inquiry-letter__sign img{display:block;max-height:96px;max-width:180px;margin:0 auto 4px;object-fit:contain}
.inquiry-letter__signer{font-size:13px;font-weight:700;line-height:1.7}
.inquiry-letter__role{font-size:12px;line-height:1.7;color:#3d4f4f}
.inquiry-letter__foot{margin-top:auto;padding-top:10px;border-top:2px solid #2ebdb6;display:flex;align-items:flex-end;gap:12px}
.inquiry-letter__contact{width:66.666%;flex:none;font-size:12px;line-height:1.8}
.inquiry-letter__qr{width:33.333%;flex:none;margin:0;display:flex;justify-content:flex-end;align-items:flex-end}
.inquiry-letter__qr svg{display:block;width:88px;height:88px}
@media print{
  .inquiry-letter-page,.inquiry-letter{box-shadow:none;border-radius:0}
}
`

async function letterQrSvg(value: string) {
  const text = toLatinDigits(value).trim()
  if (!text) return ''
  const svg = await QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#1c2b2b', light: '#ffffff' },
  })
  return svg.replace(/^\s*<\?xml[^>]*>\s*/i, '')
}

export async function inquiryLetterFragment(
  letter: CaseInquiryLetter,
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  const filled = presentInquiryLetter(letter, locale)
  const head = letter.letterhead
  const logo = safeDataImage(head?.logoDataUrl)
  const signature = safeDataImage(head?.signatureDataUrl)
  const letterNo = localizeDigits(letter.letterNo || '', locale)
  const phone = head?.phone ? localizeDigits(head.phone, locale) : ''
  const qr = await letterQrSvg(letter.letterNo || '')
  const contact = [
    head?.address
      ? `${escapeHtml(letterText('cases.letterheadAddress', t))}: ${escapeHtml(localizeDigits(head.address, locale))}`
      : '',
    phone ? `${escapeHtml(letterText('cases.letterheadPhone', t))}: <b dir="ltr">${escapeHtml(phone)}</b>` : '',
    head?.website ? `${escapeHtml(letterText('cases.letterheadWebsite', t))}: <b dir="ltr">${escapeHtml(head.website)}</b>` : '',
  ].filter(Boolean)
  const showSign = Boolean(signature || head?.signerName || head?.signerTitle)
  const shownDate = letter.issuedAt ? formatDate(letter.issuedAt, locale) : ''

  const spec = paperSpec(paper)
  const zoom = spec.scale === 1 ? '' : `zoom:${spec.scale.toFixed(6)};`
  const fittedH = (LETTER_DESIGN.h * spec.scale).toFixed(2)
  return `<style>${letterFontFaceCss()}${LETTER_STYLE}</style><div class="inquiry-letter-page" style="width:${spec.w}mm;min-height:${fittedH}mm"><article class="inquiry-letter" style="${zoom}" dir="rtl" lang="fa">
<header class="inquiry-letter__head">
  <div class="inquiry-letter__brand">
    ${logo ? `<img class="inquiry-letter__logo" src="${logo}" alt="" />` : ''}
    ${head?.organizationName ? `<div class="inquiry-letter__org">${escapeHtml(head.organizationName)}</div>` : ''}
  </div>
  <div class="inquiry-letter__meta">
    <div>${escapeHtml(letterText('cases.letterIssuedAt', t))}: <b dir="ltr">${escapeHtml(shownDate)}</b></div>
    <div>${escapeHtml(letterText('cases.letterNo', t))}: <b dir="ltr">${escapeHtml(letterNo)}</b></div>
  </div>
</header>
<h1 class="inquiry-letter__title">${escapeHtml(filled.title)}</h1>
<div class="inquiry-letter__body">${filled.bodyHtml}</div>
${showSign ? `<div class="inquiry-letter__sign">
  ${signature ? `<img src="${signature}" alt="" />` : ''}
  ${head?.signerName ? `<div class="inquiry-letter__signer">${escapeHtml(head.signerName)}</div>` : ''}
  ${head?.signerTitle ? `<div class="inquiry-letter__role">${escapeHtml(head.signerTitle)}</div>` : ''}
</div>` : ''}
<footer class="inquiry-letter__foot">
  <div class="inquiry-letter__contact">${contact.join('<br/>')}</div>
  <figure class="inquiry-letter__qr">${qr}</figure>
</footer>
</article></div>`
}

export async function inquiryLetterHtml(
  letter: CaseInquiryLetter,
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  const filled = presentInquiryLetter(letter, locale)
  const fragment = await inquiryLetterFragment(letter, locale, paper, t)
  const spec = paperSpec(paper)
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(filled.title)}</title><style>@page{size:${spec.w}mm ${spec.h}mm;margin:0}html,body{margin:0;padding:0;width:${spec.w}mm;background:#fff;font-family:${LETTER_FONT}}</style></head><body>${fragment}</body></html>`
}

async function inquiryLetterPng(
  letter: CaseInquiryLetter,
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.position = 'fixed'
  host.style.insetInlineStart = '-10000px'
  host.style.top = '0'
  const spec = paperSpec(paper)
  host.style.width = `${spec.w}mm`
  host.style.background = '#fff'
  host.innerHTML = await inquiryLetterFragment(letter, locale, paper, t)
  document.body.appendChild(host)
  try {
    const sheet = host.querySelector('.inquiry-letter-page')
    if (!(sheet instanceof HTMLElement)) return null
    const sample = 'سلام وزیر ABC 0123'
    await Promise.all([
      ...[...host.querySelectorAll('img')].map((img) => img.decode().catch(() => undefined)),
      document.fonts.load('400 16px Vazirmatn', sample),
      document.fonts.load('700 16px Vazirmatn', sample),
      document.fonts.ready,
    ])
    return await toPng(sheet, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })
  } finally {
    host.remove()
  }
}

function clickDownload(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
}

export async function downloadInquiryLetter(
  filename: string,
  letter: CaseInquiryLetter,
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  const dataUrl = await inquiryLetterPng(letter, locale, paper, t)
  if (!dataUrl) return
  clickDownload(dataUrl, filename.endsWith('.png') ? filename : `${filename}.png`)
}

function uniqueLetterFilename(centerName: string, used: Set<string>) {
  const base = inquiryLetterFilename(centerName).replace(/\.png$/i, '') || 'letter'
  let name = `${base}.png`
  let index = 2
  while (used.has(name)) {
    name = `${base}-${index}.png`
    index += 1
  }
  used.add(name)
  return name
}

export async function downloadInquiryLetters(
  letters: CaseInquiryLetter[],
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  if (letters.length === 0) return
  if (letters.length === 1) {
    await downloadInquiryLetter(inquiryLetterFilename(letters[0].centerName), letters[0], locale, paper, t)
    return
  }
  const used = new Set<string>()
  const files: { name: string; data: Uint8Array }[] = []
  for (const letter of letters) {
    const dataUrl = await inquiryLetterPng(letter, locale, paper, t)
    if (!dataUrl) continue
    files.push({
      name: uniqueLetterFilename(letter.centerName, used),
      data: dataUrlToBytes(dataUrl),
    })
  }
  if (files.length === 0) return
  if (files.length === 1) {
    clickDownload(uint8ToDataUrl(files[0].data, 'image/png'), files[0].name)
    return
  }
  const zip = buildStoreZip(files)
  const href = URL.createObjectURL(zip)
  try {
    clickDownload(href, letterText('cases.inquiriesDownloadAllFile', t))
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(href), 60_000)
  }
}

async function printLetterDocument(html: string, paper: LetterPaper) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  const spec = paperSpec(paper)
  frame.style.position = 'fixed'
  frame.style.insetInlineStart = '0'
  frame.style.top = '0'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  frame.style.width = `${Math.round((spec.w / 25.4) * 96)}px`
  frame.style.height = `${Math.round((spec.h / 25.4) * 96)}px`
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
  const sample = 'سلام وزیر ABC 0123'
  await Promise.all([
    doc.fonts.load(`400 16px Vazirmatn`, sample),
    doc.fonts.load(`700 16px Vazirmatn`, sample),
    doc.fonts.ready,
  ]).catch(() => undefined)
  run()
  window.setTimeout(() => {
    if (frame.isConnected) frame.remove()
  }, 60_000)
}

export async function printInquiryLetter(
  letter: CaseInquiryLetter,
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  await printLetterDocument(await inquiryLetterHtml(letter, locale, paper, t), paper)
}

export async function printInquiryLetters(
  letters: CaseInquiryLetter[],
  locale: string,
  paper: LetterPaper = 'A4',
  t?: LetterText,
) {
  if (letters.length === 0) return
  if (letters.length === 1) {
    await printInquiryLetter(letters[0], locale, paper, t)
    return
  }
  const fragments = await Promise.all(letters.map((letter) => inquiryLetterFragment(letter, locale, paper, t)))
  const spec = paperSpec(paper)
  const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title></title><style>@page{size:${spec.w}mm ${spec.h}mm;margin:0}html,body{margin:0;padding:0;width:${spec.w}mm;background:#fff;font-family:${LETTER_FONT}}.inquiry-letter-page{break-after:page;page-break-after:always}.inquiry-letter-page:last-child{break-after:auto;page-break-after:auto}</style></head><body>${fragments.join('')}</body></html>`
  await printLetterDocument(html, paper)
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function uint8ToDataUrl(data: Uint8Array, mime: string) {
  let binary = ''
  for (let i = 0; i < data.length; i += 1) binary += String.fromCharCode(data[i])
  return `data:${mime};base64,${btoa(binary)}`
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let crc = i
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    table[i] = crc
  }
  return table
})()

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function zipU16(value: number) {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, true)
  return bytes
}

function zipU32(value: number) {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value, true)
  return bytes
}

function zipConcat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function buildStoreZip(files: { name: string; data: Uint8Array }[]) {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = encoder.encode(file.name)
    const crc = crc32(file.data)
    const local = zipConcat([
      zipU32(0x04034b50),
      zipU16(20),
      zipU16(0x0800),
      zipU16(0),
      zipU16(0),
      zipU16(0),
      zipU32(crc),
      zipU32(file.data.length),
      zipU32(file.data.length),
      zipU16(name.length),
      zipU16(0),
      name,
      file.data,
    ])
    locals.push(local)
    centrals.push(
      zipConcat([
        zipU32(0x02014b50),
        zipU16(20),
        zipU16(20),
        zipU16(0x0800),
        zipU16(0),
        zipU16(0),
        zipU16(0),
        zipU32(crc),
        zipU32(file.data.length),
        zipU32(file.data.length),
        zipU16(name.length),
        zipU16(0),
        zipU16(0),
        zipU16(0),
        zipU16(0),
        zipU32(0),
        zipU32(offset),
        name,
      ]),
    )
    offset += local.length
  }
  const centralDir = zipConcat(centrals)
  return new Blob(
    [
      zipConcat([
        ...locals,
        centralDir,
        zipConcat([
          zipU32(0x06054b50),
          zipU16(0),
          zipU16(0),
          zipU16(files.length),
          zipU16(files.length),
          zipU32(centralDir.length),
          zipU32(offset),
          zipU16(0),
        ]),
      ]),
    ],
    { type: 'application/zip' },
  )
}

function safeDataImage(value: string | null | undefined) {
  if (!value) return ''
  const compact = value.replace(/\s/g, '')
  if (!/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(compact)) return ''
  return compact
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
