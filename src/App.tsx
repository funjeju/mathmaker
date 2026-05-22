import { useState, useEffect, useMemo } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import { Printer, Eye, EyeOff, Settings, Loader2 } from 'lucide-react';
import { MathProblem } from './components/MathProblem';
import { db } from './lib/firebase';
import { collection, getDocs, query, where, limit, addDoc } from 'firebase/firestore';
import { generateProblemsFromAI } from './lib/gemini';

function App() {
  const [curriculumData, setCurriculumData] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [problemCount, setProblemCount] = useState(10);
  
  const [generatedProblems, setGeneratedProblems] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Curriculum Data on Mount
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
        
        // Sort by order
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

  // Smart Fetch & AI Generate
  const handleGenerate = async () => {
    if (!selectedChapterId || !currentGrade || !currentChapter) return;
    setIsGenerating(true);
    
    try {
      // 1. Fetch existing problems from DB
      const q = query(
        collection(db, 'problems'),
        where("chapter_id", "==", selectedChapterId),
        where("level", "==", difficulty)
      );
      
      const snapshot = await getDocs(q);
      const problemsPool = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let finalProblems = [...problemsPool];

      // 2. If we don't have enough problems, generate more via AI
      if (problemsPool.length < problemCount) {
        const neededCount = problemCount - problemsPool.length;
        const existingContext = problemsPool.map(p => p.question_text).join(" | ");
        
        console.log(`[AI Triggered] DB has ${problemsPool.length} problems. Generating ${neededCount} new problems via Gemini...`);
        
        const difficultyName = currentChapter.levels[`level_${difficulty}_name`] || "보통";
        
        const newProblemsRaw = await generateProblemsFromAI(
          currentGrade.grade_name,
          currentChapter.chapter_name,
          difficulty,
          difficultyName,
          neededCount,
          existingContext
        );

        // 3. Save newly generated problems to DB
        const generatedSaved = [];
        for (const rawProb of newProblemsRaw) {
          const docRef = await addDoc(collection(db, 'problems'), {
            chapter_id: selectedChapterId,
            level: difficulty,
            question_text: rawProb.question_text || "",
            formula: rawProb.formula || "",
            svg_data: rawProb.svg_data || null,
            placeholder_example: rawProb.placeholder_example || "",
            answer_value: rawProb.answer_value || "",
            solution_steps: rawProb.solution_steps || [],
            created_at: new Date().toISOString()
          });
          generatedSaved.push({ id: docRef.id, ...rawProb });
        }
        
        finalProblems = [...finalProblems, ...generatedSaved];
      }
      
      // Shuffle array to make it dynamic, then pick the requested count
      finalProblems = finalProblems.sort(() => 0.5 - Math.random()).slice(0, problemCount);
      
      setGeneratedProblems(finalProblems);
      setShowAnswers(false);
    } catch (error) {
      console.error("Error fetching/generating problems:", error);
      alert("문제 생성 중 오류가 발생했습니다. (API 키나 네트워크를 확인해주세요)");
    } finally {
      setIsGenerating(false);
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

  return (
    <MathJaxContext>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
        
        {/* Settings Panel - Hidden in Print */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 shadow-sm print:hidden flex flex-col h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Settings size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">MathGen</h1>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-6">
            {/* Grade Selection */}
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

            {/* Chapter Selection */}
            {currentGrade && (
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

            {/* Difficulty */}
            {currentChapter && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider flex justify-between">
                  <span>난이도 설정</span>
                  <span className="text-indigo-600">Level {difficulty}</span>
                </label>
                <input 
                  type="range" 
                  min="1" max="5" 
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="text-xs text-slate-500 mt-2 bg-slate-100 p-3 rounded-md">
                  {currentChapter.levels[`level_${difficulty}_name`]}
                </div>
              </div>
            )}

            {/* Problem Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">문항 수 ({problemCount}문제)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(num => (
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
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '학습지 생성하기'}
            </button>
          </div>
        </aside>

        {/* Worksheet Viewer / Print Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 relative">
          {generatedProblems.length > 0 ? (
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
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-md font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Printer size={18} />
                  시험지 인쇄 (PDF)
                </button>
              </div>

              {/* Worksheet Canvas */}
              <div className="max-w-[1000px] mx-auto my-8 print:my-0 print:mx-0 p-8 sm:p-12 bg-white min-h-[297mm] shadow-xl print:shadow-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="level-header border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{currentChapter?.chapter_name}</h2>
                    <p className="text-lg text-slate-600 font-medium">{currentGrade?.grade_name} • Level {difficulty} 학습지</p>
                  </div>
                  
                  <div className="flex gap-4 print:gap-6 items-end text-lg font-bold text-slate-700">
                    <div className="flex items-end gap-2">
                      <span>학년/반:</span>
                      <div className="border-b-2 border-slate-400 w-24"></div>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>이름:</span>
                      <div className="border-b-2 border-slate-400 w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Problems Grid */}
                <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8">
                  {generatedProblems.map((problem, idx) => (
                    <MathProblem 
                      key={problem.id} 
                      problem={problem} 
                      index={idx} 
                      showAnswers={showAnswers} 
                    />
                  ))}
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

export default App;
