"use client";

import { useState, useRef, useEffect } from "react";

function parseWhatsApp(text: string, profileName: string) {
  const lines = text.split("\n");
  const msgRegex = /^(\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4})[,\s]+(\d{1,2}:\d{2})(?::\d{2})?(?:\s?[AP]M)?\s*[-–]\s*(.+?):\s*(.+)$/;
  const messages = [];
  for (const line of lines) {
    const m = line.match(msgRegex);
    if (m) messages.push({ date: m[1], time: m[2], sender: m[3].trim(), text: m[4].trim() });
  }
  if (messages.length === 0) return null;
 const senders: Record<string, number> = {};
  for (const m of messages) { senders[m.sender] = (senders[m.sender] || 0) + 1; }
  const sortedSenders = Object.entries(senders).sort((a, b) => b[1] - a[1]);
  const totalMsgs = messages.length;
  const profileSender = sortedSenders.find(([s]) =>
    s.toLowerCase().includes(profileName.toLowerCase()) ||
    profileName.toLowerCase().includes(s.toLowerCase().split(" ")[0])
  )?.[0] || sortedSenders[0]?.[0];
  const youSender = sortedSenders.find(([s]) => s !== profileSender)?.[0];
  const profileCount = senders[profileSender] || 0;
 const youCount = senders[youSender ?? ""] || 0;
  const firstDate = messages[0]?.date;
  const lastDate = messages[messages.length - 1]?.date;
  const profileMsgs = messages.filter(m => m.sender === profileSender);
  const avgLen = profileMsgs.length > 0
    ? Math.round(profileMsgs.reduce((s, m) => s + m.text.length, 0) / profileMsgs.length) : 0;
  const hours = {};
  for (const m of profileMsgs) {
    const h = parseInt(m.time.split(":")[0]);
    hours[h] = (hours[h] || 0) + 1;
  }
  const peakHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakLabel = peakHour !== undefined
    ? (parseInt(peakHour) < 12 ? `${peakHour}:00 sabah` : parseInt(peakHour) < 17 ? `${peakHour}:00 öğleden sonra` : `${peakHour}:00 akşam`)
    : null;
  const sampleTexts = profileMsgs
    .filter(m => m.text.length > 20 && !m.text.includes("<Media") && !m.text.includes("omitted"))
    .slice(0, 40).map(m => m.text).join("\n");
  return { totalMsgs, profileCount, youCount, profileSender, youSender, firstDate, lastDate, avgLen, peakLabel, sampleTexts, ratio: totalMsgs > 0 ? Math.round((profileCount / totalMsgs) * 100) : 0 };
}

const SAMPLE_PROFILES = [
  { id: 1, name: "Ahmet", emoji: "👨", relationship: "Arkadaş", description: "10 yıllık arkadaşım. Biraz egoist ama sadık biri. Üniversiteden tanışıyoruz. Sporu sever, basketbol. Duygularını çok belli etmez ama önemseyen biri.", color: "#E8956D", waStats: { totalMsgs: 4832, profileCount: 2201, youCount: 2631, firstDate: "12.03.2019", lastDate: "04.03.2026", avgLen: 38, peakLabel: "22:00 akşam", ratio: 46, profileSender: "Ahmet", sampleTexts: "" } },
  { id: 2, name: "Elif", emoji: "👩", relationship: "Eski sevgili", description: "3 yıl beraberdik, 6 ay önce ayrıldık. Çok zeki ve analitik. Müziğe bayılır. Kızgın olunca suskunlaşır.", color: "#7EB8C9", waStats: { totalMsgs: 12480, profileCount: 6102, youCount: 6378, firstDate: "08.06.2022", lastDate: "14.09.2025", avgLen: 62, peakLabel: "23:00 akşam", ratio: 49, profileSender: "Elif", sampleTexts: "" } }
];

