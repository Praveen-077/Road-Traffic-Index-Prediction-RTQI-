import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });

  const handleInputChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleLogin = () => {
    // Placeholder for login logic
    console.log("User logged in:", form);
    navigation.navigate("Home"); // Redirect to the Home screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="kumarp3986@gmail.com"
        value={form.usernameOrEmail}
        onChangeText={(value) => handleInputChange("usernameOrEmail", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="*********"
        value={form.password}
        onChangeText={(value) => handleInputChange("password", value)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e0f7fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
