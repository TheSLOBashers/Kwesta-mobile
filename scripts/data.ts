import AsyncStorage from '@react-native-async-storage/async-storage';

class data {
  key: string; // Field with type annotation
  
  constructor(key: string) {
    this.key = key; // Initialization
  }

  storeData = async (value: string) => {
  try {
    await AsyncStorage.setItem(this.key, value);
  } catch (e) {
    console.error(e);
  }
}

getData = async () => {
  try {
    const value = await AsyncStorage.getItem(this.key);
    if (value !== null) return value;
  } catch (e) {
    console.error(e);
  }
  return null;
}

removeData = async () => {
  try {
    await AsyncStorage.removeItem(this.key);
  } catch(e) {
    // Error removing value
    console.error(e);
  }
}
}

export {data}