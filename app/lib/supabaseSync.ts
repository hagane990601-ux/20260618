const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEVICE_ID_KEY = "menu-mvp.deviceId";

export const SAVED_DATA_KEYS = [
  "menu-mvp.fridgeIngredients",
  "menu-mvp.favoriteMenus",
  "menu-mvp.cookedHistory",
  "menu-mvp.reminder",
  "menu-mvp.streak",
  "menu-mvp.weeklyStatus",
  "menu-mvp.todayShoppingChecks",
  "menu-mvp.weeklyShoppingChecks",
  "menu-mvp.todayShoppingHidden",
  "menu-mvp.weeklyShoppingHidden",
] as const;

type SavedData = Record<string, string>;

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getDeviceId() {
  if (typeof window === "undefined") return "";

  const existingId = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existingId) return existingId;

  const deviceId = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function readLocalSavedData(): SavedData {
  if (typeof window === "undefined") return {};

  return SAVED_DATA_KEYS.reduce<SavedData>((data, key) => {
    const value = window.localStorage.getItem(key);
    if (value) data[key] = value;
    return data;
  }, {});
}

export function writeLocalSavedData(data: SavedData) {
  if (typeof window === "undefined") return;

  Object.entries(data).forEach(([key, value]) => {
    if (SAVED_DATA_KEYS.includes(key as (typeof SAVED_DATA_KEYS)[number])) {
      window.localStorage.setItem(key, value);
    }
  });
}

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY ?? "",
    Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function loadSupabaseSavedData(deviceId: string): Promise<SavedData | null> {
  if (!configured() || !deviceId) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_user_data?device_id=eq.${encodeURIComponent(deviceId)}&select=data`,
      { headers: headers() },
    );
    if (!response.ok) return null;

    const rows = (await response.json()) as Array<{ data?: SavedData }>;
    return rows[0]?.data ?? null;
  } catch {
    return null;
  }
}

export async function syncSupabaseSavedData(deviceId: string, data: SavedData) {
  if (!configured() || !deviceId) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/menu_user_data?on_conflict=device_id`, {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ device_id: deviceId, data, updated_at: new Date().toISOString() }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
