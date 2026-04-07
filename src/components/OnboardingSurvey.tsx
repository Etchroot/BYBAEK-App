// 타겟 경로: src/components/OnboardingSurvey.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getOnboardingQuestions, SurveyQuestion } from '../utils/constants/OnboardingData';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingSurveyProps {
  initialQuestionId?: number; 
  initialAnswers?: Record<number, any>; 
  onFinish: (answers?: any) => void;
  onSkip: () => void;
}

interface ScheduleAnswer {
  amPm: string;
  hour: string;
  minute: string;
  frequency: string;
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ 
  initialQuestionId, 
  initialAnswers, 
  onFinish, 
  onSkip 
}) => {
  const { t, lang } = useTranslation(); 
  const ONBOARDING_QUESTIONS = getOnboardingQuestions(lang);
  
  const initialIndex = initialQuestionId
    ? ONBOARDING_QUESTIONS.findIndex((q) => q.id === initialQuestionId)
    : 0;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const isSingleEditMode = !!initialQuestionId;

  const [answers, setAnswers] = useState<Record<number, any>>(() => {
    return initialAnswers && Object.keys(initialAnswers).length > 0 ? initialAnswers : {};
  });

  // 🚨 [신규] 커스텀 경고창에 띄울 메시지 상태 관리
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const currentQuestion: SurveyQuestion = ONBOARDING_QUESTIONS[currentIndex];
  
  const partTitle = currentQuestion.category === 'PERSONAL' 
    ? t.onboarding_survey.part_personal 
    : t.onboarding_survey.part_app;

  const [inputText, setInputText] = useState('');

  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);
  
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const frequencies = ['매일', '2일마다', '3일마다', '4일마다', '5일마다', '6일마다', '일주일마다'];

  useEffect(() => {
    const currentAnswer = answers[currentQuestion.id];
    let newText = '';
    
    if (typeof currentAnswer === 'string' && currentQuestion.type !== 'SELECT') {
      if (currentQuestion.options && !currentQuestion.options.includes(currentAnswer)) {
        newText = currentAnswer;
      } else if (!currentQuestion.options) {
        newText = currentAnswer;
      }
    }
    setInputText(newText);
    
    if (currentQuestion.type === 'SCHEDULE' && !currentAnswer) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { amPm: 'AM', hour: '10', minute: '30', frequency: '매일' }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion.id]);

  const handleNext = () => {
    let finalAnswer = currentQuestion.type === 'SCHEDULE' 
      ? answers[currentQuestion.id] 
      : (inputText.trim() || answers[currentQuestion.id]);
    
    // 시간 설정 1시간 이내 검증 로직
    if (currentQuestion.type === 'SCHEDULE' && finalAnswer) {
      const now = new Date(); 
      const nextRun = new Date(now);
      
      let selectedHour = parseInt(finalAnswer.hour, 10);
      if (finalAnswer.amPm === 'PM' && selectedHour !== 12) selectedHour += 12;
      if (finalAnswer.amPm === 'AM' && selectedHour === 12) selectedHour = 0;
      const selectedMinute = parseInt(finalAnswer.minute, 10);
      
      nextRun.setHours(selectedHour, selectedMinute, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      const diffMs = nextRun.getTime() - now.getTime();
      const oneHourMs = 60 * 60 * 1000;
      
      if (diffMs < oneHourMs) {
        // 🚨 기존 window.alert() 삭제! 대신 예쁜 커스텀 모달 상태를 켭니다.
        setAlertMessage(t.onboarding_survey.alert_time_1hour);
        return; 
      }
    }

    const updatedAnswers = { ...answers };

    if (finalAnswer) {
      updatedAnswers[currentQuestion.id] = finalAnswer;
    }

    if (isSingleEditMode) {
      onFinish(updatedAnswers); 
      return;
    }

    if (currentIndex < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText('');
    } else {
      onFinish(updatedAnswers); 
    }
  };

  const handleSelect = (option: string) => {
    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isMultiSelect) {
      const prevSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (prevSelected.includes(option)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: prevSelected.filter((item) => item !== option),
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...prevSelected, option],
        });
      }
    } else {
      setInputText(''); 
      setAnswers({ ...answers, [currentQuestion.id]: option });
    }
  };

  const updateSchedule = (key: keyof ScheduleAnswer, value: string) => {
    const currentSchedule = answers[currentQuestion.id] || { amPm: 'AM', hour: '10', minute: '30', frequency: '매일' };
    setAnswers({
      ...answers,
      [currentQuestion.id]: { ...currentSchedule, [key]: value }
    });
  };

  const checkIsSelected = (option: string) => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.isMultiSelect && Array.isArray(currentAnswer)) {
      return currentAnswer.includes(option);
    }
    return currentAnswer === option;
  };

  const currentSchedule: ScheduleAnswer = answers[currentQuestion.id] || { amPm: 'AM', hour: '10', minute: '30', frequency: '매일' };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[10000] p-4">
        <div className="w-[450px] max-h-[85vh] bg-background rounded-xl shadow-lg flex flex-col overflow-hidden">
          
          <div className="p-large pb-4 shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[14px] text-accent font-bold mb-1">{partTitle}</p>
                <h2 className="text-h2 font-bold text-text-primary">
                  {isSingleEditMode ? t.onboarding_survey.edit_title : `(${currentIndex + 1}/${ONBOARDING_QUESTIONS.length})`}
                </h2>
              </div>
              <button onClick={onSkip} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer">
                ✕
              </button>
            </div>
          </div>

          <div className="px-large pb-large flex-1 overflow-y-auto scrollbar-hide">
            <p className="text-body font-bold text-text-primary mb-5 whitespace-pre-wrap leading-relaxed">
              Q. {currentQuestion.question}
            </p>
            
            {(currentQuestion.type === 'SELECT' || currentQuestion.type === 'SELECT_TEXT') && (
              <div className="flex flex-col mb-3">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = checkIsSelected(option); 
                  return (
                    <button 
                      key={idx} onClick={() => handleSelect(option)}
                      className={`p-medium mt-3 border rounded-lg text-left transition-colors cursor-pointer focus:outline-none ${isSelected ? 'border-accent border-[1.5px] bg-red-50' : 'border-border bg-background hover:bg-gray-50'}`}
                    >
                      <span className={`text-body ${isSelected ? 'text-accent font-bold' : 'text-text-primary'}`}>
                        {isSelected ? (currentQuestion.isMultiSelect ? '☑️' : '🔘') : (currentQuestion.isMultiSelect ? '☐' : '⚪')} {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {(currentQuestion.type === 'TEXT' || currentQuestion.type === 'SELECT_TEXT') && (
              <div className="mt-3 flex flex-col">
                {currentQuestion.type === 'SELECT_TEXT' && (
                  <span className="text-[13px] text-text-secondary mb-2">{t.onboarding_survey.or_type_directly}</span>
                )}
                <textarea 
                  className="w-full h-[120px] border border-border rounded-lg p-medium text-body text-text-primary placeholder:text-[#A0A0A0] resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder={currentQuestion.placeholder} value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (!currentQuestion.isMultiSelect) setAnswers({ ...answers, [currentQuestion.id]: '' });
                  }}
                />
              </div>
            )}

            {currentQuestion.type === 'SCHEDULE' && (
              <div className="flex flex-col mt-2">
                <p className="text-sm font-bold text-[#666666] mb-3">{t.onboarding_survey.time_setting}</p>
                
                <div className="flex flex-row gap-2 mb-4">
                  {['AM', 'PM'].map(p => (
                    <button 
                      key={p} onClick={() => updateSchedule('amPm', p)}
                      className={`px-5 py-2 rounded-full border text-sm transition-colors cursor-pointer focus:outline-none ${currentSchedule.amPm === p ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary hover:bg-gray-200'}`} 
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex flex-row relative z-50 mb-8 gap-4">
                  <div className="relative w-[140px]">
                    <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] cursor-pointer focus:outline-none hover:bg-gray-50" onClick={() => { setIsHourDropdownOpen(!isHourDropdownOpen); setIsMinuteDropdownOpen(false); }}>
                      <span>{currentSchedule.hour} {t.setting.hour}</span><span className="text-[12px] text-[#888888]">▼</span>
                    </button>
                    {isHourDropdownOpen && (
                      <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                        {hours.map(h => <button key={`hour-${h}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 cursor-pointer focus:outline-none" onClick={() => { updateSchedule('hour', h); setIsHourDropdownOpen(false); }}>{h} {t.setting.hour}</button>)}
                      </div>
                    )}
                  </div>

                  <div className="relative w-[140px]">
                    <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] cursor-pointer focus:outline-none hover:bg-gray-50" onClick={() => { setIsMinuteDropdownOpen(!isMinuteDropdownOpen); setIsHourDropdownOpen(false); }}>
                      <span>{currentSchedule.minute} {t.setting.minute}</span><span className="text-[12px] text-[#888888]">▼</span>
                    </button>
                    {isMinuteDropdownOpen && (
                      <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                        {minutes.map(m => <button key={`min-${m}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 cursor-pointer focus:outline-none" onClick={() => { updateSchedule('minute', m); setIsMinuteDropdownOpen(false); }}>{m} {t.setting.minute}</button>)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-[#666666] mb-3">{t.onboarding_survey.upload_freq}</p>
                <div className="flex flex-row flex-wrap gap-2">
                  {frequencies.map(f => (
                    <button 
                      key={f} onClick={() => updateSchedule('frequency', f)}
                      className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer focus:outline-none ${currentSchedule.frequency === f ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary hover:bg-gray-200'}`} 
                    >
                      {(t.setting.freq_map as any)[f] || f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-large bg-background border-t border-[#F0F0F0] flex flex-row justify-between shrink-0">
            <button onClick={onSkip} className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold cursor-pointer hover:bg-gray-300 transition-colors focus:outline-none">
              {t.common.cancel}
            </button>
            <button onClick={handleNext} className="flex-1 bg-accent py-3 rounded-lg flex items-center justify-center ml-small text-text-inverse font-bold cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none">
              {isSingleEditMode 
                ? t.onboarding_survey.btn_edit_complete 
                : (currentIndex === ONBOARDING_QUESTIONS.length - 1 ? t.onboarding_survey.btn_complete_start : t.onboarding_survey.btn_save_next)}
            </button>
          </div>

        </div>
      </div>

      {/* 🚨 커스텀 알림창 UI (window.alert 대체) */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-2xl p-8 w-[360px] flex flex-col items-center">
            
            {/* 경고 아이콘 */}
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            
            <p className="text-sm text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            
            {/* 확인 버튼 */}
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full py-3 bg-accent text-white rounded-lg font-bold cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none"
            >
              {t.common?.confirm || '확인'}
            </button>
            
          </div>
        </div>
      )}
    </>
  );
};