import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const StatusScreen = ({ route}) => {
  // const route = useRoute();
  const { source, destination, RTQI, LaneWidth, LightingCondition, TrafficCongestion, Potholes, Lanes, LaneMarking } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Road Status</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          Source: <Text style={styles.value}>{source || "13.650670, 79.882425"}</Text>
        </Text>
        <Text style={styles.info}>
          Destination: <Text style={styles.value}>{destination || "13.638068, 79.900306"}</Text>
        </Text>
        <Text style={styles.infoRTQI}>
          RTQI: <Text style={styles.value}>{RTQI || "8"}</Text>
        </Text>
        <Text style={styles.info}>
          Lane Width: <Text style={styles.value}>{LaneWidth || "3.5"}</Text>
        </Text>
        <Text style={styles.info}>
          Lighting Condition: <Text style={styles.value}>{LightingCondition || "1"}</Text>
        </Text>
        <Text style={styles.info}>
          Traffic Congestion: <Text style={styles.value}>{TrafficCongestion || "2"}</Text>
        </Text>
        <Text style={styles.info}>
          Number of Potholes: <Text style={styles.value}>{Potholes || "1"}</Text>
        </Text>
        <Text style={styles.info}>
          Number of Lanes: <Text style={styles.value}>{Lanes || "3"}</Text>
        </Text>
        <Text style={styles.info}>
          Lane Marking: <Text style={styles.value}>{LaneMarking || "1"}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaeaea",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2E7D32",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    width: "100%",
    alignItems: "flex-start",
  },
  infoRTQI: {
    fontSize: 24,
    marginBottom: 15,
    color: "#555",
    marginLeft: 75,
    backgroundColor: "#ccc",
    padding: 5,
    width: 80,
    borderRadius: 10,
  },
  info: {
    fontSize: 18,
    marginBottom: 15,
    color: "#555",
  },
  value: {
    fontWeight: "bold",
    color: "#F57C20",
  },
});

export default StatusScreen;
