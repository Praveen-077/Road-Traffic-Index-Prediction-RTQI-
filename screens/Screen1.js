import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StatusBar,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { TouchableOpacity } from "react-native";

const API_KEY = "wNEepkL49mvgVH6dywG7SQL8RSVUDTBsC6vSqprkTKw";
const geocodeEndpoint = "https://geocode.search.hereapi.com/v1/geocode";
const routingEndpoint = "https://router.hereapi.com/v8/routes";

const HomeScreen = ({ navigation }) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);
  const [polylineColor, setPolylineColor] = useState("blue"); // For dynamic color change

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
    try {
      const { data } = await axios.get(geocodeEndpoint, {
        params: {
          q: query,
          apiKey: API_KEY,
        },
      });
      setLocations(data.items);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const getDirections = async () => {
    if (!selectedSource || !selectedDestination) return;

    try {
      const { data } = await axios.get(routingEndpoint, {
        params: {
          apiKey: API_KEY,
          transportMode: "car",
          origin: `${selectedSource.latitude},${selectedSource.longitude}`,
          destination: `${selectedDestination.latitude},${selectedDestination.longitude}`,
          return: "polyline,summary",
        },
      });

      if (data.routes && data.routes.length > 0) {
        // Extract the polyline from the first route's first section
        const polyline = data.routes[0].sections[0].polyline;
        console.log(data);

        // Decode polyline into a set of coordinates
        const decodedPolyline = decodePolyline(polyline);

        // Set the decoded polyline to state to render on the map
        setRoute(decodedPolyline);
        // console.log(route);

        // Optional: Change polyline color based on route length
        if (data.routes[0].sections[0].summary.length > 50) {
          setPolylineColor("green");
        } else {
          setPolylineColor("blue");
        }
      } else {
        console.warn("No route found in response.");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const decodePolyline = (encodedPolyline) => {
    let polyline = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encodedPolyline.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encodedPolyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encodedPolyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      polyline.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return polyline;
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
      setLocations([]);
    } else {
      console.warn("Invalid coordinates for location:", location);
    }
  };

  const renderLocationSuggestions = () => {
    return locations.length ? (
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
        {route.length > 0 && (
          <Polyline
            coordinates={route} // Use decoded polyline coordinates
            strokeColor={polylineColor} // Use dynamic color for polyline
            strokeWidth={4}
            lineDashPattern={[10, 5]} // Optional styling for dashed line
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
        {renderLocationSuggestions()}
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={(input) =>
            handleLocationInputChange(input, "destination")
          }
          placeholder="Destination"
        />
        {renderLocationSuggestions()}

        <TouchableOpacity onPress={getDirections} style={styles.button}>
          <Text style={styles.buttonText}>Get Directions</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;
