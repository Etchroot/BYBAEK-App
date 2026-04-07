// 타겟 경로: src/app/post/page.tsx
// 기존 /post/[id] 동적 라우트를 /post?id=xxx 쿼리 파라미터 방식으로 전환
// (static export에서 동적 라우트 제약 해소)
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { PostDetail } from '@/types';

export default function PostDetailPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PostDetailScreen />
    </Suspense>
  );
}

function PostDetailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const queryShopId = searchParams.get('shop_id');
    const storedShopId = localStorage.getItem('shop_id');

    setShopId(queryShopId || storedShopId || "guest_shop");
  }, [searchParams]);

  const { t } = useTranslation();

  const [postData, setPostData] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/agent/post/detail/${id}`, {
          params: { shop_id: shopId }
        });

        if (response.data) {
          setPostData(response.data);
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, shopId]);

  if (!id) return <div className="p-10">{t.post_detail.not_found}</div>;
  if (loading) return <div className="p-10">{t.post_detail.loading}</div>;
  if (!postData) return <div className="p-10">{t.post_detail.not_found}</div>;

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col p-[32px] min-w-0 h-full">

        <div className="flex flex-row justify-between items-center mb-[32px] shrink-0">
          <h1 className="text-[28px] font-bold text-[#1A1A1A]">{t.post_detail.title}</h1>
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-dark transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-row gap-[32px] min-h-0">

          <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
            <div className="flex flex-col gap-[16px] pb-[40px]">
              {postData.photo_urls?.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt="post"
                  className="w-full max-w-[400px] rounded-[12px] object-cover"
                />
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#E0E0E0] rounded-[12px] p-[32px] overflow-y-auto">
            <p className="text-[18px] text-[#1A1A1A] leading-[28px] whitespace-pre-wrap">
              {postData.caption}
              {"\n\n"}
              {postData.hashtags?.map((tag: string) =>
                tag.startsWith('#') ? tag : `#${tag}`
              ).join(' ')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
