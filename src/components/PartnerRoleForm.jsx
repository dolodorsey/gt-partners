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
  ambassador: {
    eyebrow: "GOOD TIMES AMBASSADOR PROGRAM",
    title: "Apply to Become a Good Times Ambassador",
    description: "Good Times ambassadors are local culture connectors who help people discover where to go, what to do, and what is worth showing up for. Atlanta is the current public launch market. Applications are reviewed for brand fit, reliability, local influence, content quality and ability to drive real app activity.",
    experienceLabel: "Tell us about your Atlanta nightlife, dining, events, culture, creator or community experience",
  },
};

const initial = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  instagram_handle: "",
  tiktok_handle: "",
  website: "",
  audience_size: "",
  average_story_views: "",
  average_reel_views: "",
  content_category: "",
  referral_source: "",
  monthly_content_commitment: "",
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
    (roleType !== "ambassador" || form.instagram_handle.trim().length >= 2) &&
    (roleType !== "ambassador" || form.content_category.trim().length >= 2) &&
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
      const isAmbassador = roleType === "ambassador";
      const response = await fetch(
        isAmbassador
          ? `${SUPABASE_URL}/functions/v1/ambassador-intake`
          : `${SUPABASE_URL}/rest/v1/gt_partner_role_requests`,
        {
          method: "POST",
          headers: isAmbassador
            ? { "Content-Type": "application/json" }
            : {
                apikey: SUPABASE_ANON,
                Authorization: `Bearer ${SUPABASE_ANON}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
          body: JSON.stringify(isAmbassador ? {
            brand_key: "good_times",
            full_name: form.full_name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            instagram_handle: form.instagram_handle.trim(),
            tiktok_handle: form.tiktok_handle.trim() || null,
            website: form.website.trim() || null,
            audience_size: form.audience_size.trim() || null,
            average_story_views: form.average_story_views.trim() || null,
            average_reel_views: form.average_reel_views.trim() || null,
            content_lane: form.content_category.trim(),
            referral_source: form.referral_source.trim() || null,
            monthly_commitment: form.monthly_content_commitment.trim() || null,
            experience: form.experience.trim(),
            why_you: form.reason.trim(),
            availability: form.availability.trim() || null,
            consent: Boolean(form.consent),
            source: "partners.thegoodtimesworldwide.com/ambassador",
          } : {
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
              tiktok_handle: form.tiktok_handle.trim() || null,
              average_story_views: form.average_story_views.trim() || null,
              average_reel_views: form.average_reel_views.trim() || null,
              content_category: form.content_category.trim() || null,
              referral_source: form.referral_source.trim() || null,
              monthly_content_commitment: form.monthly_content_commitment.trim() || null,
              launch_market: "atlanta",
            },
            consent: Boolean(form.consent),
            status: "new",
            source: "good-times-partner-role-form",
          }),
        }
      );

      const result = await response.json().catch(() => null);
      if (!response.ok || (isAmbassador && result?.ok !== true)) {
        throw new Error(result?.error || result?.message || "Your application could not be submitted.");
      }

      setStatus("success");
      setMessage(
        isAmbassador && result?.email?.provider_accepted
          ? "Your ambassador application was received. Check your email for confirmation."
          : `Your ${roleType} application was received. The Good Times team will review it and follow up.`
      );
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
            <Field label={roleType === "ambassador" ? "Instagram" : "Instagram"} optional={roleType !== "ambassador"}><input value={form.instagram_handle} onChange={(event) => update("instagram_handle", event.target.value)} placeholder="@username" style={styles.input} /></Field>
            {roleType === "ambassador" && <Field label="TikTok" optional><input value={form.tiktok_handle} onChange={(event) => update("tiktok_handle", event.target.value)} placeholder="@username" style={styles.input} /></Field>}
            <Field label="Website / portfolio" optional><input type="url" value={form.website} onChange={(event) => update("website", event.target.value)} style={styles.input} /></Field>
            <Field label="Audience or network size" optional><input value={form.audience_size} onChange={(event) => update("audience_size", event.target.value)} style={styles.input} /></Field>
            {roleType === "ambassador" && <Field label="Average story views" optional><input value={form.average_story_views} onChange={(event) => update("average_story_views", event.target.value)} placeholder="Example: 1,500" style={styles.input} /></Field>}
            {roleType === "ambassador" && <Field label="Average Reel / video views" optional><input value={form.average_reel_views} onChange={(event) => update("average_reel_views", event.target.value)} placeholder="Example: 8,000" style={styles.input} /></Field>}
            {roleType === "ambassador" && <Field label="Primary content lane"><input value={form.content_category} onChange={(event) => update("content_category", event.target.value)} placeholder="Nightlife, dining, events, lifestyle, campus, fitness, culture..." required style={styles.input} /></Field>}
            {roleType === "ambassador" && <Field label="Who invited / referred you?" optional><input value={form.referral_source} onChange={(event) => update("referral_source", event.target.value)} style={styles.input} /></Field>}
            {roleType === "ambassador" && <Field label="Monthly content commitment" optional><input value={form.monthly_content_commitment} onChange={(event) => update("monthly_content_commitment", event.target.value)} placeholder="Example: 2 Reels + 4 Stories" style={styles.input} /></Field>}
            <Field label="Availability" optional><input value={form.availability} onChange={(event) => update("availability", event.target.value)} placeholder="Hours per week, days, or event availability" style={styles.input} /></Field>
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
