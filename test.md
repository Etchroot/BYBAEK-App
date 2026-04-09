# BYBAEK Frontend App - 잠재적 버그 분석 보고서

**분석 일시:** 2026-04-07
**분석 대상:** `src/` 전체 (app, api, components, hooks, utils)

---

## HIGH 심각도

### 1. localStorage SSR 가드 없음 — `src/app/page.tsx:14`
- `localStorage.getItem('isLoggedIn')` 호출 시 `window` 존재 여부 미확인
- 서버사이드 렌더링 시 오류 발생 가능
- **수정:** `typeof window !== 'undefined'` 조건 추가
- ✅ **수정 완료 (2026-04-09):** `handleStartClick` 시작부에 `if (typeof window === 'undefined') return;` 추가

### 2. 스트리밍 응답 미처리 — `src/app/preview/page.tsx:272-288`
- `response.body?.getReader()` 가 undefined일 경우 while 루프 미실행 → 캡션 미설정
- **수정:** reader가 undefined인 경우 명시적 에러 처리 필요
- ✅ **수정 완료 (2026-04-09):** reader undefined 시 `throw new Error(...)` 처리, `while (reader)` → `while (true)` 로 변경

### 3. JSON 파싱 후 타입 미검증 — `src/app/preview/page.tsx:292`
- `parsed.hashtags.join(" ")` 호출 시 `hashtags`가 배열이 아닐 경우 TypeError 발생
- **수정:** `Array.isArray(parsed.hashtags)` 검증 추가
- ✅ **수정 완료 (2026-04-09):** `Array.isArray(parsed.hashtags)` 체크 후 배열이면 join, 아니면 문자열 직접 사용

### 4. 문자열 분리 시 형식 미검증 — `src/app/setting/page.tsx:128-130`
- `data.insta_upload_time.split(' ')` → 공백 없는 형식이면 잘못된 구조분해 할당
- **수정:** split 결과 길이 검증 후 사용
- ✅ **수정 완료 (2026-04-09):** `parts.length === 2` 및 `timeParts.length === 2` 이중 검증 후 setHour/setMinute/setAmPm 호출

### 5. 보안: PostMessage wildcard origin — `src/utils/oauth.ts:48`
- `window.opener.postMessage('INSTA_LOGIN_SUCCESS', '*')` — 모든 오리진에서 인증 메시지 수신 가능
- **수정:** `'*'` → 명시적 허용 오리진으로 변경
- ✅ **수정 완료 (2026-04-09):** `auth/callback/page.tsx`의 MS/Instagram 두 곳 모두 `'*'` → `window.location.origin`으로 변경

---

## MEDIUM 심각도

### 6. 배열 인덱스 범위 미검증 — `src/app/photos/page.tsx:93`
- `photos[idx].id` — selectedIndexes가 배열 범위 초과 시 undefined 접근
- **수정:** 인덱스 유효성 검증 후 접근
- ✅ **수정 완료 (2026-04-09):** `.map()` 전에 `.filter((idx) => idx >= 0 && idx < photos.length)` 추가

### 7. localStorage try-catch 없음 — dashboard, photos, album 페이지
- 시크릿 브라우징 또는 쿼터 초과 시 `localStorage.getItem()` throw 가능
- **수정:** try-catch로 감싸거나 유틸 함수 통일
- ✅ **수정 완료 (2026-04-09):** dashboard/photos/album 3곳 try-catch 추가. 모바일 앱(Capacitor)에서는 거의 발생하지 않으나 안전망 확보.

### 8. useEffect 의존성 배열 이슈 — `src/hooks/useTranslation.ts:28`
- `[lang]` 의존성으로 lang 변경 시마다 localStorage 재동기화 → 불필요한 리렌더링 유발
- ✅ **수정 완료 (2026-04-09):** `[lang]` → `[]` 변경. useState 초기화 시 이미 localStorage를 읽으므로 마운트 후 1회 실행으로 충분.

### 9. API 응답 구조 신뢰 — `src/app/preview/page.tsx:80-81`
- `albumRes.data.albums || albumRes.data || []` — 백엔드 스펙 변경 시 잘못된 타입 사용
- **수정:** 타입 가드 또는 런타임 검증 추가
- ✅ **수정 완료 (2026-04-09):** `Array.isArray()` 런타임 검증으로 교체. 배열이 아니면 `[]` 폴백.

### 10. 조건부 렌더링 누락 — `src/app/dashboard/page.tsx:123-124`
- `post.updated_at || post.created_at` 둘 다 undefined 시 `formatDate(undefined)` 호출
- ℹ️ **수정 불필요:** `formatDate`가 이미 `if (!dateString) return "날짜 없음"` 처리 중.

