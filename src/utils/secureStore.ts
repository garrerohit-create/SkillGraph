// ============================================================
// SkillGraph — Secure Store Utility
// ============================================================

import { Platform } from 'react-native';

// We use dynamic require to prevent bundling errors if the module is missing
const getSecureStore = () => {
  try {
    return require('expo-secure-store');
  } catch (e) {
    console.warn('expo-secure-store not found. Native storage will be disabled.');
    return null;
  }
};


/** Key used to store the JWT in SecureStore */
const TOKEN_KEY = 'skillgraph_auth_token';

/** Check if SecureStore is available (always false on web without polyfills) */
const isWeb = Platform.OS === 'web';

/** Persist a JWT token securely. */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    const SecureStore = getSecureStore();
    if (SecureStore) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      // Fallback if SecureStore is missing even on native (rare but possible during dev)
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.error('Failed to save auth token', e);
    throw e;
  }
};

/** Retrieve the stored JWT token, or null if none exists. */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    }
    const SecureStore = getSecureStore();
    if (SecureStore) {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return token ?? null;
    }
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to read auth token', e);
    return null;
  }
};

/** Delete the stored JWT token. */
export const deleteAuthToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    const SecureStore = getSecureStore();
    if (SecureStore) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to delete auth token', e);
    throw e;
  }
};
