"use client";
import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://dzlmtvodpyhetvektfuo.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bG10dm9kcHloZXR2ZWt0ZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjMzNDcsImV4cCI6MjA1NDc5OTM0N30.2G_BDi5FhOcQhf5my9_jjJaARB8l3oFfjfJYWnBpxJk";

const CITIES = ["Atlanta", "Houston", "DC", "Los Angeles", "Charlotte", "Miami", "New York", "Dallas", "Chicago", "New Orleans"];
const BUSINESS_TYPES = [
  { value: "venue", label: "Venue / Lounge / Club" },
  { value: "restaurant", label: "Restaurant / Bar" },
  { value: "promoter", label: "Promoter / Event Organizer" },
  { value: "brand", label: "Brand / Company" },
  { value: "entertainment", label: "Entertainment / Performer" },
  { value: "wellness", label: "Wellness / Fitness" },
  { value: "retail", label: "Retail / Shopping" },
  { value: "other", label: "Other" },
];
const CATEGORIES = ["Nightlife", "Dining", "Entertainment", "Wellness", "Shopping", "Culture", "Sports", "Outdoor", "Music", "Art"];
const VIBE_OPTIONS = ["Upscale", "Casual", "Rooftop", "Live Music", "DJ", "Craft Cocktails", "Sports Bar", "Date Night", "Group Friendly", "Late Night", "Brunch", "Day Party", "Hookah", "BYOB", "Outdoor Patio", "VIP", "Underground", "Trendy", "Chill", "High Energy"];
const PRICE_RANGES = ["$ — Budget Friendly", "$$ — Moderate", "$$$ — Upscale", "$$$$ — Premium / Luxury"];
const AD_BUDGETS = [
  { value: "free_trade", label: "Trade / Barter (No Cash)" },
  { value: "under_500", label: "Under $500/month" },
  { value: "500_1000", label: "$500 – $1,000/month" },
  { value: "1000_plus", label: "$1,000+/month" },
];

const STEPS = [
  { id: 1, label: "BUSINESS INFO", icon: "01" },
  { id: 2, label: "DETAILS & ASSETS", icon: "02" },
  { id: 3, label: "SPECIALS & EVENTS", icon: "03" },
  { id: 4, label: "TICKETING & ADS", icon: "04" },
  { id: 5, label: "REVIEW & SUBMIT", icon: "05" },
];

