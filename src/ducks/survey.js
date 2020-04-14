import { AsyncStorage } from 'react-native'
import {
    BASE_URL,
    preparePost,
    formatDate,
    timeout,
    flattenAnswers,
    clearNotificationDate,
    getRecentNotificationDate
} from '../utils'

// Actions
// =======
const REQUEST_SEND          = 'survey/REQUEST_SEND'
const REQUEST_SUCCESS       = 'survey/REQUEST_SUCCESS'
const REQUEST_FAIL          = 'survey/REQUEST_FAIL'
const SET_CURRENT           = 'survey/SET_CURRENT'
const UNSET_CURRENT         = 'survey/UNSET_CURRENT'
const STORE_ANSWERS         = 'survey/STORE_ANSWERS'
const CACHED_ANSWER_SENT    = 'survey/CACHED_ANSWER_SENT'
const SET_ESM_AVAILABILITY  = 'survey/SET_ESM_AVAILABILITY'

const initialState = {
    current: '',
    start: null,
    answers: {},
    unsent: [],
    esmIsAvailable: false
}

// Reducer
// =======
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_CURRENT:
            return {
                ...state,
                current: action.payload.type,
                start: (new Date()).toISOString(),
                answers: {}
            }
        case UNSET_CURRENT:
            return {
                ...state,
                current: '',
                start: null,
                answers: {}
            }
        case STORE_ANSWERS:
            return {
                ...state,
                answers: {
                    ...state.answers,
                    [`step${action.payload.step}`]: action.payload.answers
                }
            }
        case REQUEST_FAIL:
            return {
                ...state,
                current: '',
                start: null,
                answers: {},
                unsent: [...state.unsent, action.payload.survey]
            }
        case CACHED_ANSWER_SENT:
            return {
                ...state,
                unsent: state.unsent.filter(answer => (
                    answer.started_at !== action.payload.answer.started_at
                ))
            }
        case SET_ESM_AVAILABILITY:
            return {
                ...state,
                esmIsAvailable: action.payload.available
            }
        case REQUEST_SUCCESS:
        case REQUEST_SEND:
        default:
            return state
    }
}

// Action Creators
// =======
export function requestSend() {
    return { type: REQUEST_SEND }
}

export function requestSuccess() {
    return {
        type: REQUEST_SUCCESS
    }
}

export function requestFailed(survey) {
    return {
        type: REQUEST_FAIL,
        payload: { survey }
    }
}

export function cachedAnswerSent(answer) {
    return {
        type: CACHED_ANSWER_SENT,
        payload: { answer }
    }
}

export function setEsmAvailability(available) {
    return {
        type: SET_ESM_AVAILABILITY,
        payload: { available }
    }
}

export function setCurrentSurvey(type) {
    return {
        type: SET_CURRENT,
        payload: { type }
    }
}

export function unsetCurrentSurvey() {
    return { type: UNSET_CURRENT }
}

export function storeAnswers(step, answers) {
    return {
        type: STORE_ANSWERS,
        payload: { step, answers }
    }
}

// Operations
// ==========
export function sendSurvey(geo, done) {
    return async (dispatch, getState) => {
        const { user, survey } = getState()

        dispatch(requestSend())

        const answers = flattenAnswers(survey.answers)
        const notificationDate = await getRecentNotificationDate(survey.current)

        if (notificationDate !== null) {
            answers.notification_received = formatDate(
                new Date(notificationDate.date)
            )
            clearNotificationDate(notificationDate.date)
        } else {
            answers.notification_received = ''
        }

        const url = `${BASE_URL}/survey/`
        const body = {
            survey_type: survey.current,
            started_at: survey.start,
            geolocation: geo,
            user: user.id,
            answers
        }

        const payload = preparePost(body, user.token)

        try {
            const res = await timeout(fetch(url, payload))

            if (res.ok) {
                dispatch(requestSuccess())
                done(true)
            } else {
                dispatch(requestFailed(body))
                done(false)
            }
        } catch (err) {
            dispatch(requestFailed(body))
            done(false)
        }

        // Send cached survey answers
        if (survey.unsent.length > 0) {
            survey.unsent.forEach(async answer => {
                const payload = preparePost(answer, user.token)

                try {
                    const res = await fetch(url, payload)

                    if (res.ok) {
                        dispatch(cachedAnswerSent(answer))
                    } else {
                        // NOTE: silently fail
                    }
                } catch (err) {
                    // NOTE: silently fail
                }
            })
        }
    }
}

