import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Square, Loader2 } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoGeneratingFor, setAutoGeneratingFor] = useState<string | null>(null);

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
        setCurriculum(grades);
      } catch (err) {
        console.error("Error fetching curriculum:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculum();
  }, []);

  const handleStartAuto = (chapterId: string) => {
    alert("이 브라우저 창을 열어두면 이 단원에 대해 AI가 백그라운드에서 문제를 계속 생성합니다. (준비 중인 기능)");
    setAutoGeneratingFor(chapterId);
  };

  const handleStopAuto = () => {
    setAutoGeneratingFor(null);
  };

  if (!user) return <Navigate to="/login" replace />;
  // 실제 서비스라면 어드민 권한 체크가 들어가야 합니다 (예: user.email === 'admin@...')

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Admin: 문제은행 자동 생성기</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {curriculum.map(grade => (
              <div key={grade.grade_id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">{grade.grade_name}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {grade.chapters.map((chapter: any) => (
                    <div key={chapter.chapter_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{chapter.chapter_name}</span>
                      <div className="flex gap-2">
                        {autoGeneratingFor === chapter.chapter_id ? (
                          <button 
                            onClick={handleStopAuto}
                            className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-red-200 transition-colors"
                          >
                            <Square size={16} /> 중지
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStartAuto(chapter.chapter_id)}
                            disabled={autoGeneratingFor !== null}
                            className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <Play size={16} /> 자동 생성 시작
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
