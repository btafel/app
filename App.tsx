import * as React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';

import { SplashScreen } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { syncLocalDataWithServer } from './utils/syncStorageHelper';
import { initAndUpdateDatabase } from './utils/localStorageHelper';

import useLinking from './navigation/useLinking';
import { getPreferences, UserPreferences } from './utils/config';
import MainNavigator from './navigation/MainNavigator';
import Layout from './constants/Layout';

import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

// Set the key-value pairs for the different languages you want to support.
i18n.translations = {
  es: {
    slide1:
      'CoTrack necesita saber tu ubicación para avisarte en tiempo real si en tu recorrido estuviste en contacto cercano con alguna persona contagiada',
    slide2:
      'Si presentás síntomas o creés haber estado en contacto con alguien infectado, CoTrack te puede ayudar a realizar un evaluación y aconsejarte qué hacer según el resultado',
    slide3:
      'CoTrack te brinda información completa y confiable para ayudar a prevenir la infección, medidas para resguardarse e información útil y actualizada',
    next: 'Siguiente',
    prev: 'Anterior',
    done: 'Finalizar',
    title_signup:
      'Necesitamos algunos datos tuyos para poder realizar un evaluación más preciso y contactarte si necesitas ayuda.',
  },
  it: { 
      slide1: 'slide 1 en italiano',
      done: 'Finalizza',
  },
};
i18n.locale = 'it'; //Localization.locale.startsWith('it') ? 'it' : 'es';
// Set the locale once at the beginning of your app.
// i18n.locale = Localization.locale;
// When a value is missing from a language it'll fallback to another language with the key present.
i18n.fallbacks = true;

export default function App(props) {
  // Disable Font Scaling
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.allowFontScaling = false;

  // const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  // const [showOnboarding, setShowOnboarding] = React.useState(true);
  // const [preferences, setPreferences] = React.useState<
  //   UserPreferences | undefined
  // >();
  const [initialNavigationState, setInitialNavigationState] = React.useState<
    any
  >();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();
        initAndUpdateDatabase();
        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          // ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });

        const preventionImages = [
          require('./assets/images/logo.png'),
          require('./assets/images/prevention/coronavirus.png'),
          require('./assets/images/prevention/fever.png'),
          require('./assets/images/prevention/spread.png'),
          require('./assets/images/prevention/transmission.png'),
          require('./assets/images/prevention/hygiene.png'),
          require('./assets/images/prevention/travel.png'),
          require('./assets/images/prevention/quarantine.png'),
          require('./assets/images/prevention/washing.png'),
          require('./assets/images/prevention/warning.png'),
        ];

        const cacheImages = preventionImages.map((image) => {
          return Asset.fromModule(image).downloadAsync();
        });

        await Promise.all(cacheImages);

        // await clearPreferences();
        const preferences = await getPreferences();
        // setPreferences(preferences);

        const userInfo = preferences.userInfo;
        const initialRoute = preferences.showOnboarding
          ? 'Help'
          : userInfo &&
            userInfo.acceptedTerms === Constants.manifest.extra.termsVersion
          ? 'Main'
          : 'UserInfo';

        // containerRef.current?.navigate(initialRoute);

        containerRef.current?.reset({
          index: 0,
          routes: [{ name: initialRoute }],
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        // setLoadingComplete(true);

        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
    syncLocalDataWithServer();
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && <StatusBar barStyle="default" />}

      <NavigationContainer
        ref={containerRef}
        initialState={initialNavigationState}
      >
        <MainNavigator />
      </NavigationContainer>
    </View>
  );
}
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        maxWidth: Layout.maxWidth,
        margin: 'auto',
        width: '100%',
      },
    }),
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  image: {
    width: 320,
    height: 320,
  },
  text: {
    color: 'rgba(0,0,0,0.9)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '200',
  },
  title: {
    fontSize: 22,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 16,
  },
});
