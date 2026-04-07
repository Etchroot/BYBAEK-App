import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { isNative } from './platform';

const BACKEND_URL = 'https://bybaek-b-bzhhgzh8d2gthpb3.koreacentral-01.azurewebsites.net';

/**
 * OAuth redirect URI를 플랫폼에 맞게 반환
 * - 네이티브: com.bybaek.app://auth/callback
 * - 웹: ${origin}/auth/callback
 */
export function getRedirectUri(): string {
  if (isNative()) {
    return 'com.bybaek.app://auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
}

/**
 * OAuth 팝업/브라우저 열기
 * - 네이티브: Capacitor Browser 플러그인 (인앱 브라우저)
 * - 웹: window.open() 팝업
 */
export async function openOAuthPopup(
  url: string,
  windowName: string = 'OAuth_Popup'
): Promise<Window | null> {
  if (isNative()) {
    await Browser.open({ url, windowName: 'oauth' });
    return null;
  } else {
    return window.open(url, windowName, 'width=500,height=600');
  }
}

/**
 * OAuth 콜백 리스너 등록
 * - 네이티브: App.addListener('appUrlOpen') 딥링크 수신
 * - 웹: window.addEventListener('message') postMessage 수신
 *
 * @returns cleanup 함수
 */
export function listenForOAuthCallback(
  callback: (eventType: string) => void
): () => void {
  if (isNative()) {
    let removed = false;
    const listenerPromise = App.addListener('appUrlOpen', async (event) => {
      const url = new URL(event.url);
      if (url.host === 'auth' && url.pathname.startsWith('/callback')) {
        const code = url.searchParams.get('code');

        if (code) {
          // Instagram OAuth: code를 백엔드에 전송
          try {
            await fetch(`${BACKEND_URL}/api/auth/instagram`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ code }),
            });
            callback('INSTA_LOGIN_SUCCESS');
          } catch {
            console.error('[oauth] Instagram code 전송 실패');
          }
        } else {
          // MS OAuth: code 없이 성공 콜백
          callback('MS_LOGIN_SUCCESS');
        }

        // 인앱 브라우저 닫기
        await Browser.close();
      }
    });

    return () => {
      if (!removed) {
        removed = true;
        listenerPromise.then((listener) => listener.remove());
      }
    };
  } else {
    // 웹: 기존 postMessage 방식 유지
    const handler = (event: MessageEvent) => {
      if (
        typeof event.data === 'string' &&
        ['MS_LOGIN_SUCCESS', 'INSTA_LOGIN_SUCCESS', 'GMAIL_LOGIN_SUCCESS'].includes(event.data)
      ) {
        callback(event.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }
}
