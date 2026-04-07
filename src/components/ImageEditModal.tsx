// 타겟 경로: src/components/ImageEditModal.tsx
"use client";

import React, { useState } from 'react';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

interface ImageEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  images: string[];
  onRemove: (indexes: number[]) => void;
  onAdd: () => void;
}

export const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isVisible,
  onClose,
  images,
  onRemove,
  onAdd,
}) => {
  // 🚨 [다국어 적용] 번역 훅(t) 가져오기. (훅은 반드시 return null 보다 위에 있어야 합니다!)
  const { t } = useTranslation();

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // [핵심] 안 보일 때는 아무것도 렌더링하지 않음
  if (!isVisible) return null; 

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleRemove = () => {
    onRemove(selectedIndexes);
    setSelectedIndexes([]);
  };

  return (
    // 1. overlay (화면 전체를 덮는 절대 좌표, zIndex: 99999 반영)
    <div className="fixed inset-0 w-full h-full bg-black/60 flex justify-center items-center z-[99999]">
      
      {/* 2. container (width 700, height 550 강제 고정 및 쉐도우 처리) */}
      <div className="w-[700px] h-[550px] bg-background rounded-[16px] p-large border border-border shadow-[0_10px_20px_rgba(0,0,0,0.25)] flex flex-col">
        
        {/* 3. header (mb-xlarge, 하단 테두리) */}
        <div className="flex flex-row justify-between items-center mb-xlarge pb-medium border-b border-border shrink-0">
          {/* 🚨 [다국어 적용] 모달 타이틀 */}
          <h2 className="text-[22px] font-bold text-text-primary">{t.image_edit.title}</h2>
          
          <div className="flex flex-row items-center gap-small">
            {/* 추가 버튼 */}
            <button 
              onClick={onAdd}
              className="p-2 border border-border rounded-md bg-background hover:bg-gray-50 transition-colors focus:outline-none"
            >
              {/* 🚨 [다국어 적용] 추가 */}
              <span className="text-[13px] text-text-primary">{t.image_edit.btn_add}</span>
            </button>
            
            {/* 제거 버튼 */}
            <button 
              onClick={handleRemove}
              className="p-2 border border-accent rounded-md bg-background hover:bg-red-50 transition-colors focus:outline-none"
            >
              {/* 🚨 [다국어 적용] 제거 */}
              <span className="text-[13px] text-accent">{t.image_edit.btn_remove}</span>
            </button>
            
            {/* 닫기 버튼 */}
            <button 
              onClick={onClose}
              className="p-2 ml-2 hover:opacity-70 transition-opacity focus:outline-none"
            >
              <span className="text-[24px] text-text-secondary leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* 4. scrollArea (모달 내부 스크롤) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          
          {/* 5. grid (flex-wrap과 gap 20을 이용한 고정 크기 카드 배치) */}
          <div className="flex flex-row flex-wrap gap-[20px] pb-medium">
            {images.map((img, index) => {
              const isSelected = selectedIndexes.includes(index);
              
              return (
                <button 
                  key={`img-${index}`} 
                  onClick={() => toggleSelect(index)}
                  // imageCard (width/height 145 고정)
                  className="w-[145px] h-[145px] bg-[#F8F9FA] rounded-[10px] border border-border flex items-center justify-center relative overflow-hidden focus:outline-none hover:border-gray-400 transition-colors"
                >
                  {/* 6. checkbox (좌측 상단 absolute 고정) */}
                  <div className={`absolute top-[10px] left-[10px] w-[22px] h-[22px] rounded border-2 z-10 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary'
                  }`}>
                    {isSelected && <span className="text-white text-[14px] font-bold leading-none">✓</span>}
                  </div>
                  
                  <span className="text-text-secondary text-sm font-medium">{img}</span>
                </button>
              );
            })}
          </div>
          
        </div>
      </div>
    </div>
  );
};