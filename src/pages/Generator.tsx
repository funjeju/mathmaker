import { useState, useEffect, useMemo } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import { Printer, Eye, EyeOff, Settings, Loader2, Save, User as UserIcon, LogOut } from 'lucide-react';
import { MathProblem } from '../components/MathProblem';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { generateProblemsFromAI } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoadingSequence = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "데이터베이스에서 기존 문제를 확인하는 중...",
    "선택한 난이도 배분에 맞춰 문제 구조를 설계하는 중...",
    "AI가 부족한 유형의 새로운 문제를 출제하는 중...",
    "수식과 도형 데이터를 렌더링하는 중...",
    "거의 다 완성되었습니다! 시험지를 조립하는 중..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => Math.min(prev + 1, messages.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="text-indigo-600/80 font-semibold animate-pulse text-xl text-center">
      {messages[msgIdx]}
    </div>
  );
};

export default function Generator() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [curriculumData, setCurriculumData] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  // New Test Scope State
  const [testScope, setTestScope] = useState<'chapter' | 'semester'>('chapter');

  const [problemCount, setProblemCount] = useState(10);
  const [levelDist, setLevelDist] = useState({ 1: 3, 2: 4, 3: 3 });
  const [testMode, setTestMode] = useState('mixed'); // 'mixed', 'calculation', 'application'
  
  const [generatedProblems, setGeneratedProblems] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (problemCount === 5) setLevelDist({ 1: 2, 2: 2, 3: 1 });
    else if (problemCount === 10) setLevelDist({ 1: 3, 2: 4, 3: 3 });
    else if (problemCount === 15) setLevelDist({ 1: 5, 2: 5, 3: 5 });
    else if (problemCount === 20) setLevelDist({ 1: 6, 2: 8, 3: 6 });
    else if (problemCount === 25) setLevelDist({ 1: 7, 2: 10, 3: 8 });
    else if (problemCount === 30) setLevelDist({ 1: 9, 2: 12, 3: 9 });
    else if (problemCount === 40) setLevelDist({ 1: 12, 2: 16, 3: 12 });
  }, [problemCount]);

  useEffect(() => {
    if (testScope === 'chapter') {
      if (![5, 10, 15, 20].includes(problemCount)) setProblemCount(10);
    } else {
      if (![20, 25, 30, 40].includes(problemCount)) setProblemCount(20);
    }
  }, [testScope]);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const gradesSnapshot = await getDocs(collection(db, 'curriculum'));
        const grades: any[] = [];
        
        for (const doc of gradesSnapshot.docs) {
          const gradeData = doc.data();
          const chaptersSnapshot = await getDocs(collection(db, 'curriculum', doc.id, 'chapters'));
          const chapters = chaptersSnapshot.docs.map(c => c.data());
          grades.push({ ...gradeData, grade_id: doc.id, chapters });
        }
        
        grades.sort((a, b) => a.order - b.order);
        setCurriculumData(grades);
        
        if (grades.length > 0) {
          setSelectedGradeId(grades[0].grade_id);
          if (grades[0].chapters.length > 0) {
            setSelectedChapterId(grades[0].chapters[0].chapter_id);
          }
        }
      } catch (error) {
        console.error("Error fetching curriculum:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurriculum();
  }, []);

  const currentGrade = useMemo(() => {
    return curriculumData.find(g => g.grade_id === selectedGradeId) || null;
  }, [selectedGradeId, curriculumData]);

  const currentChapter = useMemo(() => {
    if (!currentGrade) return null;
    return currentGrade.chapters.find((c: any) => c.chapter_id === selectedChapterId) || currentGrade.chapters[0];
  }, [currentGrade, selectedChapterId]);

  const handleLevelChange = (lvl: 1|2|3, value: number) => {
    setLevelDist(prev => ({ ...prev, [lvl]: value }));
  };

  const handleGenerate = async () => {
    if (!currentGrade) return;
    if (testScope === 'chapter' && !currentChapter) return;
    
    const sum = levelDist[1] + levelDist[2] + levelDist[3];
    if (sum !== problemCount) {
      alert(`난이도별 문항 수의 합(${sum}개)이 총 문항 수(${problemCount}개)와 일치해야 합니다.`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const scopeChapters = testScope === 'chapter' ? [currentChapter] : currentGrade.chapters;
      const scopeChapterIds = scopeChapters.map((c: any) => c.chapter_id);
      
      let finalProblems: any[] = [];
      let neededDist = { 1: 0, 2: 0, 3: 0 };
      let existingContexts: string[] = [];

      // Fetch from all chapters in scope
      let pool: any[] = [];
      for (const cId of scopeChapterIds) {
        let q;
        if (testMode === 'calculation') {
          q = query(collection(db, 'problems'), where("chapter_id", "==", cId), where("problem_type", "==", "calculation"));
        } else if (testMode === 'application') {
          q = query(collection(db, 'problems'), where("chapter_id", "==", cId), where("problem_type", "==", "application"));
        } else {
          q = query(collection(db, 'problems'), where("chapter_id", "==", cId));
        }
        const snapshot = await getDocs(q);
        pool.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }

      for (const lvl of [1, 2, 3] as const) {
        const targetCount = levelDist[lvl];
        if (targetCount === 0) continue;

        const levelPool = pool.filter(p => p.level === lvl);
        const shuffled = levelPool.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, targetCount);
        finalProblems.push(...selected);

        if (selected.length < targetCount) {
          neededDist[lvl] = targetCount - selected.length;
          existingContexts.push(...selected.map((p: any) => p.question_text));
        }
      }

      const totalNeeded = neededDist[1] + neededDist[2] + neededDist[3];

      if (totalNeeded > 0) {
        let recipeInstruction = "아래 지정된 난이도별 요구 개수에 맞춰 정확히 출제하세요:\n";
        if (neededDist[1] > 0) recipeInstruction += `- 난이도 1(하, 기초 개념 및 쉬운 연산): ${neededDist[1]}개\n`;
        if (neededDist[2] > 0) recipeInstruction += `- 난이도 2(중, 기본 유형 및 평이한 문장제): ${neededDist[2]}개\n`;
        if (neededDist[3] > 0) recipeInstruction += `- 난이도 3(상, 심화 응용 및 복합 개념): ${neededDist[3]}개\n`;

        if (testMode === 'calculation') {
          recipeInstruction += `\n모든 문제를 '단순 계산형(calculation)'으로만 출제하세요.`;
        } else if (testMode === 'application') {
          recipeInstruction += `\n모든 문제를 '실생활 응용/문장제(application)'으로만 출제하세요.`;
        } else {
          recipeInstruction += `\n문제 유형을 계산형과 응용형으로 골고루 섞어주세요.`;
        }

        let chapterContextForAI = "";
        if (testScope === 'chapter') {
          chapterContextForAI = `"${currentChapter.chapter_name}" 단원만 출제 (모든 문제의 chapter_id는 "${currentChapter.chapter_id}"로 통일)`;
        } else {
          const chList = currentGrade.chapters.map((c: any) => `- ${c.chapter_name} (chapter_id: "${c.chapter_id}")`).join('\n');
          chapterContextForAI = `다음 학기 전체 단원들을 골고루 섞어서 종합 기말고사 형태로 출제하세요.\n${chList}\n각 문제마다 알맞은 단원의 chapter_id를 정확히 기입하세요.`;
        }

        console.log(`[AI Triggered] Generating ${totalNeeded} problems with scope: ${testScope}`);
        
        const newProblemsRaw = await generateProblemsFromAI(
          currentGrade.grade_name,
          chapterContextForAI,
          totalNeeded,
          recipeInstruction,
          existingContexts.join(" | ")
        );

        let remainingNeeds = { ...neededDist };

        for (const rawProb of newProblemsRaw) {
          let pLevel = rawProb.level;
          if (![1, 2, 3].includes(pLevel)) {
            if (remainingNeeds[1] > 0) pLevel = 1;
            else if (remainingNeeds[2] > 0) pLevel = 2;
            else pLevel = 3;
          }
          if (remainingNeeds[pLevel as 1|2|3] > 0) {
             remainingNeeds[pLevel as 1|2|3]--;
          }

          const probType = rawProb.problem_type || (testMode === 'application' ? 'application' : 'calculation');
          const finalChapterId = rawProb.chapter_id || currentChapter?.chapter_id || scopeChapterIds[0];

          const docRef = await addDoc(collection(db, 'problems'), {
            chapter_id: finalChapterId,
            level: pLevel,
            problem_type: probType,
            question_text: rawProb.question_text || "",
            formula: rawProb.formula || "",
            svg_data: rawProb.svg_data || null,
            placeholder_example: rawProb.placeholder_example || "",
            answer_value: rawProb.answer_value || "",
            solution_steps: rawProb.solution_steps || [],
            created_at: new Date().toISOString()
          });
          finalProblems.push({ id: docRef.id, ...rawProb, level: pLevel, chapter_id: finalChapterId });
        }
      }
      
      finalProblems.sort((a, b) => a.level - b.level);
      setGeneratedProblems(finalProblems);
      setShowAnswers(false);
    } catch (error) {
      console.error("Error fetching/generating problems:", error);
      alert("문제 생성 중 오류가 발생했습니다. (API 키나 네트워크를 확인해주세요)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorksheet = async () => {
    if (!user) {
      alert("학습지를 저장하려면 로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    if (generatedProblems.length === 0) return;

    setIsSaving(true);
    try {
      const titleLabel = testScope === 'semester' 
        ? `${currentGrade?.grade_name} 학기말 종합 모의고사` 
        : `${currentGrade?.grade_name} ${currentChapter?.chapter_name}`;

      await addDoc(collection(db, 'worksheets'), {
        uid: user.uid,
        title: titleLabel,
        grade_name: currentGrade?.grade_name,
        chapter_name: testScope === 'semester' ? '종합평가' : currentChapter?.chapter_name,
        problem_ids: generatedProblems.map(p => p.id),
        created_at: new Date().toISOString()
      });
      alert("학습지가 마이페이지에 안전하게 저장되었습니다!");
    } catch (err) {
      console.error("Error saving worksheet:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const sumLevels = levelDist[1] + levelDist[2] + levelDist[3];

  return (
    <MathJaxContext>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
        
        {/* Settings Panel */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 shadow-sm print:hidden flex flex-col h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <Settings size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">MathGen</h1>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            {user ? (
              <div className="flex items-center gap-3 w-full">
                <Link to="/mypage" className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-2 rounded-lg hover:bg-slate-100 font-semibold text-sm">
                  <UserIcon size={16} /> 마이페이지
                </Link>
                <button onClick={logout} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="w-full text-center bg-slate-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-slate-800">
                로그인 / 회원가입
              </Link>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6">
            
            {/* Test Scope Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setTestScope('chapter')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                  testScope === 'chapter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                단원 집중 학습
              </button>
              <button
                onClick={() => setTestScope('semester')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                  testScope === 'semester' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                학기말 종합고사
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">학년 선택</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium appearance-none"
                value={selectedGradeId}
                onChange={(e) => {
                  setSelectedGradeId(e.target.value);
                  const grade = curriculumData.find(g => g.grade_id === e.target.value);
                  if (grade && grade.chapters.length > 0) {
                    setSelectedChapterId(grade.chapters[0].chapter_id);
                  }
                }}
              >
                {curriculumData.map(grade => (
                  <option key={grade.grade_id} value={grade.grade_id}>
                    {grade.school_level === 'elementary' ? '🎒 ' : '🏫 '}
                    {grade.grade_name}
                  </option>
                ))}
              </select>
            </div>

            {currentGrade && testScope === 'chapter' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">단원 선택</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                >
                  {currentGrade.chapters.map((chapter: any) => (
                    <option key={chapter.chapter_id} value={chapter.chapter_id}>
                      {chapter.chapter_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {currentGrade && testScope === 'semester' && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm font-medium">
                🎉 현재 선택된 학년의 <strong>전체 단원</strong>을 골고루 섞어 학기말 기말고사 형태로 출제합니다.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">총 문항 수 선택</label>
              <div className="flex gap-2">
                {(testScope === 'chapter' ? [5, 10, 15, 20] : [20, 25, 30, 40]).map(num => (
                  <button
                    key={num}
                    onClick={() => setProblemCount(num)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                      problemCount === num 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {currentGrade && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">난이도별 배분 (1~3)</label>
                  <span className={`text-sm font-bold ${sumLevels === problemCount ? 'text-emerald-600' : 'text-red-500'}`}>
                    합계: {sumLevels} / {problemCount}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium text-slate-600">Level 1 (하)</span>
                    <input type="range" min="0" max={problemCount} value={levelDist[1]} onChange={(e) => handleLevelChange(1, parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <span className="w-6 text-right font-bold text-indigo-700">{levelDist[1]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium text-slate-600">Level 2 (중)</span>
                    <input type="range" min="0" max={problemCount} value={levelDist[2]} onChange={(e) => handleLevelChange(2, parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <span className="w-6 text-right font-bold text-indigo-700">{levelDist[2]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium text-slate-600">Level 3 (상)</span>
                    <input type="range" min="0" max={problemCount} value={levelDist[3]} onChange={(e) => handleLevelChange(3, parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <span className="w-6 text-right font-bold text-indigo-700">{levelDist[3]}</span>
                  </div>
                </div>
              </div>
            )}

            {currentGrade && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">문제 유형 제한</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  value={testMode}
                  onChange={(e) => setTestMode(e.target.value)}
                >
                  <option value="mixed">🎲 혼합 출제 (계산 + 응용)</option>
                  <option value="calculation">🧮 단순 계산만 집중</option>
                  <option value="application">📝 문장제/응용만 집중</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || sumLevels !== problemCount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '학습지 생성하기'}
            </button>
            {sumLevels !== problemCount && (
              <p className="text-red-500 text-xs text-center mt-2 font-medium">난이도 합계를 총 문항수({problemCount})와 맞춰주세요.</p>
            )}
          </div>
        </aside>

        {/* Worksheet Viewer / Print Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 relative">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center print:hidden px-4">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-8" />
              <LoadingSequence />
            </div>
          ) : generatedProblems.length > 0 ? (
            <>
              {/* Floating Actions */}
              <div className="sticky top-6 right-6 flex justify-end gap-3 z-10 print:hidden px-6">
                <button 
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-full shadow-md font-semibold hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showAnswers ? '정답 숨기기' : '전체 정답 보기'}
                </button>
                
                <button 
                  onClick={handleSaveWorksheet}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  시험지 저장하기
                </button>

                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-md font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Printer size={18} />
                  인쇄 (PDF)
                </button>
              </div>

              {/* Worksheet Canvas */}
              <div className="max-w-[1000px] mx-auto my-8 print:my-0 print:mx-0 p-8 sm:p-12 bg-white min-h-[297mm] shadow-xl print:shadow-none print:w-full print:max-w-none print:p-0">
                
                {/* Traditional Exam Header (Print & Web) */}
                <div className="level-header border-2 border-slate-900 mb-8 print:mb-6 flex flex-col">
                  <div className="border-b-2 border-slate-900 p-5 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-wider">
                      {testScope === 'semester' ? '학기말 종합 모의고사' : currentChapter?.chapter_name}
                    </h2>
                    <p className="text-sm text-slate-600 font-medium mt-1">{currentGrade?.grade_name} • 맞춤형 평가</p>
                  </div>
                  <div className="flex divide-x-2 divide-slate-900 text-center font-bold text-slate-800 bg-slate-50 print:bg-transparent">
                    <div className="flex-1 py-2.5">학년 / 반 <span className="ml-2 text-transparent underline decoration-slate-400 decoration-1 underline-offset-4">____학년 ____반</span></div>
                    <div className="flex-1 py-2.5">성 명 <span className="ml-2 text-transparent underline decoration-slate-400 decoration-1 underline-offset-4">________</span></div>
                    <div className="flex-1 py-2.5">점 수 <span className="ml-2 text-transparent underline decoration-slate-400 decoration-1 underline-offset-4">____ / 100</span></div>
                  </div>
                </div>

                <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedProblems.map((problem, idx) => {
                    const chName = currentGrade?.chapters.find((c: any) => c.chapter_id === problem.chapter_id)?.chapter_name;
                    return (
                      <div key={problem.id} className="relative mt-4">
                        <div className="absolute -top-3 right-4 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded shadow-sm z-10 flex gap-2">
                          {testScope === 'semester' && <span className="text-indigo-600">{chName}</span>}
                          <span>LV {problem.level}</span>
                        </div>
                        <MathProblem 
                          problem={problem} 
                          index={idx} 
                          showAnswers={showAnswers} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-lg font-medium print:hidden">
              좌측 패널에서 설정을 완료하고 '학습지 생성하기'를 눌러주세요.
            </div>
          )}
        </main>
      </div>
    </MathJaxContext>
  );
}
