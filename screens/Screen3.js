import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function HelpScreen() {
  const [facing, setFacing] = useState("back");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const cameraRef = useRef(null);
  const locationWatcher = useRef(null);

  const [numButtons, setNumButtons] = useState(4); 

  useEffect(() => {
    (async () => {
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      setMicrophonePermission(micStatus === "granted");

      const { status: locStatus } =
        await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locStatus === "granted");
    })();
  }, []);

  if (
    !cameraPermission ||
    microphonePermission === null ||
    locationPermission === null
  ) {
    return <View />;
  }

  if (
    !cameraPermission.granted ||
    !microphonePermission ||
    !locationPermission
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to use the camera, microphone, and location.
        </Text>
        <Button
          onPress={requestCameraPermission}
          title="Grant Camera Permission"
        />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
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
            setLocationHistory((prevHistory) => [
              ...prevHistory,
              newLocation.coords,
            ]);
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
  
      // Call sendVideoData after recording stops to upload the video
      sendVideoData();
    }
  };  

  const sendVideoData = async () => {
    if (!videoUri) {
      alert("No video recorded!");
      return;
    }
  
    const formData = new FormData();
  
    // Create a file object to send the video
    const videoFile = {
      uri: videoUri,
      name: "video.mp4", // You can change this to the name you want for the video file
      type: "video/mp4", // Adjust MIME type if needed based on the video format
    };
  
    // Append the video file to FormData
    formData.append("file", videoFile);
    formData.append("path", "0"); // Add any other fields if required by your server
  
    try {
      // Send POST request to your server's upload endpoint
      const response = await fetch("http://192.168.6.77:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Content type must be set correctly for file upload
        },
      });
  
      if (response.ok) {
        const result = await response.json(); // If your server returns JSON, you can handle it here
        console.log("Upload successful:", result);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error occurred during upload:", error);
    }
  };
  
  const DynamicButtons = ({ numberOfButtons }) => {
    // Create an array with the given number of buttons
    const buttonsArray = new Array(numberOfButtons).fill(null);
  
    const handleButtonPress = (index) => {
      console.log(`Button ${index + 1} pressed`);
    };
  
    return (
      <View style={styles.container}>
        {buttonsArray.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleButtonPress(index)}
          >
            <Text style={styles.buttonText}>Path {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <DynamicButtons numberOfButtons={numButtons} />
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="video"
          videoQuality={"720p"}
          mute={"true"}
        />
      </View>

      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={startRecording}
          >
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={stopRecording}
          >
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Current Location:{" "}
            {`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
  },
  cameraContainer: {
    width: "90%",
    height: "40%",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#000",
    overflow: "hidden",
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
  },
  buttonUpdated: {
    marginTop: 15,
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#e60000",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  buttonTextUpdated: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  videoContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  videoText: {
    fontSize: 16,
    color: "black",
  },
  locationContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "black",
  },
  locationHistoryContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "90%",
    maxHeight: 150,
  },
  locationHistoryText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  scrollView: {
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});
