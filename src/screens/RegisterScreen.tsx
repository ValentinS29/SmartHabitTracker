import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Screen } from "../components/Screen";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/auth/authStore";
import { isValidEmail, isValidPassword } from "../utils/validators";

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    // Validate
    let hasError = false;
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }
    if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      console.log("🔐 [REGISTER SCREEN] Attempting registration:", email);
      await register(email, password);
      console.log("✅ [REGISTER SCREEN] Registration successful");
      Alert.alert("Success!", "Account created successfully. Please log in.", [
        { text: "OK", onPress: onNavigateToLogin },
      ]);
    } catch (error: any) {
      console.error("❌ [REGISTER SCREEN] Registration failed:", error.message);
      Alert.alert("Registration Failed", error.message || "Please try again");
    }
  };

  return (
    <Screen scrollable={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry={true}
            error={passwordError}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry={true}
            error={confirmError}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
