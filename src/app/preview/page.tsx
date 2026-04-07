// 타겟 경로: src/app/preview/page.tsx
"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Photo, Album } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function PreviewScreen() {
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedShopId = localStorage.getItem('shop_id');
    setShopId(storedShopId || 'guest_shop');
  }, []);

  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [textRatio, setTextRatio] = useState(50);

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

  const [generatedCaption, setGeneratedCaption] = useState(
    t.preview.default_caption
  );

  useEffect(() => {
    // 채팅방 첫 인사말 초기화
    setMessages([
      { id: '1', sender: 'ai', text: t.preview.greeting }
    ]);

    // 우측 캡션 기본값도 번역된 텍스트로 초기화
    setGeneratedCaption(t.preview.default_caption);
  }, [t]);

  useEffect(() => {
    const el = rightTextareaRef.current;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight && textRatio < 66.6) {
      setTextRatio(prev => Math.min(66.6, prev + 2));
    }
  }, [generatedCaption, textRatio]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allRes = await apiClient.get(`/photos/all/${shopId}`);
        setAllPhotos(allRes.data.photos || []);

        const albumRes = await apiClient.get(`/photos/albums/${shopId}`);
        setAlbums(albumRes.data.albums || albumRes.data || []);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };

    fetchData();
  }, [shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const target = e.target;
    setInputText(target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${target.scrollHeight}px`;
    }
  };

  const handleRightWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
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

  const openPhotoModal = () => {
    setTempSelectedPhotos(images);
    setModalStep('ALBUM_LIST');
    setIsEditModalVisible(true);
  };

  const closePhotoModal = () => {
    setIsEditModalVisible(false);
  };

  const openOrderModal = () => {
    setTempSelectedPhotos(images);
    setIsOrderModalVisible(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalVisible(false);
  };

  const toggleTempSelect = (photo: Photo) => {
    setTempSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [...prev, photo]
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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));
  };

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

    if (
      !generatedCaption.trim() ||
      generatedCaption === t.preview.default_caption
    ) {
      setAlertMessage(t.preview.alert_no_caption);
      return;
    }

    setIsLoading(true);
    try {
      // 1단계: 초안 저장
      const saveRes = await apiClient.post('/agent/save', {
        shop_id: shopId,
        caption: generatedCaption,
        hashtags: [],
        photo_ids: images.map((img) => img.id),
        cta: "",
      });

      // 2단계: 인스타 업로드
      const reviewRes = await apiClient.post('/agent/review', {
        shop_id: shopId,
        post_id: saveRes.data.post_id,  // save에서 받은 post_id
        action: "ok"
      });

      if (reviewRes.data.status === 'uploaded') {
        setAlertMessage(t.preview.alert_upload_success);
      }
    } catch (error: any) {
      setAlertMessage(error.response?.data?.detail || t.preview.alert_upload_fail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, sender: 'ai', text: '' },
    ]);

    try {
      const response = await fetch(
        `${apiClient.defaults.baseURL}/custom_chat/manual_chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop_id: shopId,
            message: userText,
            photo_ids: images.map((img) => img.id),
          }),
        }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }

      try {
        const parsed = JSON.parse(fullResponse);
        const display = parsed.caption + "\n\n"
          + parsed.hashtags.join(" ") + "\n"
          + (parsed.cta || "");
        setGeneratedCaption(display);
      } catch {
        setGeneratedCaption(fullResponse); // 파싱 실패시 원본
      }
    } catch {
      // 스트리밍 에러 발생 시 무시
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="flex flex-row h-screen w-full bg-background overflow-hidden relative">
        <Sidebar />

        {/* 중앙 채팅 영역 */}
        <div className="flex-[1.5] bg-background border-r border-border p-large flex flex-col min-w-0 h-full">
          <div className="mb-large pb-small border-b border-border shrink-0">
            <h1 className="text-h1 text-text-primary font-bold">
              {t.preview.title_chat}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 scrollbar-hide min-h-0">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`max-w-[80%] p-medium rounded-xl break-words shrink-0 ${item.sender === 'user'
                  ? 'self-end bg-sidebar text-text-inverse'
                  : 'self-start bg-[#F5F5F5] text-text-primary'
                  }`}
              >
                <p className="text-body whitespace-pre-wrap">{item.text}</p>
              </div>
            ))}

            {isLoading && (
              <div className="max-w-[80%] p-medium rounded-xl self-start bg-[#F5F5F5] text-text-secondary flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-body">{t.preview.ai_typing}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex flex-col py-medium bg-background mt-4 shrink-0"
          >
            <div className="flex items-end gap-2 border border-[#E0E0E0] rounded-lg p-2 bg-background focus-within:border-accent">
              <textarea
                ref={textareaRef}
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent resize-none focus:outline-none min-h-[40px] max-h-[33vh] py-2 px-2"
                placeholder={t.preview.placeholder_req}
                value={inputText}
                onChange={handleTextareaChange}
                onKeyDown={handleInputKeyDown}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="font-bold text-accent px-medium mb-1.5 cursor-pointer"
              >
                {t.preview.btn_send}
              </button>
            </div>
          </form>
        </div>

        {/* 우측 프리뷰 영역 */}
        <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full overflow-hidden">

          <div className="flex flex-row justify-between items-center mb-medium shrink-0">
            <h2 className="text-h2 text-text-primary font-bold">
              {t.preview.title_result}
            </h2>
          </div>

          <div
            className="relative min-h-0 bg-[#EAEAEA] rounded-lg mb-small overflow-hidden flex items-center justify-center transition-all duration-300 ease-out group/viewer"
            style={{ flex: 100 - textRatio }}
          >
            {images.length > 0 && currentImageIndex > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
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
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex justify-center items-center hover:bg-gray-300 transition-colors shadow-sm focus:outline-none cursor-pointer"
                    title="현재 사진 제외"
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
                className="absolute right-4 z-10 w-12 h-12 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex items-center justify-center hover:bg-gray-300 transition-colors shadow-sm cursor-pointer focus:outline-none hover:scale-105"
                title={t.preview.btn_add_photo}
              >
                <svg className="w-7 h-7 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextImage}
                className="absolute right-4 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
              >
                {'>'}
              </button>
            )}
          </div>

          <button
            onClick={openOrderModal}
            className="w-full py-2 mb-medium border border-border rounded-lg bg-white text-[13px] text-text-secondary hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
          >
            {t.preview.btn_reorder_photo}
          </button>

          <div
            className="min-h-0 bg-background border border-border rounded-lg p-medium mb-large flex flex-col transition-all duration-300 ease-out"
            style={{ flex: textRatio }}
          >
            <textarea
              ref={rightTextareaRef}
              onWheel={handleRightWheel}
              className="flex-1 w-full h-full resize-none text-body bg-transparent focus:outline-none scrollbar-hide"
              value={generatedCaption}
              onChange={(e) => setGeneratedCaption(e.target.value)}
            />
          </div>

          {/* 🚨 [수정] 업로드 버튼 2:1 비율 분할 & 인스타그램 아이콘 추가 */}
          <div className="shrink-0 flex flex-row gap-3 h-[52px]">
            <button
              onClick={handleUpload}
              className="flex-[2] h-full bg-accent rounded-lg text-white font-bold text-[16px] hover:bg-accent-dark transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md cursor-pointer"
            >
              {t.preview.btn_upload_insta}
            </button>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[1] h-full bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm cursor-pointer transform hover:scale-[1.02]"
              title="인스타그램 바로가기"
            >
              {/* 인스타그램 브랜드 컬러(#E1306C) 적용 */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#E1306C">
                <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.321 4 20 5.679 20 7.75v8.5C20 18.321 18.321 20 16.25 20h-8.5C5.679 20 4 18.321 4 16.25v-8.5C4 5.679 5.679 4 7.75 4zm9.25 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      {/* 모달 1: 사진 추가 (앨범 2-Depth 구조) */}
      {isEditModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[600px] h-[600px] bg-background rounded-xl shadow-lg p-large flex flex-col">
            <div className="flex justify-between items-center mb-large border-b pb-small">
              <div className="flex items-center gap-3">
                {modalStep === 'PHOTO_LIST' && (
                  <button
                    onClick={() => setModalStep('ALBUM_LIST')}
                    className="text-text-secondary hover:text-accent font-bold text-2xl pb-1 cursor-pointer transition-colors"
                  >
                    {'<'}
                  </button>
                )}
                <h2 className="text-h2 font-bold text-text-primary">
                  {modalStep === 'ALBUM_LIST' ? t.preview.modal_album_select : currentAlbumTitle}
                </h2>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSavePhotos}
                  className="px-5 py-2 bg-accent text-white rounded-md font-bold text-sm cursor-pointer"
                >
                  {t.common.save}
                </button>
                <button
                  onClick={closePhotoModal}
                  className="text-[20px] text-text-secondary cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {modalStep === 'ALBUM_LIST' ? (
              <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 pr-2 scrollbar-hide content-start">
                <button
                  onClick={() => {
                    setCurrentAlbumPhotos(allPhotos);
                    setCurrentAlbumTitle(t.preview.all_photos || '전체 사진');
                    setModalStep('PHOTO_LIST');
                  }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border overflow-hidden group-hover:border-accent transition-colors flex items-center justify-center">
                    {allPhotos.length > 0 ? (
                      <img src={allPhotos[0].blob_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="전체사진 커버" />
                    ) : (
                      <span className="text-4xl text-gray-400">📁</span>
                    )}
                  </div>
                  <span className="font-bold text-text-primary text-[15px]">{t.preview.all_photos || '전체 사진'}</span>
                </button>

                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={async () => {
                      try {
                        const res = await apiClient.get(`/photos/albums/${shopId}/${album.id}`);
                        setCurrentAlbumPhotos(res.data.photos || []);
                        setCurrentAlbumTitle(album.album_name);
                        setModalStep('PHOTO_LIST');
                      } catch (error) {
                        console.error('앨범 사진 로딩 실패', error);
                      }
                    }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border overflow-hidden group-hover:border-accent transition-colors flex items-center justify-center relative">
                      <span className="text-4xl text-gray-400">📁</span>
                    </div>
                    <span className="font-bold text-text-primary text-[15px] truncate w-full px-2 text-center">{album.album_name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {currentAlbumPhotos.length === 0 ? (
                  <div className="flex w-full h-full items-center justify-center text-text-secondary font-bold">
                    {t.preview.empty_album}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 content-start">
                    {currentAlbumPhotos.map((photo) => {
                      const isSelected = tempSelectedPhotos.some((p) => p.id === photo.id);

                      return (
                        <button
                          key={photo.id}
                          onClick={() => toggleTempSelect(photo)}
                          className={`relative aspect-square rounded-lg border overflow-hidden cursor-pointer ${isSelected ? 'border-accent border-[3px]' : 'border-border'
                            }`}
                        >
                          <div
                            className={`absolute top-2 left-2 w-[22px] h-[22px] rounded border-2 flex justify-center items-center ${isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary'
                              }`}
                          >
                            {isSelected && (
                              <span className="text-white text-sm font-bold">✓</span>
                            )}
                          </div>
                          <img
                            src={photo.blob_url}
                            alt={photo.original_name || 'photo'}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 모달 2: 사진 순서 변경 */}
      {isOrderModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[450px] max-h-[600px] bg-background rounded-xl shadow-lg p-large flex flex-col">
            <div className="flex justify-between items-center mb-large border-b pb-small">
              <h2 className="text-h2 font-bold text-text-primary">
                {t.preview.modal_photo_reorder}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleSavePhotoOrder}
                  className="px-5 py-2 bg-accent text-white rounded-md font-bold text-sm cursor-pointer"
                >
                  {t.common.save}
                </button>
                <button
                  onClick={closeOrderModal}
                  className="text-[20px] text-text-secondary cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-hide">
              {tempSelectedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-border"
                >
                  <span className="font-bold text-accent w-5">
                    {index + 1}
                  </span>
                  <img
                    src={photo.blob_url}
                    alt={photo.original_name || 'photo'}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 text-sm font-medium truncate">
                    {photo.original_name}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => movePhotoUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => movePhotoDown(index)}
                      disabled={index === tempSelectedPhotos.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 알림창 UI */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-2xl p-8 w-[360px] flex flex-col items-center">

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