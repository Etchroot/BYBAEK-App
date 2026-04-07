// 타겟 경로: src/app/onboarding/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';

export default function OnboardingScreen() {
  const router = useRouter();
  
  // 🚨 [신규] 버튼 여러 번 클릭 방지용 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 🚨 [신규] window.alert 대체를 위한 커스텀 알림창 상태
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const getShopId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('shop_id') || 'guest_shop'; 
    }
    return 'guest_shop';
  };

  const { t } = useTranslation();

  const handleFinishOnboarding = async (answers: Record<number, any>) => {
    // 이미 전송 중이면 클릭 무시! (콘솔 도배 방지)
    if (isSubmitting) return; 
    
    setIsSubmitting(true);
    const shopId = getShopId(); 

    try {
      const schedule = answers[13] || {};
      const uploadTime = schedule.hour ? `${schedule.hour}:${schedule.minute} ${schedule.amPm}` : '';

      const languageMap: Record<string, string> = {
        '한국어': 'ko',
        'English': 'en'
      };
      const dbLanguageCode = languageMap[answers[14]] || 'ko';

      localStorage.setItem('language', dbLanguageCode);

      const payload = {
        brand_tone: Array.isArray(answers[1]) ? answers[1] : (answers[1] ? [answers[1]] : []),
        preferred_styles: Array.isArray(answers[2]) ? answers[2] : (answers[2] ? [answers[2]] : []),
        exclude_conditions: Array.isArray(answers[3]) ? answers[3] : (answers[3] ? [answers[3]] : []),
        hashtag_style: Array.isArray(answers[4]) ? answers[4] : (answers[4] ? [answers[4]] : []),
        
        // 🚨 [수정] .trim()을 추가해서 스페이스바만 입력된 것도 완벽하게 null로 바꿔버립니다!
        cta: answers[5]?.trim() || null,
        shop_intro: answers[6]?.trim() || null,
        forbidden_words: Array.isArray(answers[7]) ? answers[7] : (answers[7] ? [answers[7]] : []),
        rag_reference: answers[8]?.trim() || null,
        city: answers[9]?.trim() || null,
        
        insta_auto_upload_yn: answers[11] === '예 (추천)' ? 'Y' : 'N',
        owner_email: answers[12]?.trim() || null, // 👈 철벽 방어 완료!
        
        insta_upload_time_slot: schedule.frequency || '매일',
        insta_upload_time: uploadTime || null,
        
        language: dbLanguageCode,
        
        is_ms_connected: true,
        is_insta_connected: true
      };

      // 백엔드 API 전송
      await apiClient.post(`/onboarding/${shopId}`, payload);

      // 성공 시 대시보드로 이동
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("온보딩 데이터 저장 실패:", error);
      // 🚨 window.alert 대신 예쁜 상태값으로 변경
      setAlertMessage(t.onboarding.error_alert || "데이터 저장에 실패했습니다.");
    } finally {
      // 🚨 에러가 났을 때만 잠금을 풀어줌 (성공하면 페이지가 이동되므로 풀 필요 없음)
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* OnboardingSurvey 내부에 isSubmitting을 프롭스로 넘겨서 버튼 UI를 로딩으로 바꾸는 걸 추천하지만, 
            지금은 최상단 클릭 방지만으로도 충분합니다. */}
        <OnboardingSurvey
          onFinish={handleFinishOnboarding}
          onSkip={() => router.push('/dashboard')}
        />
      </div>

      {/* 🚨 커스텀 알림창 UI (실패 시 뜸) */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-[320px] flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-[14px] text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            <button 
              onClick={() => {
                setAlertMessage(null);
                // 에러 확인 후 대시보드로 넘어가게 하려면 아래 주석 해제 (기존 로직 유지)
                // router.push('/dashboard');
              }} 
              className="w-full py-3 bg-accent text-white rounded-lg font-bold text-[15px] cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none"
            >
              {t.common?.confirm || '확인'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}