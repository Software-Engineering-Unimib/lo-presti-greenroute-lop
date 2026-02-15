import * as React from "react";
import { render, fireEvent } from '@testing-library/react-native';
import App from "../app/App.ts";
import SelectStartState from '../app/states/SelectStartState.ts';


jest.mock("../app/constants", () => ({
  SERVER_URL: "http://mockhost:3000"
}));
jest.mock('@maplibre/maplibre-react-native', () => {
  // i mock non possono referenziare variabili out of scope, React va richiesto nella factory
  const React = require('react');

  const createMockComponent = (name: string) => {
    const Component = (props: any) =>
      React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    MapView: createMockComponent('MapView'),
    Camera: createMockComponent('Camera'),
    RasterSource: createMockComponent('RasterSource'),
    RasterLayer: createMockComponent('RasterLayer'),
    BackgroundLayer: createMockComponent('BackgroundLayer'),
    ShapeSource: createMockComponent('ShapeSource'),
    LineLayer: createMockComponent('LineLayer'),
    CircleLayer: createMockComponent('CircleLayer')
  };
});


jest.mock('../app/states/SelectStartState.ts', () => {
    return jest.fn().mockImplementation(() => ({
        onMapPressed: jest.fn(),
        panelContents: []
    }));
});


describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dovrebbe essere renderizzato correttamente', () => {
    render(React.createElement(App));
  });

  it('dovrebbe chiamare onMapPressed dello stato quando la mappa è premuta', () => {
    const mockOnMapPressed = jest.fn();

    (SelectStartState as jest.Mock).mockImplementationOnce(() => ({
      onMapPressed: mockOnMapPressed,
      panelContents: []
    }));

    const { getByTestId } = render(React.createElement(App));
    const mapView = getByTestId('mapView');

    const latitude = 8.765;
    const longitude = 1.234;
    fireEvent(mapView, 'onPress', {geometry: { coordinates: [longitude, latitude] }});

    expect(mockOnMapPressed).toHaveBeenCalledWith(latitude, longitude);
  });

  it('dovrebbe ottenere i contenuti del pannello da state', () => {
    const mockContent = React.createElement('View', { testID: 'mock-content' });

    (SelectStartState as jest.Mock).mockImplementationOnce(() => ({
        onMapPressed: jest.fn(),
        panelContents: [mockContent]
    }));

    const { getByTestId } = render(React.createElement(App));
    expect(getByTestId('mock-content')).toBeTruthy();
  });
});