export const curriculumData = [
  {
    school_level: "elementary",
    grade_id: "elem_5_1",
    grade_name: "초등학교 5학년 1학기",
    chapters: [
      {
        chapter_id: "ch_fractions_calc",
        chapter_name: "분수의 덧셈과 뺄셈",
        levels: {
          level_1_name: "1단계: 그림(원/수직선)을 통한 개념 매칭",
          level_2_name: "2단계: 분모가 같은 분수의 계산",
          level_3_name: "3단계: 받아올림이 없는 진분수의 통분 계산",
          level_4_name: "4단계: 받아올림이 있는 대분수의 덧셈",
          level_5_name: "5단계: 세 분수의 혼합 사칙 연산"
        }
      }
    ]
  },
  {
    school_level: "middle",
    grade_id: "mid_1_1",
    grade_name: "중학교 1학년 1학기",
    chapters: [
      {
        chapter_id: "ch_linear_equations",
        chapter_name: "일차방정식",
        levels: {
          level_1_name: "1단계: 등식의 기초와 식 구별",
          level_2_name: "2단계: 등식의 성질과 이항",
          level_3_name: "3단계: 일차방정식의 기본 계산",
          level_4_name: "4단계: 계수가 소수와 분수인 방정식",
          level_5_name: "5단계: 분배법칙과 괄호의 전개"
        }
      }
    ]
  }
];

export const sampleProblems = [
  {
    problem_id: "PROB_E51_FR_012",
    chapter_id: "ch_fractions_calc",
    level: 1,
    question_text: "다음 색칠된 원 모양 그림을 보고 나타내는 분수를 계산하여 적으시오.",
    formula: "",
    svg_data: {
      type: "fraction_pie",
      total_slices: 8,
      shaded_slices: 3,
      fill_color: "#fbbf24"
    },
    choices: null,
    placeholder_example: "예: 2/5 (슬래시 기호 사용)",
    answer_value: "3/8",
    solution_steps: [
      "1. 주어진 원은 전체가 똑같이 8칸으로 나뉘어 있으므로 분모는 8입니다.",
      "2. 그중 노란색으로 색칠된 칸은 총 3칸이므로 분자는 3입니다.",
      "3. 따라서 이 그림이 나타내는 분수는 3/8 입니다."
    ]
  },
  {
    problem_id: "PROB_M11_LE_001",
    chapter_id: "ch_linear_equations",
    level: 3,
    question_text: "다음 일차함수의 그래프를 보고, 기울기와 y절편을 이용하여 식을 세우고, x=5일 때 y의 값을 구하시오.",
    formula: "y = 2x - 1",
    svg_data: {
      type: "linear_function",
      slope: 2,
      y_intercept: -1,
      expression: "y = 2x - 1"
    },
    choices: null,
    placeholder_example: "예: y = 3x + 2",
    answer_value: "9",
    solution_steps: [
      "1. 그래프가 y축과 만나는 점은 (0, -1)이므로 y절편은 -1입니다.",
      "2. x가 1 증가할 때 y가 2 증가하므로 기울기는 2입니다.",
      "3. 함수식은 y = 2x - 1 입니다.",
      "4. x=5를 대입하면 y = 2(5) - 1 = 9 입니다."
    ]
  }
];
