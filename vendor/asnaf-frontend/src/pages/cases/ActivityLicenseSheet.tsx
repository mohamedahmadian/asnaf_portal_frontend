import type { LicenseField, LicenseRow, LicenseView } from './activity-license'

function LicensePhoto({ src }: { src: string }) {
  return (
    <div className="license-sheet__photo">
      <img src={src} alt="" />
    </div>
  )
}

function PairField({ field }: { field: LicenseField }) {
  return (
    <>
      <div>
        <div className="license-sheet__label">{field.fa}</div>
        <div className="license-sheet__value">{field.faValue}</div>
      </div>
      <div className="license-sheet__en">
        <div className="license-sheet__label">{field.en}</div>
        <div className="license-sheet__value">{field.enValue}</div>
      </div>
    </>
  )
}

function GroupCell({ field }: { field: LicenseField }) {
  return (
    <div className="license-sheet__cell">
      <div className="license-sheet__label">{field.fa}</div>
      <div className="license-sheet__value">{field.faValue}</div>
      <div className="license-sheet__en-line">
        {field.en}: {field.enValue}
      </div>
    </div>
  )
}

function LicenseRowView({ row }: { row: LicenseRow }) {
  if (row.fields.length === 1) {
    return (
      <div className="license-sheet__row">
        <PairField field={row.fields[0]} />
      </div>
    )
  }
  return (
    <div
      className="license-sheet__row license-sheet__row--group"
      style={{ gridTemplateColumns: `repeat(${row.fields.length}, minmax(0, 1fr))` }}
    >
      {row.fields.map((field) => (
        <GroupCell key={field.en} field={field} />
      ))}
    </div>
  )
}

export function ActivityLicenseSheet({ view }: { view: LicenseView }) {
  return (
    <article className="license-sheet">
      <aside className="license-sheet__band">
        {view.photoUrl ? <LicensePhoto src={view.photoUrl} /> : null}
        <div className="license-sheet__brand">
          <svg viewBox="0 0 72 72" className="license-sheet__mark" aria-hidden>
            <circle cx="36" cy="28" r="10" fill="#f0c14d" />
            <path d="M8 46c8-8 14-8 22 0s14 8 22 0 14-8 12 0" fill="none" stroke="#7ec8e3" strokeWidth="3" />
            <path d="M8 54c8-8 14-8 22 0s14 8 22 0 14-8 12 0" fill="none" stroke="#fff" strokeWidth="3" />
          </svg>
          <div className="license-sheet__org">{view.org}</div>
          <div className="license-sheet__org-en">{view.orgEn}</div>
          <div className="license-sheet__title">{view.title}</div>
          <div className="license-sheet__title-en">{view.titleEn}</div>
        </div>
      </aside>
      <div className="license-sheet__body">
        {view.rows.map((item) => (
          <LicenseRowView key={item.id} row={item} />
        ))}
        {view.signatureUrl || view.signerName || view.signerTitle ? (
          <div className="license-sheet__foot">
            <div className="license-sheet__stamp">
              {view.signatureUrl ? <img src={view.signatureUrl} alt="" /> : null}
              {view.signerName ? <div className="license-sheet__signer">{view.signerName}</div> : null}
              {view.signerTitle ? <div className="license-sheet__role">{view.signerTitle}</div> : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}
