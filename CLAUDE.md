# BYBAEK Frontend App (Mobile)

바버샵 사장님을 위한 AI 기반 인스타그램 자동 홍보 **모바일 앱**.
웹 버전(`github.com/lifeiscabaret/BYBAEK-Frontend`)을 기반으로 Capacitor를 적용해 iOS/Android 앱으로 변환한 프로젝트.

## 웹 버전과의 차이점

- **빌드 모드:** `standalone` → `export` (정적 파일 출력, 서버 불필요)
- **OAuth:** `window.open()` 팝업 → Capacitor Browser 플러그인
- **API 라우트:** Next.js `/api/*` 라우트 제거 → 백엔드 직접 호출
- **배포 타겟:** iOS App Store + Google Play Store

## 기술 스택

- **프레임워크:** Next.js 16 (App Router, static export)
- **모바일 래퍼:** Capacitor 7
- **언어:** TypeScript 5
- **스타일링:** Tailwind CSS 4 + PostCSS
- **HTTP:** Axios (withCredentials: true, timeout: 60s)
- **런타임:** Node.js 22.x
- **배포:** Azure Static Web Apps, GitHub Actions (main push → 자동 배포)

## 아키텍처

### 인증 플로우
- Microsoft OAuth → 팝업 → postMessage(`MS_LOGIN_SUCCESS`) → `/auth/me`로 shop_id 획득
- Instagram OAuth → 팝업 → 콜백에서 code를 백엔드 POST → postMessage(`INSTA_LOGIN_SUCCESS`)
- 세션: httpOnly 쿠키 (서버 관리), 클라이언트는 localStorage에 shop_id/language/isLoggedIn 저장

### 상태 관리
- 외부 라이브러리 없음 (Redux/Zustand 미사용)
- 컴포넌트: `useState`
- 영속: `localStorage` (shop_id, language, isLoggedIn, sync_done, has_seen_tutorial)
- OAuth 팝업 통신: `window.postMessage`

### 핵심 데이터 흐름
1. MS 로그인 → shop_id 획득 → OneDrive 자동 동기화 트리거
2. 사진 동기화 완료 → 즐겨찾기 선택 → 대시보드 진입
3. 게시물 생성: 채팅 요청 → AI 캡션 생성(스트리밍) → 사진 선택 → 저장/업로드
4. 설정: 온보딩 20문항으로 브랜드 톤, 해시태그 스타일, 업로드 스케줄 등 개인화

### API 클라이언트
- `src/api/index.ts`: Axios 인스턴스 (baseURL은 Azure 백엔드)
- `src/api/agent.ts`: AI 에이전트 파이프라인 전용 API 함수
- 모든 요청에 `withCredentials: true` (쿠키 기반 인증)

### 다국어 (i18n)
- `useTranslation()` 훅 → `{ t, lang }` 반환
- `localStorage.language`에서 'ko' | 'en' 읽음
- 번역 키: `src/locales/translations.ts` (페이지/컴포넌트별 네스팅 구조)

### OneDrive 동기화
- MS 로그인 직후 자동 트리거
- Next.js API 라우트(`/api/sync-onedrive`)가 백엔드로 프록시 (인증 쿠키 전달)
- `PhotoSyncProgress` 컴포넌트가 5초 간격 폴링으로 진행률 표시

## 라우트 구조

```
/                  → 랜딩 (로그인 여부에 따라 dashboard 또는 login으로 분기)
/login             → 4단계 로그인 (언어 선택 → MS → OneDrive QR → Instagram)
/auth/callback     → OAuth 콜백 핸들러 (MS + Instagram 분기)
/onboarding/intro  → 온보딩 소개
/onboarding        → 20문항 설문
/dashboard         → 메인 (게시물 목록 + 새 글 생성)
/preview           → AI 게시물 생성 (채팅 + 사진 선택 + 캡션 편집)
/review            → 이메일 기반 게시물 검토
/post/[id]         → 게시물 상세
/photos            → 전체 사진 브라우저
/album             → 앨범 관리
/setting           → 설정 (개인화, 계정 연결, 업로드 스케줄)
```

## 주요 패턴

### SSR 하이드레이션 방지
localStorage 접근이 필요한 모든 페이지에서 `isMounted` 패턴 사용:
```tsx
const [isMounted, setIsMounted] = useState(false);
useEffect(() => { setIsMounted(true); }, []);
if (!isMounted) return null;
```

