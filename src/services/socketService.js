// src/services/socketService.js
// Native WebSocket singleton with auth, auto-reconnect, and a simple event emitter.

const WS_BASE =
    import.meta.env.VITE_WS_URL ||
    (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
        .replace(/^http/, 'ws')
        .replace('/api', '');

const MAX_RECONNECT = 5;
const BACKOFF_BASE = 1000; // ms

class SocketService {
    constructor() {
        this._ws = null;
        this._listeners = {}; // eventName → Set<cb>
        this._reconnectAttempts = 0;
        this._reconnectTimer = null;
        this._token = null;
        this._connected = false;
        this._intentionalClose = false;
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /** Connect (or re-use existing connection). */
    connect(token) {
        if (token) this._token = token;
        if (this._ws && (this._ws.readyState === WebSocket.OPEN ||
            this._ws.readyState === WebSocket.CONNECTING)) return;

        this._intentionalClose = false;
        this._open();
    }

    /** Gracefully close the socket. */
    disconnect() {
        this._intentionalClose = true;
        clearTimeout(this._reconnectTimer);
        if (this._ws) {
            this._ws.close(1000, 'logout');
            this._ws = null;
        }
        this._connected = false;
    }

    /** Send a typed event payload to the server. */
    emit(event, data) {
        if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
            console.warn('[socket] Not connected – drop emit:', event);
            return false;
        }
        this._ws.send(JSON.stringify({ event, data }));
        return true;
    }

    /** Subscribe to a server-sent event. Returns an unsubscribe fn. */
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = new Set();
        this._listeners[event].add(callback);
        return () => this.off(event, callback);
    }

    /** Unsubscribe from an event. */
    off(event, callback) {
        this._listeners[event]?.delete(callback);
    }

    get isConnected() { return this._connected; }

    // ── Private ────────────────────────────────────────────────────────────────

    _open() {
        const token = this._token || localStorage.getItem('peerlearn_token');
        if (!token) {
            console.warn('[socket] No auth token – skipping connect');
            return;
        }

        const url = `${WS_BASE}/ws?token=${encodeURIComponent(token)}`;
        try {
            this._ws = new WebSocket(url);
        } catch (err) {
            console.error('[socket] WebSocket constructor failed:', err);
            this._scheduleReconnect();
            return;
        }

        this._ws.onopen = () => {
            console.log('[socket] Connected');
            this._connected = true;
            this._reconnectAttempts = 0;
            this._emit('connect', {});
        };

        this._ws.onmessage = (ev) => {
            try {
                const { event, data } = JSON.parse(ev.data);
                this._emit(event, data);
            } catch (err) {
                console.error('[socket] Bad message:', err);
            }
        };

        this._ws.onerror = (err) => {
            console.error('[socket] Error:', err);
            this._emit('error', err);
        };

        this._ws.onclose = (ev) => {
            this._connected = false;
            this._emit('disconnect', { code: ev.code });
            if (!this._intentionalClose && ev.code !== 1000) {
                this._scheduleReconnect();
            }
        };
    }

    _scheduleReconnect() {
        if (this._reconnectAttempts >= MAX_RECONNECT) {
            console.warn('[socket] Max reconnects reached');
            return;
        }
        const delay = BACKOFF_BASE * 2 ** this._reconnectAttempts;
        this._reconnectAttempts++;
        console.log(`[socket] Reconnecting in ${delay}ms (attempt ${this._reconnectAttempts})`);
        this._reconnectTimer = setTimeout(() => this._open(), delay);
    }

    _emit(event, data) {
        this._listeners[event]?.forEach(cb => {
            try { cb(data); } catch (e) { console.error('[socket] Listener error:', e); }
        });
    }
}

// Export a singleton
const socketService = new SocketService();
export default socketService;
