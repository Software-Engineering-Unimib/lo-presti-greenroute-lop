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
  CircleLayer
} from "@maplibre/maplibre-react-native";
import { SERVER_URL, EMPTY_ROUTE } from "./constants.ts";


class App extends React.Component<{}, { route: any, panelState: PanelState, pin: GeoPoint | null, arePathsFetched: Boolean }> {
  private readonly tileUrl: string;

  
  constructor(props: {}) {
    super(props);
    this.tileUrl = `${SERVER_URL}/tiles/{z}/{x}/{y}.png`;

    this.state = {
      route: EMPTY_ROUTE,
      panelState: new SelectStartState(this),
      pin: null,
      arePathsFetched: false
    };
  }


  public setPanelState(panelState: PanelState): void {
    this.setState({ panelState: panelState });
  }


  public render(): React.ReactNode {
    const isPinDefined: Boolean = this.state.pin !== undefined && this.state.pin !== null;

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
          defaultSettings: {
            zoomLevel: 13,
            centerCoordinate: [9.1900, 45.4642]
          }
        }),

        React.createElement(BackgroundLayer, {
          key: "background",
          id: "black-background",
          style: { backgroundColor: "#000000" }
        }),

        React.createElement(RasterSource, {
          key: "tile-source",
          id: "tile-service-fetcher",
          tileUrlTemplates: [this.tileUrl],
          tileSize: 256
        },

        React.createElement(RasterLayer, { id: "tile-layer", sourceID: "tile-service-fetcher" })),

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
        ),

        React.createElement(ShapeSource, {
          key: "pin-source",
          id: "pin-source",
          shape: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: isPinDefined ? [this.state.pin!.longitude, this.state.pin!.latitude] : [0, 0]
            }
          }
        },
          React.createElement(CircleLayer, {
            id: "pin-layer",
            style: {
              circleRadius: 8,
              circleColor: "red",
              circleStrokeWidth: 2,
              circleStrokeColor: "white",
              visibility: isPinDefined ? "visible" : "none"
            }
          })
        )
      ),

      React.createElement(View, { id: "panel", style: { position: "absolute", bottom: 50, left: 20, right: 20 } },
        ...this.state.panelState.panelContents
      )
    );
  }
}

export default App;