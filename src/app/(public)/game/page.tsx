"use client";

import { useState } from "react";
import FocusCatcher from "@/components/game/focus-catcher";

export default function GamePage() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Focus Catcher</h1>
      <p className="text-slate-400 mb-6 text-center">
        Capturez les sportifs avec votre viseur d&apos;appareil photo !
      </p>

      <FocusCatcher progress={progress} isComplete={isComplete} />

      <div className="mt-6 w-full max-w-md space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">
            Simulation progression : {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-emerald-500"
            disabled={isComplete}
          />
        </div>

        <button
          onClick={() => setIsComplete(true)}
          disabled={isComplete}
          className="w-full py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isComplete ? "Termine !" : "Simuler fin de traitement"}
        </button>

        {isComplete && (
          <button
            onClick={() => {
              setIsComplete(false);
              setProgress(0);
            }}
            className="w-full py-2 px-4 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
          >
            Reinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
