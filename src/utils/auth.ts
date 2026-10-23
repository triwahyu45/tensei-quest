// Client-side Zero-Knowledge Authentication Manager for Tensei Quest
// Passwords are cryptographically hashed via SHA-256 before storage.
// NO plain-text passwords or secret keys exist in the codebase.

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface HunterProfileSetup {
  fullName: string;
  mbti: string;
  primaryWeakness: string;
  targetGoal: string;
}

export interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: string;
  setup?: HunterProfileSetup;
}

const USERS_REGISTRY_KEY = 'tensei_quest_registered_users_v1';
const CURRENT_SESSION_KEY = 'tensei_quest_active_session_user';

export function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function authenticateUser(username: string, passwordPlain: string): Promise<boolean> {
  const users = getRegisteredUsers();
  const inputHash = await hashPassword(passwordPlain);
  
  const found = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.passwordHash === inputHash
  );

  if (found) {
    localStorage.setItem(CURRENT_SESSION_KEY, found.username);
    return true;
  }
  return false;
}

export async function registerNewUser(
  username: string,
  passwordPlain: string,
  setup?: HunterProfileSetup
): Promise<{ success: boolean; message: string }> {
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return { success: false, message: 'Username minimal 3 karakter.' };
  }
  if (passwordPlain.length < 4) {
    return { success: false, message: 'Password minimal 4 karakter.' };
  }

  const users = getRegisteredUsers();
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (exists) {
    return { success: false, message: 'Username sudah digunakan oleh Hunter lain!' };
  }

  const passwordHash = await hashPassword(passwordPlain);
  const newUser: StoredUser = {
    username: cleanUsername,
    passwordHash,
    createdAt: new Date().toISOString(),
    setup,
  };

  users.push(newUser);
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_SESSION_KEY, cleanUsername);
  return { success: true, message: 'Registrasi Hunter berhasil!' };
}

export function getCurrentSessionUser(): string | null {
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export function deleteCurrentUserAccount(): void {
  const current = getCurrentSessionUser();
  if (!current) return;

  const users = getRegisteredUsers().filter((u) => u.username.toLowerCase() !== current.toLowerCase());
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  
  // Wipe user's personal isolated storage slots
  const prefix = `tensei_quest_v1_${current.toLowerCase()}`;
  localStorage.removeItem(`${prefix}_player`);
  localStorage.removeItem(`${prefix}_quests`);
  localStorage.removeItem(`${prefix}_slots`);
  localStorage.removeItem(`${prefix}_skills`);
  localStorage.removeItem(`${prefix}_penalty`);
  
  localStorage.removeItem(CURRENT_SESSION_KEY);
}
