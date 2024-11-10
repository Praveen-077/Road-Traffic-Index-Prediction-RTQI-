import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const StatusScreen = () => {
  const route = useRoute();
  const { latitude, longitude } = route.params || {}; 

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Road Status</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>Latitude: <Text style={styles.value}>{latitude || 'Unknown'}</Text></Text>
        <Text style={styles.info}>Longitude: <Text style={styles.value}>{longitude || 'Unknown'}</Text></Text>
        <Text style={styles.info}>RTQI: <Text style={styles.value}>_____</Text></Text>
        <Text style={styles.info}>Type of Road: <Text style={styles.value}>_____</Text></Text>
        <Text style={styles.info}>Traffic Level: <Text style={styles.value}>_____</Text></Text>
        <Text style={styles.info}>Number of Potholes: <Text style={styles.value}>_____</Text></Text>
        <Text style={styles.info}>Number of Lanes: <Text style={styles.value}>_____</Text></Text>
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
    width: '100%', 
    alignItems: "flex-start", 
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
