import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReactNativeJoystick } from '@korsolutions/react-native-joystick';

const App = () => {
  const [joystickCoordsRepere, setJoystickCoordsRepere] = useState({ x: 0, y: 0 });
  const [force, setForce] = useState(0);
  const [dataAngle, setDataAngle] = useState(0);
  const [radian, setRadian] = useState(0);
  const [ws, setWs] = useState(null);
  const [wsInformations, setWsInformations] = useState("");

  useEffect(() => {
    const websocket = new WebSocket('ws://192.168.0.50/ws'); // Remplacez par l'adresse IP de votre ESP32

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setWs(websocket);
      setWsInformations("Connected to WebSocket server")
    };

    websocket.onmessage = (event) => {
      console.log('Received:', event.data);
      setWsInformations('Received:')
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setWsInformations('Disconnected from WebSocket server')
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsInformations('WebSocket error')
    };

    return () => {
      websocket.close();
    };
  }, []);

  const sendCommand = (command) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
    }
  };

  const handleJoystickMove = (data) => {
    const { position, angle, force } = data;
    const { screenX, screenY } = position;
    const { degree, radian } = angle;

    // Normalize joystick coordinates to [-100, 100]
    const normalizedX = (screenX / 3 * 2 * 100);
    const normalizedY = (screenY / 3 * 2 * 100);
    const normalizedForce = (force / 3 * 2 * 100);

    setJoystickCoordsRepere({ x: normalizedX, y: normalizedY });
    setForce(normalizedForce);
    setDataAngle(degree);
    setRadian(radian);
  };

  useEffect(() => {
    // Determine the speed from the force percentage
    const maxSpeed = 4000;
    const speed = (force / 100) * maxSpeed;

    // Determine the differential for turning, invert the x-axis control
    const differential = (-joystickCoordsRepere.x / 100) * maxSpeed;

    // Calculate wheel speeds
    const leftSpeed = speed - differential;
    const rightSpeed = speed + differential;

    const command = {
      cmd: 1,
      data: [
        Math.round(leftSpeed),
        Math.round(leftSpeed),
        Math.round(rightSpeed),
        Math.round(rightSpeed),
      ]
    };

    sendCommand(command);
  }, [joystickCoordsRepere, force]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#038ac9' }}>
      <ReactNativeJoystick onMove={handleJoystickMove} onStop={handleJoystickMove} backgroundColor="#d9d9d9" color="#959292" radius={75}/>
      <Text>Coordonnées du joystick : ({joystickCoordsRepere.x.toFixed(2)}, {joystickCoordsRepere.y.toFixed(2)})</Text>
      <Text>Force : {force}%</Text>
      <Text>Angle : ({dataAngle})</Text>
      <Text>Radian : ({radian})</Text>
      <Text>Websocket info : {wsInformations}</Text>
    </View>
  );
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
});