### 11. 이벤트 리스너 메모리 누수 위험 — `src/utils/oauth.ts:92-93`
- cleanup은 존재하나 컴포넌트 재마운트 시 중복 리스너 등록 가능
- ℹ️ **수정 불필요:** cleanup 함수 반환이 올바른 React 패턴으로 구현되어 있음. 언마운트 시 제거 보장.

---

## LOW 심각도

### 12. as any 타입 캐스팅 — `src/components/OnboardingSurvey.tsx:276`
- `(t.setting.freq_map as any)[f]` — 타입 안전성 우회
- ✅ **수정 완료 (2026-04-09):** `as any` → `as Record<string, string>` 으로 교체

### 13. 에러 콘솔 로깅만, UI 미반영 — oauth.ts, photos/page.tsx, AlbumDetailModal.tsx
- catch 블록에서 console.error만 하고 사용자에게 피드백 없음
- ⚠️ **미수정 (웹 버전 참고용):** 모바일 앱에서 콘솔 로그가 사용자에게 보이지 않음. 웹 버전 리팩토링 시 주요 catch 블록에 사용자 피드백 UI(toast/alert) 추가 권고.

### 14. 매직 스트링 — 다수 파일
- `'ko'`, `'en'` 언어 코드가 상수화 없이 여러 곳에 하드코딩
- ⚠️ **미수정:** 대규모 리팩토링 필요. 동작에 영향 없어 스킵. 웹 버전 작업 시 `LANG = { KO: 'ko', EN: 'en' }` 상수 파일 생성 권고.

---

## 요약

| 심각도 | 전체 | 수정 완료 | 미수정/불필요 |
|--------|------|-----------|--------------|
| HIGH (보안 포함) | 5건 | ✅ 5건 | 0건 |
| MEDIUM | 6건 | ✅ 4건 | 2건 (수정불필요) |
| LOW | 3건 | ✅ 1건 | 2건 (스킵) |
| **합계** | **14건** | **10건** | **4건** |

---

## 우선 수정 권고 순서

1. `PostMessage` 오리진 검증 (보안) — ✅ 완료
2. 스트리밍 응답 핸들링 보강 (`preview/page.tsx`) — ✅ 완료
3. JSON 파싱 후 타입 검증 (`hashtags`) — ✅ 완료
4. `localStorage` 전체 try-catch 통일 — 미완료 (MEDIUM)
5. 배열/문자열 접근 전 유효성 검증 — ✅ 완료 (setting split 검증)

---

## 수정 이력

### HIGH + MEDIUM + LOW 수정 (2026-04-09) — 모바일 앱(Capacitor) 기준 적용

| # | 파일 | 수정 내용 |
|---|------|-----------|
| 1 | `src/app/page.tsx` | `handleStartClick`에 `typeof window === 'undefined'` SSR 가드 추가 |
| 2 | `src/app/preview/page.tsx` | streaming reader undefined 시 명시적 throw, while 조건 수정 |
| 3 | `src/app/preview/page.tsx` | `Array.isArray(parsed.hashtags)` 타입 검증 추가 |
| 4 | `src/app/setting/page.tsx` | `insta_upload_time` split 결과 길이 이중 검증 |
| 5 | `src/app/auth/callback/page.tsx` | postMessage wildcard `'*'` → `window.location.origin` 2곳 |

| 6 | `src/app/photos/page.tsx` | selectedIndexes 범위 초과 방지 — `.filter()` 추가 |
| 7 | `src/app/dashboard/page.tsx` | localStorage try-catch 추가 |
| 7 | `src/app/photos/page.tsx` | localStorage try-catch 추가 |
| 7 | `src/app/album/page.tsx` | localStorage try-catch 추가 |
| 8 | `src/hooks/useTranslation.ts` | useEffect 의존성 `[lang]` → `[]` 변경 |
| 9 | `src/app/preview/page.tsx` | albums API 응답 `Array.isArray()` 검증 |
| 12 | `src/components/OnboardingSurvey.tsx` | `as any` → `as Record<string, string>` |

> **웹 버전 반영 시 참고:**
> - #5 postMessage origin: `window.location.origin` 사용 (웹도 동일 적용 가능)
> - #13 에러 피드백: 주요 catch 블록에 toast/alert UI 추가 권고
> - #14 매직 스트링: `LANG` 상수 파일 생성 후 일괄 교체 권고
