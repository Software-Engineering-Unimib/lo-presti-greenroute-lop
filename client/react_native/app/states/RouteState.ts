import App from "../App.ts"
import PanelState from "./PanelState.ts"
import * as React from "react";
import {
    View,
    ScrollView,
    Button,
    Text
} from "react-native";
import { EMPTY_ROUTE } from "../constants.ts";
import RoutesListState from "./RoutesListState.ts";


export default class RouteState extends PanelState {
  private route: any;
  private lastPanel: RoutesListState;

  constructor(parentApp: App, route: any, lastPanel: RoutesListState){
    super(parentApp);
    this.route = route;
    this.lastPanel = lastPanel;
    this.parentApp.setState({ route: route.geojson });
  }

  public get panelContents(): React.ReactNode[] {
    const elements = this.route.instructions.map((singleInstruction: any, index: number) =>
        React.createElement(Text, { key: `instruction-${index}` }, singleInstruction.text));

    return [
        React.createElement(
            View,
            { 
                key: 'container', 
                style: { backgroundColor: 'white', alignItems: 'center' } 
            },
            [
                React.createElement(
                    Button,
                    { 
                        key: 'return-button', 
                        title: 'Cambia percorso',
                        onPress: () => {
                            this.parentApp.setState({ route: EMPTY_ROUTE });
                            this.parentApp.setPanelState(this.lastPanel);
                        }
                    }
                ),
                React.createElement(
                    ScrollView,
                    {
                        key: 'instructions-container',
                        style: { height: 200, width: '100%', marginTop: 8 },
                        contentContainerStyle: { paddingHorizontal: 8 }
                    },
                    ...elements
                )
            ]
        )
    ];
  }
}