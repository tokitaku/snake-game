// 環境変数の参照箇所をここに集約して feature から直接 import.meta.env を隠す。
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// API パス結合時の二重スラッシュを防ぐため末尾スラッシュを除去する。
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
