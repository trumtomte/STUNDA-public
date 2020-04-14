// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import {
    StyleSheet,
    View,
    Text,
    Picker,
    Dimensions
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class PickerField extends Component {
    constructor(props) {
        super(props)
        
        // First index accessor (0) is used because this component doesnt allow multiple choices
        this.state = {
            value: this.props.currentAnswers !== null
                ? this.props.currentAnswers[0][1]
                : 'default'
        }

        // If we already have an answer, lets initialize this component with it
        if (this.props.currentAnswers !== null) {
            this.props.select(
                this.props.currentAnswers[0][0], // index
                this.props.currentAnswers[0][1]  // value
            )
        }
    }

    onChange = value => {
        this.setState({ value })
        this.props.select(0, value === 'default' ? '' : value)
    }

    renderInfoButton = () => {
        if (!this.props.survey.hasOwnProperty('info')) {
            return null
        }

        return this.props.renderInfoButton(this.props.survey.info)
    }

    renderPickerItem = (v, i) => {
        return (
            <Picker.Item key={i} label={v} value={v} />
        )
    }

    render() {
        const { survey } = this.props

        const items = survey.values.map(this.renderPickerItem)

        return (
            <View style={s.container}>
                <View style={s.header}>
                    {this.renderInfoButton()}
                    <Text style={s.headerText}>
                        {survey.question}
                    </Text>
                </View>

                <View style={s.inputContainer}>
                    <Picker
                        selectedValue={this.state.value}
                        onValueChange={this.onChange}>
                        <Picker.Item label={survey.label} value='default' />
                        {items}
                    </Picker>
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
        alignItems: 'stretch',
        paddingHorizontal: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    }
})

// Export
// ======
export default PickerField
