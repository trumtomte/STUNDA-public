// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import {
    StyleSheet,
    View,
    Text,
    Dimensions
} from 'react-native'

const WIDTH = Dimensions.get('window').width

// Component
// =========
class Info extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { survey } = this.props

        return (
            <View style={s.container}>
                <View style={s.header}>
                    <Text style={s.headerText}>
                        {survey.header}
                    </Text>
                </View>
                <View style={s.description}>
                    <Text style={s.descriptionTxt}>
                        {survey.description}
                    </Text>
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
        fontSize: WIDTH <= 320 ? 15 : 18,
        fontFamily: FONT,
        color: '#111',
        textAlign: 'center'
    },
    description: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    descriptionTxt: {
        fontSize: WIDTH <= 320 ? 13 : 16,
        fontFamily: FONT,
        color: '#111',
        lineHeight: WIDTH <= 320 ? 18 : 22
    }
})

// Export
// ======
export default Info
