// Dependencies
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FONT, resetAction, flattenAnswers, requestCurrentPosition } from '../utils'
import { storeAnswers, sendSurvey, setEsmAvailability } from '../ducks/survey'
import { startSurveyDone } from '../ducks/user'
import IconIonicons from 'react-native-vector-icons/Ionicons'
import {
    List,
    Tabs,
    Info,
    Icons,
    GoogleMap,
    InputField,
    PickerField,
    SliderField
} from '../SurveyComponents'
import {
    View,
    Text,
    Alert,
    Platform,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class SurveyScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const { step, steps } = navigation.state.params

        return {
            title: `Steg ${step} av ${steps}`,
            headerRight: <View />,
            headerStyle: {
                elevation: 0,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: '#aaaaaa'
            },
            headerTitleStyle: { fontFamily: FONT, alignSelf: 'center' },
            headerBackTitleStyle: { fontFamily: FONT },
            headerBackTitle: 'Tillbaka'
        }
    }

    // NOTE: for each new step the state is cleared since
    //       this component is remounted with a new survey step
    //
    // Structure of `indexes`
    // [ <-- Questions
    //      [ <-- Answers for a question (can be multiple)
    //          [], <-- Answer `(index, value)`
    //          ...
    //      ]
    // ]
    state = {
        indexes: [],
        loading: false
    }

    constructor(props) {
        super(props)
        // Allowed survey types where answers can be toggled
        this.whitelist = ['tabs', 'icons', 'list']
    }

    // state.indexes.length, state.loading, props.navigation.state.params.step,
    // shouldComponentUpdate()

    // If one of the multiple answers has a `toStep` with a higher priority
    // (ie. least occurring) it will determine the next step
    getAlternativeIndex = (survey, answers) => {
        // { `toStep`: [indexes...] } 
        const histogram = survey.alternatives.reduce((acc, next, i) => {
            if (acc.hasOwnProperty(next.toStep)) {
                acc[next.toStep].push(i)
            } else {
                acc[next.toStep] = [i]
            }

            return acc
        }, {})

        // Return the array of indexes with least amount of elements
        const nextStepIndexes = Object.entries(histogram).reduce((acc, next) => {
            return acc.length === 0 || next[1].length < acc.length
                ? next[1]
                : acc
        }, [])

        // Get the alternative index from an answer if it has priority
        // otherwise take the first one 
        return answers[0].reduce((acc, next) => {
            return acc === -1 || nextStepIndexes.indexOf(next[0]) !== -1
                ? next[0]
                : acc
        }, -1)
    }

    done = success => {
        this.setState({ loading: false })
        this.props.navigation.dispatch(
            resetAction('SurveyDoneScreen', { success })
        )
    }

    finishSurvey = async type => {
        this.setState({ loading: true }) 

        if (type === 'esm') {
            // NOTE: this could be dynamic in a future version
            const answers = flattenAnswers(this.props.survey.answers)

            // Dont register location when the positional answer is "Hemma"
            if (answers.hasOwnProperty('step1') && answers.step1[0].toLowerCase() === "hemma") {
                this.props.sendSurvey('', this.done)
            } else {
                const coords = await requestCurrentPosition()
                this.props.sendSurvey(coords, this.done)
            }

            // Deactivate the ESM survey when we've completed it
            this.props.setEsmAvailability(false)
        } else {
            // If its the start survey, mark it as done
            if (type === 'start') {
                this.props.startSurveyDone()
            }

            this.props.sendSurvey('', this.done)
        }
    }

    getNextStepFromAlternatives = currentSurvey => {
        // If multiple answers are allowed we need to calculate which `toStep`
        // has priority and therefore determines the next step, otherwise we'll
        // just select the first (and only) answer
        const index = currentSurvey.multiple
            ? this.getAlternativeIndex(currentSurvey, this.state.indexes)
            : this.state.indexes[0][0][0]

        // NOTE: unsafe
        return currentSurvey.alternatives[index].toStep
    }

    getNextStep = currentSurvey => {
        // If `threshold` and `skipToStep` is defined, check to see if the 
        // current answer (indexes[0][0][1]) is <= then the threshold
        if (currentSurvey.hasOwnProperty('threshold') && currentSurvey.hasOwnProperty('skipToStep')) {
            return this.state.indexes[0][0][1] <= currentSurvey.threshold
                ? currentSurvey.skipToStep
                : currentSurvey.toStep
        }

        return currentSurvey.toStep
    }

    next = () => {
        const { type, step, steps } = this.props.navigation.state.params
        // Always store answers in the global state
        this.props.storeAnswers(step, this.state.indexes)

        const currentSurvey = this.props.surveys[type][`step${step}`]

        // Alternatives chooses the next question
        if (!currentSurvey.hasOwnProperty('toStep') && this.state.indexes.length === 1 && currentSurvey.alternatives.length > 0) {
            const step = this.getNextStepFromAlternatives(currentSurvey)

            if (step === -1) {
                this.finishSurvey(type)
            } else {
                this.props.navigation.navigate(
                    'SurveyScreen', 
                    { type, steps, step }
                )
            }
        // We're not at the last question yet, lets continue
        } else if (currentSurvey.toStep !== -1) {
            const step = this.getNextStep(currentSurvey)
            this.props.navigation.navigate(
                'SurveyScreen',
                { type, steps, step }
            )
        } else {
            this.finishSurvey(type)
        }
    }

    // `from`   = question index
    // `i`      = answer index
    // `value`  = answer value
    select = (from, i, value) => {
        const { type, step } = this.props.navigation.state.params
        const survey = this.props.surveys[type][`step${step}`]
        const len = survey.questions.length
        // If there are multiple questions we need to fetch the right survey
        const currentSurvey = len > 0 ? survey.questions[from] : survey

        // If there hasn't been any choices, construct a new array
        const currentIndexes = this.state.indexes.length === 0
            ? Array(len === 0 ? 1 : len).fill([])
            : this.state.indexes

        // Update the current answers to a question
        const newIndexes = currentIndexes.map((answers, idx) => {
            // Break if its not the current question
            if (idx !== from) {
                return answers
            }

            // NOTE: `answer[0]` is the answer index, and `[1]` is the value

            // If multiple answers are allowed
            if (currentSurvey.multiple) {
                // Either filter out answers if the index already exist, or
                // if the value contains 'update:' we'll keep the item
                const filtered = answers.filter(answer => {
                    return answer[0] !== i
                        || (answer[0] === i && value.substring(0, 7) === 'update:')
                })

                // If length isnt the same we've removed it 
                if (answers.length !== filtered.length) {
                    return filtered
                }

                // Update a current value
                if (value.substring(0, 7) === 'update:') {
                    return answers.map(answer => {
                        if (answer[0] === i) {
                            answer[1] = value.substring(7)
                        }

                        return answer
                    })
                }

                // New value, add it
                return [...answers, [i, value]]
            }

            // They clicked the same answer twice which means we'll remove it instead
            if (this.whitelist.indexOf(currentSurvey.type) !== -1 && answers.length === 1 && answers[0][0] === i) {
                // Update current value
                if (value.substring(0, 7) === 'update:') {
                    return [[i, value.substring(7)]]
                }

                return []
            }
            
            return [[i, value]]
        })

        this.setState({ indexes: newIndexes })
    }

    // `from`   = question index
    // `i`      = answer index
    isSelected = (from, i) => {
        const { indexes } = this.state

        // Empty -> return false
        if (indexes.length === 0 || indexes[from].length === 0) {
            return false
        }

        // Reduce all answers to a truthy value
        return indexes[from].reduce((a, n) => n[0] === i ? true : a, false)
    }

    getCurrentAnswers = index => {
        const step = this.props.navigation.getParam('step', null)

        if (step === null) {
            return null
        }

        if (!this.props.survey.answers.hasOwnProperty(`step${step}`)) {
            return null
        }

        return this.props.survey.answers[`step${step}`][index]
    }

    renderSingleQuestion = (survey, index, hasHeader = false) => {
        // NOTE: thought about adding a `diff` property for shouldComponentUpdate()
        //       = sum of each selected (index + 1), incase of performance issues
        const props = {
            hasHeader,
            key: index,
            survey: survey,
            select: (i, value) => this.select(index, i, value),
            isSelected: i => this.isSelected(index, i),
            renderInfoButton: t => this.renderInfoButton(t),
            currentAnswers: this.getCurrentAnswers(index),
        }

        switch (survey.type) {
            case 'tabs':
                return <Tabs {...props} />
            case 'icons':
                return <Icons {...props} />
            case 'list':
                return <List {...props} />
            case 'map':
                return <GoogleMap {...props} />
            case 'text':
                return <InputField {...props} />
            case 'number':
                return <InputField {...props} number={true} />
            case 'picker':
                return <PickerField {...props} />
            case 'slider':
                return <SliderField {...props} />
            case 'info':
                return <Info {...props} />
            default:
                return null
        }
    }

    calculateOpenAnswers = survey => {
        if (survey.questions.length > 0) {
            return survey.questions.reduce((a, n) => n.open ? a + 1 : a, 0)
        } else {
            return survey.open ? 1 : 0
        }
    }

    renderButton = () => {
        const { type, step } = this.props.navigation.state.params
        const survey = this.props.surveys[type][`step${step}`]

        const numOfAnswers = this.state.indexes.reduce((a, n) => n.length > 0 ? a + 1 : a, 0)
        const numOfQuestions = survey.questions.length > 0
            ? survey.questions.length
            : 1

        // NOTE: if open answers are allowed, reduce the number of these and
        //       subtract them from `numOfQuestions`. Dont count an open answer
        //       if the currentSurvey doesnt have `toStep`

        const numOfRequiredQs = survey.hasOwnProperty('toStep')
            ? numOfQuestions - this.calculateOpenAnswers(survey)
            : numOfQuestions

        let content = null

        if (this.state.loading) {
            content = (
                <View style={s.buttonInner}>
                    <ActivityIndicator animating={true} size='small' />
                </View>
            )
        } else if (numOfAnswers >= numOfRequiredQs) {
            // Show the active next button when the users has answered a
            // sufficient amount of questions
            content = (
                <TouchableOpacity onPress={this.next} style={{ flex: 1 }}>
                    <View style={s.buttonInner}>
                        <Text style={[s.buttonText, { color: '#0e7afe' }]}>
                            {survey.toStep === -1 ? 'Skicka' : 'Nästa'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            content = (
                <View style={s.buttonInner}>
                    <Text style={[s.buttonText, { color: '#bbbbbb' }]}>
                        {survey.toStep === -1 ? 'Skicka' : 'Nästa'}
                    </Text>
                </View>
            )
        }

        const sumAnswers = numOfQuestions <= 1
            ? null
            : (
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ marginRight: 10 }}>
                        <Text style={s.someQs}>
                            {numOfAnswers} / {numOfQuestions}
                        </Text>
                    </View>
                    <Text style={s.someQs}>
                        Svar
                    </Text>
                </View>
            )

        return (
            <View style={s.bottom}>
                <View style={s.bottomInner}>
                    {sumAnswers}
                </View>
                <View style={s.button}>
                    {content}
                </View>
            </View>
        )
    }

    renderHeader = text => {
        return (
            <View style={s.header}>
                <Text style={s.headerText}>
                    {text}
                </Text>
            </View>
        )
    }

    renderInfoButton = text => {
        const onPress = () => {
            Alert.alert(
                'Information',
                text,
                [{ text: 'OK' }]
            )
        }

        return (
            <TouchableOpacity
                opacity={0.6}
                onPress={onPress}
                style={s.infoButton}>
                <IconIonicons
                    style={{ marginBottom: -2 }}
                    name='ios-information-circle-outline'
                    size={24}
                    color='#0e7afe' />
            </TouchableOpacity>
        )
    }

    // NOTE: do we want to do something if there are multiple questions and
    //       some are `open` and others are not?
    renderContent = (questions, survey) => {
        const hasHeader = survey.questions.length > 0 && survey.question !== ''

        return (
            <View style={s.container}>
                <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 15 }}>
                    {hasHeader ? this.renderHeader(survey.question) : null}
                    {questions}
                </ScrollView>

                {this.renderButton()}
            </View>
        )
    }

    render() {
        const { type, step } = this.props.navigation.state.params

        const survey = this.props.surveys[type][`step${step}`]

        const questions = survey.questions.length > 0
            ? survey.questions.map((q, i) => this.renderSingleQuestion(q, i, survey.question !== ''))
            : this.renderSingleQuestion(survey, 0)

        const props = { behavior: 'padding', style: { flex: 1 }}

        if (Platform.OS === 'android') {
            props.onLayout = () => false
        }

        return (
            <KeyboardAvoidingView {...props}>
                {this.renderContent(questions, survey)}
            </KeyboardAvoidingView>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    container: {
        flex: 1
    },
    scroll: {
        flex: 1,
        paddingTop: 15
    },
    header: {
        paddingLeft: width <= 320 ? 20 : 40,
        paddingRight: 20,
        marginTop: 25,
    },
    headerText: {
        fontSize: width <= 320 ? 15 : 17,
        fontFamily: FONT,
        color: '#111',
    },
    bottom: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        maxHeight: 48,
        backgroundColor: '#f7f7f7',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0, 0, 0, 0.3)'
    },
    bottomInner: {
        flex: 1,
        paddingLeft: 20
    },
    button: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    buttonInner: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20
    },
    buttonText: {
        fontFamily: FONT,
        fontSize: width <= 320 ? 16 : 18
    },
    someQs: {
        fontFamily: FONT,
        color: '#444',
        fontSize: width <= 320 ? 15 : 16
    },
    infoButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8
    }
})

// Export
// ======
export default connect(
    state => ({
        survey: state.survey,
        surveys: state.surveys.data
    }),
    dispatch => ({
        storeAnswers: (step, indexes) => {
            dispatch(storeAnswers(step, indexes))
        },
        startSurveyDone: () => {
            dispatch(startSurveyDone())
        },
        sendSurvey: (geo, done) => {
            dispatch(sendSurvey(geo, done))
        },
        setEsmAvailability: a => {
            dispatch(setEsmAvailability(a))
        }
    })
)(SurveyScreen)
