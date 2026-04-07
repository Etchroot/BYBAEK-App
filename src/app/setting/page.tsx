// 타겟 경로: src/app/setting/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SettingEditModal } from '@/components/SettingEditModal';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import { getOnboardingQuestions, mapDBToSurveyAnswers } from '@/utils/constants/OnboardingData';
import apiClient from '@/api/index';
// 🚨 [다국어 적용] 번역 훅 추가
import { useTranslation } from '@/hooks/useTranslation';

type AuthModalType = 'NONE' | 'Microsoft' | 'Instagram' | 'Gmail';
type AuthStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';
type LegalModalType = 'NONE' | 'terms' | 'privacy';

interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

export default function SettingScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [legalModal, setLegalModal] = useState<LegalModalType>('NONE');

  useEffect(() => {
    const storedShopId = localStorage.getItem('shop_id');
    setShopId(storedShopId);
  }, []);

  const { t } = useTranslation();

  // 1. 환경 설정 State
  const [isAutoUploadEnabled, setIsAutoUploadEnabled] = useState(false);
  
  // 🚨 [수정 1] 컴포넌트 마운트 시, 무조건 로컬 스토리지의 글로벌 언어를 최우선으로 가져옵니다!
  const [language, setLanguage] = useState('ko');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLanguage(localStorage.getItem('language') || 'ko');
    }
  }, []);
  
  // 2. 계정 연동 State
  const [isMicrosoftConnected, setIsMicrosoftConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailAddress, setGmailAddress] = useState('');

  // 3. UI 및 모달 제어 State
  const [isPromptListOpen, setIsPromptListOpen] = useState(false);
  const [isAccountListOpen, setIsAccountListOpen] = useState(false); 
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState<number>(1);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  
  const [activeAuthModal, setActiveAuthModal] = useState<AuthModalType>('NONE');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('IDLE');

  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    message: '',
    type: 'ALERT'
  });

  // 4. 업로드 시간 설정 State (백엔드 전송용은 한국어 유지)
  const frequencies = ['매일', '2일마다', '3일마다', '4일마다', '5일마다', '6일마다', '일주일마다'];
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [frequency, setFrequency] = useState('매일');
  const [amPm, setAmPm] = useState('AM');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('30');
  
  const [tempFrequency, setTempFrequency] = useState(frequency);
  const [tempAmPm, setTempAmPm] = useState(amPm);
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);

  // 5. 스무고개(설문) 답변 State
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, any>>({});

  const updateSetting = async (payload: Record<string, any>) => {
    try {
      await apiClient.post(`/onboarding/${shopId}`, payload);
    } catch (error) {
      console.error("설정 업데이트 실패:", error);
      setCustomAlert({
        isOpen: true,
        message: t.setting.alert_save_error, 
        type: 'ALERT'
      });
    }
  };

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!shopId) return;
      try {
        const response = await apiClient.get(`/onboarding/${shopId}`);
        const data = response.data.shop_info || response.data; 

        if (data) {
          // 🚨 [수정 2] DB 데이터가 아니라, 현재 화면의 글로벌 언어를 기준으로 맵핑합니다.
          const currentLang = localStorage.getItem('language') || 'ko';
          const mappedAnswers = mapDBToSurveyAnswers(data, currentLang);
          setSurveyAnswers(mappedAnswers);

          setIsAutoUploadEnabled(data.insta_auto_upload_yn === 'Y');
          
          // 🚨 [핵심 수정 3] setLanguage(data.language || 'ko'); 삭제!
          // 백엔드 DB에 과거에 저장된 언어값으로 현재 UI의 언어를 덮어씌우는 하극상(?)을 방지합니다.

          setIsInstagramConnected(data.is_insta_connected || false);
          setIsMicrosoftConnected(data.is_ms_connected || false);
          setIsGmailConnected(data.is_gmail_connected || false);
          setGmailAddress(data.owner_email || '');
          
          if (data.insta_upload_time) {
             const [time, period] = data.insta_upload_time.split(' ');
             const [h, m] = time.split(':');
             setHour(h); setMinute(m); setAmPm(period);
          }
          if (data.insta_upload_time_slot) setFrequency(data.insta_upload_time_slot);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboardingData();
  }, [shopId]);

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === 'MS_LOGIN_SUCCESS' && activeAuthModal === 'Microsoft') {
        setAuthStatus('COMPLETED');
        setIsMicrosoftConnected(true);
        updateSetting({ is_ms_connected: true });
      }
      if (event.data === 'INSTA_LOGIN_SUCCESS' && activeAuthModal === 'Instagram') {
        setAuthStatus('COMPLETED');
        setIsInstagramConnected(true);
        updateSetting({ is_insta_connected: true });
      }
      if (event.data === 'GMAIL_LOGIN_SUCCESS' && activeAuthModal === 'Gmail') {
        setAuthStatus('COMPLETED');
        setIsGmailConnected(true);
        updateSetting({ is_gmail_connected: true });
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [activeAuthModal]);

  const handleToggleAutoUpload = (val: boolean) => {
    setIsAutoUploadEnabled(val);
    updateSetting({ insta_auto_upload_yn: val ? 'Y' : 'N' });
  };

  const handleToggleLanguage = () => {
    const nextLang = language === 'ko' ? 'en' : 'ko';
    
    setLanguage(nextLang);
    updateSetting({ language: nextLang });
    localStorage.setItem('language', nextLang);
    window.location.reload();
  };

  const triggerExternalPopup = (platform: AuthModalType) => {
    setAuthStatus('IN_PROGRESS');
    
    const currentOrigin = window.location.origin;
    const callbackUrl = encodeURIComponent(`${currentOrigin}/auth/callback`);
    let authUrl = '';

    if (platform === 'Microsoft') {
      authUrl = `https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/.auth/login/aad?post_login_redirect_uri=${callbackUrl}`;
    } else if (platform === 'Instagram') {
      authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=${callbackUrl}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    } else if (platform === 'Gmail') {
      authUrl = 'https://accounts.google.com/'; 
    }

    if (authUrl !== '') {
      const popup = window.open(authUrl, `${platform}_Login_Popup`, 'width=500,height=600');
      if (!popup) {
        setCustomAlert({
          isOpen: true,
          message: t.setting.popup_blocked, 
          type: 'ALERT'
        });
        setAuthStatus('IDLE');
      }
    }
  };

  const CustomSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: (val: boolean) => void }) => (
    <button
      onClick={() => onToggle(!isOn)}
      className={`w-[48px] h-[24px] rounded-full flex items-center px-1 transition-colors focus:outline-none ${isOn ? 'bg-accent' : 'bg-[#E0E0E0]'}`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isOn ? 'translate-x-[22px]' : 'translate-x-0'}`} />
    </button>
  );

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center font-bold text-text-secondary">{t.setting.loading}</div>;

  const renderCustomAlert = () => {
    if (!customAlert.isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99999]">
        <div className="bg-background rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${customAlert.type === 'CONFIRM' ? 'bg-[#FFE5E5]' : 'bg-red-50'}`}>
            <span className={`text-2xl font-bold leading-none ${customAlert.type === 'CONFIRM' ? 'text-[#E02424]' : 'text-accent'}`}>!</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {customAlert.type === 'CONFIRM' ? t.setting.alert_disconnect_title : t.setting.alert_notice}
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 whitespace-pre-wrap leading-relaxed">{customAlert.message}</p>
          <div className="flex flex-row w-full gap-3">
            {customAlert.type === 'CONFIRM' && (
              <button onClick={() => setCustomAlert({ ...customAlert, isOpen: false })} className="flex-1 py-3 bg-[#E0E0E0] text-text-primary rounded-lg font-bold hover:bg-gray-300 transition-colors focus:outline-none">
                {t.common.cancel}
              </button>
            )}
            <button
              onClick={() => {
                if (customAlert.onConfirm) customAlert.onConfirm();
                setCustomAlert({ ...customAlert, isOpen: false });
              }}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors focus:outline-none ${customAlert.type === 'CONFIRM' ? 'bg-[#E02424] hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'}`}
            >
              {customAlert.type === 'CONFIRM' ? t.setting.btn_disconnect : t.common.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthModal = () => {
    if (activeAuthModal === 'NONE') return null;
    let title = '', desc = '', btnText = '';

    if (activeAuthModal === 'Microsoft') {
      title = t.login.ms_title; desc = t.login.ms_desc; btnText = t.login.ms_btn;
    } else if (activeAuthModal === 'Instagram') {
      title = t.login.insta_title; desc = t.login.insta_desc; btnText = t.login.insta_btn;
    } else if (activeAuthModal === 'Gmail') {
      title = t.setting.auth_gmail_title; desc = t.setting.auth_gmail_desc; btnText = t.setting.auth_gmail_btn;
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
        <div className="w-[450px] min-h-[500px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
          <div className="flex justify-between items-center mb-large">
            <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
            <button onClick={() => setActiveAuthModal('NONE')} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">✕</button>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            {authStatus === 'IDLE' && (
              <>
                <p className="text-body text-text-primary text-center mb-5">{desc}</p>
                <button onClick={() => triggerExternalPopup(activeAuthModal)} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none">
                  {btnText}
                </button>
              </>
            )}
            {authStatus === 'IN_PROGRESS' && (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-body text-text-primary text-center font-bold">{t.login.in_progress}</p>
                <p className="text-[14px] text-text-secondary text-center mt-2 whitespace-pre-wrap">{t.setting.auth_progress_desc}</p>
                <button onClick={() => {
                  setAuthStatus('COMPLETED');
                  if(activeAuthModal === 'Microsoft') { setIsMicrosoftConnected(true); updateSetting({ is_ms_connected: true }); }
                  if(activeAuthModal === 'Instagram') { setIsInstagramConnected(true); updateSetting({ is_insta_connected: true }); }
                  if(activeAuthModal === 'Gmail') { setIsGmailConnected(true); updateSetting({ is_gmail_connected: true }); }
                }} className="mt-8 text-xs text-gray-400 underline">{t.login.test_trigger}</button>
              </div>
            )}
            {authStatus === 'COMPLETED' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><span className="text-green-600 text-3xl">✓</span></div>
                <p className="text-[18px] font-bold text-text-primary">{t.login.ms_completed}</p>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-between mt-large">
            <button onClick={() => setActiveAuthModal('NONE')} className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none">
              {t.common.cancel}
            </button>
            <button onClick={() => setActiveAuthModal('NONE')} disabled={authStatus !== 'COMPLETED'} className={`flex-1 py-3 rounded-lg flex items-center justify-center font-bold transition-colors focus:outline-none ${authStatus !== 'COMPLETED' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-accent text-text-inverse hover:bg-accent-dark'}`}>
              {t.login.btn_complete}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="mb-large border-b border-border pb-small shrink-0">
          <h1 className="text-[28px] text-text-primary font-bold">{t.setting.title}</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-large min-h-0 scrollbar-hide">
          
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">{t.setting.section_marketer}</h2>
              <button onClick={() => setIsPromptListOpen(!isPromptListOpen)} className="flex items-center text-sm font-bold text-text-primary hover:text-accent transition-colors focus:outline-none">
                {isPromptListOpen ? t.setting.btn_close : t.setting.btn_open}
              </button>
            </div>
            {isPromptListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                {getOnboardingQuestions(language).filter(q => q.category === 'PERSONAL').map((q, index) => {
                  const rawAnswer = surveyAnswers[q.id];
                  const displayAnswer = rawAnswer ? (Array.isArray(rawAnswer) ? rawAnswer.join(', ') : rawAnswer) : t.setting.unentered;
                  return (
                    <div key={q.id} className="flex flex-row items-center justify-between gap-4">
                      <p className="flex-[2] text-[14px] text-text-primary leading-snug">{index + 1}. {q.question}</p>
                      <p className="flex-[1] text-[14px] text-text-secondary font-bold text-right truncate">{displayAnswer}</p>
                      <button className="px-4 py-1.5 bg-background border border-[#D0D0D0] rounded-full text-[13px] font-semibold text-text-primary hover:bg-gray-50 transition-colors focus:outline-none shrink-0" onClick={() => { setTargetQuestionId(q.id); setIsOnboardingModalOpen(true); }}>
                        {t.setting.btn_edit}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4 transition-all">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">{t.setting.section_account}</h2>
              <button onClick={() => setIsAccountListOpen(!isAccountListOpen)} className="flex items-center text-sm font-bold text-text-primary hover:text-accent transition-colors focus:outline-none">
                {isAccountListOpen ? t.setting.btn_close : t.setting.btn_open}
              </button>
            </div>

            {isAccountListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Microsoft</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isMicrosoftConnected ? 'bybaek_barber@outlook.com' : t.setting.no_account}
                  </p>
                  <button 
                    onClick={() => {
                      if (isMicrosoftConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: t.setting.ms_disconnect_confirm,
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsMicrosoftConnected(false);
                            updateSetting({ is_ms_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Microsoft');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isMicrosoftConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isMicrosoftConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
                  </button>
                </div>

                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Instagram</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isInstagramConnected ? '@bybaek_official' : t.setting.no_account}
                  </p>
                  <button 
                    onClick={() => {
                      if (isInstagramConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: t.setting.insta_disconnect_confirm,
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsInstagramConnected(false);
                            updateSetting({ is_insta_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Instagram');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isInstagramConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isInstagramConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
                  </button>
                </div>

                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Gmail</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isGmailConnected ? (gmailAddress || t.setting.no_account) : t.setting.no_account}
                  </p>
                  <button 
                    onClick={() => {
                      if (isGmailConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: t.setting.gmail_disconnect_confirm,
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsGmailConnected(false);
                            updateSetting({ is_gmail_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Gmail');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isGmailConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isGmailConnected ? t.setting.btn_disconnect : t.setting.btn_connect}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">{t.setting.section_env}</h2>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">{t.setting.language_setting}</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{language === 'ko' ? '한국어' : 'English'}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none" onClick={handleToggleLanguage}>
                  {t.setting.btn_change}
                </button>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px] text-text-primary">{t.setting.insta_auto_upload}</span>
              <CustomSwitch isOn={isAutoUploadEnabled} onToggle={handleToggleAutoUpload} />
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">{t.setting.section_auto_upload}</h2>
            <div className="flex flex-row items-center gap-4">
              <span className="text-[15px] text-text-primary shrink-0">{t.setting.upload_time}</span>
              <div className="flex flex-row items-center flex-1 justify-end gap-3">
                <span className="bg-background border border-border px-5 py-2 rounded-md text-sm whitespace-nowrap text-text-primary">
                  {(t.setting.freq_map as any)[frequency] || frequency} {amPm} {hour}:{minute}
                </span>
                <button
                  className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none shrink-0"
                  onClick={() => { setTempFrequency(frequency); setTempAmPm(amPm); setTempHour(hour); setTempMinute(minute); setTimeModalVisible(true); }}
                >
                  {t.setting.btn_edit}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-6 py-4 mt-2">
            <button
              onClick={() => setLegalModal('terms')}
              className="text-[13px] text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors focus:outline-none"
            >
              {t.setting.terms_of_service || '이용약관'}
            </button>
            <span className="text-[13px] text-[#D0D0D0]">|</span>
            <button
              onClick={() => setLegalModal('privacy')}
              className="text-[13px] text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors focus:outline-none"
            >
              {t.setting.privacy_policy || '개인정보처리방침'}
            </button>
          </div>
        </div>
      </div>

      {legalModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] h-[85vh] flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between items-center px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-[18px] font-bold text-text-primary">
                {legalModal === 'terms'
                  ? (t.setting.terms_of_service || '이용약관')
                  : (t.setting.privacy_policy || '개인정보처리방침')}
              </h2>
              <button
                onClick={() => setLegalModal('NONE')}
                className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center text-text-primary font-bold text-lg hover:bg-gray-300 transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>
            <iframe
              src={legalModal === 'terms' ? '/terms.html' : '/privacy.html'}
              className="flex-1 w-full border-none"
              title={legalModal === 'terms' ? '이용약관' : '개인정보처리방침'}
            />
          </div>
        </div>
      )}

      {renderAuthModal()}
      {renderCustomAlert()}

      <SettingEditModal
        isVisible={isTimeModalVisible} title={t.setting.modal_schedule_title} onClose={() => setTimeModalVisible(false)}
        onSave={() => {
          setFrequency(tempFrequency); setAmPm(tempAmPm); setHour(tempHour); setMinute(tempMinute);
          updateSetting({ 
            insta_upload_time_slot: tempFrequency, 
            insta_upload_time: `${tempHour}:${tempMinute} ${tempAmPm}` 
          });
          setTimeModalVisible(false);
        }}
      >
        <p className="text-sm font-bold text-[#666666] mb-2 mt-4">{t.setting.modal_time_setting}</p>
        <div className="flex flex-row gap-2 mb-4">
          {['AM', 'PM'].map(p => (
            <button key={p} className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${tempAmPm === p ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'}`} onClick={() => setTempAmPm(p)}>{p}</button>
          ))}
        </div>
        <div className="flex flex-row relative z-50 mb-6 gap-4">
          <div className="relative w-[140px]">
            <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none" onClick={() => { setIsHourDropdownOpen(!isHourDropdownOpen); setIsMinuteDropdownOpen(false); }}>
              <span>{tempHour} {t.setting.hour}</span><span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isHourDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {hours.map(h => <button key={`hour-${h}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none" onClick={() => { setTempHour(h); setIsHourDropdownOpen(false); }}>{h} {t.setting.hour}</button>)}
              </div>
            )}
          </div>
          <div className="relative w-[140px]">
            <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none" onClick={() => { setIsMinuteDropdownOpen(!isMinuteDropdownOpen); setIsHourDropdownOpen(false); }}>
              <span>{tempMinute} {t.setting.minute}</span><span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isMinuteDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {minutes.map(m => <button key={`min-${m}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none" onClick={() => { setTempMinute(m); setIsMinuteDropdownOpen(false); }}>{m} {t.setting.minute}</button>)}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-[#666666] mb-2">{t.setting.modal_upload_freq}</p>
        <div className="flex flex-row flex-wrap gap-2">
          {frequencies.map(f => (
            <button key={f} className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${tempFrequency === f ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'}`} onClick={() => setTempFrequency(f)}>
              {(t.setting.freq_map as any)[f] || f}
            </button>
          ))}
        </div>
      </SettingEditModal>

      {isOnboardingModalOpen && (
        <OnboardingSurvey 
          initialQuestionId={targetQuestionId} 
          initialAnswers={surveyAnswers} 
          onFinish={(newAnswers) => {
            setIsOnboardingModalOpen(false);
            if (newAnswers) {
              setSurveyAnswers(newAnswers); 
              setGmailAddress(newAnswers[12] || '');

              const schedule = newAnswers[13];
              if (schedule) {
                setFrequency(schedule.frequency || '매일');
                setAmPm(schedule.amPm || 'AM');
                setHour(schedule.hour || '10');
                setMinute(schedule.minute || '30');

                updateSetting({
                  insta_upload_time_slot: schedule.frequency,
                  insta_upload_time: `${schedule.hour}:${schedule.minute} ${schedule.amPm}`
                });
              }
            }
          }}
          onSkip={() => setIsOnboardingModalOpen(false)}
        />
      )}
    </div>
  );
}