import App from "../App.ts"
import PositionSelectionState from "./PositionSelectionState.ts";
import SelectDestinationState from "./SelectDestinationState.ts";
import * as React from "react";
import {
    Button,
    View,
    Text,
} from "react-native";


export default class SelectStartState extends PositionSelectionState {

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