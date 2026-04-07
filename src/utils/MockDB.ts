// 타겟 경로: src/utils/MockDB.ts
// 🚨 [변경] 이전 단계에서 함수형으로 바꾼 getOnboardingQuestions를 가져옵니다.
import { getOnboardingQuestions } from './constants/OnboardingData'; 

export interface SavedAnswer {
  id: number;
  question: string;
  answer: string | string[];
}

// 로컬 스토리지에 저장될 키 이름
const STORAGE_KEY = 'bybaek_mock_db';

// [핵심] Next.js SSR 환경 에러 방지: 현재 코드가 브라우저에서 실행 중인지 확인
const isBrowser = typeof window !== 'undefined';

// 로컬 스토리지에서 데이터 불러오기 헬퍼 함수
const loadStorage = (): Record<number, SavedAnswer> => {
  if (!isBrowser) return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// 로컬 스토리지에 데이터 저장 헬퍼 함수
const saveToStorage = (data: Record<number, SavedAnswer>) => {
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const MockDB = {
  // 답변 저장 (🚨 lang 파라미터 추가, 기본값 'ko')
  saveAnswer: (id: number, answer: string | string[], lang: string = 'ko') => {
    const mockStorage = loadStorage(); 
    
    // 🚨 [변경] 현재 언어에 맞는 질문 텍스트를 가져오기 위해 함수 호출
    const questions = getOnboardingQuestions(lang);
    const question = questions.find(q => q.id === id)?.question || '';
    
    mockStorage[id] = { id, question, answer };
    saveToStorage(mockStorage);
  },

  // 특정 ID의 답변 가져오기
  getAnswer: (id: number) => {
    const mockStorage = loadStorage();
    return mockStorage[id]?.answer;
  },

  // 전체 데이터 가져오기
  getAll: () => {
    const mockStorage = loadStorage();
    return Object.values(mockStorage);
  },

  // PERSONAL 답변들을 조합하여 '시스템 프롬프트' 생성 (🚨 lang 파라미터 추가)
  generateSystemPrompt: (lang: string = 'ko') => {
    const pAnswers = loadStorage();
    const isEn = lang === 'en';

    if (Object.keys(pAnswers).length === 0) {
      return isEn 
        ? 'You are a barbershop marketing expert... (No data)' 
        : '당신은 바버샵 마케팅 전문가입니다... (데이터 없음)';
    }

    // 🚨 [다국어 적용] '미지정', '없음' 등 기본값(Fallback) 번역
    const fallbackUnspecified = isEn ? 'Unspecified' : '미지정';
    const fallbackNone = isEn ? 'None' : '없음';
    const fallbackBasic = isEn ? 'Basic' : '기본';

    // 🚨 [다국어 적용] 시스템 프롬프트 영문 버전
    if (isEn) {
      return `You are a barbershop marketing expert. 
Our shop's vibe is [${pAnswers[1]?.answer || fallbackUnspecified}], 
and the procedure to emphasize the most is [${pAnswers[2]?.answer || fallbackUnspecified}]. 
Exclude photos of type [${pAnswers[3]?.answer || fallbackNone}], 
and write hashtags in the direction of [${pAnswers[4]?.answer || fallbackBasic}]. 
At the end of the post, always include the phrase "${pAnswers[5]?.answer || ''}".
The fixed shop introduction is [${pAnswers[6]?.answer || fallbackNone}].
Forbidden words are [${pAnswers[7]?.answer || fallbackNone}].
Example posts are [${pAnswers[8]?.answer || fallbackNone}].
The usual upload time is [${pAnswers[9]?.answer || fallbackUnspecified}].`;
    }

    // 기존 시스템 프롬프트 한글 버전
    return `당신은 바버샵 마케팅 전문가입니다. 
우리 샵의 분위기는 [${pAnswers[1]?.answer || fallbackUnspecified}]이며, 
가장 강조할 시술은 [${pAnswers[2]?.answer || fallbackUnspecified}]입니다. 
[${pAnswers[3]?.answer || fallbackNone}] 유형의 사진은 배제하고, 
해시태그는 [${pAnswers[4]?.answer || fallbackBasic}] 방향으로 작성하세요. 
게시물 끝에는 반드시 "${pAnswers[5]?.answer || ''}" 문구를 넣으세요.
가게 소개 고정 문구는 [${pAnswers[6]?.answer || fallbackNone}]입니다.
금기어는 [${pAnswers[7]?.answer || fallbackNone}]입니다.
예시 게시물은 [${pAnswers[8]?.answer || fallbackNone}]입니다.
주로 올리는 시간대는 [${pAnswers[9]?.answer || fallbackUnspecified}]입니다.`;
  }
};