// 타겟 경로: src/app/album/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AlbumCard } from '@/components/AlbumCard';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
  thumbnailUrl?: string;
}

export default function MyAlbumScreen() {
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedShopId = localStorage.getItem('shop_id');
    setShopId(storedShopId); 
  }, []);

  const { t } = useTranslation();

  const [albums, setAlbums] = useState<AlbumData[]>([{ id: 'new', isNew: true }]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);

  const [isPhotoSelectModalVisible, setIsPhotoSelectModalVisible] = useState(false);
  const [allPhotos, setAllPhotos] = useState<any[]>([]); 
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]); 

  useEffect(() => {
    if (!shopId) return;
    fetchAlbums();
    fetchAllPhotos();
  }, [shopId]);
  
  const fetchAlbums = async () => {
    try {
      const response = await apiClient.get(`/photos/albums/${shopId}`);
      const dbAlbums = response.data.albums.map((album: any) => ({
        id: album.id,
        title: album.album_name,
        photoCount: album.photo_count,
        description: album.description || t.album.no_desc,
        thumbnailUrl: album.thumbnail_url
      }));
      setAlbums([{ id: 'new', isNew: true }, ...dbAlbums]);
    } catch (error) {
      console.error("앨범 로딩 실패:", error);
      setAlbums([{ id: 'new', isNew: true }]);
    }
  };

  const fetchAllPhotos = async () => {
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setAllPhotos(response.data.photos || []);
    } catch (error) {
      console.error("전체 사진 로딩 실패:", error);
    }
  };

  const handleRemovePhotoFromAlbum = async (photoId: string) => {
    if (!selectedAlbum) return;
    if (!window.confirm(t.album.confirm_remove)) return;

    const updatedPhotos = albumPhotos.filter(p => p.id !== photoId);
    const updatedPhotoIds = updatedPhotos.map(p => p.id);

    try {
      await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id,
        album_name: editTitle,
        description: editDesc,
        photo_ids: updatedPhotoIds
      });
      setAlbumPhotos(updatedPhotos);
      setSelectedAlbum({ ...selectedAlbum, photoCount: updatedPhotos.length });
      fetchAlbums();
    } catch (error) {
      console.error("앨범 수정 실패:", error);
    }
  };

  const handleSaveSelectedPhotos = async () => {
    if (!selectedAlbum || tempSelectedIds.length === 0) return;

    const currentIds = albumPhotos.map(p => p.id);
    const combinedIds = Array.from(new Set([...currentIds, ...tempSelectedIds]));

    try {
      await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id,
        album_name: editTitle,
        description: editDesc,
        photo_ids: combinedIds
      });

      const response = await apiClient.get(`/photos/albums/${shopId}/${selectedAlbum.id}`);
      setAlbumPhotos(response.data.photos);
      setSelectedAlbum({ ...selectedAlbum, photoCount: response.data.photos.length });
      
      fetchAlbums();
      setIsPhotoSelectModalVisible(false); 
      setTempSelectedIds([]); 
    } catch (error) {
      console.error("사진 추가 실패:", error);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openAlbumDetail = async (album: AlbumData) => {
    setSelectedAlbum(album);
    setEditTitle(album.id === 'new' ? '' : (album.title || ''));
    setEditDesc(album.id === 'new' ? '' : (album.description || ''));

    if (album.id !== 'new') {
      try {
        const response = await apiClient.get(`/photos/albums/${shopId}/${album.id}`);
        setAlbumPhotos(response.data.photos);
      } catch (error) {
        setAlbumPhotos([]);
      }
    } else {
      setAlbumPhotos([]);
    }
    setIsDetailModalVisible(true);
  };

  const handleSaveOverlay = async () => {
    if (!selectedAlbum) return;
    try {
      const photoIds = albumPhotos.map(p => p.id);
      const response = await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id, 
        album_name: editTitle || t.album.default_new_name,
        description: editDesc,
        photo_ids: photoIds
      });

      if (selectedAlbum.id === 'new' && response.data.album_id) {
        setSelectedAlbum({
          ...selectedAlbum,
          id: response.data.album_id,
          isNew: false
        });
      }

      await fetchAlbums(); 
      setIsDetailModalVisible(false); 
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  const handleDeleteAlbums = async () => {
    if (selectedIndexes.length === 0) return;
    const confirmMessage = t.album.confirm_delete.replace('{count}', selectedIndexes.length.toString());
    
    if (window.confirm(confirmMessage)) {
      try {
        await Promise.all(
          selectedIndexes.map(async (idx) => {
            const albumId = albums[idx].id;
            if (albumId !== 'new') return apiClient.delete(`/photos/albums/${shopId}/${albumId}`);
          })
        );
        fetchAlbums();
        setSelectedIndexes([]);
      } catch (error) {
        console.error("앨범 삭제 실패:", error);
      }
    }
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          <h1 className="text-h1 font-bold text-text-primary">{t.album.title}</h1>
          <button onClick={handleDeleteAlbums} className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors">
            {t.album.delete_selected}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-large scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((item, index) => {
              if (item.isNew) {
                return (
                  <button key={item.id} onClick={() => openAlbumDetail(item)} className="w-full h-full min-h-[260px] bg-white rounded-xl border-2 border-dashed border-[#D0D0D0] flex flex-col justify-center items-center hover:bg-gray-50 group">
                    <span className="text-[40px] font-light text-[#A0A0A0] mb-2 group-hover:scale-110 transition-transform">+</span>
                    <span className="text-[16px] font-bold text-[#1A1A1A]">{t.album.create_new}</span>
                  </button>
                );
              }
              return (
                <AlbumCard key={item.id} item={item} index={index} isSelected={selectedIndexes.includes(index)} onToggleSelect={toggleSelect} onOpenDetail={openAlbumDetail} />
              );
            })}
          </div>
        </div>

      {/* 🚨 [핵심 수정 구간] 앨범 상세 오버레이 */}
      {isDetailModalVisible && selectedAlbum && (
        <div className="absolute inset-0 z-[9999] bg-white flex flex-row">
          <Sidebar /> 
          {/* 화면 크기에 따라 패딩을 조절 (모바일: p-5, PC: p-[40px]) */}
          <div className="flex-1 p-5 md:p-[40px] flex flex-col h-screen overflow-hidden">
            
            {/* 🚨 flex-col md:flex-row 로 좁은 화면에선 위아래로 배치, 넓은 화면에선 좌우 배치 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-[30px] shrink-0 w-full">
              
              {/* 🚨 min-w-0을 추가해서 인풋 창이 화면을 넘어 밀어내는 현상 방지 */}
              <div className="flex-1 min-w-0 w-full pr-0 md:pr-5 flex flex-col">
                <input 
                  type="text" 
                  className="text-[24px] md:text-[32px] font-bold text-[#1A1A1A] mb-2 focus:outline-none bg-transparent w-full min-w-0" 
                  placeholder={t.album.placeholder_title} 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                />
                <input 
                  type="text" 
                  className="text-sm md:text-base text-[#666666] mb-4 focus:outline-none bg-transparent w-full min-w-0" 
                  placeholder={t.album.placeholder_desc} 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)} 
                />
                <span className="text-[14px] md:text-[15px] text-[#888] font-bold">
                  {t.album.total_photos.replace('{count}', (selectedAlbum.photoCount || 0).toString())}
                </span>
              </div>

              {/* 🚨 shrink-0을 추가해서 버튼들이 절대 찌그러지거나 밀려나지 않게 보호 */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                <div className="flex flex-row items-center gap-2 md:gap-3">
                  <button onClick={handleSaveOverlay} className="bg-[#1A1A1A] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-sm">
                    {t.common.save}
                  </button>
                  <button onClick={() => setIsDetailModalVisible(false)} className="bg-[#8A0020] text-white w-9 h-9 md:w-10 md:h-10 rounded-full flex justify-center items-center text-[18px] md:text-[20px] font-bold">
                    ✕
                  </button>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <button 
                    onClick={() => {
                      setTempSelectedIds([]); 
                      setIsPhotoSelectModalVisible(true);
                    }}
                    className="bg-[#8A0020] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors"
                  >
                    {t.album.add_photo}
                  </button>
                </div>
              </div>
            </div>

            {/* 사진 그리드 영역 */}
            <div className={`flex-1 bg-[#F9F9F9] rounded-xl border border-[#E0E0E0] min-h-0 overflow-y-auto ${albumPhotos.length > 0 ? 'p-4 md:p-[30px] block' : 'flex justify-center items-center'}`}>
              {albumPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {albumPhotos.map((photo: any) => (
                    <div key={photo.id} className="relative aspect-square bg-white rounded-lg overflow-hidden border border-[#EEE] group">
                      <img src={photo.blob_url} alt={photo.original_name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                      <button onClick={(e) => { e.stopPropagation(); handleRemovePhotoFromAlbum(photo.id); }} className="absolute top-2 right-2 bg-white/80 text-red-600 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[16px] md:text-[18px] text-[#A0A0A0]">{t.album.empty_album}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사진 선택 모달 */}
      {isPhotoSelectModalVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[800px] h-[80vh] md:h-[600px] flex flex-col p-5 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">{t.album.modal_photo_title}</h2>
              <div className="flex gap-2 md:gap-3">
                <button 
                  onClick={handleSaveSelectedPhotos}
                  className="bg-accent text-white px-4 md:px-6 py-2 rounded-lg font-bold hover:bg-accent-dark transition-colors text-sm md:text-base"
                >
                  {t.common.save}
                </button>
                <button 
                  onClick={() => setIsPhotoSelectModalVisible(false)}
                  className="text-text-secondary hover:text-text-primary text-xl px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                {allPhotos.map((photo) => {
                  const isTempSelected = tempSelectedIds.includes(photo.id);
                  return (
                    <button 
                      key={photo.id}
                      onClick={() => {
                        setTempSelectedIds(prev => 
                          isTempSelected ? prev.filter(id => id !== photo.id) : [...prev, photo.id]
                        );
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isTempSelected ? 'border-accent ring-2 ring-accent' : 'border-transparent'
                      }`}
                    >
                      <img src={photo.blob_url} className="w-full h-full object-cover" />
                      <div className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isTempSelected ? 'bg-accent border-accent' : 'bg-white/80 border-gray-400'
                      }`}>
                        {isTempSelected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}