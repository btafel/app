import { AsyncStorage } from 'react-native';

export interface UserPreferences {
  showOnboarding?: boolean;
  userInfo?: any;
}

const defaultPreferences: UserPreferences = {
  showOnboarding: true,
  userInfo: undefined,
};

let _preferences: UserPreferences;

export async function getPreferences(): Promise<UserPreferences> {
  if (!_preferences) {
    const pref = await AsyncStorage.getItem('user_preferences');
    _preferences = pref ? JSON.parse(pref) : defaultPreferences;
  }
  return _preferences;
}

export async function savePreferences(preferences: UserPreferences) {
  const newPreferences = { ..._preferences, ...preferences };
  await AsyncStorage.setItem(
    'user_preferences',
    JSON.stringify(newPreferences),
  );
  _preferences = newPreferences;
}

export async function clearPreferences() {
  await AsyncStorage.removeItem('user_preferences');
  _preferences = null;
}

export const SQLITE_DB_NAME = 'cotrack.db';
export const SQLITE_DB_VERSION = 1;
