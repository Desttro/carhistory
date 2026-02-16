import { reportActions } from '~/features/reports/server/reportActions'

import { analyticsActions } from './actions/analyticsActions'
import { pushNotificationActions } from './actions/pushNotificationActions'
import { userActions } from './actions/userActions'

export const createServerActions = () => {
  return {
    analyticsActions,
    pushNotificationActions,
    userActions,
    reportActions,
  }
}

export type ServerActions = ReturnType<typeof createServerActions>
