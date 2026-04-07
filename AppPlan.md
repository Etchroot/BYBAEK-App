# BYBAEK 웹 → Capacitor 모바일 앱 전환 계획

## Context
BYBAEK은 현재 Next.js 16 웹앱으로, 바버샵 사장님을 위한 AI 인스타그램 자동 홍보 서비스.
이를 Capacitor 7로 감싸 Android/iOS 앱으로 제공하려 함. 웹 버전은 그대로 유지.
Mac이 없으므로 Android 빌드 우선, iOS는 설정만 포함.

---

## Phase 1: Static Export 전환

Capacitor는 로컬 HTML/JS/CSS를 WebView에서 실행하므로 Node.js 서버가 없음. `standalone` → `export`로 변경 필수.

| 작업 | 파일 | 내용 |
|------|------|------|
| output 모드 변경 | `next.config.ts` | `output: "export"`, `images.unoptimized: true` 추가 |
| API 라우트 제거 | `src/app/api/sync-onedrive/route.ts` | 삭제 (static export에서 API route 불가) |
| 백엔드 직접 호출 | `src/components/PhotoSyncProgress.tsx` | `fetch('/api/...')` → `apiClient.post/get(...)` 변경 |
| 빌드 검증 | - | `npm run build` → `out/` 디렉토리 생성 확인 |

**주의:** `next/image`는 `unoptimized: true`로 자동으로 일반 `<img>`로 렌더링되므로 코드 변경 불필요.

---

## Phase 2: Capacitor 설치 및 설정

| 작업 | 명령어 / 파일 |
|------|---------------|
| Core 설치 | `npm install @capacitor/core @capacitor/cli` |
| 초기화 | `npx cap init "BYBAEK" "com.bybaek.app" --web-dir out` |
| Browser 플러그인 | `npm install @capacitor/browser` |
| App 플러그인 (딥링크) | `npm install @capacitor/app` |
| Android 플랫폼 추가 | `npx cap add android` |
| iOS 플랫폼 추가 | `npx cap add ios` |

**capacitor.config.ts 주요 설정:**
```ts
{
  appId: 'com.bybaek.app',
  appName: 'BYBAEK',
  webDir: 'out',
  server: { androidScheme: 'https' }  // 쿠키/CORS 정상 동작 보장
}
```

**package.json 스크립트 추가:**
```json
"build:app": "next build && npx cap sync",
"cap:open:android": "npx cap open android",
"cap:open:ios": "npx cap open ios"
```

**.gitignore 추가:**
```
android/app/build/
ios/App/Pods/
```

---

## Phase 3: 플랫폼 감지 유틸리티

**새 파일:** `src/utils/platform.ts`

```ts
import { Capacitor } from '@capacitor/core';
export const isNative = () => Capacitor.isNativePlatform();
export const isWeb = () => Capacitor.getPlatform() === 'web';
```

웹/앱에서 같은 코드베이스를 공유하면서 OAuth 등에서 분기할 때 사용.

---

## Phase 4: OAuth 플로우 전환 (핵심)

현재 웹: `window.open()` → 팝업에서 OAuth → `postMessage`로 부모 윈도우에 통보
앱 목표: Capacitor Browser → OAuth → 딥링크(`com.bybaek.app://auth/callback`)로 복귀

### 4.1 OAuth 헬퍼 생성

**새 파일:** `src/utils/oauth.ts`
- `openOAuthPopup(url)`: 네이티브면 Browser.open(), 웹이면 window.open()
- `listenForOAuthCallback(cb)`: 네이티브면 App.addListener('appUrlOpen'), 웹이면 postMessage 리스너
- `getRedirectUri()`: 네이티브면 `com.bybaek.app://auth/callback`, 웹이면 `${origin}/auth/callback`

### 4.2 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/login/page.tsx` | window.open → openOAuthPopup, postMessage 리스너 → listenForOAuthCallback |
| `src/app/setting/page.tsx` | 동일 패턴 적용 (Instagram 재연결 부분) |
| `src/app/auth/callback/page.tsx` | 네이티브 환경 guard 추가 (딥링크가 처리하므로 이 페이지 불필요) |

---

