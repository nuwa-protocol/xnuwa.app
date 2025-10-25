import type { SessionState } from '../types';

// ==================== Session 管理器 ====================

export class SessionManager {
  private sessions = new Map<string, SessionState>();
  private timers = new Map<string, NodeJS.Timeout>();

  createSession(address: string, sessionKey: string, duration: number): void {
    // 清除旧的 session
    this.clearSession(address);

    const expiresAt = Date.now() + duration;
    this.sessions.set(address, { address, sessionKey, expiresAt });

    // 设置自动过期
    const timer = setTimeout(() => {
      this.clearSession(address);
    }, duration);
    this.timers.set(address, timer);
  }

  clearSession(address: string): void {
    this.sessions.delete(address);
    const timer = this.timers.get(address);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(address);
    }
  }

  getSession(address: string): SessionState | null {
    const session = this.sessions.get(address);
    if (!session) return null;

    if (Date.now() >= session.expiresAt) {
      this.clearSession(address);
      return null;
    }

    return session;
  }

  isSessionActive(address: string): boolean {
    return this.getSession(address) !== null;
  }

  getSessionRemainingTime(address: string): number {
    const session = this.getSession(address);
    if (!session) return 0;
    const remaining = session.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  getSessionKey(address: string): string | null {
    const session = this.getSession(address);
    return session ? session.sessionKey : null;
  }

  clearAllSessions(): void {
    for (const address of this.sessions.keys()) {
      this.clearSession(address);
    }
  }
}
