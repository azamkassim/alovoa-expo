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

export function createRandomRoom(): string {
  const time = Date.now().toString(36);
  const randomA = Math.random().toString(36).slice(2, 12);
  const randomB = Math.random().toString(36).slice(2, 12);
  return `oc-${time}-${randomA}-${randomB}`;
}

export function buildRoomUrl(room: string): string {
  return `${VIDEO_BASE_URL}/${encodeURIComponent(cleanRoomName(room))}`;
}

export async function openVideoRoom(room: string): Promise<void> {
  await WebBrowser.openBrowserAsync(buildRoomUrl(room));
}
