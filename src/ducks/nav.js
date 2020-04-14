import { NavigationActions } from 'react-navigation'
import { REQUEST_LOGOUT } from './user'
import { AppNavigator } from '../Components/AppNavigatorWithState'

const initialState = AppNavigator.router.getStateForAction(
    AppNavigator.router.getActionForPathAndParams('LoginScreen')
)

// Reducer
// =======
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case REQUEST_LOGOUT:
            return AppNavigator.router.getStateForAction(
                NavigationActions.navigate({ routeName: 'LoginScreen' }) 
            )
        default:
            const newState = AppNavigator.router.getStateForAction(action, state)
            return newState || state
    }
}
