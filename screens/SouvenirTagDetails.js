import React from 'react';
import {FileSystem} from 'expo';
import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,StyleSheet, Picker} from 'react-native'
import {MaterialIcons} from '@expo/vector-icons'
import Photo from './Photo'
import {PHOTOS_DIR,PHOTO_INFO_DOC} from './Directory'

class SouvenirTagDetails extends React.Component {
    static navigationOptions = {
        header: null
      }
    state = {
        photoInfo : this.props.navigation.getParam('photoInfo','NO-ID'),
        filter : "edgeDetection"
    }
    updatePhotoTitle = (photoTitle) => {
            this.state.photoInfo.photoTitle = photoTitle;
            this.setState({photoInfo: this.state.photoInfo})
    }
    updatePhotoTag = (photoTag) => {
            this.state.photoInfo.photoTag = photoTag;
            this.setState({photoInfo: this.state.photoInfo})
    }
    removePhoto = async () => {
        let photoInfoFile = await FileSystem.readAsStringAsync(PHOTO_INFO_DOC);
        let photos = JSON.parse(photoInfoFile).photos.filter(photoInfo => this.state.photoInfo.fileName !== photoInfo.fileName);
        await FileSystem.writeAsStringAsync(PHOTO_INFO_DOC,JSON.stringify({photos: photos}))
        this.props.navigation.pop()
    }
    navigateBack = async() => {
        let photoInfoFile = await FileSystem.readAsStringAsync(PHOTO_INFO_DOC);
        let photos = JSON.parse(photoInfoFile).photos.filter(photoInfo => this.state.photoInfo.fileName !== photoInfo.fileName);
        photos.push(this.state.photoInfo)
        await FileSystem.writeAsStringAsync(PHOTO_INFO_DOC,JSON.stringify({photos: photos}))
        this.props.navigation.pop()
    }
    navigateToHCD = () => {
        this.props.navigation.navigate('HCD', {
            photoInfo : this.state.photoInfo,
            filter: this.state.filter
        })
    }
    render(){
        return (
                    <KeyboardAvoidingView style = {{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} key={this.state.photoInfo.fileName} behavior="padding">
                        <View style={styles.navbar}>
                            <TouchableOpacity style={styles.button} onPress = {this.navigateBack}>
                                <MaterialIcons name="arrow-back" size={25} color="white" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.button} onPress = {this.navigateToHCD}>
                            <Photo
                                key={this.state.photoInfo.fileName}
                                uri={`${this.state.photoInfo.fileName}`}
                                pictureSize  = {300}
                            />;
                        </TouchableOpacity>
                        <Text>PHOTO TITLE</Text>
                        <TextInput
                            style={{height: 40, width: 300, textAlign: 'center',borderColor: 'gray', borderWidth: 1}}
                            onChangeText={this.updatePhotoTitle}
                            value={this.state.photoInfo.photoTitle}
                        />
                        <Text>PHOTO TAG </Text>
                        <TextInput
                            style={{height: 40, width: 300, textAlign: 'center', borderColor: 'gray', borderWidth: 1}}
                            onChangeText={this.updatePhotoTag}
                            value={this.state.photoInfo.photoTag}
                        />
                        <TouchableOpacity style= {{backgroundColor:'red', height: 30, justifyContent: 'center', marginTop: 20}} onPress={this.removePhoto}> 
                            <Text>  DELETE </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style= {{backgroundColor:'green',height: 30, justifyContent: 'center', marginTop: 20}} onPress={this.navigateToHCD}> 
                            <Text style={{color:'white'}}>Compute</Text>
                        </TouchableOpacity>
                        <Picker selectedValue={this.state.filter}
                            style={{ marginTop:0,height: 50, width: 150}}
                            itemStyle={styles.onePickerItem}
                            onValueChange={(itemValue, itemIndex) => this.setState({filter: itemValue})}>
                            <Picker.Item stle label="EdgeDetect" value="edgeDetection"/>
                            <Picker.Item label="SobelHoriz" value="sobelHorizontal"/>
                            <Picker.Item label="SobelVert" value="sobelVertical"/>
                        </Picker>
                 </KeyboardAvoidingView>
            
            )

    }
}
const styles = StyleSheet.create({
    navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#4630EB',
  },
  onePickerItem: {
    height: 100,
    color: 'black'
  },
})
export default SouvenirTagDetails