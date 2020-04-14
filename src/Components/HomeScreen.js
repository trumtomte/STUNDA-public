// Dependencies
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FONT, scheduleNotifications, clearAllNotifications } from '../utils'
import { setCurrentSurvey } from '../ducks/survey'
import { logout, allowNotifications } from '../ducks/user'
import IconIonicons from 'react-native-vector-icons/Ionicons'
import {
    View,
    Text,
    Alert,
    Image,
    Platform,
    AppState,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native'

const { width } = Dimensions.get('window')

// Component
// =========
class HomeScreen extends Component {
    static navigationOptions = {
        title: 'Hem',
        headerStyle: {
            backgroundColor: '#E9E9EF',
            borderBottomColor: '#E9E9EF',
            elevation: 0
        },
        headerTitleStyle: { fontFamily: FONT, color: '#E9E9EF' },
        headerBackTitleStyle: { fontFamily: FONT },
        gesturesEnabled: false
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // Call this since it wont be invoked if the app was completely closed
        this.props.screenProps.handleAppOpened()
    }

    startSurvey = type => () => {
        // If a survey wasn't fetched
        if (!this.props.surveys.hasOwnProperty(type)) {
            Alert.alert(
                'Felmeddelande',
                'Ett fel uppstod när enkäten skulle öppnas, försök igen.',
                [{ text: 'OK' }]
            )
            return
        }

        const steps = this.props.surveys[type].steps

        this.setState({ message: '' })
        this.props.setCurrentSurvey(type)
        this.props.navigation.navigate('SurveyScreen', { type, steps, step: 1 })
    }

    openMoreInfo = () => {
        this.props.navigation.navigate('WebViewScreen', {
            title: 'Mer Information',
            url: 'https://mah.se/stunda'
        })
    }

    toggleNotifications = async () => {
        if (this.props.notifications) {
            this.props.allowNotifications(false)
            clearAllNotifications()

            Alert.alert(
                'Notifikationer',
                'Notifikationer behöver vara aktiva för att vi ska kunna meddela dig när det är dags att besvara enkäter',
                [{ text: 'OK' }]
            )
        } else {
            this.props.allowNotifications(true)

            const allowed = await scheduleNotifications()

            if (allowed) {
                Alert.alert(
                    'Notifikationer',
                    'Notifikationer är nu aktiverade',
                    [{ text: 'OK' }]
                )
            } else {
                Alert.alert(
                    'Notifikationer',
                    'Notifikationer behöver vara aktiva för att vi ska kunna meddela dig när det är dags att besvara enkäter',
                    [{ text: 'OK' }]
                )
            }
        }
    }

    logout = () => {
        Alert.alert(
            'Är du säker?',
            'Vid utloggning måste du ange dina inloggningsuppgifter igen för att kunna besvara enkäter',
            [
                { text: 'Avbryt' },
                { text: 'Logga ut', onPress: this.props.logout }
            ]
        )
    }

    renderButton = (onPress, text, color = '#0e7afe') => {
        const loading = this.props.pending
        const click = loading ? () => false : onPress

        return (
            <View style={s.button}>
                <TouchableOpacity style={s.touchableButton} onPress={click}>
                    <Text style={[s.buttonText, { color }]}>
                        {text}
                    </Text>

                    <View style={s.icon}>
                        {loading
                            ? <ActivityIndicator size='small' animating={true} />
                            : <IconIonicons name='ios-arrow-forward' size={18} color='#bbb' />}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    // Temporary hack for apple developers
    isAppleDeveloper = () => {
        return this.props.userID === 12
    }

    render() {
        const startESM = this.props.esmIsAvailable || this.isAppleDeveloper()
            ? this.startSurvey('esm')
            : () => false

        const startManual = this.props.esmIsAvailable
            ? () => false 
            : this.startSurvey('manual')

        const startRetrospective = this.startSurvey('retrospective')

        return (
            <View style={s.container}>
                <View style={s.innerContainer}>

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

                    <View style={s.buttons}>
                        {this.renderButton(
                            startESM,
                            'Snabbenkät',
                            this.props.esmIsAvailable || this.isAppleDeveloper() ? '#0e7afe' : '#999'
                        )}

                        {this.renderButton(
                            startManual,
                            'Händelserapportering',
                            this.props.esmIsAvailable ? '#999' : '#0e7afe'
                        )}

                        {this.renderButton(
                            startRetrospective,
                            'Daglig enkät'
                        )}

                        <View style={s.buttonNoBorder}>
                            <TouchableOpacity onPress={this.openMoreInfo} style={s.touchableButton}>
                                <Text style={s.buttonText}>Mer information</Text>
                                <View style={s.icon}>
                                    <IconIonicons
                                        name='ios-information-circle-outline'
                                        size={20}
                                        color='#999' />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={s.support}>
                        <Text style={s.supportTxt}>
                            För support kontakta stunda@mau.se
                        </Text>
                    </View>
                </View>

                <View style={s.notice}>
                    {this.props.notifications
                        ? null
                        : <Text style={s.noticeText}>Aktivera notifikationer för att kunna besvara snabbenkäten</Text>}
                </View>

                <View style={s.bottom}>
                    <View style={s.logout}>
                        <TouchableOpacity onPress={this.toggleNotifications}>
                            <View style={s.activateNotifInner}>
                                <View style={{ marginRight: 10 }}>
                                    <Text style={s.logoutText}>Notifikationer</Text>
                                </View>
                                <IconIonicons
                                    size={20}
                                    style={{ marginTop: 3 }}
                                    color={this.props.notifications ? '#5a5' : '#777'}
                                    name={this.props.notifications ? 'ios-radio-button-on' : 'ios-radio-button-off'} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={s.logout}>
                        <TouchableOpacity onPress={this.logout}>
                            <Text style={s.logoutText}>Logga ut</Text>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    innerContainer: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center' 
    },
    header: {
        height: width <= 320 ? 160 : 200,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 4
    },
    mau: {
        maxWidth: 100,
        marginTop: width <= 320 ? 10 : 28
    },
    buttons: {
        backgroundColor: '#ffffff',
        paddingLeft: 40,
        paddingBottom: 1,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb' 
    },
    button: {
        height: 48,
        justifyContent: 'center',
        paddingRight: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb'
    },
    buttonNoBorder: {
        height: 48,
        justifyContent: 'center',
        paddingRight: 16
    },
    buttonText: {
        fontFamily: FONT,
        color: '#0e7afe',
        fontSize: width <= 320 ? 15 : 18
    },
    touchableButton: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row' 
    },
    icon: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center' 
    },
    logout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontFamily: FONT,
        color: '#555'
    },
    notice: {
        height: 30,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    noticeText: {
        fontFamily: FONT,
        fontSize: width <= 320 ? 11 : 12,
        color: '#555'
    },
    support: {
        height: 32,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    supportTxt: {
        fontFamily: FONT,
        fontSize: width <= 320 ? 11 : 12,
        color: '#333'
    },
    bottom: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: 80
    },
    activateNotifInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center' 
    }
})

// Export
// ======
export default connect(
    state => ({
        surveys: state.surveys.data,
        pending: state.surveys.pending,
        esmIsAvailable: state.survey.esmIsAvailable,
        notifications: state.user.notifications,
        userID: state.user.id
    }),
    dispatch => ({
        logout: () => {
            dispatch(logout())
        },
        allowNotifications: allow => {
            dispatch(allowNotifications(allow))
        },
        setCurrentSurvey: t => {
            dispatch(setCurrentSurvey(t))
        }
    })
)(HomeScreen)
