// 타겟 경로: src/components/PhotoSyncProgress.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';

interface SyncStatus {
  shop_id: string;
  status: string;        // "idle" | "running" | "done" | "error"
  total_scanned: number;
  stage1_passed: number;
  stage2_passed: number;
  message: string;
}

export function PhotoSyncProgress() {
  const [shopId, setShopId] = useState<string | null>(null);
  const { t } = useTranslation();

  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const wasRunningRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncStartedRef = useRef<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem('shop_id');
    setShopId(storedId);
  }, []);

  // sync 시작 + 폴링
  useEffect(() => {
    if (!shopId) return;

    const startSyncAndPoll = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') return;

      // 최초 1회만 sync 트리거
      if (!syncStartedRef.current) {
        syncStartedRef.current = true;
        try {
          // Next.js API route를 통해 프록시 호출 (쿠키 자동 포함)
          await fetch('/api/sync-onedrive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shop_id: shopId }),
          });
        } catch {
          // sync 시작 실패 (이미 실행 중이거나 연동 안 됨)
        }
      }

      // 상태 폴링
      const poll = async () => {
        try {
          const response = await fetch(`/api/sync-onedrive?shop_id=${shopId}`);
          const data: SyncStatus = await response.json();
          setStatus(data);

          if (data.status === 'running') {
            setIsVisible(true);
            wasRunningRef.current = true;
          } else if (data.status === 'done' && wasRunningRef.current) {
            wasRunningRef.current = false;
            // 완료 후 5초 뒤 숨김
            setTimeout(() => setIsVisible(false), 5000);
            // 최초 sync 완료면 사진 선택 모달
            const isFirstSync = !localStorage.getItem('sync_done');
            if (isFirstSync) {
              localStorage.setItem('sync_done', 'true');
              fetchPhotosForSelection();
              setShowFavoriteModal(true);
            }
            // 폴링 중단
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else if (data.status === 'error') {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        } catch (error) {
          // 에러 시 폴링 중단
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      };

      poll();
      intervalRef.current = setInterval(poll, 5000);
    };

    startSyncAndPoll();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [shopId]);

  const fetchPhotosForSelection = async () => {
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setAllPhotos(response.data.photos || []);
    } catch (error) {
      console.error('사진 로딩 실패:', error);
    }
  };

  const toggleFavoriteSelect = (photoId: string) => {
    setSelectedFavorites((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      } else {
        if (prev.length >= 3) {
          setAlertMessage(t.photo_sync.alert_max_3);
          return prev;
        }
        return [...prev, photoId];
      }
    });
  };

  const handleSaveFavorites = async () => {
    if (selectedFavorites.length < 3) {
      setAlertMessage(t.photo_sync.alert_min_3);
      return;
    }
    try {
      await apiClient.post(`/onboarding/favorites/${shopId}`, {
        favorite_photos: selectedFavorites,
      });
      setAlertMessage(t.photo_sync.alert_setup_complete);
      setShowFavoriteModal(false);
    } catch {
      setAlertMessage(t.photo_sync.alert_save_error);
    }
  };

  // 퍼센트 계산 (stage1 기준)
  const percent =
    status && status.total_scanned > 0
      ? Math.round((status.stage1_passed / status.total_scanned) * 100)
      : 0;

  const isSyncing = status?.status === 'running';

  return (
    <>
      {/* 상단 동기화 프로그래스 바 */}
      {isVisible && status && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-[9000] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {isSyncing ? (
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              ) : (
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              )}
              <h3 className="text-[15px] font-bold text-gray-800">
                {isSyncing ? t.photo_sync.syncing_msg : t.photo_sync.sync_complete_msg}
              </h3>
            </div>
            {!isSyncing && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full h-2.5 bg-gray-100 rounded-full mb-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${isSyncing ? 'bg-blue-500' : 'bg-green-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex justify-between text-[13px] text-gray-500 mb-1 px-1">
            <span>{t.photo_sync.progress_label}</span>
            <span className="font-bold">
              {status.stage1_passed} / {status.total_scanned}장 ({percent}%)
            </span>
          </div>

          {/* 메시지 */}
          <p className="text-[12px] text-gray-400 text-center mt-2">{status.message}</p>
        </div>
      )}

      {/* 최초 동기화 완료 후: 베스트 사진 3장 선택 모달 */}
      {showFavoriteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[850px] h-[650px] flex flex-col p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-[26px] font-bold text-text-primary mb-2">
                  {t.photo_sync.modal_title}
                </h2>
                <p className="text-text-secondary text-[15px]">
                  {t.photo_sync.modal_desc_1}
                  <br />
                  {t.photo_sync.modal_desc_2}
                  <strong className="text-accent">{t.photo_sync.modal_desc_strong}</strong>
                  {t.photo_sync.modal_desc_3}
                  ({selectedFavorites.length}/3)
                </p>
              </div>
              <button
                onClick={handleSaveFavorites}
                disabled={selectedFavorites.length < 3}
                className={`px-8 py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-md ${selectedFavorites.length === 3
                  ? 'bg-accent text-white hover:bg-accent-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {t.photo_sync.btn_complete_select}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide border-t border-gray-100 pt-6">
              {allPhotos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {t.photo_sync.no_photos_to_load}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 pb-4">
                  {allPhotos.map((photo) => {
                    const isSelected = selectedFavorites.includes(photo.id);
                    return (
                      <button
                        key={photo.id}
                        onClick={() => toggleFavoriteSelect(photo.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${isSelected
                          ? 'border-accent ring-4 ring-accent/20'
                          : 'border-transparent hover:border-gray-300'
                          }`}
                      >
                        <img
                          src={photo.blob_url}
                          className="w-full h-full object-cover"
                          alt={t.photo_sync.alt_candidate_photo}
                        />
                        <div
                          className={`absolute top-3 left-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                            ? 'bg-accent border-accent shadow-lg'
                            : 'bg-black/20 border-white/80'
                            }`}
                        >
                          {isSelected && (
                            <span className="text-white text-sm font-bold">✓</span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shadow-lg">
                            {selectedFavorites.indexOf(photo.id) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 알림창 UI */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[360px] flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-sm text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full py-3 bg-accent text-white rounded-lg font-bold cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none"
            >
              {t.common?.confirm || '확인'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