const VIEWS = { HOME: "home", PROFILE: "profile", ADD: "add", CHAT: "chat" };
const accent = "#A594F9";
const bg = "linear-gradient(135deg, #0D0F14 0%, #111520 50%, #0D0F14 100%)";
const card = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textC = "#E8E8F0";
const muted = "#6B6B80";
const MODES = [
  { key: "ask", label: "Analiz", icon: "🔍", desc: "Bu kişi hakkında fikir al" },
  { key: "simulate", label: "Konuş", icon: "💬", desc: "Sanki o yazıyor gibi" },
  { key: "advice", label: "Yardım", icon: "🤝", desc: "Aranda sorun mu var?" }
];
const EMOJIS = ["👤","👨","👩","👴","👵","👦","👧","🧑","👨‍💼","👩‍💼","🧔","👱"];
const COLORS = ["#9B8EC4","#E8956D","#7EB8C9","#E88E8E","#7EC9A0","#C9B87E","#E87EB8","#7E9BC9"];

function Avatar({ emoji, color, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, ${color}88, ${color}44)`, border: `2px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, flexShrink: 0, boxShadow: `0 0 20px ${color}33` }}>
      {emoji}
    </div>
  );
}

function TypewriterText({ text, speed = 15 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false); let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{displayed}{!done && <span style={{ opacity: 0.5 }}>▋</span>}</span>;
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 300, color: color || textC }}>{value}</div>
      <div style={{ fontSize: 10, color: muted, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function WaUploadBox({ profile, onUploadDone }) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".txt")) { setError("Lütfen .txt formatında WhatsApp dışa aktarımı yükle."); return; }
    setParsing(true); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const stats = parseWhatsApp(e.target.result, profile.name);
      setParsing(false);
      if (!stats || stats.totalMsgs < 5) { setError("Mesaj bulunamadı. WhatsApp → Sohbeti Dışa Aktar → Medyasız seçeneğini dene."); return; }
      onUploadDone(stats);
    };
    reader.readAsText(file, "UTF-8");
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        style={{ border: `2px dashed ${dragging ? accent : border}`, borderRadius: 14, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragging ? `${accent}11` : "rgba(255,255,255,0.02)", transition: "all 0.2s" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>{parsing ? "⏳" : "📁"}</div>
        <div style={{ fontSize: 14, color: "#C0C0D0" }}>{parsing ? "Analiz ediliyor..." : "WhatsApp .txt dosyasını sürükle veya tıkla"}</div>
        <div style={{ fontSize: 11, color: muted, marginTop: 8, lineHeight: 1.6 }}>
          WhatsApp → Sohbet → ⋮ Menü → Sohbeti Dışa Aktar → Medyasız
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      {error && <div style={{ fontSize: 12, color: "#E88E8E", marginTop: 10, textAlign: "center" }}>{error}</div>}
    </div>
  );
}

