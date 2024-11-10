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
  const [location, setLocation] = useState(null); // Store the latest location
  const [locationHistory, setLocationHistory] = useState([]); // Store historical coordinates
  const cameraRef = useRef(null);
  const locationWatcher = useRef(null); // To hold the location watcher ID

  // Check for microphone and location permissions
  useEffect(() => {
    (async () => {
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      setMicrophonePermission(micStatus === 'granted');

      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locStatus === 'granted');
    })();
  }, []);

  // If permissions are not granted or still loading, show loading screen
  if (!cameraPermission || microphonePermission === null || locationPermission === null) {
    return <View />;
  }

  // If permissions are not granted, prompt for permission
  if (!cameraPermission.granted || !microphonePermission || !locationPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera, microphone, and location.</Text>
        <Button onPress={requestCameraPermission} title="Grant Camera Permission" />
      </View>
    );
  }

  // Toggle camera facing direction
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Start recording video and tracking location
  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);

        // Start location tracking with watchPositionAsync for real-time updates
        locationWatcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every second
            distanceInterval: 1, // Update if moved 1 meter
          },
          (newLocation) => {
            setLocation(newLocation.coords); // Update the latest location
            setLocationHistory(prevHistory => [...prevHistory, newLocation.coords]); // Store the location history
          }
        );

        // Start recording video
        const video = await cameraRef.current.recordAsync();
        setVideoUri(video.uri);
      } catch (error) {
        console.warn(error);
        setIsRecording(false);
      }
    }
  };

  // Stop recording video and stop location tracking
  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);

      // Stop the location watcher when recording stops
      if (locationWatcher.current) {
        locationWatcher.current.remove();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity> */}

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
       <TouchableOpacity style={styles.buttonUpdated} >
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
    backgroundColor: '#e0f7fa', // Light blue background for a pleasant feel
  },
  cameraContainer: {
    width: '90%',
    height: '40%', // Reduced the height to avoid overlapping with location history
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
    maxHeight: 150, // Reduced height of location history container
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
