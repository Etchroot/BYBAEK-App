// 타겟 경로: src/app/review/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import Image from 'next/image';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Photo, Album } from '@/types';

// ==========================================
// 🚨 [TODO: 배포 전 삭제] UI 테스트용 목업 데이터
// ==========================================
const MOCK_DATA = {
  caption: "🔥 이번 주 베스트 스타일링!\n\n깔끔한 라인과 완벽한 페이드 컷으로 완성된 클래식 포마드 스타일입니다. 아침마다 손질하기도 너무 편하실 거예요!\n\n예약은 프로필 링크를 확인해 주세요. 💈\n\n#바버샵 #맨즈헤어 #포마드 #페이드컷 #남자머리추천",
  images: [
    { id: 'mock_1', original_name: '스타일1.jpg', blob_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=500&fit=crop' },
    { id: 'mock_2', original_name: '스타일2.jpg', blob_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&h=500&fit=crop' },
  ],
  allPhotos: [
    { id: 'mock_1', original_name: '스타일1.jpg', blob_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=500&fit=crop' },
    { id: 'mock_2', original_name: '스타일2.jpg', blob_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&h=500&fit=crop' },
    { id: 'mock_3', original_name: '스타일3.jpg', blob_url: 'https://images.unsplash.com/photo-1512496115851-a1e512c011d6?w=500&h=500&fit=crop' },
    { id: 'mock_4', original_name: '스타일4.jpg', blob_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&h=500&fit=crop' },
  ],
  albums: [
    { id: 'album_1', album_name: '포마드 컷 모음' },
    { id: 'album_2', album_name: '아이비리그 컷' },
  ]
};
// ==========================================

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const shopId = searchParams.get('shop_id'); 
  const postId = searchParams.get('post_id') || '';

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); 
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  
  const [isClosedFallback, setIsClosedFallback] = useState(false);

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const [images, setImages] = useState<Photo[]>([]);
  const [tempSelectedPhotos, setTempSelectedPhotos] = useState<Photo[]>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);

  const [modalStep, setModalStep] = useState<'ALBUM_LIST' | 'PHOTO_LIST'>('ALBUM_LIST');
  const [currentAlbumPhotos, setCurrentAlbumPhotos] = useState<Photo[]>([]);
  const [currentAlbumTitle, setCurrentAlbumTitle] = useState('');

  const [generatedCaption, setGeneratedCaption] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textRatio, setTextRatio] = useState(50); 
  
  // 🚨 [추가] 사용자가 휠을 건드렸는지 기억하는 상태값
  const [hasManuallyResized, setHasManuallyResized] = useState(false);

  // 🚨 [수정] 처음에만 자동 확장, 휠 조작 후엔 멈춤
  useEffect(() => {
    // 사용자가 한 번이라도 휠을 건드렸으면 작동 안 함 (Lock)
    if (hasManuallyResized) return;

    const el = textareaRef.current;
    if (!el) return;
    
    // 텍스트가 삐져나갈 만큼 길면 한 방에 66.6%로 확장!
    if (el.scrollHeight > el.clientHeight) {
      setTextRatio(66.6);
    }
  }, [generatedCaption, hasManuallyResized]); // textRatio는 빼서 무한 루프 방지!

  const handleTextWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    // 🚨 [추가] 휠을 움직이는 순간 자동 조절 기능 잠금!
    if (!hasManuallyResized) setHasManuallyResized(true);

    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    
    const isAtTop = scrollTop === 0;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 1;

    if (e.deltaY < 0 && isAtTop) {
      setTextRatio(prev => Math.max(33.3, prev - 4));
    } 
    else if (e.deltaY > 0 && isAtBottom) {
      setTextRatio(prev => Math.min(66.6, prev + 4));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsPageLoading(true);

      const USE_MOCK = true; 

      if (USE_MOCK) {
        setTimeout(() => {
          setGeneratedCaption(MOCK_DATA.caption);
          setImages(MOCK_DATA.images);
          setAllPhotos(MOCK_DATA.allPhotos);
          setAlbums(MOCK_DATA.albums);
          setIsPageLoading(false);
        }, 800);
        return;
      }

      try {
        const allRes = await apiClient.get(`/photos/all/${shopId}`); 
        setAllPhotos(allRes.data.photos || []);

        const albumRes = await apiClient.get(`/album/${shopId}`); 
        setAlbums(albumRes.data.albums || albumRes.data || []);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setAlertMessage(t.review.load_error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInitialData();
  }, [shopId, postId]);

  const openPhotoModal = () => {
    setTempSelectedPhotos(images);
    setModalStep('ALBUM_LIST'); 
    setIsEditModalVisible(true);
  };
  const closePhotoModal = () => setIsEditModalVisible(false);

  const openOrderModal = () => {
    setTempSelectedPhotos(images);
    setIsOrderModalVisible(true);
  };
  const closeOrderModal = () => setIsOrderModalVisible(false);

  const toggleTempSelect = (photo: Photo) => {
    setTempSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id) ? prev.filter((p) => p.id !== photo.id) : [...prev, photo]
    );
  };

  const handleSavePhotos = () => {
    setImages(tempSelectedPhotos);
    setCurrentImageIndex(0);
    setIsEditModalVisible(false);
  };

  const handleSavePhotoOrder = () => {
    setImages(tempSelectedPhotos);
    setIsOrderModalVisible(false);
  };

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setTempSelectedPhotos(newOrder);
  };

  const movePhotoDown = (index: number) => {
    if (index === tempSelectedPhotos.length - 1) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setTempSelectedPhotos(newOrder);
  };

  const handlePrevImage = () => setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  const handleNextImage = () => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));

  const handleRemoveCurrentImage = () => {
    if (images.length === 0) return;
    const updatedImages = [...images];
    updatedImages.splice(currentImageIndex, 1);
    setImages(updatedImages);
    
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1);
    } else if (updatedImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      setAlertMessage(t.preview.alert_no_photo);
      return;
    }
    if (!generatedCaption.trim()) {
      setAlertMessage(t.preview.alert_no_caption);
      return;
    }

    setIsLoading(true);
    setIsUploadSuccess(false);

    try {
      const payload = {
        shop_id: shopId,
        post_id: postId,
        caption: generatedCaption,
        image_urls: images.map((img) => img.blob_url), 
        photo_ids: images.map((img) => img.id),        
      };

      const USE_MOCK = true;
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setAlertMessage(t.review.upload_success);
        setIsUploadSuccess(true);
        setIsLoading(false);
        return;
      }

      const response = await apiClient.post('/save', payload);
      if (response.data.status === 'success') {
        setAlertMessage(t.review.upload_success);
        setIsUploadSuccess(true); 
      }
    } catch (error: any) {
      console.error('업로드 실패:', error);
      setAlertMessage(error.response?.data?.detail || t.review.upload_error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertMessage(null);
    if (isUploadSuccess) {
      window.close();
      setTimeout(() => {
        setIsClosedFallback(true);
      }, 100);
    }
  };

  if (isClosedFallback) {
    return (
      <div className="w-full max-w-md mx-auto h-screen bg-[#FAFAFA] flex flex-col items-center justify-center shadow-2xl p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-green-500 text-4xl font-bold">✓</span>
        </div>
        <h2 className="text-[22px] font-bold text-text-primary mb-3">{t.review.upload_complete_title}</h2>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-8 whitespace-pre-wrap">
          {t.review.upload_complete_desc}
        </p>
        <p className="text-[13px] text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
          {t.review.upload_complete_close}
        </p>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="flex h-screen w-full max-w-md mx-auto items-center justify-center bg-[#FAFAFA] shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-secondary animate-pulse">{t.review.loading_data}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[#FAFAFA] flex flex-col shadow-2xl relative">
      
      <div className="relative flex flex-row justify-center items-center p-4 bg-white border-b border-border shrink-0">
        
        <button
          onClick={() => router.push('/dashboard')}
          className="absolute left-4 flex items-center justify-center focus:outline-none hover:scale-110 transition-transform cursor-pointer"
          title="대시보드로 이동"
        >
          <div className="relative w-8 h-8">
            <Image 
              src="/images/logo.png" 
              alt="BYBAEK Logo" 
              fill 
              className="object-contain"
            />
          </div>
        </button>

        <h2 className="text-[18px] text-text-primary font-bold">
          {t.review.title}
        </h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div 
          className="relative w-full bg-[#EAEAEA] rounded-lg mb-3 overflow-hidden flex items-center justify-center shrink-0 group/viewer transition-all duration-300 ease-out min-h-0"
          style={{ flex: 100 - textRatio }}
        >
          {images.length > 0 && currentImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-2 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            >
              {'<'}
            </button>
          )}

          <div className="w-full h-full relative">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex].blob_url}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemoveCurrentImage}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex justify-center items-center hover:bg-gray-300 transition-colors shadow-sm focus:outline-none cursor-pointer"
                >
                  <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                {t.preview.no_photo}
              </div>
            )}
          </div>

          {images.length === 0 || currentImageIndex === images.length - 1 ? (
            <button
              onClick={openPhotoModal}
              className="absolute right-3 z-10 w-12 h-12 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex items-center justify-center hover:bg-gray-300 transition-colors shadow-sm cursor-pointer focus:outline-none hover:scale-105"
            >
              <svg className="w-7 h-7 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleNextImage}
              className="absolute right-2 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            >
              {'>'}
            </button>
          )}
        </div>

        <button
          onClick={openOrderModal}
          className="w-full py-3 mb-3 border border-border rounded-lg bg-white text-[14px] font-bold text-text-secondary hover:bg-gray-50 transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          {t.preview.btn_reorder_photo}
        </button>

        <div 
          className="bg-white border border-border rounded-lg p-4 flex flex-col shadow-sm mb-2 transition-all duration-300 ease-out min-h-0"
          style={{ flex: textRatio }}
        >
          <textarea
            ref={textareaRef}
            onWheel={handleTextWheel}
            className="flex-1 w-full h-full resize-none text-body bg-transparent focus:outline-none scrollbar-hide leading-relaxed"
            value={generatedCaption}
            onChange={(e) => setGeneratedCaption(e.target.value)}
            placeholder={t.review.placeholder_caption}
          />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-border shrink-0 pb-safe">
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full py-4 bg-accent rounded-lg text-white font-bold text-[16px] hover:bg-accent-dark transition-all transform active:scale-[0.98] shadow-md cursor-pointer flex justify-center items-center disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t.review.btn_upload
          )}
        </button>
      </div>
      
      {/* 5. 사진 추가 모달 (생략 불가능, 유지) */}
      {isEditModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4">
          <div className="w-full max-w-[400px] h-[75vh] bg-background rounded-xl shadow-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                {modalStep === 'PHOTO_LIST' && (
                  <button onClick={() => setModalStep('ALBUM_LIST')} className="text-text-secondary font-bold text-xl pb-1 px-2 cursor-pointer">
                    {'<'}
                  </button>
                )}
                <h2 className="text-[16px] font-bold text-text-primary">
                  {modalStep === 'ALBUM_LIST' ? t.preview.modal_album_select : currentAlbumTitle}
                </h2>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSavePhotos} className="px-4 py-1.5 bg-accent text-white rounded-md font-bold text-[13px] cursor-pointer">{t.common.save}</button>
                <button onClick={closePhotoModal} className="text-[18px] text-text-secondary px-2 cursor-pointer">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
              {modalStep === 'ALBUM_LIST' ? (
                <div className="grid grid-cols-3 gap-3 content-start">
                  <button onClick={() => { setCurrentAlbumPhotos(allPhotos); setCurrentAlbumTitle(t.preview.all_photos); setModalStep('PHOTO_LIST'); }} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border flex items-center justify-center overflow-hidden">
                      {allPhotos.length > 0 ? <img src={allPhotos[0].blob_url} className="w-full h-full object-cover" alt={t.preview.all_photos} /> : <span className="text-3xl">📁</span>}
                    </div>
                    <span className="font-bold text-[13px] mt-1">{t.preview.all_photos}</span>
                  </button>
                  {albums.map((album) => (
                    <button key={album.id} onClick={() => {
                        setCurrentAlbumPhotos(allPhotos.slice(1, 3)); 
                        setCurrentAlbumTitle(album.album_name);
                        setModalStep('PHOTO_LIST');
                    }} className="flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border flex items-center justify-center"><span className="text-3xl">📁</span></div>
                      <span className="font-bold text-[13px] mt-1 truncate w-full text-center">{album.album_name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 content-start">
                  {currentAlbumPhotos.map((photo) => {
                    const isSelected = tempSelectedPhotos.some((p) => p.id === photo.id);
                    return (
                      <button key={photo.id} onClick={() => toggleTempSelect(photo)} className={`relative aspect-square rounded-lg border overflow-hidden cursor-pointer ${isSelected ? 'border-accent border-[3px]' : 'border-border'}`}>
                        <div className={`absolute top-1 left-1 w-[20px] h-[20px] rounded border flex justify-center items-center ${isSelected ? 'bg-accent border-accent' : 'bg-white/80 border-gray-300'}`}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <img src={photo.blob_url} className="w-full h-full object-cover" alt="img" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. 사진 순서 변경 모달 */}
      {isOrderModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4">
          <div className="w-full max-w-[400px] max-h-[75vh] bg-background rounded-xl shadow-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-[16px] font-bold text-text-primary">{t.preview.modal_photo_reorder}</h2>
              <div className="flex gap-2">
                <button onClick={handleSavePhotoOrder} className="px-4 py-1.5 bg-accent text-white rounded-md font-bold text-[13px] cursor-pointer">{t.common.save}</button>
                <button onClick={closeOrderModal} className="text-[18px] text-text-secondary px-2 cursor-pointer">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-hide">
              {tempSelectedPhotos.map((photo, index) => (
                <div key={photo.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-border shadow-sm">
                  <span className="font-bold text-accent w-4 text-center">{index + 1}</span>
                  <img src={photo.blob_url} className="w-12 h-12 object-cover rounded-md" alt="img" />
                  <div className="flex-1 text-[13px] font-medium truncate">{photo.original_name}</div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => movePhotoUp(index)} disabled={index === 0} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-30 cursor-pointer">▲</button>
                    <button onClick={() => movePhotoDown(index)} disabled={index === tempSelectedPhotos.length - 1} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-30 cursor-pointer">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. 커스텀 알림창 UI */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-[320px] flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0 ${isUploadSuccess ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              <span className="text-xl font-bold">{isUploadSuccess ? '✓' : '!'}</span>
            </div>
            <p className="text-[14px] text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            <button 
              onClick={handleAlertConfirm} 
              className="w-full py-3 bg-accent text-white rounded-lg font-bold text-[15px] cursor-pointer hover:bg-accent-dark transition-colors"
            >
              {t.common.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#FAFAFA]" />}>
      <ReviewContent />
    </Suspense>
  );
}