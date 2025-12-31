import axios from "axios";

export const api = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

// 🔁 Retry config
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // если нет конфига — ничего не делаем
    if (!config) {
      return Promise.reject(error);
    }

    // счётчик ретраев
    config.__retryCount = config.__retryCount || 0;

    // условия для retry
    const shouldRetry =
      config.__retryCount < MAX_RETRIES &&
      (error.code === "ECONNABORTED" ||
        error.message?.includes("timeout") ||
        error.response?.status >= 500);

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    console.warn(
      `⏳ retry ${config.__retryCount}/${MAX_RETRIES} → ${config.url}`
    );

    // пауза перед повтором
    await new Promise((r) => setTimeout(r, RETRY_DELAY));

    return api(config);
  }
);