export default function EchoApp() {
  const [view, setView] = useState(VIEWS.HOME);
  const [profiles, setProfiles] = useState(SAMPLE_PROFILES);
  const [activeProfile, setActiveProfile] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState("ask");
  const [newProfile, setNewProfile] = useState({ name: "", relationship: "", description: "", emoji: "👤", color: "#9B8EC4" });
  const [showUpload, setShowUpload] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  function updateProfile(id, patch) {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    setActiveProfile(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }

  async function sendMessage() {
    if (!inputVal.trim() || isLoading) return;
    const userMsg = inputVal.trim();
    setInputVal("");
    const newUserMsg = { role: "user", content: userMsg };
    setChatMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    const stats = activeProfile.waStats;
    const waCtx = stats ? `\n\nWhatsApp verileri: ${stats.totalMsgs} mesaj, ${stats.firstDate}–${stats.lastDate}. ${activeProfile.name} mesajların %${stats.ratio}'ini gönderdi. Ort. mesaj uzunluğu: ${stats.avgLen} kr. En aktif: ${stats.peakLabel}.${stats.sampleTexts ? `\n\nÖrnek mesajlar:\n${stats.sampleTexts}` : ""}` : "";
    const systemPrompts = {
      ask: `Sen "${activeProfile.name}" adlı kişiyi tanıyan AI asistansın.\nTanım: ${activeProfile.description}${waCtx}\nSoruları içgörüyle yanıtla. Türkçe, kısa ve samimi ol.`,
      simulate: `Sen "${activeProfile.name}" adlı kişisin.\nKişilik: ${activeProfile.description}${waCtx}\nBu kişi gibi düşün ve yaz. WhatsApp tarzı kısa mesaj. Türkçe.`,
      advice: `Sen ilişki danışmanısın. "${activeProfile.name}": ${activeProfile.description}${waCtx}\nEmpatiyle dinle, pratik tavsiye ver. Türkçe, sıcak ol.`
    };
    try {
      const history = [...chatMessages, newUserMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompts[chatMode], messages: history })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.content || "Bir hata oluştu." }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Bağlantı hatası." }]);
    }
    setIsLoading(false);
  }

  function openChat(profile, mode) {
    setActiveProfile(profile);
    const m = mode || chatMode;
    setChatMode(m);
    const s = profile.waStats;
    setChatMessages([{ role: "assistant", content: `${profile.name} profilini açtın.${s ? ` ${s.totalMsgs.toLocaleString()} mesajı analiz ettim — ${s.firstDate}'den bu yana.` : ""} Ne öğrenmek istersin?` }]);
    setView(VIEWS.CHAT);
  }

  function addProfile() {
    if (!newProfile.name.trim()) return;
    setProfiles(prev => [...prev, { ...newProfile, id: Date.now(), waStats: null }]);
    setNewProfile({ name: "", relationship: "", description: "", emoji: "👤", color: "#9B8EC4" });
    setView(VIEWS.HOME);
  }

  const baseStyle = { minHeight: "100vh", background: bg, color: textC, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 48px" };
  const inp = { width: "100%", background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "14px 16px", color: textC, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  if (view === VIEWS.HOME) return (
    <div style={baseStyle}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} input::placeholder,textarea::placeholder{color:#3A3A4A} *{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ padding: "52px 0 36px", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: accent, opacity: 0.7, marginBottom: 14, textTransform: "uppercase" }}>kişisel hafıza asistanın</div>
          <div style={{ fontSize: 48, fontWeight: 300, letterSpacing: -2, background: `linear-gradient(135deg, #E8E8F0, ${accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Echo</div>
          <div style={{ fontSize: 13, color: muted, marginTop: 10, fontStyle: "italic" }}>hayatındaki insanları anla</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: muted, letterSpacing: 3, textTransform: "uppercase" }}>{profiles.length} Profil</div>
          <button onClick={() => setView(VIEWS.ADD)} style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: accent, borderRadius: 20, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Ekle</button>
        </div>
        {profiles.map((p, i) => (
          <div key={p.id} onClick={() => { setActiveProfile(p); setShowUpload(false); setView(VIEWS.PROFILE); }}
            style={{ background: card, border: `1px solid ${border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, animation: `fadeUp 0.4s ease ${i * 0.08}s both`, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${p.color}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}>
            <Avatar emoji={p.emoji} color={p.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 3 }}>{p.relationship}</div>
              {p.waStats && <div style={{ fontSize: 11, color: "#6B9E7A", marginTop: 5 }}>📊 {p.waStats.totalMsgs.toLocaleString()} mesaj · {p.waStats.firstDate} – {p.waStats.lastDate}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {p.waStats && <div style={{ fontSize: 10, color: "#4CAF7E", background: "#4CAF7E1A", borderRadius: 10, padding: "2px 8px" }}>WA ✓</div>}
              <div style={{ color: muted, fontSize: 18 }}>›</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === VIEWS.ADD) return (
    <div style={baseStyle}>
      <style>{`input::placeholder,textarea::placeholder{color:#3A3A4A} *{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "32px 0 28px" }}>
          <button onClick={() => setView(VIEWS.HOME)} style={{ background: "none", border: "none", color: muted, fontSize: 22, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 22, fontWeight: 300 }}>Yeni Profil</div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Avatar emoji={newProfile.emoji} color={newProfile.color} size={80} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            {EMOJIS.map(e => <button key={e} onClick={() => setNewProfile(p => ({...p, emoji: e}))} style={{ fontSize: 20, background: newProfile.emoji === e ? `${accent}33` : "transparent", border: `1px solid ${newProfile.emoji === e ? accent : border}`, borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>{e}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            {COLORS.map(c => <button key={c} onClick={() => setNewProfile(p => ({...p, color: c}))} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: newProfile.color === c ? "2px solid white" : "2px solid transparent", cursor: "pointer" }} />)}
          </div>
        </div>
        {[{ key: "name", label: "İsim", ph: "Ahmet, Elif..." }, { key: "relationship", label: "İlişki", ph: "Arkadaş, Eski sevgili, Aile..." }].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: muted, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{f.label}</div>
            <input value={newProfile[f.key]} onChange={e => setNewProfile(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} style={inp} />
          </div>
        ))}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: muted, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Bu kişiyi tanımla</div>
          <textarea value={newProfile.description} onChange={e => setNewProfile(p => ({...p, description: e.target.value}))} placeholder="Bu kişi nasıl biri? Ne zaman tanıştınız? Karakteri nasıl?" rows={5} style={{ ...inp, resize: "none", lineHeight: 1.6 }} />
        </div>
        <button onClick={addProfile} style={{ width: "100%", background: `linear-gradient(135deg, ${accent}, #7B6EF0)`, border: "none", borderRadius: 14, padding: "16px", color: "white", fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>Profili Oluştur</button>
      </div>
    </div>
  );

  if (view === VIEWS.PROFILE && activeProfile) {
    const stats = activeProfile.waStats;
    return (
      <div style={baseStyle}>
        <style>{`*{box-sizing:border-box}`}</style>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 0 24px" }}>
            <button onClick={() => setView(VIEWS.HOME)} style={{ background: "none", border: "none", color: muted, fontSize: 22, cursor: "pointer" }}>←</button>
            <button onClick={() => openChat(activeProfile)} style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: accent, borderRadius: 20, padding: "8px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Sohbet Aç →</button>
          </div>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Avatar emoji={activeProfile.emoji} color={activeProfile.color} size={88} />
            <div style={{ fontSize: 30, fontWeight: 300, marginTop: 16 }}>{activeProfile.name}</div>
            <div style={{ fontSize: 14, color: muted, marginTop: 6, fontStyle: "italic" }}>{activeProfile.relationship}</div>
          </div>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "20px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Tanım</div>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#C0C0D0" }}>{activeProfile.description}</div>
          </div>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "20px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: (stats && !showUpload) ? 18 : 0 }}>
              <div>
                <div style={{ fontSize: 10, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>WhatsApp Geçmişi</div>
                <div style={{ fontSize: 14, color: stats ? "#4CAF7E" : muted }}>{stats ? `✓ ${stats.totalMsgs.toLocaleString()} mesaj analiz edildi` : "Henüz yüklenmedi"}</div>
              </div>
              <button onClick={() => setShowUpload(v => !v)} style={{ background: stats ? "#4CAF7E22" : `${accent}22`, border: `1px solid ${stats ? "#4CAF7E55" : `${accent}55`}`, color: stats ? "#4CAF7E" : accent, borderRadius: 10, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {showUpload ? "Kapat" : stats ? "Güncelle" : "Yükle"}
              </button>
            </div>
            {stats && !showUpload && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <StatPill label="Toplam" value={stats.totalMsgs.toLocaleString()} color="#A594F9" />
                  <StatPill label={activeProfile.name} value={stats.profileCount.toLocaleString()} color={activeProfile.color} />
                  <StatPill label="Sen" value={stats.youCount.toLocaleString()} color="#7EC9A0" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  <StatPill label="Ort. uzunluk" value={`${stats.avgLen} kr`} />
                  {stats.peakLabel && <StatPill label="En aktif" value={stats.peakLabel} />}
                </div>
                <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>Konuşma oranı</div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stats.ratio}%`, background: `linear-gradient(90deg, ${activeProfile.color}, ${accent})`, borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: muted, marginTop: 5 }}>
                  <span>{activeProfile.name} %{stats.ratio}</span><span>Sen %{100 - stats.ratio}</span>
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 14, textAlign: "center" }}>📅 {stats.firstDate} → {stats.lastDate}</div>
              </div>
            )}
            {showUpload && (
              <WaUploadBox profile={activeProfile} onUploadDone={(s) => { updateProfile(activeProfile.id, { waStats: s }); setShowUpload(false); }} />
            )}
          </div>
          <div style={{ fontSize: 11, color: muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Mod Seç</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => openChat(activeProfile, m.key)}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "16px 10px", cursor: "pointer", textAlign: "center", fontFamily: "inherit", color: textC, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = `${accent}11`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = card; }}>
                <div style={{ fontSize: 24 }}>{m.icon}</div>
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === VIEWS.CHAT && activeProfile) return (
    <div style={{ minHeight: "100vh", background: bg, color: textC, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}} textarea::placeholder{color:#3A3A4A} *{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${border}`, background: "rgba(13,15,20,0.96)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView(VIEWS.PROFILE)} style={{ background: "none", border: "none", color: muted, fontSize: 20, cursor: "pointer" }}>←</button>
          <Avatar emoji={activeProfile.emoji} color={activeProfile.color} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15 }}>{activeProfile.name}</div>
            <div style={{ fontSize: 11, color: accent, marginTop: 1 }}>{MODES.find(m => m.key === chatMode)?.icon} {MODES.find(m => m.key === chatMode)?.label} modu</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => { setChatMode(m.key); setChatMessages([{ role: "assistant", content: `${m.icon} ${m.label} moduna geçildi.` }]); }}
                style={{ background: chatMode === m.key ? `${accent}33` : "transparent", border: `1px solid ${chatMode === m.key ? accent : border}`, color: chatMode === m.key ? accent : muted, borderRadius: 8, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 18, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10 }}>
              {msg.role === "assistant" && <Avatar emoji={activeProfile.emoji} color={activeProfile.color} size={26} />}
              <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? `linear-gradient(135deg, ${accent}99, #7B6EF099)` : "rgba(255,255,255,0.05)", border: `1px solid ${msg.role === "user" ? `${accent}55` : border}`, fontSize: 14, lineHeight: 1.65 }}>
                {i === chatMessages.length - 1 && msg.role === "assistant" && !isLoading ? <TypewriterText text={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 18 }}>
              <Avatar emoji={activeProfile.emoji} color={activeProfile.color} size={26} />
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, borderRadius: "18px 18px 18px 4px", padding: "14px 16px" }}>
                <span style={{ display: "flex", gap: 5 }}>
                  {[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", animation: `bounce 1.2s ${j * 0.2}s infinite` }} />)}
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "14px 20px 28px", borderTop: `1px solid ${border}`, background: "rgba(13,15,20,0.96)", backdropFilter: "blur(12px)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder={chatMode === "ask" ? `${activeProfile.name} hakkında ne merak ediyorsun?` : chatMode === "simulate" ? `${activeProfile.name}'e bir şey yaz...` : "Aranda ne yaşandı, anlat..."}
              rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, borderRadius: 16, padding: "13px 16px", color: textC, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
            <button onClick={sendMessage} disabled={isLoading || !inputVal.trim()}
              style={{ width: 44, height: 44, borderRadius: "50%", background: inputVal.trim() && !isLoading ? `linear-gradient(135deg, ${accent}, #7B6EF0)` : "rgba(255,255,255,0.05)", border: "none", cursor: inputVal.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "white" }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}