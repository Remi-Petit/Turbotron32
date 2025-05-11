import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SVGRenderer, SkiaChart, SvgChart } from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import mqtt from 'mqtt';

// MQTT Configuration
const MQTT_URL = 'ws://82.64.159.229:9001'; // Utilisez 'ws' pour WebSocket
const MQTT_TOPICS = ['esp32/track', 'esp32/sonar', 'esp32/light'];

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  LineChart,
]);

const E_HEIGHT = 250;
const E_WIDTH = Dimensions.get('screen').width;

function SkiaComponent({ option }) {
  const skiaRef = useRef(null);

  useEffect(() => {
    let chart;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'svg',
        width: E_WIDTH,
        height: E_HEIGHT,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [option]);

  return <SkiaChart ref={skiaRef} />;
}

function App() {
  const [trackData, setTrackData] = useState([]);
  const [sonarData, setSonarData] = useState([]);
  const [lightData, setLightData] = useState([]);

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL);
    
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      MQTT_TOPICS.forEach((topic) => client.subscribe(topic));
    });

    client.on('message', (topic, message) => {
      const payload = parseFloat(message.toString());
      switch (topic) {
        case 'esp32/track':
          setTrackData((prevData) => [...prevData, payload]);
          break;
        case 'esp32/sonar':
          setSonarData((prevData) => [...prevData, payload]);
          break;
        case 'esp32/light':
          setLightData((prevData) => [...prevData, payload]);
          break;
        default:
          break;
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const option_track = {
    xAxis: {
      type: 'category',
      data: trackData.map((_, index) => index + 1),
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        name: 'Track',
        data: trackData,
        type: 'line',
      },
    ],
  };
  const option_sonar = {
    xAxis: {
      type: 'category',
      data: trackData.map((_, index) => index + 1),
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        name: 'Sonar',
        data: sonarData,
        type: 'line',
      },
    ],
  };
  const option_light = {
    xAxis: {
      type: 'category',
      data: trackData.map((_, index) => index + 1),
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        name: 'Light',
        data: lightData,
        type: 'line',
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text>Track :</Text>
      <SkiaComponent option={option_track} />
      <Text>Sonar :</Text>
      <SkiaComponent option={option_sonar} />
      <Text>Light :</Text>
      <SkiaComponent option={option_light} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default gestureHandlerRootHOC(App);
