import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Input, Button, Overlay } from 'react-native-elements'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketIOClient from "socket.io-client";

// var socket = socketIOClient("http://172.17.1.134:3000");
var socket = socketIOClient("http://192.168.1.31:3000");


function MapScreen(props) {

  const [position, setPosition] = useState({ latitude: 48.858370, longitude: 2.294481 });
  const [currentLatitude, setCurrentLatitude] = useState(48.858370)
  const [currentLongitude, setCurrentLongitude] = useState(2.294481)
  const [errorMsg, setErrorMsg] = useState(null);
  const [addPOI, setAddPOI] = useState(false)
  const [tempListPOI, setTempListPOI] = useState({})
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listForeignMarker, setListForeignMarker] = useState([])

  console.log('\x1b[33m%s\x1b[0m', 'console.log(listForeignMarker) -----> ', listForeignMarker)

  // Récupère la position des autres utilisateurs de l'app

  useEffect(() => {

    socket.on('sendUserPositionToAll', (position) => {
      let listForeignMarkerCopy = [...listForeignMarker]
      listForeignMarkerCopy = listForeignMarkerCopy.filter(e => e.pseudo != position.pseudo)
      listForeignMarkerCopy.push(position)
      setListForeignMarker(listForeignMarkerCopy)
    });

  }, [position])



  // Permission d'utiliser la géolocalisation && suivi en temps réel de la position à l'initialisation de l'app

  useEffect(() => {

    const locationPermit = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      await Location.watchPositionAsync({ distanceInterval: 10 },
        (location) => {
          // console.log('WatchPositionAsync -----> ', position)
          setPosition(location);
          setCurrentLatitude(location.coords.latitude)
          setCurrentLongitude(location.coords.longitude)
          socket.emit("sendUserPosition", { latitude: location.coords.latitude, longitude: location.coords.longitude, pseudo: props.pseudo })
        }
      )
    }

    const getItem = async () => {
      await AsyncStorage.getItem('position',
        function (error, data) {
          var locationData = JSON.parse(data)
          if (locationData) {
            // console.log('-----------------> ', locationData) 
            for (let i = 0; i < locationData.length; i++) {
              props.onSubmitList(locationData[i])
            }
          }
        })
    }

    locationPermit()
    getItem()

  }, []);



  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (position) {
    text = JSON.stringify(position);
  }

  // Set de l'état visible de l'overlay (modal)

  const toggleOverlay = () => {
    setVisible(!visible);
  }

  // Au click sur le bouton "enregistrer" de l'overlay

  let onPressRegister = () => {
    props.onSubmitList({ latitude: tempListPOI.latitude, longitude: tempListPOI.longitude, title: title, description: description })
    AsyncStorage.setItem('position', JSON.stringify([...props.listPoi, { latitude: tempListPOI.latitude, longitude: tempListPOI.longitude, title: title, description: description }]))
    setAddPOI(!addPOI)
    setTitle('')
    setDescription('')
    toggleOverlay()
  }

  // Au click sur la map

  let onPressMap = (event) => {
    if (addPOI) {
      let newTempListPOI = event.nativeEvent.coordinate
      setTempListPOI(newTempListPOI)
      toggleOverlay()
    }
  }

  // Mapping du tableau de POI

  let newListPoi = props.listPoi.map((poi, i) => {
    return <Marker
      key={i}
      title={poi.title}
      description={poi.description}
      coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
      pinColor={'blue'}
    />
  })

  // Mapping du tableau des users

  let newListForeignMarker = listForeignMarker.map((user, i) => {
    return <Marker
      key={i}
      title={user.pseudo}
      coordinate={{ latitude: user.latitude, longitude: user.longitude }}
      pinColor={'green'}
    />
  })

  return (
    <View style={styles.container}>
      <MapView style={styles.mapView}
        initialRegion={{
          latitude: 48.866667,
          longitude: 2.333333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(event) => onPressMap(event)}
      >
        <Marker
          coordinate={{ latitude: currentLatitude, longitude: currentLongitude }}
          title='Hello'
          description='I am here'
          pinColor={'red'}
        />
        {newListPoi}
        {newListForeignMarker}
      </MapView>
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <View style={{ width: 200, height: 200 }}>
          <Input
            placeholder='Titre'
            containerStyle={{ width: '100%' }}
            onChangeText={(value) => setTitle(value)}
            value={title}
          />
          <Input
            placeholder='Description'
            containerStyle={{ width: '100%' }}
            onChangeText={(value) => setDescription(value)}
            value={description}
          />

          <Button
            title="Enregistrer"
            type='solid'
            onPress={() => onPressRegister()}
          />
        </View>
      </Overlay>
      <Button
        buttonStyle={{ backgroundColor: '#C60000' }}
        icon={<MaterialCommunityIcons name="map-marker-outline" size={20} color="white" />}
        title=" Add POI"
        onPress={() => setAddPOI(!addPOI)}
        disabled={addPOI}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  mapView: {
    flex: 1
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

function mapStateToProps(state) {
  return {
    listPoi: state.list,
    pseudo: state.pseudo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmitList: function (list) {
      dispatch({ type: 'saveList', list })
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapScreen)