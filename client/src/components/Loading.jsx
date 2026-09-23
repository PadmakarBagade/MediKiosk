import React from 'react';
import { Activity } from 'lucide-react';

const Loading = ({ message = 'Processing clinical data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
          <Activity className="w-8 h-8 text-emerald-600 animate-bounce" />
        </div>
      </div>
      <p className="text-slate-600 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;
