export const AUCTION_APPROVER_KINDS = ['SPECIAL_INSPECTOR', 'AUCTION_COMMITTEE', 'COMMERCIAL_MANAGER'] as const

export type AuctionApproverKind = (typeof AUCTION_APPROVER_KINDS)[number]

export type AuctionApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AuctionRequest = {
  id: string
  caseId: string
  number: string
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  editable: boolean
  canIssue: boolean
  phase: number
  intakeSubmittedAt?: string | null
  awaitingIntake?: boolean
  title: string | null
  startsAt: string
  endsAt: string
  discountMin: number
  discountMax: number
  items: {
    id: string
    name: string
    price: number
    discountPercent: number
    priceAfterDiscount: number
  }[]
  approvals: {
    id: string
    kind: AuctionApproverKind
    label: string | null
    status: AuctionApprovalStatus
    note: string | null
    decidedAt: string | null
    decidedBy: { id: string; fullName: string } | null
    people: { id: string; fullName: string }[]
    canDecide: boolean
  }[]
}

export const AUCTION_WIZARD_STEPS = ['request', 'management', 'issue'] as const

export type AuctionWizardStep = (typeof AUCTION_WIZARD_STEPS)[number]

export function auctionWizardReached(
  item: Pick<AuctionRequest, 'status' | 'phase'> & { awaitingIntake?: boolean } | null | undefined,
) {
  if (!item) return 0
  if (item.status === 'REJECTED' || item.status === 'CANCELLED') return 1
  if (item.status === 'ISSUED' || item.status === 'COMPLETED') return 2
  if (item.awaitingIntake || item.phase < 1) return 0
  return Math.min(Math.max(item.phase, 1), 2)
}

export function auctionWizardFinished(item: Pick<AuctionRequest, 'status'> | null | undefined) {
  return item?.status === 'ISSUED' || item?.status === 'COMPLETED'
}

export function priceAfterDiscount(price: number, percent: number) {
  if (!Number.isFinite(price) || !Number.isFinite(percent)) return null
  const hundredths = Math.round(percent * 100)
  if (hundredths < 0 || hundredths > 10000) return null
  return Math.round((price * (10000 - hundredths)) / 10000)
}
