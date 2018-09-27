import React from 'react';
import {Image,StyleSheet,View,Dimensions,Picker} from 'react-native';
import Expo from 'expo';

const vertSrc = ` 
precision highp float;
attribute vec2 a_position;
varying vec2 v_texCoord;
void main () {
  v_texCoord = a_position.yx;
  gl_Position = vec4(1.0 - 2.0 * a_position, 0, 1);
}`;


const fragSrc = `
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[9];
uniform float u_kernelWeight;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
   vec4 colorSum =
       texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;

   gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}`;

function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }



class HarrisCornerDetectorScreen extends React.Component {
    state = {
        photoInfo : this.props.navigation.getParam('photoInfo','NO-ID'),
        filter : this.props.navigation.getParam('filter','NO-ID')
    }
    _onContextCreate = gl => {
    gl.enableLogging = true;
    console.log("TRYING TO COMPILE GLSL")
    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    console.log("COMPILED VERT")
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);
    
    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    
    // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, {localUri:this.state.photoInfo.fileName});

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

  // Define several convolution kernels
  var kernels = {
    sobelHorizontal: [
        1,  2,  1,
        0,  0,  0,
       -1, -2, -1
    ],
    sobelVertical: [
        1,  0, -1,
        2,  0, -2,
        1,  0, -1
    ],
     edgeDetect: [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
     ],
  };


    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset)

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset)

    // set the resolution
    console.log(Dimensions.get("window").width);
    console.log(Dimensions.get("window").height);
    gl.uniform2f(resolutionLocation, Dimensions.get("window").width,Dimensions.get("window").height);

    // set the size of the image
    Image.getSize(this.state.photoInfo.fileName,(width,height)=>{console.log(width);console.log(height)});
    gl.uniform2f(textureSizeLocation,812,375);
    let currentKernel = [];
    if(this.state.filter === "edgeDetection"){
            currentKernel = kernels.edgeDetect
    } else if(this.state.filter === "sobelHorizontal"){
        currentKernel = kernels.sobelVertical
    } else if(this.state.filter === "sobelVertical"){
        currentKernel = kernels.sobelHorizontal   
    }
    gl.uniform1fv(kernelLocation, currentKernel);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(currentKernel));

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
    gl.flush();
    gl.endFrameEXP();
};
    render(){
        return ( 
            <Expo.GLView style={styles.container} onContextCreate={this._onContextCreate}/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'center',
      }
})

/*const vertSrc = `
  precision highp float;
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main () {
    v_texCoord = a_position;
    gl_Position = vec4(1.0 - 2.0 * a_position, 0, 1);
  }`;

const fragSrc = `
  precision highp float;
  uniform sampler2D texture;
  varying vec2 v_texCoord;
  void main () {
    vec4 texColor=  texture2D(texture, vec2(v_texCoord.y,v_texCoord.x));
    gl_FragColor = texColor.brga;
  }`*/

/*_onContextCreate = gl => {
    gl.enableLogging = true;

    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    // Save position attribute
    const positionAttrib = gl.getAttribLocation(program, 'a_position');

    // Create buffer
    const buffer = gl.createBuffer();

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      {localUri:this.state.photoInfo.fileName}
    );
    // 1, 1, 0,
    // gl.RGBA, gl.UNSIGNED_BYTE,
    // new Uint8Array([255, 0, 0, 255]));
    gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);

    /// Animate!

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Bind buffer, program and position attribute for use
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

    // Buffer data and draw!
    const verts = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
    // Submit frame
    gl.flush();
    gl.endFrameEXP();
};*/

export default HarrisCornerDetectorScreen; 