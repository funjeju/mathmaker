

export const LinearFunctionGraph: React.FC = () => {
  return (
    <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto border border-slate-200 bg-slate-50">
      {/* 모눈 격자 grid */}
      <path d="M 10 0 L 10 100 M 20 0 L 20 100 M 30 0 L 30 100 M 40 0 L 40 100 M 60 0 L 60 100 M 70 0 L 70 100 M 80 0 L 80 100 M 90 0 L 90 100" stroke="#e2e8f0" strokeWidth="0.5"/>
      <path d="M 0 10 L 100 10 M 0 20 L 100 20 M 0 30 L 100 30 M 0 40 L 100 40 M 0 60 L 100 60 M 0 70 L 100 70 M 0 80 L 100 80 M 0 90 L 100 90" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* X축 및 Y축 */}
      <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="1.5"/>
      <line x1="50" y1="0" x2="50" y2="100" stroke="#334155" strokeWidth="1.5"/>
      
      {/* 축 화살표 표시 */}
      <path d="M 97,48 L 100,50 L 97,52 Z" fill="#334155"/>
      <path d="M 48,3 L 50,0 L 52,3 Z" fill="#334155"/>
      
      {/* 함수 그래프 y = 2x - 1 렌더링 */}
      <line x1="20" y1="110" x2="70" y2="10" stroke="#ef4444" strokeWidth="2"/>
    </svg>
  );
};
