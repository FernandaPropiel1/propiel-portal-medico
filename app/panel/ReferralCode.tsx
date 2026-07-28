'use client';

import { useState } from 'react';

export default function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="referral-code-row">
      <span className="referral-code-value">{code}</span>
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? 'Copiado ✓' : 'Copiar'}
      </button>
    </div>
  );
}
