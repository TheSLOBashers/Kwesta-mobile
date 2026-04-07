import { useRouter } from 'expo-router';
import { username } from '@/scripts/username';
import { token } from '@/scripts/token';
import { moderator } from '@/scripts/moderator';
import { StyleSheet } from 'react-native';
import { Pressable, Text } from 'react-native';

interface Props {
  setUsernameAs: (username: string | null) => void;
   setTokenAs: (token: string | null) => void; 
   setMod: (mod: string | null) => void;
    setUserAs: (user: string | null) => void
}


function LogOutButton({setUsernameAs, setTokenAs, setMod, setUserAs} : Props){

    const router = useRouter();

    function handleClick() {
        setUsernameAs(null);
        setTokenAs(null);
        setUserAs(null);
        setMod(null);
        router.replace("../(auth)/Login");
    }

    return (
        <Pressable style={styles.button} onPress={handleClick}>
                <Text style={styles.buttonText}>Logout</Text>
              </Pressable>
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
    marginBottom: 10
  },
  text: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 10
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

export default LogOutButton;