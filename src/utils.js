import {
    Platform,
    AsyncStorage,
    PermissionsAndroid,
    PushNotificationIOS
} from 'react-native'
import { NavigationActions } from 'react-navigation'
import LocalNotification from 'react-native-ln'

// Base url for the API
export const BASE_URL = 'https://stunda.nu/api'
// export const BASE_URL = 'http://localhost/api'

// Global font
export const FONT = 'Helvetica Neue'

// ID key for the caches
export const C_USER = '@stunda:user'
export const C_NOTI = '@stunda:notifications'

// Notification title and body
export const NOTIF_LABELS = {
    esm: {
        title: 'Snabbenkät',
        body: 'Nu kan du svara på snabbenkäten!'
    },
    retrospective: {
        title: 'Daglig enkät',
        body: 'Glöm inte att fylla i den dagliga enkäten!'
    }
}

// Reduce Answer construct into something readable
export function flattenAnswers(answers) {
    return Object.keys(answers)
        .map(key => {
            return { key, answers: answers[key] }
        })
        .reduce((acc, next) => {
            // When an answer is `open` and no value exists we'll use a empty string
            if (next.answers.length === 0) {
                acc[next.key] = ['']
            } else {
                // Concatenate multiple answers together with `:`
                acc[next.key] = next.answers
                    .map(a => a.map(a => a[1]).join(':'))
                    .reduce((a, n) => a.concat(n), [])
            }

            return acc
        }, {})
}

// Prepare HTTP requests
export function prepare(method, body, token = '') {
    let payload = { method }

    if (method !== 'GET' && method !== 'DELETE') {
        payload.body = JSON.stringify(body)
    }

    if (token.length) {
        payload.headers = new Headers({
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authentication': `Token ${token}`
        })
    } else {
        payload.headers = new Headers({
            'Accept': 'application/json',
            'Content-type': 'application/json'
        })
    }

    return payload
}

// HTTP wrappers
export const prepareGet = t => prepare('GET', {}, t)
export const prepareDel = t => prepare('POST', {}, t)
export const preparePost = (b, t) => prepare('POST', b, t)
export const preparePut = (b, t) => prepare('PUT', b, t)
export const preparePatch = (b, t) => prepare('PATCH', b, t)

// Used for wrapping `fetch` request to add a timeout
export function timeout(promise, ms = 10000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Request Timeout')), ms)
        promise.then(resolve, reject)
    })
}

export function parseJSON(json) {
    try {
        const parsed = JSON.parse(json)
        return parsed
    } catch (e) {
        return null
    }
}

export function getUserCredentials(cb) {
    AsyncStorage.getItem(C_USER).then(json => cb(parseJSON(json)))
}

// NOTE: Silently fails
export function storeUserCredentials(user) {
    getUserCredentials(c => {
        const data = { ...c, ...user }
        AsyncStorage.setItem(C_USER, JSON.stringify(data)).catch(() => false)
    })
}

// NOTE: Silently fails
export function clearUserCredentials() {
    AsyncStorage.removeItem(C_USER).catch(() => false)
}

export function getNotificationDates(cb) {
    AsyncStorage.getItem(C_NOTI).then(json => cb(parseJSON(json)))
}

export async function getRecentNotificationDate(type) {
    const json = await AsyncStorage.getItem(C_NOTI)
    const dates = parseJSON(json)

    if (dates === null) {
        return null
    }

    const now = new Date()

    // Filter out irrelevant notification dates
    const filteredDates = dates
        .filter(date => date.type === type)
        .filter(date => {
            if (date.type === 'retrospective') {
                return true
            }

            const notificationDate = new Date(date.date)

            // Filter out future notifications
            if (notificationDate > now) {
                return false
            }

            const diff = Math.abs(notificationDate - now)
            const mins = Math.floor((diff / 1000) / 60)
            // Within 30 minutes of receiving a esm notification
            return mins < 30
        })

    // Sort by date
    filteredDates.sort((a, b) => b.date - a.date)

    return filteredDates.length > 0 ? filteredDates[0] : null
}

// NOTE: Silently fails
export function storeNotificationDates(dates) {
    AsyncStorage.getItem(C_NOTI).then(json => {
        const parsedJSON = parseJSON(json)
        const currentDates = parsedJSON === null ? [] : parsedJSON
        const data = [...currentDates, ...dates]
        AsyncStorage.setItem(C_NOTI, JSON.stringify(data)).catch(() => false)
    })
}

