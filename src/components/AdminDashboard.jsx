"use client";
import { useState, useEffect, useCallback } from "react";

const SB = "https://dzlmtvodpyhetvektfuo.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bG10dm9kcHloZXR2ZWt0ZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODQ4NjQsImV4cCI6MjA4NTE2MDg2NH0.qmnWB4aWdb7U8Iod9Hv8PQAOJO3AG0vYEGnPS--kfAo";

const hdrs = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

async function sbGet(table, params = "") {
  const r = await fetch(`${SB}/rest/v1/${table}?${params}`, { headers: hdrs });
  return r.json();
}
async function sbPatch(table, id, data) {
  const r = await fetch(`${SB}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH", headers: { ...hdrs, Prefer: "return=representation" }, body: JSON.stringify(data),
  });
  return r.json();
}

const STATUS_COLORS = {
  pending: { bg: "#3D2E00", border: "#C8A96E", text: "#C8A96E" },
  under_review: { bg: "#1A2A3D", border: "#5B9BD5", text: "#5B9BD5" },
  approved: { bg: "#0D3320", border: "#4CAF50", text: "#4CAF50" },
  active: { bg: "#0D3320", border: "#66BB6A", text: "#66BB6A" },
  rejected: { bg: "#3D1A1A", border: "#E74C3C", text: "#E74C3C" },
  suspended: { bg: "#2D1A2D", border: "#9C27B0", text: "#9C27B0" },
};

const TABS = ["Applications", "Ad Placements", "Ticket Deals"];

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700,
      letterSpacing: 1.5, textTransform: "uppercase", background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      flex: 1, minWidth: 140, background: "rgba(10,10,10,0.5)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "20px 24px", textAlign: "center",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent || "#F0EDE6", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#666", marginTop: 8, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function GTAdminDashboard() {
  const [tab, setTab] = useState(0);
  const [apps, setApps] = useState([]);
  const [ads, setAds] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [reviewNotes, setReviewNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, d, t] = await Promise.all([
        sbGet("gt_partner_applications", "order=submitted_at.desc&limit=200"),
        sbGet("gt_ad_placements", "order=created_at.desc"),
        sbGet("gt_ticket_partnerships", "order=created_at.desc"),
      ]);
      setApps(Array.isArray(a) ? a : []);
      setAds(Array.isArray(d) ? d : []);
      setTickets(Array.isArray(t) ? t : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    const data = {
      status,
      reviewed_by: "admin",
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    };
    if (status === "approved") data.approved_at = new Date().toISOString();
    await sbPatch("gt_partner_applications", id, data);
    setReviewNotes("");
    setSelected(null);
    await load();
    setUpdating(false);
  };

  const filtered = apps.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterCity !== "all" && a.city !== filterCity) return false;
    return true;
  });

  const cities = [...new Set(apps.map((a) => a.city).filter(Boolean))].sort();
  const stats = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved" || a.status === "active").length,
    ticketing: apps.filter((a) => a.wants_ticketing).length,
    ads: apps.filter((a) => a.wants_ad_space).length,
  };

  const BG_URL = "https://dzlmtvodpyhetvektfuo.supabase.co/storage/v1/object/public/gt-partner-assets/site/hero-bg.png";
  const css = {
    root: { fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif", background: "#080808", color: "#F0EDE6", minHeight: "100vh", position: "relative" },
    bgImage: { position: "fixed", inset: 0, backgroundImage: `url("${BG_URL}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", zIndex: 0 },
    bgOverlay: { position: "fixed", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.82) 40%, rgba(0,0,0,0.9) 100%)", zIndex: 0 },
    grain: { position: "fixed", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 1 },
    container: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 2 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
    title: { fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#C8A96E", fontWeight: 600 },
    h1: { fontSize: 28, fontWeight: 800, margin: "4px 0 0", letterSpacing: -0.5 },
    statsRow: { display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" },
    tabs: { display: "flex", gap: 4, marginBottom: 24, background: "rgba(10,10,10,0.5)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" },
    tab: (active) => ({
      padding: "10px 24px", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
      cursor: "pointer", background: active ? "rgba(200,169,110,0.12)" : "transparent",
      border: active ? "1px solid rgba(200,169,110,0.3)" : "1px solid transparent",
      color: active ? "#C8A96E" : "#666", transition: "all 0.2s",
    }),
    filterBar: { display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" },
    select: {
      padding: "8px 14px", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
      color: "#F0EDE6", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer",
    },
    card: {
      background: "rgba(10,10,10,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
      marginBottom: 8, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", gap: 16 },
    cardName: { fontSize: 16, fontWeight: 700, flex: 1 },
    cardMeta: { fontSize: 12, color: "#777", marginTop: 2 },
    detailPanel: {
      background: "rgba(10,10,10,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
      padding: 28, marginBottom: 24, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 },
    detailItem: { marginBottom: 12 },
    detailLabel: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#666", fontWeight: 600, marginBottom: 4 },
    detailValue: { fontSize: 14, color: "#F0EDE6", fontWeight: 500 },
    actionBar: { display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", alignItems: "center" },
    btn: (color) => ({
      padding: "10px 20px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
      cursor: "pointer", border: `1px solid ${color}`, background: `${color}20`, color, fontFamily: "inherit", transition: "all 0.2s",
    }),
    textarea: {
      width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, color: "#F0EDE6", fontSize: 13, outline: "none", minHeight: 60, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
    },
    adRow: {
      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, padding: "14px 20px", alignItems: "center",
      background: "rgba(10,10,10,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, marginBottom: 6,
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    },
    refreshBtn: {
      padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      cursor: "pointer", border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.08)", color: "#C8A96E", fontFamily: "inherit",
    },
    emptyState: { textAlign: "center", padding: "60px 20px", color: "#555", fontSize: 14 },
  };

  const DetailField = ({ label, value }) => value ? (
    <div style={css.detailItem}><div style={css.detailLabel}>{label}</div><div style={css.detailValue}>{value}</div></div>
  ) : null;

  const renderDetail = (app) => (
    <div style={css.detailPanel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{app.business_name}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{app.contact_name} · {app.contact_email} · {app.contact_phone || "No phone"}</div>
        </div>
        <Badge status={app.status} />
      </div>

      <div style={css.detailGrid}>
        <DetailField label="Business Type" value={app.business_type?.replace(/_/g, " ")} />
        <DetailField label="City" value={`${app.city}${app.neighborhood ? ` · ${app.neighborhood}` : ""}`} />
        <DetailField label="Address" value={app.address} />
        <DetailField label="Category" value={app.category} />
        <DetailField label="Price Range" value={app.price_range} />
        <DetailField label="Instagram" value={app.instagram_handle} />
        <DetailField label="Website" value={app.website} />
        <DetailField label="Submitted" value={new Date(app.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
      </div>

      {app.description && (
        <div style={{ marginBottom: 20 }}>
          <div style={css.detailLabel}>DESCRIPTION</div>
          <div style={{ fontSize: 13, color: "#CCC", lineHeight: 1.7 }}>{app.description}</div>
        </div>
      )}

      {app.vibe_tags?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={css.detailLabel}>VIBE TAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {app.vibe_tags.map((t) => (
              <span key={t} style={{
                padding: "4px 12px", borderRadius: 16, fontSize: 11, fontWeight: 600,
                background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.25)", color: "#C8A96E",
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Assets */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {app.logo_url && <a href={app.logo_url} target="_blank" rel="noopener noreferrer" style={{ ...css.btn("#5B9BD5"), textDecoration: "none" }}>VIEW LOGO ↗</a>}
        {app.cover_image_url && <a href={app.cover_image_url} target="_blank" rel="noopener noreferrer" style={{ ...css.btn("#5B9BD5"), textDecoration: "none" }}>VIEW COVER ↗</a>}
        {app.menu_url && <a href={app.menu_url} target="_blank" rel="noopener noreferrer" style={{ ...css.btn("#5B9BD5"), textDecoration: "none" }}>VIEW MENU ↗</a>}
      </div>

      {/* Specials */}
      {(() => {
        let specials = [];
        try { specials = typeof app.specials === "string" ? JSON.parse(app.specials) : app.specials || []; } catch(e) {}
        return specials.length > 0 && specials.some(s => s.name) ? (
          <div style={{ marginBottom: 20 }}>
            <div style={css.detailLabel}>SPECIALS</div>
            {specials.filter(s => s.name).map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: "#CCC", padding: "4px 0" }}>
                <strong style={{ color: "#C8A96E" }}>{s.day}:</strong> {s.name} — {s.description} {s.time_start && `(${s.time_start}–${s.time_end})`}
              </div>
            ))}
          </div>
        ) : null;
      })()}

      {/* Recurring Events */}
      {(() => {
        let events = [];
        try { events = typeof app.recurring_events === "string" ? JSON.parse(app.recurring_events) : app.recurring_events || []; } catch(e) {}
        return events.length > 0 && events.some(e => e.name) ? (
          <div style={{ marginBottom: 20 }}>
            <div style={css.detailLabel}>RECURRING EVENTS</div>
            {events.filter(e => e.name).map((e, i) => (
              <div key={i} style={{ fontSize: 13, color: "#CCC", padding: "4px 0" }}>
                <strong style={{ color: "#C8A96E" }}>{e.day}:</strong> {e.name} — {e.description} {e.time && `@ ${e.time}`} {e.cover_charge && `(${e.cover_charge})`}
              </div>
            ))}
          </div>
        ) : null;
      })()}

      {/* Ticketing */}
      {app.wants_ticketing && (
        <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(76,175,80,0.06)", border: "1px solid rgba(76,175,80,0.2)", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50", letterSpacing: 1.5, textTransform: "uppercase" }}>WANTS TICKETING — 10% COMMISSION</div>
          {app.ticketing_notes && <div style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>{app.ticketing_notes}</div>}
        </div>
      )}

      {/* Ads */}
      {app.wants_ad_space && (
        <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(91,155,213,0.06)", border: "1px solid rgba(91,155,213,0.2)", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5B9BD5", letterSpacing: 1.5, textTransform: "uppercase" }}>WANTS AD SPACE — {app.ad_budget?.replace(/_/g, " ")?.toUpperCase()}</div>
          {app.ad_notes && <div style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>{app.ad_notes}</div>}
        </div>
      )}

      {/* Review Notes */}
      {app.review_notes && (
        <div style={{ marginBottom: 16 }}>
          <div style={css.detailLabel}>PREVIOUS REVIEW NOTES</div>
          <div style={{ fontSize: 13, color: "#AAA", fontStyle: "italic" }}>{app.review_notes}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 24 }}>
        <div style={css.detailLabel}>REVIEW NOTES (OPTIONAL)</div>
        <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes about this application..." style={css.textarea} />
      </div>

      <div style={css.actionBar}>
        {app.status === "pending" && (
          <>
            <button style={css.btn("#5B9BD5")} onClick={() => updateStatus(app.id, "under_review")} disabled={updating}>
              {updating ? "..." : "MARK UNDER REVIEW"}
            </button>
            <button style={css.btn("#4CAF50")} onClick={() => updateStatus(app.id, "approved")} disabled={updating}>
              {updating ? "..." : "APPROVE"}
            </button>
            <button style={css.btn("#E74C3C")} onClick={() => updateStatus(app.id, "rejected")} disabled={updating}>
              {updating ? "..." : "REJECT"}
            </button>
          </>
        )}
        {app.status === "under_review" && (
          <>
            <button style={css.btn("#4CAF50")} onClick={() => updateStatus(app.id, "approved")} disabled={updating}>APPROVE</button>
            <button style={css.btn("#E74C3C")} onClick={() => updateStatus(app.id, "rejected")} disabled={updating}>REJECT</button>
          </>
        )}
        {app.status === "approved" && (
          <button style={css.btn("#66BB6A")} onClick={() => updateStatus(app.id, "active")} disabled={updating}>ACTIVATE — ADD TO APP</button>
        )}
        {(app.status === "active" || app.status === "approved") && (
          <button style={css.btn("#9C27B0")} onClick={() => updateStatus(app.id, "suspended")} disabled={updating}>SUSPEND</button>
        )}
        {app.status === "rejected" && (
          <button style={css.btn("#C8A96E")} onClick={() => updateStatus(app.id, "pending")} disabled={updating}>RE-OPEN</button>
        )}
        {app.status === "suspended" && (
          <button style={css.btn("#4CAF50")} onClick={() => updateStatus(app.id, "active")} disabled={updating}>REACTIVATE</button>
        )}
        <button style={{ ...css.btn("#666"), marginLeft: "auto" }} onClick={() => { setSelected(null); setReviewNotes(""); }}>CLOSE</button>
      </div>
    </div>
  );

  return (
    <div style={css.root}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={css.bgImage} />
      <div style={css.bgOverlay} />
      <div style={css.grain} />

      <div style={css.container}>
        {/* Header */}
        <div style={css.header}>
          <div>
            <div style={css.title}>GOOD TIMES</div>
            <div style={css.h1}>PARTNER COMMAND CENTER</div>
          </div>
          <button style={css.refreshBtn} onClick={load}>REFRESH ↻</button>
        </div>

        {/* Stats */}
        <div style={css.statsRow}>
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="Pending Review" value={stats.pending} accent="#C8A96E" />
          <StatCard label="Approved / Active" value={stats.approved} accent="#4CAF50" />
          <StatCard label="Want Ticketing" value={stats.ticketing} accent="#5B9BD5" />
          <StatCard label="Want Ad Space" value={stats.ads} accent="#9C27B0" />
        </div>

        {/* Tabs */}
        <div style={css.tabs}>
          {TABS.map((t, i) => (
            <div key={t} style={css.tab(tab === i)} onClick={() => setTab(i)}>{t}</div>
          ))}
        </div>

        {loading && <div style={css.emptyState}>Loading...</div>}

        {/* TAB 0: Applications */}
        {!loading && tab === 0 && (
          <>
            <div style={css.filterBar}>
              <span style={{ fontSize: 11, color: "#666", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>FILTER:</span>
              <select style={css.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                {["pending", "under_review", "approved", "active", "rejected", "suspended"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
                ))}
              </select>
              <select style={css.select} value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                <option value="all">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>{filtered.length} results</span>
            </div>

            {/* Detail Panel */}
            {selected && renderDetail(selected)}

            {/* List */}
            {filtered.length === 0 && <div style={css.emptyState}>No applications found</div>}
            {filtered.map((app) => (
              <div
                key={app.id}
                style={{ ...css.card, borderColor: selected?.id === app.id ? "rgba(200,169,110,0.4)" : undefined }}
                onClick={() => { setSelected(selected?.id === app.id ? null : app); setReviewNotes(""); }}
              >
                <div style={css.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={css.cardName}>{app.business_name}</div>
                    <div style={css.cardMeta}>
                      {app.business_type?.replace(/_/g, " ")} · {app.city}{app.neighborhood ? ` · ${app.neighborhood}` : ""} · {app.contact_name}
                      {app.wants_ticketing && <span style={{ color: "#4CAF50", marginLeft: 8 }}>🎫 TICKETING</span>}
                      {app.wants_ad_space && <span style={{ color: "#5B9BD5", marginLeft: 8 }}>📣 ADS</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{new Date(app.submitted_at).toLocaleDateString()}</span>
                    <Badge status={app.status} />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* TAB 1: Ad Placements */}
        {!loading && tab === 1 && (
          <>
            <div style={{ ...css.adRow, background: "transparent", border: "none", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>
              <div>PLACEMENT</div><div>TYPE</div><div>RATE</div><div>PRICE</div><div>STATUS</div>
            </div>
            {ads.map((ad) => (
              <div key={ad.id} style={css.adRow}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ad.placement_name}</div>
                  <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{ad.description}</div>
                </div>
                <div style={{ fontSize: 12, color: "#AAA" }}>{ad.placement_type?.replace(/_/g, " ")}</div>
                <div style={{ fontSize: 12, color: ad.rate_type === "trade" ? "#C8A96E" : "#AAA" }}>{ad.rate_type?.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ad.base_price > 0 ? "#F0EDE6" : "#C8A96E" }}>
                  {ad.base_price > 0 ? `$${ad.base_price}` : "TRADE"}
                </div>
                <Badge status={ad.status} />
              </div>
            ))}
            <div style={{ marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "rgba(200,169,110,0.04)", border: "1px solid rgba(200,169,110,0.12)" }}>
              <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: "#C8A96E", textTransform: "uppercase", marginBottom: 8 }}>AD INVENTORY SUMMARY</div>
              <div style={{ fontSize: 13, color: "#888" }}>
                {ads.filter((a) => a.status === "available").length} slots available · {ads.filter((a) => a.rate_type === "trade").length} trade slots · {ads.filter((a) => a.status === "active").length} active campaigns
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Ticket Deals */}
        {!loading && tab === 2 && (
          <>
            {tickets.length === 0 ? (
              <div style={css.emptyState}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>NO TICKET PARTNERSHIPS YET</div>
                <div style={{ color: "#555" }}>Ticket deals will appear here once partner applications with ticketing are approved and events are configured.</div>
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} style={css.card}>
                  <div style={css.cardHeader}>
                    <div>
                      <div style={css.cardName}>{t.event_name}</div>
                      <div style={css.cardMeta}>{t.venue_name} · {t.event_date} · {t.event_time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#4CAF50" }}>${t.commission_earned || "0.00"}</div>
                      <div style={{ fontSize: 10, color: "#666", letterSpacing: 1.5 }}>COMMISSION</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48, padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#333", textTransform: "uppercase" }}>
            THE KOLLECTIVE HOSPITALITY GROUP · GOOD TIMES PARTNER SYSTEM
          </div>
        </div>
      </div>
    </div>
  );
}