## Phase 5: 딥링크 설정

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="com.bybaek.app" android:host="auth" android:pathPrefix="/callback" />
</intent-filter>
```

### iOS (`ios/App/App/Info.plist`)
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>com.bybaek.app</string></array>
  </dict>
</array>
```

### 백엔드/OAuth 프로바이더 설정 (코드 외 작업)
- Azure AD: `com.bybaek.app://auth/callback`을 redirect URI로 등록
- Instagram: 동일하게 등록 (custom scheme 미지원 시 웹 트램폴린 방식 사용)

---

## Phase 6: CI/CD 조정

| 대상 | 변경 |
|------|------|
| 웹 배포 (기존) | `.github/workflows/main_bybaek-frontend.yml` → artifact 경로를 `out/`로 변경 |
| 앱 빌드 | 로컬에서 `npm run build:app` → Android Studio로 APK/AAB 생성 (자동화는 추후) |

---

## Phase 7: 모바일 UX 조정

| 작업 | 내용 |
|------|------|
| Safe Area | `viewport-fit=cover` 메타 태그 + `env(safe-area-inset-*)` CSS |
| 모달 반응형 | `w-[420px]` → `w-full max-w-[420px]` 등 모바일 대응 |
| 터치 최적화 | 추후 점진적 개선 |

---

## 실행 순서

```
Phase 1 (Static Export)  ←── 가장 먼저, 이게 기반
    ↓
Phase 2 (Capacitor 설치)
    ↓
Phase 3 (Platform 유틸)
    ↓
Phase 4 (OAuth 전환)  ←── 가장 복잡
    ↓
Phase 5 (딥링크 설정)
    ↓
Phase 6 (CI/CD)
    ↓
Phase 7 (모바일 UX)
```

---

## 주요 리스크

### 1. 쿠키 인증 (SameSite 정책)
Capacitor WebView에서 cross-origin 쿠키가 차단될 수 있음.
→ 백엔드에서 `SameSite=None; Secure` 설정 필요. `androidScheme: 'https'`로 대응.

### 2. Instagram OAuth redirect URI
Instagram API가 custom URL scheme을 허용하지 않을 수 있음.
→ **웹 트램폴린 방식**: OAuth 콜백을 웹 URL로 받고, 해당 페이지에서 딥링크로 리다이렉트.

### 3. 웹/앱 동시 유지
한 코드베이스에서 두 빌드 타겟을 지원하므로, output 모드 변경이 웹 배포에도 영향.
→ `export` 모드는 Azure Static Web Apps에서 잘 동작.

---

## 수정 대상 파일 목록

| 파일 | 작업 |
|------|------|
| `next.config.ts` | output/images 설정 변경 |
| `src/app/api/sync-onedrive/route.ts` | 삭제 |
| `src/components/PhotoSyncProgress.tsx` | API route → 직접 호출 |
| `src/app/login/page.tsx` | OAuth 플로우 분기 |
| `src/app/setting/page.tsx` | OAuth 플로우 분기 |
| `src/app/auth/callback/page.tsx` | 네이티브 guard 추가 |
| `src/app/layout.tsx` | viewport-fit=cover 메타 태그 |
| `package.json` | scripts, dependencies 추가 |
| `.gitignore` | Capacitor 빌드 아티팩트 |
| `.github/workflows/main_bybaek-frontend.yml` | artifact 경로 변경 |

**새 파일:**

| 파일 | 용도 |
|------|------|
| `capacitor.config.ts` | Capacitor 설정 |
| `src/utils/platform.ts` | 플랫폼 감지 |
| `src/utils/oauth.ts` | OAuth 헬퍼 (웹/앱 분기) |

---

## 검증 방법

1. `npm run build` → `out/` 디렉토리에 정적 파일 생성 확인
2. `npx cap sync` → 에러 없이 완료
3. `npx cap open android` → Android Studio에서 프로젝트 열림
4. Android 에뮬레이터에서 앱 실행 → 랜딩 페이지 표시
5. MS OAuth 로그인 → 딥링크로 앱 복귀 → shop_id 획득
6. 웹 빌드(`npm run build`) → 기존 웹 배포 정상 동작 확인
