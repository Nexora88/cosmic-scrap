// Small, testable interpolation layer for a remote pilot marker.
// This is presence rendering only; it does not authorize gameplay state.
export class RemotePilot {
  constructor() { this.reset(); }
  reset() { this.current = null; this.target = null; this.lastSeenAt = 0; }
  receive(snapshot, now = 0) {
    if (!snapshot || !Number.isFinite(snapshot.xNorm) || !Number.isFinite(snapshot.yNorm)) return false;
    const next = {
      xNorm: Math.max(0, Math.min(1, snapshot.xNorm)),
      yNorm: Math.max(0, Math.min(1, snapshot.yNorm)),
      username: String(snapshot.username || "CO-PILOT").slice(0, 24)
    };
    if (!this.current) this.current = { ...next };
    this.target = next;
    this.lastSeenAt = now;
    return true;
  }
  update(width, height, now = 0, smoothing = 0.22) {
    if (!this.current || !this.target || now - this.lastSeenAt > 5000 || width <= 0 || height <= 0) return null;
    const alpha = Math.max(0, Math.min(1, smoothing));
    this.current.xNorm += (this.target.xNorm - this.current.xNorm) * alpha;
    this.current.yNorm += (this.target.yNorm - this.current.yNorm) * alpha;
    this.current.username = this.target.username;
    return { x: this.current.xNorm * width, y: this.current.yNorm * height, username: this.current.username, alpha: 1 };
  }
}
