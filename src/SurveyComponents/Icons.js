// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import IconIonicons from 'react-native-vector-icons/Ionicons'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions
} from 'react-native'

const WIDTH = Dimensions.get('window').width

// Component
// =========
class Icons extends Component {
    constructor(props) {
        super(props)

        if (this.props.currentAnswers !== null) {
            this.props.currentAnswers.forEach(answer => {
                // This needs to be stacked in the call stack otherwise the
                // state wont update properly due to being async
                setTimeout(() => this.props.select(answer[0], answer[1]), 0)
            })
        }
    }

    renderIcon = (alt, i) => {
        const { isSelected, select } = this.props

        const onPress = () => select(i, alt.answer)
        const selected = isSelected(i)
        const bg = { backgroundColor: selected ? '#f1f1f1' : 'transparent' }

        return (
            <View key={i} style={[s.item, bg]}>
                <TouchableOpacity onPress={onPress} style={s.touchableIcon}>
                    <IconIonicons
                        name={alt.icon}
                        size={32}
                        style={{ color: '#333' }} />

                    <View style={{ marginTop: 5 }}>
                        <Text style={s.itemText}>
                            {alt.answer}
                        </Text>
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
        const { survey } = this.props

        return (
            <View style={s.container}>
                <View style={s.header}>
                    {this.renderInfoButton()}
                    <Text style={s.headerText}>
                        {survey.question}
                    </Text>
                </View>
                <View style={s.items}>
                    {survey.alternatives.map(this.renderIcon)}
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
        paddingHorizontal: 40,
        marginBottom: 25,
    },
    headerText: {
        fontSize: WIDTH <= 320 ? 15 : 17,
        fontFamily: FONT,
        color: '#111',
        textAlign: 'center'
    },
    items: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb',
        paddingVertical: 20 
    },
    item: {
        height: 80,
        paddingHorizontal: 10,
        width: (WIDTH / 3) - 20,
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    itemText: {
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 12,
        color: '#333'
    },
    touchableIcon: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})

// Export
// ======
export default Icons
