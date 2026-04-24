// components/Login.jsx
import { useRouter } from 'expo-router';
import { useState } from "react";
//import { ThreeDots } from "react-loader-spinner";
import { useAuth } from '@/components/auth-context';
import * as Device from 'expo-device';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import handleSubmit from '../../../scripts/loginCall';

export default function Login() {
  const { moderator, setUsernameAs, setTokenAs, setMod, token } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: ""
  });

  async function submitForm() {
    try {
      setIsLoading(true);
      await handleSubmit(
        userDetails.username,
        userDetails.password,
        setError,
        setIsLoading,
        setMod,
        setTokenAs,
        Device.brand,
        Device.designName,
        Device.deviceName,
        String(Device.deviceYearClass),
        String(Device.deviceType)
      );
      const isModerator = Boolean(moderator) && moderator;
      setUsernameAs(userDetails.username);
      setUserDetails({ username: "", password: "" });

      if (isModerator) {
        console.log("moderator");
        // router.push("/moderationPortal");
        router.push("/context/(tabs)");
      } else {
        router.push("/context/(tabs)");
      }
    } catch (err: any) {
      //console.log(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.text}>Here is where you would login</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userDetails.username}
        onChangeText={(value) => setUserDetails({ ...userDetails, username: value })}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={userDetails.password}
        onChangeText={(value) => setUserDetails({ ...userDetails, password: value })}
      />

      <Pressable style={styles.button} onPress={submitForm}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>

      {isLoading && <ActivityIndicator style = {styles.loadingIcon} size="large" color="#FF6C00" />}
      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.text}>
        Don't have an account? <Link href="./Signup">Sign Up!</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontFamily: "Cocogoose",
    fontSize: 28,
    marginBottom: 10,
    color: '#ccc'
  },
  text: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 10,
    color: '#ccc'
  },
  label: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    color: '#ccc'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#ccc',
    padding: 10,
    borderRadius: 5
  },
  button: {
    marginTop: 20,
    backgroundColor: 'orange',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10
  },
  loadingIcon: { margin: "10%" },
});