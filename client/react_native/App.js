import React from "react";
import { StyleSheet } from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

export default function App() {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      styleURL="https://demotiles.maplibre.org/style.json"
    >
      <Camera
        zoomLevel={10}
        centerCoordinate={[9.185,  	45.465]}
      />
    </MapView>
  );
}
