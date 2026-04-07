# BYBAEK Frontend - 작업 현황 (Task Tracker)

> 기능별 작업 완료 현황을 추적합니다. 각 항목은 git 커밋 이력 기반으로 정리되었습니다.

---

## 1. 프로젝트 초기 설정

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| Next.js 프로젝트 생성 | ✅ 완료 | `7b819b4` Initial commit from Create Next App |
| src 폴더 구조 설정 | ✅ 완료 | `2e1279f` [INIT] Add src folder structure |
| 프로젝트 README 작성 | ✅ 완료 | `852a87c` [DOCS] Add project README |
| TypeScript 경로 별칭 (@/*) 설정 | ✅ 완료 | 초기 설정 시 포함 |
| Tailwind CSS 4 + PostCSS 설정 | ✅ 완료 | 초기 설정 시 포함 |

---

## 2. CI/CD 및 배포

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| Azure App Service 워크플로우 구성 | ✅ 완료 | `32cddb0` Add Azure deployment workflow |
| standalone 빌드 설정 | ✅ 완료 | `2a705ba` [add] standalone deploy |
| GitHub Actions 리팩터링 | ✅ 완료 | `55f0d42` ~ `23aae37` 다수 커밋 |
| 백엔드 프로덕션 URL 설정 | ✅ 완료 | `9aafcbc` [CHORE] Update backend API endpoint |
| NEXT_PUBLIC_INSTAGRAM_CLIENT_ID 환경변수 추가 | ✅ 완료 | `0a97c14` [Deploy] add NEXT_PUBLIC_INSTAGRAM_CLIENT_ID |

---

## 3. 인증 (Authentication)

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| Microsoft 로그인 화면 구현 | ✅ 완료 | `8841db4` [FEAT] Integrate Microsoft login screen |
| Microsoft 로그인 서버 연동 | ✅ 완료 | `e864462` [FEAT] Enhance Microsoft login server integration |
| Instagram 로그인 연동 | ✅ 완료 | `a65514f` [FEAT] Integrate Instagram login |
| OAuth 콜백 핸들러 구현 | ✅ 완료 | `5da8fc3` [Refactor] AuthCallback to use URLSearchParams |
| Instagram auth callback 및 이미지 도메인 처리 | ✅ 완료 | `7cb6611` [FEAT] Add Instagram auth callback |
| withCredentials 설정 및 하이드레이션 에러 수정 | ✅ 완료 | `6b2a970` [FIX] Add withCredentials and fix hydration |
| MS/Instagram 로그인 통합 버그 수정 | ✅ 완료 | `7498ef4` [FIX] Fix Microsoft and Instagram login integration |
| MS OAuth 플로우 구현 | ✅ 완료 | `97026fd` [FEAT] implement MS auth flow |
| Easy Auth 세션 준비 대기 (1s delay) | ✅ 완료 | `7083104` [FIX] Add 1s delay before OneDrive sync |
| Instagram client_id/user_id 키 수정 (새 Meta 앱) | ✅ 완료 | `d76502f` [FIX] Fix instagram client_id and user_id key |
| 계정 미연결 시 경고 모달 추가 | ✅ 완료 | `2f0fe6f` [FEAT] Add warning modal when account is not linked |

---

## 4. 로그인 화면

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 4단계 로그인 플로우 (언어→MS→OneDrive QR→Instagram) | ✅ 완료 | 다수 커밋 |
| QR 코드 기능 추가 (OneDrive 설정 안내) | ✅ 완료 | `89f5b25` [FEAT] Add QR code feature |
| 랜딩 페이지 업데이트 | ✅ 완료 | `7ada552` [REFACTOR] Update landing page |

---

## 5. 온보딩

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 온보딩 소개 페이지 구현 | ✅ 완료 | `8dfb298` [FEAT] Add onboarding intro page |
| 20문항 설문 폼 구현 | ✅ 완료 | `a735169` [FEAT] fix onboarding survey data synchronization |
| 설문 필드 매핑 수정 | ✅ 완료 | `3a6188c` [FIX] onboarding survey field mapping |
| QUESTION_FIELD_MAP 수정 | ✅ 완료 | `32602c4` [FIX] QUESTION_FIELD_MAP |
| OnboardingSurvey 로직 복원 | ✅ 완료 | `dade55c` [REVERT] Implement OnboardingSurvey logic |
| fetch → apiClient 리팩터링 | ✅ 완료 | `0c7be22` [REFACTOR] replace fetch with apiClient |
| 온보딩 에러 수정 | ✅ 완료 | `22db6bc` [FIX] Fix onboarding errors |
| 온보딩 화면 버그 수정 | ✅ 완료 | `604658a` [fix] onboardingScreen bug fit |

---

## 6. 대시보드

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 대시보드 메인 화면 구현 (게시물 목록) | ✅ 완료 | 초기 구현 |
| PostCard 컴포넌트 구현 | ✅ 완료 | `35f47ba` [FEAT] refactor data fetching and update PostCard types |
| 홈 버튼 인터랙션 추가 | ✅ 완료 | `de56be3` [FEAT] Add interaction to home button |
| 게시물 레이아웃 늘어남 수정 | ✅ 완료 | `8adc032` [FIX] Fix post layout stretching issue |

---

## 7. AI 게시물 생성 (Preview)

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| GPT 기반 채팅봇 게시물 생성 구현 | ✅ 완료 | `0f332e8` [FEAT] Implement GPT-powered chatbot for post creation |
| 사진 선택 기능 (수동 게시물 생성 화면) | ✅ 완료 | `96beae4` [FEAT] Implement photo selection in manual post creation |
| 사진 선택 로직 업데이트 | ✅ 완료 | `1777c60` [REFACTOR] Update photo selection logic on preview page |
| Instagram 업로드 버튼 → 백엔드 연결 | ✅ 완료 | `540c1c8` [FEAT] Connect Instagram upload button to backend /save |
| 자동 업로드 게시물 편집 모달 | ✅ 완료 | `7595fa0` [FEAT] Add auto-upload post edit modal |
| 게시물 입력 필드 자동 리사이즈 수정 | ✅ 완료 | `db4ac44` [FIX] Fix auto-resize behavior of post input field |
| handleUpload 수정 | ✅ 완료 | `809a23b` [FIX] fix handleupload |
| 앨범 API URL 및 album_name 필드 수정 | ✅ 완료 | `5e02298` [FIX] Fix album API URL and album_name field |
| API 타임아웃 60초 증가 (Instagram 업로드) | ✅ 완료 | `819f449` [FIX] Increase API timeout to 60s |
| agent.ts 추가 (게시물 파이프라인 API) | ✅ 완료 | `91dadbe` [FIX] Fix API URL and add agent.ts |

---

## 8. 게시물 상세/검토

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 게시물 상세 보기 (post/[id]) 구현 | ✅ 완료 | 초기 구현 |
| 이메일 기반 검토 인터페이스 (review) 구현 | ✅ 완료 | 초기 구현 |
| 게시물에서 수정 버튼 제거 | ✅ 완료 | `d987522` [REFACTOR] Remove edit button from post |
| 리뷰 페이지 버그 수정 | ✅ 완료 | `22db6bc` [FIX] Fix review page bug |

---

## 9. 사진 관리

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 실제 API 데이터 연동 (사진/앨범) | ✅ 완료 | `b999813` [FEAT] integrate real API data for photo and album pages |
| 사진 삭제 및 실시간 목록 갱신 | ✅ 완료 | `a402e77` [FEAT] implement photo deletion and real-time list refresh |
| 사진 추가/제거 기능 | ✅ 완료 | `5841aeb` [FEAT] add ability to add and remove photos |
| 사진 업로드 프로그래스 바 | ✅ 완료 | `df99427` [FEAT] Add photo upload progress bar |
| 즐겨찾기 사진 선택 기능 | ✅ 완료 | `341d13b` [FEAT] Add favorite photo selection feature |
| 전체 사진 화면 에러 수정 | ✅ 완료 | `441483f` [FIX] Fix errors in full photo screen |
| 전체 사진 화면 UI 개선 | ✅ 완료 | `2086572` [REFACTOR] Update full photo screen and refine UI details |

---

## 10. 앨범 관리

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 앨범 상세 오버레이 (실시간 사진 조회) | ✅ 완료 | `a88d8bc` [FEAT] implement album detail overlay |
| 새 앨범 생성 버그 수정 | ✅ 완료 | `9d3af68` [FIX] Fix issue preventing new album creation |
| 앨범 상세 화면 버튼 정리 | ✅ 완료 | `56bc8fd` [REFACTOR] Remove button from album detail screen |
| 앨범/사진 페이지 업데이트 | ✅ 완료 | `1c73c82` [REFACTOR] Update album and photos pages |
| 앨범 상태 서버 생성 ID와 동기화 | ✅ 완료 | `bb1c2b6` [FIX] sync album state with server-generated ID |
| 앨범 API URL 수정 (/album → /photos/albums) | ✅ 완료 | `9933583` [FIX] Fix album API URL |
| 앨범 페이지 버그 수정 | ✅ 완료 | `2ec9c3a` [FIX] Fix album page bug |

---

## 11. OneDrive 동기화

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| PhotoSyncProgress: 새 동기화 엔드포인트 + 자동 트리거 | ✅ 완료 | `24ed30f` [FEAT] PhotoSyncProgress: use new onedrive sync endpoints |
| Next.js 프록시 라우트 (인증 쿠키 전달) | ✅ 완료 | `c0aca1f` [FEAT] Add Next.js proxy route for OneDrive sync |
| OneDrive 동기화 인증 라우트 수정 | ✅ 완료 | `535ab74` [FEAT] Add Next.js proxy route for OneDrive sync auth |
| route.ts 사진 동기화 수정 | ✅ 완료 | `2f6df8e` fix: route.ts for photo-sync |

---

## 12. 설정 (Setting)

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 설정 편집 기능 구현 | ✅ 완료 | `5fbe516` [FEAT] setting edit functionality |
| 프롬프트 상세 설정 리팩터링 | ✅ 완료 | `66b3dcf` [REFACTOR] Refactor prompt detail settings |
| 고정 shopId 설정 제거 | ✅ 완료 | `e97e5cc` [REFACTOR] Remove fixed shopId setting |
| 언어 설정 미적용 수정 | ✅ 완료 | `05ee457` [FIX] Fix language settings not applying |
| 미저장 변경사항 처리 추가 | ✅ 완료 | `20f3acd` [FIX] Add missing unsaved changes handling |

---

## 13. 다국어 지원 (i18n)

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 다국어 지원 추가 (ko, en) | ✅ 완료 | `68d58ea` [FEAT] Add multilingual support |
| 다국어 지원 구현 및 UI/UX 개선 | ✅ 완료 | `7e05bdd` [FEAT] implement multi-language support and refine UI/UX |

---

## 14. 튜토리얼

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 튜토리얼 구현 완료 | ✅ 완료 | `1c10d57` [FEAT] Complete tutorial implementation |
| 튜토리얼 로직 리팩터링 | ✅ 완료 | `f9dc7e0` [REFACTOR] Refactor tutorial logic |
| 튜토리얼 실행 플로우 업데이트 | ✅ 완료 | `eae173d` [REFACTOR] Update tutorial execution flow |
| 튜토리얼 업데이트 | ✅ 완료 | `22db6bc` [FIX] update tutorial |

---

## 15. UI/UX 공통

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| 사이드바 네비게이션 구현 | ✅ 완료 | 초기 구현 |
| 데이터 처리 Next.js 마이그레이션 | ✅ 완료 | `7ad7522` [REFACTOR] Migrate all data handling to Next.js |
| Mock 데이터 사용 정리 | ✅ 완료 | `212b94e` [REFACTOR] Clean up mock data usage |
| favicon 추가 | ✅ 완료 | `e5c9552` ADD: add favicon.ico |

---

## 16. API 클라이언트

| 작업 | 상태 | 관련 커밋 |
|------|------|-----------|
| Axios 기반 apiClient 구축 | ✅ 완료 | 초기 구현 |
| fetch → apiClient 전환 | ✅ 완료 | `0c7be22`, `35f47ba` |
| fetch URL 수정 | ✅ 완료 | `9807e25` [FIX] fetch url |

---

## 요약

| 카테고리 | 완료 | 미완료 | 진행률 |
|----------|------|--------|--------|
| 프로젝트 초기 설정 | 5 | 0 | 100% |
| CI/CD 및 배포 | 5 | 0 | 100% |
| 인증 | 11 | 0 | 100% |
| 로그인 화면 | 3 | 0 | 100% |
| 온보딩 | 8 | 0 | 100% |
| 대시보드 | 4 | 0 | 100% |
| AI 게시물 생성 | 10 | 0 | 100% |
| 게시물 상세/검토 | 4 | 0 | 100% |
| 사진 관리 | 7 | 0 | 100% |
| 앨범 관리 | 7 | 0 | 100% |
| OneDrive 동기화 | 4 | 0 | 100% |
| 설정 | 5 | 0 | 100% |
| 다국어 지원 | 2 | 0 | 100% |
| 튜토리얼 | 4 | 0 | 100% |
| UI/UX 공통 | 4 | 0 | 100% |
| API 클라이언트 | 3 | 0 | 100% |
| 코드 리팩토링 | 18 | 0 | 100% |
| 법적 고지 문서 | 3 | 0 | 100% |
| QR 코드 개선 | 2 | 0 | 100% |
| 프로젝트 문서 정비 | 3 | 0 | 100% |
| **전체** | **112** | **0** | **100%** |

> 현재까지 커밋된 모든 기능이 완료 상태입니다. 향후 새로운 작업이 추가되면 이 문서에 기록합니다.

---

## 17. 코드 리팩토링 (2026-04-03)

| 작업 | 상태 | 대상 파일 |
|------|------|-----------|
| 미사용 변수 `postId` 제거 | ✅ 완료 | `preview/page.tsx` |
| 주석 처리된 API 코드 제거 | ✅ 완료 | `review/page.tsx` |
| console.log만 하는 onClick → 실제 핸들러 연결 | ✅ 완료 | `AlbumCard.tsx` |
| 디버깅용 console.log 제거 (login) | ✅ 완료 | `login/page.tsx` |
| 디버깅용 console.log 제거 (onboarding) | ✅ 완료 | `onboarding/page.tsx` |
| 디버깅용 console.log 제거 (setting) | ✅ 완료 | `setting/page.tsx` |
| 디버깅용 console.log 제거 (PhotoSyncProgress) | ✅ 완료 | `PhotoSyncProgress.tsx` |
| 디버깅용 console.log 제거 (MockDB) | ✅ 완료 | `MockDB.ts` |
| `any[]` → Photo/Album/Post 타입 정의 및 적용 | ✅ 완료 | `types/index.ts`, 6개 페이지 |
| `alert()` → 커스텀 모달 (PhotoSyncProgress) | ✅ 완료 | `PhotoSyncProgress.tsx` |
| `window.alert()` → 불필요 알림 제거 (AlbumDetailModal) | ✅ 완료 | `AlbumDetailModal.tsx` |
| 삭제 확인 메시지 i18n 전환 | ✅ 완료 | `photos/page.tsx` |
| 업로드 성공/실패 메시지 i18n 전환 | ✅ 완료 | `preview/page.tsx` |
| 전체 하드코딩 문자열 i18n 전환 | ✅ 완료 | `review/page.tsx` |
| "날짜 오류" i18n 전환 | ✅ 완료 | `dashboard/page.tsx` |
| 로딩/빈 상태 메시지 i18n 전환 | ✅ 완료 | `AlbumDetailModal.tsx` |
| 깨진 테스트 메뉴 항목 제거 + router.push 통일 | ✅ 완료 | `Sidebar.tsx` |
| 하드코딩 URL → apiClient.defaults.baseURL | ✅ 완료 | `preview/page.tsx` |

---

## 18. 법적 고지 문서 추가 (2026-04-03)

| 작업 | 상태 | 대상 파일 |
|------|------|-----------|
| 이용약관 HTML 파일 public 폴더로 이동 | ✅ 완료 | `public/terms.html` |
| 개인정보처리방침 HTML 파일 public 폴더로 이동 | ✅ 완료 | `public/privacy.html` |
| 설정 페이지 하단 이용약관/개인정보처리방침 버튼 및 iframe 모달 추가 | ✅ 완료 | `setting/page.tsx` |

---

## 19. OneDrive QR 코드 개선 (2026-04-03)

| 작업 | 상태 | 대상 파일 |
|------|------|-----------|
| 기존 단일 QR → Android/iOS 2개 QR로 교체 | ✅ 완료 | `login/page.tsx` |
| 각 QR 하단에 기기 레이블(Android / iOS) 표시 | ✅ 완료 | `login/page.tsx` |

---

## 20. 프로젝트 문서 정비 (2026-04-03)

| 작업 | 상태 | 대상 파일 |
|------|------|-----------|
| CLAUDE.md push 전 task.md 업데이트 규칙 추가 | ✅ 완료 | `CLAUDE.md` |
| CLAUDE.md 작업 세션 후 날짜 기입 요약 규칙 추가 | ✅ 완료 | `CLAUDE.md` |
| 리팩토링 커밋 분리 후 task.md 섹션 17 기록 | ✅ 완료 | `task.md` |
