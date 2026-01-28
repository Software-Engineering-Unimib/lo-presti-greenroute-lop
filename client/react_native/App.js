import React from "react";
import { StyleSheet } from "react-native";
import { MapView, Camera, RasterSource, RasterLayer} from "@maplibre/maplibre-react-native";

serverURL = "10.0.2.2";
serverPort = 80;

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
        tileUrlTemplates={[`http://${serverURL}:${serverPort}/tiles/{z}/{x}/{y}.png`]}
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
