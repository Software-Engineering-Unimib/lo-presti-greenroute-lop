import * as React from "react";
import PanelState from "./states/PanelState.ts";
import SelectStartState from "./states/SelectStartState.ts";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  MapView,
  Camera,
  RasterSource,
  RasterLayer,
  BackgroundLayer,
  ShapeSource,
  LineLayer,
} from "@maplibre/maplibre-react-native";
import { SERVER_URL, EMPTY_ROUTE } from "./constants.ts";






class App extends React.Component<{}, { route: any, panelState: PanelState }> {
  private readonly tileUrl: string;

  constructor(props: {}) {
    super(props);
    this.tileUrl = `${SERVER_URL}/tiles/{z}/{x}/{y}.png`;

    this.state = {
      route: EMPTY_ROUTE,
      panelState: new SelectStartState(this)
    };
  }


  public setPanelState(panelState: PanelState): void {
    this.setState({ panelState: panelState });
  }

  private clearRoute(): void {
    this.setState({ route: EMPTY_ROUTE });
  };

  public render(): React.ReactNode {

    return React.createElement(View, { style: StyleSheet.absoluteFill },
      React.createElement(MapView, {
        style: StyleSheet.absoluteFill,
        onPress: (event) => {
          const [longitude, latitude] = event.geometry.coordinates;
          this.state.panelState.onMapPressed(latitude, longitude);
        }
      },
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
      ),

      React.createElement(View, { style: { position: "absolute", bottom: 50, left: 20, right: 20 } },
        ...this.state.panelState.panelContents
      )
    );
  }
}

export default App;