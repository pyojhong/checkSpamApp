# 스팸 전화번호 조회 앱 (Spam Checker)

React Native와 Expo로 제작한 스팸 전화번호 및 정보 조회 모바일 애플리케이션입니다.

---

## 시연 화면

https://github.com/user-attachments/assets/c1f5b77b-bd3b-42df-9379-015627581a22

---

## 주요 기능

- **전화번호 조회:** 검색창에 전화번호를 입력하여 스팸 위험도 및 상세 정보 조회
- **조회 기록 저장:** `AsyncStorage`를 활용하여 이전 조회 기록 로컬 저장
- **상세 정보 모달:** 통신사, 위치(국가/지역/도시), 위험도, 등록자 정보 등 세부 항목 확인
- **기록 삭제:** 모달 내 삭제 버튼을 통한 특정 기록 삭제

---

## 기술 스택 (Tech Stack)

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State/Storage:** React State, AsyncStorage
- **API:** Spam Check API (Fetch)
