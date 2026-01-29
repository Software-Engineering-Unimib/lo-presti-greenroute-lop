import React from 'react';
import { View } from 'react-native';

const MockComponent = ({ children }: any) => (
    <View>{children}</View>
);

export const MapView = MockComponent;
export const Camera = MockComponent;
export const RasterSource = MockComponent;
export const RasterLayer = MockComponent;
