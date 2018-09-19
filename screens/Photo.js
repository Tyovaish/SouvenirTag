import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { FaceDetector } from 'expo';
import { Ionicons } from '@expo/vector-icons';



export default class Photo extends React.Component {
  state = {
    selected: false,
    image: null,
  };
  render() {
    const { uri } = this.props;
    return (
        <TouchableOpacity
          style={[{width: this.props.pictureSize, height: this.props.pictureSize},styles.pictureWrapper]}
          activeOpacity={1}
        >
          <Image
            style={styles.picture}
            source={{ uri }}
          />
        </TouchableOpacity>
      );
  };
}

const styles = StyleSheet.create({
  picture: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    resizeMode: 'contain',
  },
  pictureWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  }
});