import React from 'react';
import classNames from 'classnames';
import { Check, Lock } from 'lucide-react';

type Step = {
  id: number;
  name: string;
  requiresData: boolean;
};

type StepNavigationProps = {
  steps: Step[];
  currentStep: number;
  onStepChange: (stepId: number) => void;
  hasData: boolean;
};

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  onStepChange,
  hasData,
}) => {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="min-w-max p-2">
        <nav aria-label="Progress" className="w-full">
          <ol className="flex">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isDisabled = step.requiresData && !hasData;
              const isLast = index === steps.length - 1;

              return (
                <li key={step.id} className={`relative flex-1 ${!isLast ? 'border-r border-gray-200' : ''}`}>
                  <button
                    onClick={() => onStepChange(step.id)}
                    disabled={isDisabled}
                    className={classNames(
                      "group flex w-full items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-all duration-200",
                      {
                        "bg-primary-50 text-primary-700": isActive,
                        "text-gray-700 hover:bg-gray-50": !isActive && !isDisabled && !isCompleted,
                        "text-green-600": isCompleted && !isDisabled,
                        "text-gray-300 cursor-not-allowed": isDisabled,
                      }
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex items-center">
                      {isCompleted && !isDisabled ? (
                        <div className="mr-2 h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : isDisabled ? (
                        <div className="mr-2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <Lock className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className={`mr-2 h-5 w-5 flex items-center justify-center rounded-full ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                          <span className="text-xs">{step.id + 1}</span>
                        </div>
                      )}
                      <span>{step.name}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default StepNavigation;