### 스트리밍 응답 처리
AI 채팅 응답은 ReadableStream으로 수신:
```tsx
const reader = response.body?.getReader();
const decoder = new TextDecoder();
while (!done) {
  const { value, done } = await reader.read();
  const chunk = decoder.decode(value, { stream: true });
}
```

### 커스텀 Alert
`window.alert()` 대신 모달 상태 객체 사용:
```tsx
{ isOpen: boolean, message: string, type: 'ALERT' | 'CONFIRM', onConfirm: () => void }
```

### 2단계 모달
사진 선택 시 앨범 목록 → 앨범 내 사진 순으로 모달 내 뷰 전환

## 빌드 & 실행

```bash
npm install
npm run dev          # localhost:3000 (백엔드: localhost:8000)
npm run build        # standalone 빌드 → Azure 배포
```

## 외부 서비스

| 서비스 | 용도 |
|--------|------|
| Azure AD | 사용자 인증 (MS OAuth) |
| Instagram Graph API | 게시물 업로드 |
| OneDrive | 사진 저장소 동기화 |
| OpenAI GPT | 캡션/해시태그 생성 (백엔드 경유) |

## 테마

- 메인 컬러: `#8A0020` (다크 레드)
- 폰트: Noto Sans KR
- 사이드바: 접기/펼치기 (220px ↔ 70px)

## 프로젝트 문서

- `trd.md`: 기술 상세 설명서 (API 엔드포인트, 온보딩 데이터 형식, 컴포넌트 상세 등)
- `task.md`: 기능별 작업 현황 추적

## APK 빌드 & GitHub Release 규칙

**"빌드해줘" 또는 "빌드하고 릴리스해" 라고 요청받을 때만 아래 절차를 따른다. 명시적 요청 없이는 버전을 절대 올리지 않는다.**

### APK 빌드 절차 (터미널 자동화)
1. `build-version.txt` 현재 버전 읽기 (예: `0.01`)
2. 버전 0.01 단위 증가 (예: `0.01` → `0.02`), `build-version.txt` 업데이트
3. Next.js 빌드 + Capacitor sync:
   ```bash
   npm run build:app
   ```
4. Gradle로 APK 빌드 (Java 17+ 필요 — Android Studio 번들 JDK 사용):
   ```bash
   cd android
   JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ./gradlew assembleDebug
   cd ..
   ```
   - 출력 경로: `android/app/build/outputs/apk/debug/app-debug.apk`
5. APK를 버전명으로 복사:
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk \
      android/app/build/outputs/apk/debug/app-debug-version{NEW_VERSION}.apk
   ```
6. `build-version.txt` 커밋 + 푸시 후 GitHub Release 생성 (Python API 사용):
   ```python
   # GitHub API로 릴리스 생성 후 APK 업로드
   # TOKEN: git credential manager에서 획득
   # REPO: Etchroot/BYBAEK-Frontend-App
   ```

### APK 파일 위치
- `android/app/build/outputs/apk/debug/app-debug.apk` — 최신 빌드
- `android/app/build/outputs/apk/debug/app-debug-version{X.XX}.apk` — 버전별 보관본
- `build-version.txt` — 현재 릴리스된 최신 버전 번호

## 작업 규칙

### task.md 업데이트 규칙 (필수)

**코드 변경이 있는 모든 커밋 전에 반드시 task.md를 먼저 업데이트해야 한다.**
기능 추가, 수정, 삭제, 버그 수정, 설정 변경 등 어떤 종류든 코드 변경이 있으면 예외 없이 적용.

**업데이트 절차:**
1. `task.md` 하단에 아래 형식으로 새 섹션 추가
2. 요약 테이블(상단)의 완료 수와 전체 수 업데이트
3. task.md 업데이트 후 → git add → git commit 순서 준수

```
## [섹션번호]. [작업명] (YYYY-MM-DD)

| 작업 | 상태 | 대상 파일 |
|------|------|-----------|
| 작업 내용 | ✅ 완료 | `파일명` |
```

**⚠️ task.md 업데이트 없이 커밋/푸시 금지. 위반 시 즉시 task.md 업데이트 후 재커밋.**
