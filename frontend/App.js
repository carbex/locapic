import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);

import React from 'react';

import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import MapScreen from './screens/MapScreen'
import ListPoiScreen from './screens/ListPoiScreen'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons  } from '@expo/vector-icons';

import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import pseudo from './reducers/pseudo'
import list from './reducers/list'

const store = createStore(combineReducers( { pseudo, list } ))

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Composant de navigation Tab
const  TabNavigator = () => {
  return(   
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => {
            let iconName;
    
            if (route.name === 'Map') {
              iconName = 'navigate-outline';
            } else if (route.name === 'Chat') {
              iconName = 'chatbubbles-outline';
            } else if (route.name === 'List') {
              iconName = 'list-outline';
            }
    
            return <Ionicons name={iconName} size={25} color={color} />;
          },
        })}
        tabBarOptions={{
          style: {
            backgroundColor: '#130f40',
          },
          activeTintColor: '#eb4d4b',
          inactiveTintColor: '#FFFFFF',
        }}
      >
        <Tab.Screen name="Map" component={MapScreen} />       
        <Tab.Screen name="List" component={ListPoiScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
      </Tab.Navigator>
   
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator  screeOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
          <Stack.Screen name="TabNavigator" component={TabNavigator} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

