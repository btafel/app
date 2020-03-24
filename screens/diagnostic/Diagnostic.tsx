import React, { useReducer, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  StatusBar,
  AsyncStorage,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';

import { QuestResults } from './types';
import Colors from '../../constants/Colors';
import Touchable from '../../components/Touchable';
import { SQLITE_DB_NAME } from '../../utils/config';

const isWeb = Platform.OS === 'web';
const db = !isWeb && SQLite.openDatabase(SQLITE_DB_NAME);

const initialState = {
  symptoms: {},
  questions: {},
};

function reducer(state, newState) {
  return { ...state, ...newState };
}

function QuestButton({ id, text, onPress, selected }) {
  const isSelected = selected[id] === 'yes';

  const handlePress = () => {
    onPress(id);
  };

  return (
    <Touchable
      style={[styles.button, isSelected && styles.activeButton]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, isSelected && styles.activeButtonText]}>
        {text}
      </Text>
    </Touchable>
  );
}

function YesNoButtons({ id, onPress, state }) {
  const isYes = state[id] === 'yes';
  const isNo = state[id] === 'no';

  const handleYesPress = () => {
    onSelect('yes');
  };
  const handleNoPress = () => {
    onSelect('no');
  };

  const onSelect = value => {
    const newState = { ...state, [id]: value };
    onPress(newState);
  };

  return (
    <>
      <Touchable
        style={[styles.button, isYes && styles.activeButton]}
        onPress={handleYesPress}
      >
        <Text style={[styles.buttonText, isYes && styles.activeButtonText]}>
          Si
        </Text>
      </Touchable>
      <Touchable
        style={[styles.button, isNo && styles.activeButton]}
        onPress={handleNoPress}
      >
        <Text style={[styles.buttonText, isNo && styles.activeButtonText]}>
          No
        </Text>
      </Touchable>
    </>
  );
}

interface QuestionaryProps {
  onShowResults: (value: QuestResults) => void;
}

