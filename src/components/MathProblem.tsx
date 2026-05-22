import { useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { FractionPie } from './FractionPie';
import { LinearFunctionGraph } from './LinearFunctionGraph';

interface ProblemProps {
  problem: any;
  index: number;
  showAnswers: boolean;
}

export const MathProblem: React.FC<ProblemProps> = ({ problem, index, showAnswers }) => {
  const [userAnswer, setUserAnswer] = useState('');

  const renderSVG = () => {
    if (!problem.svg_data) return null;
    
    if (problem.svg_data.type === 'fraction_pie') {
      return (
        <div className="my-4">
          <FractionPie 
            totalSlices={problem.svg_data.total_slices} 
            shadedSlices={problem.svg_data.shaded_slices}
            fillColor={problem.svg_data.fill_color}
          />
        </div>
      );
    }
    
    if (problem.svg_data.type === 'linear_function') {
      return (
        <div className="my-4">
          <LinearFunctionGraph />
        </div>
      );
    }
    
    return null;
  };

  // Generate random spoiler-free placeholder if not explicitly provided
  const getSpoilerFreePlaceholder = () => {
    if (problem.placeholder_example) return problem.placeholder_example;
    // Basic dynamic placeholder generation
    return `예: ${Math.floor(Math.random() * 9) + 1}`;
  };

  return (
    <div className="problem-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="font-bold text-lg text-indigo-600 bg-indigo-50 w-8 h-8 flex items-center justify-center rounded-full shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 text-slate-800 text-lg leading-relaxed">
          <MathJax>
            {problem.question_text}
          </MathJax>
        </div>
      </div>
      
      {problem.formula && (
        <div className="mt-4 text-center text-xl font-medium">
          <MathJax>{`\\[${problem.formula}\\]`}</MathJax>
        </div>
      )}

      {renderSVG()}

      <div className="mt-auto pt-6 flex flex-col gap-3">
        <input 
          type="text"
          className="w-full border-b-2 border-slate-300 bg-slate-50 px-4 py-3 text-center text-lg focus:outline-none focus:border-indigo-500 transition-colors rounded-t-md"
          placeholder={getSpoilerFreePlaceholder()}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        
        {showAnswers && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700 mb-2">정답: {problem.answer_value}</div>
            <div className="text-sm text-emerald-600">
              {problem.solution_steps && problem.solution_steps.map((step: string, i: number) => (
                <div key={i} className="mb-1">{step}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
