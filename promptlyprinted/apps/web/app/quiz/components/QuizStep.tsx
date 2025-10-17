'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';

type Option = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

type QuizStepProps = {
  question: string;
  subtitle?: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onContinue: () => void;
};

export const QuizStep = ({
  question,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onContinue,
}: QuizStepProps) => {
  const [selected, setSelected] = useState<string>(selectedValue || '');

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  const handleContinue = () => {
    if (selected) {
      onContinue();
    }
  };

  return (
    <div className="text-center">
      {/* Question Header */}
      <div className="mb-12">
        <div className="w-16 h-1 bg-gradient-to-r from-[#16C1A8] to-[#16C1A8] mx-auto mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {question}
        </h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`relative p-6 rounded-2xl border-2 transition-all text-center hover:shadow-lg ${
              selected === option.id
                ? 'border-[#16C1A8] bg-[#16C1A8]/5 shadow-lg'
                : 'border-gray-200 bg-white hover:border-[#16C1A8]/50'
            }`}
          >
            {/* Checkmark */}
            {selected === option.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#16C1A8] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="text-5xl mb-4">{option.icon}</div>

            {/* Label */}
            <h3 className="font-semibold text-gray-900 mb-2">{option.label}</h3>

            {/* Description */}
            <p className="text-sm text-gray-600">{option.description}</p>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!selected}
        className="px-12 py-6 text-lg bg-[#16C1A8] text-white hover:bg-[#16C1A8]/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-all"
      >
        Continue
      </Button>
    </div>
  );
};
