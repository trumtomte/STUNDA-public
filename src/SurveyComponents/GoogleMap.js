// Dependencies
import React, { Component } from 'react'
import MapView from 'react-native-maps'
import { FONT } from '../utils'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native'

const titleAndStatusBar = Platform.OS === 'ios' ? 64 : 56
const HEIGHT = Dimensions.get('window').height
const WIDTH = Dimensions.get('window').width
const MAP_HEIGHT = HEIGHT - (48 - 15 - 25) - titleAndStatusBar

// Component
// =========
class GoogleMap extends Component {

    constructor(props) {
        super(props)

        if (this.props.currentAnswers === null) {
            // Coordinates is set to the mid area of Malmö
            this.state = {
                markers: [],
                region: {
                    latitude: 55.59871154091297,
                    longitude: 12.998929158279077,
                    latitudeDelta: 0.028876863705846745,
                    longitudeDelta: 0.04797634457744948
                }
            }
        } else {
            const coords = this.props.currentAnswers[0][1].split(':')
            const marker = {
                key: 1,
                coordinate: {
                    latitude: Number(coords[0]),
                    longitude: Number(coords[1])
                }
            }

            this.state = {
                markers: [marker],
                region: {
                    latitude: 55.59871154091297,
                    longitude: 12.998929158279077,
                    latitudeDelta: 0.028876863705846745,
                    longitudeDelta: 0.04797634457744948
                }
            }

            this.props.select(
                this.props.currentAnswers[0][0],
                this.props.currentAnswers[0][1]
            )
        }
    }

    onPress = e => {
        this.setState({
            markers: [{ coordinate: e.nativeEvent.coordinate, key: 1 }]
        })

        const lat = e.nativeEvent.coordinate.latitude
        const lng = e.nativeEvent.coordinate.longitude

        this.props.select(0, `${lat}:${lng}`)
    }

    renderInfoButton = () => {
        if (!this.props.survey.hasOwnProperty('info')) {
            return null
        }

        return this.props.renderInfoButton(this.props.survey.info)
    }

    renderMarker = m => {
        return (
            <MapView.Marker key={m.key} coordinate={m.coordinate} />
        )
    }

    render() {
        const { hasHeader, survey } = this.props

        const markers = this.state.markers.map(this.renderMarker)

        return (
            <View style={s.container}>
                <View style={hasHeader ? s.subHeader : s.header}>
                    {this.renderInfoButton()}
                    <Text style={hasHeader ? s.subHeaderText : s.headerText}>
                        {survey.question}
                    </Text>
                </View>

                <View style={s.map}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={this.state.region}
                        onPress={this.onPress}>
                        {markers} 
                    </MapView>
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
        paddingVertical: 25
    },
    header: {
        paddingLeft: WIDTH <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 25,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: WIDTH <= 320 ? 20 : 40,
        paddingRight: 20,
        marginBottom: 15,
    },
    headerText: {
        fontSize: WIDTH <= 320 ? 15 : 18,
        fontFamily: FONT,
        color: '#111',
    },
    subHeaderText: {
        fontSize: 13,
        fontFamily: FONT,
        color: '#333',
    },
    map: {
        flex: 1,
        height: MAP_HEIGHT,
        alignItems: 'stretch', 
        justifyContent: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#bbb'
    }
})

// Export
// ======
export default GoogleMap
