import { serverWhere, zql } from 'on-zero'

const permission = serverWhere('vehicleReport', (row, auth) => {
  return row.cmp('userId', auth?.id || '')
})

export const vehicleReportById = (props: { reportId: string }) => {
  return zql.vehicleReport
    .where(permission)
    .where('id', props.reportId)
    .one()
    .related('vehicle', (q) => q.one())
}

export const vehicleReportsByUserId = (props: { userId: string; limit?: number }) => {
  // permission already enforces userId, but we pass it for Zero's row-level sync
  return zql.vehicleReport
    .where(permission)
    .orderBy('purchasedAt', 'desc')
    .limit(props.limit || 50)
    .related('vehicle', (q) => q.one())
}

export const vehicleReportsPaginated = (props: {
  userId?: string
  pageSize: number
  cursor?: { id: string; purchasedAt: number } | null
}) => {
  // permission already enforces userId - userId param kept for Zero sync enablement
  let query = zql.vehicleReport
    .where(permission)
    .orderBy('purchasedAt', 'desc')
    .orderBy('id', 'desc')
    .limit(props.pageSize)
    .related('vehicle', (q) => q.one())

  if (props.cursor) {
    query = query.start(props.cursor)
  }

  return query
}
