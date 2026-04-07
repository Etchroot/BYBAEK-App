// 타겟 경로: src/components/AlbumDetailModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Photo } from '@/types';

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
}

interface AlbumDetailModalProps {
  isVisible: boolean;
  album: AlbumData | null;
  onClose: () => void;
  // 🚨 [DB 연동] 앨범에 속한 최종 사진 ID 배열(photoIds)도 부모에게 넘겨주도록 파라미터 추가!
  onSave: (id: string, newTitle: string, newDesc: string, photoIds?: string[]) => void;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ isVisible, album, onClose, onSave }) => {
  const { t } = useTranslation();

  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('shop_id');
    setShopId(storedId);
  }, []);
  
  const [tempTitle, setTempTitle] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 선택 상태 관리
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]); // 제거용 선택
  const [selectedAllPhotoIds, setSelectedAllPhotoIds] = useState<string[]>([]); // 추가용 선택
  
  // 중첩 모달 상태
  const [isAddPhotoModalVisible, setIsAddPhotoModalVisible] = useState(false);

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isVisible && album) {
      setTempTitle(album.title || '');
      setTempDesc(album.description || '');
      setSelectedPhotoIds([]); 
      setIsAddPhotoModalVisible(false); 
      setSelectedAllPhotoIds([]); 
      setAlbumPhotos([]);
      
      const fetchPhotos = async () => {
        setIsLoading(true);
        try {
          // 1. 전체 사진 불러오기
          const allRes = await apiClient.get(`/photos/all/${shopId}`);
          setAllPhotos(allRes.data.photos || []);

          // 2. 기존 앨범인 경우 해당 앨범의 사진들 불러오기
          if (!album.isNew) {
            // (주의: 백엔드의 실제 앨범 상세 조회 엔드포인트에 맞게 수정 필요)
            const albumRes = await apiClient.get(`/album/${shopId}/${album.id}/photos`);
            setAlbumPhotos(albumRes.data.photos || []);
          }
        } catch (error) {
          console.error("사진 데이터 로드 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPhotos();
    }
  }, [isVisible, album]);

  if (!isVisible || !album) return null;

  // 최종 저장 시 부모에게 데이터 전달
  const handleSave = () => {
    if (!album) return;
    const finalPhotoIds = albumPhotos.map(p => p.id);
    onSave(album.id, tempTitle, tempDesc, finalPhotoIds);
  };

  // 기존 앨범 사진 중에서 '선택 제거'
  const handleRemovePhotos = () => {
    if (selectedPhotoIds.length === 0) return;
    setAlbumPhotos(prev => prev.filter(photo => !selectedPhotoIds.includes(photo.id)));
    setSelectedPhotoIds([]);
  };

  // '전체 사진' 모달에서 '선택 추가'
  const handleAddPhotos = () => {
    const photosToAdd = allPhotos.filter(photo => selectedAllPhotoIds.includes(photo.id));
    
    // 중복 방지 로직 (이미 앨범에 있는 사진은 제외하고 추가)
    const newAlbumPhotos = [...albumPhotos];
    photosToAdd.forEach(photo => {
      if (!newAlbumPhotos.find(p => p.id === photo.id)) {
        newAlbumPhotos.push(photo);
      }
    });

    setAlbumPhotos(newAlbumPhotos);
    setSelectedAllPhotoIds([]);
    setIsAddPhotoModalVisible(false);
    // 사진 추가 완료 (알림 생략 - UI에서 즉시 반영됨)
  };

  const togglePhotoSelect = (id: string) => 
    setSelectedPhotoIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  const toggleAllPhotoSelect = (id: string) => 
    setSelectedAllPhotoIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-row">
      <Sidebar />
      
      <div className="flex-1 p-[40px] flex flex-col min-w-0">
        
        {/* 상단 헤더 */}
        <div className="flex flex-row justify-between items-start mb-[24px] shrink-0">
          <div className="flex-1 pr-5 flex flex-col">
            <input 
              type="text"
              className="text-[32px] font-bold text-text-primary mb-2 focus:outline-none bg-transparent w-full"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder={t.album.placeholder_title}
            />
            <input 
              type="text"
              className="text-base text-text-secondary mb-3 focus:outline-none bg-transparent w-full"
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              placeholder={t.album.placeholder_desc}
            />
            {/* 🚨 실시간 카운트 반영 */}
            <span className="text-[14px] text-[#888] font-bold">
              {t.album.total_photos.replace('{count}', String(albumPhotos.length))}
            </span>
          </div>

          {/* 우측 액션 버튼 영역 */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex flex-row items-center mb-4">
              <button 
                onClick={handleSave} 
                className="bg-text-primary text-white py-2 px-4 rounded-lg font-bold mr-3 hover:bg-gray-800 transition-colors focus:outline-none"
              >
                {t.common.save}
              </button>
              <button 
                onClick={onClose} 
                className="bg-accent w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-accent-dark transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-row items-center">
              <button 
                onClick={handleRemovePhotos}
                className="border border-text-primary py-2.5 px-5 rounded-lg text-text-primary font-bold mr-2.5 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                {t.album.btn_remove_photo}
              </button>
              <button 
                onClick={() => setIsAddPhotoModalVisible(true)}
                className="bg-accent py-2.5 px-5 rounded-lg text-white font-bold hover:bg-accent-dark transition-colors focus:outline-none"
              >
                {t.album.add_photo}
              </button>
            </div>
          </div>
        </div>

        {/* 앨범 내 사진 그리드 (실제 데이터 렌더링) */}
        <div className="flex-1 bg-[#F9F9F9] rounded-xl p-5 border border-border overflow-y-auto min-h-0 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary font-bold">
              {t.album_detail?.loading || '데이터를 불러오는 중입니다...'}
            </div>
          ) : albumPhotos.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
              {t.album_detail?.empty || '앨범에 사진이 없습니다. 사진을 추가해 보세요!'}
            </div>
          ) : (
            <div className="flex flex-row flex-wrap gap-4 pb-4">
              {albumPhotos.map((photo) => {
                const isSelected = selectedPhotoIds.includes(photo.id);
                
                return (
                  <button 
                    key={photo.id} 
                    onClick={() => togglePhotoSelect(photo.id)}
                    className={`relative w-[160px] h-[160px] bg-[#EAEAEA] rounded-lg flex justify-center items-center border hover:border-gray-400 transition-colors focus:outline-none overflow-hidden ${
                      isSelected ? 'border-accent border-[3px]' : 'border-[#D0D0D0]'
                    }`}
                  >
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded border flex items-center justify-center z-10 transition-colors ${
                      isSelected ? 'bg-accent border-accent' : 'bg-black/30 border-white/80'
                    }`}>
                      {isSelected && <span className="text-white font-bold text-sm leading-none">✓</span>}
                    </div>
                    {/* 🚨 [DB 연동] 실제 사진 이미지 출력 */}
                    <img src={photo.blob_url} alt={photo.original_name} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. 중첩 모달: 전체 사진 추가 팝업 */}
      {isAddPhotoModalVisible && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex justify-center items-center">
          <div className="w-[85%] h-[85%] bg-white rounded-[16px] p-[30px] flex flex-col shadow-2xl">
            
            <div className="flex flex-row justify-between items-center mb-[20px] shrink-0">
              <h2 className="text-[24px] font-bold text-text-primary">{t.album.modal_all_photos_title}</h2>
              
              <div className="flex flex-row items-center">
                <button 
                  onClick={handleAddPhotos}
                  className="bg-accent py-2.5 px-5 rounded-lg mr-4 text-white font-bold text-sm hover:bg-accent-dark transition-colors focus:outline-none"
                >
                  {t.album.btn_add_selected}
                </button>
                <button 
                  onClick={() => setIsAddPhotoModalVisible(false)} 
                  className="bg-[#E0E0E0] w-9 h-9 rounded-full flex items-center justify-center text-text-primary font-bold text-lg hover:bg-gray-300 transition-colors focus:outline-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 전체 사진 그리드 (실제 데이터 렌더링) */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2 border-t border-gray-100 pt-4">
              {allPhotos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                  {t.album_detail?.no_photos_available || '선택할 수 있는 사진이 없습니다.'}
                </div>
              ) : (
                <div className="flex flex-row flex-wrap gap-4">
                  {allPhotos.map((photo) => {
                    const isSelected = selectedAllPhotoIds.includes(photo.id);
                    return (
                      <button 
                        key={photo.id} 
                        onClick={() => toggleAllPhotoSelect(photo.id)}
                        className={`relative w-[140px] h-[140px] bg-[#F0F0F0] rounded-lg flex justify-center items-center border hover:border-gray-400 transition-colors focus:outline-none overflow-hidden ${
                          isSelected ? 'border-accent border-[3px]' : 'border-[#D0D0D0]'
                        }`}
                      >
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded border flex items-center justify-center z-10 transition-colors ${
                          isSelected ? 'bg-accent border-accent' : 'bg-black/30 border-white/80'
                        }`}>
                          {isSelected && <span className="text-white font-bold text-sm leading-none">✓</span>}
                        </div>
                        {/* 🚨 [DB 연동] 실제 사진 이미지 출력 */}
                        <img src={photo.blob_url} alt={photo.original_name} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
};