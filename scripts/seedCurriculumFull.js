import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2022 개정 수학 교육과정 초등 1학년 ~ 중등 3학년 전 학기 통합 단원 데이터
const curriculumData = [
  // ================= 초등 =================
  {
    grade_id: "elem_1_1", school_level: "elementary", grade_name: "초등학교 1학년 1학기", order: 11,
    chapters: [
      { chapter_id: "e11_1", chapter_name: "1. 9까지의 수", domain: "수와 연산", levels: { level_1_name: "1~5 알아보기", level_2_name: "6~9 알아보기", level_3_name: "0 알아보기", level_4_name: "수의 순서", level_5_name: "수 크기 비교" } },
      { chapter_id: "e11_2", chapter_name: "2. 여러 가지 모양", domain: "도형과 측정", levels: { level_1_name: "입체도형 찾기", level_2_name: "모양 분류하기", level_3_name: "모양 만들기", level_4_name: "도형 퍼즐", level_5_name: "생활 속 도형 찾기" } },
      { chapter_id: "e11_3", chapter_name: "3. 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "모으기와 가르기", level_2_name: "덧셈 기호", level_3_name: "뺄셈 기호", level_4_name: "한 자리 수 덧셈", level_5_name: "한 자리 수 뺄셈" } },
      { chapter_id: "e11_4", chapter_name: "4. 비교하기", domain: "변화와 관계", levels: { level_1_name: "길이 비교", level_2_name: "무게 비교", level_3_name: "넓이 비교", level_4_name: "들이 비교", level_5_name: "복합 비교" } },
      { chapter_id: "e11_5", chapter_name: "5. 50까지의 수", domain: "수와 연산", levels: { level_1_name: "10 알아보기", level_2_name: "십몇 알아보기", level_3_name: "몇십 알아보기", level_4_name: "50까지의 수 세기", level_5_name: "수 크기 비교" } }
    ]
  },
  {
    grade_id: "elem_1_2", school_level: "elementary", grade_name: "초등학교 1학년 2학기", order: 12,
    chapters: [
      { chapter_id: "e12_1", chapter_name: "1. 100까지의 수", domain: "수와 연산", levels: { level_1_name: "몇십 몇", level_2_name: "수 순서 알아보기", level_3_name: "두 수의 크기 비교", level_4_name: "홀수와 짝수", level_5_name: "100 알아보기" } },
      { chapter_id: "e12_2", chapter_name: "2. 덧셈과 뺄셈 (1)", domain: "수와 연산", levels: { level_1_name: "받아올림 없는 덧셈", level_2_name: "받아내림 없는 뺄셈", level_3_name: "세 수의 덧셈", level_4_name: "세 수의 뺄셈", level_5_name: "문장제 문제" } },
      { chapter_id: "e12_3", chapter_name: "3. 여러 가지 모양", domain: "도형과 측정", levels: { level_1_name: "세모, 네모, 동그라미", level_2_name: "모양 분류", level_3_name: "도형 그리기", level_4_name: "패턴 만들기", level_5_name: "도형 활용 문제" } },
      { chapter_id: "e12_4", chapter_name: "4. 덧셈과 뺄셈 (2)", domain: "수와 연산", levels: { level_1_name: "10을 만들어 더하기", level_2_name: "10에서 빼기", level_3_name: "받아올림이 있는 덧셈", level_4_name: "받아내림이 있는 뺄셈", level_5_name: "두 자리 수 연산" } },
      { chapter_id: "e12_5", chapter_name: "5. 시계 보기와 규칙 찾기", domain: "변화와 관계", levels: { level_1_name: "정각 알아보기", level_2_name: "30분 알아보기", level_3_name: "생활 규칙 찾기", level_4_name: "수 배열 규칙", level_5_name: "무늬 규칙 찾기" } }
    ]
  },
  {
    grade_id: "elem_2_1", school_level: "elementary", grade_name: "초등학교 2학년 1학기", order: 21,
    chapters: [
      { chapter_id: "e21_1", chapter_name: "1. 세 자리 수", domain: "수와 연산", levels: { level_1_name: "백 알아보기", level_2_name: "세 자리 수 읽기/쓰기", level_3_name: "각 자리의 숫자 값", level_4_name: "뛰어 세기", level_5_name: "수 크기 비교" } },
      { chapter_id: "e21_2", chapter_name: "2. 여러 가지 도형", domain: "도형과 측정", levels: { level_1_name: "원, 삼각형, 사각형", level_2_name: "칠교판", level_3_name: "도형 밀기/뒤집기 기초", level_4_name: "오각형, 육각형", level_5_name: "똑같이 나누기" } },
      { chapter_id: "e21_3", chapter_name: "3. 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "받아올림 덧셈", level_2_name: "받아내림 뺄셈", level_3_name: "세 수의 혼합 계산", level_4_name: "여러 가지 방법 연산", level_5_name: "응용 문제" } },
      { chapter_id: "e21_4", chapter_name: "4. 길이 재기", domain: "도형과 측정", levels: { level_1_name: "cm 알아보기", level_2_name: "자로 길이 재기", level_3_name: "길이 어림하기", level_4_name: "길이의 덧셈", level_5_name: "길이의 뺄셈" } },
      { chapter_id: "e21_5", chapter_name: "5. 분류하기", domain: "자료와 가능성", levels: { level_1_name: "기준 정하기", level_2_name: "분류 기준에 따라 나누기", level_3_name: "분류 결과 세기", level_4_name: "결과 설명하기", level_5_name: "일상 문제 분류" } },
      { chapter_id: "e21_6", chapter_name: "6. 곱셈", domain: "수와 연산", levels: { level_1_name: "묶어 세기", level_2_name: "몇의 몇 배", level_3_name: "곱셈식 나타내기", level_4_name: "곱셈의 원리", level_5_name: "생활 속 곱셈" } }
    ]
  },
  {
    grade_id: "elem_2_2", school_level: "elementary", grade_name: "초등학교 2학년 2학기", order: 22,
    chapters: [
      { chapter_id: "e22_1", chapter_name: "1. 네 자리 수", domain: "수와 연산", levels: { level_1_name: "천 알아보기", level_2_name: "네 자리 수 읽기/쓰기", level_3_name: "자릿값", level_4_name: "뛰어 세기", level_5_name: "크기 비교" } },
      { chapter_id: "e22_2", chapter_name: "2. 곱셈구구", domain: "수와 연산", levels: { level_1_name: "2~5단", level_2_name: "6~9단", level_3_name: "1단과 0의 곱", level_4_name: "곱셈구구표", level_5_name: "활용 문제" } },
      { chapter_id: "e22_3", chapter_name: "3. 길이 재기", domain: "도형과 측정", levels: { level_1_name: "m 알아보기", level_2_name: "cm와 m의 관계", level_3_name: "길이 어림하기", level_4_name: "길이 연산", level_5_name: "거리 측정" } },
      { chapter_id: "e22_4", chapter_name: "4. 시각과 시간", domain: "도형과 측정", levels: { level_1_name: "몇 시 몇 분", level_2_name: "1시간과 분", level_3_name: "1일, 1주일, 1년", level_4_name: "달력 보기", level_5_name: "시간의 덧셈/뺄셈" } },
      { chapter_id: "e22_5", chapter_name: "5. 표와 그래프", domain: "자료와 가능성", levels: { level_1_name: "자료 조사", level_2_name: "표로 나타내기", level_3_name: "그래프로 나타내기", level_4_name: "그래프 해석", level_5_name: "자료 비교" } },
      { chapter_id: "e22_6", chapter_name: "6. 규칙 찾기", domain: "변화와 관계", levels: { level_1_name: "물체 배열 규칙", level_2_name: "수 배열 규칙", level_3_name: "규칙에 따라 그리기", level_4_name: "복합 규칙", level_5_name: "생활 속 규칙" } }
    ]
  },
  {
    grade_id: "elem_3_1", school_level: "elementary", grade_name: "초등학교 3학년 1학기", order: 31,
    chapters: [
      { chapter_id: "e31_1", chapter_name: "1. 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "세 자리 수 덧셈", level_2_name: "받아올림 덧셈", level_3_name: "세 자리 수 뺄셈", level_4_name: "받아내림 뺄셈", level_5_name: "문장제 활용" } },
      { chapter_id: "e31_2", chapter_name: "2. 평면도형", domain: "도형과 측정", levels: { level_1_name: "선분, 반직선, 직선", level_2_name: "각, 직각", level_3_name: "직각삼각형", level_4_name: "직사각형, 정사각형", level_5_name: "도형 밀기/뒤집기/돌리기 기초" } },
      { chapter_id: "e31_3", chapter_name: "3. 나눗셈", domain: "수와 연산", levels: { level_1_name: "똑같이 나누기", level_2_name: "곱셈과 나눗셈의 관계", level_3_name: "몫 구하기", level_4_name: "응용 나눗셈", level_5_name: "활용 문제" } },
      { chapter_id: "e31_4", chapter_name: "4. 곱셈", domain: "수와 연산", levels: { level_1_name: "(두 자리 수)×(한 자리 수)", level_2_name: "받아올림 곱셈", level_3_name: "다양한 곱셈 연산", level_4_name: "곱셈 암산", level_5_name: "실생활 곱셈" } },
      { chapter_id: "e31_5", chapter_name: "5. 길이와 시간", domain: "도형과 측정", levels: { level_1_name: "mm, km 알아보기", level_2_name: "길이 어림과 합/차", level_3_name: "초 알아보기", level_4_name: "시간의 합과 차", level_5_name: "속력 기초 문제" } },
      { chapter_id: "e31_6", chapter_name: "6. 분수와 소수", domain: "수와 연산", levels: { level_1_name: "똑같이 나누기", level_2_name: "분수 알아보기", level_3_name: "단위분수 크기 비교", level_4_name: "소수 알아보기", level_5_name: "소수 크기 비교" } }
    ]
  },
  {
    grade_id: "elem_3_2", school_level: "elementary", grade_name: "초등학교 3학년 2학기", order: 32,
    chapters: [
      { chapter_id: "e32_1", chapter_name: "1. 곱셈", domain: "수와 연산", levels: { level_1_name: "(세 자리 수)×(한 자리 수)", level_2_name: "(두 자리 수)×(두 자리 수)", level_3_name: "올림이 있는 곱셈", level_4_name: "복합 곱셈식", level_5_name: "곱셈의 활용" } },
      { chapter_id: "e32_2", chapter_name: "2. 나눗셈", domain: "수와 연산", levels: { level_1_name: "내림이 없는 나눗셈", level_2_name: "내림이 있는 나눗셈", level_3_name: "나머지가 있는 나눗셈", level_4_name: "맞게 계산했는지 확인", level_5_name: "나눗셈 활용" } },
      { chapter_id: "e32_3", chapter_name: "3. 원", domain: "도형과 측정", levels: { level_1_name: "원의 중심과 반지름", level_2_name: "지름 알아보기", level_3_name: "컴퍼스로 원 그리기", level_4_name: "다양한 모양 그리기", level_5_name: "원의 성질 응용" } },
      { chapter_id: "e32_4", chapter_name: "4. 분수", domain: "수와 연산", levels: { level_1_name: "진분수와 가분수", level_2_name: "대분수", level_3_name: "분모가 같은 분수의 크기 비교", level_4_name: "분수 연산 기초", level_5_name: "도형과 분수" } },
      { chapter_id: "e32_5", chapter_name: "5. 들이와 무게", domain: "도형과 측정", levels: { level_1_name: "L, mL 알아보기", level_2_name: "들이의 덧셈/뺄셈", level_3_name: "kg, g 알아보기", level_4_name: "무게의 덧셈/뺄셈", level_5_name: "복합 문장제 문제" } },
      { chapter_id: "e32_6", chapter_name: "6. 자료의 정리", domain: "자료와 가능성", levels: { level_1_name: "자료 수집", level_2_name: "그림그래프", level_3_name: "그림그래프 해석", level_4_name: "통계적 사실 찾기", level_5_name: "자료 기반 예측" } }
    ]
  },
  {
    grade_id: "elem_4_1", school_level: "elementary", grade_name: "초등학교 4학년 1학기", order: 41,
    chapters: [
      { chapter_id: "e41_1", chapter_name: "1. 큰 수", domain: "수와 연산", levels: { level_1_name: "만, 억, 조", level_2_name: "자릿값 비교", level_3_name: "뛰어 세기", level_4_name: "큰 수의 덧/뺄셈", level_5_name: "문장제 활용" } },
      { chapter_id: "e41_2", chapter_name: "2. 각도", domain: "도형과 측정", levels: { level_1_name: "각도 측정", level_2_name: "예각과 둔각", level_3_name: "각도의 합/차", level_4_name: "삼각형 내각의 합", level_5_name: "사각형 내각의 합" } },
      { chapter_id: "e41_3", chapter_name: "3. 곱셈과 나눗셈", domain: "수와 연산", levels: { level_1_name: "(세 자리)×(두 자리)", level_2_name: "곱셈 암산", level_3_name: "(두/세 자리)÷(두 자리)", level_4_name: "나머지 계산", level_5_name: "혼합 활용 문제" } },
      { chapter_id: "e41_4", chapter_name: "4. 평면도형의 이동", domain: "도형과 측정", levels: { level_1_name: "밀기", level_2_name: "뒤집기", level_3_name: "돌리기", level_4_name: "뒤집고 돌리기", level_5_name: "무늬 꾸미기" } },
      { chapter_id: "e41_5", chapter_name: "5. 막대그래프", domain: "자료와 가능성", levels: { level_1_name: "막대그래프 이해", level_2_name: "눈금 읽기", level_3_name: "막대그래프 그리기", level_4_name: "자료 해석", level_5_name: "실생활 통계 조사" } },
      { chapter_id: "e41_6", chapter_name: "6. 규칙 찾기", domain: "변화와 관계", levels: { level_1_name: "수 배열의 규칙", level_2_name: "도형 배열의 규칙", level_3_name: "계산식 규칙", level_4_name: "규칙과 대응", level_5_name: "복합 규칙 응용" } }
    ]
  },
  {
    grade_id: "elem_4_2", school_level: "elementary", grade_name: "초등학교 4학년 2학기", order: 42,
    chapters: [
      { chapter_id: "e42_1", chapter_name: "1. 분수의 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "진분수 계산", level_2_name: "대분수 계산", level_3_name: "받아올림 분수", level_4_name: "받아내림 분수", level_5_name: "문장제 분수" } },
      { chapter_id: "e42_2", chapter_name: "2. 삼각형", domain: "도형과 측정", levels: { level_1_name: "이등변삼각형", level_2_name: "정삼각형", level_3_name: "예각/직각/둔각삼각형", level_4_name: "도형의 성질 융합", level_5_name: "삼각형 응용" } },
      { chapter_id: "e42_3", chapter_name: "3. 소수의 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "소수 두/세 자리", level_2_name: "크기 비교", level_3_name: "자릿수가 같은 소수 연산", level_4_name: "자릿수가 다른 소수 연산", level_5_name: "응용 연산" } },
      { chapter_id: "e42_4", chapter_name: "4. 사각형", domain: "도형과 측정", levels: { level_1_name: "수직과 평행", level_2_name: "사다리꼴/평행사변형", level_3_name: "마름모", level_4_name: "직사각형/정사각형", level_5_name: "다각형 성질 비교" } },
      { chapter_id: "e42_5", chapter_name: "5. 꺾은선그래프", domain: "자료와 가능성", levels: { level_1_name: "꺾은선그래프 이해", level_2_name: "변화량 파악", level_3_name: "물결선 사용", level_4_name: "자료 그리기", level_5_name: "미래 예측" } },
      { chapter_id: "e42_6", chapter_name: "6. 다각형", domain: "도형과 측정", levels: { level_1_name: "다각형의 정의", level_2_name: "정다각형", level_3_name: "대각선", level_4_name: "모양 채우기", level_5_name: "다각형 넓이 기초" } }
    ]
  },
  {
    grade_id: "elem_5_1", school_level: "elementary", grade_name: "초등학교 5학년 1학기", order: 51,
    chapters: [
      { chapter_id: "e51_1", chapter_name: "1. 자연수의 혼합 계산", domain: "수와 연산", levels: { level_1_name: "덧/뺄셈 혼합", level_2_name: "곱/나눗셈 혼합", level_3_name: "사칙연산 혼합", level_4_name: "괄호 계산", level_5_name: "식 완성하기" } },
      { chapter_id: "e51_2", chapter_name: "2. 약수와 배수", domain: "수와 연산", levels: { level_1_name: "약수와 배수", level_2_name: "공약수/최대공약수", level_3_name: "공배수/최소공배수", level_4_name: "최대공약수 활용", level_5_name: "최소공배수 활용" } },
      { chapter_id: "e51_3", chapter_name: "3. 규칙과 대응", domain: "변화와 관계", levels: { level_1_name: "두 양의 대응", level_2_name: "식으로 나타내기", level_3_name: "표 해석하기", level_4_name: "일상생활 대응", level_5_name: "복합 규칙성" } },
      { chapter_id: "e51_4", chapter_name: "4. 약분과 통분", domain: "수와 연산", levels: { level_1_name: "크기가 같은 분수", level_2_name: "약분과 기약분수", level_3_name: "통분", level_4_name: "분수 크기 비교", level_5_name: "소수와 분수 관계" } },
      { chapter_id: "e51_5", chapter_name: "5. 분수의 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "분모가 다른 분수 덧셈", level_2_name: "대분수 덧셈", level_3_name: "분모가 다른 분수 뺄셈", level_4_name: "받아내림 대분수 뺄셈", level_5_name: "혼합 연산 응용" } },
      { chapter_id: "e51_6", chapter_name: "6. 다각형의 둘레와 넓이", domain: "도형과 측정", levels: { level_1_name: "직사각형 둘레/넓이", level_2_name: "1cm², 1m², 1km²", level_3_name: "평행사변형 넓이", level_4_name: "삼각형 넓이", level_5_name: "마름모/사다리꼴 넓이" } }
    ]
  },
  {
    grade_id: "elem_5_2", school_level: "elementary", grade_name: "초등학교 5학년 2학기", order: 52,
    chapters: [
      { chapter_id: "e52_1", chapter_name: "1. 수의 범위와 어림하기", domain: "수와 연산", levels: { level_1_name: "이상/이하/초과/미만", level_2_name: "올림", level_3_name: "버림", level_4_name: "반올림", level_5_name: "어림의 실생활 활용" } },
      { chapter_id: "e52_2", chapter_name: "2. 분수의 곱셈", domain: "수와 연산", levels: { level_1_name: "(분수)×(자연수)", level_2_name: "(자연수)×(분수)", level_3_name: "진분수의 곱셈", level_4_name: "대분수의 곱셈", level_5_name: "도형의 넓이 활용" } },
      { chapter_id: "e52_3", chapter_name: "3. 합동과 대칭", domain: "도형과 측정", levels: { level_1_name: "도형의 합동", level_2_name: "합동인 도형 그리기", level_3_name: "선대칭도형", level_4_name: "점대칭도형", level_5_name: "대칭 성질 응용" } },
      { chapter_id: "e52_4", chapter_name: "4. 소수의 곱셈", domain: "수와 연산", levels: { level_1_name: "(소수)×(자연수)", level_2_name: "(자연수)×(소수)", level_3_name: "(소수)×(소수)", level_4_name: "소수점 위치 변화", level_5_name: "혼합 활용" } },
      { chapter_id: "e52_5", chapter_name: "5. 직육면체", domain: "도형과 측정", levels: { level_1_name: "직육면체와 정육면체", level_2_name: "겨냥도", level_3_name: "전개도 이해", level_4_name: "전개도 그리기", level_5_name: "입체도형 성질 비교" } },
      { chapter_id: "e52_6", chapter_name: "6. 평균과 가능성", domain: "자료와 가능성", levels: { level_1_name: "평균 구하기", level_2_name: "평균 활용", level_3_name: "일이 일어날 가능성", level_4_name: "가능성 수로 표현", level_5_name: "자료 분석 종합" } }
    ]
  },
  {
    grade_id: "elem_6_1", school_level: "elementary", grade_name: "초등학교 6학년 1학기", order: 61,
    chapters: [
      { chapter_id: "e61_1", chapter_name: "1. 분수의 나눗셈", domain: "수와 연산", levels: { level_1_name: "(자연수)÷(자연수)", level_2_name: "(진분수)÷(자연수)", level_3_name: "(대분수)÷(자연수)", level_4_name: "분수를 곱셈으로 변환", level_5_name: "실생활 분수 나눗셈" } },
      { chapter_id: "e61_2", chapter_name: "2. 각기둥과 각뿔", domain: "도형과 측정", levels: { level_1_name: "각기둥 이해", level_2_name: "각기둥 전개도", level_3_name: "각뿔 이해", level_4_name: "면/모서리/꼭짓점", level_5_name: "입체도형 구성" } },
      { chapter_id: "e61_3", chapter_name: "3. 소수의 나눗셈", domain: "수와 연산", levels: { level_1_name: "(소수)÷(자연수) 기본", level_2_name: "몫이 1보다 작은 나눗셈", level_3_name: "끝자리 0 채우기", level_4_name: "몫의 소수점 확인", level_5_name: "나머지와 몫 판단" } },
      { chapter_id: "e61_4", chapter_name: "4. 비와 비율", domain: "변화와 관계", levels: { level_1_name: "두 수의 비교", level_2_name: "비율 구하기", level_3_name: "백분율", level_4_name: "할인율/이익률", level_5_name: "비율의 실생활 응용" } },
      { chapter_id: "e61_5", chapter_name: "5. 여러 가지 그래프", domain: "자료와 가능성", levels: { level_1_name: "그림그래프", level_2_name: "띠그래프", level_3_name: "원그래프", level_4_name: "그래프 비교 및 선택", level_5_name: "통계 포스터 만들기" } },
      { chapter_id: "e61_6", chapter_name: "6. 직육면체의 부피와 겉넓이", domain: "도형과 측정", levels: { level_1_name: "1cm³, 1m³", level_2_name: "직육면체 부피", level_3_name: "정육면체 부피", level_4_name: "직육면체 겉넓이", level_5_name: "도형 부피/겉넓이 응용" } }
    ]
  },
  {
    grade_id: "elem_6_2", school_level: "elementary", grade_name: "초등학교 6학년 2학기", order: 62,
    chapters: [
      { chapter_id: "e62_1", chapter_name: "1. 분수의 나눗셈", domain: "수와 연산", levels: { level_1_name: "분모가 같은 나눗셈", level_2_name: "분모가 다른 나눗셈", level_3_name: "(자연수)÷(분수)", level_4_name: "(대분수)÷(대분수)", level_5_name: "복합 활용" } },
      { chapter_id: "e62_2", chapter_name: "2. 소수의 나눗셈", domain: "수와 연산", levels: { level_1_name: "소수점 이동 규칙", level_2_name: "(소수)÷(소수)", level_3_name: "몫 반올림하기", level_4_name: "나머지 구하기", level_5_name: "도형/측정 활용 문제" } },
      { chapter_id: "e62_3", chapter_name: "3. 공간과 입체", domain: "도형과 측정", levels: { level_1_name: "쌓기나무 개수", level_2_name: "위/앞/옆 모양", level_3_name: "전체 모양 추론", level_4_name: "숨겨진 나무 찾기", level_5_name: "공간지각력 문제" } },
      { chapter_id: "e62_4", chapter_name: "4. 비례식과 비례배분", domain: "변화와 관계", levels: { level_1_name: "비의 성질", level_2_name: "간단한 자연수 비", level_3_name: "비례식 이해", level_4_name: "비례식 풀이", level_5_name: "비례배분 연산" } },
      { chapter_id: "e62_5", chapter_name: "5. 원의 넓이", domain: "도형과 측정", levels: { level_1_name: "원주와 원주율", level_2_name: "원주 구하기", level_3_name: "원의 넓이 어림", level_4_name: "원의 넓이 구하기", level_5_name: "복합 도형의 넓이" } },
      { chapter_id: "e62_6", chapter_name: "6. 원기둥, 원뿔, 구", domain: "도형과 측정", levels: { level_1_name: "원기둥 알아보기", level_2_name: "원기둥 전개도", level_3_name: "원뿔 알아보기", level_4_name: "구 알아보기", level_5_name: "회전체 이해" } }
    ]
  },

  // ================= 중등 =================
  {
    grade_id: "mid_1_1", school_level: "middle", grade_name: "중학교 1학년 1학기", order: 71,
    chapters: [
      { chapter_id: "m11_1", chapter_name: "1. 소인수분해", domain: "수와 연산", levels: { level_1_name: "소수와 합성수", level_2_name: "거듭제곱과 소인수분해", level_3_name: "공약수와 최대공약수", level_4_name: "공배수와 최소공배수", level_5_name: "최대/최소공배수 활용 (2022 개정)" } },
      { chapter_id: "m11_2", chapter_name: "2. 정수와 유리수", domain: "수와 연산", levels: { level_1_name: "정수와 유리수", level_2_name: "절댓값과 대소 관계", level_3_name: "덧셈과 뺄셈", level_4_name: "곱셈과 나눗셈", level_5_name: "유리수 혼합 계산" } },
      { chapter_id: "m11_3", chapter_name: "3. 문자와 식", domain: "문자와 식", levels: { level_1_name: "문자의 사용과 식의 값", level_2_name: "일차식과 그 계산", level_3_name: "일차방정식과 그 해", level_4_name: "일차방정식의 풀이", level_5_name: "일차방정식의 활용" } },
      { chapter_id: "m11_4", chapter_name: "4. 좌표평면과 그래프", domain: "함수", levels: { level_1_name: "순서쌍과 좌표", level_2_name: "그래프의 해석", level_3_name: "정비례 관계", level_4_name: "반비례 관계", level_5_name: "정비례/반비례 활용" } }
    ]
  },
  {
    grade_id: "mid_1_2", school_level: "middle", grade_name: "중학교 1학년 2학기", order: 72,
    chapters: [
      { chapter_id: "m12_1", chapter_name: "1. 기본 도형", domain: "도형", levels: { level_1_name: "점, 선, 면, 각", level_2_name: "위치 관계", level_3_name: "평행선의 성질", level_4_name: "작도와 합동", level_5_name: "합동 조건 응용" } },
      { chapter_id: "m12_2", chapter_name: "2. 평면도형", domain: "도형", levels: { level_1_name: "다각형의 대각선", level_2_name: "내각과 외각", level_3_name: "원과 부채꼴", level_4_name: "부채꼴 호의 길이/넓이", level_5_name: "복합 평면도형의 넓이" } },
      { chapter_id: "m12_3", chapter_name: "3. 입체도형", domain: "도형", levels: { level_1_name: "다면체", level_2_name: "정다면체", level_3_name: "회전체", level_4_name: "입체도형 겉넓이", level_5_name: "입체도형 부피" } },
      { chapter_id: "m12_4", chapter_name: "4. 통계", domain: "확률과 통계", levels: { level_1_name: "줄기와 잎 그림", level_2_name: "도수분포표", level_3_name: "히스토그램", level_4_name: "도수분포다각형", level_5_name: "상대도수와 그 그래프" } }
    ]
  },
  {
    grade_id: "mid_2_1", school_level: "middle", grade_name: "중학교 2학년 1학기", order: 81,
    chapters: [
      { chapter_id: "m21_1", chapter_name: "1. 수와 식의 계산", domain: "수와 연산", levels: { level_1_name: "유리수와 순환소수", level_2_name: "지수법칙", level_3_name: "단항식 계산", level_4_name: "다항식 계산", level_5_name: "식의 대입 활용" } },
      { chapter_id: "m21_2", chapter_name: "2. 일차부등식", domain: "문자와 식", levels: { level_1_name: "부등식과 그 성질", level_2_name: "일차부등식의 풀이", level_3_name: "일차부등식 활용(거리/속력)", level_4_name: "일차부등식 활용(농도)", level_5_name: "복합 부등식 응용" } },
      { chapter_id: "m21_3", chapter_name: "3. 연립일차방정식", domain: "문자와 식", levels: { level_1_name: "미지수가 2개인 일차방정식", level_2_name: "대입법/가감법", level_3_name: "복잡한 연립방정식", level_4_name: "연립방정식 활용", level_5_name: "특수한 해를 갖는 방정식" } },
      { chapter_id: "m21_4", chapter_name: "4. 일차함수", domain: "함수", levels: { level_1_name: "일차함수 뜻/그래프", level_2_name: "절편과 기울기", level_3_name: "그래프의 성질/식 구하기", level_4_name: "일차함수와 일차방정식", level_5_name: "일차함수 연립방정식 응용" } }
    ]
  },
  {
    grade_id: "mid_2_2", school_level: "middle", grade_name: "중학교 2학년 2학기", order: 82,
    chapters: [
      { chapter_id: "m22_1", chapter_name: "1. 삼각형의 성질", domain: "도형", levels: { level_1_name: "이등변삼각형 성질", level_2_name: "직각삼각형 합동", level_3_name: "삼각형 외심", level_4_name: "삼각형 내심", level_5_name: "외심/내심 활용" } },
      { chapter_id: "m22_2", chapter_name: "2. 사각형의 성질", domain: "도형", levels: { level_1_name: "평행사변형 성질", level_2_name: "평행사변형이 될 조건", level_3_name: "여러 가지 사각형", level_4_name: "사각형 사이의 관계", level_5_name: "평행선과 도형 넓이" } },
      { chapter_id: "m22_3", chapter_name: "3. 도형의 닮음", domain: "도형", levels: { level_1_name: "닮음의 뜻/성질", level_2_name: "삼각형 닮음 조건", level_3_name: "평행선 사이의 선분 비", level_4_name: "삼각형 무게중심", level_5_name: "닮음 넓이/부피 비 활용" } },
      { chapter_id: "m22_4", chapter_name: "4. 피타고라스 정리", domain: "도형", levels: { level_1_name: "피타고라스 정리", level_2_name: "직각삼각형 판별", level_3_name: "정리 설명 방법", level_4_name: "피타고라스 도형 응용", level_5_name: "최단거리 문제" } },
      { chapter_id: "m22_5", chapter_name: "5. 확률", domain: "확률과 통계", levels: { level_1_name: "사건과 경우의 수", level_2_name: "합의/곱의 법칙", level_3_name: "확률의 뜻과 성질", level_4_name: "확률의 계산", level_5_name: "조건부 확률 기초 응용" } }
    ]
  },
  {
    grade_id: "mid_3_1", school_level: "middle", grade_name: "중학교 3학년 1학기", order: 91,
    chapters: [
      { chapter_id: "m31_1", chapter_name: "1. 실수와 그 계산", domain: "수와 연산", levels: { level_1_name: "제곱근 뜻/성질", level_2_name: "무리수와 실수", level_3_name: "근호 덧셈/뺄셈", level_4_name: "근호 곱셈/나눗셈", level_5_name: "실수 대소비교/응용" } },
      { chapter_id: "m31_2", chapter_name: "2. 다항식의 곱셈과 인수분해", domain: "문자와 식", levels: { level_1_name: "다항식 곱셈 공식", level_2_name: "곱셈 공식 활용", level_3_name: "인수분해 공식", level_4_name: "복잡한 식 인수분해", level_5_name: "인수분해 활용" } },
      { chapter_id: "m31_3", chapter_name: "3. 이차방정식", domain: "문자와 식", levels: { level_1_name: "이차방정식의 해", level_2_name: "인수분해 이용 풀이", level_3_name: "완전제곱식 이용 풀이", level_4_name: "근의 공식", level_5_name: "이차방정식 활용" } },
      { chapter_id: "m31_4", chapter_name: "4. 이차함수", domain: "함수", levels: { level_1_name: "이차함수 뜻", level_2_name: "y=ax² 그래프", level_3_name: "y=a(x-p)²+q 그래프", level_4_name: "y=ax²+bx+c 그래프", level_5_name: "이차함수 최댓값/최솟값 (2022 개정)" } }
    ]
  },
  {
    grade_id: "mid_3_2", school_level: "middle", grade_name: "중학교 3학년 2학기", order: 92,
    chapters: [
      { chapter_id: "m32_1", chapter_name: "1. 삼각비", domain: "도형", levels: { level_1_name: "삼각비의 뜻", level_2_name: "특수한 각의 삼각비", level_3_name: "예각의 삼각비", level_4_name: "삼각비 활용(길이 구하기)", level_5_name: "삼각비 활용(넓이 구하기)" } },
      { chapter_id: "m32_2", chapter_name: "2. 원의 성질", domain: "도형", levels: { level_1_name: "원과 현", level_2_name: "원과 접선", level_3_name: "원주각", level_4_name: "원주각의 성질", level_5_name: "원주각 성질 활용" } },
      { chapter_id: "m32_3", chapter_name: "3. 통계", domain: "확률과 통계", levels: { level_1_name: "대푯값(평균/중앙값/최빈값)", level_2_name: "산포도와 편차", level_3_name: "분산과 표준편차", level_4_name: "산점도", level_5_name: "상관관계" } }
    ]
  }
];

async function seedData() {
  console.log("Seeding Full 2022 Revised Curriculum...");
  
  // 먼저 기존의 모든 curriculum 삭제 (클린 시드)
  const existingGrades = await db.collection('curriculum').get();
  for (const doc of existingGrades.docs) {
    const chapters = await db.collection('curriculum').doc(doc.id).collection('chapters').get();
    for (const chap of chapters.docs) {
      await db.collection('curriculum').doc(doc.id).collection('chapters').doc(chap.id).delete();
    }
    await db.collection('curriculum').doc(doc.id).delete();
  }
  
  // 새 데이터 삽입
  for (const grade of curriculumData) {
    const { chapters, ...gradeData } = grade;
    const gradeRef = db.collection('curriculum').doc(grade.grade_id);
    await gradeRef.set(gradeData);
    
    for (const chapter of chapters) {
      await gradeRef.collection('chapters').doc(chapter.chapter_id).set(chapter);
    }
    console.log(`Saved Grade: ${grade.grade_name} (${chapters.length}개 단원)`);
  }

  console.log("Full Curriculum Data Seeding Complete!");
  process.exit(0);
}

seedData().catch(err => {
  console.error("Seeding failed: ", err);
  process.exit(1);
});