export default function GTPartnerForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({});
  const formRef = useRef(null);

  const uploadFile = async (file, field) => {
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const ext = file.name.split(".").pop();
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `applications/${ts}_${safeName}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/gt-partner-assets/${path}`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/gt-partner-assets/${path}`;
      update(field, publicUrl);
    } catch (e) {
      alert("Upload error: " + e.message);
    }
    setUploading((p) => ({ ...p, [field]: false }));
  };

  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    instagram_handle: "",
    city: "",
    address: "",
    neighborhood: "",
    description: "",
    category: "",
    subcategory: "",
    vibe_tags: [],
    price_range: "",
    logo_url: "",
    cover_image_url: "",
    gallery_urls: [],
    menu_url: "",
    specials: [{ day: "", name: "", description: "", time_start: "", time_end: "" }],
    happy_hour: { days: [], time_start: "", time_end: "", details: "" },
    recurring_events: [{ name: "", day: "", time: "", description: "", cover_charge: "" }],
    wants_ticketing: false,
    ticketing_notes: "",
    wants_ad_space: false,
    ad_budget: "",
    ad_notes: "",
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const toggleVibe = (v) => {
    setForm((p) => ({
      ...p,
      vibe_tags: p.vibe_tags.includes(v) ? p.vibe_tags.filter((t) => t !== v) : [...p.vibe_tags, v],
    }));
  };

  const updateSpecial = (i, key, val) => {
    const s = [...form.specials];
    s[i] = { ...s[i], [key]: val };
    setForm((p) => ({ ...p, specials: s }));
  };

  const addSpecial = () => setForm((p) => ({ ...p, specials: [...p.specials, { day: "", name: "", description: "", time_start: "", time_end: "" }] }));

  const updateEvent = (i, key, val) => {
    const e = [...form.recurring_events];
    e[i] = { ...e[i], [key]: val };
    setForm((p) => ({ ...p, recurring_events: e }));
  };

  const addEvent = () => setForm((p) => ({ ...p, recurring_events: [...p.recurring_events, { name: "", day: "", time: "", description: "", cover_charge: "" }] }));

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.business_name.trim()) e.business_name = "Required";
      if (!form.business_type) e.business_type = "Required";
      if (!form.contact_name.trim()) e.contact_name = "Required";
      if (!form.contact_email.trim()) e.contact_email = "Required";
      else if (!/\S+@\S+\.\S+/.test(form.contact_email)) e.contact_email = "Invalid email";
      if (!form.city) e.city = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) {
      setStep((s) => Math.min(s + 1, 5));
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 1));
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        specials: JSON.stringify(form.specials.filter((s) => s.name)),
        happy_hour: JSON.stringify(form.happy_hour),
        recurring_events: JSON.stringify(form.recurring_events.filter((e) => e.name)),
        vibe_tags: form.vibe_tags.length > 0 ? `{${form.vibe_tags.join(",")}}` : null,
      };

      // Clean empty strings to null
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      // Keep required fields as strings
      payload.business_name = form.business_name;
      payload.business_type = form.business_type;
      payload.contact_name = form.contact_name;
      payload.contact_email = form.contact_email;
      payload.city = form.city;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/gt_partner_applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      alert("Error submitting: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- STYLES ---
  const css = {
    root: {
      fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif",
      background: "#0A0A0A",
      color: "#F0EDE6",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    },
    grain: {
      position: "fixed",
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      pointerEvents: "none",
      zIndex: 1,
    },
    container: {
      maxWidth: 720,
      margin: "0 auto",
      padding: "40px 24px 80px",
      position: "relative",
      zIndex: 2,
    },
    header: {
      textAlign: "center",
      marginBottom: 48,
      paddingTop: 20,
    },
    logo: {
      fontSize: 13,
      letterSpacing: 6,
      textTransform: "uppercase",
      color: "#C8A96E",
      marginBottom: 8,
      fontWeight: 500,
    },
    title: {
      fontSize: "clamp(28px, 5vw, 42px)",
      fontWeight: 800,
      letterSpacing: -1,
      lineHeight: 1.1,
      margin: "12px 0 16px",
      background: "linear-gradient(135deg, #F0EDE6 0%, #C8A96E 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: 15,
      color: "#888",
      lineHeight: 1.6,
      maxWidth: 520,
      margin: "0 auto",
    },
    stepper: {
      display: "flex",
      justifyContent: "center",
      gap: 6,
      marginBottom: 40,
      flexWrap: "wrap",
    },
    stepDot: (active, complete) => ({
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      borderRadius: 24,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      background: active ? "rgba(200,169,110,0.15)" : complete ? "rgba(200,169,110,0.06)" : "rgba(255,255,255,0.03)",
      border: active ? "1px solid rgba(200,169,110,0.4)" : "1px solid rgba(255,255,255,0.06)",
      color: active ? "#C8A96E" : complete ? "#C8A96E80" : "#555",
      transition: "all 0.3s ease",
      cursor: "default",
    }),
    card: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "36px 32px",
      marginBottom: 24,
      backdropFilter: "blur(20px)",
    },
    sectionTitle: {
      fontSize: 11,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: "#C8A96E",
      marginBottom: 24,
      fontWeight: 600,
    },
    field: { marginBottom: 20 },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: "#999",
      marginBottom: 8,
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      color: "#F0EDE6",
      fontSize: 15,
      outline: "none",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    inputFocus: {
      borderColor: "rgba(200,169,110,0.5)",
    },
    inputError: {
      borderColor: "#E74C3C",
    },
    errorText: {
      fontSize: 11,
      color: "#E74C3C",
      marginTop: 4,
    },
    select: {
      width: "100%",
      padding: "14px 16px",
      background: "#141414",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      color: "#F0EDE6",
      fontSize: 15,
      outline: "none",
      appearance: "none",
      cursor: "pointer",
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      padding: "14px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      color: "#F0EDE6",
      fontSize: 15,
      outline: "none",
      minHeight: 100,
      resize: "vertical",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    chip: (active) => ({
      display: "inline-flex",
      padding: "8px 16px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      margin: "0 6px 8px 0",
      background: active ? "rgba(200,169,110,0.2)" : "rgba(255,255,255,0.04)",
      border: active ? "1px solid rgba(200,169,110,0.5)" : "1px solid rgba(255,255,255,0.06)",
      color: active ? "#C8A96E" : "#888",
      transition: "all 0.2s",
      userSelect: "none",
    }),
    toggle: (on) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px",
      borderRadius: 12,
      cursor: "pointer",
      background: on ? "rgba(200,169,110,0.08)" : "rgba(255,255,255,0.02)",
      border: on ? "1px solid rgba(200,169,110,0.3)" : "1px solid rgba(255,255,255,0.06)",
      transition: "all 0.3s",
      marginBottom: 16,
      userSelect: "none",
    }),
    toggleDot: (on) => ({
      width: 44,
      height: 24,
      borderRadius: 12,
      background: on ? "#C8A96E" : "rgba(255,255,255,0.1)",
      position: "relative",
      transition: "all 0.3s",
      flexShrink: 0,
    }),
    toggleCircle: (on) => ({
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: on ? "#0A0A0A" : "#555",
      position: "absolute",
      top: 3,
      left: on ? 23 : 3,
      transition: "all 0.3s",
    }),
    btnRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      marginTop: 32,
    },
    btnPrimary: {
      flex: 1,
      padding: "16px 32px",
      background: "linear-gradient(135deg, #C8A96E, #A88B4A)",
      border: "none",
      borderRadius: 10,
      color: "#0A0A0A",
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 2,
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "all 0.3s",
      fontFamily: "inherit",
    },
    btnSecondary: {
      padding: "16px 32px",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      color: "#888",
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 2,
      textTransform: "uppercase",
      cursor: "pointer",
      fontFamily: "inherit",
    },
    infoBox: {
      background: "rgba(200,169,110,0.06)",
      border: "1px solid rgba(200,169,110,0.15)",
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 24,
    },
    infoTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: "#C8A96E",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: "#999",
      lineHeight: 1.7,
    },
    reviewItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      fontSize: 14,
    },
    reviewLabel: { color: "#666", fontWeight: 500 },
    reviewValue: { color: "#F0EDE6", fontWeight: 600, textAlign: "right" },
    successWrap: {
      textAlign: "center",
      padding: "80px 24px",
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      background: "rgba(200,169,110,0.15)",
      border: "2px solid rgba(200,169,110,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 32px",
      fontSize: 36,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 16,
    },
    successText: {
      fontSize: 15,
      color: "#888",
      lineHeight: 1.7,
      maxWidth: 480,
      margin: "0 auto",
    },
  };

  const Input = ({ label, name, type = "text", placeholder, required, ...props }) => (
    <div style={css.field}>
      <label style={css.label}>
        {label} {required && <span style={{ color: "#C8A96E" }}>*</span>}
      </label>
      <input
        type={type}
        value={form[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        placeholder={placeholder}
        style={{ ...css.input, ...(errors[name] ? css.inputError : {}) }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(200,169,110,0.5)")}
        onBlur={(e) => (e.target.style.borderColor = errors[name] ? "#E74C3C" : "rgba(255,255,255,0.08)")}
        {...props}
      />
      {errors[name] && <div style={css.errorText}>{errors[name]}</div>}
    </div>
  );

  const Select = ({ label, name, options, required, placeholder }) => (
    <div style={css.field}>
      <label style={css.label}>
        {label} {required && <span style={{ color: "#C8A96E" }}>*</span>}
      </label>
      <select value={form[name] || ""} onChange={(e) => update(name, e.target.value)} style={css.select}>
        <option value="">{placeholder || "Select..."}</option>
        {options.map((o) => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
      {errors[name] && <div style={css.errorText}>{errors[name]}</div>}
    </div>
  );

  const Toggle = ({ label, desc, name }) => (
    <div style={css.toggle(form[name])} onClick={() => update(name, !form[name])}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#777" }}>{desc}</div>
      </div>
      <div style={css.toggleDot(form[name])}>
        <div style={css.toggleCircle(form[name])} />
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div style={css.root}>
        <div style={css.grain} />
        <div style={{ ...css.container, ...css.successWrap }}>
          <div style={css.successIcon}>✓</div>
          <div style={css.successTitle}>APPLICATION RECEIVED</div>
          <div style={css.successText}>
            Thank you, <strong>{form.contact_name}</strong>. We've received the application for{" "}
            <strong>{form.business_name}</strong>. Our team will review your submission and reach out within 48 hours.
            {form.wants_ticketing && " We'll follow up with ticketing partnership details."}
            {form.wants_ad_space && " An ad placement specialist will contact you about available inventory."}
          </div>
          <div style={{ marginTop: 40, fontSize: 12, color: "#555", letterSpacing: 3, textTransform: "uppercase" }}>
            GOOD TIMES WORLDWIDE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={css.root} ref={formRef}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={css.grain} />

      <div style={css.container}>
        {/* HEADER */}
        <div style={css.header}>
          <div style={css.logo}>GOOD TIMES</div>
          <div style={css.title}>PARTNER APPLICATION</div>
          <div style={css.subtitle}>
            Get your venue, brand, or event featured on Good Times — the premier nightlife, dining & entertainment app. Submit your details below for review.
          </div>
        </div>

        {/* STEPPER */}
        <div style={css.stepper}>
          {STEPS.map((s) => (
            <div key={s.id} style={css.stepDot(step === s.id, step > s.id)}>
              <span style={{ opacity: 0.6 }}>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>

        {/* STEP 1 — BUSINESS INFO */}
        {step === 1 && (
          <div style={css.card}>
            <div style={css.sectionTitle}>TELL US ABOUT YOUR BUSINESS</div>

            <Input label="Business Name" name="business_name" placeholder="e.g. Velvet Lounge" required />
            <Select label="Business Type" name="business_type" options={BUSINESS_TYPES} required placeholder="What type of business?" />

            <div style={css.row}>
              <Input label="Contact Name" name="contact_name" placeholder="Full name" required />
              <Input label="Contact Email" name="contact_email" type="email" placeholder="you@business.com" required />
            </div>

            <div style={css.row}>
              <Input label="Phone" name="contact_phone" type="tel" placeholder="(555) 000-0000" />
              <Select label="City" name="city" options={CITIES} required placeholder="Primary city" />
            </div>

            <Input label="Address" name="address" placeholder="Street address" />

            <div style={css.row}>
              <Input label="Neighborhood" name="neighborhood" placeholder="e.g. Midtown, Buckhead" />
              <Input label="Instagram" name="instagram_handle" placeholder="@yourhandle" />
            </div>

            <Input label="Website" name="website" placeholder="https://..." />

            <div style={css.btnRow}>
              <div />
              <button style={css.btnPrimary} onClick={next}>
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — DETAILS & ASSETS */}
        {step === 2 && (
          <div style={css.card}>
            <div style={css.sectionTitle}>DETAILS & BRAND ASSETS</div>

            <div style={css.field}>
              <label style={css.label}>DESCRIPTION</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tell us what makes your business special. What's the vibe? What should our users know?"
                style={css.textarea}
              />
            </div>

            <div style={css.row}>
              <Select label="Primary Category" name="category" options={CATEGORIES} placeholder="Select category" />
              <Select label="Price Range" name="price_range" options={PRICE_RANGES} placeholder="Select range" />
            </div>

            <div style={css.field}>
              <label style={css.label}>VIBE TAGS — SELECT ALL THAT APPLY</label>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {VIBE_OPTIONS.map((v) => (
                  <span key={v} style={css.chip(form.vibe_tags.includes(v))} onClick={() => toggleVibe(v)}>
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ ...css.infoBox, marginTop: 24 }}>
              <div style={css.infoTitle}>BRAND ASSETS</div>
              <div style={css.infoText}>
                Upload your logo, cover image, and menu directly — or paste a link (Google Drive, Dropbox, etc). Accepted: PNG, JPG, PDF. Max 10MB.
              </div>
            </div>

            {[
              { field: "logo_url", label: "LOGO", accept: "image/*", desc: "PNG preferred, transparent background" },
              { field: "cover_image_url", label: "COVER / HERO IMAGE", accept: "image/*", desc: "Your best venue or brand photo" },
              { field: "menu_url", label: "MENU / OFFERINGS", accept: "image/*,application/pdf", desc: "Menu PDF or image" },
            ].map(({ field, label, accept, desc }) => (
              <div key={field} style={css.field}>
                <label style={css.label}>{label}</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{
                    padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    cursor: uploading[field] ? "wait" : "pointer",
                    background: form[field] ? "rgba(76,175,80,0.1)" : "rgba(200,169,110,0.08)",
                    border: form[field] ? "1px solid rgba(76,175,80,0.3)" : "1px solid rgba(200,169,110,0.2)",
                    color: form[field] ? "#4CAF50" : "#C8A96E", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {uploading[field] ? "UPLOADING..." : form[field] ? "✓ UPLOADED" : "UPLOAD FILE"}
                    <input type="file" accept={accept} style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) uploadFile(e.target.files[0], field); }} />
                  </label>
                  <input
                    type="text" value={form[field] || ""} onChange={(e) => update(field, e.target.value)}
                    placeholder={`Or paste URL — ${desc}`}
                    style={{ ...css.input, flex: 1 }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(200,169,110,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
                {form[field] && form[field].startsWith("http") && (
                  <div style={{ fontSize: 11, color: "#4CAF50", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    ✓ {form[field].split("/").pop()}
                  </div>
                )}
              </div>
            ))}

            {/* Gallery Multi-Upload */}
            <div style={css.field}>
              <label style={css.label}>ADDITIONAL PHOTOS (GALLERY)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{
                  padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                  cursor: uploading.gallery ? "wait" : "pointer",
                  background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)", color: "#C8A96E",
                }}>
                  {uploading.gallery ? "UPLOADING..." : "+ ADD PHOTOS"}
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    setUploading((p) => ({ ...p, gallery: true }));
                    const urls = [...form.gallery_urls];
                    for (const file of files) {
                      try {
                        const path = `applications/gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/gt-partner-assets/${path}`, {
                          method: "POST", headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": file.type }, body: file,
                        });
                        if (res.ok) urls.push(`${SUPABASE_URL}/storage/v1/object/public/gt-partner-assets/${path}`);
                      } catch (err) { console.error(err); }
                    }
                    update("gallery_urls", urls);
                    setUploading((p) => ({ ...p, gallery: false }));
                  }} />
                </label>
                {form.gallery_urls.length > 0 && (
                  <span style={{ fontSize: 12, color: "#4CAF50" }}>✓ {form.gallery_urls.length} photo{form.gallery_urls.length !== 1 ? "s" : ""} uploaded</span>
                )}
              </div>
              {form.gallery_urls.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {form.gallery_urls.map((url, i) => (
                    <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div
                        onClick={() => update("gallery_urls", form.gallery_urls.filter((_, j) => j !== i))}
                        style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#E74C3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer" }}
                      >×</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={css.btnRow}>
              <button style={css.btnSecondary} onClick={prev}>
                ← BACK
              </button>
              <button style={css.btnPrimary} onClick={next}>
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — SPECIALS & EVENTS */}
        {step === 3 && (
          <div style={css.card}>
            <div style={css.sectionTitle}>SPECIALS & RECURRING EVENTS</div>

            <div style={css.infoBox}>
              <div style={css.infoTitle}>DAILY SPECIALS</div>
              <div style={css.infoText}>
                List your daily specials, happy hours, or recurring promotions. These will be featured in the Good Times app for your city.
              </div>
            </div>

            {form.specials.map((s, i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={css.row}>
                  <div style={css.field}>
                    <label style={css.label}>DAY</label>
                    <select value={s.day} onChange={(e) => updateSpecial(i, "day", e.target.value)} style={css.select}>
                      <option value="">Select day</option>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Daily"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>SPECIAL NAME</label>
                    <input value={s.name} onChange={(e) => updateSpecial(i, "name", e.target.value)} placeholder="e.g. Taco Tuesday" style={css.input} />
                  </div>
                </div>
                <div style={css.field}>
                  <label style={css.label}>DESCRIPTION</label>
                  <input value={s.description} onChange={(e) => updateSpecial(i, "description", e.target.value)} placeholder="What's the deal?" style={css.input} />
                </div>
                <div style={css.row}>
                  <div style={css.field}>
                    <label style={css.label}>START TIME</label>
                    <input type="time" value={s.time_start} onChange={(e) => updateSpecial(i, "time_start", e.target.value)} style={css.input} />
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>END TIME</label>
                    <input type="time" value={s.time_end} onChange={(e) => updateSpecial(i, "time_end", e.target.value)} style={css.input} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addSpecial} style={{ ...css.btnSecondary, width: "100%", marginTop: 12, marginBottom: 32 }}>
              + ADD ANOTHER SPECIAL
            </button>

            <div style={css.sectionTitle}>RECURRING EVENTS</div>

            {form.recurring_events.map((ev, i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={css.row}>
                  <div style={css.field}>
                    <label style={css.label}>EVENT NAME</label>
                    <input value={ev.name} onChange={(e) => updateEvent(i, "name", e.target.value)} placeholder="e.g. Latin Night" style={css.input} />
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>DAY</label>
                    <select value={ev.day} onChange={(e) => updateEvent(i, "day", e.target.value)} style={css.select}>
                      <option value="">Select day</option>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={css.row}>
                  <div style={css.field}>
                    <label style={css.label}>TIME</label>
                    <input value={ev.time} onChange={(e) => updateEvent(i, "time", e.target.value)} placeholder="e.g. 9PM - 2AM" style={css.input} />
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>COVER CHARGE</label>
                    <input value={ev.cover_charge} onChange={(e) => updateEvent(i, "cover_charge", e.target.value)} placeholder="e.g. $20, Free before 11" style={css.input} />
                  </div>
                </div>
                <div style={css.field}>
                  <label style={css.label}>DESCRIPTION</label>
                  <input value={ev.description} onChange={(e) => updateEvent(i, "description", e.target.value)} placeholder="What makes this event special?" style={css.input} />
                </div>
              </div>
            ))}

            <button onClick={addEvent} style={{ ...css.btnSecondary, width: "100%", marginTop: 12 }}>
              + ADD ANOTHER EVENT
            </button>

            <div style={css.btnRow}>
              <button style={css.btnSecondary} onClick={prev}>
                ← BACK
              </button>
              <button style={css.btnPrimary} onClick={next}>
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — TICKETING & ADS */}
        {step === 4 && (
          <div style={css.card}>
            <div style={css.sectionTitle}>TICKETING & ADVERTISING</div>

            <div style={css.infoBox}>
              <div style={css.infoTitle}>TICKET SALES PARTNERSHIP</div>
              <div style={css.infoText}>
                Let Good Times sell tickets directly to your events through our app. We handle the checkout, payment processing, and user experience.
                We retain <strong style={{ color: "#C8A96E" }}>10% of gross ticket sales</strong> as our service fee. You receive 90% — deposited to your account after each event.
              </div>
            </div>

            <Toggle
              label="YES — I WANT GOOD TIMES TO SELL MY TICKETS"
              desc="Enable ticket sales through the Good Times app (10% commission)"
              name="wants_ticketing"
            />

            {form.wants_ticketing && (
              <div style={css.field}>
                <label style={css.label}>TICKETING NOTES</label>
                <textarea
                  value={form.ticketing_notes}
                  onChange={(e) => update("ticketing_notes", e.target.value)}
                  placeholder="Tell us about your upcoming events, typical ticket prices, capacity, etc."
                  style={css.textarea}
                />
              </div>
            )}

            <div style={{ height: 32 }} />

            <div style={css.infoBox}>
              <div style={css.infoTitle}>ADVERTISING & PROMOTED PLACEMENT</div>
              <div style={css.infoText}>
                Get maximum visibility with promoted placements across the Good Times app — home screen banners, city page features, push notifications, and more.
                We also offer <strong style={{ color: "#C8A96E" }}>trade / barter deals</strong> — exchange venue access, VIP tables, food & drink credits for premium ad placements.
              </div>
            </div>

            <Toggle
              label="YES — I'M INTERESTED IN AD SPACE"
              desc="Promoted placements, sponsored features, or trade deals"
              name="wants_ad_space"
            />

            {form.wants_ad_space && (
              <>
                <Select label="Ad Budget Range" name="ad_budget" options={AD_BUDGETS} placeholder="What's your budget?" />
                <div style={css.field}>
                  <label style={css.label}>AD / TRADE NOTES</label>
                  <textarea
                    value={form.ad_notes}
                    onChange={(e) => update("ad_notes", e.target.value)}
                    placeholder="What are you looking to promote? Open to trade deals? What can you offer in exchange?"
                    style={css.textarea}
                  />
                </div>
              </>
            )}

            <div style={css.btnRow}>
              <button style={css.btnSecondary} onClick={prev}>
                ← BACK
              </button>
              <button style={css.btnPrimary} onClick={next}>
                REVIEW →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — REVIEW */}
        {step === 5 && (
          <div style={css.card}>
            <div style={css.sectionTitle}>REVIEW YOUR APPLICATION</div>

            <div style={{ marginBottom: 32 }}>
              {[
                ["Business Name", form.business_name],
                ["Business Type", BUSINESS_TYPES.find((b) => b.value === form.business_type)?.label],
                ["Contact", `${form.contact_name} — ${form.contact_email}`],
                ["Phone", form.contact_phone],
                ["City", form.city],
                ["Address", form.address],
                ["Instagram", form.instagram_handle],
                ["Website", form.website],
                ["Category", form.category],
                ["Price Range", form.price_range],
                ["Vibe", form.vibe_tags.join(", ")],
                ["Specials", form.specials.filter((s) => s.name).map((s) => `${s.day}: ${s.name}`).join(" | ") || "None"],
                ["Events", form.recurring_events.filter((e) => e.name).map((e) => `${e.day}: ${e.name}`).join(" | ") || "None"],
                ["Ticketing", form.wants_ticketing ? "YES — 10% Commission" : "No"],
                ["Ad Space", form.wants_ad_space ? `YES — ${AD_BUDGETS.find((b) => b.value === form.ad_budget)?.label || "TBD"}` : "No"],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} style={css.reviewItem}>
                    <span style={css.reviewLabel}>{label}</span>
                    <span style={css.reviewValue}>{value}</span>
                  </div>
                ))}
            </div>

            <div style={{ ...css.infoBox, borderColor: "rgba(200,169,110,0.3)" }}>
              <div style={css.infoText}>
                By submitting, you authorize Good Times to feature your business in our app and agree to be contacted by our partnerships team.
                {form.wants_ticketing && " You agree to the 10% ticket sales commission on all tickets sold through Good Times."}
              </div>
            </div>

            <div style={css.btnRow}>
              <button style={css.btnSecondary} onClick={prev}>
                ← EDIT
              </button>
              <button
                style={{ ...css.btnPrimary, opacity: submitting ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 40, padding: "24px 0" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#333", textTransform: "uppercase" }}>
            THE KOLLECTIVE HOSPITALITY GROUP
          </div>
          <div style={{ fontSize: 10, color: "#222", marginTop: 8 }}>
            thegoodtimesworldwide.com
          </div>
        </div>
      </div>
    </div>
  );
}

