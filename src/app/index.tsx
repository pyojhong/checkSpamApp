import { Platform, Alert, StyleSheet, View, Text, TextInput, ScrollView, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';

const API_KEY = process.env.EXPO_PUBLIC_SPAM_API;
const API_URL = process.env.EXPO_PUBLIC_SPAM_URL;

export default function HomeScreen() {
  const [phoneNumberHistory, setPhoneNumberHistory] = useState([]);

  const [phoneNumber, setPhoneNumber] = useState('');

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('@numbers', jsonValue);
    } catch (error) {
      console.log('저장 에러', error);
    }
  };
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@numbers');
      if (value !== null) {
        setPhoneNumberHistory(JSON.parse(value));
      }
    } catch (error) {
      console.log('데이터 로드 에러', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);  

  const getAPI = async () => {
    try {
      if (!API_URL || !API_KEY) {
        console.log('환경변수 에러', {API_URL, API_KEY});
        return;
      }
      const response = await fetch(`${API_URL}?api_key=${API_KEY}&phone=${phoneNumber}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('HTML 에러', errorText);
        return;
      } 
      const data = await response.json();
      const record = {
        id: Date.now(),
        phone_number: data.phone_number || phoneNumber,
        phone_carrier: data.phone_carrier?.name || '정보 없음', 
        phone_country: data.phone_location?.country_name || '정보 없음',
        phone_region: data.phone_location?.region || '정보 없음', 
        phone_city: data.phone_location?.city || '정보 없음',
        phone_messaging: data.phone_messaging?.sms_email || '정보 없음',
        phone_registration: data.phone_registration?.name || '정보 없음', 
        phone_risk: data.phone_risk?.risk_level || 'low',
        isSpam: data.phone_risk?.risk_level === 'high' || data.phone_risk?.risk_level === 'very_high',
      };
      setPhoneNumberHistory((prev) => [record, ...prev]);
      storeData([record, ...phoneNumberHistory]);
      setPhoneNumber('');
    } catch (error) {
      console.log('API 에러', error);
    }
  };

  const searchPhoneNumber = () => {
    try {
      const number = phoneNumber;
      if (number.length < 10 || number.length > 12) {
        Alert.alert('숫자 형식이 일치하지 않습니다.');
        return;
      }
      console.log(number);
      getAPI();

    } catch (error) {
      console.log('검색 에러', error);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>스팸 전화 확인</Text>
        </View>
        <View style={{flex: 1,}}>
          <View style={styles.history}>
            <Text style={styles.text}>기록</Text>
            <ScrollView>
              {phoneNumberHistory.length > 0 ? (
                phoneNumberHistory.map((item) => (
                  <View key={item.id} style={{flexDirection: 'row'}}>
                    <Text style={styles.subText}>{item.phone_number}</Text>
                    <Text style={[styles.resultText, item.isSpam ? {color: ORANGE} : {color: 'white'}]}>{item.isSpam ? '스팸 위험' : '정상'}</Text>
                  </View>
                ))) : null}
            </ScrollView>
          </View>
          <View style={styles.search}>
            <Text style={styles.text}>검색</Text>
            <View style={{flexDirection: 'row'}}>
              <TextInput onChangeText={setPhoneNumber} value={phoneNumber} style={styles.textInput} keyboardType='numeric' placeholder='전화번호 입력'></TextInput>
              <Pressable onPress={searchPhoneNumber}>
                <Text style={styles.button}>조회</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const ORANGE = '#df5937';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 20,
    paddingRight: 20,
    paddingLeft: 30,
  },
  title: {
    fontWeight: '600',
    fontSize: 30,
    color: 'white',
  },
  text: {
    color: 'white',
    fontWeight: '500',
    fontSize: 26,
    paddingLeft: 30,
    paddingTop: 40,
  },
  subText: {
    color: 'white',
    fontSize: 18,
    paddingLeft: 40,
    paddingTop: 15,
    fontWeight: '400',
  },
  resultText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: '500',
    paddingLeft: 25,
    paddingTop: 15,
  },
  history: {
    flex: 1,
  },
  search: {
    flex: 3,
    marginTop: 20,
  },
  textInput: {
    flex: 0.7,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginTop: 25,
    marginHorizontal: 40,
  },
  button: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 30,
  },
});
