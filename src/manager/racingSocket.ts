import { getRacingUserId } from '@/api/auth';
import type { RacingResultPayload, WinnerRewardPayload, WsMessage } from '@/views/api/protocol';

type RacingSocketHandlers = {
  onReward?: (payload: WinnerRewardPayload) => void;
  onResult?: (payload: RacingResultPayload) => void;
  onOpen?: () => void;
  onError?: () => void;
};

export class RacingSocket {
  private socket?: WebSocket;
  private heartbeat?: number;
  private reconnect?: number;
  private reconnectAttempt = 0;
  private closedByUser = false;

  constructor(private handlers: RacingSocketHandlers = {}) {}

  connect() {
    const userId = getRacingUserId();
    if (!userId) return;
    this.closedByUser = false;
    const base = new URL(import.meta.env.VITE_APP_SERVER_URL, window.location.origin);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    base.pathname = `/ws/racing/${userId}`;
    base.search = '';
    this.socket = new WebSocket(base.toString());
    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.socket?.send(JSON.stringify({ type: 3 }));
      this.heartbeat = window.setInterval(() => this.socket?.send('ping'), 30_000);
      this.handlers.onOpen?.();
    };
    this.socket.onmessage = (event) => {
      if (event.data === 'pong') return;
      try {
        const message = JSON.parse(event.data) as WsMessage;
        if (message.type === 5) this.handlers.onReward?.(message.data as WinnerRewardPayload);
        if (message.type === 6) this.handlers.onResult?.(message.data as RacingResultPayload);
      } catch { /* Ignore malformed/non-business messages. */ }
    };
    this.socket.onerror = () => this.handlers.onError?.();
    this.socket.onclose = () => this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    if (this.closedByUser) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt++, 30_000);
    this.reconnect = window.setTimeout(() => this.connect(), delay);
  }

  close() {
    this.closedByUser = true;
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    if (this.reconnect) window.clearTimeout(this.reconnect);
    this.socket?.close();
  }
}
