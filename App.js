import React from 'react';
import {View} from 'react-native';
import {createStackNavigator} from 'react-navigation';

import SouvenirTagDetails from './screens/SouvenirTagDetails';
import SouvenirTagCamera from './screens/SouvenirTagCamera';
import GalleryScreen from './screens/GalleryScreen';
import HarrisCornerDetectorScreen from './screens/HarrisCornerDetectorScreen'

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}
const RootStack = createStackNavigator(
  {
    Gallery: GalleryScreen,
    Camera: SouvenirTagCamera,
    Tag: SouvenirTagDetails,
    HCD : HarrisCornerDetectorScreen,
  }
);