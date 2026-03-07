// 環境変数の参照箇所をここに集約して feature から直接 import.meta.env を隠す。
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
