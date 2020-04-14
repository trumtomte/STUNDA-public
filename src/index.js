import React from 'react'
import { compose, applyMiddleware, createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import * as reducers from './ducks'
import { AppNavigatorWithState } from './Components'
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers'

// Follow https://github.com/facebook/react-native/issues/12981)
// Hides the timer warning for android
console.ignoredYellowBox = ['Setting a timer']

const rootReducer = combineReducers(reducers)

const navMiddleware = createReactNavigationReduxMiddleware(
    'root',
    state => state.nav
)

const store = createStore(
    rootReducer,
    undefined,
    compose(applyMiddleware(navMiddleware, thunk))
    // compose(applyMiddleware(navMiddleware, thunk, createLogger()))
)

const App = () => (
    <Provider store={store}>
        <AppNavigatorWithState />
    </Provider>
)

export default App
