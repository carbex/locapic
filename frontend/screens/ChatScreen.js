import React, { useState, useEffect, useRef } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { ListItem, Input, Button } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import socketIOClient from "socket.io-client";
import { connect } from 'react-redux';

// var socket = socketIOClient("http://172.17.1.134:3000");
var socket = socketIOClient('http://192.168.1.31:3000')

function ChatScreen(props) {

  const [currentMessage, setCurrentMessage] = useState(null)
  const [listMessage, setListMessage] = useState([])

  var scrollView = useRef(null)

  useEffect(() => {

    socket.on('sendMessageToAll', (message) => {

      // console.log(message)

      var newMessage = { ...message }
      var regex = [/:\)/g, /:\(/g, /:p/g, /fu[a-z]*ck[a-z]*/ig]
      var emojis = ['\u263A', '\u2639', '\uD83D\uDE1D', '\u2022\u2022\u2022']
      var isModified = false
      for (let i = 0; i < regex.length; i++) {
        if (regex[i].test(message.content)) {
          newMessage = { content: newMessage.content.replace(regex[i], emojis[i]), pseudo: newMessage.pseudo };
          isModified = true
        }
      }
      if (!isModified) {
        newMessage = message
      }

      let newListMessage = [...listMessage, newMessage]
      setListMessage(newListMessage)
      setCurrentMessage(null)
    });
  }, [listMessage]);

  let newListMessage = listMessage.map((message, i) => {

    let date = new Date()
    let listItemContentStyle = {}
    let listItemPseudoStyle = {}
    if (message.pseudo === props.pseudo) {
      listItemPseudoStyle = { display: 'none' }
      listItemContentStyle = { color: 'white', marginLeft: 'auto', backgroundColor: '#8b9dc3', padding: 6, borderRadius: 4 }
    } else {
      listItemPseudoStyle = { color: 'white', fontWeight: 'bold' }
      listItemContentStyle = { color: 'white', backgroundColor: '#C60000', padding: 6, borderRadius: 4 }
    }
    return <ListItem key={i} >
      <ListItem.Content style={{ padding: 0, margin: 0, borderRadius: 4 }}>
        <ListItem.Title style={listItemPseudoStyle} >{message.pseudo}</ListItem.Title>
        <ListItem.Subtitle style={listItemContentStyle} >{message.content} {date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  })

  return (
    <View style={{ flex: 1, justifyContent: "space-between", marginTop: 50 }}>
      <ScrollView ref={ref => { scrollView = ref }}
        onContentSizeChange={() => scrollView.scrollToEnd({ animated: true })}
      >
        {newListMessage}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Input placeholder='Your message' onChangeText={(value) => setCurrentMessage(value)} value={currentMessage} />
        <Button
          buttonStyle={{ backgroundColor: '#C60000' }}
          icon={<Ionicons name="mail-outline" size={20} color="white" />}
          title=" Send"
          onPress={() => { if (currentMessage) { socket.emit("sendMessage", { content: currentMessage, pseudo: props.pseudo }) } }}

        // onKeyPress={(event) => {if(event.charCode === 13){socket.emit("sendMessage", {content: currentMessage, pseudo: props.pseudo})}}}
        />
      </KeyboardAvoidingView>


    </View>
  );
}

function mapStateToProps(state) {
  return {
    pseudo: state.pseudo
  }
}

export default connect(
  mapStateToProps,
  null
)(ChatScreen)