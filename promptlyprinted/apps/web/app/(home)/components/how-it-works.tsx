'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export const HowItWorks = () => {
  const [activeMode, setActiveMode] = useState<'text-to-image' | 'image-to-image'>('text-to-image');
  const [currentStep, setCurrentStep] = useState(0);

  const workflows = {
    'text-to-image': [
      {
        number: '1',
        title: 'Choose an Apparel',
        description: 'Select from our premium collection of tees, hoodies, and more.',
        image: '/how-it-works/text-to-image/step-1.png',
        action: 'Click on a product to select it',
      },
      {
        number: '2',
        title: 'Choose size, color and quantity',
        description: 'Customize your garment specifications.',
        image: '/how-it-works/text-to-image/step-2.png',
        action: 'Pick your perfect size and color',
      },
      {
        number: '3',
        title: 'Select AI model to prompt with',
        description: 'Pick the AI model that matches your creative vision.',
        image: '/how-it-works/text-to-image/step-3.png',
        action: 'Choose the AI model',
      },
      {
        number: '4',
        title: 'Describe prompt of the image you want to create',
        description: 'Type your creative idea and watch AI bring it to life.',
        image: '/how-it-works/text-to-image/step-4.png',
        action: 'Type your creative prompt',
      },
      {
        number: '5',
        title: 'Add to cart or Buy now',
        description: 'Complete your purchase and get ready to wear your creation.',
        image: '/how-it-works/text-to-image/step-5.png',
        action: 'Complete your order',
      },
    ],
    'image-to-image': [
      {
        number: '1',
        title: 'Choose an Apparel',
        description: 'Select from our premium collection of tees, hoodies, and more.',
        image: '/how-it-works/image-to-image/step-1.png',
        action: 'Click on a product to select it',
      },
      {
        number: '2',
        title: 'Choose size, color and quantity',
        description: 'Customize your garment specifications.',
        image: '/how-it-works/image-to-image/step-2.png',
        action: 'Pick your perfect size and color',
      },
      {
        number: '3',
        title: 'Select AI model to prompt with',
        description: 'Pick the AI model that matches your creative vision.',
        image: '/how-it-works/image-to-image/step-3.png',
        action: 'Choose the AI model',
      },
      {
        number: '4',
        title: 'Upload Image and Describe Your Vision',
        description: 'Upload your reference image and add creative instructions to transform it with AI.',
        image: '/how-it-works/image-to-image/step-4.png',
        action: 'Upload your image and type your transformation prompt',
      },
      {
        number: '5',
        title: 'Add to cart or Buy now',
        description: 'Complete your purchase and get ready to wear your creation.',
        image: '/how-it-works/image-to-image/step-5.png',
        action: 'Complete your order',
      },
    ],
  };

  const currentWorkflow = workflows[activeMode];
  const totalSteps = currentWorkflow.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModeChange = (mode: 'text-to-image' | 'image-to-image') => {
    setActiveMode(mode);
    setCurrentStep(0); // Reset to first step when changing modes
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-[#F9FAFB] py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[#FF8A26] font-semibold text-sm uppercase tracking-wider">
              How It Works
            </h2>
            <h3 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
              Create your design in simple steps
            </h3>
            <p className="max-w-2xl text-lg text-[#64748B] leading-relaxed">
              Follow along with our interactive walkthrough and see how easy it is to create custom apparel.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-4 p-1 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
            <button
              onClick={() => handleModeChange('text-to-image')}
              className={`px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all ${
                activeMode === 'text-to-image'
                  ? 'bg-[#16C1A8] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Text to Image
            </button>
            <button
              onClick={() => handleModeChange('image-to-image')}
              className={`px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all ${
                activeMode === 'image-to-image'
                  ? 'bg-[#16C1A8] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Image to Image
            </button>
          </div>

          {/* Interactive Demo Section */}
          <div className="w-full max-w-6xl">
            {/* Main Display Area */}
            <div className="relative rounded-3xl bg-white border-2 border-gray-200 shadow-2xl overflow-hidden">
              {/* Step Counter & Title */}
              <div className="bg-gradient-to-r from-[#0D2C45] to-[#16C1A8] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm font-bold text-xl">
                      {currentWorkflow[currentStep].number}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">
                        {currentWorkflow[currentStep].title}
                      </h4>
                      <p className="text-white/80 text-sm mt-1">
                        {currentWorkflow[currentStep].action}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    Step {currentStep + 1} of {totalSteps}
                  </div>
                </div>
              </div>

              {/* Screenshot Display */}
              <div className="relative aspect-video bg-gradient-to-br from-[#F9FAFB] to-white">
                <Image
                  src={currentWorkflow[currentStep].image}
                  alt={currentWorkflow[currentStep].title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Navigation Controls */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>

                  <p className="text-[#64748B] text-center flex-1">
                    {currentWorkflow[currentStep].description}
                  </p>

                  <Button
                    onClick={handleNext}
                    disabled={currentStep === totalSteps - 1}
                    className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-3 mt-8 flex-wrap">
              {currentWorkflow.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    index === currentStep
                      ? 'bg-[#16C1A8] text-white shadow-lg scale-105'
                      : 'bg-white text-[#64748B] hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === currentStep
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-[#64748B] group-hover:bg-[#16C1A8] group-hover:text-white'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-xs font-medium text-center max-w-[80px] leading-tight">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 pt-8">
            <p className="text-[#64748B] text-center">
              Ready to create your own design?
            </p>
            <Button
              size="lg"
              className="gap-2 bg-[#0D2C45] hover:bg-[#0D2C45]/90 text-white text-lg px-8 py-6 h-auto shadow-lg"
              asChild
            >
              <Link href="/design/mens-classic-t-shirt">
                <Play className="h-5 w-5" />
                Start Creating Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
