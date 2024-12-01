import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

export default function HelpScreen() {
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [location, setLocation] = useState(null); 
  const [locationHistory, setLocationHistory] = useState([]); 
  const cameraRef = useRef(null);
  const locationWatcher = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      setMicrophonePermission(micStatus === 'granted');

      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locStatus === 'granted');
    })();
  }, []);

  if (!cameraPermission || microphonePermission === null || locationPermission === null) {
    return <View />;
  }

  if (!cameraPermission.granted || !microphonePermission || !locationPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera, microphone, and location.</Text>
        <Button onPress={requestCameraPermission} title="Grant Camera Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);

        // Start location tracking with watchPositionAsync
        locationWatcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation.coords);
            setLocationHistory(prevHistory => [...prevHistory, newLocation.coords]);
          }
        );

        // Start recording video
        const video = await cameraRef.current.recordAsync();
        setVideoUri(video.uri);

        // Automatically stop recording after 5 minutes (300000ms)
        setTimeout(() => stopRecording(), 300000); // 5 minutes in milliseconds
      } catch (error) {
        console.warn(error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);

      if (locationWatcher.current) {
        locationWatcher.current.remove();
      }

      sendVideoData(videoUri);
    }
  };

  const sendVideoData = async (uri) => {
    try {
      // const response = await fetch('https://127.0.0.1:5000/upload', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     videoUri: uri,
      //     location: location, // You can include other data like location
      //   }),
      // });
      const response = await fetch('http://192.168.216.77:5000/test',{
        method: "GET",
      })
      const data = await response.json();
      console.log('Video data sent successfully:', data);
    } catch (error) {
      console.error('Error sending video data:', error);
    }
  };
  



  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode='video'
          videoQuality={"720p"}
          mute={"true"}
        />
      </View>

      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={startRecording}>
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={stopRecording}>
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Current Location: {`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
          </Text>
        </View>
      )}

      {videoUri && !isRecording && (
        <View style={styles.videoContainer}>
          <Text style={styles.videoText}>Video recorded: {videoUri}</Text>
        </View>
      )}

      {locationHistory.length > 0 && (
        <View style={styles.locationHistoryContainer}>
          <Text style={styles.locationHistoryText}>Location History:</Text>
          <ScrollView style={styles.scrollView}>
            {locationHistory.map((coord, index) => (
              <Text key={index} style={styles.locationText}>
                {`Lat: ${coord.latitude}, Lon: ${coord.longitude}`}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
      
      <TouchableOpacity style={styles.buttonUpdated}>
        <Text style={styles.buttonTextUpdated}>Save To Database</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
  },
  cameraContainer: {
    width: '90%',
    height: '40%',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#000',
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonUpdated: {
    marginTop: 15,
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#e60000',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonTextUpdated: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  videoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: 'black',
  },
  locationContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: 'black',
  },
  locationHistoryContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '90%',
    maxHeight: 150,
  },
  locationHistoryText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  scrollView: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
