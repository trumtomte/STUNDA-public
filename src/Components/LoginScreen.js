// Components
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FONT, getUserCredentials, resetAction } from '../utils'
import { fetchSurveys } from '../ducks/surveys'
import { login, loginFromCache, loginIsntCached } from '../ducks/user'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions
} from 'react-native'

const WIDTH = Dimensions.get('window').width

// Component
// =========
class LoginScreen extends Component {
    static navigationOptions = {
        header: null,
        gesturesEnabled: false
    }

    state = {
        username: '',
        password: '',
        loading: false,
    }

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.props.fetchSurveys()

        getUserCredentials(user => {
            if (user === null || !user.hasOwnProperty('token')) {
                // Doesnt exist
                this.props.loginIsntCached()
            } else {
                // Exists
                this.props.loginWasCached(user, done => {
                    if (done) {
                        this.next(user)
                    } else {
                        this.props.loginIsntCached()
                    }
                })
            }
        })
    }

    onUsernameChange = username => {
        this.setState({ username: username.toLowerCase() })
    }

    onPasswordChange = password => {
        this.setState({ password })
    }

    next = user => {
        if (!user.tos) {
            // User hasnt accepted the terms
            this.props.navigation.dispatch(resetAction('TermsScreen'))
        } else if (!user.startSurvey) {
            // User hasnt done the first survey
            // this.props.navigation.dispatch(resetAction('SurveyStartScreen'))
            this.props.navigation.dispatch(resetAction('TermsScreen', { title: "Samtycke", type: "consent" }))
        } else {
            // User can proceed to the home screen
            this.props.navigation.dispatch(resetAction('HomeScreen'))
        }
    }

    submit = () => {
        const { username, password, loading } = this.state
        const { navigation, login } = this.props

        if (loading || username === '' || password === '') {
            return false
        }

        this.setState({ loading: true }) 

        const done = (d, user) => {
            if (d) {
                this.setState({ loading: false })
                this.next(user)
            } else {
                this.setState({ loading: false, username: '', password: '' })
            }
        }

        login(username, password, done)
    }

    renderLoginForm = () => {
        const { username, password, loading } = this.state

        const bColor = username !== '' && password !== ''
            ? { color: '#0e7afe' }
            : { color: '#999' }

        const loginButton = (
            <TouchableOpacity onPress={this.submit}>
                <Text style={[s.buttonText, bColor]}>
                    Logga in
                </Text>
            </TouchableOpacity>
        )

        return (
            <View style={s.container}>
                <View style={s.header}>
                    <Image
                        source={require('../images/stunda.png')}
                        resizeMode='contain'
                        style={{ maxWidth: 220 }} />
                    <Image
                        source={require('../images/mau.png')}
                        resizeMode='contain'
                        style={s.mau} />
                </View>


                <View style={s.inputsContainer}>
                    <View style={s.inputContainer}>
                        <TextInput
                            style={s.input}
                            value={username}
                            onChangeText={this.onUsernameChange}
                            editable={!loading}
                            autoCapitalize='none'
                            placeholder='Användarnamn'
                            placeholderTextColor='#aaaaaa'
                            underlineColorAndroid='transparent' />
                    </View>

                    <View style={s.inputContainer}>
                        <TextInput
                            style={s.input}
                            value={password}
                            onChangeText={this.onPasswordChange}
                            editable={!loading}
                            autoCapitalize='none'
                            secureTextEntry={true}
                            placeholder='Lösenord'
                            placeholderTextColor='#aaaaaa'
                            underlineColorAndroid='transparent' />
                    </View>
                        
                    <View style={s.buttonContainer}>
                        {loading
                            ? <ActivityIndicator animating={true} size='small' />
                            : loginButton}
                    </View>

                </View>

                <View style={s.error}>
                    {this.props.failedToLogin
                        ? <Text style={s.errorText}>Användarnamn eller lösenord stämmer inte, försök igen.</Text>
                        : null}
                </View>
            </View>
        )
    }

    render() {
        const content = (
            <View style={s.container}>
                {this.props.isCached
                    ? <ActivityIndicator animating={true} size='large' />
                    : this.renderLoginForm()}
            </View>
        )

        // iOS 
        if (Platform.OS === 'ios') {
            return (
                <KeyboardAvoidingView
                    behavior='padding'
                    keyboardVerticalOffset={-100}
                    style={{ flex: 1 }} >
                    {content}
                </KeyboardAvoidingView>
            )
        }

        // Android `onLayout` solves issue with padding
        return (
            <KeyboardAvoidingView
                behavior='padding'
                style={{ flex: 1 }}
                keyboardVerticalOffset={-100}
                onLayout={() => false}>
                {content}
            </KeyboardAvoidingView>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    header: {
        height: WIDTH <= 320 ? 160 : 200,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 4
    },
    mau: {
        maxWidth: 100,
        marginTop: WIDTH <= 320 ? 10 : 28
    },
    error: {
        height: 60,
        alignItems: 'center', 
        justifyContent: 'center'
    },
    errorText: {
        fontSize: WIDTH <= 320 ? 11 : 12,
        color: '#555',
        fontFamily: FONT
    },
    inputsContainer: {
        backgroundColor: '#ffffff',
        paddingLeft: 40,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#aaa',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#aaa' 
    },
    inputContainer: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#aaa'
    },
    input: {
        fontFamily: FONT,
        fontSize: WIDTH <= 320 ? 15 : 18,
        height: 50
    },
    buttonContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20
    },
    buttonText: {
        fontFamily: FONT,
        fontSize: WIDTH <= 320 ? 15 : 18
    }
})

// Export
// ======
export default connect(
    state => ({
        isCached: state.user.isCached,
        failedToLogin: state.user.failedToLogin,
        tos: state.user.tos,
        startSurvey: state.user.startSurvey
    }),
    dispatch => ({
        login: (username, password, done) => {
            dispatch(login(username, password, done))
        },
        loginWasCached: (user, done) => {
            dispatch(loginFromCache(user, done))
        },
        loginIsntCached: () => {
            dispatch(loginIsntCached())
        },
        fetchSurveys: () => {
            dispatch(fetchSurveys())
        }
    })
)(LoginScreen)
