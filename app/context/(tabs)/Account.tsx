import { useAuth } from '@/components/auth-context';
import Devices from '@/components/Devices';
import blockDeviceCall from '@/scripts/blockDeviceCall';
import getDevicesCall from '@/scripts/getDevicesCall';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LogOutButton from "../../../components/LogOutButton";

export default function Account() {
  const { username, setUsernameAs, setTokenAs, setMod, setUserAs, token } = useAuth();
  const [devices, setDevices] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>("loading");

  useEffect(() => {
    const loadData = async () => {
      let d = await getDevicesCall(setIsLoading, setError, token).then((val) => {
        setError(null);
        return val;
      });
      setDevices(d);
    }
    loadData();
  }, [])

  async function handleBlock(device: any) {

    blockDeviceCall(token, device).then(() => {
      setDevices((prevDevices: any) =>
        prevDevices.map((p: any) =>
          p.device === device
            ? {
              ...p,
              allowed: false
            }
            : p
        )
      );
    })
      .catch((error: any) => {
        alert("Blocking device failed." + error.message)
      })
  }

  return (
    <ScrollView>
      <View style={styles.container}>

        <Text style={styles.title}>Account</Text>
        <Text style={styles.text}>Username: {username}</Text>
        {!error ? <Devices devices={devices} handleBlock={handleBlock}></Devices> : null}

        <LogOutButton setUsernameAs={setUsernameAs} setTokenAs={setTokenAs} setMod={setMod} setUserAs={setUserAs}></LogOutButton>
      </View>
    </ScrollView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    marginTop: "5%"
  },
  title: {
    fontFamily: "Cocogoose",
    fontSize: 28,
    marginTop: 20,
    marginBottom: 12,
    color: '#ccc'
  },
  title2: {
    fontFamily: "Cocogoose",
    fontSize: 22,
    marginBottom: 10,
    color: '#ccc'
  },
  text: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 9,
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
  dButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  dButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10
  },
  devices: {
    padding: "4%",

  }
});