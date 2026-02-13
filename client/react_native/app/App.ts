import * as React from "react";
import {
  StyleSheet,
  Button,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
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
import Geolocation from 'react-native-geolocation-service';
import { API_URL, API_PORT } from "@env";



const serverUrl = `https://${API_URL}:${API_PORT}`;
const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: [],
};


type GeoPoint = {
  latitude: number;
  longitude: number;
};

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationResponse {
  coords: GeolocationCoords;
  timestamp: number;
}

interface GeolocationError {
  code: number; // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  message: string;
}


abstract class PanelState {
  protected readonly parentApp: App;

  constructor(parentApp: App) {
    this.parentApp = parentApp;
  }

  abstract get panelContents(): React.ReactNode[];

  public onMapPressed(latitude: number, longitude: number) {}
}


abstract class PositionSelectionState extends PanelState {
  protected currentSelection: GeoPoint | null;

  constructor(parentApp: App) {
    super(parentApp);
    this.currentSelection = null;

    // bind dei metodi per preservare 'this'
    this.handleGetGPSLocation = this.handleGetGPSLocation.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
  }

  protected abstract goToNextPanel(): void;

  protected setSelectionAndContinue(latitude: number, longitude: number): void {
    this.currentSelection = { latitude: latitude, longitude: longitude };
    this.goToNextPanel();
  }

  public onMapPressed(latitude: number, longitude: number): void {
    this.setSelectionAndContinue(latitude, longitude);
  }

  protected getCurrentLocation =  async (): Promise<void> => {
    try {
      const position: GeolocationResponse = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      this.setSelectionAndContinue(latitude, longitude);
    } catch (err: any) {
      console.warn('Geolocation error:', err);

      const geolocationError: GeolocationError = err;
      switch (geolocationError?.code) {
        case 1:
          Alert.alert(
            'Permesso negato',
            "L'accesso alla posizione è stato negato.",
          );
          break;
        case 2:
          Alert.alert(
            "Non è stato possibile ottenere la posizione GPS.",
            "Attivare l'impostazione sul telefono."
          );
          break;
        case 3:
          Alert.alert('Timeout posizione', 'Non è stato possibile ottenere la posizione (timeout). Riprova.');
          break;
        default:
          Alert.alert('Errore posizione', geolocationError?.message || "Errore sconosciuto durante l'ottenimento della posizione.");
      }
    }
  }

  protected handleGetGPSLocation =  async (): Promise<void> => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permesso posizione',
          message: 'Questa app ha bisogno del permesso di accesso alla posizione.',
          buttonPositive: 'OK'
        }
      );

      await this.getCurrentLocation();
    } else {
      // TODO (per ios)
    }
  }
}


class SelectStartState extends PositionSelectionState {

  constructor(parentApp: App){
    super(parentApp);
    //temporaneo
    this.currentSelection = { latitude: 45.4642, longitude: 9.1900 };
  }

  protected goToNextPanel(){
      this.parentApp.setPanelState(new SelectDestinationState(this.parentApp, this.currentSelection as GeoPoint));
  }

  public get panelContents(): React.ReactNode[] {
    return [
      React.createElement(
        View,
        { 
          key: 'container', 
          style: { backgroundColor: 'white', alignItems: 'center' } 
        },
        [
          React.createElement(
            Text,
            { key: 'label', style: { marginBottom: 12, fontSize: 16, fontWeight: 'bold' } },
            'Selezionare una posizione di partenza premendo sulla mappa o utilizzando la posizione GPS attuale'
          ),
          React.createElement(
            Button,
            { 
              key: 'gps-button', 
              title: 'Da GPS', 
              onPress: this.handleGetGPSLocation
            }
          )
        ]
      )
    ];
  }
}


class SelectDestinationState extends PositionSelectionState {
  private readonly start: GeoPoint;

  constructor(parentApp: App, start: GeoPoint){
    super(parentApp);
    this.start = start;
    //temporaneo
    this.currentSelection = { latitude: 45.8566, longitude: 9.3977 };
  }

  protected goToNextPanel(){
    this.parentApp.setPanelState(new RoutesListState(this.parentApp, this.start, this.currentSelection as GeoPoint));
  }

  public get panelContents(): React.ReactNode[] {
    return [
      React.createElement(
        View,
        { 
          key: 'container', 
          style: { backgroundColor: 'white', alignItems: 'center' } 
        },
        [
          React.createElement(
            Text,
            { key: 'label', style: { marginBottom: 12, fontSize: 16, fontWeight: 'bold' } },
            'Selezionare una destinazione premendo sulla mappa o utilizzando la posizione GPS attuale'
          ),
          React.createElement(
            Button,
            { 
              key: 'gps-button', 
              title: 'Da GPS', 
              onPress: this.handleGetGPSLocation
            }
          )
        ]
      )
    ];
  }
}


class RoutesListState extends PanelState {
  private readonly routeUrl: string;
  
  constructor(parentApp: App, start: GeoPoint, end: GeoPoint){
    super(parentApp);
    this.routeUrl = `${serverUrl}/routes/`;
    this.fetchRoute(start, end);
  }

  private fetchRoute = async (start: GeoPoint, end: GeoPoint) => {
    const requestUrl = new URL(this.routeUrl);
    requestUrl.searchParams.append('startLatitude', start.latitude.toString());
    requestUrl.searchParams.append('startLongitude', start.longitude.toString());
    requestUrl.searchParams.append('endLatitude', end.latitude.toString());
    requestUrl.searchParams.append('endLongitude', end.longitude.toString());

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
      this.parentApp.setState({ route: geojsons[0] });
    } catch (err: any) {
      console.error('Failed to fetch route:', err.message || err);
      this.parentApp.setState({ route: EMPTY_ROUTE });
    }
  };

  public get panelContents(): React.ReactNode[] {
    return [
      React.createElement(Text, {}, "ipsum lorem")
    ];
  }
}


class App extends React.Component<{}, { route: any, panelState: PanelState }> {
  private readonly tileUrl: string;


  constructor(props: {}) {
    super(props);
    this.tileUrl = `${serverUrl}/tiles/{z}/{x}/{y}.png`;

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