/** OneDrive에서 동기화된 사진 */
export interface Photo {
  id: string;
  original_name: string;
  blob_url: string;
}

/** 앨범 */
export interface Album {
  id: string;
  album_name: string;
  description?: string;
  photo_count?: number;
}

/** 대시보드 게시물 */
export interface Post {
  id: string;
  caption?: string;
  hashtags?: string[];
  thumbnail_url?: string;
  photo_urls?: string[];
  created_at?: string;
  updated_at?: string;
  status?: string;
}

/** 게시물 상세 */
export interface PostDetail {
  id: string;
  caption: string;
  hashtags?: string[];
  photo_urls?: string[];
  created_at?: string;
  updated_at?: string;
}
