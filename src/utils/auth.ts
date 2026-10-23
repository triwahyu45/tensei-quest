// Cryptographic hashing and Authentication Manager for Solo Leveling System

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_REGISTRY_KEY = 'solo_leveling_registered_users_v1';
const CURRENT_SESSION_KEY = 'solo_leveling_active_session_user';

// Tri Wahyu's pre-seeded default account hash (password: "@Triwahyu45")
// SHA-256 for "@Triwahyu45"
const TRI_DEFAULT_HASH = '751212f7035dc672925ca83c79a906b72bde9bec9cff61e6e0fafebee05ddbc3';

export function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (!raw) {
      // Seed with Triwahyu45 default
      const defaultList: StoredUser[] = [
        {
          username: 'Triwahyu45',
          passwordHash: TRI_DEFAULT_HASH,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(defaultList));
      return defaultList;
    }
    return JSON.parse(raw);
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

export async function registerNewUser(username: string, passwordPlain: string): Promise<{ success: boolean; message: string }> {
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
  };

  users.push(newUser);
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_SESSION_KEY, cleanUsername);
  return { success: true, message: 'Registrasi Hunter berhasil!' };
}

export function getCurrentSessionUser(): string {
  return localStorage.getItem(CURRENT_SESSION_KEY) || 'Triwahyu45';
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export function deleteCurrentUserAccount(): void {
  const current = getCurrentSessionUser();
  const users = getRegisteredUsers().filter((u) => u.username.toLowerCase() !== current.toLowerCase());
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  
  // Wipe user's personal storage slots
  localStorage.removeItem(`tri_wahyu_solo_leveling_v1_${current}_player`);
  localStorage.removeItem(`tri_wahyu_solo_leveling_v1_${current}_quests`);
  localStorage.removeItem(`tri_wahyu_solo_leveling_v1_${current}_slots`);
  localStorage.removeItem(`tri_wahyu_solo_leveling_v1_${current}_skills`);
  localStorage.removeItem(`tri_wahyu_solo_leveling_v1_${current}_penalty`);
  
  localStorage.removeItem(CURRENT_SESSION_KEY);
}
