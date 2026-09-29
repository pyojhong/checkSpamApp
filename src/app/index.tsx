import { Modal, Platform, Alert, StyleSheet, View, Text, TextInput, ScrollView, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';

const API_KEY = process.env.EXPO_PUBLIC_SPAM_API;
const API_URL = process.env.EXPO_PUBLIC_SPAM_URL;

interface HistoryItem {
  id: number;
  phone_number: string;
  phone_carrier: string;
  phone_country: string;
  phone_region: string;
  phone_city: string;
  phone_messaging: string;
  phone_registration: string;
  phone_risk: string;
  isSpam: boolean;
  rawData: any;
}


export default function HomeScreen() {
  const [phoneNumberHistory, setPhoneNumberHistory] = useState<HistoryItem[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
        rawData: data,
      };
      const updatedHistory = [record, ...phoneNumberHistory];
      setPhoneNumberHistory(updatedHistory);
      storeData(updatedHistory);
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

  const deleteNumber = async (id: number) => {
    try {
      const updatedHistory = phoneNumberHistory.filter((item) => item.id !== id);
      setPhoneNumberHistory(updatedHistory);
      await AsyncStorage.setItem('@numbers', JSON.stringify(updatedHistory));
    } catch (error) {
      console.log('삭제 에러', error);
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
                  <Pressable key={item.id} style={({pressed}) => pressed ? [{flexDirection: 'row', opacity: 0.5}] : {flexDirection: 'row'}} onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                  }}>
                    <Text style={styles.subText}>{item.phone_number}</Text>
                    <Text style={[styles.resultText, item.isSpam ? {color: ORANGE} : {color: 'white'}]}>{item.isSpam ? '스팸 위험' : '정상'}</Text>
                  </Pressable>
                ))) : null}
            </ScrollView>
          </View>
          <View style={styles.search}>
            <Text style={styles.text}>검색</Text>
            <View style={{flexDirection: 'row'}}>
              <TextInput onChangeText={setPhoneNumber} value={phoneNumber} style={styles.textInput} keyboardType='numeric' placeholder='전화번호 입력'></TextInput>
              <Pressable onPress={searchPhoneNumber} style={({pressed}) => pressed ? [styles.button, {opacity: 0.5}] : styles.button}>
                <Text style={styles.buttonText}>조회</Text>
              </Pressable>
            </View>
          </View>
        </View>

      <Modal visible={modalVisible} animationType='slide' transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>상세 정보</Text>
            <ScrollView>
                {selectedItem ? (
                  <View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>전화번호</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>스팸 여부</Text>
                      <Text style={[styles.infoValue, selectedItem.isSpam ? {color: ORANGE} : {color: 'white'}]}>{selectedItem.isSpam ? '스팸 위험' : '정상 번호'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>통신사 / 등록자</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_carrier}</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_registration}</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_messaging}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>국가 / 지역</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_country}</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_region}</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_city}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>위험도</Text>
                      <Text style={styles.infoValue}>{selectedItem.phone_risk}</Text>
                    </View>
                  </View>) : null}
            </ScrollView>
            <Pressable onPress={() => setModalVisible(false)} style={({pressed}) => pressed ? [styles.modalCloseButton, {opacity: 0.5}] : styles.modalCloseButton}>
              <Text style={{color: 'white', fontWeight: '500'}}>닫기</Text>
            </Pressable>
            <Pressable onPress={() => {
              if (selectedItem) {
                deleteNumber(selectedItem.id);
                setModalVisible(false);
              }
            }} style={({pressed}) => pressed ? [styles.modalButton, {opacity: 0.5}] : styles.modalButton}>
              <Text style={{color: 'white', fontWeight: '500'}}>삭제</Text>
            </Pressable>
          </View>
        </View>
    </Modal>
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 15,
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: ORANGE,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
    modalCloseButton: {
    marginTop: 15,
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoRow: {
    paddingVertical: 6,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
});