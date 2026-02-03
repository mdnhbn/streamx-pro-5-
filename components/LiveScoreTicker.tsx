
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export const LiveScoreTicker: React.FC = () => {
  const [score, setScore] = useState({ runs: 142, wickets: 3, overs: 18.4 });
  
  // Simulate live score updates
  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => {
        let newRuns = prev.runs;
        let newWickets = prev.wickets;
        let newOvers = prev.overs + 0.1;

        // Decimal correction for overs (e.g. 18.5 -> 18.6 -> 19.0)
        if (Math.round((newOvers % 1) * 10) >= 6) {
             newOvers = Math.floor(newOvers) + 1.0;
        }

        // Random event
        const event = Math.random();
        if (event > 0.7) newRuns += Math.floor(Math.random() * 4) + 1; // 1-4 runs
        if (event > 0.95 && newWickets < 10) newWickets += 1; // Wicket

        return {
          runs: newRuns,
          wickets: newWickets,
          overs: parseFloat(newOvers.toFixed(1))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-black text-white px-4 py-3 shadow-md mb-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
           </div>
           <span className="text-xs font-medium text-gray-300">T20 World Cup</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
           <Activity size={12} /> Live Updates
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">IND</span>
                <span className="text-gray-400 text-xs">vs</span>
                <span className="font-bold text-lg text-gray-400">AUS</span>
            </div>
            <div className="text-xs text-blue-300">India elected to bat</div>
        </div>
        <div className="text-right">
            <div className="text-2xl font-black leading-none">{score.runs}/{score.wickets}</div>
            <div className="text-sm text-gray-400">{score.overs} Overs</div>
        </div>
      </div>
      
      <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
         <div className="bg-blue-500 h-full w-[65%] animate-pulse"></div>
      </div>
    </div>
  );
};
