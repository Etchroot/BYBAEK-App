// 타겟 경로: src/components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface MenuItem {
  name: string;
  path?: string;
  action?: string;
}

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const { t } = useTranslation();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, [pathname]);

  const menuItems: MenuItem[] = [
    { name: t.sidebar.dashboard, path: '/dashboard' },
    { name: t.sidebar.create_post, path: '/preview' },
    { name: t.sidebar.all_photos, path: '/photos' },
    { name: t.sidebar.my_album, path: '/album' },
    { name: t.sidebar.setting, path: '/setting' },
    
    { name: t.sidebar.test, path: '/' },
    ...(isLoggedIn 
      ? [{ name: t.sidebar.logout, action: 'LOGOUT' }] 
      : [{ name: t.sidebar.login, path: '/login?from=sidebar' }])
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === 'LOGOUT') {
      setIsLogoutModalOpen(true);
      return; 
    }

    if (item.path) {
      router.push(item.path); 
    }
  };

  const handleConfirmLogout = () => {
    localStorage.clear(); 
    setIsLoggedIn(false);
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  return (
    <>
      <div 
        className={`h-screen bg-sidebar py-large z-10 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? 'w-17.5' : 'w-55'
        }`}
      >
        {/* 헤더 영역 */}
        <div className={`flex flex-row items-center mb-xlarge px-medium ${
          isCollapsed ? 'justify-center px-0' : 'justify-between'
        }`}>
          {/* 로고 홈 버튼 */}
          {!isCollapsed && (
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex flex-row items-center py-small focus:outline-none group hover:scale-105 origin-left transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-10 h-10 transition-transform duration-300">
                <Image 
                  src="/images/logo.png" 
                  alt="BYBAEK Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="relative ml-2 overflow-hidden py-1">
                <span className="text-h2 text-text-inverse font-bold block">
                  BYBAEK
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              </div>
            </button>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-small focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-[24px] text-text-inverse leading-none">≡</span>
          </button>
        </div>

        {/* 메뉴 리스트 영역 */}
        <div className="flex-1 flex flex-col">
          {menuItems.map((item, index) => {
            // 🚨 [보완] 파라미터(?shop_id=...)가 붙어있어도 순수 경로명만 잘라서 활성화 상태를 검사합니다.
            const basePath = item.path?.split('?')[0]; 
            const isActive = basePath ? (pathname === basePath || (pathname === '/' && basePath === '/dashboard')) : false;

            let itemClasses = "py-[14px] mb-small flex transition-colors focus:outline-none cursor-pointer ";
            let textClasses = "font-semibold ";

            if (isCollapsed) {
              itemClasses += "mx-small rounded-lg justify-center items-center px-0 ";
              itemClasses += isActive ? "bg-accent " : "hover:bg-gray-800 ";
              textClasses += "text-[20px] text-center ";
              textClasses += isActive ? "text-text-inverse" : "text-text-secondary";
            } else {
              itemClasses += "px-medium mr-medium flex-row items-center ";
              itemClasses += isActive ? "bg-accent rounded-r-[20px] " : "hover:bg-gray-800 rounded-r-[20px] ";
              textClasses += "text-body ";
              textClasses += isActive ? "text-text-inverse" : "text-text-secondary";
            }

            let tourClass = "";
            if (basePath === '/dashboard') tourClass = " tour-step-dashboard";
            else if (basePath === '/preview') tourClass = " tour-step-preview";
            else if (basePath === '/photos') tourClass = " tour-step-photos";
            else if (basePath === '/album') tourClass = " tour-step-album";
            else if (basePath === '/setting') tourClass = " tour-step-setting";

            return (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                className={itemClasses + tourClass}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={textClasses}>
                  {isActive ? '✧✧ ' : '✧ '}
                  {!isCollapsed && item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 로그아웃 확인 모달 (팝업) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 text-2xl leading-none font-bold">!</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t.sidebar.logout_title}</h3>
            <p className="text-sm text-gray-500 text-center mb-6 whitespace-pre-wrap">
              {t.sidebar.logout_confirm}
            </p>
            
            <div className="flex flex-row w-full gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors focus:outline-none cursor-pointer"
              >
                {t.sidebar.btn_no}
              </button>
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors focus:outline-none cursor-pointer"
              >
                {t.sidebar.btn_yes}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};