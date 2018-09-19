import React from 'react';
import {View} from 'react-native';

ReverseImageSquare = () => {
    return <View style={{
      borderWidth:2,
      width:20, 
      alignSelf: 'center',
      borderColor: '#fff',
      height:20,backgroundColor:'transparent',margin: '50%,50%,50%,50%'}}/>
  }
  ReverseImageRow = () => {
    reverseImageRow = []
    for(let column = 0;column<10;++column){
      reverseImageRow.push(<ReverseImageSquare key={column}/>)
    }
    return (<View style ={{flex: 1, flexDirection:'column', justifyContent:'space-evenly'}}> {reverseImageRow} </View> )
  }
  export default ReverseImageGrid = () => {
    reverseImageGrid = []
    for(let row = 0;row<10;++row){
        reverseImageGrid.push(<ReverseImageRow key= {row} />)
    }
  return (<View style = {{left: 0,top: 35,alignSelf:'center',flex:1,flexDirection:'row'}} > {reverseImageGrid} </View>);
  }