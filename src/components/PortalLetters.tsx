import { Download, Printer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../frontend/src/components/ui/Form'
import { confirmToast } from '../../../frontend/src/components/ui/confirmToast'
import {
  downloadInquiryLetter,
  downloadInquiryLetters,
  inquiryLetterFilename,
  printInquiryLetter,
  printInquiryLetters,
} from '../../../frontend/src/pages/cases/inquiry-letter-print'
import type { CaseInquiryLetter } from '../../../frontend/src/pages/cases/inquiry-types'
import { getApiErrorMessage, portalApi } from '../lib/api'

const letterButtonClassName =
  '!h-auto !min-h-0 !min-w-0 !gap-1 !rounded-lg !px-2 !py-1 !text-[11px] !leading-4 disabled:opacity-60 [&_svg]:!size-3'

async function loadLetter(url: string) {
  return (await portalApi.get<CaseInquiryLetter>(url)).data
}

async function loadLetters(urls: string[]) {
  const letters: CaseInquiryLetter[] = []
  for (const url of urls) {
    letters.push(await loadLetter(url))
  }
  return letters
}

export function PortalLetterButtons({ letterUrl }: { letterUrl: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const [busy, setBusy] = useState<'print' | 'download' | null>(null)

  async function run(action: 'print' | 'download') {
    if (busy) return
    setBusy(action)
    try {
      const letter = await loadLetter(letterUrl)
      if (action === 'print') await printInquiryLetter(letter, locale, 'A4', t)
      else await downloadInquiryLetter(inquiryLetterFilename(letter.centerName), letter, locale, 'A4', t)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.letterFailed')))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button type="button" variant="ghost" className={letterButtonClassName} disabled={busy != null} onClick={() => void run('download')}>
        <Download aria-hidden />
        {t('cases.inquiryDownload')}
      </Button>
      <Button type="button" variant="ghost" className={letterButtonClassName} disabled={busy != null} onClick={() => void run('print')}>
        <Printer aria-hidden />
        {t('cases.inquiryPrint')}
      </Button>
    </div>
  )
}

export function PortalLettersToolbar({ letterUrls }: { letterUrls: string[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const [busy, setBusy] = useState<'print' | 'download' | null>(null)

  async function printAll() {
    if (busy || letterUrls.length === 0) return
    setBusy('print')
    try {
      await printInquiryLetters(await loadLetters(letterUrls), locale, 'A4', t)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.letterFailed')))
    } finally {
      setBusy(null)
    }
  }

  async function downloadAll() {
    if (busy || letterUrls.length === 0) return
    setBusy('download')
    try {
      await downloadInquiryLetters(await loadLetters(letterUrls), locale, 'A4', t)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.letterFailed')))
    } finally {
      setBusy(null)
    }
  }

  if (letterUrls.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap justify-end gap-1.5">
      <Button
        type="button"
        variant="ghost"
        className={`whitespace-nowrap ${letterButtonClassName}`}
        disabled={busy != null}
        onClick={() => {
          confirmToast({
            title: t('cases.inquiriesDownloadAllConfirm'),
            confirmLabel: t('cases.inquiriesDownloadAll'),
            cancelLabel: t('common.cancel'),
            onConfirm: () => void downloadAll(),
          })
        }}
      >
        <Download aria-hidden />
        {t('cases.inquiriesDownloadAll')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={`whitespace-nowrap ${letterButtonClassName}`}
        disabled={busy != null}
        onClick={() => void printAll()}
      >
        <Printer aria-hidden />
        {t('cases.inquiriesPrintAll')}
      </Button>
    </div>
  )
}
