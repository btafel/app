import React from 'react';
import { View, Button, Text } from 'react-native';
import { MapStackNavProps } from './MapStack';
import { mapInfoStyles } from './mapStyles';

export default function MapInfo({ navigation }: MapStackNavProps<'MapInfo'>) {
  return (
    <View style={mapInfoStyles.container}>
      <Text style={{ fontSize: 26, paddingTop: 70 }}>
        Información sobre el mapa
      </Text>
      <View style={mapInfoStyles.content}>
        <View style={mapInfoStyles.counterContainer}>
          <View style={[mapInfoStyles.circle, mapInfoStyles.positive]}>
            <Text style={mapInfoStyles.counter}>2763</Text>
          </View>
          <Text style={mapInfoStyles.text}>Recuperados</Text>
        </View>
        <View style={mapInfoStyles.counterContainer}>
          <View style={[mapInfoStyles.circle, mapInfoStyles.neutral]}>
            <Text style={mapInfoStyles.counter}>2763</Text>
          </View>
          <Text style={mapInfoStyles.text}>Casos detectados</Text>
        </View>
        <View style={mapInfoStyles.counterContainer}>
          <View style={[mapInfoStyles.circle, mapInfoStyles.negative]}>
            <Text style={mapInfoStyles.counter}>2763</Text>
          </View>
          <Text style={mapInfoStyles.text}>Fallecidos</Text>
        </View>
      </View>
      <Button onPress={() => navigation.goBack()} title="Cerrar" />
    </View>
  );
}

