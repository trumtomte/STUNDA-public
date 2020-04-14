// Dependencies
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FONT } from '../utils'
import { logout } from '../ducks/user'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

// Component
// =========
class LogoutButton extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <TouchableOpacity onPress={this.props.logout} style={s.button}>
                <Text style={s.text}>
                    Avbryt
                </Text>
            </TouchableOpacity>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15
    },
    text: {
        fontSize: 16,
        fontFamily: FONT,
        color: '#0e7afe'
    }
})

// Export
// ======
export default connect(
    null,
    dispatch => ({
        logout: () => {
            dispatch(logout())
        }
    })
)(LogoutButton)

