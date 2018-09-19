import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FileSystem, Permissions } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import Photo from './Photo';
import {PHOTOS_DIR,PHOTO_INFO_DOC, PHOTO_ID_DOC} from './Directory.js'
import { NavigationEvents } from 'react-navigation';

class GalleryScreen extends React.Component {
  static navigationOptions = {
    header: null
  }
  state = {
    photos: [],
  };
  updateGallery = async () => {
    FileSystem.makeDirectoryAsync(PHOTOS_DIR).catch(e => {
      console.log(e, 'Directory exists');
    });
    let photoInfoFile = await FileSystem.getInfoAsync(PHOTO_INFO_DOC);
    if(photoInfoFile.exists){
      let fileData = await FileSystem.readAsStringAsync(PHOTO_INFO_DOC);
      this.setState({photos: JSON.parse(fileData).photos});
    }
  }
  deleteGallery = () => {
    FileSystem.deleteAsync(PHOTOS_DIR)
    FileSystem.deleteAsync(PHOTO_INFO_DOC)
    FileSystem.deleteAsync(PHOTO_ID_DOC)
  }

  renderPhoto = photoInfo =>{
    console.log(photoInfo)
  return(<TouchableOpacity key = {photoInfo.fileName}onPress = { () => this.props.navigation.navigate('Tag', {
    photoInfo : photoInfo
  })}>
    <View key={photoInfo.fileName}>  
      <Photo
        key={photoInfo.fileName}
        uri={`${photoInfo.fileName}`}
        pictureSize = {150}
      />;
      <Text style = {{textAlign: 'center'}}>{photoInfo.photoTitle}</Text>
    </View>
  </TouchableOpacity>)
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={payload => {this.updateGallery()}}
        />
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.button} onPress = {()=>this.props.navigation.push('Camera')}>
              <MaterialIcons name="photo-camera" size={25} color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView contentComponentStyle={{ flex: 1 }}>
          <View style={styles.pictures}>
            {this.state.photos.map(this.renderPhoto)}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 50,
    backgroundColor: 'white',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#4630EB',
  },
  pictures: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  button: {
    padding: 20,
  },
  whiteText: {
    color: 'white',
  }
});
export default GalleryScreen;