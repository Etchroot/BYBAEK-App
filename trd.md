# BYBAEK Frontend - 기술 상세 설명서 (TRD)

## 1. 프로젝트 개요

BYBAEK은 바버샵 사장님을 위한 AI 기반 인스타그램 자동 홍보 웹 서비스이다. 사용자가 채팅으로 원하는 게시물 스타일을 요청하면, AI가 캡션과 해시태그를 생성하고, OneDrive에서 동기화된 사진을 선택하여 인스타그램에 자동 업로드한다.

**기술 스택:**
| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 4 + PostCSS |
| HTTP 클라이언트 | Axios 1.13.6 (timeout: 60s) |
| 튜토리얼 | React Joyride |
| 런타임 | Node.js 22.x |
| 배포 | Azure Static Web Apps (standalone output) |

---

## 2. 디렉터리 구조

```
src/
├── app/                          # 페이지 라우트
│   ├── layout.tsx                # 루트 레이아웃 (폰트, PhotoSyncProgress, TutorialTour)
│   ├── page.tsx                  # 랜딩 (로그인 상태 → dashboard / login 분기)
│   ├── auth/callback/page.tsx    # OAuth 콜백 핸들러 (MS + Instagram)
│   ├── login/page.tsx            # 4단계 로그인 (언어→MS→OneDrive QR→Instagram)
│   ├── onboarding/
│   │   ├── intro/page.tsx        # 온보딩 소개 화면
│   │   └── page.tsx              # 20문항 설문 폼
│   ├── dashboard/page.tsx        # 메인 대시보드 (게시물 목록 + 새 글 생성)
│   ├── preview/page.tsx          # AI 게시물 생성 (채팅 + 사진 선택 + 캡션 편집)
│   ├── review/page.tsx           # 이메일 기반 게시물 검토 인터페이스
│   ├── post/[id]/page.tsx        # 게시물 상세 보기
│   ├── photos/page.tsx           # 전체 사진 브라우저 (삭제 기능)
│   ├── album/page.tsx            # 앨범 관리 (생성, 편집, 사진 추가)
│   ├── setting/page.tsx          # 설정 (개인화, 계정 연결, 업로드 스케줄)
│   └── api/sync-onedrive/route.ts # OneDrive 동기화 프록시 API 라우트
├── components/                   # 재사용 컴포넌트
│   ├── Sidebar.tsx               # 네비게이션 사이드바 (접기/펼치기)
│   ├── PostCard.tsx              # 게시물 카드
│   ├── OnboardingSurvey.tsx      # 설문 폼 (20문항, 다중선택)
│   ├── PhotoSyncProgress.tsx     # OneDrive 동기화 실시간 상태
│   ├── TutorialTour.tsx          # Joyride 기반 튜토리얼
│   ├── AlbumCard.tsx             # 앨범 카드
│   ├── AlbumDetailModal.tsx      # 앨범 편집 모달
│   ├── ImageEditModal.tsx        # 사진 선택 모달 (2단계: 앨범→사진)
│   ├── SettingEditModal.tsx      # 업로드 시간/빈도 선택 모달
│   └── SnsConnectionModal.tsx    # 계정 연결 UI
├── api/
│   ├── index.ts                  # Axios 클라이언트 설정
│   └── agent.ts                  # AI 에이전트 파이프라인 API
├── hooks/
│   └── useTranslation.ts         # 다국어 훅 (localStorage 기반)
├── locales/
│   └── translations.ts           # i18n 번역 객체 (ko, en)
└── utils/
    └── constants/
        └── OnboardingData.ts     # 설문 문항 정의 + DB 필드 매핑
```

---

## 3. 인증 플로우

### 3.1 Microsoft OAuth
1. 로그인 화면에서 MS 로그인 팝업 오픈 → Azure 백엔드 OAuth 엔드포인트
2. 콜백 URL: `{origin}/auth/callback`
3. 성공 시 `MS_LOGIN_SUCCESS` postMessage → 부모 창에서 수신
4. `/auth/me` 호출하여 `shop_id` 획득 → localStorage 저장
5. 즉시 OneDrive 동기화 트리거 (`/onedrive/sync-photos` POST)

### 3.2 Instagram OAuth
1. Instagram OAuth 팝업 오픈 (scope: `instagram_business_basic`, `instagram_business_content_publish` 등)
2. 콜백에서 `code` 파라미터 감지 → 백엔드 `/auth/instagram`에 POST
3. `INSTA_LOGIN_SUCCESS` postMessage → 부모 창에서 수신

