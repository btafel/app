import React, { useState } from 'react';
import { Text, View, Picker, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function DatePicker({ label, onChange }) {
  // const dobRef = useRef<any | undefined>();

  const [value, setValue] = useState({});

  const handleChange = key => val => {
    value[key] = val;
    setValue(value);
    onChange(`${value.dobDay}/${value.dobMonth}/${value.dobYear}`);
  };

  const arrDays = Array.from(Array(31).keys()).map((e, i) => (
    <Picker.Item key={i + 1} label={`${i + 1}`} value={i + 1} />
  ));

  const arrMonths = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ].map((e, i) => <Picker.Item key={i + 1} label={e} value={i + 1} />);

  const arrYears = Array.from(Array(100).keys()).map(i => (
    <Picker.Item key={i + 1} label={`${2020 - i}`} value={2020 - i} />
  ));

  // console.log('arrDays', arrDays);

  return (
    <>
      <Text
        style={{ textTransform: 'uppercase', paddingEnd: 10, marginTop: 15 }}
      >
        {label}
      </Text>

      <View style={styles.buttonContainer}>
        {/* {Platform.OS === 'web' ? (
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
          )} */}
        <Picker
          // id="day"
          selectedValue={value.dobDay}
          onValueChange={handleChange('dobDay')}
          style={{ width: '30%' }}
          mode="dropdown"
        >
          <Picker.Item label="Dia" value="0" />
          {arrDays}
        </Picker>
        <Picker
          // id="month"
          selectedValue={value.dobMonth}
          onValueChange={handleChange('dobMonth')}
          style={{ width: '30%' }}
          mode="dropdown"
        >
          <Picker.Item label="Mes" value="0" />
          {arrMonths}
        </Picker>
        <Picker
          // id="year"
          selectedValue={value.dobYear}
          onValueChange={handleChange('dobYear')}
          style={{ width: '30%' }}
          mode="dropdown"
        >
          <Picker.Item label="Año" value="0" />
          {arrYears}
        </Picker>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15,
  },

  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ACACAC',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  checkedCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryColor,
  },
});
