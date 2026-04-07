// 타겟 경로: src/components/SnsConnectionModal.tsx
"use client";

import React from 'react';
import { SettingEditModal } from './SettingEditModal';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

interface SnsConnectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  isInstagramConnected: boolean;
  isKakaoConnected: boolean;
  isGmailConnected: boolean;
  handleSnsConnection: (
    snsName: string, 
    isConnected: boolean, 
    setConnectionState: React.Dispatch<React.SetStateAction<boolean>>, 
    authUrl: string
  ) => void;
  setIsInstagramConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsKakaoConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGmailConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SnsConnectionModal: React.FC<SnsConnectionModalProps> = ({
  isVisible,
  onClose,
  isInstagramConnected,
  isKakaoConnected,
  isGmailConnected,
  handleSnsConnection,
  setIsInstagramConnected,
  setIsKakaoConnected,
  setIsGmailConnected
}) => {
  // 🚨 [다국어 적용] 번역 객체 가져오기
  const { t } = useTranslation();

  return (
    // 앞서 만든 공통 모달 컨테이너 사용
    <SettingEditModal
      isVisible={isVisible}
      title="SNS 연동 설정" // (이 컴포넌트가 쓰인다면 이 부분도 번역이 필요하겠지만, 현재 미사용이므로 직관성을 위해 한글 유지)
      onClose={onClose}
      onSave={onClose} 
    >
      <div className="py-2">
        
        {/* 인스타그램 연동 영역 */}
        <div className="flex flex-row justify-between items-center mb-5">
          <span className="text-[15px] text-text-primary">Instagram</span>
          <button 
            onClick={() => handleSnsConnection('인스타그램', isInstagramConnected, setIsInstagramConnected, 'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=https://bybaek.azurewebsites.net/api/instagram_business_login&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isInstagramConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' 
                : 'bg-accent text-white hover:bg-accent-dark' 
            }`}
          >
            {/* 🚨 [다국어 적용] 기존 setting 사전 재활용 */}
            {isInstagramConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
          </button>
        </div>

        {/* 카카오톡 연동 영역 */}
        <div className="flex flex-row justify-between items-center mb-5">
          <span className="text-[15px] text-text-primary">KakaoTalk</span>
          <button 
            onClick={() => handleSnsConnection('카카오톡', isKakaoConnected, setIsKakaoConnected, 'https://accounts.kakao.com/login')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isKakaoConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' 
                : 'bg-accent text-white hover:bg-accent-dark'
            }`}
          >
            {/* 🚨 [다국어 적용] */}
            {isKakaoConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
          </button>
        </div>

        {/* Gmail 연동 영역 */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-[15px] text-text-primary">Gmail</span>
          <button 
            onClick={() => handleSnsConnection('Gmail', isGmailConnected, setIsGmailConnected, 'https://accounts.google.com/signin')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isGmailConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' 
                : 'bg-accent text-white hover:bg-accent-dark'
            }`}
          >
            {/* 🚨 [다국어 적용] */}
            {isGmailConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
          </button>
        </div>
        
      </div>
    </SettingEditModal>
  );
};