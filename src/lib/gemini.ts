import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateProblemsFromAI = async (
  grade: string,
  chapter: string,
  count: number,
  recipeInstruction: string,
  existingContext: string = ""
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
너는 대한민국 최고의 초등/중등 수학 교사이자 콘텐츠 개발자야.
2022 개정 수학 교육과정을 완벽히 반영하여 다음 조건에 맞는 수학 문제를 정확히 ${count}개 생성해줘.

당신은 한국의 ${grade} 수학 교사입니다.
현재 단원은 "${chapter}" 입니다.

다음 요구사항(출제 비율 및 난이도)에 맞추어 총 ${count}개의 수학 문제를 JSON 배열 형식으로 생성해주세요.

[출제 요구사항]
${recipeInstruction}

[제외할 문제들 (기존 DB에 있는 문제들이므로 절대 똑같이 내지 말 것)]
${existingContext || "없음"}

[출력 데이터 형식 제약사항]
반드시 다음 JSON 배열 규격을 준수할 것. (절대 다른 텍스트를 출력하지 말 것)
[
  {
    "chapter_id": "해당 문제가 속한 단원의 정확한 ID 문자열",
    "level": "이 문제의 실제 난이도 (1~3 사이의 정수)",
    "problem_type": "문제의 유형 ('calculation' = 단순 계산, 'application' = 실생활 응용/문장제, 'concept' = 개념 이해)",
    "question_text": "문제 지문 텍스트 (명확하고 자연스러운 한국어)",
    "formula": "수식이 필요한 경우 LaTeX 문법으로 작성 (필요 없으면 빈 문자열)",
    "svg_data": {
       // 1. 기하, 도형, 좌표평면, 그래프 등 수학적 드로잉이 필요한 경우:
       // "type": "raw_svg", "content": "<svg viewBox='0 0 200 200' width='100%' height='100%' stroke='black' fill='transparent'>...</svg>" 형태로 실제 동작하는 HTML SVG 코드를 작성. 크기에 맞게 viewBox를 설정할 것.
       // 2. 사과, 자동차, 동물 등 초등학생용 사물 일러스트가 필요한 경우:
       // "type": "icon", "keyword": "Apple", "count": 3 형태로 작성. 
       // keyword는 반드시 영문 PascalCase 명사 사용 (예: Apple, Car, Bus, Dog, Cat, Bird, Pizza, Star, Heart, Cloud 등). count는 그려질 개수.
    },
    "placeholder_example": "예: 15 (학생이 정답 입력칸에서 볼 수 있는 정답 유출이 안 되는 가짜 힌트 예시)",
    "answer_value": "실제 정답 (예: 15, x=3, 2/5 등)",
    "solution_steps": [
      "1. 첫 번째 풀이 과정",
      "2. 두 번째 풀이 과정",
      "3. 정답 도출"
    ]
  }
]

도형이나 그래프가 필수적인 기하, 함수, 도형 단원에서는 반드시 svg_data 객체를 유의미하게 채워줘.
수학적 오류가 없고, 학생 스스로 풀 수 있는 논리적이고 깔끔한 문제여야 해.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Gemini 1.5 Pro with responseMimeType json will return pure JSON.
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};
