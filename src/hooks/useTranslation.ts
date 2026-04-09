// 타겟 경로: src/hooks/useTranslation.ts
"use client";

import { useState, useEffect } from 'react';
import { translations, LanguageCode } from '@/locales/translations';

export const useTranslation = () => {
  // 🚨 [핵심 수정] 무조건 'ko'로 시작하는게 아니라, 처음부터 로컬스토리지를 읽어서 초기값으로 세팅합니다!
  const [lang, setLang] = useState<LanguageCode>(() => {
    // Next.js는 서버에서도 코드를 한 번 읽기 때문에, window(브라우저)가 있을 때만 접근하도록 방어막을 칩니다.
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as LanguageCode;
      if (savedLang === 'ko' || savedLang === 'en') {
        return savedLang;
      }
    }
    return 'ko'; // 수첩에 아무것도 없으면 기본값 한국어
  });

  // 혹시 모를 실시간 언어 변경 동기화를 위해 useEffect는 안전장치로 남겨둡니다.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as LanguageCode;
      if (savedLang && savedLang !== lang && (savedLang === 'ko' || savedLang === 'en')) {
        setLang(savedLang);
      }
    }
  }, []);

  // 현재 언어에 맞는 사전 뭉치를 꺼냅니다.
  const t = translations[lang];

  return { t, lang, setLang }; // 나중을 위해 setLang도 같이 밖으로 빼주면 좋습니다.
};