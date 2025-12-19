import { useState } from 'react';

interface PromoBarProps {
  onPromoApplied: (code: string, discountValue: number) => void;
}

const PROMO_SUGGESTIONS = [
  { code: 'CHATGPT10', discount: 10, label: '10% off' },
  { code: 'FIRSTDESIGN', discount: 15, label: '15% off for new customers' },
];

export function PromoBar({ onPromoApplied }: PromoBarProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<typeof PROMO_SUGGESTIONS[0] | null>(null);

  const handleApply = (promo: typeof PROMO_SUGGESTIONS[0]) => {
    setAppliedPromo(promo);
    onPromoApplied(promo.code, promo.discount);
    setShowInput(false);
  };

  const handleSubmit = () => {
    const code = inputValue.toUpperCase().trim();
    const found = PROMO_SUGGESTIONS.find(p => p.code === code);
    if (found) {
      handleApply(found);
    }
    setInputValue('');
  };

  if (appliedPromo) {
    return (
      <div className="promo-bar">
        <span className="promo-text">
          ✅ {appliedPromo.label} applied!
        </span>
        <span className="promo-code">{appliedPromo.code}</span>
      </div>
    );
  }

  return (
    <div className="promo-bar">
      {!showInput ? (
        <>
          <span className="promo-text">
            🎉 ChatGPT Exclusive: Get up to 15% off!
          </span>
          <button 
            onClick={() => setShowInput(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Apply Code
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter promo code..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              fontSize: 14,
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {PROMO_SUGGESTIONS.map((promo) => (
              <button
                key={promo.code}
                onClick={() => handleApply(promo)}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  color: '#7c3aed',
                  padding: '6px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {promo.code}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
