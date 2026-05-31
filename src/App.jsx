import { useState } from "react";

const SYS = `Tu es un rédacteur d'annonces immobilières pour Andrea Collard, mandataire BSK Immobilier.

RÈGLES ABSOLUES SUR LE CONTENU DU DESCRIPTIF :

- Le descriptif ne doit PAS mentionner le prix, le DPE, le type de chauffage, l'année de construction ni la taxe foncière. Ces données vont dans les champs dédiés du portail, pas dans le texte.

- Surface du terrain : à mentionner si communiquée (ex: "jardin de 180 m²").

- Longueur minimum : 2000 caractères, idéalement 2200-2500. C'est une règle dure.

- Structure : headers en **gras** par zone ou étage (ex: **Rez-de-chaussée**, **Étage**, **Extérieur**, **Environnement**).

- Tagline courte en *italique* en toute fin, précédée d'un séparateur ---.

- Interdit : magnifique, exceptionnel, splendide, parfait, idéal, rare, coup de cœur, incontournable.

- Pas de langage investisseur sauf si l'angle "investisseur" est demandé.

- Ton factuel et attractif : décrire sans exagérer, valoriser sans mentir.

- Le titre mentionne : type + surface + ville + 1 point fort clé.

FORMAT DE RÉPONSE : JSON uniquement, aucun texte avant ou après, aucun backtick.

{
  "titre": "...",
  "description": "...",
  "nb_caracteres": 2150,
  "points_forts": ["jardin 180m²", "résidence sécurisée"],
  "manques": ["surface du terrain non précisée"]
}

Seul "surface du terrain" peut figurer dans les manques si absent. Ne pas signaler DPE, prix, chauffage, année, taxe foncière comme manquants.`;

const TYPES = ["Maison", "Appartement", "Terrain", "Local commercial", "Immeuble"];
const ANGLES = [
  { value: "", label: "Neutre" },
  { value: "famille", label: "Famille" },
  { value: "premier achat", label: "Premier achat" },
  { value: "investisseur", label: "Investisseur" },
  { value: "retraite", label: "Retraite / seniors" },
];

const C = {
  primary: "#3B4C5E",
  accent: "#C46B57",
  accentLight: "rgba(196,107,87,.1)",
  accentMid: "rgba(196,107,87,.18)",
  okBg: "rgba(29,158,117,.1)",
  okText: "#0F6E56",
  muted: "#8B9BA8",
  border: "#E4E8ED",
  pageBg: "#F7F8FA",
  white: "#ffffff",
};

