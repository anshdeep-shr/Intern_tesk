import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'pms_jwt_auth_token';
const USER_KEY = 'pms_auth_user_data';

export const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
};

export const deleteToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
};

export const saveUser = async (user: any): Promise<void> => {
  const jsonValue = JSON.stringify(user);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(USER_KEY, jsonValue);
  } else {
    await SecureStore.setItemAsync(USER_KEY, jsonValue);
  }
};

export const getUser = async (): Promise<any | null> => {
  let jsonValue: string | null = null;
  if (Platform.OS === 'web') {
    jsonValue = await AsyncStorage.getItem(USER_KEY);
  } else {
    jsonValue = await SecureStore.getItemAsync(USER_KEY);
  }
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};
