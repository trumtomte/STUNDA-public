// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import RNSlider from 'react-native-slider'
import {
    StyleSheet,
    View,
    Text,
    Slider,
    Platform,
    Dimensions
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class SliderField extends Component {
    constructor(props) {
        super(props)

        // First index accessor (0) is used because this component doesnt allow multiple choices
        this.state = {
            value: this.props.currentAnswers !== null
                ? this.props.currentAnswers[0][1]
                : -1
        }

        // If we already have an answer, lets initialize this component with it
        if (this.props.currentAnswers !== null) {
            this.props.select(
                this.props.currentAnswers[0][0], // index
                this.props.currentAnswers[0][1]  // value
            )
        }
    }

    onSlidingComplete = value => {
        this.setState({ value: value })
        this.props.select(0, value)
    }

    renderInfoButton = () => {
        if (!this.props.survey.hasOwnProperty('info')) {
            return null
        }

        return this.props.renderInfoButton(this.props.survey.info)
    }

    renderSlider = (value, survey) => {
        if (Platform.OS === 'ios') {
            return (
                <Slider
                    style={{ flex: 1 }}
                    step={1}
                    value={value}
                    minimumValue={survey.minimumValue}
                    maximumValue={survey.maximumValue}
                    onSlidingComplete={this.onSlidingComplete} />
            )
        }

        return (
            <RNSlider
                style={{ flex: 1 }}
                trackStyle={s.track}
                thumbStyle={s.thumb}
                minimumTrackTintColor='#1073ff'
                maximumTrackTintColor='#b7b7b7'
                step={1}
                value={value}
                minimumValue={survey.minimumValue}
                maximumValue={survey.maximumValue}
                onSlidingComplete={this.onSlidingComplete} />
        )
    }

    getCurrentValue = () => {
        // Either we use the default value, or the state value (0 incase nothing exists)
        return this.props.survey.hasOwnProperty('default') && this.state.value === -1
            ? this.props.survey.default
            : this.state.value === -1 ? 0 : this.state.value
    }

    render() {
        const { hasHeader, survey } = this.props
        const value = this.getCurrentValue()

        return (
            <View style={s.container}>
                <View style={hasHeader ? s.subHeader : s.header}>
                    {this.renderInfoButton()}
                    <Text style={hasHeader ? s.subHeaderText : s.headerText}>
                        {survey.question}
                    </Text>
                </View>

                <View style={s.labels}>
                    <View style={[s.label, { alignItems: 'flex-start' }]}>
                        <Text style={s.labelTxt}>
                            {survey.leftLabel}
                        </Text>
                    </View>
                    <View style={[s.label, { alignItems: 'flex-end' }]}>
                        <Text style={s.labelTxt}>
                            {survey.rightLabel}
                        </Text>
                    </View>
                </View>

                <View style={s.inputContainer}>
                    {this.renderSlider(value, survey)}
                </View>
            </View>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 25,
        alignItems: 'stretch'
    },
    header: {
        paddingLeft: width <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 25,
    },
    headerText: {
        fontSize: width <= 320 ? 15 : 18,
        fontFamily: FONT,
        color: '#111',
    },
    subHeaderText: {
        fontSize: 14,
        fontFamily: FONT,
        color: '#333',
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: width <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 15,
    },
    inputContainer: {
        alignItems: 'stretch',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    },
    labels: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15
    },
    label: {
        flex: 1,
        justifyContent: 'center'
    },
    labelTxt: {
        fontSize: width <= 320 ? 13 : 14,
        fontFamily: FONT,
        color: '#111'
    },
    value: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    valueTxt: {
        fontSize: width <= 320 ? 13 : 15,
        fontFamily: FONT,
        color: '#333'
    },
    track: {
        height: 2,
        borderRadius: 1,
    },
    thumb: {
        width: 30,
        height: 30,
        borderRadius: 30 / 2,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 2,
        shadowOpacity: 0.35,
        borderColor: '#999999',
        borderWidth: 1
    }
})

// Export
// ======
export default SliderField
