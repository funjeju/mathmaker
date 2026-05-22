

interface FractionPieProps {
  totalSlices: number;
  shadedSlices: number;
  fillColor?: string;
}

export const FractionPie: React.FC<FractionPieProps> = ({
  totalSlices,
  shadedSlices,
  fillColor = '#fbbf24'
}) => {
  // SVG for 8 slices (3 shaded) as specified in the prompt
  // For a fully dynamic version, we'd calculate path data using sine/cosine.
  // We'll use the prompt's hardcoded paths for this specific example
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" className="mx-auto">
      {/* 전체 원 배경 */}
      <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#475569" strokeWidth="2"/>
      
      {/* 8조각 구분선 분할선들 */}
      {totalSlices === 8 && (
        <>
          <line x1="50" y1="5" x2="50" y2="95" stroke="#cbd5e1" strokeWidth="1.5"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#cbd5e1" strokeWidth="1.5"/>
          <line x1="18.2" y1="18.2" x2="81.8" y2="81.8" stroke="#cbd5e1" strokeWidth="1.5"/>
          <line x1="18.2" y1="81.8" x2="81.8" y2="18.2" stroke="#cbd5e1" strokeWidth="1.5"/>
        </>
      )}

      {/* 분자 분량만큼 칠해진 영역 (예: 3/8 조각 색칠) */}
      {shadedSlices === 3 && totalSlices === 8 && (
        <>
          <path d="M50,50 L50,5 A45,45 0 0,1 95,50 L50,50" fill={fillColor} opacity="0.8"/>
          <path d="M50,50 L95,50 A45,45 0 0,1 81.8,81.8 L50,50" fill={fillColor} opacity="0.8"/>
        </>
      )}
    </svg>
  );
};
