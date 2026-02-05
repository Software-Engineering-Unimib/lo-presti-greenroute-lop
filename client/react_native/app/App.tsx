import * as React from "react";
import { StyleSheet } from "react-native";
import {
  MapView,
  Camera,
  RasterSource,
  RasterLayer,
  BackgroundLayer
} from "@maplibre/maplibre-react-native";
import { API_URL, API_PORT } from "@env";

class App extends React.Component<{}, {}> {
  private tileUrl: string;
  private mapChildren: React.ReactNode[];

  constructor(props: {}) {
    super(props);

    this.tileUrl = `https://${API_URL}:${API_PORT}/tiles/{z}/{x}/{y}.png`;

    this.mapChildren = [
      React.createElement(Camera, { zoomLevel: 10, centerCoordinate: [9.185, 45.465] }),
      React.createElement(BackgroundLayer, { id: "black-background", style: { backgroundColor: "#000000" } }),
      React.createElement(
        RasterSource,
        { id: "osm-proxy", tileUrlTemplates: [this.tileUrl], tileSize: 256 },
        React.createElement(RasterLayer, { id: "osm-layer", sourceID: "osm-proxy" })
      )
    ];
  }

  render(): React.ReactNode {
    return React.createElement(MapView, { style: StyleSheet.absoluteFill }, ...this.mapChildren);
  }
}

export default App;
