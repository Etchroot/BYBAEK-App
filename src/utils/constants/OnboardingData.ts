// 타겟 경로: src/utils/constants/OnboardingData.ts

export type SurveyType = 'SELECT' | 'TEXT' | 'SELECT_TEXT' | 'SCHEDULE'; 
export type SurveyCategory = 'PERSONAL' | 'APP'; 

export interface SurveyQuestion {
  id: number;
  category: SurveyCategory;
  type: SurveyType;
  question: string;
  isMultiSelect?: boolean; 
  options?: string[];
  placeholder?: string;
}

export const getOnboardingQuestions = (lang: string): SurveyQuestion[] => {
  const isEn = lang === 'en';

  return [
    /** * PART 1. 개인화 설정 (Personalization) */
    {
      id: 1, category: 'PERSONAL', type: 'SELECT_TEXT',
      question: isEn ? 'What is the vibe of your shop?' : '우리 샵은 어떤 느낌인가요?',
      isMultiSelect: true, 
      options: isEn 
        ? ['Masculine/Classic', 'Trendy/Modern', 'Friendly/Comfortable', 'Premium/Luxury', 'Minimalist', 'Vintage']
        : ['남성적/클래식', '트렌디/모던', '친근/편안', '프리미엄/고급', '미니멀', '빈티지'],
      placeholder: isEn ? 'Please enter other vibes directly.' : '그 외 느낌을 직접 입력해주세요.'
    },
    {
      id: 2, category: 'PERSONAL', type: 'SELECT_TEXT',
      question: isEn ? 'What is the procedure you want to emphasize the most?' : '가장 강조하고 싶은 시술은 무엇인가요?',
      isMultiSelect: true,
      options: isEn
        ? ['Fade Cut', 'Slick Back', 'Side Part', 'Beard Trimming', 'Parting Perm', 'Iron Perm']
        : ['페이드컷', '슬릭백', '사이드파트', '수염트리밍', '가르마펌', '아이롱펌'],
      placeholder: isEn ? 'Please enter other procedures directly.' : '그 외 시술을 직접 입력해주세요.'
    },
    {
      id: 3, category: 'PERSONAL', type: 'SELECT_TEXT', 
      question: isEn ? 'Are there any types of photos you want to avoid?' : '올리기 싫은 사진 유형이 있나요?',
      isMultiSelect: true,
      options: isEn
        ? ['Face Close-up', 'Messy Background', 'Incomplete Styling', 'Team Member Photo']
        : ['얼굴 클로즈업', '배경 지저분', '스타일링 미완성', '팀원 사진'],
      placeholder: isEn ? 'Please enter other types to avoid.' : '그 외 피하고 싶은 유형을 입력해주세요.'
    },
    {
      id: 4, category: 'PERSONAL', type: 'SELECT_TEXT',
      question: isEn ? 'What kind of hashtags do you prefer?' : '해시태그는 어떤 방향을 선호하시나요?',
      isMultiSelect: true,
      options: isEn
        ? ['Men\'s Hair Specialist', 'Include Region Name', 'Emotional/Trend Tags']
        : ['남성 헤어 전문', '지역명 포함', '감성/트렌드 태그'],
      placeholder: isEn ? 'Please enter other preferred directions.' : '그 외 선호하는 방향을 입력해주세요.'
    },
    {
      id: 5, category: 'PERSONAL', type: 'TEXT',
      question: isEn ? 'Is there a specific phrase (CTA) you always want at the end of a post?' : '게시물 끝에 항상 넣고 싶은 문구(CTA)가 있나요?',
      placeholder: isEn ? 'Ex: DM for reservation / Call us / Naver Reservation' : '예: DM으로 예약 / 전화주세요 / 네이버예약'
    },
    {
      id: 6, category: 'PERSONAL', type: 'TEXT',
      question: isEn ? 'Please enter the shop introduction text. (For new customers)' : '가게 소개 고정 문구를 입력해주세요. (신규 고객용)',
      placeholder: isEn ? 'Ex: 10 years experience barbershop, men\'s specialist, reservation only' : '예: 10년 경력 바버샵, 남성 전문, 예약제 운영'
    },
    {
      id: 7, category: 'PERSONAL', type: 'TEXT',
      question: isEn ? 'Are there any words that must never be used?' : '절대 쓰면 안 되는 단어가 있나요?',
      placeholder: isEn ? 'Ex: Designer, Hair shop (comma separated)' : '예: 디자이너, 헤어샵 (쉼표로 구분하여 입력)'
    },
    {
      id: 8, category: 'PERSONAL', type: 'TEXT',
      question: isEn ? 'Please provide the URL or content of a previously well-received post.' : '기존에 반응 좋았던 게시물 URL 혹은 내용을 알려주세요.',
      placeholder: isEn ? 'Enter Insta post URL or features (for RAG data)' : '인스타 게시물 URL이나 특징을 적어주세요 (RAG 데이터 활용)'
    },
    { 
      id: 10, category: 'PERSONAL', type: 'TEXT',
      question: isEn ? 'Where is your shop located? (Include city)' : '샵의 위치는 어디인가요? (도시까지 입력)',
      placeholder: isEn ? 'Ex: Gangnam-gu, Seoul' : '예: 서울 강남구, 부산 해운대구'
    },

    /** * PART 2. 앱 설정 (App Settings) */
    {
      id: 11, category: 'APP', type: 'SELECT',
      question: isEn ? 'Would you like to enable auto-upload?\nIf enabled, an email will be sent 30 minutes before upload.' : '자동 업로드를 활성화하시겠습니까?\n활성화하면 업로드 30분 전 메일을 보냅니다.',
      options: isEn ? ['Yes (Recommended)', 'No'] : ['예 (추천)', '아니오']
    },
    {
      id: 13, category: 'APP', type: 'SCHEDULE',
      question: isEn ? 'Please set your preferred upload schedule.' : '원하시는 업로드 스케줄을 설정해주세요.',
    },
    {
      id: 12, category: 'APP', type: 'TEXT',
      question: isEn ? 'Please enter the email address to receive notifications' : '알람을 받을 메일 주소를 입력해주세요',
      placeholder: isEn ? 'Ex: example@gmail.com' : '예: example@gmail.com'
    }
    // 🚨 [삭제됨] id: 14 언어 선택 문항 제거
  ];
};

