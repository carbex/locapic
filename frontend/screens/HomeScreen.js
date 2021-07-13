import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function HomeScreen(props) {

    const [pseudo, setPseudo] = useState('');
    const [tempPseudo, setTempPseudo] = useState('')

    // Récupération du pseudo enregistré dans le AsyncStorage
    useEffect(() => {

        const getItem = async () => {
            await AsyncStorage.getItem('user',
                function (error, data) {
                    // console.log(data)
                    var userData = JSON.parse(data)
                    // console.log(userData)
                    if (userData) {
                        setTempPseudo(userData.pseudo)
                        setPseudo(userData.pseudo)
                    }
                })
        }
        getItem()

    }, [])


    // Affiche ou nom le champ de saisie en fonction de l'existence du pseudo dans le AsyncStorage
    let input
    if (tempPseudo) {
        input = <Text style={{ padding: 10, color: 'red' }}>Welcome back {tempPseudo} !</Text>
    } else {
        input = <Input
            containerStyle={{ marginBottom: 25, width: '70%' }}
            leftIcon={<AntDesign name="user" size={24} color="red" />}
            onChangeText={(value) => setPseudo(value)}
            value={pseudo}
        />
    }

    return (
        <ImageBackground source={require('../assets/home.jpg')} style={styles.image}>

            {input}

            <Button
                icon={<Ionicons name="arrow-forward-circle-outline" size={24} color="red" />}
                title=" Go to Map"
                type='solid'
                onPress={() => { AsyncStorage.setItem('user', JSON.stringify({ pseudo: pseudo })); props.onSubmitPseudo(pseudo); props.navigation.navigate('TabNavigator', { screen: 'Map' }) }}
            />

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: 'center'
    }
});

function mapDispatchToProps(dispatch) {
    return {
        onSubmitPseudo: function (pseudo) {
            dispatch({ type: 'savePseudo', pseudo })
        }
    }
}

export default connect(
    null,
    mapDispatchToProps
)(HomeScreen)
