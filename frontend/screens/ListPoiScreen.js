import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ListItem, Input, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';


function ListPoiScreen(props) {

    useEffect(() => {
        const getItem = async () => {
            await AsyncStorage.setItem('position', JSON.stringify(props.listPoi))
        }
        getItem()
    }, [props.listPoi])


    return (
        <View style={{ flex: 1, justifyContent: "space-between", marginTop: 50 }}>
            <ScrollView>
                {
                    props.listPoi.map((l, i) => (
                        <ListItem key={i} bottomDivider onPress={() => { props.deleteItemToStoreList(i) }}>
                            <ListItem.Content>
                                <ListItem.Title>{l.title}</ListItem.Title>
                                <ListItem.Subtitle>{l.description}</ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    ))
                }
            </ScrollView>
        </View>
    );
}

function mapStateToProps(state) {
    return {
        listPoi: state.list
    }
}

function mapDispatchToProps(dispatch) {
    return {
        deleteItemToStoreList: function (index) {
            dispatch({ type: 'deleteItemFromList', index })
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ListPoiScreen)




