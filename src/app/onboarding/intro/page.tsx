// 타겟 경로: src/app/onboarding/intro/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

export default function OnboardingIntroScreen() {
  const router = useRouter();
  
  // 🚨 [다국어 적용] 번역 객체 t 가져오기
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      {/* 로그인 화면에서 사용하던 모달 컨테이너 스타일과 통일 */}
      <div className="w-[450px] min-h-[400px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between text-center">
        
        {/* 상단 헤더 공간 (닫기 버튼은 제외하여 진행을 유도) */}
        <div className="h-6" />

        {/* 중앙 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-8">
            <span className="text-4xl animate-bounce">✨</span>
          </div>
          
          <h2 className="text-[28px] font-bold text-text-primary mb-4 leading-tight">
            {/* 🚨 [다국어 적용] <br /> 기준으로 줄바꿈 유지 */}
            {t.onboarding_intro.title_line1}<br />{t.onboarding_intro.title_line2}
          </h2>
          
          <p className="text-body text-text-secondary leading-relaxed">
            {/* 🚨 [다국어 적용] 설명글 줄바꿈 유지 */}
            {t.onboarding_intro.desc_line1}<br />
            {t.onboarding_intro.desc_line2}<br />
            {t.onboarding_intro.desc_line3}
          </p>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-col gap-3 mt-large">
          <button 
            onClick={() => router.push('/onboarding')} 
            className="w-full py-4 bg-accent rounded-lg flex items-center justify-center text-text-inverse font-bold text-[17px] hover:bg-accent-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            {/* 🚨 [다국어 적용] 진행하기 버튼 */}
            {t.onboarding_intro.btn_proceed}
          </button>
          
          <button 
            onClick={() => router.push('/dashboard')} 
            className="w-full py-3 text-text-secondary font-medium text-sm hover:text-text-primary transition-colors"
          >
            {/* 🚨 [다국어 적용] 나중에 설정할게요 버튼 */}
            {t.onboarding_intro.btn_later}
          </button>
        </div>
      </div>
    </div>
  );
}