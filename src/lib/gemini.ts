import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateProblemsFromAI = async (
  gradeName: string,
  chapterName: string,
  difficultyLevel: number,
  difficultyName: string,
  count: number,
  existingProblemsContext: string = ""
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

[요청 조건]
- 학년/학기: ${gradeName}
- 단원명: ${chapterName}
- 난이도: Level ${difficultyLevel} (${difficultyName})

[중복 방지용 기존 문제 참고]
아래와 유사한 문제는 피하고, 새로운 유형이나 다른 숫자, 다른 상황을 사용하여 문제를 만들어줘:
${existingProblemsContext}

[출력 데이터 형식 제약사항]
반드시 다음 JSON 배열 규격을 준수할 것. (절대 다른 텍스트를 출력하지 말 것)
[
  {
    "level": ${difficultyLevel},
    "question_text": "문제 지문 텍스트 (명확하고 자연스러운 한국어)",
    "formula": "수식이 필요한 경우 LaTeX 문법으로 작성 (필요 없으면 빈 문자열)",
    "svg_data": {
       // 문제가 도형, 함수 그래프, 표 등의 시각적 자료를 필요로 할 때 작성. 필요 없다면 null.
       // "type"은 "fraction_pie", "linear_function", "geometry_triangle", "coordinate_plane" 중 하나 또는 자유롭게 명명.
       // SVG를 그리기 위한 데이터를 넣을 것 (프론트엔드에서 파싱 가능한 형태). 
       // 예를 들어 삼각형이면 "type": "triangle", "base": 5, "height": 3 같은 속성이나, 직접적인 path 데이터를 넣을 수 있음.
       // 만약 무료 일러스트나 아이콘이 필요하다면 "type": "icon", "keyword": "apple" 형태로 작성.
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
