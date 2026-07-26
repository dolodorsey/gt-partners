"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SUPABASE_URL = "https://dzlmtvodpyhetvektfuo.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImR6bG10dm9kcHloZXR2ZWt0ZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODQ4NjQsImV4cCI6MjA4NTE2MDg2NH0.qmnWB4aWdb7U8Iod9Hv8PQAOJO3AG0vYEGnPS--kfAo";
const STORAGE_KEY = "gt_partner_admin_session";
const PROTECTED_TABLES = [
  "/rest/v1/gt_partner_applications",
  "/rest/v1/gt_ad_placements",
  "/rest/v1/gt_ticket_partnerships",
];

function authHeaders(accessToken) {
  return {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function storeSession(session) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function sessionFromHash() {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const values = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = values.get("access_token");
  const refreshToken = values.get("refresh_token");
  const expiresIn = Number(values.get("expires_in") || 3600);
  if (!accessToken) return null;

  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  };
}

async function refreshSession(session) {
  if (!session?.refresh_token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return {
    ...payload,
    expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
  };
}

async function ensureFreshSession(session) {
  if (!session?.access_token) return null;
  const expiresAt = Number(session.expires_at || 0);
  if (!expiresAt || expiresAt > Math.floor(Date.now() / 1000) + 60) return session;
  return refreshSession(session);
}

async function getAdminStatus(accessToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gt_partner_admin_status`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: "{}",
  });
  if (!response.ok) return { authenticated: false, is_admin: false, email: null };
  return response.json();
}

function installAuthenticatedFetch(accessToken) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const isProtectedRequest =
      url.startsWith(SUPABASE_URL) && PROTECTED_TABLES.some((path) => url.includes(path));

    if (!isProtectedRequest) return originalFetch(input, init);

    const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
    headers.set("apikey", SUPABASE_ANON);
    headers.set("Authorization", `Bearer ${accessToken}`);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    return originalFetch(input, { ...init, headers });
  };

  return () => {
    window.fetch = originalFetch;
  };
}

export default function SecureAdminGate({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("checking");
  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("thedoctordorsey@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback(async (candidate) => {
    setStatus("checking");
    const fresh = await ensureFreshSession(candidate);
    if (!fresh) {
      storeSession(null);
      setSession(null);
      setStatus("signed_out");
      return;
    }

    const admin = await getAdminStatus(fresh.access_token);
    if (!admin?.is_admin) {
      storeSession(null);
      setSession(null);
      setAdminEmail(admin?.email || "");
      setStatus(admin?.authenticated ? "forbidden" : "signed_out");
      return;
    }

    storeSession(fresh);
    setSession(fresh);
    setAdminEmail(admin.email || fresh.user?.email || "");
    setStatus("authorized");
  }, []);

  useEffect(() => {
    const fromHash = sessionFromHash();
    validate(fromHash || readStoredSession());
  }, [validate]);

  useEffect(() => {
    if (status !== "authorized" || !session?.access_token) return undefined;
    return installAuthenticatedFetch(session.access_token);
  }, [session, status]);

  const signIn = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error_description || payload.msg || "Sign-in failed.");
      await validate({
        ...payload,
        expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
      });
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
      setStatus("signed_out");
    } finally {
      setSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          create_user: false,
          options: { email_redirect_to: `${window.location.origin}/admin` },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.msg || payload.error_description || "Unable to send login link.");
      setMessage("Secure login link sent. Open it in this browser to continue.");
    } catch (error) {
      setMessage(error.message || "Unable to send login link.");
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = () => {
    storeSession(null);
    setSession(null);
    setAdminEmail("");
    setPassword("");
    setStatus("signed_out");
  };

  const shell = useMemo(
    () => ({
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background:
        "radial-gradient(circle at top right, rgba(200,169,110,.16), transparent 36%), #080808",
      color: "#F0EDE6",
      fontFamily: "'Instrument Sans','Helvetica Neue',sans-serif",
    }),
    [],
  );

  if (status === "checking") {
    return <main style={shell}><p>Verifying secure admin access…</p></main>;
  }

  if (status === "authorized") {
    return (
      <>
        <div style={{
          position: "fixed",
          zIndex: 9999,
          right: 16,
          top: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          border: "1px solid rgba(200,169,110,.28)",
          borderRadius: 10,
          background: "rgba(8,8,8,.88)",
          color: "#C8A96E",
          fontSize: 11,
          backdropFilter: "blur(14px)",
        }}>
          <span>{adminEmail}</span>
          <button type="button" onClick={signOut} style={{
            border: 0,
            background: "transparent",
            color: "#F0EDE6",
            cursor: "pointer",
            font: "inherit",
          }}>Sign out</button>
        </div>
        {children}
      </>
    );
  }

  return (
    <main style={shell}>
      <section style={{
        width: "min(440px, 100%)",
        padding: "34px 30px",
        border: "1px solid rgba(255,255,255,.10)",
        borderRadius: 18,
        background: "rgba(12,12,12,.88)",
        boxShadow: "0 30px 90px rgba(0,0,0,.45)",
      }}>
        <div style={{ color: "#C8A96E", fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>
          Good Times Partners
        </div>
        <h1 style={{ margin: "10px 0 8px", fontSize: 32 }}>Secure Admin</h1>
        <p style={{ margin: "0 0 24px", color: "#9A9A9A", lineHeight: 1.55, fontSize: 14 }}>
          Partner applications contain private business and contact information. Sign in with an approved administrator account.
        </p>

        {status === "forbidden" && (
          <div style={{ marginBottom: 18, padding: 12, borderRadius: 10, background: "rgba(231,76,60,.12)", color: "#FFAAA2", fontSize: 13 }}>
            {adminEmail || "This account"} is authenticated but is not approved for partner administration.
          </div>
        )}

        <form onSubmit={signIn}>
          <label style={{ display: "block", marginBottom: 14, fontSize: 12 }}>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 16, fontSize: 12 }}>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required style={inputStyle} />
          </label>
          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? "Checking…" : "Sign in securely"}
          </button>
        </form>

        <button type="button" disabled={submitting || !email.trim()} onClick={sendMagicLink} style={secondaryButtonStyle}>
          Email me a secure login link
        </button>

        {message && <p style={{ marginTop: 16, color: message.includes("sent") ? "#8FCE98" : "#FFAAA2", fontSize: 13, lineHeight: 1.5 }}>{message}</p>}
      </section>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 7,
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  background: "#151515",
  color: "#F0EDE6",
  fontSize: 16,
  outline: "none",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "14px 16px",
  border: 0,
  borderRadius: 10,
  background: "#C8A96E",
  color: "#080808",
  cursor: "pointer",
  fontWeight: 800,
};

const secondaryButtonStyle = {
  width: "100%",
  marginTop: 10,
  padding: "13px 16px",
  border: "1px solid rgba(200,169,110,.35)",
  borderRadius: 10,
  background: "transparent",
  color: "#C8A96E",
  cursor: "pointer",
  fontWeight: 700,
};
