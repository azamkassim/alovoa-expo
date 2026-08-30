import Constants from "expo-constants";

type RuntimeExtra = {
  appName?: string;
  apiUrl?: string;
  videoBaseUrl?: string;
  sourceRepo?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as RuntimeExtra;

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export const APP_NAME = extra.appName?.trim() || "OpenCircle";
export const API_BASE_URL = normalizeBaseUrl(extra.apiUrl || "http://localhost:8080");
export const VIDEO_BASE_URL = normalizeBaseUrl(extra.videoBaseUrl || "https://meet.jit.si");
export const SOURCE_REPO = extra.sourceRepo || "https://github.com/azamkassim/alovoa-expo";

export const IS_ALOVOA_PRODUCTION = API_BASE_URL.toLowerCase() === "https://alovoa.com";
export const IS_LOCAL_BACKEND = /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/i.test(API_BASE_URL);
