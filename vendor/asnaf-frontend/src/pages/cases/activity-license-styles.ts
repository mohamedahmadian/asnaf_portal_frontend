/** Shared visual rules for the issued activity license in admin and portal. */
export const activityLicenseSheetCss = `
.license-doc{display:flex;flex-direction:column;gap:1rem}
.license-doc__actions{display:flex;flex-wrap:wrap;gap:.5rem}
.license-doc__btn{display:inline-flex;cursor:pointer;align-items:center;justify-content:center;gap:.25rem;border-radius:.5rem;padding:.25rem .5rem;font-size:11px;font-weight:500;line-height:1;border:1px solid transparent}
.license-doc__btn:disabled{cursor:not-allowed;opacity:.6}
.license-doc__btn svg{width:.75rem;height:.75rem;flex:none}
.license-doc__btn--print{background:#2ebdb6;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.license-doc__btn--print:hover:not(:disabled){background:#1aa8a2}
.license-doc__btn--download{border-color:#5ed4ce;background:#fff;color:#4b4741;box-shadow:0 4px 12px rgba(46,189,182,.16)}
.license-doc__btn--download:hover:not(:disabled){background:#eefaf9}
.license-sheet{margin-inline:auto;display:flex;min-height:640px;width:100%;max-width:56rem;overflow:hidden;border-radius:1rem;border:1px solid #d5deea;background:#fff;box-shadow:0 12px 32px rgba(20,40,70,.08);color:#14222b;font-family:Vazirmatn,Vazir,Tahoma,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.license-sheet__band{display:flex;width:10rem;flex:none;flex-direction:column;align-items:center;gap:.75rem;background:#14356e;padding:1.25rem 1rem;text-align:center;color:#fff}
.license-sheet__photo{width:5.75rem;height:7rem;flex:none;overflow:hidden;border-radius:.5rem;border:2px solid rgba(255,255,255,.85);background:#fff}
.license-sheet__photo img{display:block;width:100%;height:100%;max-width:none;object-fit:cover}
.license-sheet__brand{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:.75rem}
.license-sheet__mark{width:4rem;height:4rem;flex:none}
.license-sheet__org{font-size:.875rem;font-weight:700;line-height:1.75rem}
.license-sheet__org-en{font-size:11px;line-height:1.25rem;color:rgba(255,255,255,.8);direction:ltr}
.license-sheet__title{margin-top:.5rem;font-size:1rem;font-weight:800;line-height:1.75rem}
.license-sheet__title-en{font-size:.75rem;color:rgba(255,255,255,.9);direction:ltr}
.license-sheet__body{display:flex;min-width:0;flex:1;flex-direction:column;padding:1.25rem 1.5rem}
.license-sheet__row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;border-bottom:1px solid #e6edf4;padding:.5rem 0}
.license-sheet__row--group{display:grid;gap:1rem}
.license-sheet__cell{min-width:0}
.license-sheet__label{font-size:11px;color:#5d7284}
.license-sheet__value{font-size:.875rem;font-weight:700;line-height:1.75rem;color:#2c2a26}
.license-sheet__en{direction:ltr;text-align:left}
.license-sheet__en-line{margin-top:.15rem;font-size:11px;color:#5d7284;direction:ltr;text-align:left}
.license-sheet__foot{display:flex;margin-top:auto;justify-content:flex-end;padding-top:1.25rem}
.license-sheet__stamp{display:flex;flex-direction:column;align-items:center;min-width:8rem;text-align:center}
.license-sheet__stamp img{display:block;max-height:4.5rem;max-width:9rem;margin:0 auto .2rem;object-fit:contain}
.license-sheet__signer{width:100%;font-size:.8rem;font-weight:700;line-height:1.6;color:#2c2a26;text-align:center}
.license-sheet__role{width:100%;font-size:.75rem;line-height:1.6;color:#5d7284;text-align:center}
.license-sheet--page{box-sizing:border-box;width:297mm;height:210mm;max-width:none;min-height:0;margin:0;border:0;border-radius:0;box-shadow:none;overflow:hidden}
.license-sheet--page .license-sheet__body{min-height:0;padding:1.1rem 1.6rem 0.9rem}
.license-sheet--page .license-sheet__row{flex:1 1 0;align-content:center;min-height:0;padding:.45rem 0}
.license-sheet--page .license-sheet__foot{flex:none;margin-top:0;padding-top:0.9rem}
@media print{
  .license-doc__actions{display:none}
  .license-sheet{max-width:none;min-height:0;width:100%;height:100%;margin:0;border-radius:0;border:0;box-shadow:none}
  .license-sheet__body{min-height:0;padding:1.1rem 1.6rem 0.9rem}
  .license-sheet__row{flex:1 1 0;align-content:center;min-height:0;padding:.45rem 0}
  .license-sheet__foot{flex:none;margin-top:0;padding-top:0.9rem}
}
`
