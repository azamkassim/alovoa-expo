import * as WebBrowser from "expo-web-browser";
import { VIDEO_BASE_URL } from "../config/runtime";

function cleanRoomName(room: string): string {
  const cleaned = room
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || createRandomRoom();
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createRandomRoom(): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `oc-${time}-${random}`;
}

export function createPeerRoom(selfUuid: string, peerUuid: string): string {
  const pair = [selfUuid, peerUuid].filter(Boolean).sort().join(":");
  return `oc-peer-${hashString(pair)}`;
}

export function buildRoomUrl(room: string): string {
  return `${VIDEO_BASE_URL}/${encodeURIComponent(cleanRoomName(room))}`;
}

export async function openVideoRoom(room: string): Promise<void> {
  await WebBrowser.openBrowserAsync(buildRoomUrl(room));
}