// NOTE: Silently fails
export function clearNotificationDate(date) {
    const now = new Date()

    AsyncStorage.getItem(C_NOTI).then(json => {
        const parsedJSON = parseJSON(json)
        const currentDates = parsedJSON === null ? [] : parsedJSON
        // Filter the one to be deleted, then the old dates that are in the past
        const data = currentDates
            .filter(d => d.date !== date)
            .filter(d => d.date > now.getTime())
        AsyncStorage.setItem(C_NOTI, JSON.stringify(data)).catch(() => false)
    })
}

// NOTE: Silently fails
export function clearNotificationDates() {
    AsyncStorage.removeItem(C_NOTI).catch(() => false)
}

// Custom navigation actions
export function resetAction(route, params = {}) {
    return NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: route, params })]
    })
}

// Throttle function calls based on `limit`
export function throttle(fn, limit) {
    let pending = false

    return function() {
        if (!pending) {
            fn.apply(this, arguments)
            pending = true
            setTimeout(() => pending = false, limit)
        }
    }
}

export function leftPad(n, c = 0) {
    return n < 10 ? `${c}${n}` : n
}

export function formatDate(d) {
    const year = d.getFullYear()
    const month = leftPad(d.getMonth() + 1)
    const date = leftPad(d.getDate())
    const hour = leftPad(d.getHours())
    const min = leftPad(d.getMinutes())
    const sec = leftPad(d.getSeconds())
    return `${year}-${month}-${date} ${hour}:${min}:${sec}`
}

// Receives two objects containg { hours: int, minutes: int }
export function generateRandomDate(a, b) {
    const date = new Date()

    // If the date has passed the start time `a`, schedule it for tomorrow
    if (date.getHours() >= a.hours || (date.getHours() === a.hours && date.getMinutes() >= a.minutes)) {
        date.setDate(date.getDate() + 1)
    }

    const hours = Math.floor(a.hours + Math.random() * ((b.hours + 1) - a.hours)) 
    const seconds = hours === b.hours || b.hours === 0 ? 0 : Math.floor(Math.random() * 59)

    // NOTE:
    // hours === a.hours, randomize hours from (eg) 12:30 to 12:59
    // hours === b.hours, randomize hours from (eg) 14:00 to 14:30
    // otherwise get a random number from 0 - 59
    const minutes = hours === a.hours
        ? Math.floor(Math.random() * (59 - a.minutes) + a.minutes)
        : hours === b.hours
            ? Math.floor(Math.random() * b.minutes)
            : Math.floor(Math.random() * 59)

    date.setHours(hours)
    date.setMinutes(minutes)
    date.setSeconds(seconds)
    return date
}

export function resetBadgeCount() {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(0)
    } else {
        LocalNotification.setApplicationIconBadgeNumber(0)
    }
}


export function clearAllNotifications() {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.cancelAllLocalNotifications()
    } else {
        LocalNotification.cancelAllLocalNotifications()
    }

    resetBadgeCount()
    clearNotificationDates()
}

export function addNotificationListener(handler) {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.addEventListener('localNotification', handler)
    } else {
        return LocalNotification.addListener(handler)
    }
}

export function removeNotificationListener(handler) {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.removeEventListener('localNotification', handler)
    } else {
        // `handler` will be the current subscription
        handler.remove()
    }
}

export function scheduleNotification(date, type, n = 1) {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.scheduleLocalNotification({
            fireDate: date,
            alertTitle: NOTIF_LABELS[type].title,
            alertBody: NOTIF_LABELS[type].body,
            applicationIconBadgeNumber: n,
            userInfo: {
                id: `notif-${date.getTime()}`,
                type: type,
                date: date.getTime()
            }
        })
    } else {
        LocalNotification.scheduleLocalNotification({
            id: `notif-${date.getTime()}`,
            number: n,
            sound: 'default',
            vibrate: 1000,
            lights: true,
            fireDate: date.getTime(),
            title: NOTIF_LABELS[type].title,
            body: NOTIF_LABELS[type].body,
            data: {
                type: type,
                date: date.getTime()
            }
        })
    }
}

