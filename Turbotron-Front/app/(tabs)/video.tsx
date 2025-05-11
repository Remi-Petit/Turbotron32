import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  // Expo web n'est pas compatible avec WebView.
  // Donc on utilise iframe pour la version web.
  
  return Platform.OS === "web" ? (
    <iframe src="http://192.168.0.50:7000" style={styles.videoIframe} />
  ) : (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: "http://192.168.0.50:7000" }}
        style={styles.videoIframe}
      />
    </View>
  )
};

export default App;

const BACKGROUND_COLOR = "#161616"; //191A19
const BUTTON_COLOR = "#346751"; //1E5128
const ERROR_COLOR = "#C84B31"; //4E9F3D
const TEXT_COLOR = "#ECDBBA"; //D8E9A8
const styles = StyleSheet.create({
  mainTitle: {
    color: TEXT_COLOR,
    fontSize: 30,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: ERROR_COLOR,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoIframe: { 
    width: '100%', 
    height: 1000,
  },
});
