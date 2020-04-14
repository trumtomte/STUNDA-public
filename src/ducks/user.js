import {
    BASE_URL,
    getUserCredentials,
    storeUserCredentials,
    clearUserCredentials,
    clearAllNotifications,
    preparePost,
    preparePatch,
    timeout
} from '../utils'

// Actions
// =======
const REQUEST_LOGIN             = 'user/REQUEST_LOGIN'
const REQUEST_LOGIN_SUCCESS     = 'user/REQUEST_LOGIN_SUCCESS'
const REQUEST_LOGIN_FAILED      = 'user/REQUEST_LOGIN_FAILED'
const LOGIN_CACHED              = 'user/LOGIN_CACHED'
const LOGIN_NOT_CACHED          = 'user/LOGIN_NOT_CACHED'
const REQUEST_SEND_TERMS        = 'user/REQUEST_SEND_TERMS'
const REQUEST_SUCCESS_TERMS     = 'user/REQUEST_SUCCESS_TERMS'
const SET_START_SURVEY_DONE     = 'user/SET_START_SURVEY_DONE'
const SET_NOTIFICATION_SETTING  = 'user/SET_NOTIFICATION_SETTING'
export const REQUEST_LOGOUT     = 'user/REQUEST_LOGOUT'

const initialState = {
    id: null,
    token: '',
    isCached: true, // force cache-check by being true from start
    authenticated: false,
    failedToLogin: false,
    tos: false,
    startSurvey: false,
    notifications: true
}

// Reducer
// =======
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case REQUEST_LOGIN_SUCCESS:
            return {
                ...state,
                failedToLogin: false,
                authenticated: true,
                token: action.payload.user.token,
                id: action.payload.user.id,
                tos: action.payload.user.tos,
                startSurvey: action.payload.user.startSurvey
            }
        case REQUEST_LOGIN_FAILED:
            return { ...state, failedToLogin: true }
        case LOGIN_CACHED:
            return {
                ...state,
                failedToLogin: false,
                authenticated: true,
                notifications: action.payload.user.notifications,
                token: action.payload.user.token,
                id: action.payload.user.id,
                tos: action.payload.user.tos,
                startSurvey: action.payload.user.startSurvey
            }
        case LOGIN_NOT_CACHED:
            return { ...state, isCached: false }
        case REQUEST_LOGOUT:
            return initialState
        case SET_NOTIFICATION_SETTING:
            return { ...state, notifications: action.payload.allow }
        case REQUEST_SUCCESS_TERMS:
            return { ...state, tos: true }
        case SET_START_SURVEY_DONE:
            return { ...state, startSurvey: true }
        default:
            return state
    }
}

// Action Creators
// ===============
export function requestLogin() {
    return { type: REQUEST_LOGIN }
}

export function requestLoginSuccess(user) {
    return {
        type: REQUEST_LOGIN_SUCCESS,
        payload: { user }
    }
}

export function requestLoginFailed() {
    return { type: REQUEST_LOGIN_FAILED }
}

export function loginIsCached(user) {
    return {
        type: LOGIN_CACHED,
        payload: { user }
    }
}

export function loginIsntCached() {
    return { type: LOGIN_NOT_CACHED }
}

export function requestLogout() {
    return { type: REQUEST_LOGOUT }
}

export function setNotificationSetting(allow) {
    return {
        type: SET_NOTIFICATION_SETTING,
        payload: { allow }
    }
}

export function setStartSurveyDone() {
    return { type: SET_START_SURVEY_DONE }
}

export function requestSendTerms() {
    return { type: REQUEST_SEND_TERMS }
}

export function requestSuccessTerms() {
    return { type: REQUEST_SUCCESS_TERMS }
}

// Operations
// ==========
export function allowNotifications(allow) {
    return (dispatch, getState) => {
        const { user } = getState()

        if (allow === user.notifications) {
            return Promise.resolve()
        }

        dispatch(setNotificationSetting(allow))
        storeUserCredentials({ notifications: allow })
    }
}

export function logout() {
    return dispatch => {
        clearUserCredentials()
        clearAllNotifications()
        dispatch(requestLogout())
    }
}

export function login(username, password, done) {
    return async dispatch => {
        dispatch(requestLogin())

        const url = `${BASE_URL}/api-token-auth/`
        const payload = preparePost({ username, password })

        try {
            const res = await timeout(fetch(url, payload))

            if (res.ok) {
                const json = await res.json()
                dispatch(requestLoginSuccess(json))
                // The notifications prop isnt stored on the server
                storeUserCredentials({ notifications: true, ...json })
                done(true, json)
            } else {
                dispatch(requestLoginFailed())
                done(false)
            }
        } catch (err) {
            dispatch(requestLoginFailed())
            done(false)
        }
    }
}

export function loginFromCache(user, done) {
    return dispatch => {
        dispatch(loginIsCached(user))
        done(true)
    }
}

export function acceptTerms(done) {
    return async (dispatch, getState) => {
        const { user } = getState()

        dispatch(requestSendTerms())

        const url = `${BASE_URL}/anon/${user.id}/`
        const body = { tos: true }
        const payload = preparePatch(body, user.token)

        try {
            const res = await timeout(fetch(url, payload))

            if (res.ok) {
                dispatch(requestSuccessTerms())
                storeUserCredentials({
                    id: user.id,
                    token: user.token,
                    startSurvey: user.startSurvey,
                    tos: true
                })
                done(true)
            } else {
                done(false)
            }
        } catch (err) {
            done(false)
        }
    }
}

export function startSurveyDone() {
    return (dispatch, getState) => {
        const { user } = getState()

        dispatch(setStartSurveyDone())
        // Update Credentials in cache (will be sent to server as well)
        storeUserCredentials({
            id: user.id,
            tos: user.tos,
            token: user.token,
            startSurvey: true
        })
    }
}
