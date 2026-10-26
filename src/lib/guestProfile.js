import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "guestProfile";

export function getGuestProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveGuestProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearGuestProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

export function normalizeUsername(name) {
  return name.trim().toLowerCase();
}

// Creates a guest profile with a unique username; throws a readable error
// when the name is invalid or already taken.
export async function createGuestProfile(name) {
  const username = name.trim();
  const key = normalizeUsername(username);

  if (!/^[a-z0-9._]{3,20}$/.test(key)) {
    throw new Error("Username must be 3–20 characters: letters, numbers, dots or underscores");
  }

  const existing = await base44.entities.GuestProfile.filter({ username_key: key });
  if (existing.length) throw new Error("That username is already taken");

  const profile = await base44.entities.GuestProfile.create({
    username,
    username_key: key,
    wishlist: [],
  });

  saveGuestProfile({ id: profile.id, username: profile.username, username_key: profile.username_key });
  return profile;
}