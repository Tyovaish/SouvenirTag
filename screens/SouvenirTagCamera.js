import React from 'react';
import { Text, View, TouchableOpacity, Slider, StyleSheet } from 'react-native';
import { Camera, Permissions, FileSystem } from 'expo';
import GalleryScreen from './GalleryScreen';
import ReverseImageGrid from './ReverseImageGrid';
import { MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator } from 'react-navigation';
import {PHOTO_ID_DOC, PHOTOS_DIR, PHOTO_INFO_DOC} from './Directory'

class SouvenirTagCamera extends React.Component {
  static navigationOptions = {
    header: null
  }
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    zoom: 0,
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  takePicture = async () => {
    let photoIdFile = await FileSystem.getInfoAsync(PHOTO_ID_DOC);
    let photoId = 0;
      if(photoIdFile.exists){
        let photoIdFileData = await FileSystem.readAsStringAsync(PHOTO_ID_DOC);
        photoId=parseInt(JSON.parse(photoIdFileData).photoId);
      }
    let photo = await this.camera.takePictureAsync()
    this.onPictureSaved(photo,photoId)
    let photoInfo = {fileName: `${PHOTOS_DIR}/Photo_${photoId}.jpg`, photoTitle: `Photo_${photoId}`, photoTag: 'This is a tag!'}
    await FileSystem.writeAsStringAsync(PHOTO_ID_DOC,JSON.stringify({photoId:photoId+1}))
    let photoFile = await FileSystem.getInfoAsync(PHOTO_INFO_DOC);
    if(photoFile.exists){
        let photoInfoFileData = await FileSystem.readAsStringAsync(PHOTO_INFO_DOC)
        let photos = JSON.parse(photoInfoFileData).photos
        photos.push(photoInfo)
        await FileSystem.writeAsStringAsync(PHOTO_INFO_DOC,JSON.stringify({photos: photos}))
    } else {
      await FileSystem.writeAsStringAsync(PHOTO_INFO_DOC,JSON.stringify({photos: [photoInfo]}))
    }
     this.props.navigation.navigate('Tag', {
      photoInfo : photoInfo
    })
  }
  

  onPictureSaved = async (photo,photoId) => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${PHOTOS_DIR}/Photo_${photoId}.jpg`,
    })
  }

  renderCamera(){
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1}}>
          <Camera style={{flex: 5}} type={this.state.type} ref={ref => {
            this.camera = ref;
            }} 
          autoFocus={true} zoom = {this.state.zoom}>
            <View
              style={{
                flex: 5,
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}>
               <ReverseImageGrid/>
              </View>
              <View style = {{flex: 1, flexDirection:'row', justifyContent: 'center'}}>
              <TouchableOpacity
              style = {styles.goToGalleryScreen}
              onPress = {()=>this.props.navigation.goBack()}> 
                 <MaterialIcons name="arrow-back" size={60} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.takePictureButton} onPress = {() => {this.takePicture()}}/>
              </View>
              <Slider
                style = {styles.zoomSlider}
                value={this.state.zoom}
                minimumValue = {0}
                maximumValue = {1.0}
                step = {0.05}
                onValueChange={zoom => this.setState({zoom})}
              />
          </Camera>  
        </View> )
    }
  }

  render() {

    return this.renderCamera();
  }
}

const styles = StyleSheet.create({
    zoomSlider : {
        position: 'absolute',
        bottom: 50,
        right: 20,
        width: 100,
    },
    goToGalleryScreen : {
        position: 'absolute',
        bottom: 35,
        left: 10,
    }, 
    takePictureButton : {
      borderWidth:10 ,
      borderColor:'rgba(255,255,255,1)',
      width:100,
      height:100,
      alignSelf: 'center',
      backgroundColor:'transparent',
      borderRadius:100,
    }

})
export default SouvenirTagCamera