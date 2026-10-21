/** برچسب فارسی همان چیزی است که در متن نامه درج می‌شود؛ کلید انگلیسی برای قالب‌های قبلی است. */
export const inquiryLetterVariables = [
  { key: 'fullName', token: 'نام و نام خانوادگی' },
  { key: 'nationalId', token: 'کد ملی' },
  { key: 'identityCertificateNo', token: 'شماره شناسنامه' },
  { key: 'phone', token: 'تلفن' },
  { key: 'address', token: 'آدرس تکمیلی' },
  { key: 'unitTitle', token: 'عنوان واحد صنفی' },
  { key: 'jobGroup', token: 'گروه شغلی' },
  { key: 'jobTitle', token: 'شغل' },
] as const

export const inquiryLetterVariableKeys = new Map<string, string>(
  inquiryLetterVariables.map((item) => [item.token, item.key]),
)

export const inquiryLetterBlank = '...........'
