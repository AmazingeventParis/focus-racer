import { Check, Loader2 } from "lucide-react";

interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
  progress?: number; // 0-100 for active steps
}

interface UploadTimelineProps {
  steps: TimelineStep[];
}

export function UploadTimeline({ steps }: UploadTimelineProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />

        {/* Progress bar fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{
            width: `${(steps.filter(s => s.status === "completed").length / steps.length) * 100}%`
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              {/* Step circle */}
              <div className="relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === "completed"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                      : step.status === "active"
                      ? "bg-white border-4 border-emerald-500 text-emerald-500 shadow-lg"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="h-5 w-5" />
                  ) : step.status === "active" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Progress ring for active step with progress */}
                {step.status === "active" && step.progress !== undefined && (
                  <svg
                    className="absolute inset-0 -rotate-90"
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-emerald-200"
                      strokeDasharray="113"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-emerald-500"
                      strokeDasharray="113"
                      strokeDashoffset={113 - (113 * step.progress) / 100}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                )}
              </div>

              {/* Step label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    step.status === "completed"
                      ? "text-emerald-600"
                      : step.status === "active"
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.status === "active" && step.progress !== undefined && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {step.progress}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
