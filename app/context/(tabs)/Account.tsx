import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import LogOutButton from "../../../components/LogOutButton"
import { username } from '@/scripts/username';
import { useAuth } from '@/components/auth-context';

export default function Account() {
  const { username, setUsernameAs, setTokenAs, setMod, setUserAs } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.text}>Username: {username}</Text>
      <LogOutButton setUsernameAs = {setUsernameAs} setTokenAs={setTokenAs} setMod={setMod} setUserAs={setUserAs}></LogOutButton>
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
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
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
  }
});