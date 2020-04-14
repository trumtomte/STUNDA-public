// Dependencies
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers'
import { setEsmAvailability } from '../ducks/survey'
import {
    Platform,
    BackHandler,
    AppState,
    Alert,
    StatusBar,
    View,
    PushNotificationIOS
} from 'react-native'
import {
    StackNavigator,
    addNavigationHelpers,
    NavigationActions
} from 'react-navigation'
import {
    NOTIF_LABELS,
    resetBadgeCount,
    scheduleNotifications,
    addNotificationListener,
    removeNotificationListener,
    getNotificationDates,
    clearNotificationDate,
} from '../utils'

// Screens
// =======
import HomeScreen from './HomeScreen'
import LoginScreen from './LoginScreen'
import TermsScreen from './TermsScreen'
import SurveyScreen from './SurveyScreen'
import WebViewScreen from './WebViewScreen'
import SurveyDoneScreen from './SurveyDoneScreen'

// Router configuration
// ====================
export const AppNavigator = StackNavigator({
        LoginScreen: {
            screen: LoginScreen
        },
        TermsScreen: {
            screen: TermsScreen
        },
        HomeScreen: {
            screen: HomeScreen
        },
        WebViewScreen: {
            screen: WebViewScreen
        },
        SurveyScreen: {
            screen: SurveyScreen,
            path: 'survey/:type/:step/:steps'
        },
        SurveyDoneScreen: {
            screen: SurveyDoneScreen,
            path: 'completed/:success'
        }
    },
    {
        initialRouteName: 'LoginScreen'
    }
)

// Component
// =========
class AppNavigatorWrapper extends Component {
    state = {
        appState: AppState.currentState
    }

    constructor(props) {
        super(props)
        // Used to unsubscribe from event listeners on android
        this.subscription = null
        this.esmTimer = null
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppState)
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
        PushNotificationIOS.addEventListener('register', token => {})
        this.subscription = addNotificationListener(this.notificationHandler)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppState)
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
        PushNotificationIOS.removeEventListener('register', token => {})
        removeNotificationListener(
            Platform.OS === 'ios' ? this.notificationHandler : this.subscription
        )
    }

    handleAppOpened = async () => {
        if (!this.props.authenticated) {
            return
        }
        
        // Clear app notification badges when opened
        resetBadgeCount()

        // Try to reschedule new notifications
        if (this.props.notifications) {
            scheduleNotifications()
        }

        // Cached dates for scheduled notifications
        getNotificationDates(dates => {
            if (dates === null) {
                return
            }

            dates.filter(d => d.type === 'esm').forEach(date => {
                const now = new Date()
                const notifDate = new Date(date.date)

                // Prevents users from answering before the notification is received
                if (notifDate > now) {
                    return
                }

                const diff = Math.abs(notifDate - now)
                const minutes = Math.floor((diff / 1000) / 60)

                if (minutes < 20) {
                    const timeLeft = (20 - minutes) * (60 * 1000)

                    this.props.dispatch(setEsmAvailability(true))

                    // Will remove the current one if it exists, since it could
                    // be activated in the background on Android
                    clearTimeout(this.esmTimer)

                    this.esmTimer = setTimeout(() => {
                        this.props.dispatch(setEsmAvailability(false))
                        clearNotificationDate(date.date)
                    }, timeLeft)
                }
            })
        })
    }

    handleAppState = nextAppState => {
        // When the app goes into foreground
        if (this.state.appState.match(/unknown|inactive|background/) && nextAppState === 'active') {
            this.handleAppOpened()
        }

        // When app goes to background
        if (this.state.appState.match(/active|inactive/) && nextAppState === 'background') {
            this.props.dispatch(setEsmAvailability(false))
            // Clear any active timeout when app is closed
            clearTimeout(this.esmTimer)
            this.esmTimer = null
            // Clear badge upon exiting (if previous attempt failed)
            resetBadgeCount()
        }

        this.setState({ appState: nextAppState })
    }

    // Called when the app is in foreground
    notificationHandler = e => {
        const event = Platform.OS === 'ios' ? e.getData() : e.data

        // NOTE: Solves rescheduling on android?
        if (this.props.notifications) {
            scheduleNotifications()
        }

        // If we receive a notification in the background dont do anything
        if (this.state.appState.match(/inactive|background/)) {
            return false
        }

        // Possible edge case on android when receiving notifications
        if (event === undefined) {
            return false
        }

        if (event.type === 'esm') {
            const now = new Date()
            const notifDate = new Date(event.date)
            const diff = Math.abs(notifDate - now)
            const minutes = Math.floor((diff / 1000) / 60)

            if (minutes < 20) {
                const timeLeft = (20 - minutes) * (60 * 1000)

                this.props.dispatch(setEsmAvailability(true))

                // Will remove the current one if it exists, since it could
                // be activated in the background on Android
                clearTimeout(this.esmTimer)

                this.esmTimer = setTimeout(() => {
                    this.props.dispatch(setEsmAvailability(false))
                    clearNotificationDate(event.date)
                }, timeLeft)

                Alert.alert(
                    NOTIF_LABELS[event.type].title,
                    NOTIF_LABELS[event.type].body,
                    [{ text: 'OK' }]
                )
            }
        } else {
            // Retrospective
            Alert.alert(
                NOTIF_LABELS[event.type].title,
                NOTIF_LABELS[event.type].body,
                [{ text: 'OK' }]
            )
        }
    }

    // Adds support for android back-button
    onBackPress = () => {
        const { dispatch, nav } = this.props

        if (nav.index === 0) {
            return false
        }

        dispatch(NavigationActions.back())
        return true
    }

    render() {
        const addListener = createReduxBoundAddListener('root');

        const navigation = addNavigationHelpers({
            state: this.props.nav,
            dispatch: this.props.dispatch,
            addListener
        })

        const androidBG = this.props.nav.routes.length === 1
            && (this.props.nav.routes[0].routeName === 'LoginScreen' || this.props.nav.routes[0].routeName === 'HomeScreen')
            ? '#e9e9ef'
            : '#ffffff'

        const screenProps = {
            handleAppOpened: this.handleAppOpened
        }
            
        return (
            <View style={{ flex: 1 }}>
                <StatusBar
                    backgroundColor={androidBG}
                    barStyle='dark-content' />

                <AppNavigator
                    screenProps={screenProps}
                    navigation={navigation} />
            </View>
        )
    }
}

// Export `<AppNavigatorWithState>`
// =================================
export default connect(
    state => ({
        nav: state.nav,
        notifications: state.user.notifications,
        authenticated: state.user.authenticated
    })
)(AppNavigatorWrapper)
