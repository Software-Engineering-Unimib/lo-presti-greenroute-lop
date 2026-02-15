import App from "../App.ts"
import PanelState from "./PanelState.ts"
import * as React from "react";
import {
    View,
    Button,
    Text
} from "react-native";
import { SERVER_URL } from "../constants.ts";
import SelectDestinationState from "./SelectDestinationState.ts";
import RouteState from "./RouteState.ts";


export default class RoutesListState extends PanelState {
  private readonly routeUrl: string;
  private readonly start: GeoPoint;
  private readonly end: GeoPoint;
  private pathsList: any;
  
  constructor(parentApp: App, start: GeoPoint, end: GeoPoint){
    super(parentApp);
    this.start = start;
    this.end = end;
    this.routeUrl = `${SERVER_URL}/routes/`;
    this.pathsList = [];
    this.parentApp.setState({ arePathsFetched: false });
  }

  public async fetchRoutes() {
    const requestUrl = new URL(this.routeUrl);
    requestUrl.searchParams.append('startLatitude', this.start.latitude.toString());
    requestUrl.searchParams.append('startLongitude', this.start.longitude.toString());
    requestUrl.searchParams.append('endLatitude', this.end.latitude.toString());
    requestUrl.searchParams.append('endLongitude', this.end.longitude.toString());

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

      this.pathsList = await response.json();
      this.parentApp.setState({ arePathsFetched: true });
    } catch (err: any) {
      console.error('Failed to fetch route:', err.message || err);
    }
  };

  public get panelContents(): React.ReactNode[] {
    const elements = this.pathsList.map((path: any, index: number) =>
        React.createElement(Button, {
            key: `path-${index}`,
            title: `Tempo: ${path.time}, Distanza: ${path.distance}`,
            onPress: () => {
                this.parentApp.setPanelState(new RouteState(this.parentApp, this.pathsList[index], this));
            }
        }));

    return [
        React.createElement(
            View,
            { 
                key: 'container',
                style: { backgroundColor: 'white', alignItems: 'center' } 
            },
            [
                React.createElement(Text, { key: 'label-1'}, "Scegli un percorso"),
                ...elements,
                React.createElement(Text, { key: 'label-2'}, "Oppure..."),
                React.createElement(
                    Button,
                    { 
                        key: 'return-button', 
                        title: 'Cambia destinazione',
                        onPress: () => {
                          this.parentApp.setState({ pin: this.start, arePathsFetched: false });
                          this.parentApp.setPanelState(new SelectDestinationState(this.parentApp, this.start));
                        }
                    }
                )
            ]
        )
    ];
  }
}