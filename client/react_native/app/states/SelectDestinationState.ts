import App from "../App.ts"
import PositionSelectionState from "./PositionSelectionState.ts";
import RoutesListState from "./RoutesListState.ts";
import * as React from "react";
import {
    Button,
    View,
    Text,
} from "react-native";


export default class SelectDestinationState extends PositionSelectionState {
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