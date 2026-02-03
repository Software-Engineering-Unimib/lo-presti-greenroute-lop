import React, { FC } from "react";
import { StyleSheet } from "react-native";
import {
  MapView,
  Camera,
  RasterSource,
  RasterLayer,
  BackgroundLayer
} from "@maplibre/maplibre-react-native";
import { API_URL, API_PORT } from "@env";

// Optional: explicitly type the component
const App: FC = () => {
  return (
    <MapView style={StyleSheet.absoluteFill}>
      <Camera zoomLevel={10} centerCoordinate={[9.185, 45.465]} />

      <BackgroundLayer
        id="black-background"
        style={{ backgroundColor: "#000000" }}
      />

      <RasterSource
        id="osm-proxy"
        tileUrlTemplates={[`https://${API_URL}:${API_PORT}/tiles/{z}/{x}/{y}.png`]}
        tileSize={256}
      >
        <RasterLayer id="osm-layer" sourceID="osm-proxy" />
      </RasterSource>
    </MapView>
  );
};

export default App;
