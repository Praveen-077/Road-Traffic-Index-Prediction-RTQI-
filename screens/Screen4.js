import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const SignupScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSignup = () => {
    // Placeholder for signup logic
    console.log("User signed up:", form);
    navigation.navigate("Authentication");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Praveen Kumar"
        value={form.username}
        onChangeText={(value) => handleInputChange("username", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="kumarp3986@gmail.com"
        value={form.email}
        onChangeText={(value) => handleInputChange("email", value)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="*********"
        value={form.password}
        onChangeText={(value) => handleInputChange("password", value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="*********"
        value={form.confirmPassword}
        onChangeText={(value) => handleInputChange("confirmPassword", value)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Signup</Text>
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

export default SignupScreen;
