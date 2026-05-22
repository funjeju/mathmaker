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

// 2022 개정 교육과정 기준 간소화된 통합 데이터셋
const curriculumData = [
  // --- 초등 ---
  {
    grade_id: "elem_3_1", school_level: "elementary", grade_name: "초등학교 3학년 1학기", order: 31,
    chapters: [
      { chapter_id: "e31_01", chapter_name: "1. 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "세 자리 수의 덧셈", level_2_name: "받아올림이 있는 덧셈", level_3_name: "세 자리 수의 뺄셈", level_4_name: "받아내림이 있는 뺄셈", level_5_name: "덧셈과 뺄셈의 활용" } },
      { chapter_id: "e31_02", chapter_name: "2. 평면도형", domain: "도형과 측정", levels: { level_1_name: "선분, 반직선, 직선", level_2_name: "각과 직각", level_3_name: "직각삼각형", level_4_name: "직사각형과 정사각형", level_5_name: "복합 평면도형 문제" } },
      { chapter_id: "e31_03", chapter_name: "3. 나눗셈", domain: "수와 연산", levels: { level_1_name: "똑같이 나누기", level_2_name: "곱셈과 나눗셈의 관계", level_3_name: "나눗셈의 몫 구하기", level_4_name: "나머지가 없는 나눗셈", level_5_name: "문장제 나눗셈" } }
    ]
  },
  {
    grade_id: "elem_4_1", school_level: "elementary", grade_name: "초등학교 4학년 1학기", order: 41,
    chapters: [
      { chapter_id: "e41_01", chapter_name: "1. 큰 수", domain: "수와 연산", levels: { level_1_name: "만, 십만, 백만, 천만", level_2_name: "억과 조", level_3_name: "큰 수의 자릿값", level_4_name: "뛰어서 세기", level_5_name: "큰 수의 크기 비교" } },
      { chapter_id: "e41_02", chapter_name: "2. 각도", domain: "도형과 측정", levels: { level_1_name: "각의 크기 비교", level_2_name: "각도기로 각도 재기", level_3_name: "예각과 둔각", level_4_name: "각도의 합과 차", level_5_name: "삼각형/사각형의 내각의 합" } },
      { chapter_id: "e41_03", chapter_name: "3. 분수의 덧셈과 뺄셈", domain: "수와 연산", levels: { level_1_name: "진분수의 덧셈", level_2_name: "대분수의 덧셈", level_3_name: "진분수의 뺄셈", level_4_name: "대분수의 뺄셈", level_5_name: "받아올림/내림이 있는 분수 계산" } }
    ]
  },
  {
    grade_id: "elem_5_1", school_level: "elementary", grade_name: "초등학교 5학년 1학기", order: 51,
    chapters: [
      { chapter_id: "e51_01", chapter_name: "1. 자연수의 혼합 계산", domain: "수와 연산", levels: { level_1_name: "덧셈과 뺄셈 혼합", level_2_name: "곱셈과 나눗셈 혼합", level_3_name: "사칙연산 혼합", level_4_name: "괄호가 있는 혼합 계산", level_5_name: "복잡한 식 세우고 풀기" } },
      { chapter_id: "e51_02", chapter_name: "2. 약수와 배수", domain: "수와 연산", levels: { level_1_name: "약수 구하기", level_2_name: "배수 구하기", level_3_name: "공약수와 최대공약수", level_4_name: "공배수와 최소공배수", level_5_name: "최대공약수/최소공배수 활용" } },
      { chapter_id: "e51_03", chapter_name: "3. 규칙과 대응", domain: "변화와 관계", levels: { level_1_name: "두 양 사이의 관계 찾기", level_2_name: "대응 관계를 식으로 나타내기", level_3_name: "표를 보고 식 세우기", level_4_name: "생활 속 규칙 찾기", level_5_name: "복잡한 패턴의 대응 관계" } }
    ]
  },
  {
    grade_id: "elem_6_1", school_level: "elementary", grade_name: "초등학교 6학년 1학기", order: 61,
    chapters: [
      { chapter_id: "e61_01", chapter_name: "1. 분수의 나눗셈", domain: "수와 연산", levels: { level_1_name: "(자연수)÷(자연수)", level_2_name: "(분수)÷(자연수)", level_3_name: "대분수의 나눗셈", level_4_name: "도형에서의 분수 나눗셈", level_5_name: "복잡한 문장제 문제" } },
      { chapter_id: "e61_02", chapter_name: "2. 각기둥과 각뿔", domain: "도형과 측정", levels: { level_1_name: "입체도형의 이해", level_2_name: "각기둥의 구성 요소", level_3_name: "각뿔의 구성 요소", level_4_name: "각기둥의 전개도", level_5_name: "전개도로 기둥 만들기" } },
      { chapter_id: "e61_03", chapter_name: "3. 비와 비율", domain: "변화와 관계", levels: { level_1_name: "두 수 비교하기", level_2_name: "비 기호와 의미", level_3_name: "비율 구하기", level_4_name: "백분율", level_5_name: "비율과 백분율 활용" } }
    ]
  },
  // --- 중등 ---
  {
    grade_id: "mid_1_1", school_level: "middle", grade_name: "중학교 1학년 1학기", order: 71,
    chapters: [
      { chapter_id: "m11_01", chapter_name: "1. 소인수분해", domain: "수와 연산", levels: { level_1_name: "소수와 합성수", level_2_name: "거듭제곱과 소인수분해", level_3_name: "최대공약수와 그 활용", level_4_name: "최소공배수와 그 활용", level_5_name: "복합 활용 문제" } },
      { chapter_id: "m11_02", chapter_name: "2. 정수와 유리수", domain: "수와 연산", levels: { level_1_name: "양수와 음수", level_2_name: "절댓값과 대소 관계", level_3_name: "정수와 유리수의 덧셈/뺄셈", level_4_name: "정수와 유리수의 곱셈/나눗셈", level_5_name: "유리수의 혼합 계산" } },
      { chapter_id: "m11_03", chapter_name: "3. 문자와 식", domain: "문자와 식", levels: { level_1_name: "문자를 사용한 식", level_2_name: "식의 값 구하기", level_3_name: "일차식의 덧셈과 뺄셈", level_4_name: "일차방정식의 해", level_5_name: "일차방정식의 활용" } },
      { chapter_id: "m11_04", chapter_name: "4. 좌표평면과 그래프", domain: "함수", levels: { level_1_name: "순서쌍과 좌표", level_2_name: "그래프의 이해", level_3_name: "정비례 관계", level_4_name: "반비례 관계", level_5_name: "정비례/반비례 활용" } }
    ]
  },
  {
    grade_id: "mid_2_1", school_level: "middle", grade_name: "중학교 2학년 1학기", order: 81,
    chapters: [
      { chapter_id: "m21_01", chapter_name: "1. 유리수와 순환소수", domain: "수와 연산", levels: { level_1_name: "유리수와 소수", level_2_name: "순환소수", level_3_name: "순환소수를 분수로 나타내기", level_4_name: "유리수의 연산", level_5_name: "순환소수 활용" } },
      { chapter_id: "m21_02", chapter_name: "2. 식의 계산", domain: "문자와 식", levels: { level_1_name: "지수법칙", level_2_name: "단항식의 곱셈과 나눗셈", level_3_name: "다항식의 덧셈과 뺄셈", level_4_name: "다항식의 곱셈", level_5_name: "다항식의 혼합 계산" } },
      { chapter_id: "m21_03", chapter_name: "3. 연립일차방정식", domain: "문자와 식", levels: { level_1_name: "미지수가 2개인 일차방정식", level_2_name: "대입법", level_3_name: "가감법", level_4_name: "복잡한 연립방정식", level_5_name: "연립방정식의 활용" } },
      { chapter_id: "m21_04", chapter_name: "4. 일차함수", domain: "함수", levels: { level_1_name: "일차함수와 그래프", level_2_name: "기울기와 x절편/y절편", level_3_name: "일차함수의 성질", level_4_name: "일차함수의 식 구하기", level_5_name: "일차함수와 일차방정식의 관계" } }
    ]
  },
  {
    grade_id: "mid_3_1", school_level: "middle", grade_name: "중학교 3학년 1학기", order: 91,
    chapters: [
      { chapter_id: "m31_01", chapter_name: "1. 실수와 그 계산", domain: "수와 연산", levels: { level_1_name: "제곱근의 뜻과 성질", level_2_name: "무리수와 실수", level_3_name: "근호를 포함한 식의 덧셈/뺄셈", level_4_name: "근호를 포함한 식의 곱/나눗셈", level_5_name: "실수의 대소 관계와 활용" } },
      { chapter_id: "m31_02", chapter_name: "2. 다항식의 곱셈과 인수분해", domain: "문자와 식", levels: { level_1_name: "곱셈 공식", level_2_name: "공통인수와 인수분해 공식", level_3_name: "복잡한 식의 인수분해", level_4_name: "인수분해를 이용한 수의 계산", level_5_name: "도형의 넓이와 인수분해" } },
      { chapter_id: "m31_03", chapter_name: "3. 이차방정식", domain: "문자와 식", levels: { level_1_name: "이차방정식의 뜻과 해", level_2_name: "인수분해를 이용한 풀이", level_3_name: "완전제곱식을 이용한 풀이", level_4_name: "근의 공식", level_5_name: "이차방정식의 활용" } },
      { chapter_id: "m31_04", chapter_name: "4. 이차함수", domain: "함수", levels: { level_1_name: "이차함수 y=ax²의 그래프", level_2_name: "이차함수 y=a(x-p)²+q", level_3_name: "이차함수 y=ax²+bx+c", level_4_name: "이차함수 그래프의 성질", level_5_name: "이차함수의 최댓값과 최솟값" } }
    ]
  }
];

async function seedData() {
  console.log("Seeding Comprehensive Curriculum...");
  
  for (const grade of curriculumData) {
    const { chapters, ...gradeData } = grade;
    const gradeRef = db.collection('curriculum').doc(grade.grade_id);
    await gradeRef.set(gradeData);
    
    for (const chapter of chapters) {
      await gradeRef.collection('chapters').doc(chapter.chapter_id).set(chapter);
    }
    console.log(`Saved Grade: ${grade.grade_name}`);
  }

  console.log("Curriculum Data Seeding Complete!");
  process.exit(0);
}

seedData().catch(err => {
  console.error("Seeding failed: ", err);
  process.exit(1);
});