### 3.3 세션 관리
- 토큰: httpOnly 쿠키 (서버 사이드, JS 접근 불가)
- Axios: `withCredentials: true` 설정으로 크로스 오리진 쿠키 포함
- 클라이언트 상태: `localStorage`에 `isLoggedIn`, `shop_id`, `language` 저장

---

## 4. 백엔드 API 엔드포인트

| 엔드포인트 | 메서드 | 용도 |
|-----------|--------|------|
| `/auth/me` | GET | 인증된 사용자의 shop_id 조회 |
| `/onedrive/sync-photos` | POST | OneDrive 사진 동기화 트리거 |
| `/agent/posts/{shop_id}` | GET | 대시보드용 전체 게시물 조회 |
| `/agent/post/detail/{post_id}` | GET | 게시물 상세 조회 |
| `/agent/save` | POST | 게시물 초안 저장 |
| `/agent/review` | POST | 게시물 검토/업로드 (ok/edit/cancel) |
| `/agent/run` | POST | AI 에이전트 게시물 생성 트리거 |
| `/photos/all/{shop_id}` | GET | 전체 사진 조회 |
| `/photos/albums/{shop_id}` | GET/POST | 앨범 목록 조회 / 생성 |
| `/photos/albums/{shop_id}/{album_id}` | GET/POST/DELETE | 앨범 상세 조회/수정/삭제 |
| `/photos/{shop_id}/{photo_id}` | DELETE | 사진 삭제 |
| `/onboarding/{shop_id}` | GET/POST | 온보딩 설정 조회/저장 |
| `/custom_chat/manual_chat` | POST | AI 채팅 (캡션 생성) |

---

## 5. 핵심 기능 상세

### 5.1 AI 게시물 생성 파이프라인 (`/preview`)

**워크플로우:**
1. 사용자가 채팅으로 원하는 게시물 스타일 요청
2. `/custom_chat/manual_chat`에 `{ shop_id, message, photo_ids }` POST
3. 백엔드가 스트리밍 JSON 응답으로 캡션, 해시태그, CTA 반환
4. 사진 선택 모달 (2단계: 앨범 목록 → 앨범 내 사진 선택)
5. 사진 순서 재배치 (상하 화살표)
6. 캡션 수동 편집 가능 (자동 확장 textarea)
7. "인스타그램 업로드" → `/agent/save` (초안 저장) → `/agent/review` (action="ok", 게시)

