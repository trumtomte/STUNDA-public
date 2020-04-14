import { BASE_URL, timeout } from '../utils'

// Actions
// =======
const REQUEST_SUCCESS   = 'surveys/REQUEST_SUCCESS'
const REQUEST_FAILED    = 'surveys/REQUEST_FAILED'
const REQUEST_SEND      = 'surveys/REQUEST_SEND'

const initialState = {
    data: {},
    pending: false,
    rejected: false
}

// Reducer
// =======
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case REQUEST_SUCCESS:
            return {
                pending: false,
                rejected: false,
                data: action.payload.surveys
            }
        case REQUEST_SEND:
            return {
                ...state,
                pending: true,
                rejected: false
            }
        case REQUEST_FAILED:
            return {
                ...state,
                pending: true,
                rejected: true
            }
        default:
            return state
    }
}

// Action Creators
// ===============
export function requestSend() {
    return { type: REQUEST_SEND }
}

export function requestSuccess(surveys) {
    return {
        type: REQUEST_SUCCESS,
        payload: { surveys }
    }
}

export function requestFailed() {
    return { type: REQUEST_FAILED }
}

// Operations
// ==========
export function fetchSurveys() {
    return async (dispatch, getState) => {
        const { surveys } = getState()

        dispatch(requestSend())

        const url = `${BASE_URL}/questions/`

        try {
            const res = await timeout(fetch(url))

            if (res.ok) {
                const json = await res.json()

                const surveys = json.reduce((acc, next) => {
                    acc[next.name] = next.questions
                    return acc
                }, {})

                dispatch(requestSuccess(surveys))
            } else {
                dispatch(requestFailed())
                setTimeout(() => dispatch(fetchSurveys()), 8000)
            }
        } catch (err) {
            // Retry (due to timeout)
            dispatch(requestFailed())
            setTimeout(() => dispatch(fetchSurveys()), 8000)
        }
    }
}
