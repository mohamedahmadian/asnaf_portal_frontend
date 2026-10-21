import { useEffect } from 'react'

let currentEditTo: string | null = null

export function peekDetailEditTo() {
  return currentEditTo
}

/** صفحهٔ جزئیات مسیر ویرایش را ثبت می‌کند تا دابل‌کلیک کارت همان‌جا برود */
export function useRegisterDetailEditTo(editTo: string) {
  useEffect(() => {
    currentEditTo = editTo
    return () => {
      if (currentEditTo === editTo) currentEditTo = null
    }
  }, [editTo])
}
