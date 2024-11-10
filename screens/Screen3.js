import { View, Text, StyleSheet, Button } from "react-native";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { useEffect, useState } from "react";

const HelpScreen = () => {
  const [accelerometerData, setAccelerometerData] = useState({});
  const [gyroscopeData, setGyroscopeData] = useState({});
  const [isActive, setIsActive] = useState(false); // State to control the sensor

  useEffect(() => {
    let accelerometerSubscription;
    let gyroscopeSubscription;

    if (isActive) {
      // Subscribe to accelerometer updates
      accelerometerSubscription = Accelerometer.addListener((data) => {
        setAccelerometerData(data);
        console.log("Accelerometer data:", data);
      });

      // Subscribe to gyroscope updates
      gyroscopeSubscription = Gyroscope.addListener((data) => {
        setGyroscopeData(data);
        console.log("Gyroscope data:", data); 
      });
    }

    return () => {
      // Cleanup listeners when the component unmounts or when the sensor is deactivated
      accelerometerSubscription && accelerometerSubscription.remove();
      gyroscopeSubscription && gyroscopeSubscription.remove();
    };
  }, [isActive]); 

  const toggleSensors = () => {
    setIsActive((prevState) => !prevState); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sensor Data</Text>

      <View style={styles.sensorContainer}>
        <Text style={styles.sensorTitle}>Accelerometer</Text>
        <Text style={styles.sensorValue}>x: {accelerometerData.x?.toFixed(2) || 0}</Text>
        <Text style={styles.sensorValue}>y: {accelerometerData.y?.toFixed(2) || 0}</Text>
        <Text style={styles.sensorValue}>z: {accelerometerData.z?.toFixed(2) || 0}</Text>
      </View>

      <View style={styles.sensorContainer}>
        <Text style={styles.sensorTitle}>Gyroscope</Text>
        <Text style={styles.sensorValue}>x: {gyroscopeData.x?.toFixed(2) || 0}</Text>
        <Text style={styles.sensorValue}>y: {gyroscopeData.y?.toFixed(2) || 0}</Text>
        <Text style={styles.sensorValue}>z: {gyroscopeData.z?.toFixed(2) || 0}</Text>
      </View>

      <Button title={isActive ? "Stop Sensors" : "Start Sensors"} onPress={toggleSensors} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  sensorContainer: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff", 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, 
    width: "80%", 
  },
  sensorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#15655f", 
  },
  sensorValue: {
    fontSize: 18,
    marginVertical: 5,
    color: "#666", 
  },
});

export default HelpScreen;
