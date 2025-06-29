'use client';

import { tshirtDetails } from '@/data/products';
import { Button } from '@/../../packages/design-system/components/ui/button';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

if (typeof window !== 'undefined') {
  posthog.init('YOUR_POSTHOG_API_KEY', {
    api_host: 'https://app.posthog.com',
  });
}

const questions = [
  {
    question: 'Who are you shopping for?',
    options: ['Men', 'Women', 'Kids', 'Babies'],
    key: 'gender',
  },
  {
    question: 'What type of apparel are you looking for?',
    options: ['T-Shirt', 'Long Sleeve', 'Tank Top', 'Sweatshirt'],
    key: 'apparelType',
  },
  {
    question: 'What is your preferred fit?',
    options: ['Classic', 'Modern', 'Slim'],
    key: 'fit',
  },
];

const DesignFunnel = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    posthog.capture('funnel_started');
  }, []);

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    posthog.capture('funnel_step_completed', {
      step: questions[step].question,
      answer: value,
    });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      filterProducts(newAnswers);
      posthog.capture('funnel_completed');
    }
  };

  const filterProducts = (currentAnswers: Record<string, string>) => {
    const products = Object.values(tshirtDetails).filter((product) => {
      const genderMatch = product.category.toLowerCase().includes(currentAnswers.gender.toLowerCase().slice(0, -1));
      const apparelMatch = product.productType.toLowerCase().replace(/_/g, ' ').includes(currentAnswers.apparelType.toLowerCase());
      const fitMatch = product.features.some((feature) =>
        feature.toLowerCase().includes(currentAnswers.fit.toLowerCase())
      );
      return genderMatch && apparelMatch && fitMatch;
    });
    setFilteredProducts(products);
  };

  const currentQuestion = questions[step];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Design Your Apparel</h1>
      {step < questions.length ? (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">{currentQuestion.question}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(currentQuestion.key, option)}
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Recommended Products</h2>
          <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.sku} className="rounded-lg border p-4">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="mt-2">{product.shortDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignFunnel;