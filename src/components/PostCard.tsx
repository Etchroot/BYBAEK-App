// 타겟 경로: src/components/PostCard.tsx
"use client";

import React from 'react';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

interface PostCardProps {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  isNewButton?: boolean;
  onPress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id, 
  title, 
  description, 
  imageUrl,
  isNewButton = false, 
  onPress 
}) => {
  // 🚨 [다국어 적용] 번역 객체 t 가져오기
  const { t } = useTranslation();

  // 1. 새 게시물 만들기 카드
  if (isNewButton) {
    return (
      <button 
        onClick={onPress}
        className="w-full h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none group"
      >
        <span className="text-4xl text-gray-400 group-hover:text-accent font-light mb-2 transition-colors">
          +
        </span>
        <span className="text-sm font-bold text-gray-500 group-hover:text-text-primary transition-colors">
          {/* 🚨 [다국어 적용] */}
          {t.post_card.create_new}
        </span>
      </button>
    );
  }

  // 2. 일반 게시물 카드
  return (
    <button 
      onClick={onPress}
      className="w-full h-[200px] bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-md hover:border-accent transition-all focus:outline-none text-left group"
    >
      {/* 사진 영역 (추후 Image 컴포넌트로 교체) */}
      <div className="h-3/5 bg-gray-100 flex justify-center items-center w-full overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || t.post_card.alt_image} // 🚨 [다국어 적용]
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <span className="text-sm text-gray-400">
            {/* 🚨 [다국어 적용] */}
            {t.post_card.no_photo}
          </span>
        )}
      </div>
      
      {/* 텍스트 영역 */}
      <div className="h-2/5 p-3 flex flex-col justify-center bg-white w-full border-t border-gray-100">
        <span className="text-sm font-semibold text-text-primary truncate w-full">
          {/* 🚨 [다국어 적용] */}
          {title || t.post_card.default_title}
        </span>
        {description && (
          <span className="text-xs text-gray-500 mt-1 line-clamp-2 w-full">
            {description}
          </span>
        )}
      </div>
    </button>
  );
};