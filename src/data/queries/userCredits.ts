import { serverWhere, zql } from 'on-zero'

const permission = serverWhere('userCredits', (row, auth) => {
  return row.cmp('userId', auth?.id || '')
})

export const userCreditsByUserId = (props: { userId: string }) => {
  return zql.userCredits.where(permission).where('userId', props.userId).one()
}
