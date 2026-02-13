import App from "../App.ts"
import PanelState from "./PanelState.ts"
import * as React from "react";
import {
    View,
    Button,
    Text
} from "react-native";
import { SERVER_URL, EMPTY_ROUTE } from "../constants.ts";
import SelectDestinationState from "./SelectDestinationState.ts";


export default class RoutesListState extends PanelState {
  private readonly routeUrl: string;
  private readonly start: GeoPoint;
  private readonly end: GeoPoint;
  
  constructor(parentApp: App, start: GeoPoint, end: GeoPoint){
    super(parentApp);
    this.start = start;
    this.end = end;
    this.routeUrl = `${SERVER_URL}/routes/`;
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
        React.createElement(
            View,
            { 
                key: 'container', 
                style: { backgroundColor: 'white', alignItems: 'center' } 
            },
            [
                React.createElement(Text, {}, "ipsum lorem"),
                React.createElement(
                    Button,
                    { 
                        key: 'return-button', 
                        title: 'Cambia destinazione', 
                        onPress: () => {
                        this.parentApp.setState({ pin: this.start, route: EMPTY_ROUTE });
                        this.parentApp.setPanelState(new SelectDestinationState(this.parentApp, this.start));
                        }
                    }
                )
            ]
        )
    ];
  }
}