import { userCreditsByUserId } from '~/data/queries/userCredits'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery } from '~/zero/client'

export function useCredits() {
  const auth = useAuth()
  const userId = auth.user?.id || ''

  const [credits, status] = useQuery(
    userCreditsByUserId,
    { userId },
    { enabled: !!userId }
  )

  return {
    balance: credits?.balance ?? 0,
    isLoading: status.type === 'unknown',
    error: null,
  }
}