function Questionary({ onShowResults }: QuestionaryProps) {
  const [state, setState] = useReducer(reducer, initialState);
  const [disabled, setDisabled] = useState(true);

  const onSelectSymptoms = useCallback(
    id => {
      const newSelected = {
        ...state.symptoms,
        [id]: state.symptoms[id] === 'yes' ? 'no' : 'yes',
      };
      setState({ symptoms: newSelected });
    },
    [state.symptoms],
  );

  useEffect(() => {
    const hasSymptoms = Object.keys(state.symptoms).find(
      k => state.symptoms[k] === 'yes',
    );
    const hasAnswers = Object.keys(state.questions).length >= 6;
    //if (!!hasSymptoms && !!hasAnswers) {
    if (!!hasAnswers) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [state]);

  const handleShowResults = result => {
    console.log('Diagnostic saved!');
    onShowResults(result);
    scrollRef.current.scrollTo({ x: 0, animated: false });
  };

  const handlePress = async () => {
    let result: QuestResults;
    function hasExtraConditions() {
      if (
        state.questions['elder'] === 'yes' ||
        state.questions['pregnant'] === 'yes' ||
        state.questions['pathology'] === 'yes'
      ) {
        result = 'negative';
      } else {
        result = 'neutral';
      }
    }
    if (
      state.symptoms['fever'] === 'yes' &&
      state.questions['travel'] === 'yes' &&
      state.questions['confirmedContact'] === 'yes' &&
      state.questions['suspectedContact'] === 'yes'
    ) {
      if (state.symptoms['breath']) {
        result = 'negative';
      } else {
        hasExtraConditions();
      }
    } else {
      result = 'positive';
    }

    let location;
    try {
      // location = await Location.getLastKnownPositionAsync();
      location = await Location.getCurrentPositionAsync();
    } catch (e) {
      console.log('Could not get last known location', e);
      location = '';
    }

    if (isWeb) {
      const diagnostics =
        JSON.parse(await AsyncStorage.getItem('diagnostics')) || [];
      const now = new Date().getTime();
      await AsyncStorage.setItem(
        `diagnostics`,
        JSON.stringify([
          ...diagnostics,
          {
            answers: state,
            result,
            location,
            created_at: now,
          },
        ]),
      );
      handleShowResults(result);
    } else {
      db.transaction(
        tx => {
          tx.executeSql(
            'insert into diagnostics (answers, result, location, created_at) values (?, ?, ?, strftime("%s","now"))',
            [state, result, location],
          );
          // tx.executeSql('select * from diagnostics', [], (_, { rows }) =>
          //   console.log(rows),
          // );
        },
        (error: SQLError) =>
          console.log('Error inserting values', error.message),
        () => {
          handleShowResults(result);
        },
      );
    }
  };

  const handleYesNoPress = values => {
    setState({ questions: values });
  };

  const scrollRef = React.useRef<ScrollView | null>(null);

  useScrollToTop(scrollRef);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.questContainer}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
      >
        <Text style={styles.title}>
          Si tenés algún malestar y pensás que puede estar ligado al contagio de
          coronavirus, podemos realizar un{' '}
          <Text style={{ fontWeight: '700' }}>
            auto-diagnóstico de detección temprana
          </Text>{' '}
          respondiendo una serie de preguntas, detallando los síntomas que estás
          teniendo y si creés haber estado en contacto con alguien infectado.
        </Text>
        <Text style={styles.section}>Dolencias y síntomas</Text>
        <View style={styles.questButtons}>
          <QuestButton
            id="fever"
            text="Fiebre"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="cough"
            text="Tos seca"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="throat"
            text="Dolor de garganta"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="breath"
            text="Dificultad para respirar"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="headache"
            text="Dolor de cabeza"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="diarrhea"
            text="Descompostura o diarrea"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
          <QuestButton
            id="tiredness"
            text="Cansancio general"
            onPress={onSelectSymptoms}
            selected={state.symptoms}
          />
        </View>
        <Text style={styles.section}>Contacto cercano</Text>
        <Text style={styles.subtitle}>
          ¿Volviste de viaje de algún país con algún caso confirmado de
          coronavirus?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="travel"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
        <Text style={styles.subtitle}>
          ¿Tuviste contacto estrecho con alguien con diagnóstico confirmado?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="confirmedContact"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
        <Text style={styles.subtitle}>
          ¿Conviviste con alguien que sea caso sospechoso o confirmado?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="suspectedContact"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
        <Text style={styles.section}>Situación actual y antecedentes</Text>
        <Text style={styles.subtitle}>¿Tenés 60 años o más?</Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="elder"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
        <Text style={styles.subtitle}>
          ¿Estás embarazada o en contacto con un recién nacido?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="pregnant"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
        <Text style={styles.subtitle}>
          ¿Sufrís alguna de las siguientes patologías?{`\n\n`} - Cáncer
          {`\n`} - Colesterol alto {`\n`} - Diabetes {`\n`} - Enfermedades
          cardiovasculares {`\n`} - Enfermedades respiratorias {`\n`} -
          Esclerosis múltiple
          {`\n`} - Hipertensión arterial {`\n`} - Hipo o hipertiroidismo
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="pathology"
            onPress={handleYesNoPress}
            state={state.questions}
          />
        </View>
      </ScrollView>
      <Touchable
        enabled={!disabled}
        style={[
          styles.button,
          styles.activeButton,
          { width: undefined, margin: 10 },
          disabled && { backgroundColor: '#ccc' },
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          REALIZAR DIAGNÓSTICO
        </Text>
      </Touchable>
    </>
  );
}

export default function Diagnostic({ navigation }) {
  const onShowResults = (value: QuestResults) => {
    navigation.navigate('DiagnosticResults', {
      results: value,
    });
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Questionary onShowResults={onShowResults} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  questContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  title: { paddingTop: 20, fontSize: 16, fontWeight: '300' },
  section: {
    paddingTop: 20,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: { paddingTop: 20, paddingBottom: 10 },
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
