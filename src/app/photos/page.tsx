// 타겟 경로: src/app/photos/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; 
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index'; 
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import type { Photo } from '@/types';

interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

export default function AllPhotosScreen() {
  const { t } = useTranslation();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // 🚨 [신규] '선택 모드' 상태 관리
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    message: '',
    type: 'ALERT'
  });

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [loading, setLoading] = useState(true); 

  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedShopId = localStorage.getItem('shop_id');
    setShopId(storedShopId);
  }, []);

  const fetchPhotos = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error("사진 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [shopId]);

  // 🚨 [신규] 선택 모드 토글 함수 (취소를 누르면 선택된 사진들도 싹 비워줍니다)
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIndexes([]); 
  };

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDelete = async () => {
    if (selectedIndexes.length === 0) {
      setCustomAlert({
        isOpen: true,
        message: t.photos.select_photo_first,
        type: 'ALERT'
      });
      return;
    }
    
    const confirmMessage = t.photos.confirm_delete_msg;

    setCustomAlert({
      isOpen: true,
      message: confirmMessage,
      type: 'CONFIRM',
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIndexes.map(async (idx) => {
              const photoId = photos[idx].id;
              // 백엔드 API 호출 (실제 DB 삭제 로직 트리거)
              return apiClient.delete(`/photos/${shopId}/${photoId}`);
            })
          );

          setCustomAlert({
            isOpen: true,
            message: t.photos.delete_success_msg,
            type: 'ALERT'
          });
          
          fetchPhotos();
          setSelectedIndexes([]); 
          setIsSelectMode(false); // 🚨 삭제 완료 후 자동으로 선택 모드 해제
        } catch (error) {
          console.error("사진 삭제 실패:", error);
          setCustomAlert({
            isOpen: true,
            message: t.photos.delete_error_msg,
            type: 'ALERT'
          });
        }
      }
    });
  };

  const openViewer = (index: number) => {
    setCurrentViewIndex(index);
    setIsViewerOpen(true);
  };

  const handlePrevImage = () => {
    if (currentViewIndex > 0) setCurrentViewIndex(currentViewIndex - 1);
  };

  const handleNextImage = () => {
    if (currentViewIndex < photos.length - 1) setCurrentViewIndex(currentViewIndex + 1);
  };

  const renderCustomAlert = () => {
    if (!customAlert.isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99999]">
        <div className="bg-background rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            customAlert.type === 'CONFIRM' ? 'bg-[#FFE5E5]' : 'bg-red-50'
          }`}>
            <span className={`text-2xl font-bold leading-none ${
              customAlert.type === 'CONFIRM' ? 'text-[#E02424]' : 'text-accent'
            }`}>!</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {customAlert.type === 'CONFIRM' ? t.photos.delete_photo_title : t.photos.alert_title}
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 whitespace-pre-wrap leading-relaxed">
            {customAlert.message}
          </p>
          <div className="flex flex-row w-full gap-3">
            {customAlert.type === 'CONFIRM' && (
              <button
                onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
                className="flex-1 py-3 bg-[#E0E0E0] text-text-primary rounded-lg font-bold hover:bg-gray-300 transition-colors focus:outline-none cursor-pointer"
              >
                {t.common.cancel}
              </button>
            )}
            <button
              onClick={() => {
                setCustomAlert({ ...customAlert, isOpen: false });
                if (customAlert.onConfirm) customAlert.onConfirm();
              }}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors focus:outline-none cursor-pointer ${
                customAlert.type === 'CONFIRM' ? 'bg-[#E02424] hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'
              }`}
            >
              {customAlert.type === 'CONFIRM' ? t.photos.btn_delete : t.common.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full">
        <div className="flex flex-row justify-between items-center mb-large pb-small border-b border-border shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">{t.photos.title}</h1>
          
          {/* 🚨 우측 상단 컨트롤 버튼 영역 */}
          <div className="flex items-center gap-3">
            {/* 선택 모드일 때만 나타나는 휴지통 아이콘 버튼 */}
            {isSelectMode && (
              <button 
                onClick={handleDelete}
                className="p-2 border border-red-500 rounded-md bg-white text-red-500 hover:bg-red-50 transition-colors focus:outline-none cursor-pointer flex items-center justify-center shadow-sm"
                title="선택된 사진 삭제"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            {/* 선택 / 취소 토글 버튼 */}
            <button 
              onClick={toggleSelectMode}
              className={`px-5 py-2 border rounded-md font-bold text-sm transition-colors focus:outline-none cursor-pointer shadow-sm ${
                isSelectMode 
                  ? 'border-gray-300 text-text-primary bg-gray-100 hover:bg-gray-200' 
                  : 'border-accent bg-white text-accent hover:bg-red-50'
              }`}
            >
              {isSelectMode ? (t.common?.cancel || '취소') : (t.common?.select || '선택')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="flex flex-row flex-wrap gap-4 pb-large">
            
              {loading ? (
                <div className="flex justify-center items-center w-full h-40">
                  <p className="text-text-secondary">{t.photos.loading_photos}</p>
                </div>
              ) : (
                photos.map((photo, index) => {
                  const isSelected = selectedIndexes.includes(index);
                  
                  return (
                    <div 
                      key={photo.id || `photo-${index}`}
                      className={`relative w-[180px] h-[180px] bg-[#EAEAEA] rounded-lg border overflow-hidden transition-all shrink-0 group ${
                        isSelected && isSelectMode ? 'border-accent border-[3px]' : 'border-border hover:border-gray-400'
                      }`}
                    >
                      {/* 🚨 [핵심] 선택 모드일 땐 toggleSelect, 아닐 땐 openViewer 실행 */}
                      <button 
                        onClick={() => isSelectMode ? toggleSelect(index) : openViewer(index)}
                        className="w-full h-full focus:outline-none cursor-pointer"
                      >
                        <img 
                          src={photo.blob_url} 
                          alt={photo.original_name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                      </button>

                      {/* 🚨 선택 모드(isSelectMode)일 때만 체크박스 UI 표시 */}
                      {isSelectMode && (
                        <div className="absolute top-[8px] left-[8px] p-1 z-10 pointer-events-none">
                          <div className={`w-[22px] h-[22px] rounded border-2 flex justify-center items-center transition-colors shadow-sm ${
                            isSelected ? 'bg-accent border-accent' : 'bg-white/80 border-gray-400'
                          }`}>
                            {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            
          </div>
        </div>
      </div>

      {renderCustomAlert()}

      {/* 이미지 뷰어 */}
      {isViewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[800px] h-[650px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
            
            <div className="flex justify-between items-center mb-large shrink-0">
              <h2 className="text-h2 font-bold text-text-primary">{t.photos.viewer_title}</h2>
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex flex-row items-center justify-between min-h-0">
              <button 
                onClick={handlePrevImage}
                disabled={currentViewIndex === 0}
                className={`p-2 text-4xl font-light transition-colors focus:outline-none cursor-pointer ${
                  currentViewIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-accent'
                }`}
              >
                ‹
              </button>

              <div className="flex-1 h-full mx-4 bg-[#F5F5F5] border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {photos[currentViewIndex] && (
                  <img 
                    src={photos[currentViewIndex].blob_url} 
                    alt={photos[currentViewIndex].original_name}
                    className="max-w-full max-h-[500px] object-contain rounded-md shadow-sm"
                  />
                )}
                
                <div className="absolute bottom-4 bg-black/50 px-4 py-1.5 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                  {currentViewIndex + 1} / {photos.length}
                </div>
              </div>

              <button 
                onClick={handleNextImage}
                disabled={currentViewIndex === photos.length - 1}
                className={`p-2 text-4xl font-light transition-colors focus:outline-none cursor-pointer ${
                  currentViewIndex === photos.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-accent'
                }`}
              >
                ›
              </button>
            </div>

            <div className="flex flex-row justify-center mt-large shrink-0">
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="w-full bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}