const GLOBAL_STYLES = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-22px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(22px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes progressGrow {
    from { width: 0%; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: ${C.pageBg}; }

  .bsk-textarea:focus, .bsk-select:focus {
    border-color: ${C.accent} !important;
    box-shadow: 0 0 0 3px ${C.accentMid};
    outline: none;
  }
  .bsk-btn-main {
    transition: background .2s, transform .12s, box-shadow .2s;
  }
  .bsk-btn-main:hover:not(:disabled) {
    background: #2e3d4d !important;
    box-shadow: 0 4px 14px rgba(59,76,94,.25);
    transform: translateY(-1px);
  }
  .bsk-btn-main:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
  .bsk-btn-copy {
    transition: color .15s, border-color .15s, background .15s;
  }
  .bsk-btn-copy:hover {
    border-color: ${C.accent} !important;
    color: ${C.accent} !important;
  }
  .bsk-btn-variant {
    transition: background .2s, transform .12s;
  }
  .bsk-btn-variant:hover {
    background: #b05a47 !important;
    transform: translateY(-1px);
  }

  @media (max-width: 700px) {
    .bsk-grid { grid-template-columns: 1fr !important; }
  }
`;

const label = {
  display: "block", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: ".7px",
  marginBottom: 7, color: C.muted,
};

function Badge({ ok, children }) {
  return (
    <span style={{
      padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: ok ? C.okBg : C.accentLight,
      color: ok ? C.okText : C.accent,
      border: `1px solid ${ok ? "rgba(29,158,117,.2)" : "rgba(196,107,87,.2)"}`,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Skeleton() {
  const shimmerBg = `linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)`;
  return (
    <div style={{ padding: "1rem 0" }}>
      {[88, 72, 82, 48, 78, 65, 90].map((w, i) => (
        <div key={i} style={{
          height: 11, width: `${w}%`,
          background: shimmerBg,
          backgroundSize: "800px 100%",
          animation: `shimmer 1.4s infinite linear`,
          animationDelay: `${i * 0.08}s`,
          borderRadius: 5,
          marginBottom: 11,
        }} />
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 2000 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = value >= max ? C.okText : value >= 1500 ? "#E6A817" : C.accent;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        height: 5, background: C.pageBg, borderRadius: 10, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 10,
          animation: "progressGrow .6s ease",
          transition: "width .4s ease, background .3s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: C.muted }}>{value} car.</span>
        <span style={{ fontSize: 10, color: C.muted }}>objectif 2 000</span>
      </div>
    </div>
  );
}

function renderDesc(text) {
  return text.split("\n").map((line, i) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .map((seg, j) => {
        if (seg.startsWith("**") && seg.endsWith("**"))
          return <strong key={j} style={{ color: C.primary }}>{seg.slice(2, -2)}</strong>;
        if (seg.startsWith("*") && seg.endsWith("*"))
          return <em key={j} style={{ color: C.accent }}>{seg.slice(1, -1)}</em>;
        return seg;
      });
    return <span key={i}>{parts}<br /></span>;
  });
}

export default function App() {
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("Maison");
  const [angle, setAngle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function generer() {
    if (!notes.trim()) { setError("Colle tes notes avant de générer."); return; }
    setLoading(true); setError(""); setResult(null);

    const msg = `Type : ${type}${angle ? "\nAngle : " + angle : ""}\n\nNotes :\n${notes}`;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          system: SYS,
          messages: [{ role: "user", content: msg }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch (err) {
      setError("Erreur : " + err.message);
    }
    setLoading(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  const nb = result?.nb_caracteres || result?.description?.length || 0;
  const nbOk = nb >= 2000;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: C.primary, minHeight: "100vh", background: C.pageBg,
        padding: "2rem 1.5rem 3rem",
      }}>

        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: "2.5rem",
          animation: "fadeInDown .5s ease both",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              fontSize: 22, fontWeight: 800, color: C.accent,
              letterSpacing: "-0.5px",
            }}>BSK</span>
            <span style={{
              width: 1, height: 22, background: C.border, display: "inline-block",
            }} />
            <span style={{ fontSize: 18, fontWeight: 500, color: C.primary }}>
              Générateur d'annonce
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: C.muted, letterSpacing: ".2px" }}>
            Notes brutes en entrée — titre + descriptif ≥ 2 000 car. en sortie
          </p>
        </div>

        {/* Card */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          background: C.white,
          borderRadius: 14,
          boxShadow: "0 2px 8px rgba(59,76,94,.07), 0 8px 32px rgba(59,76,94,.08)",
          padding: "2rem",
        }}>
          <div className="bsk-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem",
          }}>

            {/* LEFT — formulaire */}
            <div style={{ animation: "fadeInLeft .5s .1s ease both" }}>
              <label style={label}>Notes de visite (texte libre)</label>
              <textarea
                className="bsk-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) generer(); }}
                rows={13}
                placeholder={"Colle tout ici sans mise en forme :\nsurface, pièces, cuisine, séjour, chambres,\nterrasse, jardin, garage, cave, quartier...\n\nCtrl+Entrée pour générer."}
                style={{
                  width: "100%", padding: "10px 13px",
                  border: `1.5px solid ${C.border}`, borderRadius: 8,
                  fontSize: 13, color: C.primary, fontFamily: "inherit",
                  resize: "vertical", lineHeight: 1.65, background: C.white,
                  transition: "border-color .2s, box-shadow .2s",
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                {[
                  { label: "Type de bien", value: type, set: setType, opts: TYPES.map(t => ({ value: t, label: t })) },
                  { label: "Angle cible",  value: angle, set: setAngle, opts: ANGLES },
                ].map(({ label: lbl, value, set, opts }) => (
                  <div key={lbl}>
                    <label style={label}>{lbl}</label>
                    <select
                      className="bsk-select"
                      value={value}
                      onChange={e => set(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 13px",
                        border: `1.5px solid ${C.border}`, borderRadius: 8,
                        fontSize: 13, color: C.primary, background: C.white,
                        transition: "border-color .2s, box-shadow .2s",
                        cursor: "pointer",
                      }}
                    >
                      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <button
                className="bsk-btn-main"
                onClick={generer}
                disabled={loading}
                style={{
                  width: "100%", marginTop: 14, padding: "12px 0",
                  background: loading ? C.muted : C.primary,
                  color: C.white, border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: ".2px",
                }}
              >
                {loading ? "Rédaction en cours…" : "Générer l'annonce ↗"}
              </button>
            </div>

            {/* RIGHT — résultat */}
            <div style={{ animation: "fadeInRight .5s .15s ease both" }}>

              {/* Badges */}
              {result && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  <Badge ok={nbOk}>{nb} car.{nbOk ? " ✓" : " — trop court"}</Badge>
                  {(result.manques || []).length === 0
                    ? <Badge ok>Infos complètes</Badge>
                    : (result.manques || []).map((m, i) => <Badge key={i} ok={false}>⚠ {m}</Badge>)
                  }
                  {(result.points_forts || []).slice(0, 2).map((p, i) =>
                    <Badge key={i} ok>✓ {p}</Badge>
                  )}
                </div>
              )}

              {/* Panneau résultat */}
              <div style={{
                background: C.pageBg, border: `1.5px solid ${C.border}`,
                borderRadius: 10, padding: "1.5rem", minHeight: 220,
              }}>
                {error && (
                  <p style={{
                    color: C.accent, fontSize: 13, margin: 0,
                    padding: "10px 14px", background: C.accentLight,
                    borderRadius: 6, border: `1px solid ${C.accentMid}`,
                  }}>{error}</p>
                )}

                {!result && !loading && !error && (
                  <div style={{
                    color: C.muted, fontSize: 13, textAlign: "center",
                    padding: "2.5rem 0", lineHeight: 2,
                  }}>
                    L'annonce apparaîtra ici.<br />
                    Titre · Description ≥ 2 000 car.<br />
                    <span style={{ fontSize: 12 }}>Headers par zone · Tagline en italique</span>
                  </div>
                )}

                {loading && <Skeleton />}

                {result && !loading && (
                  <>
                    {/* Titre */}
                    <p style={{
                      margin: "0 0 1rem", fontSize: 14, fontWeight: 700,
                      paddingBottom: ".75rem", borderBottom: `1.5px solid ${C.border}`,
                      color: C.primary,
                    }}>{result.titre}</p>

                    {/* Description */}
                    <div style={{ fontSize: 13, lineHeight: 1.9, color: C.primary }}>
                      {renderDesc(result.description || "")}
                    </div>

                    {/* Barre de progression caractères */}
                    <ProgressBar value={nb} />

                    {/* Boutons */}
                    <div style={{
                      display: "flex", gap: 8, marginTop: "1.2rem",
                      paddingTop: "1rem", borderTop: `1.5px solid ${C.border}`,
                      flexWrap: "wrap",
                    }}>
                      {[
                        { key: "tout",  label: "Copier tout",      fn: () => copy(`${result.titre}\n\n${result.description}`, "tout") },
                        { key: "titre", label: "Copier titre",     fn: () => copy(result.titre, "titre") },
                        { key: "desc",  label: "Copier descriptif", fn: () => copy(result.description, "desc") },
                      ].map(({ key, label: lbl, fn }) => (
                        <button
                          key={key}
                          className="bsk-btn-copy"
                          onClick={fn}
                          style={{
                            flex: 1, minWidth: 90, padding: "8px 6px",
                            border: `1.5px solid ${copied === key ? C.accent : C.border}`,
                            background: copied === key ? C.accentLight : C.white,
                            borderRadius: 7, fontSize: 12, fontWeight: 600,
                            color: copied === key ? C.accent : C.muted,
                            cursor: "pointer",
                          }}
                        >
                          {copied === key ? "Copié ✓" : lbl}
                        </button>
                      ))}
                      <button
                        className="bsk-btn-variant"
                        onClick={generer}
                        style={{
                          flex: 1, minWidth: 90, padding: "8px 6px",
                          background: C.accent, color: C.white,
                          border: `1.5px solid ${C.accent}`,
                          borderRadius: 7, fontSize: 12, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >Variante ↗</button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
