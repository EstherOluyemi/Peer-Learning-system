import React from 'react';
import { Shield, AlertCircle, CheckCircle2, RefreshCcw, LogIn, LogOut } from 'lucide-react';

const formatExpiry = (value) => {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
};

const GoogleMeetAuthPanel = ({
  connected,
  expiresAt,
  loading,
  error,
  onConnect,
  onRefresh,
  onDisconnect,
}) => {
  const statusLabel = connected ? 'Connected' : 'Not connected';
  const statusTone = connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Google Meet Connection</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Secure OAuth 2.0 connection is required to create Meet links.
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusTone}`}>{statusLabel}</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert" aria-live="assertive">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          {connected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
          <span>Token expires: {formatExpiry(expiresAt)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!connected && (
            <button
              type="button"
              onClick={onConnect}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              Connect Google
            </button>
          )}
          {connected && (
            <>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh token
              </button>
              <button
                type="button"
                onClick={onDisconnect}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleMeetAuthPanel;
