import { Download, Printer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityLicenseSheet } from './ActivityLicenseSheet'
import {
  activityLicenseHtml,
  buildLicenseView,
  downloadActivityLicense,
  licenseCopy,
  printActivityLicense,
  type ActivityLicense,
} from './activity-license'
import { activityLicenseSheetCss } from './activity-license-styles'

export function IssuedActivityLicense({
  license,
  photoUrl,
  signatureUrl,
  loadPrintPhoto,
  loadPrintSignature,
  onError,
}: {
  license: ActivityLicense
  photoUrl: string | null
  signatureUrl: string | null
  loadPrintPhoto: () => Promise<string | null>
  loadPrintSignature: () => Promise<string | null>
  onError: (error: unknown) => void
}) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState<'print' | 'download' | null>(null)
  const view = buildLicenseView(license, licenseCopy(t), photoUrl, signatureUrl)

  async function output(action: 'print' | 'download') {
    setBusy(action)
    try {
      const [printPhoto, printSignature] = await Promise.all([loadPrintPhoto(), loadPrintSignature()])
      const printView = buildLicenseView(license, licenseCopy(t), printPhoto, printSignature)
      if (action === 'print') await printActivityLicense(await activityLicenseHtml(printView))
      else await downloadActivityLicense(license.licenseNumber, printView)
    } catch (error) {
      onError(error)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="license-doc">
      <style>{activityLicenseSheetCss}</style>
      <div className="license-doc__actions">
        <button
          type="button"
          className="license-doc__btn license-doc__btn--print"
          disabled={busy != null}
          onClick={() => void output('print')}
        >
          <Printer aria-hidden />
          {t('cases.licensePrint')}
        </button>
        <button
          type="button"
          className="license-doc__btn license-doc__btn--download"
          disabled={busy != null}
          onClick={() => void output('download')}
        >
          <Download aria-hidden />
          {t('cases.licenseDownload')}
        </button>
      </div>
      <ActivityLicenseSheet view={view} />
    </div>
  )
}
