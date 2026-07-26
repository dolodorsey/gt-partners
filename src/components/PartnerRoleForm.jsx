"use client";

import { useMemo, useState } from "react";

const SUPABASE_URL = "https://dzlmtvodpyhetvektfuo.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bG10dm9kcHloZXR2ZWt0ZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODQ4NjQsImV4cCI6MjA4NTE2MDg2NH0.qmnWB4aWdb7U8Iod9Hv8PQAOJO3AG0vYEGnPS--kfAo";

const COPY = {
  curator: {
    eyebrow: "CITY CURATOR NETWORK",
    title: "Become a Good Times Curator",
    description: "Help shape what Good Times recommends in your city through credible local knowledge, cultural awareness and consistent discovery.",
    experienceLabel: "City knowledge and curation experience",
  },
  affiliate: {
    eyebrow: "GOOD TIMES AFFILIATE NETWORK",
    title: "Become a Good Times Affiliate",
    description: "Apply to promote Good Times, drive qualified users or business relationships, and participate in approved affiliate opportunities.",
    experienceLabel: "Audience, partnerships or sales experience",
  },
};

const initial = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  instagram_handle: "",
  website: "",
  audience_size: "",
  experience: "",
  reason: "",
  availability: "",
  consent: true,
};

export default function PartnerRoleForm({ roleType }) {
  const meta = COPY[roleType] || COPY.curator;
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const canSubmit = useMemo(() => (
    form.full_name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.city.trim().length >= 2 &&
    form.experience.trim().length >= 10 &&
    form.reason.trim().length >= 10 &&
    status !== "submitting"
  ), [form, status]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/gt_partner_role_requests`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          role_type: roleType,
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          instagram_handle: form.instagram_handle.trim() || null,
          website: form.website.trim() || null,
          audience_size: form.audience_size.trim() || null,
          experience: form.experience.trim(),
          details: {
            reason: form.reason.trim(),
            availability: form.availability.trim() || null,
          },
          consent: Boolean(form.consent),
          status: "new",
          source: "good-times-partner-role-form",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Your application could not be submitted.");
      }

      setStatus("success");
      setMessage(`Your ${roleType} application was received. The Good Times team will review it and follow up.`);
      setForm(initial);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Your application could not be submitted.");
    }
  };

  if (status === "success") {
    return (
      <Page>
        <section style={styles.card}>
          <div style={styles.brand}>GOOD TIMES PARTNERS</div>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.centerTitle}>Application received</h1>
          <p style={styles.centerCopy}>{message}</p>
          <a href="/" style={styles.primaryLink}>Return to partner applications</a>
        </section>
      </Page>
    );
  }

  return (
    <Page>
      <section style={styles.shell}>
        <a href="/" style={styles.back}>← Good Times Partners</a>
        <div style={styles.eyebrow}>{meta.eyebrow}</div>
        <h1 style={styles.title}>{meta.title}</h1>
        <p style={styles.description}>{meta.description}</p>

        <form onSubmit={submit} style={styles.card}>
          <div style={styles.grid}>
            <Field label="Full name"><input value={form.full_name} onChange={(event) => update("full_name", event.target.value)} autoComplete="name" required style={styles.input} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required style={styles.input} /></Field>
            <Field label="Mobile phone"><input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" required style={styles.input} /></Field>
            <Field label="Primary city"><input value={form.city} onChange={(event) => update("city", event.target.value)} required style={styles.input} /></Field>
            <Field label="Instagram" optional><input value={form.instagram_handle} onChange={(event) => update("instagram_handle", event.target.value)} placeholder="@username" style={styles.input} /></Field>
            <Field label="Website / portfolio" optional><input type="url" value={form.website} onChange={(event) => update("website", event.target.value)} style={styles.input} /></Field>
            <Field label="Audience or network size" optional><input value={form.audience_size} onChange={(event) => update("audience_size", event.target.value)} style={styles.input} /></Field>
            <Field label="Availability" optional><input value={form.availability} onChange={(event) => update("availability", event.target.value)} placeholder="Hours per week, days, or travel availability" style={styles.input} /></Field>
          </div>

          <Field label={meta.experienceLabel}><textarea rows="5" value={form.experience} onChange={(event) => update("experience", event.target.value)} required style={styles.textarea} /></Field>
          <Field label={`Why do you want to become a Good Times ${roleType}?`}><textarea rows="5" value={form.reason} onChange={(event) => update("reason", event.target.value)} required style={styles.textarea} /></Field>

          <label style={styles.consent}>
            <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} style={{ accentColor: "#C8A96E" }} />
            <span>I agree to receive confirmation and follow-up messages about this application. Message and data rates may apply.</span>
          </label>

          {status === "error" && <div style={styles.error}>{message}</div>}
          <button type="submit" disabled={!canSubmit} style={{ ...styles.button, opacity: canSubmit ? 1 : .4 }}>
            {status === "submitting" ? "Submitting…" : `Submit ${roleType} application`}
          </button>
          <p style={styles.disclaimer}>Submitting an application does not guarantee approval, compensation, territory, exclusivity or a partnership. Terms are confirmed separately in writing.</p>
        </form>
      </section>
    </Page>
  );
}

function Page({ children }) {
  return <main style={styles.page}>{children}</main>;
}

function Field({ label, optional = false, children }) {
  return <label style={styles.field}><span style={styles.label}>{label}{optional ? " · optional" : ""}</span>{children}</label>;
}

const styles = {
  page: { minHeight: "100vh", padding: "42px 20px 90px", background: "radial-gradient(circle at 90% 0%, rgba(200,169,110,.18), transparent 36%), #080808", color: "#F0EDE6", fontFamily: "'Instrument Sans','Helvetica Neue',sans-serif" },
  shell: { width: "min(850px,100%)", margin: "0 auto" },
  back: { color: "rgba(240,237,230,.55)", textDecoration: "none", fontSize: 12 },
  eyebrow: { marginTop: 36, color: "#C8A96E", fontSize: 10, fontWeight: 800, letterSpacing: ".24em" },
  title: { margin: "10px 0 12px", fontSize: "clamp(46px,8vw,78px)", lineHeight: .94, letterSpacing: "-.045em" },
  description: { maxWidth: 680, margin: "0 0 28px", color: "rgba(240,237,230,.65)", fontSize: 16, lineHeight: 1.65 },
  card: { width: "min(850px,100%)", margin: "0 auto", padding: "clamp(22px,5vw,42px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, background: "rgba(15,15,15,.94)", boxShadow: "0 30px 90px rgba(0,0,0,.45)" },
  brand: { color: "#C8A96E", textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: ".22em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 15 },
  field: { display: "block", marginBottom: 16 },
  label: { display: "block", marginBottom: 7, color: "rgba(240,237,230,.83)", fontSize: 10, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase" },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", border: "1px solid rgba(255,255,255,.13)", borderRadius: 10, background: "#171717", color: "#fff", font: "inherit", fontSize: 16 },
  textarea: { width: "100%", boxSizing: "border-box", padding: "13px 14px", border: "1px solid rgba(255,255,255,.13)", borderRadius: 10, background: "#171717", color: "#fff", font: "inherit", fontSize: 16, resize: "vertical" },
  consent: { display: "flex", alignItems: "flex-start", gap: 10, marginTop: 6, color: "rgba(240,237,230,.55)", fontSize: 12, lineHeight: 1.5 },
  button: { width: "100%", marginTop: 22, padding: "16px 20px", border: 0, borderRadius: 11, background: "#C8A96E", color: "#080808", fontSize: 15, fontWeight: 900, cursor: "pointer", textTransform: "capitalize" },
  error: { marginTop: 16, padding: 12, border: "1px solid rgba(239,68,68,.35)", borderRadius: 10, background: "rgba(239,68,68,.12)", color: "#FCA5A5", fontSize: 13 },
  disclaimer: { margin: "16px 0 0", color: "rgba(240,237,230,.36)", fontSize: 10, lineHeight: 1.6, textAlign: "center" },
  successIcon: { display: "grid", placeItems: "center", width: 68, height: 68, margin: "26px auto 18px", borderRadius: "50%", background: "rgba(200,169,110,.14)", color: "#C8A96E", fontSize: 34 },
  centerTitle: { margin: "0 0 10px", fontSize: 42, textAlign: "center" },
  centerCopy: { maxWidth: 600, margin: "0 auto", color: "rgba(240,237,230,.65)", lineHeight: 1.6, textAlign: "center" },
  primaryLink: { display: "flex", justifyContent: "center", marginTop: 24, padding: 14, borderRadius: 10, background: "#C8A96E", color: "#080808", textDecoration: "none", fontWeight: 900 },
};
