import React, { useReducer, useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { MainStackNavProps } from '../../navigation/types';
import { savePreferences, getPreferences } from '../../utils/config';
import { syncUserInfoDataWithServer } from '../../utils/syncStorageHelper';
import { Input, Divider, Text, ListItem } from 'react-native-elements';
import i18n from 'i18n-js';

const optlist = [
  {
    name: 'gps_history',
    key: 'gps',
    subtitle: 'gps_history_subtitle',
  },
  {
    name: 'bt_tracking',
    key: 'bluetooth',
    subtitle: 'bt_tracking_subtitle',
  },
]


const GRAY_COLOR = 'rgba(147, 147, 147, 1)';


function reducer(state, newState) {
  return { ...state, ...newState };
}

const Settings = ({ navigation }: MainStackNavProps<'Settings'>) => {
  const [state, setState] = useReducer(reducer, { gps: true, bluetooth: true });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const preferences = await getPreferences();
      if (preferences.userInfo) {
        state.gps = !(preferences.userInfo.gps === false);
        state.bluetooth = !(preferences.userInfo.bluetooth === false);
      }
      setState(state);
      setLoaded(true);
    }
    loadData();
  }, []);

  const handleChange = (key) => async (value) => {
    setState({ [key]: value });
    const preferences = await getPreferences();
    preferences.userInfo[[key]] = value;
    preferences.userInfo.infoSent = false;
    await savePreferences(preferences);
    //TODO send every time??
    syncUserInfoDataWithServer();
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ width: '100%' }}>
        <View
          style={{
            flex: 1,
            padding: 20,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            
            <View>
            <Text h4>{i18n.t('Config_Tracking')}</Text>
              {
                optlist.map((l, i) => (
                  <ListItem
                    key={i}
                    title={i18n.t(l.name)}
                    subtitle={i18n.t(l.subtitle)}
                    switch={{value: state[l.key], onValueChange: handleChange(l.key)}}
                    bottomDivider
                  />
                ))
              }
            </View>


            <TouchableWithoutFeedback
              onPress={() => navigation.navigate('UserInfo')}
            >
              <View style={styles.block}>
            <Text h4>{i18n.t('Config_Personal_data')}</Text>
                <Icon
                  name={
                    Platform.OS === 'ios'
                      ? 'ios-arrow-forward'
                      : 'md-arrow-forward'
                  }
                  size={30}
                  color={GRAY_COLOR}
                  // backgroundColor={Colors.primaryColor}
                  style={{ paddingRight: 5, alignSelf: 'center' }}
                />
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderBottomColor: '#ccc',
    // borderBottomWidth: 1,
    // borderTopColor: '#ccc',
    // borderTopWidth: 1,
    width: '100%',
    marginBottom: 30,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'scroll',
    maxHeight: '100%',
    width: '100%',
  },
  logo: {
    width: 150,
    height: 100,
    marginHorizontal: 'auto',
  },
  text: {
    fontSize: 14,
    fontWeight: '300',
  },
});

export default Settings;