**스트리밍 응답 처리:**
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
while (!done) {
  const { value, done } = await reader.read();
  const chunk = decoder.decode(value, { stream: true });
  // 실시간 UI 업데이트
}
```

### 5.2 OneDrive 동기화

**메커니즘:**
1. MS 로그인 성공 직후 `/onedrive/sync-photos` POST로 동기화 시작
2. Next.js API 라우트 (`/api/sync-onedrive`)가 백엔드로 프록시 (인증 쿠키 전달)
3. `PhotoSyncProgress` 컴포넌트가 5초 간격으로 상태 폴링
4. 상태: `idle` → `running` (진행률 표시) → `done` (완료 후 즐겨찾기 사진 선택 모달)

**폴링 응답:**
```typescript
{
  shop_id: string,
  status: 'idle' | 'running' | 'done' | 'error',
  total_scanned: number,
  stage1_passed: number,
  stage2_passed: number,
  message: string
}
```

### 5.3 온보딩 설문 (20문항)

**PERSONAL 설정 (1~10번):**
1. 브랜드 톤/분위기 (다중선택: 남성적/클래식, 트렌디, 친근함, 프리미엄, 미니멀, 빈티지)
2. 선호 시술 (다중선택: 페이드컷, 슬릭백, 사이드파트, 수염정리, 가르마펌, 아이론펌)
3. 피해야 할 사진 유형 (다중선택)
4. 해시태그 스타일 (다중선택)
5. CTA 문구 (텍스트)
6. 매장 소개 (텍스트)
7. 금지 단어 (쉼표 구분 텍스트)
8. RAG 참고 - 반응 좋았던 게시물 URL/내용 (텍스트)
9. 매장 위치/도시 (텍스트)

**APP 설정 (11~14번):**
11. 자동 업로드 활성화 (예/아니오)
12. 알림 이메일 (텍스트)
13. 업로드 스케줄 - 빈도 & 시간 (SCHEDULE 타입)

**백엔드 전송 형식:**
```typescript
{
  brand_tone: string[],
  preferred_styles: string[],
  exclude_conditions: string[],
  hashtag_style: string[],
  cta: string | null,
  shop_intro: string | null,
  forbidden_words: string[],
  rag_reference: string | null,
  city: string | null,
  insta_auto_upload_yn: 'Y' | 'N',
  owner_email: string | null,
  insta_upload_time_slot: string,
  insta_upload_time: string,
  language: 'ko' | 'en',
  is_ms_connected: boolean,
  is_insta_connected: boolean
}
```

### 5.4 다국어 지원 (i18n)

- **훅:** `useTranslation()` → `{ t, lang }` 반환
- **저장소:** `localStorage.language` ('ko' | 'en')
- **번역 파일:** `src/locales/translations.ts` - 페이지/컴포넌트별 키 구조
- **설정 시점:** 로그인 화면 1단계 (언어 선택) 또는 설정 페이지

### 5.5 튜토리얼

- React Joyride 기반 인터랙티브 가이드
- 대시보드 첫 방문 시 1회만 표시 (`localStorage.has_seen_tutorial`)
- 단계: 대시보드 → 게시물 생성 → 전체 사진 → 마이앨범 → 설정

---

## 6. 상태 관리

외부 상태 관리 라이브러리 없이 다음 방식으로 상태 관리:

| 상태 | 방식 | 용도 |
|------|------|------|
| 컴포넌트 상태 | `useState` | UI 인터랙션, 폼 입력 |
| 영속 상태 | `localStorage` | shop_id, language, isLoggedIn, sync_done, has_seen_tutorial |
| OAuth 통신 | `window.postMessage` | 팝업 ↔ 부모 창 메시지 전달 |
| 서버 데이터 | `useEffect` + `fetch` | API 호출 후 상태 업데이트 |

---

## 7. 빌드 및 배포

### 7.1 Next.js 설정 (`next.config.ts`)
```typescript
{
  output: "standalone",  // Azure 배포용 독립 빌드
  images: {
    remotePatterns: [
      'graph.facebook.com',
      '*.cdninstagram.com',
      '*.fbcdn.net'
    ]
  }
}
```

### 7.2 CI/CD (GitHub Actions)
- **트리거:** `main` 브랜치 push 또는 수동 실행
- **빌드:** Node.js 22.x → `npm ci` → `npm run build` → 아티팩트 업로드
- **배포:** Azure Web App `bybaek-frontend` 프로덕션 슬롯
- **시크릿:** `AZUREAPPSERVICE_PUBLISHPROFILE`, `NEXT_PUBLIC_INSTAGRAM_CLIENT_ID`

### 7.3 로컬 개발
```bash
npm install
npm run dev        # localhost:3000
# 백엔드: localhost:8000/api (.env.local)
```

---

## 8. 주요 디자인 패턴

### 8.1 SSR/CSR 하이드레이션 방지
```typescript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => { setIsMounted(true); }, []);
if (!isMounted) return null;
```

### 8.2 커스텀 Alert 모달
`window.alert()` 대신 스타일된 모달 사용:
```typescript
{ isOpen: boolean, message: string, type: 'ALERT' | 'CONFIRM', onConfirm: () => void }
```

### 8.3 2단계 모달 네비게이션
앨범 → 사진 선택 시 모달 내에서 뷰 전환 (앨범 목록 → 앨범 내 사진)

### 8.4 Textarea 자동 확장
```typescript
target.style.height = 'auto';
target.style.height = target.scrollHeight + 'px';
```

---

## 9. 외부 서비스 연동

| 서비스 | 용도 | 연동 방식 |
|--------|------|-----------|
| Microsoft Azure AD | 사용자 인증 | OAuth 2.0 (백엔드 프록시) |
| Instagram Graph API | 게시물 업로드 | OAuth 2.0 + 백엔드 에이전트 |
| OneDrive | 사진 저장소 동기화 | MS 인증 쿠키 기반 백엔드 API |
| OpenAI (GPT) | 캡션/해시태그 생성 | 백엔드 `/custom_chat/manual_chat` |

---

## 10. 보안

- **인증:** httpOnly 쿠키 (JS 접근 불가), Azure App Service 인증
- **CORS:** `withCredentials: true`로 크로스 오리진 쿠키 전달
- **XSS 방지:** Next.js 기본 이스케이핑, 사용자 텍스트는 `<pre>` + `whitespace-pre-wrap`
- **환경변수:** `NEXT_PUBLIC_*` 접두사만 브라우저 노출, 시크릿은 GitHub Actions에서 관리

---

## 11. UI/UX

- **테마 컬러:** `#8A0020` (다크 레드)
- **폰트:** Noto Sans KR (Google Fonts)
- **반응형:** Tailwind 브레이크포인트 (sm, md, lg, xl)
- **사이드바:** 접기/펼치기 (220px ↔ 70px)
- **TypeScript 경로 별칭:** `@/*` → `./src/*`
