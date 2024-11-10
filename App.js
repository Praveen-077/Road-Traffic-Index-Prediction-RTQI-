import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { Animated } from "react-native"; // Import Animated for tabBarLabel animation

import HomeScreen from "./screens/Screen1";
import StatusScreen from "./screens/Screen2";
import HelpScreen from "./screens/Screen3";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size, color }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "map-marker";
              size = focused ? 25 : 20;
              color = focused ? "#f0f" : "#444";
            } else if (route.name === "Status") {
              iconName = "road";
              size = focused ? 25 : 20;
              color = focused ? "#000" : "#555";
            } else if (route.name === "Data") {
              iconName = "info-circle";
              size = focused ? 25 : 20;
              color = focused ? "green" : "#555";
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ focused }) => {
            return (
              <Animated.Text
                style={{
                  fontSize: focused ? 12 : 10,
                  color: focused ? "#f0f" : "#555",
                  transform: [{ scale: focused ? 1.2 : 1 }],
                }}
              >
                {route.name}
              </Animated.Text>
            );
          },
          tabBarActiveTintColor: "#f0f",
          tabBarInactiveTintColor: "#555",
          tabBarActiveBackgroundColor: "#fff",
          tabBarInactiveBackgroundColor: "#999",
          tabBarShowLabel: false,
          tabBarLabelStyle: { fontSize: 14 },
          tabBarStyle: {
            display: "flex",
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Status" component={StatusScreen} />
        <Tab.Screen name="Data" component={HelpScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
