"use client";

import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FormStepperProps = {
  steps: { title: string; description: string }[];
  currentStep: number;
};

export function FormStepper({ steps, currentStep }: FormStepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const current = steps[currentStep];

  return (
    <div className="overflow-hidden rounded-xl border-none bg-transparent shadow-none">
      <div className="border-b border-[#1E2D5C] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#00E5FF]">
              Formulario de ingreso Thesislab
            </p>
            <h2 className="mt-1 text-base font-semibold text-gray-100 sm:text-lg">
              Paso {currentStep + 1} de {steps.length} · {current.title}
            </h2>
          </div>
          <div className="rounded-full border border-[#1E2D5C] bg-[#0B132B] px-3 py-1 text-xs font-medium text-gray-300">
            {Math.round(progress)}% completado
          </div>
        </div>
        <div className="mt-3">
          <Progress value={progress} />
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
          {steps.map((step, index) => {
            const isCurrent = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div
                key={step.title}
                aria-current={isCurrent ? "step" : undefined}
                title={!isCurrent ? `${index + 1}. ${step.title}` : undefined}
                className={cn(
                  "flex items-center transition-colors duration-300 ease-in-out",
                  isCurrent
                    ? "gap-2 rounded-full border border-[#00E5FF] bg-[#00E5FF]/10 px-4 py-2 text-[#00E5FF]"
                    : "h-10 w-10 justify-center rounded-full border border-[#1E2D5C] bg-[#131F43] text-gray-400"
                )}
              >
                <span className="flex shrink-0 items-center justify-center text-sm font-semibold">
                  {isComplete ? <Check className="size-4" /> : index + 1}
                </span>
                {isCurrent ? (
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {step.title}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
