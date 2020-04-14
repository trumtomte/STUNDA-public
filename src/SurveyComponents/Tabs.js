// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
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
class Tabs extends Component {
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

    renderListItem = (alt, i, arr) => {
        const selected = this.props.isSelected(i)
        const onPress = () => this.props.select(i, alt.answer)

        const style = {
            backgroundColor: selected ? '#f1f1f1' : '#ffffff',
            width: WIDTH / this.props.survey.perRow,
            borderRightColor: '#dddddd',
            borderRightWidth: ((i + 1) % this.props.survey.perRow) === 0 ? 0 : StyleSheet.hairlineWidth
        }

        return (
            <View key={i} style={[s.item, style]}>
                <TouchableOpacity onPress={onPress} style={s.touchableItem}>
                    <Text style={s.itemText}>
                        {alt.answer}
                    </Text>
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
            ? { paddingTop: 25, paddingBottom: 10 }
            : { paddingVertical: 25 }

        const items = survey.alternatives.map(this.renderListItem) 

        return (
            <View style={[s.container, padding]}>
                <View style={hasHeader ? s.subHeader : s.header}>
                    {this.renderInfoButton()}
                    <Text style={hasHeader ? s.subHeaderText : s.headerText}>
                        {survey.question}
                    </Text>
                </View>

                <View style={s.items}>
                    {items}
                </View>
            </View>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        paddingLeft: WIDTH <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 25,
    },
    subHeader: {
        paddingLeft: WIDTH <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 15,
    },
    headerText: {
        fontSize: WIDTH <= 320 ? 15 : 17,
        fontFamily: FONT,
        color: '#111'
    },
    subHeaderText: {
        // fontSize: WIDTH <= 320 ? 14 : 16,
        fontSize: 14,
        fontFamily: FONT,
        color: '#333',
    },
    items: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#ffffff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    },
    item: {
        height: 44,
        borderTopColor: '#bbb',
        borderTopWidth: StyleSheet.hairlineWidth,
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    itemText: {
        fontSize: WIDTH <= 320 ? 13 : 14,
        fontFamily: FONT,
        color: '#333',
    },
    touchableItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center' 
    }
})

// Export
// ======
export default Tabs
