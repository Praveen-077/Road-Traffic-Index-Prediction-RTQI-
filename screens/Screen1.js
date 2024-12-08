import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  StatusBar,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import axios from "axios";
import { decode } from "@here/flexpolyline";

const API_KEY = "rFKXuddm2HlVOSynCLI2TNApSTV7i8bTtcOth-0M-lE";
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
  const [roadStatus, setRoadStatus] = useState(null); // Store the server response data
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
      setLocations([]); 
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
      console.error("Error fetching location suggestions:", error);
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

  const sendCoordinates = async () => {
    const response = await fetch("http://192.168.6.77:5000/coordinates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: [selectedSource.latitude, selectedSource.longitude],
        destination: [
          selectedDestination.latitude,
          selectedDestination.longitude,
        ],
      }),
    });

    const data = await response.json();
    console.log(data); // Log the response for debugging
    setRoadStatus(data.data); // Save the road status data
    return data;
  };

  const viewRoute = async () => {
    if (selectedSource && selectedDestination) {
      mapRef.current.fitToCoordinates([selectedSource, selectedDestination], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      const responseData = await sendCoordinates(); // Get the data from the server response

      const getRoutePolyline = async (selectedSource, selectedDestination) => {
        try {
          const params = {
            origin: `${selectedSource.latitude},${selectedSource.longitude}`,
            destination: `${selectedDestination.latitude},${selectedDestination.longitude}`,
            transportMode: "car",
            lang: "en-gb",
            return: "polyline",
            alternatives: 3, // Request three alternate routes
            apiKey: API_KEY,
          };

          const response = await axios.get(routingEndpoint, { params });
          console.log("API Response:", response.data);

          if (response.data.routes && response.data.routes.length > 0) {
            const polylineData = response.data.routes.map(
              (route) => route.sections[0].polyline
            );
            return polylineData;
          } else {
            console.error("No routes found.");
            return null;
          }
        } catch (error) {
          console.error("Error fetching routes:", error);
          return null;
        }
      };

      const polylineData = await getRoutePolyline(
        selectedSource,
        selectedDestination
      );
      if (polylineData) {
        try {
          const decodedRoutes = polylineData.map((polyline) => {
            const waypoints = decode(polyline);
            const updatedWayPoints = waypoints.polyline;
            return updatedWayPoints
              .filter((point) => point !== null && point !== undefined)
              .map((point) => ({
                latitude: point[0],
                longitude: point[1],
              }));
          });

          // Store all the routes for plotting
          setRoute(decodedRoutes);
        } catch (error) {
          console.error("Error decoding polyline:", error);
        }
      } else {
        console.error("No polylines returned from route API.");
      }

    }
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
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="green"
          />
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

        {/* Render multiple polylines */}
        {route &&
          route.length > 0 &&
          route.map((routeCoordinates, index) => (
            <Polyline
              key={index}
              coordinates={routeCoordinates} // Each decoded polyline
              strokeColor={`#${((Math.random() * 0xffffff) << 0).toString(16)}`} // Random color for each route
              strokeWidth={6}
            />
          ))}
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

        <TouchableOpacity onPress={viewRoute} style={styles.button}>
          <Text style={styles.buttonText}>View Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => 
          navigation.navigate("Status Info", {
            source: "13.650670, 79.882425",
            destination: "13.638068, 79.900306",
            RTQI: 8,
            LaneWidth: 3.5,
            LightingCondition: 1,
            TrafficCongestion: 2,
            Potholes: 1,
            Lanes: 3,
            LaneMarking: 1
          })
        }>
          <Text style={styles.buttonText}>Route Details</Text>
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
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  suggestionText: {
    fontSize: 14,
    padding: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default HomeScreen;
