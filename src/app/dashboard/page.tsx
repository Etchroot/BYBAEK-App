// 타겟 경로: src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar'; 
import { PostCard } from '@/components/PostCard'; 
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  
  // 🚨 [다국어 적용] 번역 객체 t 가져오기
  const { t } = useTranslation();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  
  const [shopId, setShopId] = useState<string | null>(null);
  
  // 1. 페이지 로드 시 localStorage에서 정보를 먼저 가져옴
  useEffect(() => {
    const storedShopId = localStorage.getItem("shop_id");
    const guestStatus = localStorage.getItem("isGuest");

    if (guestStatus === "true") {
      setIsGuest(true);
      setShopId("guest"); // 게스트용 임시 ID
    } else if (storedShopId) {
      setShopId(storedShopId);
    } else {
      // 로그인 정보도 없고 게스트도 아니면 로그인 페이지로 튕겨내기
      router.push('/login');
    }
  }, [router]);

  // 2. shopId가 제대로 설정되었을 때만 API 호출
  useEffect(() => {
    if (!shopId) return;

    const fetchPosts = async () => {
      try {
        const response = await apiClient.get(`/agent/posts/${shopId}`);
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
  
    fetchPosts();
  }, [shopId]);

  // 🚨 [추가] 날짜를 예쁘게 변환해주는 헬퍼 함수 (예: "2024. 10. 25")
  const formatDate = (dateString?: string) => {
    if (!dateString) return t.common?.no_date || "날짜 없음";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t.post_detail?.date_error || "날짜 오류";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}. ${month}. ${day}`;
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 우측 메인 콘텐츠 영역 */}
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          {/* 🚨 [다국어 적용] 타이틀 */}
          <h1 className="text-h1 text-text-primary font-bold">{t.dashboard.title}</h1>
        </div>

        {/* 3. 체험 모드(Guest) 전용 우아한 경고 배너 */}
        {isGuest && (
          <div className="mb-large bg-[#FFF4F4] border border-[#FFD6D6] rounded-xl p-5 flex flex-row justify-between items-center shrink-0 shadow-sm">
            <div className="flex flex-row items-center">
              <div className="w-10 h-10 bg-[#FFE5E5] rounded-full flex items-center justify-center mr-4 shrink-0">
                <span className="text-[#E02424] text-lg">⚠️</span>
              </div>
              <div>
                {/* 🚨 [다국어 적용] 체험 모드 안내 제목 */}
                <p className="text-[15px] font-bold text-[#E02424] mb-1">{t.dashboard.guest_warning_title}</p>
                {/* 🚨 [다국어 적용] 체험 모드 안내 설명 */}
                <p className="text-[13px] text-[#E02424]/80">{t.dashboard.guest_warning_desc}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="ml-4 px-5 py-2.5 bg-[#E02424] text-white text-[13px] font-bold rounded-lg hover:bg-red-800 transition-colors shrink-0 focus:outline-none"
            >
              {/* 🚨 [다국어 적용] 계정 연동 버튼 */}
              {t.dashboard.link_account}
            </button>
          </div>
        )}

        {/* 그리드 리스트 영역 */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-large">
            
            <PostCard 
              id="new" 
              isNewButton={true} 
              onPress={() => router.push('/preview')} 
            />
            
            {posts.map((post) => (
              <PostCard 
                key={post.id}
                id={post.id} 
                // 🚨 [핵심 수정] updated_at이 있으면 우선 사용하고, 없으면 created_at 사용!
                title={formatDate(post.updated_at || post.created_at)} 
                imageUrl={post.thumbnail_url}
                onPress={() => router.push(`/post/${post.id}?shop_id=${shopId}`)} 
              />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}