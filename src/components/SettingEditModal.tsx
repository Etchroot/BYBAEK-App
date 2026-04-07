// 타겟 경로: src/components/SettingEditModal.tsx
"use client";

import React from 'react';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

interface SettingEditModalProps {
  isVisible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode; // [핵심] 모달 안의 내용은 부모가 마음대로 넣을 수 있음!
}

export const SettingEditModal: React.FC<SettingEditModalProps> = ({
  isVisible,
  title,
  onClose,
  onSave,
  children,
}) => {
  // 🚨 [다국어 적용] 번역 객체 t 가져오기 (반드시 early return 이전에 선언!)
  const { t } = useTranslation();

  // 모달이 닫혀있을 때는 DOM 자체를 렌더링하지 않음
  if (!isVisible) return null;

  return (
    // 1. 모달 오버레이 (배경 딤 처리 및 최상단 배치)
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
      
      {/* 2. 모달 컨테이너 (고정 너비 500px, 둥근 모서리, 그림자 효과) */}
      <div className="w-[500px] bg-background rounded-[16px] p-large border border-border shadow-[0_10px_20px_rgba(0,0,0,0.25)] flex flex-col">
        
        {/* 상단 타이틀 및 닫기 버튼 영역 */}
        <div className="flex flex-row justify-between items-center mb-large pb-small border-b border-border shrink-0">
          <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          >
            <span className="text-[24px] leading-none">✕</span>
          </button>
        </div>

        {/* 중앙 컨텐츠 영역 (부모 컴포넌트에서 주입된 내용 렌더링) */}
        <div className="mb-large flex flex-col">
          {children}
        </div>

        {/* 하단 취소/저장 액션 버튼 영역 */}
        <div className="flex flex-row justify-end gap-small shrink-0">
          <button 
            onClick={onClose}
            className="px-medium py-[10px] rounded-md border border-border bg-background text-text-secondary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
          >
            {/* 🚨 [다국어 적용] */}
            {t.common.cancel}
          </button>
          <button 
            onClick={onSave}
            className="px-medium py-[10px] rounded-md bg-accent text-text-inverse font-semibold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            {/* 🚨 [다국어 적용] */}
            {t.common.save}
          </button>
        </div>
        
      </div>
    </div>
  );
};