export const mapDBToSurveyAnswers = (data: any, lang: string): Record<number, any> => {
  if (!data) return {};
  const isEn = lang === 'en';

  return {
    1: data.brand_tone || [], 
    2: data.preferred_styles || [],
    3: Array.isArray(data.exclude_conditions) ? data.exclude_conditions : (data.exclude_conditions ? [data.exclude_conditions] : []),
    4: Array.isArray(data.hashtag_style) ? data.hashtag_style : (data.hashtag_style ? [data.hashtag_style] : []),
    5: data.cta || '',
    6: data.shop_intro || '',
    7: data.forbidden_words || [],
    8: data.rag_reference || '',
    9: data.city || '',
    
    11: data.insta_auto_upload_yn === 'Y' ? (isEn ? 'Yes (Recommended)' : '예 (추천)') : (isEn ? 'No' : '아니오'),
    12: data.owner_email || '',
    13: {
      frequency: data.insta_upload_time_slot || '매일',
      amPm: data.insta_upload_time ? data.insta_upload_time.split(' ')[1] : 'AM',
      hour: data.insta_upload_time ? data.insta_upload_time.split(' ')[0].split(':')[0] : '10',
      minute: data.insta_upload_time ? data.insta_upload_time.split(' ')[0].split(':')[1] : '30'
    }
    // 🚨 [삭제됨] 14번 맵핑 로직 제거
  };
};