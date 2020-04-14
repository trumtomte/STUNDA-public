// Dependencies
import React, { Component } from 'react'
import { FONT, resetAction } from '../utils'
import { connect } from 'react-redux'
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
class SurveyDoneScreen extends Component {
    static navigationOptions = {
        title: 'Enkät inskickad',
        headerLeft: <View />,
        headerRight: <View />,
        headerStyle: {
            elevation: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#aaaaaa'
        },
        headerTitleStyle: { fontFamily: FONT, alignSelf: 'center' },
        headerBackTitleStyle: { fontFamily: FONT },
        geturesEnabled: false
    }

    constructor(props) {
        super(props)
    }

    home = () => {
        this.props.navigation.dispatch(resetAction('HomeScreen'))
    }

    render() {
        return (
            <View style={s.container}>
                <View style={s.innerContainer}>
                    <IconIonicons
                        name='ios-checkmark-circle-outline'
                        size={60}
                        color='#444' />

                    <View style={s.textContainer}>
                        <Text style={s.messageText}>
                            {this.props.navigation.state.params.success
                                ? 'Dina svar har skickats'
                                : 'Dina svar skickas så fort uppkopplingen fungerar'}
                        </Text>
                    </View>
                </View>


                <View style={s.buttonContainer}>
                    <View style={s.button}>
                        <TouchableOpacity style={s.touchableButton} onPress={this.home}>
                            <Text style={s.buttonText}>
                                Klar
                            </Text>
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
        alignItems: 'center',
        justifyContent: 'center' 
    },
    innerContainer: {
        flex: 1,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center' 
    },
    textContainer: {
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center' 
    },
    messageText: {
        fontSize: 20,
        fontFamily: FONT,
        color: '#222'
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        maxHeight: 48,
        backgroundColor: '#f7f7f7',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0, 0, 0, 0.3)'
    },
    button: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: FONT,
        color: '#0e7afe',
        fontSize: WIDTH <= 320 ? 16 : 18
    },
    touchableButton: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20 
    }
})

// Export
// ======
export default connect(null)(SurveyDoneScreen)
