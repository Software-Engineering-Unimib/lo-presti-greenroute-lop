import * as React from "react";
import { StyleSheet, Button, View } from "react-native";
import {
  MapView,
  Camera,
  RasterSource,
  RasterLayer,
  BackgroundLayer,
  ShapeSource,
  LineLayer,
} from "@maplibre/maplibre-react-native";
import { API_URL, API_PORT } from "@env";


const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: [],
};


class App extends React.Component<{}, { route: any }> {
  private serverUrl: string;
  private tileUrl: string;
  private routeUrl: string;

  constructor(props: {}) {
    super(props);

    this.state = {
      route: EMPTY_ROUTE,
    };

    this.serverUrl = `https://${API_URL}:${API_PORT}`;
    this.tileUrl = `${this.serverUrl}/tiles/{z}/{x}/{y}.png`;
    this.routeUrl = `${this.serverUrl}/routes/`;
  }

  clearRoute = () => {
    this.setState({ route: EMPTY_ROUTE });
  };

  fetchRoute = async () => {
    const start = { lat: 45.4642, lng: 9.1900 };
    const end = { lat: 45.8566, lng: 9.3977 };

    const requestUrl = new URL(this.routeUrl);
    requestUrl.searchParams.append('startLatitude', start.lat.toString());
    requestUrl.searchParams.append('startLongitude', start.lng.toString());
    requestUrl.searchParams.append('endLatitude', end.lat.toString());
    requestUrl.searchParams.append('endLongitude', end.lng.toString());

    try {
      const response = await fetch(requestUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const geojsons = await response.json();
      this.setState({ route: geojsons[0] });
    } catch (err: any) {
      console.error('Failed to fetch route:', err.message || err);
      this.setState({ route: EMPTY_ROUTE });
    }
  };

  render(): React.ReactNode {
    const mapChildren: React.ReactNode[] = [
      React.createElement(Camera, {
        key: "camera",
        zoomLevel: 13,
        centerCoordinate: [9.1900, 45.4642]
      }),

      React.createElement(BackgroundLayer, {
        key: "background",
        id: "black-background",
        style: { backgroundColor: "#000000" }
      }),

      React.createElement(RasterSource, {
        key: "osm-source",
        id: "osm-proxy",
        tileUrlTemplates: [this.tileUrl],
        tileSize: 256
      },

      React.createElement(RasterLayer, { id: "osm-layer", sourceID: "osm-proxy" })),

      React.createElement(ShapeSource, {
          key: "route-source",
          id: "route-source",
          shape: this.state.route
        },

        React.createElement(LineLayer, {
          id: "route-layer",
          style: {
            lineColor: "blue",
            lineWidth: 5,
            lineOpacity: 0.8,
          }
        })
      )
    ];

    return React.createElement(View, { style: StyleSheet.absoluteFill },
      React.createElement(MapView, { style: StyleSheet.absoluteFill }, ...mapChildren),

      React.createElement(View, { style: { position: "absolute", bottom: 50, left: 20, right: 20 } },
        React.createElement(Button, { title: "calcola percorso", onPress: this.fetchRoute })
      )
    );
  }
}

export default App;