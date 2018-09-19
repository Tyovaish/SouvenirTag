import React from 'react';
import {View} from 'react-native';
import {createStackNavigator} from 'react-navigation';

import SouvenirTagDetails from './screens/SouvenirTagDetails.js';
import SouvenirTagCamera from './screens/SouvenirTagCamera.js';
import GalleryScreen from './screens/GalleryScreen.js';


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
  }
);