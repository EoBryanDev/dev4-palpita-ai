'use client';

import { useState } from 'react';

interface FlagImageProps {
  emoji: string;
  className?: string;
  alt?: string;
}

export function FlagImage({
  emoji,
  className = 'h-5 w-5',
  alt,
}: FlagImageProps) {
  const [hasError, setHasError] = useState(false);
  const [useFallbackCDN, setUseFallbackCDN] = useState(false);

  // Helper para converter emoji em código de país (ISO de duas letras)
  const getCountryCode = (flagEmoji: string) => {
    if (!flagEmoji) return '';

    // Mapeamentos manuais para subdivisões ou casos especiais do bolão
    if (flagEmoji === '🏴󠁧󠁢󠁳󠁣󠁴󠁿') return 'gb-sct'; // Escócia
    if (flagEmoji === '🏴󠁧󠁢󠁥󠁮󠁧󠁿') return 'gb-eng'; // Inglaterra
    if (
      flagEmoji ===
        '🏴%e2%80%8d%f0%9f%b7%a7%f0%9f%b7%a7%f0%9f%b7%bc%f0%9f%b7%bf' ||
      flagEmoji.includes('🏴󠁧󠁢󠁳󠁣󠁴󠁿')
    )
      return 'gb-sct';
    if (flagEmoji.includes('🏴󠁧󠁢󠁥󠁮󠁧󠁿')) return 'gb-eng';
    if (flagEmoji.includes('🏴󠁧󠁢󠁷󠁬󠁳󠁿')) return 'gb-wls'; // País de Gales

    const codePoints = Array.from(flagEmoji).map((char) => char.codePointAt(0));
    const code = codePoints
      .map((cp) => {
        if (cp && cp >= 0x1f1e6 && cp <= 0x1f1ff) {
          return String.fromCharCode(cp - 0x1f1e6 + 65);
        }
        return '';
      })
      .join('')
      .toLowerCase();

    return code;
  };

  const code = getCountryCode(emoji);

  if (!code || hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      >
        {emoji}
      </span>
    );
  }

  const primaryUrl = `https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${code}.svg`;
  const fallbackUrl = `https://flagcdn.com/w40/${code}.png`;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-sm align-middle ${className}`}
    >
      <img
        src={useFallbackCDN ? fallbackUrl : primaryUrl}
        alt={alt || 'Bandeira'}
        className="h-full w-full object-cover"
        onError={() => {
          if (!useFallbackCDN) {
            setUseFallbackCDN(true);
          } else {
            setHasError(true);
          }
        }}
      />
    </span>
  );
}
