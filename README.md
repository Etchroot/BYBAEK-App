# BYBAEK — Frontend

> 바버샵 AI 마케팅 자동화 에이전트 — Next.js 프론트엔드

---

## Tech Stack

| 구분 | 기술 |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP 클라이언트 | Axios |
| 런타임 | Node.js 22.x |
| 배포 | Azure Static Web Apps |

---

## 역할 분담

| 팀원 | 담당 폴더 | 주요 작업 |
|---|---|---|
| 명근 (Frontend) | `src/app/`, `src/components/`, `src/hooks/` | 전체 화면 구현, Blob/Cosmos 연결 |

---

## 폴더 구조

```
bybaek-frontend/
├── src/
│   ├── app/                       # Next.js App Router 페이지
│   │   ├── layout.tsx             # 공통 레이아웃
│   │   ├── page.tsx               # 루트 → 로그인 리다이렉트
│   │   ├── login/page.tsx         # MS 로그인 화면
│   │   ├── onboarding/page.tsx    # 스무고개 온보딩
│   │   ├── dashboard/page.tsx     # 메인 대시보드
│   │   ├── preview/page.tsx       # 게시물 미리보기/검토
│   │   └── schedule/page.tsx      # 업로드 스케줄 설정
│   ├── components/                # 재사용 UI 컴포넌트
│   ├── hooks/                     # 커스텀 React Hooks
│   ├── api/
│   │   ├── index.ts               # axios 기본 설정
│   │   ├── agent.ts               # 게시물 생성 API
│   │   ├── onboarding.ts          # 온보딩 API
│   │   ├── instagram.ts           # 업로드 API
│   │   └── schedule.ts            # 스케줄 API
│   └── utils/
│       └── constants/             # API URL 등 상수
└── public/                        # 정적 파일
```

---

## 로컬 세팅 방법

### 0. Node.js 버전 확인 (22.x 고정)

```bash
node --version  # v22.x.x 이어야 함
```

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

---

## 백엔드 연동

모든 API 요청은 `src/api/` 폴더에서 관리.
백엔드 로컬 서버(`http://localhost:8000`)가 먼저 실행되어 있어야 함.

```typescript
// src/api/index.ts - axios 기본 설정
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
});

export default apiClient;
```

---

## 주요 화면

| 화면 | URL | 설명 |
|---|---|---|
| 로그인 | `/login` | MS OAuth 2.0 로그인 |
| 온보딩 | `/onboarding` | 스무고개 + 레퍼런스 사진 업로드 |
| 대시보드 | `/dashboard` | 메인 화면, 게시물 생성 트리거 |
| 미리보기 | `/preview` | AI 생성 게시물 검토 (OK/수정/취소) |
| 스케줄 | `/schedule` | 업로드 시간/빈도 설정 |

---

## Branch 전략

```
main     → 최종 배포 (직접 push 금지, PR만)
dev      → 개발 통합 (모든 feature는 여기로 PR)
feature/ → 개인 작업 브랜치
```

작업 시작 전 반드시:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/내작업이름
```

---

## Commit Message Convention

| Type | 설명 |
|---|---|
| `[FEAT]` | 새 기능 추가 |
| `[FIX]` | 버그 수정 |
| `[REFACTOR]` | 리팩토링 |
| `[DOCS]` | 문서 수정 |
| `[STYLE]` | 스타일/포맷 변경 |
| `[CHORE]` | 설정/패키지 변경 |

예시:
```
[FEAT] Add dashboard screen with post generation trigger
[FIX] Fix preview image not loading from blob URL
[STYLE] Update onboarding UI layout
```

---

## 주의사항

- `.env.local` 파일 절대 GitHub에 올리지 않기
- `node_modules/` 절대 GitHub에 올리지 않기
- API 키는 반드시 팀 채널을 통해서만 공유
- 작업 시작 전 항상 `git pull origin dev` 먼저
- `main` 브랜치에 직접 push 금지
- PR은 최소 1명 리뷰 후 merge
