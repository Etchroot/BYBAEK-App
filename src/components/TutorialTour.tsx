// 타겟 경로: src/components/TutorialTour.tsx
"use client";

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { usePathname } from 'next/navigation';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

export function TutorialTour() {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false); 
  const pathname = usePathname();

  // 🚨 [다국어 적용] 번역 객체 가져오기 (반드시 early return 이전에 선언!)
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true); 

    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');

    if (!hasSeenTutorial && pathname === '/dashboard') {
      setRun(true);
      localStorage.setItem('has_seen_tutorial', 'true');
    }
  }, [pathname]);

  if (!isMounted) return null;

  // 🚨 [다국어 적용] 튜토리얼 스텝 내용 번역
  const steps: Step[] = [
    {
      target: '.tour-step-dashboard',
      content: t.tutorial.step_dashboard,
      disableBeacon: true, 
    },
    {
      target: '.tour-step-preview',
      content: t.tutorial.step_preview,
    },
    {
      target: '.tour-step-photos',
      content: t.tutorial.step_photos,
    },
    {
      target: '.tour-step-album',
      content: t.tutorial.step_album,
    },
    {
      target: '.tour-step-setting',
      content: t.tutorial.step_setting,
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous={true} 
      showProgress={true} 
      showSkipButton={true} 
      // 🚨 [핵심 수정 1] 바깥 어두운 배경을 눌러도 안 꺼지게 막음!
      disableOverlayClose={true} 
      // 🚨 [핵심 수정 2] 우측 상단의 불필요한 X 버튼 숨김!
      hideCloseButton={true} 
      styles={{
        options: {
          primaryColor: '#8A0020',
          textColor: '#1A1A1A',
          zIndex: 10000,
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#666',
        }
      }}
      // 🚨 [다국어 적용] 하단 버튼 텍스트 번역
      locale={{
        back: t.tutorial.btn_back,
        close: t.tutorial.btn_close,
        last: t.tutorial.btn_last,
        next: t.tutorial.btn_next,
        skip: t.tutorial.btn_skip,
      }}
    />
  );
}