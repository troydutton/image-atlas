import { Camera, CameraType } from 'expo-camera';
import { useState, useRef } from 'react';
import { Image, Button, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions  } from 'react-native';
import Icon from 'react-native-ico-material-design';

export default function CameraView() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [showCamera, setShowCamera] = useState(true);
  const [similarImages, setSimilarImages] = useState([]);
  

  // Calculate camera height based on screen width (Assumes 16:9 aspect ratio)
  const {width} = useWindowDimensions();
  const camera_height = Math.round((width * 16) / 9);
  
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading
    return <View/>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Allow access to camera to continue.</Text>
        <Button onPress={requestPermission} title="Allow" />
      </View>
    );
  }

  async function takePicture() {
    console.log("Taking picture...");

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();

      // Create a FormData object to send the image to the server
      let formData = new FormData();
  
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
  
      // Send the FormData object to the server
      fetch('http://100.110.148.13:5000/image', {
        method: 'POST',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      }).then(response => {
        if (response.status === 400) {
          throw new Error('No image provided');
        } else if (response.status === 500) {
          throw new Error('No detections');
        } else if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }).then(data => {
        // console.log(data[0]["similar_images"][0]);
        setSimilarImages(data[0]["similar_images"]);
        setShowCamera(false);
      }).catch(error => {
        // Handle the error
        console.error(error);
      });
    }
  }

  function flipCamera() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera ref={cameraRef} ratio="16:9" style={{height: camera_height, marginTop: 45}} type={type} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <Icon name="synchronization-button-with-two-arrows" color="white" width="60" height="60"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.takePictureButton} onPress={takePicture}>
              <Icon name="radio-on-button" color="white" width="70" height="70"/>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        similarImages.map((base64Image, index) => (
          <Image
            key={index}
            style={{width: 100, height: 100}}
            source={{uri: `data:image/jpeg;base64,${base64Image}`}}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Set the background color to black
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the buttons horizontally
    backgroundColor: 'transparent',
    padding: 20, // Add some padding if needed
  },
  flipButton: {
    alignSelf: 'center',
    position: 'absolute', // Position the flip button absolutely
    left: 40, // Position it a little to the left
  },
  takePictureButton: {
    alignSelf: 'center', // Center the take picture button vertically
  }
});