// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class InputField extends Component {
    constructor(props) {
        super(props)
        
        const hasAnswers = (
            this.props.currentAnswers !== null
            && this.props.currentAnswers !== undefined
            && this.props.currentAnswers.length > 0
        )

        // First index accessor (0) is used because this component doesnt allow multiple choices
        this.state = {
            value: hasAnswers
                ? this.props.currentAnswers[0][1]
                : ''
        }

        // If we already have an answer, lets initialize this component with it
        if (hasAnswers) {
            this.props.select(
                this.props.currentAnswers[0][0], // index
                this.props.currentAnswers[0][1]  // value
            )
        }
    }

    onChange = value => {
        this.setState({ value })
        this.props.select(0, value)
    }

    onBlur = () => {
        this.props.select(0, this.state.value)
    }

    renderInfoButton = () => {
        if (!this.props.survey.hasOwnProperty('info')) {
            return null
        }

        return this.props.renderInfoButton(this.props.survey.info)
    }

    render() {
        const { survey, number } = this.props

        const placeholder = survey.hasOwnProperty('placeholder')
            ? survey.placeholder
            : 'Fyll i här'

        return (
            <View style={s.container}>
                <View style={s.header}>
                    {this.renderInfoButton()}
                    <Text style={s.headerText}>
                        {survey.question}
                    </Text>
                </View>

                <View style={s.inputContainer}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <TextInput
                            onChangeText={this.onChange}
                            onBlur={this.onBlur}
                            value={this.state.value}
                            keyboardType={number ? 'numeric' : 'default'}
                            maxLength={number ? survey.maxLength : 100}
                            placeholder={placeholder}
                            placeholderTextColor='#aaaaaa'
                            style={s.input}
                            underlineColorAndroid='transparent' />
                    </TouchableWithoutFeedback>
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
        fontSize: width <= 320 ? 15 : 17,
        fontFamily: FONT,
        color: '#111',
    },
    inputContainer: {
        backgroundColor: '#ffffff',
        paddingLeft: 40,
        alignItems: 'stretch',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    },
    input: {
        fontFamily: FONT,
        backgroundColor: '#ffffff',
        height: 44
    }
})

// Export
// ======
export default InputField
