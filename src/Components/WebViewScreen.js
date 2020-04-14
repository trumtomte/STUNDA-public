// Dependencies
import React, { Component } from 'react'
import { FONT } from '../utils'
import {
    View,
    Text,
    WebView,
    StyleSheet,
    ActivityIndicator
} from 'react-native'

// Component
// =========
class WebViewScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.title,
        headerStyle: {
            elevation: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#aaaaaa'
        },
        headerRight: <View />,
        headerTitleStyle: { fontFamily: FONT, alignSelf: 'center' },
        headerBackTitle: 'Tillbaka',
        headerBackTitleStyle: { fontFamily: FONT }
    })

    constructor(props) {
        super(props)
    }

    renderError = () => {
        return (
            <View style={s.messageContainer}>
                <Text style={s.message}>
                    Ett fel har uppstått, vänligen försök igen.
                </Text>
            </View>
        )
    }

    renderLoading = () => {
        return (
            <View style={s.loader}>
                <ActivityIndicator animating={true} size='large' />
            </View>
        )
    }

    render() {
        const url = this.props.navigation.state.params.url

        return (
            <WebView
                source={{ uri: url }}
                startInLoadingState={true}
                renderLoading={this.renderLoading}
                renderError={this.renderError} />
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    messageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    message: {
        fontFamily: FONT,
        fontSize: 18,
        color: '#333'
    }
})

// Export
// ======
export default WebViewScreen
