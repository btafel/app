import React, { useReducer, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInputMask } from 'react-native-masked-text';
import moment from 'moment';
import { MainStackNavProps } from '../../navigation/types';
import Touchable from '../../components/Touchable';
import Colors from '../../constants/Colors';
import { savePreferences } from '../../utils/config';
import RadioButtons from '../../components/RadioButtons';

function reducer(state, newState) {
  return { ...state, ...newState };
}

const UserInfo = ({ navigation }: MainStackNavProps<'UserInfo'>) => {
  const [state, setState] = useReducer(reducer, {});
  const [canSave, setCanSave] = useState(false);
  const dobRef = useRef<any | undefined>();

  const handleChange = key => value => {
    setState({ [key]: value });
  };

  useEffect(() => {
    if (
      (state.phoneNumber || '') !== '' &&
      (state.gender || '') !== '' &&
      isValidDate()
    ) {
      setCanSave(true);
    } else {
      setCanSave(false);
    }
  }, [state]);

  function isValidDate() {
    if (state.bob || '' !== '') {
      return false;
    }
    return moment(state.dob, 'D/M/YYYY', true).isValid();
  }
  async function handleContinue() {
    await savePreferences({ userInfo: state });
    navigation.navigate('Main');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-start' }}
        >
          <Text style={styles.text}>
            Necesitamos algunos datos tuyos para poder realizar un diagnóstico
            más preciso y contactarte si necesitas ayuda.
          </Text>
          <TextInput
            placeholder="# Celular"
            value={state.phoneNumber}
            onChangeText={handleChange('phoneNumber')}
            autoFocus
            keyboardType="phone-pad"
            style={styles.input}
          />
          <RadioButtons
            label="Sexo"
            options={[
              {
                key: 'M',
                text: 'M',
              },
              {
                key: 'F',
                text: 'F',
              },
            ]}
            onChange={handleChange('gender')}
          />
          {Platform.OS === 'web' ? (
            <TextInput
              placeholder="Fecha de Nacimiento (DD/MM/YYYY)"
              value={state.dob}
              onChangeText={handleChange('dob')}
              style={styles.input}
            />
          ) : (
            <TextInputMask
              placeholder="Fecha de Nacimiento (DD/MM/YYYY)"
              type="datetime"
              options={{
                format: 'DD/MM/YYYY',
              }}
              value={state.dob}
              onChangeText={handleChange('dob')}
              style={styles.input}
              ref={dobRef}
            />
          )}
          <Touchable
            enabled={canSave}
            style={[
              styles.button,
              styles.activeButton,
              { width: undefined, margin: 10 },
              !canSave && { backgroundColor: '#ccc' },
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, styles.activeButtonText]}>
              Continuar
            </Text>
          </Touchable>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Text style={styles.footerText}>
              Gestionamos tu información de forma segura y para uso exclusivo
              oficial.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
  },
  text: {
    fontSize: 14,
    fontWeight: '300',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '200',
    textAlign: 'center',
  },
  input: {
    marginVertical: 20,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  button: {
    flexDirection: 'row',
    minHeight: 50,
    width: '49%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
    }),
  },
  buttonText: {
    padding: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  activeButton: {
    backgroundColor: Colors.primaryColor,
  },
  activeButtonText: { color: '#fff' },
});

export default UserInfo;
