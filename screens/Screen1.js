import React, { useState, useEffect, useRef } from "react"; // Import useRef
import {
  Text,
  View,
  TextInput,
  StatusBar,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { TouchableOpacity } from "react-native";

const API_KEY = "wNEepkL49mvgVH6dywG7SQL8RSVUDTBsC6vSqprkTKw";
const geocodeEndpoint = "https://geocode.search.hereapi.com/v1/geocode";

const HomeScreen = ({ navigation }) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const mapRef = useRef(null); // MapView reference

  useEffect(() => {
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Permission to access location was denied. Please enable it in your device settings."
        );
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setCurrentLocation(currentLocation.coords);
    };
    getPermissions();
  }, []);

  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setLocations([]); // Clear suggestions if query is empty
      return;
    }

    try {
      const { data } = await axios.get(geocodeEndpoint, {
        params: {
          q: query,
          apiKey: API_KEY,
        },
      });
      setLocations(data.items);
    } catch (error) {
      console.error(
        "Error fetching location suggestions:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleLocationInputChange = (input, type) => {
    if (type === "source") {
      setSource(input);
    } else {
      setDestination(input);
    }
    setFocusedInput(type);
    fetchLocationSuggestions(input);
  };

  const handleSelectLocation = (location) => {
    const { position } = location;

    if (position && position.lat !== undefined && position.lng !== undefined) {
      const coordinates = { latitude: position.lat, longitude: position.lng };

      if (focusedInput === "source") {
        setSelectedSource(coordinates);
        setSource(location.address.label);
      } else if (focusedInput === "destination") {
        setSelectedDestination(coordinates);
        setDestination(location.address.label);
      }

      setLocations([]); // Clear suggestions after selection
      setFocusedInput(null); // Clear the focused input to stop rendering suggestions
    } else {
      console.warn("Invalid coordinates for location:", location);
    }
  };

  const renderLocationSuggestions = (inputType) => {
    return focusedInput === inputType && locations.length ? (
      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleSelectLocation(item)}>
            <Text style={styles.suggestionText}>{item.address.label}</Text>
          </Pressable>
        )}
      />
    ) : null;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} // Reference for map view
        style={styles.map}
        initialRegion={{
          latitude: currentLocation
            ? currentLocation.latitude
            : 19.864855074776944,
          latitudeDelta: 0.0922,
          longitude: currentLocation
            ? currentLocation.longitude
            : 78.37408253923059,
          longitudeDelta: 0.0421,
        }}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Current Location" />
        )}
        {selectedSource && (
          <Marker
            coordinate={selectedSource}
            title="Source Location"
            pinColor="blue"
          />
        )}
        {selectedDestination && (
          <Marker
            coordinate={selectedDestination}
            title="Destination Location"
            pinColor="red"
          />
        )}
      </MapView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={(input) => handleLocationInputChange(input, "source")}
          placeholder="Source"
        />
        {renderLocationSuggestions("source")}

        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={(input) =>
            handleLocationInputChange(input, "destination")
          }
          placeholder="Destination"
        />
        {renderLocationSuggestions("destination")}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
});

export default HomeScreen;
