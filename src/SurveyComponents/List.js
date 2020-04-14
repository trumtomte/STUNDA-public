// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import IconIonicons from 'react-native-vector-icons/Ionicons'
import {
    View,
    Text,
    Keyboard,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class List extends Component {
    constructor(props) {
        super(props)

        if (this.props.currentAnswers === null) {
            this.state = { inputs: {} }
        } else {
            this.state = {
                inputs: this.props.currentAnswers.reduce((acc, answer) => {
                    acc[answer[0]] = answer[1]
                    // This needs to be stacked in the call stack otherwise the
                    // state wont update properly due to being async
                    setTimeout(() => this.props.select(answer[0], answer[1]), 0)
                    return acc
                }, {})
            }
        }
    }

    onChange = a => value => {
        const inputs = { ...this.state.inputs, [a]: value }
        this.setState({ inputs })
    }

    onBlur = (a, i, selected) => () => {
        // The user hasnt typed anything yet
        if (!this.state.inputs.hasOwnProperty(a)) {
            return
        }

        // If it isnt selected and the input isnt empty select it
        if (!selected && this.state.inputs[a] !== '') {
            this.props.select(i, this.state.inputs[a])
        }

        // If it still is selected, update it (`update:content`)
        if (selected && this.state.inputs[a] !== '') {
            this.props.select(i, `update:${this.state.inputs[a]}`)
        }

        // Remove if selected and the input becomes an empty string
        if (selected && this.state.inputs[a] === '') {
            this.props.select(i, '')
        }
    }

    renderListItem = (alt, i, arr) => {
        const selected = this.props.isSelected(i)
        const isLast = i === (arr.length - 1)
        const last = isLast ? { borderBottomWidth: 0 } : {}
        const bg = selected ? { backgroundColor: '#f7f7f7' } : {}
        const touchableBorder = { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }
        const iconColor = selected ? '#0e7afe' : '#444'
        const iconName = selected ? 'ios-checkmark-circle' : 'ios-radio-button-off'

        // Editable text field
        if (alt.editable) {
            const value = this.state.inputs.hasOwnProperty(i)
                ? this.state.inputs[i]
                : ''

            // NOTE 
            const blur = this.onBlur(i, i, selected)

            return (
                <View key={i} style={[s.item, last, bg]}>
                    <View style={[s.touchableItem, touchableBorder]}>

                        <View style={s.itemContainer}>
                            <View style={s.itemTxtContainer}>
                                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                    <TextInput
                                        onChangeText={this.onChange(i)}
                                        onBlur={blur}
                                        value={value}
                                        keyboardType='default'
                                        maxLength={50}
                                        placeholder={alt.answer}
                                        placeholderTextColor='#aaaaaa'
                                        style={s.input}
                                        underlineColorAndroid='transparent' />
                                </TouchableWithoutFeedback>
                            </View>

                            <View style={s.icon}>
                                <IconIonicons
                                    size={18}
                                    color={iconColor}
                                    name={iconName} />
                            </View>
                        </View>
                    </View>
                </View>
            )
        }

        const onPress = () => this.props.select(i, alt.answer)

        return (
            <View key={i} style={[s.item, last, bg]}>
                <TouchableOpacity
                    onPress={onPress}
                    style={[s.touchableItem, touchableBorder]}>

                    <View style={s.itemContainer}>
                        <View style={s.itemTxtContainer}>
                            <Text style={s.itemTxt}>
                                {alt.answer}
                            </Text>
                        </View>

                        <View style={s.icon}>
                            <IconIonicons
                                size={18}
                                color={iconColor}
                                name={iconName} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    renderInfoButton = () => {
        if (!this.props.survey.hasOwnProperty('info')) {
            return null
        }

        return this.props.renderInfoButton(this.props.survey.info)
    }

    render() {
        const { hasHeader, survey } = this.props

        const padding = hasHeader
            ? { paddingTop: 25, paddingBottom: 10 }
            : { paddingVertical: 25 }

        return (
            <View style={[s.container, padding]}>
                <View style={hasHeader ? s.subHeader : s.header}>
                    {this.renderInfoButton()}
                    <Text style={hasHeader ? s.subHeaderText : s.headerText}>
                        {survey.question}
                    </Text>
                </View>
                <View style={s.items}>
                    {survey.alternatives.map(this.renderListItem)}
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
        alignItems: 'stretch'
    },
    header: {
        paddingLeft: width <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 25,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: width <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 15,
    },
    headerText: {
        fontSize: width <= 320 ? 15 : 17,
        fontFamily: FONT,
        color: '#111',
    },
    subHeaderText: {
        fontSize: 14,
        fontFamily: FONT,
        color: '#333',
    },
    items: {
        backgroundColor: '#ffffff',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    },
    itemContainer: {
        flexDirection: 'row'
    },
    item: {
        paddingLeft: 40,
        height: 44,
        justifyContent: 'center',
    },
    itemTxtContainer: {
        flex: 1
    },
    itemTxt: {
        fontSize: width <= 320 ? 13 : 14,
        fontFamily: FONT,
        color: '#111'
    },
    touchableItem: {
        flex: 1,
        justifyContent: 'center',
        borderBottomColor: '#bbb',
        paddingRight: 20
    },
    icon: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        maxWidth: 40
    },
    input: {
        fontSize: width <= 320 ? 13 : 14,
        fontFamily: FONT,
        color: '#111',
        height: 44
    }
})

// Export
// ======
export default List
