import React, { useReducer, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';

import { QuestResults } from './types';
import { useScrollToTop } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Touchable from '../../components/Touchable';

const initialState = {
  symptoms: new Map(),
  travel: undefined,
  confirmedContact: undefined,
  suspectedContact: undefined,
  pregnant: undefined,
  elder: undefined,
  pathology: undefined,
};

function reducer(state, newState) {
  return { ...state, ...newState };
}

function QuestButton({ id, text, onPress, selected }) {
  const isSelected = !!selected.get(id);

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
    onPress({ [id]: 'yes' });
  };
  const handleNoPress = () => {
    onPress({ [id]: 'no' });
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
      const newSelected = new Map(state.symptoms);
      newSelected.set(id, !state.symptoms.get(id));

      setState({ symptoms: newSelected });
    },
    [state.symptoms],
  );

  useEffect(() => {
    const hasSymptoms =
      state.symptoms.size > 0 &&
      Array.from(state.symptoms).find((s: [string, boolean]) => s[1]);

    if (
      !!hasSymptoms &&
      state?.travel &&
      state?.confirmedContact &&
      state?.suspectedContact &&
      state?.elder &&
      state?.pregnant &&
      state?.pathology
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [state]);

  const handlePress = () => {
    function hasExtraConditions() {
      if (
        state.elder === 'yes' ||
        state.pregnant === 'yes' ||
        state.pathology === 'yes'
      ) {
        onShowResults('negative');
      } else {
        onShowResults('neutral');
      }
    }
    if (
      state.symptoms.get('fever') &&
      state.travel === 'yes' &&
      state.confirmedContact === 'yes' &&
      state.suspectedContact === 'yes'
    ) {
      if (state.symptoms.get('breath')) {
        onShowResults('negative');
      } else {
        hasExtraConditions();
      }
    } else {
      onShowResults('positive');
    }

    scrollRef.current.scrollTo({ x: 0, animated: false });
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
          <YesNoButtons id="travel" onPress={setState} state={state} />
        </View>
        <Text style={styles.subtitle}>
          ¿Tuviste contacto estrecho con alguien con diagnóstico confirmado?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="confirmedContact"
            onPress={setState}
            state={state}
          />
        </View>
        <Text style={styles.subtitle}>
          ¿Conviviste con alguien que sea caso sospechoso o confirmado?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons
            id="suspectedContact"
            onPress={setState}
            state={state}
          />
        </View>
        <Text style={styles.section}>Situación actual y antecedentes</Text>
        <Text style={styles.subtitle}>¿Tenés 60 años o más?</Text>
        <View style={styles.questButtons}>
          <YesNoButtons id="elder" onPress={setState} state={state} />
        </View>
        <Text style={styles.subtitle}>
          ¿Estás embarazada o en contacto con un recién nacido?
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons id="pregnant" onPress={setState} state={state} />
        </View>
        <Text style={styles.subtitle}>
          ¿Sufrís alguna de las siguientes patologías?{`\n\n`} - Cáncer
          {`\n`} - Colesterol alto {`\n`} - Diabetes {`\n`} - Enfermedades
          cardiovasculares {`\n`} - Enfermedades respiratorias {`\n`} -
          Esclerosis múltiple
          {`\n`} - Hipertensión arterial {`\n`} - Hipo o hipertiroidismo
        </Text>
        <View style={styles.questButtons}>
          <YesNoButtons id="pathology" onPress={setState} state={state} />
        </View>
      </ScrollView>
      <Touchable
        style={[
          styles.button,
          styles.activeButton,
          { width: undefined, margin: 10 },
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
