export default function WhoopAuth() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: '#22c55e22', boxShadow: '0 0 16px #22c55e30' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>

        <h1 className="text-lg font-semibold text-foreground mb-2">Connect WHOOP</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Authorize access to your recovery, sleep, and workout data.
        </p>

        <a
          href="/api/whoop/auth"
          className="block w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44' }}
        >
          Login with WHOOP
        </a>

        <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
          After connecting, copy the refresh token shown and add it to{' '}
          <code className="bg-secondary px-1 py-0.5 rounded text-xs">.env.local</code>,
          then restart the dev server.
        </p>
      </div>
    </div>
  );
}
