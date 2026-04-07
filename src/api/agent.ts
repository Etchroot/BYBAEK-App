// src/api/agent.ts
// baseURL = '.../api' 이므로 앞에 /api 붙이면 안 됨!

import apiClient from "./index";

// ── 타입 정의
export interface AgentRunRequest {
    shop_id: string;
    trigger: "auto" | "manual";
    photo_ids?: string[] | null;
}

export interface AgentReviewRequest {
    shop_id: string;
    post_id: string;
    action: "ok" | "edit" | "cancel";
    edited_caption?: string | null;
}

export interface PostSaveRequest {
    shop_id: string;
    caption: string;
    hashtags: string[];
    photo_ids: string[];
    cta: string;
    status?: string;
}

// ── API 함수

/**
 * 에이전트 파이프라인 실행
 */
export const runAgent = async (req: AgentRunRequest) => {
    const response = await apiClient.post("/agent/run", req);
    return response.data;
};

/**
 * 사장님 검토 결과 처리 (OK / 수정 / 취소)
 * POST /api/agent/review
 */
export const reviewPost = async (req: AgentReviewRequest) => {
    const response = await apiClient.post("/agent/review", req);
    return response.data;
};

/**
 * 게시물 목록 조회 (대시보드)
 */
export const getPosts = async (shop_id: string) => {
    const response = await apiClient.get(`/agent/posts/${shop_id}`);
    return response.data;
};

/**
 * 게시물 저장
 * POST /api/agent/save
 */
export const savePost = async (req: PostSaveRequest) => {
    const response = await apiClient.post("/agent/save", req);
    return response.data;
};

/**
 * 게시물 상세 조회
 * GET /api/agent/post/detail/{post_id}?shop_id={shop_id}
 */
export const getPostDetail = async (post_id: string, shop_id: string) => {
    const response = await apiClient.get(`/agent/post/detail/${post_id}`, {
        params: { shop_id },
    });
    return response.data;
};

/**
 * 에이전트 품질 지표 조회
 * GET /api/agent/metrics/{shop_id}
 */
export const getAgentMetrics = async (shop_id: string) => {
    const response = await apiClient.get(`/agent/metrics/${shop_id}`);
    return response.data;
};