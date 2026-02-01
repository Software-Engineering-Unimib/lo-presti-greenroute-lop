import React from "react";
import { StyleSheet } from "react-native";
import { MapView, Camera, RasterSource, RasterLayer} from "@maplibre/maplibre-react-native";
import { API_URL, API_PORT } from '@env';
;

export default function App() {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
    >
      <Camera
        zoomLevel={10}
        centerCoordinate={[9.185, 45.465]}
      />
      
      <RasterSource
        id="osm-proxy"
        tileUrlTemplates={[`https://${API_URL}:${API_PORT}/tiles/{z}/{x}/{y}.png`]}
        tileSize={256}
      > 
        <RasterLayer
          id="osm-layer"
          sourceID="osm-proxy"
        />
      </RasterSource>
    </MapView>
  );
}
