'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const questions = [
  {
    question: 'Do I need design experience to use the AI studio?',
    answer:
      'Not at all. The guided quiz gives you high-performing prompt templates and we generate production-ready mockups automatically. You can edit text, colours, and layout in a visual editor before you approve the final design.',
  },
  {
    question: 'How many designs can I generate before signing up?',
    answer:
      'The flow gives you one tailored prompt pack as a preview. Create a free account to unlock unlimited prompt variations, save designs to your profile, and track competition submissions.',
  },
  {
    question: 'What products can I print on?',
    answer:
      'Our creator bundles cover hoodies, tees, and crewnecks using premium 220gsm organic cotton. You can also add-on tote bags, posters, and sticker packs. Every product is printed in the UK/EU with eco-friendly inks.',
  },
  {
    question: 'How fast is delivery?',
    answer:
      'Halloween orders ship within 48 hours and arrive in 2–4 business days across the UK/EU. Express upgrades and group fulfilment are available when you reserve a creator bundle.',
  },
  {
    question: 'Can I sell the designs I create?',
    answer:
      'Yes—everything you generate is yours to sell. Our terms include commercial usage rights. For high-volume drops, talk to our team about white-label and fulfilment support.',
  },
  {
    question: 'What if I need changes after I order?',
    answer:
      'We preview every design before production, but if something isn’t perfect we’ll reprint or refund. Our goal is to make sure your Halloween drop is a hit.',
  },
];

export const HalloweenFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0d1324] to-[#06070a]" id="faq">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-4">
            <HelpCircle className="w-4 h-4 text-orange-300" />
            FAQs
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Launch Your Halloween Drop
          </h2>
          <p className="text-purple-200 max-w-3xl mx-auto">
            Still thinking it through? We’ve answered the most common questions from first-time creators and returning
            brands.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 px-6 md:px-8 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-white font-semibold text-lg">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-orange-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 md:px-8 pb-6 text-sm text-purple-200 leading-relaxed border-t border-white/10">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