// Reschedules notifications based on current schedule
export function rescheduleNotifications(scheduled) {
    if (scheduled.length >= 4) {
        return false
    }

    // Cached notification dates
    const dates = []

    // Notification dates to be scheduled (random within the span of two hour/mins)
    const dateEsm1 = generateRandomDate(
        { hours: 7, minutes: 30 },
        { hours: 12, minutes: 30 }
    )
    const dateEsm2 = generateRandomDate(
        { hours: 12, minutes: 31 },
        { hours: 17, minutes: 30 }
    )
    const dateEsm3 = generateRandomDate(
        { hours: 17, minutes: 31 },
        { hours: 22, minutes: 30 }
    )
    const dateRetro = generateRandomDate(
        { hours: 19, minutes: 0 },
        { hours: 21, minutes: 0 }
    )

    // Notification objects
    const esm1 = { key: 'esm1', type: 'esm', date: dateEsm1.getTime() }
    const esm2 = { key: 'esm2', type: 'esm', date: dateEsm2.getTime() }
    const esm3 = { key: 'esm3', type: 'esm', date: dateEsm3.getTime() }
    const retro = { key: 'retro', type: 'retrospective', date: dateRetro.getTime() }

    // No notifications scheduled = reschedule all
    if (scheduled.length === 0) {
        scheduleNotification(dateEsm1, 'esm')
        scheduleNotification(dateEsm2, 'esm')
        scheduleNotification(dateEsm3, 'esm')
        scheduleNotification(dateRetro, 'retrospective')

        // Dates to be stored in the cache
        dates.push(esm1)
        dates.push(esm2)
        dates.push(esm3)
        dates.push(retro)

        // Sort dates
        dates.sort((a, b) => a.date - b.date)
        storeNotificationDates(dates)
    // One scheduled, reschedule 3 notifications
    } else if (scheduled.length < 4) {
        getNotificationDates(cachedDates => {
            const last = cachedDates[cachedDates.length - 1]

            if (last === undefined) {
                return
            }

            switch (last.key) {
                case 'esm1':
                    if (scheduled.length <= 3) {
                        scheduleNotification(dateEsm2, 'esm')
                        dates.push(esm2)
                    }

                    if (scheduled.length <= 2) {
                        scheduleNotification(dateEsm3, 'esm')
                        dates.push(esm3)
                    }

                    if (scheduled.length === 1) {
                        scheduleNotification(dateRetro, 'retrospective')
                        dates.push(retro)
                    }
                    break
                case 'esm2':
                    if (scheduled.length <= 3) {
                        scheduleNotification(dateEsm3, 'esm')
                        dates.push(esm3)
                    }

                    if (scheduled.length <= 2) {
                        scheduleNotification(dateRetro, 'retrospective')
                        dates.push(retro)
                    }

                    if (scheduled.length === 1) {
                        scheduleNotification(dateEsm1, 'esm')
                        dates.push(esm1)
                    }
                    break
                case 'esm3':
                    if (scheduled.length <= 3) {
                        scheduleNotification(dateRetro, 'retrospective')
                        dates.push(retro)
                    }

                    if (scheduled.length <= 2) {
                        scheduleNotification(dateEsm1, 'esm')
                        dates.push(esm1)
                    }

                    if (scheduled.length === 1) {
                        scheduleNotification(dateEsm2, 'esm')
                        dates.push(esm2)
                    }
                    break
                case 'retro':
                    if (scheduled.length <= 3) {
                        scheduleNotification(dateEsm1, 'esm')
                        dates.push(esm1)
                    }

                    if (scheduled.length <= 2) {
                        scheduleNotification(dateEsm2, 'esm')
                        dates.push(esm2)
                    }

                    if (scheduled.length === 1) {
                        scheduleNotification(dateEsm3, 'esm')
                        dates.push(esm3)
                    }
                    break
            }

            // Sort dates
            dates.sort((a, b) => a.date - b.date)
            storeNotificationDates(dates)
        })
    }
}

export const throttledReschedule = throttle(rescheduleNotifications, 3000)

export function checkPermissions() {
    return new Promise(resolve => PushNotificationIOS.checkPermissions(resolve))
}

export async function scheduleWithPermissions() {
    if (Platform.OS === 'ios') {
        const perm = await checkPermissions()

        if (!perm.alert) {
            const requestedPerm = await PushNotificationIOS.requestPermissions()
            return requestedPerm.alert
        }

        PushNotificationIOS.getScheduledLocalNotifications(throttledReschedule)
        return true
    }

    // NOTE: check permission?
    const scheduled = await LocalNotification.getScheduledLocalNotifications()
    throttledReschedule(scheduled)
    return true
}

export const scheduleNotifications = scheduleWithPermissions

export function requestCurrentPosition() {
    return new Promise(async resolve => {
        const success = ({ coords }) => resolve(`${coords.latitude}:${coords.longitude}`)
        const error = () => resolve('Unable to fetch current position after [8000ms]')
        const config = { timeout: 8000 }

        if (Platform.OS === 'ios') {
            navigator.geolocation.getCurrentPosition(success, error, config)
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Hantering av geografisk data',
                        'message': 'Din nuvarande position används för att koppla dina svar till en plats, med undantaget för valet "Hemma".'
                    }
                )

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    navigator.geolocation.getCurrentPosition(success, error, config)
                } else {
                    resolve('Unable to fetch current position due to Android Permissions')
                }
            } catch (err) {
                resolve('Unable to fetch current position (Android)')
            }
        }
    })
}
