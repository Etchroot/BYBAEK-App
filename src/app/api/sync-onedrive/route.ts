// 타겟 경로: src/app/api/sync-onedrive/route.ts
// 역할: 프론트엔드에서 백엔드 OneDrive sync를 프록시 호출
// 쿠키를 서버사이드에서 백엔드로 전달하여 토큰 문제 해결

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net';

export async function POST(request: NextRequest) {
    try {
        // 쿠키 전체를 백엔드로 그대로 전달
        const allCookies = request.headers.get('cookie') || '';
        const shopId = request.cookies.get('shop_id')?.value ||
            request.cookies.get('user_id')?.value || '';

        const body = await request.json().catch(() => ({}));

        // 백엔드 sync-photos 호출 (쿠키 통째로 전달)
        const syncRes = await fetch(`${BACKEND_URL}/api/onedrive/sync-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(allCookies ? { Cookie: allCookies } : {}),
                ...(shopId ? { 'X-MS-CLIENT-PRINCIPAL-ID': shopId } : {}),
            },
            body: JSON.stringify({ ...body, shop_id: shopId }),
        });

        const text = await syncRes.text();
        try {
            return NextResponse.json(JSON.parse(text), { status: syncRes.status });
        } catch {
            return NextResponse.json({ success: true, message: text }, { status: syncRes.status });
        }

    } catch (error) {
        console.error('[sync-onedrive] 오류:', error);
        return NextResponse.json(
            { success: false, message: '동기화 시작 실패' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const shopId = request.nextUrl.searchParams.get('shop_id');
        if (!shopId) {
            return NextResponse.json({ error: 'shop_id 필요' }, { status: 400 });
        }

        const authSession = request.cookies.get('AppServiceAuthSession')?.value;

        const statusRes = await fetch(
            `${BACKEND_URL}/api/onedrive/sync-status/${shopId}`,
            {
                headers: authSession
                    ? { Cookie: `AppServiceAuthSession=${authSession}` }
                    : {},
            }
        );

        const statusData = await statusRes.json();
        return NextResponse.json(statusData, { status: statusRes.status });

    } catch (error) {
        console.error('[sync-onedrive] 상태 조회 오류:', error);
        return NextResponse.json({ error: '상태 조회 실패' }, { status: 500 });
    }
}