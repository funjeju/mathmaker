import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function MyPage() {
  const { user } = useAuth();
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWorksheets = async () => {
      try {
        const q = query(
          collection(db, 'worksheets'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setWorksheets(docs);
      } catch (err) {
        console.error("Error fetching worksheets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorksheets();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900">내 학습지 보관함</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : worksheets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            아직 저장된 학습지가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worksheets.map(ws => (
              <div key={ws.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-xl mb-2">{ws.title}</h3>
                <p className="text-slate-500 mb-4">{ws.grade_name} • {ws.chapter_name}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                    총 {ws.problem_ids?.length || 0}문제
                  </span>
                  <span className="text-slate-400">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
