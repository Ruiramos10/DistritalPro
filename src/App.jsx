import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Shield,
  Users,
  ClipboardList,
  LayoutGrid,
  Shuffle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Filter,
  Swords,
  Rows3,
  ListOrdered,
  CalendarDays,
  ArrowLeftRight,
  Plus,
  X,
  MapPin,
  Trash2,
  UserPlus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens — modo noturno
// ---------------------------------------------------------------------------
const T = {
  bg: "#0A1220",
  surface: "#121D2E",
  surface2: "#1A2740",
  panel: "#16233A",
  line: "#28374C",
  lineSoft: "#1E2C40",
  text: "#E8EEF4",
  text2: "#9FB2C6",
  text3: "#647890",
  green: "#3FB27E",
  greenSoft: "#122A20",
  gold: "#DDA94B",
  goldSoft: "#2A2113",
  danger: "#E27672",
  dangerSoft: "#2C1A1B",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
.pf-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
.pf-body { font-family: 'Inter', sans-serif; }
.pf-mono { font-family: 'IBM Plex Mono', monospace; }
.pf-tab-btn { transition: color .15s ease, border-color .15s ease; }
.pf-card { transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.pf-card:hover { transform: translateY(-1px); }
.pf-focus:focus-visible { outline: 2px solid ${T.green}; outline-offset: 2px; }
select, input { color-scheme: dark; }
`;

// ---------------------------------------------------------------------------
// Geografia — concelhos do distrito de Beja (coordenadas aproximadas das sedes
// de concelho, usadas para o algoritmo de proximidade). Ajustável.
// ---------------------------------------------------------------------------
const CONCELHOS = {
  ser: { nome: "Serpa", lat: 37.9497, lon: -7.5964 },
  bej: { nome: "Beja", lat: 38.015, lon: -7.8632 },
  ode: { nome: "Odemira", lat: 37.5975, lon: -8.6389 },
  vid: { nome: "Vidigueira", lat: 38.2094, lon: -7.8092 },
  mou: { nome: "Moura", lat: 38.1394, lon: -7.4478 },
  fal: { nome: "Ferreira do Alentejo", lat: 38.0503, lon: -8.1173 },
  cve: { nome: "Castro Verde", lat: 37.7008, lon: -8.0898 },
  alm: { nome: "Almodôvar", lat: 37.5136, lon: -8.0658 },
  bar: { nome: "Barrancos", lat: 38.1428, lon: -6.9781 },
  cub: { nome: "Cuba", lat: 38.1631, lon: -7.8887 },
  alj: { nome: "Aljustrel", lat: 37.8817, lon: -8.1667 },
  mer: { nome: "Mértola", lat: 37.6397, lon: -7.6636 },
  our: { nome: "Ourique", lat: 37.6486, lon: -8.2262 },
};

// ---------------------------------------------------------------------------
// Clubes da AF Beja (extraído de "Competições_26-27.pptx")
// concelhoId é uma aproximação a partir do nome do clube — reveja/ajuste se necessário.
// ---------------------------------------------------------------------------
// eslint-disable-next-line prefer-const
let CLUBES = [
  { id: "c1", nome: "CA Aldenovense", concelhoId: "ser" },
  { id: "c2", nome: "CCD Bairro NSC", concelhoId: "bej" },
  { id: "c3", nome: "CD Almodôvar", concelhoId: "alm" },
  { id: "c4", nome: "CD Praia Milfontes", concelhoId: "ode" },
  { id: "c5", nome: "CF Vasco da Gama", concelhoId: "vid" },
  { id: "c6", nome: "FC Albernoense", concelhoId: "bej" },
  { id: "c7", nome: "FC Castrense", concelhoId: "cve" },
  { id: "c8", nome: "FC Negrilhos", concelhoId: "fal" },
  { id: "c9", nome: "GD Renascente", concelhoId: "ode" },
  { id: "c10", nome: "Moura AC", concelhoId: "mou" },
  { id: "c11", nome: "SC Ferreirense", concelhoId: "fal" },
  { id: "c12", nome: "SC Odemirense", concelhoId: "ode" },
  { id: "c13", nome: "Barrancos FC", concelhoId: "bar" },
  { id: "c14", nome: "CCD Trindade", concelhoId: "bej" },
  { id: "c15", nome: "CDC Panóias", concelhoId: "bej" },
  { id: "c16", nome: "Despertar SC", concelhoId: "bej" },
  { id: "c17", nome: "FC Serpa", concelhoId: "ser" },
  { id: "c18", nome: "GD Messejanense", concelhoId: "alj" },
  { id: "c19", nome: "GD Santa Luzia", concelhoId: "fal" },
  { id: "c20", nome: "JC Boavista", concelhoId: "bej" },
  { id: "c21", nome: "Piense SC", concelhoId: "ser" },
  { id: "c22", nome: "SC Cuba", concelhoId: "cub" },
  { id: "c23", nome: "SC Figueirense", concelhoId: "ser" },
  { id: "c24", nome: "ACD Penedo Gordo", concelhoId: "bej" },
  { id: "c25", nome: "AJ Brinches", concelhoId: "ser" },
  { id: "c26", nome: "CCRD Santa Vitória", concelhoId: "bej" },
  { id: "c27", nome: "CD Beja", concelhoId: "bej" },
  { id: "c28", nome: "CDR Salvadense", concelhoId: "bej" },
  { id: "c29", nome: "CF Guadiana", concelhoId: "mer" },
  { id: "c30", nome: "CDR Cabeça Gorda", concelhoId: "bej" },
  { id: "c31", nome: "GD Amarelejense", concelhoId: "mou" },
  { id: "c32", nome: "GDR Faro do Alentejo", concelhoId: "cub" },
  { id: "c33", nome: "Louredense FC", concelhoId: "our" },
  { id: "c34", nome: "São Domingos FC", concelhoId: "mer" },
  { id: "c35", nome: "UDC Beringelense", concelhoId: "bej" },
  { id: "c36", nome: "ACD Santa Clara-a-Nova", concelhoId: "ode" },
  { id: "c37", nome: "Alvorada FC", concelhoId: "cub" },
  { id: "c38", nome: "FC Pereirense", concelhoId: "cve" },
  { id: "c39", nome: "São Marcos FC", concelhoId: "cve" },
  { id: "c40", nome: "GD Sete", concelhoId: "ode" },
  { id: "c41", nome: "GDCR Naverredondense", concelhoId: "ode" },
  { id: "c42", nome: "GDR Amoreiras-Gare", concelhoId: "ode" },
  { id: "c43", nome: "GDR Luzianes-Gare", concelhoId: "ode" },
  { id: "c44", nome: "Ourique DC", concelhoId: "our" },
  { id: "c45", nome: "Sabóia AC", concelhoId: "ode" },
  { id: "c46", nome: "SRD Entradense", concelhoId: "cve" },
  { id: "c47", nome: "SCM Aljustrelense", concelhoId: "alj" },
];

// ---------------------------------------------------------------------------
// Provas — escalões seniores e de formação, época 2026/2027
// diaIdx: 0 = Domingo, 6 = Sábado (usado para gerar o calendário)
// ---------------------------------------------------------------------------
const COMPETICOES = [
  { id: "d1", nome: "Campeonato Distrital da 1ª Divisão", escalao: "Seniores", tipo: "Seniores", hasSeries: false, diaIdx: 0, hora: "15:00" },
  { id: "dh", nome: "Campeonato Distrital da Divisão de Honra", escalao: "Seniores", tipo: "Seniores", hasSeries: false, diaIdx: 0, hora: "15:00" },
  { id: "d2", nome: "Campeonato Distrital da 2ª Divisão", escalao: "Seniores", tipo: "Seniores", hasSeries: true, numSeries: 2, diaIdx: 0, hora: "15:00" },
  { id: "s18", nome: "Campeonato Distrital de Juniores", escalao: "Sub-18", tipo: "Formação", hasSeries: true, numSeries: 2, hasFases: true, avancamFase2Default: 2, diaIdx: 6, hora: "18:30" },
  { id: "s16", nome: "Campeonato Distrital de Juvenis", escalao: "Sub-16", tipo: "Formação", hasSeries: true, numSeries: 2, hasFases: true, avancamFase2Default: 2, diaIdx: 0, hora: "11:00" },
  { id: "s14", nome: "Campeonato Distrital de Iniciados", escalao: "Sub-14", tipo: "Formação", hasSeries: true, numSeries: 2, hasFases: true, avancamFase2Default: 2, diaIdx: 0, hora: "10:30" },
  { id: "s13", nome: "Liga de Desenvolvimento (Infantis)", escalao: "Sub-13", tipo: "Formação", hasSeries: true, numSeries: 3, hasFases: true, avancamFase2Default: 2, diaIdx: 6, hora: "10:00" },
  { id: "s11", nome: "Liga de Formação (Benjamins)", escalao: "Sub-11", tipo: "Formação", hasSeries: true, numSeries: 3, hasFases: true, avancamFase2Default: 2, diaIdx: 6, hora: "10:00" },
];
const compById = (id) => COMPETICOES.find((c) => c.id === id);

// ---------------------------------------------------------------------------
// Inscrições reais 2026/2027, já divididas nas séries definidas pela AF Beja.
// [clubeId, competicaoId, serie ('A'/'B'/'C' ou null), designação explícita opcional]
// ---------------------------------------------------------------------------
const seedRaw = [
  // 1ª Divisão (grupo único)
  ["c1", "d1"], ["c2", "d1"], ["c3", "d1"], ["c4", "d1"], ["c5", "d1"], ["c6", "d1"],
  ["c7", "d1"], ["c8", "d1"], ["c9", "d1"], ["c10", "d1"], ["c11", "d1"], ["c12", "d1"],
  // Divisão de Honra (grupo único)
  ["c13", "dh"], ["c1", "dh", null, "B"], ["c14", "dh"], ["c15", "dh"], ["c16", "dh"],
  ["c17", "dh", null, "B"], ["c18", "dh"], ["c19", "dh"], ["c20", "dh"], ["c21", "dh"], ["c22", "dh"], ["c23", "dh"],
  // 2ª Divisão — Série A / Série B
  ["c24", "d2", "A"], ["c25", "d2", "A"], ["c26", "d2", "A"], ["c27", "d2", "A"], ["c28", "d2", "A"],
  ["c29", "d2", "A"], ["c30", "d2", "A"], ["c31", "d2", "A"], ["c32", "d2", "A"], ["c33", "d2", "A"],
  ["c34", "d2", "A"], ["c35", "d2", "A"],
  ["c36", "d2", "B"], ["c37", "d2", "B"], ["c4", "d2", "B", "B"], ["c38", "d2", "B"], ["c39", "d2", "B"],
  ["c40", "d2", "B"], ["c41", "d2", "B"], ["c42", "d2", "B"], ["c43", "d2", "B"], ["c44", "d2", "B"],
  ["c45", "d2", "B"], ["c46", "d2", "B"],
  // Juniores Sub-18 — Série A / Série B
  ["c24", "s18", "A"], ["c13", "s18", "A"], ["c2", "s18", "A"], ["c27", "s18", "A"], ["c5", "s18", "A"],
  ["c16", "s18", "A"], ["c17", "s18", "A"],
  ["c3", "s18", "B"], ["c4", "s18", "B"], ["c20", "s18", "B"], ["c11", "s18", "B"], ["c47", "s18", "B"], ["c44", "s18", "B"],
  // Juvenis Sub-16 — Série A / Série B
  ["c2", "s16", "A"], ["c27", "s16", "A"], ["c29", "s16", "A"], ["c5", "s16", "A"], ["c30", "s16", "A"],
  ["c17", "s16", "A"], ["c31", "s16", "A"], ["c10", "s16", "A"], ["c21", "s16", "A"], ["c22", "s16", "A"],
  ["c24", "s16", "B"], ["c3", "s16", "B"], ["c4", "s16", "B"], ["c7", "s16", "B"], ["c9", "s16", "B"],
  ["c20", "s16", "B"], ["c8", "s16", "B"], ["c11", "s16", "B"], ["c47", "s16", "B"],
  // Iniciados Sub-14 — Série A / Série B
  ["c24", "s14", "A"], ["c13", "s14", "A"], ["c1", "s14", "A"], ["c2", "s14", "A"], ["c27", "s14", "A"],
  ["c5", "s14", "A"], ["c16", "s14", "A"], ["c17", "s14", "A"], ["c10", "s14", "A"],
  ["c3", "s14", "B"], ["c27", "s14", "B"], ["c4", "s14", "B"], ["c16", "s14", "B"], ["c7", "s14", "B"],
  ["c9", "s14", "B"], ["c11", "s14", "B"], ["c12", "s14", "B"], ["c47", "s14", "B"],
  // Liga de Desenvolvimento — Infantis Sub-13 — Série A / B / C
  ["c13", "s13", "A"], ["c1", "s13", "A"], ["c2", "s13", "A"], ["c27", "s13", "A"], ["c29", "s13", "A"],
  ["c16", "s13", "A"], ["c17", "s13", "A"], ["c31", "s13", "A"], ["c10", "s13", "A"], ["c21", "s13", "A"],
  ["c24", "s13", "B"], ["c2", "s13", "B"], ["c27", "s13", "B"], ["c5", "s13", "B"], ["c30", "s13", "B"],
  ["c16", "s13", "B"], ["c6", "s13", "B"], ["c22", "s13", "B"], ["c11", "s13", "B"],
  ["c3", "s13", "C"], ["c4", "s13", "C"], ["c7", "s13", "C"], ["c18", "s13", "C"], ["c9", "s13", "C"],
  ["c20", "s13", "C"], ["c44", "s13", "C"], ["c12", "s13", "C"], ["c47", "s13", "C"],
  // Liga de Formação — Benjamins Sub-11 — Série A / B / C
  ["c13", "s11", "A"], ["c1", "s11", "A"], ["c2", "s11", "A"], ["c27", "s11", "A"], ["c29", "s11", "A"],
  ["c16", "s11", "A"], ["c17", "s11", "A"], ["c31", "s11", "A"], ["c10", "s11", "A"], ["c21", "s11", "A"],
  ["c24", "s11", "B"], ["c2", "s11", "B"], ["c3", "s11", "B", "B"], ["c27", "s11", "B"], ["c5", "s11", "B"],
  ["c30", "s11", "B"], ["c7", "s11", "B"], ["c10", "s11", "B"], ["c11", "s11", "B"], ["c32", "s11", "B"],
  ["c2", "s11", "C"], ["c3", "s11", "C", "A"], ["c4", "s11", "C"], ["c18", "s11", "C"], ["c9", "s11", "C"],
  ["c20", "s11", "C"], ["c8", "s11", "C"], ["c44", "s11", "C"], ["c47", "s11", "C"], ["c7", "s11", "C"],
];

const seedTeams = seedRaw.map(([clubeId, competicaoId, serie, equipaSeed], i) => ({
  id: `seed-${i}`,
  clubeId,
  competicaoId,
  serie: serie ?? null,
  equipaSeed: equipaSeed ?? null,
  data: "01/08/2026",
  estado: "Confirmada",
}));

// ---------------------------------------------------------------------------
// Helpers de domínio
// ---------------------------------------------------------------------------
function clubeById(id) {
  return CLUBES.find((c) => c.id === id);
}
// Localização aproximada para clubes inscritos manualmente sem concelho definido
// (centro do distrito de Beja), para o sorteio por proximidade não rebentar.
const CONCELHO_FALLBACK = { nome: "—", lat: 37.98, lon: -7.95 };
function concelhoDoClube(clube) {
  return CONCELHOS[clube.concelhoId] || CONCELHO_FALLBACK;
}
// Regista um clube novo (fora da lista pré-carregada) e devolve o seu id.
function addClube(nome, concelhoId = null) {
  const existente = CLUBES.find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
  if (existente) return existente.id;
  const maxNum = Math.max(0, ...CLUBES.map((c) => parseInt(c.id.replace("c", ""), 10) || 0));
  const id = `c${maxNum + 1}`;
  CLUBES.push({ id, nome: nome.trim(), concelhoId });
  return id;
}

// Atribui automaticamente "A"/"B"/"C" quando um clube tem mais do que uma
// equipa na mesma prova; respeita designações explícitas quando existem.
function computeLabels(teams) {
  const groups = {};
  teams.forEach((t) => {
    const k = t.clubeId + "|" + t.competicaoId;
    (groups[k] = groups[k] || []).push(t);
  });
  const label = new Map();
  Object.values(groups).forEach((arr) => {
    if (arr.length === 1) {
      label.set(arr[0].id, arr[0].equipaSeed ?? null);
    } else {
      arr.forEach((t, i) => label.set(t.id, t.equipaSeed ?? String.fromCharCode(65 + i)));
    }
  });
  return teams.map((t) => ({ ...t, equipa: label.get(t.id) }));
}

function teamLabel(t) {
  const clube = clubeById(t.clubeId);
  return clube.nome + (t.equipa ? ` "${t.equipa}"` : "");
}
function baseClubName(label) {
  return label.replace(/\s+"[^"]+"$/, "");
}

function stripAccents(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function sigla(nome) {
  const stopWords = new Set(["de", "do", "da", "dos", "das", "e", "a"]);
  const tokens = nome.replace(/["]/g, "").split(" ").filter(Boolean);
  let i = 0;
  while (i < tokens.length - 1 && tokens[i] === tokens[i].toUpperCase() && tokens[i].length <= 5) i++;
  let rest = tokens.slice(i).filter((t) => !stopWords.has(t.toLowerCase()));
  if (rest.length === 0) rest = tokens;
  let s;
  if (rest.length === 1) {
    s = rest[0].slice(0, 3);
  } else {
    const initials = rest.slice(0, 3).map((w) => w[0]).join("");
    s = initials.length >= 3 ? initials : rest[0].slice(0, 3);
  }
  return stripAccents(s).toUpperCase();
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Sorteio por proximidade geográfica (capacidade fixa por série)
// ---------------------------------------------------------------------------
function haversine(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function farthestSeeds(points, k) {
  const seeds = [points[0]];
  while (seeds.length < k && seeds.length < points.length) {
    let best = null;
    let bestD = -1;
    points.forEach((p) => {
      const d = Math.min(...seeds.map((s) => haversine(p, s)));
      if (d > bestD) {
        bestD = d;
        best = p;
      }
    });
    seeds.push(best);
  }
  return seeds;
}
// teams: [{ id, lat, lon }] -> devolve array de k arrays de ids
function geoGroupIds(teams, k) {
  if (k <= 1 || teams.length <= k) return [teams.map((t) => t.id)];
  let centroids = farthestSeeds(teams, k).map((s) => ({ lat: s.lat, lon: s.lon }));
  const capacity = Math.ceil(teams.length / k);
  let groupsIdx = [];
  for (let iter = 0; iter < 4; iter++) {
    const pairs = [];
    teams.forEach((t, ti) => centroids.forEach((c, ci) => pairs.push({ ti, ci, d: haversine(t, c) })));
    pairs.sort((a, b) => a.d - b.d);
    const gi2 = Array.from({ length: k }, () => []);
    const taken = new Array(teams.length).fill(false);
    pairs.forEach(({ ti, ci }) => {
      if (taken[ti] || gi2[ci].length >= capacity) return;
      gi2[ci].push(ti);
      taken[ti] = true;
    });
    teams.forEach((t, ti) => {
      if (!taken[ti]) {
        const gi = gi2.findIndex((g) => g.length < capacity);
        gi2[gi].push(ti);
        taken[ti] = true;
      }
    });
    groupsIdx = gi2;
    centroids = gi2.map((idxs) => {
      const pts = idxs.map((i) => teams[i]);
      if (!pts.length) return { lat: 0, lon: 0 };
      return {
        lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
        lon: pts.reduce((s, p) => s + p.lon, 0) / pts.length,
      };
    });
  }
  return groupsIdx.map((idxs) => idxs.map((i) => teams[i].id));
}

// ---------------------------------------------------------------------------
// Calendário — round robin (ida e volta) + datas por escalão
// ---------------------------------------------------------------------------
function roundRobinDouble(ids) {
  const arr = [...ids];
  const bye = arr.length % 2 !== 0 ? "__BYE__" : null;
  if (bye) arr.push(bye);
  const n = arr.length;
  const rounds1 = [];
  let rot = [...arr];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const home = rot[i];
      const away = rot[n - 1 - i];
      if (home !== bye && away !== bye) {
        round.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
      }
    }
    rounds1.push(round);
    const fixed = rot[0];
    const rest = rot.slice(1);
    rest.unshift(rest.pop());
    rot = [fixed, ...rest];
  }
  const rounds2 = rounds1.map((round) => round.map((m) => ({ home: m.away, away: m.home })));
  return [...rounds1, ...rounds2];
}

function seasonAnchor(diaIdx) {
  const now = new Date();
  const anoInicio = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const sept1 = new Date(anoInicio, 8, 1);
  const d = new Date(sept1);
  while (d.getDay() !== diaIdx) d.setDate(d.getDate() + 1);
  return d;
}
function formatData(d) {
  return new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "2-digit", month: "2-digit" }).format(d);
}

// grupos: array de arrays de team objects (com .id)
// startDate: opcional — quando definido, a Jornada 1 começa nessa data (usado para
// encadear Fase 2 / Fase Honra logo a seguir à última jornada da Fase 1).
function buildCalendarioGrupos(compId, grupos, startDate, jornadaOffset = 0) {
  const comp = compById(compId);
  const anchor = startDate ? new Date(startDate) : seasonAnchor(comp.diaIdx);
  const seriesData = grupos.map((teamsArr, gi) => ({
    serieLabel: String.fromCharCode(65 + gi),
    rounds: roundRobinDouble(teamsArr.map((t) => t.id)),
    teamsById: Object.fromEntries(teamsArr.map((t) => [t.id, teamLabel(t)])),
  }));
  const maxRounds = Math.max(0, ...seriesData.map((s) => s.rounds.length));
  const jornadas = [];
  for (let j = 0; j < maxRounds; j++) {
    const data = new Date(anchor);
    data.setDate(data.getDate() + 7 * j);
    const jogosPorSerie = seriesData
      .filter((s) => s.rounds[j] && s.rounds[j].length)
      .map((s) => ({
        serie: s.serieLabel,
        jogos: s.rounds[j].map((m) => ({
          home: m.home,
          away: m.away,
          homeLabel: s.teamsById[m.home],
          awayLabel: s.teamsById[m.away],
        })),
      }));
    jornadas.push({ jornada: j + 1 + jornadaOffset, data, jogosPorSerie });
  }
  return { jornadas, comp };
}
function buildCalendarioLiga(compId, liga, startDate, jornadaOffset = 0) {
  const comp = compById(compId);
  const anchor = startDate ? new Date(startDate) : seasonAnchor(comp.diaIdx);
  const teamsById = Object.fromEntries(liga.map((t) => [t.id, teamLabel(t)]));
  const rounds = roundRobinDouble(liga.map((t) => t.id));
  const jornadas = rounds.map((round, j) => {
    const data = new Date(anchor);
    data.setDate(data.getDate() + 7 * j);
    return {
      jornada: j + 1 + jornadaOffset,
      data,
      jogosPorSerie: [
        {
          serie: null,
          jogos: round.map((m) => ({ home: m.home, away: m.away, homeLabel: teamsById[m.home], awayLabel: teamsById[m.away] })),
        },
      ],
    };
  });
  return { jornadas, comp };
}
// Devolve a data do primeiro slot livre (mesmo dia da semana) a seguir à última
// jornada de um calendário — usado para encadear a Fase 2 / Fase Honra.
function nextSlotAfter(calendario) {
  if (!calendario || calendario.jornadas.length === 0) return null;
  const last = calendario.jornadas[calendario.jornadas.length - 1].data;
  const d = new Date(last);
  d.setDate(d.getDate() + 7);
  return d;
}
function matchKey(jornada, home, away) {
  return `${jornada}|${home}|${away}`;
}
// Classificação a partir dos resultados introduzidos (só conta jogos com ambos os golos preenchidos)
function calcularClassificacao(jornadas, resultados, serieFiltro) {
  const tabela = {};
  const ensure = (id, label) => { if (!tabela[id]) tabela[id] = { id, label, pts: 0, j: 0, v: 0, e: 0, d: 0, gm: 0, gs: 0 }; };
  jornadas.forEach((jn) => {
    jn.jogosPorSerie.forEach((sp) => {
      if (serieFiltro !== undefined && sp.serie !== serieFiltro) return;
      sp.jogos.forEach((m) => {
        ensure(m.home, m.homeLabel);
        ensure(m.away, m.awayLabel);
        const r = resultados[matchKey(jn.jornada, m.home, m.away)];
        if (!r || r.h === "" || r.a === "" || r.h == null || r.a == null) return;
        const h = Number(r.h), a = Number(r.a);
        const home = tabela[m.home], away = tabela[m.away];
        home.j++; away.j++;
        home.gm += h; home.gs += a;
        away.gm += a; away.gs += h;
        if (h > a) { home.pts += 3; home.v++; away.d++; }
        else if (h < a) { away.pts += 3; away.v++; home.d++; }
        else { home.pts += 1; away.pts += 1; home.e++; away.e++; }
      });
    });
  });
  return Object.values(tabela).sort((a, b) => b.pts - a.pts || (b.gm - b.gs) - (a.gm - a.gs) || b.gm - a.gm);
}
// A partir da classificação da Fase 1 (por série), gera os grupos da Fase 2
// (os melhores classificados, todos juntos) e da Fase Honra (os restantes,
// redistribuídos por força relativa em N séries).
function gerarFasesSeguintes(fase1Grupos, fase1Calendario, resultados, avancamFase2, numSeriesHonra) {
  const teamById = {};
  fase1Grupos.forEach((g) => g.forEach((t) => { teamById[t.id] = t; }));
  const serieLabels = fase1Grupos.map((_, gi) => String.fromCharCode(65 + gi));
  const classificacoes = serieLabels.map((sl) => calcularClassificacao(fase1Calendario.jornadas, resultados, sl));
  const fase2Ids = classificacoes.flatMap((c) => c.slice(0, avancamFase2).map((r) => r.id));
  const fase2Grupos = [fase2Ids.map((id) => teamById[id]).filter(Boolean)];
  const honraRanked = classificacoes.flatMap((c) => c.slice(avancamFase2));
  honraRanked.sort((a, b) => b.pts - a.pts || (b.gm - b.gs) - (a.gm - a.gs));
  const honraGrupos = Array.from({ length: Math.max(1, numSeriesHonra) }, () => []);
  honraRanked.forEach((r, i) => honraGrupos[i % honraGrupos.length].push(teamById[r.id]));
  return { fase2Grupos, honraGrupos: honraGrupos.filter((g) => g.length) };
}



// Grupos de equipas do mesmo clube que partilham campo (desencontro obrigatório)
function autoDesencontroGroups(calendario) {
  const all = new Map();
  calendario.jornadas.forEach((j) => j.jogosPorSerie.forEach((sp) => sp.jogos.forEach((m) => {
    all.set(m.home, m.homeLabel);
    all.set(m.away, m.awayLabel);
  })));
  const byBase = {};
  all.forEach((label, id) => {
    const base = baseClubName(label);
    (byBase[base] = byBase[base] || []).push(id);
  });
  return Object.values(byBase).filter((g) => g.length > 1);
}
// Ajusta mando de campo para que, na mesma jornada, no máximo 1 equipa de cada
// grupo desencontrado jogue em casa.
function applyDesencontros(calendario, groups) {
  const ajustes = [];
  const jornadas = calendario.jornadas.map((j) => ({
    ...j,
    jogosPorSerie: j.jogosPorSerie.map((sp) => ({ ...sp, jogos: sp.jogos.map((m) => ({ ...m })) })),
  }));
  jornadas.forEach((j) => {
    const flat = [];
    j.jogosPorSerie.forEach((sp) => sp.jogos.forEach((m) => flat.push(m)));
    groups.forEach((g) => {
      const emCasa = flat.filter((m) => g.includes(m.home));
      emCasa.slice(1).forEach((m) => {
        const antes = `${m.homeLabel} — ${m.awayLabel}`;
        const h = m.home, hl = m.homeLabel;
        m.home = m.away; m.homeLabel = m.awayLabel;
        m.away = h; m.awayLabel = hl;
        m.ajustado = true;
        ajustes.push({ jornada: j.jornada, antes, depois: `${m.homeLabel} — ${m.awayLabel}` });
      });
    });
  });
  return { jornadas, ajustes };
}

// ---------------------------------------------------------------------------
// Estado inicial dos quadros — já nascem divididos pelas séries reais
// ---------------------------------------------------------------------------
function initialDraws(teamsLabeled) {
  const draws = {};
  COMPETICOES.forEach((comp) => {
    const compTeams = teamsLabeled.filter((t) => t.competicaoId === comp.id);
    if (comp.hasSeries) {
      const bySerie = {};
      compTeams.forEach((t) => {
        const s = t.serie || "A";
        (bySerie[s] = bySerie[s] || []).push(t);
      });
      const grupos = Object.keys(bySerie).sort().map((k) => bySerie[k]);
      draws[comp.id] = { modo: "grupos", grupos, calendario: buildCalendarioGrupos(comp.id, grupos) };
    } else {
      draws[comp.id] = { modo: "liga", liga: compTeams, calendario: buildCalendarioLiga(comp.id, compTeams) };
    }
  });
  return draws;
}

// ---------------------------------------------------------------------------
// UI atoms
// ---------------------------------------------------------------------------
function TipoBadge({ tipo }) {
  const isSen = tipo === "Seniores";
  return (
    <span
      className="pf-body inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: isSen ? T.green : T.gold, backgroundColor: isSen ? T.greenSoft : T.goldSoft }}
    >
      {tipo}
    </span>
  );
}
function Avatar({ nome }) {
  return (
    <div
      className="pf-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: T.panel, color: T.text }}
    >
      {sigla(nome)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 — Inscrição
// ---------------------------------------------------------------------------
function InscricaoTab({ teamsLabeled, onRegister, onAddClube, clubesVersion }) {
  const [clubeNovo, setClubeNovo] = useState(false);
  const [clubeId, setClubeId] = useState("");
  const [nomeNovoClube, setNomeNovoClube] = useState("");
  const [concelhoNovo, setConcelhoNovo] = useState("");
  const [selecionadas, setSelecionadas] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const toggle = (compId) => setSelecionadas((s) => (s.includes(compId) ? s.filter((x) => x !== compId) : [...s, compId]));

  const submit = () => {
    if (selecionadas.length === 0) return;
    let idFinal = clubeId;
    let nomeFinal;
    if (clubeNovo) {
      if (!nomeNovoClube.trim()) return;
      idFinal = onAddClube(nomeNovoClube, concelhoNovo || null);
      nomeFinal = nomeNovoClube.trim();
    } else {
      if (!clubeId) return;
      nomeFinal = clubeById(clubeId).nome;
    }
    onRegister(idFinal, selecionadas);
    setConfirm(`${nomeFinal} inscrito em ${selecionadas.length} prova${selecionadas.length > 1 ? "s" : ""}.`);
    setSelecionadas([]);
    setNomeNovoClube("");
    setConcelhoNovo("");
    setClubeNovo(false);
    setClubeId("");
    setTimeout(() => setConfirm(null), 3000);
  };
  const podeSubmeter = selecionadas.length > 0 && (clubeNovo ? nomeNovoClube.trim().length > 0 : !!clubeId);
  const countFor = (compId) => teamsLabeled.filter((t) => t.competicaoId === compId).length;
  const grupos = [
    { tipo: "Seniores", lista: COMPETICOES.filter((c) => c.tipo === "Seniores") },
    { tipo: "Formação", lista: COMPETICOES.filter((c) => c.tipo === "Formação") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="pf-card rounded-lg border p-5" style={{ borderColor: T.line, backgroundColor: T.surface }}>
        <h2 className="pf-display text-lg font-semibold" style={{ color: T.text }}>Inscrever equipas</h2>
        <p className="pf-body mt-1 text-sm" style={{ color: T.text3 }}>
          Escolha o clube e selecione as provas. Se o clube já tiver equipa numa prova, a nova entra automaticamente como "B" (ou "C").
        </p>

        <div className="mt-5 flex items-center justify-between">
          <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Clube</label>
          <button
            onClick={() => { setClubeNovo((v) => !v); setClubeId(""); setNomeNovoClube(""); }}
            className="pf-body pf-focus flex items-center gap-1 text-xs font-semibold"
            style={{ color: T.gold }}
          >
            {clubeNovo ? <X size={12} /> : <Plus size={12} />} {clubeNovo ? "Escolher da lista" : "Clube novo"}
          </button>
        </div>
        {!clubeNovo ? (
          <select
            value={clubeId}
            onChange={(e) => setClubeId(e.target.value)}
            className="pf-body pf-focus mt-1.5 w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}
          >
            <option value="">Selecionar clube…</option>
            {CLUBES.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        ) : (
          <div className="mt-1.5 space-y-2">
            <input
              value={nomeNovoClube}
              onChange={(e) => setNomeNovoClube(e.target.value)}
              placeholder="Nome do clube (ex.: GD Novo Clube)"
              className="pf-body pf-focus w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}
            />
            <select
              value={concelhoNovo}
              onChange={(e) => setConcelhoNovo(e.target.value)}
              className="pf-body pf-focus w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}
            >
              <option value="">Concelho (opcional, ajuda no sorteio por proximidade)…</option>
              {Object.entries(CONCELHOS).map(([id, c]) => <option key={id} value={id}>{c.nome}</option>)}
            </select>
          </div>
        )}

        <p className="pf-body mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Provas selecionadas</p>
        <div className="mt-1.5 min-h-[28px]">
          {selecionadas.length === 0 ? (
            <p className="pf-body text-sm" style={{ color: T.text3 }}>Nenhuma prova selecionada.</p>
          ) : (
            <ul className="pf-body space-y-1 text-sm" style={{ color: T.text }}>
              {selecionadas.map((id) => (
                <li key={id} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} style={{ color: T.green }} />
                  {compById(id).nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={submit}
          disabled={!podeSubmeter}
          className="pf-body pf-focus mt-5 w-full rounded-md py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: T.green, color: "#08150F" }}
        >
          Confirmar inscrição
        </button>

        {confirm && (
          <div className="pf-body mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: T.greenSoft, color: T.green }}>
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {confirm}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {grupos.map((g) => (
          <div key={g.tipo}>
            <h3 className="pf-display text-sm font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>{g.tipo}</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {g.lista.map((comp) => {
                const active = selecionadas.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    onClick={() => toggle(comp.id)}
                    className="pf-card pf-focus flex overflow-hidden rounded-lg border text-left"
                    style={{ borderColor: active ? T.green : T.line, backgroundColor: T.surface, boxShadow: active ? `0 0 0 1px ${T.green}` : "none" }}
                  >
                    <div className="flex-1 p-4">
                      <p className="pf-body text-xs font-semibold uppercase tracking-wide" style={{ color: T.text3 }}>{comp.escalao}</p>
                      <p className="pf-display mt-0.5 text-base font-semibold leading-snug" style={{ color: T.text }}>{comp.nome}</p>
                    </div>
                    <div className="flex w-20 shrink-0 flex-col items-center justify-center border-l border-dashed" style={{ borderColor: T.line, backgroundColor: active ? T.greenSoft : T.surface2 }}>
                      <span className="pf-mono text-xl font-semibold" style={{ color: T.text }}>{countFor(comp.id)}</span>
                      <span className="pf-body text-[10px] uppercase tracking-wide" style={{ color: T.text3 }}>equipas</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 — Equipas inscritas
// ---------------------------------------------------------------------------
function EquipasTab({ teamsLabeled, onRemoveEquipa }) {
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroComp, setFiltroComp] = useState("Todas");
  const filtradas = teamsLabeled.filter((t) => {
    const comp = compById(t.competicaoId);
    if (filtroTipo !== "Todos" && comp.tipo !== filtroTipo) return false;
    if (filtroComp !== "Todas" && comp.id !== filtroComp) return false;
    return true;
  });
  const compOpcoes = COMPETICOES.filter((c) => filtroTipo === "Todos" || c.tipo === filtroTipo);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 pf-body text-sm font-semibold" style={{ color: T.text2 }}><Filter size={15} /> Filtrar</div>
        <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setFiltroComp("Todas"); }} className="pf-body pf-focus rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
          <option>Todos</option><option>Seniores</option><option>Formação</option>
        </select>
        <select value={filtroComp} onChange={(e) => setFiltroComp(e.target.value)} className="pf-body pf-focus rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
          <option value="Todas">Todas as provas</option>
          {compOpcoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <span className="pf-mono ml-auto text-sm" style={{ color: T.text3 }}>{filtradas.length} equipa{filtradas.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: T.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="pf-body" style={{ backgroundColor: T.surface2, color: T.text2 }}>
              <th className="px-4 py-2.5 font-semibold">Clube</th>
              <th className="px-4 py-2.5 font-semibold">Concelho</th>
              <th className="px-4 py-2.5 font-semibold">Prova</th>
              <th className="px-4 py-2.5 font-semibold">Série</th>
              <th className="px-4 py-2.5 font-semibold">Tipo</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="pf-body">
            {filtradas.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: T.text3 }}>Sem equipas inscritas para este filtro.</td></tr>
            )}
            {filtradas.map((t, i) => {
              const clube = clubeById(t.clubeId);
              const comp = compById(t.competicaoId);
              return (
                <tr key={t.id} style={{ borderTop: `1px solid ${T.lineSoft}`, backgroundColor: i % 2 ? T.surface : "transparent" }}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar nome={clube.nome} />
                      <span style={{ color: T.text }}>
                        {clube.nome}
                        {t.equipa && <span className="pf-mono ml-1.5 text-xs" style={{ color: T.text3 }}>"{t.equipa}"</span>}
                      </span>
                    </div>
                  </td>
                  <td className="pf-mono px-4 py-2.5" style={{ color: T.text3 }}>{CONCELHOS[clube.concelhoId]?.nome}</td>
                  <td className="px-4 py-2.5" style={{ color: T.text }}>{comp.nome}</td>
                  <td className="pf-mono px-4 py-2.5" style={{ color: T.text2 }}>{t.serie ?? "—"}</td>
                  <td className="px-4 py-2.5"><TipoBadge tipo={comp.tipo} /></td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: T.green, backgroundColor: T.greenSoft }}>
                      <CheckCircle2 size={12} /> {t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => { if (window.confirm(`Retirar ${teamLabel(t)} de ${comp.nome}?`)) onRemoveEquipa(t.id); }}
                      className="pf-focus rounded-md p-1.5"
                      style={{ color: T.danger }}
                      title="Retirar da competição"
                    >
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 — Quadros competitivos
// ---------------------------------------------------------------------------
function buildBracket(teamObjs) {
  const shuffled = shuffle(teamObjs);
  const rounds = [];
  const first = [];
  for (let i = 0; i < shuffled.length; i += 2) first.push({ a: shuffled[i], b: shuffled[i + 1] ?? null });
  rounds.push(first);
  let count = first.length, r = 1;
  while (count > 1) {
    const nextCount = Math.ceil(count / 2);
    const next = [];
    for (let i = 0; i < nextCount; i++) next.push({ a: `Vencedor J${r}.${2 * i + 1}`, b: 2 * i + 2 <= count ? `Vencedor J${r}.${2 * i + 2}` : null });
    rounds.push(next);
    count = nextCount; r++;
  }
  return rounds;
}
function roundLabel(index, total) {
  const fromEnd = total - index;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Meias-finais";
  if (fromEnd === 3) return "Quartos-de-final";
  return `Ronda ${index + 1}`;
}

function QuadrosTab({ teamsLabeled, draws, onUpdateDraw, onRemoveEquipa, resultados }) {
  const comps = COMPETICOES;
  const [compId, setCompId] = useState(comps[0].id);
  const comp = compById(compId);
  const draw = draws[compId];
  const [numGrupos, setNumGrupos] = useState(comp.numSeries || 2);
  const [addAlvo, setAddAlvo] = useState({}); // { [compId]: teamId escolhido no seletor de "adicionar equipa" }

  useEffect(() => {
    const c = compById(compId);
    setNumGrupos((draws[compId]?.grupos?.length) || c.numSeries || 2);
  }, [compId]); // eslint-disable-line

  const equipasDaComp = useMemo(
    () => teamsLabeled.filter((t) => t.competicaoId === compId).map((t) => ({ id: t.id, label: teamLabel(t), ...concelhoDoClube(clubeById(t.clubeId)) })),
    [teamsLabeled, compId]
  );
  const byId = useMemo(() => Object.fromEntries(equipasDaComp.map((t) => [t.id, t])), [equipasDaComp]);

  // equipas já inscritas nesta prova mas ainda não colocadas em nenhuma série/liga do quadro atual
  const colocadasIds = useMemo(() => {
    if (!draw) return new Set();
    if (draw.modo === "grupos") return new Set(draw.grupos.flatMap((g) => g.map((t) => t.id)));
    if (draw.modo === "liga") return new Set(draw.liga.map((t) => t.id));
    return new Set();
  }, [draw]);
  const naoColocadas = equipasDaComp.filter((t) => !colocadasIds.has(t.id));

  const [modo, setModo] = useState(draw?.modo || (comp.hasSeries ? "grupos" : "liga"));
  useEffect(() => setModo(draws[compId]?.modo || (compById(compId).hasSeries ? "grupos" : "liga")), [compId]); // eslint-disable-line

  const gerar = () => {
    if (modo === "grupos") {
      const idGroups = geoGroupIds(equipasDaComp, Math.min(numGrupos, Math.max(1, equipasDaComp.length)));
      const grupos = idGroups.map((ids) => ids.map((id) => byId[id]));
      onUpdateDraw(compId, { modo: "grupos", grupos, calendario: buildCalendarioGrupos(compId, grupos.map((g) => g.map((t) => ({ id: t.id, clubeId: teamsLabeled.find((x) => x.id === t.id).clubeId, equipa: teamsLabeled.find((x) => x.id === t.id).equipa })))) });
    } else if (modo === "eliminatoria") {
      onUpdateDraw(compId, { modo: "eliminatoria", bracket: buildBracket(equipasDaComp.map((t) => t.label)) });
    } else {
      const liga = shuffle(equipasDaComp).map((t) => t.id);
      const ligaTeams = liga.map((id) => teamsLabeled.find((x) => x.id === id));
      onUpdateDraw(compId, { modo: "liga", liga: ligaTeams, calendario: buildCalendarioLiga(compId, ligaTeams) });
    }
  };

  // ---- Fase 2 / Fase Honra ------------------------------------------------
  const [avancamFase2, setAvancamFase2] = useState(comp.avancamFase2Default || 2);
  const [numSeriesHonra, setNumSeriesHonra] = useState(comp.numSeries || 2);
  useEffect(() => {
    const c = compById(compId);
    setAvancamFase2(c.avancamFase2Default || 2);
    setNumSeriesHonra(draws[compId]?.grupos?.length || c.numSeries || 2);
  }, [compId]); // eslint-disable-line

  const gerarFases = () => {
    if (!draw || draw.modo !== "grupos") return;
    const resultadosF1 = resultados[compId]?.f1 || {};
    const { fase2Grupos, honraGrupos } = gerarFasesSeguintes(draw.grupos, draw.calendario, resultadosF1, avancamFase2, numSeriesHonra);
    const startDate = nextSlotAfter(draw.calendario);
    const fase2Calendario = buildCalendarioGrupos(compId, fase2Grupos.map((g) => g.map((t) => ({ id: t.id, clubeId: t.clubeId, equipa: t.equipa }))), startDate);
    const honraCalendario = buildCalendarioGrupos(compId, honraGrupos.map((g) => g.map((t) => ({ id: t.id, clubeId: t.clubeId, equipa: t.equipa }))), startDate);
    onUpdateDraw(compId, {
      ...draw,
      fases: { avancamFase2, numSeriesHonra, fase2: { grupos: fase2Grupos, calendario: fase2Calendario }, honra: { grupos: honraGrupos, calendario: honraCalendario } },
    });
  };

  const moverEquipa = (teamId, deGrupo, paraGrupo) => {
    if (deGrupo === paraGrupo) return;
    const novoGrupos = draw.grupos.map((g) => [...g]);
    const team = novoGrupos[deGrupo].find((t) => t.id === teamId);
    novoGrupos[deGrupo] = novoGrupos[deGrupo].filter((t) => t.id !== teamId);
    novoGrupos[paraGrupo] = [...novoGrupos[paraGrupo], team];
    onUpdateDraw(compId, {
      ...draw,
      grupos: novoGrupos,
      calendario: buildCalendarioGrupos(compId, novoGrupos.map((g) => g.map((t) => ({ id: t.id, clubeId: teamsLabeled.find((x) => x.id === t.id).clubeId, equipa: teamsLabeled.find((x) => x.id === t.id).equipa })))),
    });
  };

  const retirarDoQuadro = (teamId, gi) => {
    if (draw.modo === "grupos") {
      const novoGrupos = draw.grupos.map((g) => [...g]);
      novoGrupos[gi] = novoGrupos[gi].filter((t) => t.id !== teamId);
      onUpdateDraw(compId, {
        ...draw,
        grupos: novoGrupos,
        calendario: buildCalendarioGrupos(compId, novoGrupos.map((g) => g.map((t) => ({ id: t.id, clubeId: teamsLabeled.find((x) => x.id === t.id).clubeId, equipa: teamsLabeled.find((x) => x.id === t.id).equipa })))),
      });
    } else if (draw.modo === "liga") {
      const liga = draw.liga.filter((t) => t.id !== teamId);
      onUpdateDraw(compId, { modo: "liga", liga, calendario: buildCalendarioLiga(compId, liga) });
    }
  };

  const adicionarAoQuadro = (teamId, gi) => {
    const teamFull = teamsLabeled.find((t) => t.id === teamId);
    if (!teamFull) return;
    if (draw.modo === "grupos") {
      const novoGrupos = draw.grupos.map((g) => [...g]);
      novoGrupos[gi] = [...novoGrupos[gi], teamFull];
      onUpdateDraw(compId, {
        ...draw,
        grupos: novoGrupos,
        calendario: buildCalendarioGrupos(compId, novoGrupos.map((g) => g.map((t) => ({ id: t.id, clubeId: teamsLabeled.find((x) => x.id === t.id).clubeId, equipa: teamsLabeled.find((x) => x.id === t.id).equipa })))),
      });
    } else if (draw.modo === "liga") {
      const liga = [...draw.liga, teamFull];
      onUpdateDraw(compId, { modo: "liga", liga, calendario: buildCalendarioLiga(compId, liga) });
    }
    setAddAlvo((prev) => ({ ...prev, [compId]: "" }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Prova</label>
          <select value={compId} onChange={(e) => setCompId(e.target.value)} className="pf-body pf-focus mt-1 rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
            {comps.map((c) => <option key={c.id} value={c.id}>{c.nome} · {teamsLabeled.filter((t) => t.competicaoId === c.id).length} equipas</option>)}
          </select>
        </div>
        <div>
          <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Formato</label>
          <div className="mt-1 flex overflow-hidden rounded-md border" style={{ borderColor: T.line }}>
            {[
              { id: "grupos", label: "Séries (proximidade)", icon: Rows3 },
              { id: "liga", label: "Liga única", icon: ListOrdered },
              { id: "eliminatoria", label: "Eliminatória direta", icon: Swords },
            ].map((m, i) => (
              <button key={m.id} onClick={() => setModo(m.id)} className="pf-body flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium" style={{ borderLeft: i ? `1px solid ${T.line}` : "none", backgroundColor: modo === m.id ? T.green : T.surface, color: modo === m.id ? "#08150F" : T.text2 }}>
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </div>
        </div>
        {modo === "grupos" && (
          <div>
            <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Nº de séries</label>
            <select value={numGrupos} onChange={(e) => setNumGrupos(Number(e.target.value))} className="pf-body pf-focus mt-1 rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} série{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        )}
        <button onClick={gerar} disabled={equipasDaComp.length < 2} className="pf-body pf-focus flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: T.gold, color: "#241A05" }}>
          <Shuffle size={15} /> {modo === "grupos" ? "Sortear por proximidade" : "Gerar sorteio"}
        </button>
      </div>

      {modo === "grupos" && (
        <p className="pf-body mt-3 flex items-center gap-1.5 text-xs" style={{ color: T.text3 }}>
          <MapPin size={13} /> As séries já refletem a divisão oficial da AF Beja; ao sortear de novo, os clubes são agrupados por proximidade geográfica (concelho), com ajuste manual disponível por equipa.
        </p>
      )}

      {equipasDaComp.length < 2 && <p className="pf-body mt-4 text-sm" style={{ color: T.text3 }}>São necessárias pelo menos 2 equipas inscritas nesta prova.</p>}

      {draw?.modo === "grupos" && draw.grupos && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {draw.grupos.map((lista, gi) => (
            <div key={gi} className="rounded-lg border" style={{ borderColor: T.line, backgroundColor: T.surface }}>
              <div className="pf-display rounded-t-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.panel, color: T.text }}>Série {String.fromCharCode(65 + gi)}</div>
              <ul className="pf-body divide-y" style={{ borderColor: T.lineSoft }}>
                {lista.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm" style={{ color: T.text, borderColor: T.lineSoft }}>
                    <span>{teamLabel(teamsLabeled.find((x) => x.id === t.id))}</span>
                    <span className="flex items-center gap-1">
                      <select value={gi} onChange={(e) => moverEquipa(t.id, gi, Number(e.target.value))} className="pf-mono pf-focus rounded border px-1.5 py-0.5 text-xs" style={{ borderColor: T.line, color: T.text3, backgroundColor: T.surface2 }}>
                        {draw.grupos.map((_, oi) => <option key={oi} value={oi}>{String.fromCharCode(65 + oi)}</option>)}
                      </select>
                      <button onClick={() => retirarDoQuadro(t.id, gi)} className="pf-focus rounded p-1" style={{ color: T.danger }} title="Retirar do quadro">
                        <X size={13} />
                      </button>
                    </span>
                  </li>
                ))}
                {lista.length === 0 && <li className="px-4 py-3 text-sm italic" style={{ color: T.text3 }}>Sem equipas</li>}
              </ul>
              {naoColocadas.length > 0 && (
                <div className="border-t p-2" style={{ borderColor: T.lineSoft }}>
                  <select
                    value=""
                    onChange={(e) => e.target.value && adicionarAoQuadro(e.target.value, gi)}
                    className="pf-body pf-focus w-full rounded-md border px-2 py-1.5 text-xs"
                    style={{ borderColor: T.line, color: T.text2, backgroundColor: T.surface2 }}
                  >
                    <option value="">+ Adicionar equipa a esta série…</option>
                    {naoColocadas.map((t) => <option key={t.id} value={t.id}>{teamLabel(teamsLabeled.find((x) => x.id === t.id))}</option>)}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {comp.hasFases && draw?.modo === "grupos" && draw.grupos && (
        <div className="mt-6 rounded-lg border p-4" style={{ borderColor: T.line, backgroundColor: T.surface }}>
          <h3 className="pf-display flex items-center gap-1.5 text-sm font-semibold" style={{ color: T.text }}>Fase 2 / Fase Honra</h3>
          <p className="pf-body mt-1 text-xs" style={{ color: T.text3 }}>
            A partir da classificação da Fase 1 (com os resultados já introduzidos no separador Calendário). Números por defeito — ajuste conforme o regulamento da prova.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Sobem à Fase 2 (por série)</label>
              <input type="number" min={1} max={6} value={avancamFase2} onChange={(e) => setAvancamFase2(Number(e.target.value))} className="pf-body pf-focus mt-1 w-24 rounded-md border px-2 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }} />
            </div>
            <div>
              <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Nº séries na Fase Honra</label>
              <input type="number" min={1} max={6} value={numSeriesHonra} onChange={(e) => setNumSeriesHonra(Number(e.target.value))} className="pf-body pf-focus mt-1 w-24 rounded-md border px-2 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }} />
            </div>
            <button onClick={gerarFases} className="pf-body pf-focus flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.gold, color: "#241A05" }}>
              <Shuffle size={15} /> {draw.fases ? "Gerar de novo" : "Gerar Fase 2 e Fase Honra"}
            </button>
          </div>

          {draw.fases && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border" style={{ borderColor: T.line, backgroundColor: T.bg }}>
                <div className="pf-display rounded-t-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.greenSoft, color: T.green }}>Fase 2</div>
                <ul className="pf-body divide-y text-sm" style={{ borderColor: T.lineSoft, color: T.text }}>
                  {draw.fases.fase2.grupos[0]?.map((t) => <li key={t.id} className="px-4 py-2">{teamLabel(t)}</li>)}
                </ul>
              </div>
              {draw.fases.honra.grupos.map((g, gi) => (
                <div key={gi} className="rounded-lg border" style={{ borderColor: T.line, backgroundColor: T.bg }}>
                  <div className="pf-display rounded-t-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.goldSoft, color: T.gold }}>Fase Honra {String.fromCharCode(65 + gi)}</div>
                  <ul className="pf-body divide-y text-sm" style={{ borderColor: T.lineSoft, color: T.text }}>
                    {g.map((t) => <li key={t.id} className="px-4 py-2">{teamLabel(t)}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {draw?.modo === "liga" && draw.liga && (
        <div className="mt-6 max-w-md overflow-hidden rounded-lg border" style={{ borderColor: T.line }}>
          <div className="pf-display px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: T.panel, color: T.text }}>Liga Única · {comp.nome}</div>
          <table className="w-full text-left text-sm">
            <thead><tr className="pf-body" style={{ backgroundColor: T.surface2, color: T.text2 }}><th className="w-16 px-4 py-2 font-semibold">Posição</th><th className="px-4 py-2 font-semibold">Clube</th><th className="px-2 py-2"></th></tr></thead>
            <tbody className="pf-body">
              {draw.liga.map((t, i) => (
                <tr key={t.id} style={{ borderTop: `1px solid ${T.lineSoft}`, backgroundColor: i % 2 ? T.surface : "transparent" }}>
                  <td className="pf-mono px-4 py-2" style={{ color: T.text3 }}>{i + 1}</td>
                  <td className="px-4 py-2" style={{ color: T.text }}>{teamLabel(t)}</td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => retirarDoQuadro(t.id, 0)} className="pf-focus rounded p-1" style={{ color: T.danger }} title="Retirar do quadro">
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {naoColocadas.length > 0 && (
            <div className="border-t p-2" style={{ borderColor: T.lineSoft }}>
              <select
                value=""
                onChange={(e) => e.target.value && adicionarAoQuadro(e.target.value, 0)}
                className="pf-body pf-focus w-full rounded-md border px-2 py-1.5 text-xs"
                style={{ borderColor: T.line, color: T.text2, backgroundColor: T.surface2 }}
              >
                <option value="">+ Adicionar equipa à liga…</option>
                {naoColocadas.map((t) => <option key={t.id} value={t.id}>{teamLabel(teamsLabeled.find((x) => x.id === t.id))}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {draw?.modo === "eliminatoria" && draw.bracket && (
        <div className="mt-6 flex gap-6 overflow-x-auto pb-2">
          {draw.bracket.map((ronda, ri) => (
            <div key={ri} className="flex min-w-[220px] flex-1 flex-col justify-around gap-4">
              <p className="pf-display text-center text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>{roundLabel(ri, draw.bracket.length)}</p>
              {ronda.map((jogo, ji) => (
                <div key={ji} className="rounded-lg border" style={{ borderColor: T.line, backgroundColor: T.surface }}>
                  <div className="pf-body flex items-center justify-between border-b px-3 py-2 text-sm" style={{ borderColor: T.lineSoft, color: T.text }}>
                    <span>{jogo.a}</span><span className="pf-mono text-xs" style={{ color: T.text3 }}>J{ri + 1}.{ji + 1}</span>
                  </div>
                  <div className="pf-body px-3 py-2 text-sm" style={{ color: jogo.b ? T.text : T.text3 }}>{jogo.b ?? "Isento (bye)"}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4 — Calendário
// ---------------------------------------------------------------------------
function CalendarioTab({ teamsLabeled, draws, resultados, onSetResultado }) {
  const compsComCalendario = COMPETICOES.filter((c) => draws[c.id]?.calendario);
  const [compId, setCompId] = useState(compsComCalendario[0]?.id ?? "");
  const [fase, setFase] = useState("f1");
  const [customGroups, setCustomGroups] = useState({});
  const [novoA, setNovoA] = useState("");
  const [novoB, setNovoB] = useState("");

  const comp = compById(compId);
  const draw = draws[compId];
  useEffect(() => setFase("f1"), [compId]);
  const calendario = fase === "f1" ? draw?.calendario : fase === "f2" ? draw?.fases?.fase2?.calendario : draw?.fases?.honra?.calendario;
  const resultadosFase = resultados[compId]?.[fase] || {};

  const equipasDaComp = useMemo(() => {
    if (!calendario) return [];
    const ids = new Set();
    calendario.jornadas.forEach((j) => j.jogosPorSerie.forEach((sp) => sp.jogos.forEach((m) => { ids.add(m.home); ids.add(m.away); })));
    return teamsLabeled.filter((t) => ids.has(t.id));
  }, [calendario, teamsLabeled]);

  const autoGroups = useMemo(() => (calendario ? autoDesencontroGroups(calendario) : []), [calendario]);
  const custom = customGroups[compId + fase] || [];
  const { jornadas, ajustes } = useMemo(() => {
    if (!calendario) return { jornadas: [], ajustes: [] };
    return applyDesencontros(calendario, [...autoGroups, ...custom]);
  }, [calendario, autoGroups, custom]);

  const classificacoesPorSerie = useMemo(() => {
    if (!calendario) return [];
    const series = [...new Set(calendario.jornadas.flatMap((j) => j.jogosPorSerie.map((sp) => sp.serie)))];
    return series.map((s) => ({ serie: s, tabela: calcularClassificacao(calendario.jornadas, resultadosFase, s) }));
  }, [calendario, resultadosFase]);

  const addCustomPair = () => {
    if (!novoA || !novoB || novoA === novoB) return;
    setCustomGroups((prev) => ({ ...prev, [compId + fase]: [...(prev[compId + fase] || []), [novoA, novoB]] }));
    setNovoA(""); setNovoB("");
  };
  const removeCustomGroup = (idx) => {
    setCustomGroups((prev) => ({ ...prev, [compId + fase]: (prev[compId + fase] || []).filter((_, i) => i !== idx) }));
  };
  const teamLabelById = (id) => teamLabel(teamsLabeled.find((t) => t.id === id));

  if (compsComCalendario.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center" style={{ borderColor: T.line }}>
        <CalendarDays size={28} className="mx-auto" style={{ color: T.text3 }} />
        <p className="pf-body mt-3 text-sm" style={{ color: T.text3 }}>Gere um quadro (séries ou liga única) para que o calendário seja criado automaticamente.</p>
      </div>
    );
  }

  const temFases = !!draw?.fases;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="pf-body block text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Prova</label>
            <select value={compId} onChange={(e) => setCompId(e.target.value)} className="pf-body pf-focus mt-1 rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
              {compsComCalendario.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          {temFases && (
            <div className="flex overflow-hidden rounded-md border" style={{ borderColor: T.line }}>
              {[{ id: "f1", label: "Fase 1" }, { id: "f2", label: "Fase 2" }, { id: "honra", label: "Fase Honra" }].map((f, i) => (
                <button key={f.id} onClick={() => setFase(f.id)} className="pf-body px-3 py-1.5 text-sm font-medium" style={{ borderLeft: i ? `1px solid ${T.line}` : "none", backgroundColor: fase === f.id ? T.green : T.surface, color: fase === f.id ? "#08150F" : T.text2 }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {comp && (
          <div className="pf-body flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm" style={{ backgroundColor: T.surface2, color: T.text2 }}>
            <CalendarDays size={14} /> {comp.diaIdx === 6 ? "Sábados" : "Domingos"} · {comp.hora}
          </div>
        )}
      </div>

      {!calendario || jornadas.length === 0 ? (
        <p className="pf-body mt-4 text-sm" style={{ color: T.text3 }}>
          {fase !== "f1" ? "Ainda não foi gerada esta fase — faça-o em Quadros competitivos." : "Este formato (eliminatória direta) não gera calendário de jornadas."}
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {jornadas.map((j) => (
              <div key={j.jornada} className="rounded-lg border" style={{ borderColor: T.line, backgroundColor: T.surface }}>
                <div className="pf-display flex items-center justify-between px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.panel, color: T.text }}>
                  <span>Jornada {j.jornada}</span>
                  <span className="pf-mono text-xs font-normal" style={{ color: T.text2 }}>{formatData(j.data)}</span>
                </div>
                <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ backgroundColor: T.lineSoft }}>
                  {j.jogosPorSerie.map((sp) => (
                    <div key={sp.serie ?? "u"} style={{ backgroundColor: T.surface }}>
                      {sp.serie && <p className="pf-body px-3 pt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: T.text3 }}>Série {sp.serie}</p>}
                      <ul className="pf-body px-3 pb-2 text-sm" style={{ color: T.text }}>
                        {sp.jogos.map((m, mi) => {
                          const key = matchKey(j.jornada, m.home, m.away);
                          const r = resultadosFase[key] || {};
                          return (
                            <li key={mi} className="flex items-center justify-between gap-2 py-1">
                              <span className="truncate">{m.homeLabel} <span style={{ color: T.text3 }}>–</span> {m.awayLabel}</span>
                              <span className="flex shrink-0 items-center gap-1">
                                <input
                                  type="number" min={0} value={r.h ?? ""} placeholder="-"
                                  onChange={(e) => onSetResultado(compId, fase, key, e.target.value === "" ? null : e.target.value, r.a ?? null)}
                                  className="pf-mono pf-focus w-9 rounded border px-1 py-0.5 text-center text-xs"
                                  style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}
                                />
                                <span style={{ color: T.text3 }}>-</span>
                                <input
                                  type="number" min={0} value={r.a ?? ""} placeholder="-"
                                  onChange={(e) => onSetResultado(compId, fase, key, r.h ?? null, e.target.value === "" ? null : e.target.value)}
                                  className="pf-mono pf-focus w-9 rounded border px-1 py-0.5 text-center text-xs"
                                  style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}
                                />
                                {m.ajustado && <ArrowLeftRight size={12} style={{ color: T.gold }} title="Ajustado por desencontro" />}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {classificacoesPorSerie.map(({ serie, tabela }) => (
              <div key={serie ?? "u"} className="rounded-lg border p-4" style={{ borderColor: T.line, backgroundColor: T.surface }}>
                <h3 className="pf-body text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Classificação{serie ? ` · Série ${serie}` : ""}</h3>
                <table className="pf-body mt-2 w-full text-left text-xs">
                  <thead><tr style={{ color: T.text3 }}><th className="py-1">Clube</th><th className="py-1 text-center">J</th><th className="py-1 text-center">Pts</th></tr></thead>
                  <tbody>
                    {tabela.map((r, i) => (
                      <tr key={r.id} style={{ borderTop: `1px solid ${T.lineSoft}`, color: T.text }}>
                        <td className="py-1">{i + 1}. {r.label}</td>
                        <td className="py-1 text-center">{r.j}</td>
                        <td className="pf-mono py-1 text-center font-semibold">{r.pts}</td>
                      </tr>
                    ))}
                    {tabela.length === 0 && <tr><td colSpan={3} className="py-1 italic" style={{ color: T.text3 }}>Sem equipas.</td></tr>}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="rounded-lg border p-4" style={{ borderColor: T.line, backgroundColor: T.surface }}>
              <h3 className="pf-display flex items-center gap-1.5 text-sm font-semibold" style={{ color: T.text }}><ArrowLeftRight size={15} /> Desencontros</h3>
              <p className="pf-body mt-1 text-xs" style={{ color: T.text3 }}>Equipas do mesmo clube (mesmo campo) nunca jogam em casa na mesma jornada.</p>

              {autoGroups.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {autoGroups.map((g, i) => (
                    <div key={i} className="pf-body flex flex-wrap gap-1 text-xs">
                      {g.map((id) => <span key={id} className="rounded-full px-2 py-0.5" style={{ backgroundColor: T.greenSoft, color: T.green }}>{teamLabelById(id)}</span>)}
                    </div>
                  ))}
                </div>
              )}

              {custom.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {custom.map((g, i) => (
                    <div key={i} className="pf-body flex items-center justify-between gap-1 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {g.map((id) => <span key={id} className="rounded-full px-2 py-0.5" style={{ backgroundColor: T.goldSoft, color: T.gold }}>{teamLabelById(id)}</span>)}
                      </div>
                      <button onClick={() => removeCustomGroup(i)} className="pf-focus" style={{ color: T.text3 }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: T.lineSoft }}>
                <p className="pf-body text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Adicionar par manual</p>
                <select value={novoA} onChange={(e) => setNovoA(e.target.value)} className="pf-body pf-focus w-full rounded-md border px-2 py-1.5 text-xs" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
                  <option value="">Equipa 1…</option>
                  {equipasDaComp.map((t) => <option key={t.id} value={t.id}>{teamLabel(t)}</option>)}
                </select>
                <select value={novoB} onChange={(e) => setNovoB(e.target.value)} className="pf-body pf-focus w-full rounded-md border px-2 py-1.5 text-xs" style={{ borderColor: T.line, color: T.text, backgroundColor: T.surface2 }}>
                  <option value="">Equipa 2…</option>
                  {equipasDaComp.map((t) => <option key={t.id} value={t.id}>{teamLabel(t)}</option>)}
                </select>
                <button onClick={addCustomPair} disabled={!novoA || !novoB} className="pf-body pf-focus flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold disabled:opacity-40" style={{ backgroundColor: T.gold, color: "#241A05" }}>
                  <Plus size={13} /> Adicionar
                </button>
              </div>
            </div>

            {ajustes.length > 0 && (
              <div className="rounded-lg border p-4" style={{ borderColor: T.line, backgroundColor: T.surface }}>
                <h3 className="pf-body text-xs font-semibold uppercase tracking-wide" style={{ color: T.text2 }}>Ajustes aplicados ({ajustes.length})</h3>
                <ul className="pf-mono mt-2 max-h-48 space-y-1 overflow-y-auto text-[11px]" style={{ color: T.text3 }}>
                  {ajustes.map((a, i) => <li key={i}>J{a.jornada}: {a.antes} → {a.depois}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
export default function App() {
  const [teams, setTeams] = useState(seedTeams);
  const teamsLabeled = useMemo(() => computeLabels(teams), [teams]);
  const [draws, setDraws] = useState(() => initialDraws(computeLabels(seedTeams)));
  const [tab, setTab] = useState("inscricao");

  const registar = useCallback((clubeId, competicaoIds) => {
    setTeams((prev) => [
      ...prev,
      ...competicaoIds.map((competicaoId, i) => ({
        id: `t-${Date.now()}-${i}`,
        clubeId,
        competicaoId,
        serie: null,
        equipaSeed: null,
        data: new Date().toLocaleDateString("pt-PT"),
        estado: "Confirmada",
      })),
    ]);
  }, []);

  const onUpdateDraw = useCallback((compId, entry) => {
    setDraws((prev) => ({ ...prev, [compId]: entry }));
  }, []);

  // Retira uma equipa da prova por completo: apaga a inscrição e remove-a de
  // qualquer série/liga onde já estivesse colocada, recalculando o calendário.
  const removerEquipa = useCallback((teamId) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setDraws((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((compId) => {
        const entry = next[compId];
        if (entry.modo === "grupos" && entry.grupos.some((g) => g.some((t) => t.id === teamId))) {
          const grupos = entry.grupos.map((g) => g.filter((t) => t.id !== teamId));
          next[compId] = { modo: "grupos", grupos, calendario: buildCalendarioGrupos(compId, grupos.map((g) => g.map((t) => ({ id: t.id, clubeId: t.clubeId, equipa: t.equipa })))) };
        } else if (entry.modo === "liga" && entry.liga.some((t) => t.id === teamId)) {
          const liga = entry.liga.filter((t) => t.id !== teamId);
          next[compId] = { modo: "liga", liga, calendario: buildCalendarioLiga(compId, liga) };
        }
      });
      return next;
    });
  }, []);

  const onAddClube = useCallback((nome, concelhoId) => addClube(nome, concelhoId), []);

  const tabs = [
    { id: "inscricao", label: "Inscrever equipa", icon: ClipboardList },
    { id: "equipas", label: "Equipas inscritas", icon: Users },
    { id: "quadros", label: "Quadros competitivos", icon: LayoutGrid },
    { id: "calendario", label: "Calendário", icon: CalendarDays },
  ];

  return (
    <div className="pf-body min-h-screen w-full" style={{ backgroundColor: T.bg }}>
      <style>{FONT_CSS}</style>
      <header className="border-b" style={{ borderColor: T.line, backgroundColor: T.surface }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: T.green }}>
            <Shield size={18} color="#08150F" />
          </div>
          <div>
            <p className="pf-display text-base font-semibold leading-tight" style={{ color: T.text }}>AF Beja · Plataforma de Inscrições</p>
            <p className="pf-body text-xs" style={{ color: T.text3 }}>Escalões seniores e de formação · Época 2026/2027</p>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="pf-tab-btn pf-body flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium" style={{ borderColor: active ? T.green : "transparent", color: active ? T.text : T.text3 }}>
                <Icon size={15} /> {t.label} {active && <ChevronRight size={13} style={{ color: T.green }} />}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "inscricao" && <InscricaoTab teamsLabeled={teamsLabeled} onRegister={registar} onAddClube={onAddClube} />}
        {tab === "equipas" && <EquipasTab teamsLabeled={teamsLabeled} onRemoveEquipa={removerEquipa} />}
        {tab === "quadros" && <QuadrosTab teamsLabeled={teamsLabeled} draws={draws} onUpdateDraw={onUpdateDraw} onRemoveEquipa={removerEquipa} />}
        {tab === "calendario" && <CalendarioTab teamsLabeled={teamsLabeled} draws={draws} />}
      </main>
    </div>
  );
}
