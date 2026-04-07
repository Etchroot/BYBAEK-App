// 타겟 경로: src/components/CustomButton.tsx
"use client";

import React from 'react';

// 버튼 Props 타입 정의 (웹 표준에 맞게 변경)
interface CustomButtonProps {
  title: string;
  onClick: () => void; // onPress 대신 onClick 사용
  variant?: 'primary' | 'outline';
  className?: string; // ViewStyle 객체 대신 Tailwind 클래스 문자열 주입 허용
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onClick, 
  variant = 'primary', 
  className = '' // 기본값 빈 문자열
}) => {
  const isPrimary = variant === 'primary';

  // 1. 공통 기반 스타일 (패딩, 라운드 처리, 정렬, 트랜지션 및 클릭 시 살짝 작아지는 액티브 효과)
  const baseClasses = "py-[12px] px-large rounded-lg flex items-center justify-center text-button transition-all focus:outline-none active:scale-[0.98]";
  
  // 2. Primary 버튼 스타일 (버건디 배경, 흰색 볼드 텍스트, 호버 시 더 어두운 버건디)
  const primaryClasses = "bg-accent text-text-inverse font-bold hover:bg-accent-dark shadow-sm";
  
  // 3. Outline 버튼 스타일 (투명 배경, 테두리, 기본 텍스트 색상, 호버 시 연한 회색 배경)
  const outlineClasses = "bg-transparent border border-text-primary text-text-primary font-medium hover:bg-gray-50";

  return (
    <button 
      onClick={onClick}
      // 템플릿 리터럴을 활용하여 기본 클래스 + 조건부 클래스 + 외부 주입 클래스를 병합
      className={`${baseClasses} ${isPrimary ? primaryClasses : outlineClasses} ${className}`}
    >
      {title}
    </button>
  );
};