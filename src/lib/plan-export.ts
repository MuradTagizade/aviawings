/**
 * Standalone HTML/PDF export for AI itineraries.
 * Produces a self-contained, brand-styled document (images hot-linked from
 * Wikipedia). PDF uses the browser's print-to-PDF on a print-optimized copy.
 */

export interface ExportPlanItem {
  part: string;
  title: string;
  description: string;
  durationHint?: string;
  mapQuery?: string;
  image?: string;
  extract?: string;
}

export interface ExportPlan {
  title: string;
  destination: string;
  country: string;
  summary: string;
  heroImage?: string;
  stats: { bestTime: string; language: string; currency: string };
  days: { day: number; theme: string; items: ExportPlanItem[] }[];
  budget?: { currency: string; perDayLow: number; perDayHigh: number; note: string };
  packing: string[];
  phrases: { local: string; meaning: string }[];
  tips: string[];
}

export interface ExportLabels {
  day: string;
  bestTime: string;
  language: string;
  currency: string;
  budgetTitle: string;
  budgetPerPerson: string;
  packingTitle: string;
  phrasesTitle: string;
  tipsTitle: string;
  viewOnMap: string;
  preparedBy: string;
  disclaimer: string;
  duration: string;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PART_EMOJI: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

export function buildExportHtml(plan: ExportPlan, labels: ExportLabels, lang: string) {
  const mapLink = (q?: string) =>
    q
      ? `<a class="map" href="https://www.google.com/maps/search/${encodeURIComponent(q)}" target="_blank" rel="noopener">📍 ${esc(labels.viewOnMap)}</a>`
      : "";

  const days = plan.days
    .map(
      (d) => `
  <section class="day">
    <div class="day-head"><span class="day-num">${d.day}</span><div><p class="day-label">${esc(labels.day)} ${d.day}</p><h2>${esc(d.theme)}</h2></div></div>
    ${d.items
      .map(
        (it) => `
    <article class="item">
      ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />` : ""}
      <div class="item-body">
        <h3>${PART_EMOJI[it.part] ?? "•"} ${esc(it.title)}</h3>
        <p>${esc(it.description)}</p>
        <p class="meta">${it.durationHint ? `⏱ ${esc(labels.duration)}: ${esc(it.durationHint)} · ` : ""}${mapLink(it.mapQuery)}</p>
      </div>
    </article>`
      )
      .join("")}
  </section>`
    )
    .join("");

  const budget = plan.budget
    ? `<section class="panel"><h2>${esc(labels.budgetTitle)}</h2><p class="big">${plan.budget.perDayLow}–${plan.budget.perDayHigh} ${esc(plan.budget.currency)}</p><p class="muted">${esc(labels.budgetPerPerson)}</p><p>${esc(plan.budget.note)}</p></section>`
    : "";

  const packing = plan.packing.length
    ? `<section class="panel"><h2>${esc(labels.packingTitle)}</h2><ul>${plan.packing.map((p) => `<li>☐ ${esc(p)}</li>`).join("")}</ul></section>`
    : "";

  const phrases = plan.phrases.length
    ? `<section class="panel"><h2>${esc(labels.phrasesTitle)}</h2><table>${plan.phrases.map((p) => `<tr><td class="loc">${esc(p.local)}</td><td>${esc(p.meaning)}</td></tr>`).join("")}</table></section>`
    : "";

  const tips = plan.tips.length
    ? `<section class="panel"><h2>${esc(labels.tipsTitle)}</h2><ul>${plan.tips.map((p) => `<li>✦ ${esc(p)}</li>`).join("")}</ul></section>`
    : "";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(plan.title)} — Aviawings</title>
<style>
  :root { --cream:#faf8f5; --ink:#1a1a2e; --soft:#50536b; --faint:#8b8ea3; --gold:#c9a96e; --gold-deep:#a9884b; --sand:#f3efe7; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,'Segoe UI',Roboto,sans-serif; background:var(--cream); color:var(--ink); line-height:1.6; }
  .wrap { max-width:760px; margin:0 auto; padding:48px 24px; }
  .brand { display:flex; align-items:center; gap:8px; color:var(--gold-deep); font-weight:700; letter-spacing:.02em; }
  .hero { margin-top:24px; border-radius:20px; overflow:hidden; }
  .hero img { width:100%; height:300px; object-fit:cover; display:block; }
  h1 { font-family:Georgia,'Times New Roman',serif; font-size:34px; line-height:1.15; margin-top:24px; }
  .dest { color:var(--gold-deep); font-size:13px; text-transform:uppercase; letter-spacing:.18em; margin-top:28px; }
  .summary { color:var(--soft); margin-top:12px; font-size:16px; }
  .stats { display:flex; gap:12px; flex-wrap:wrap; margin-top:20px; }
  .stat { background:#fff; border:1px solid rgba(26,26,46,.08); border-radius:14px; padding:12px 16px; min-width:140px; }
  .stat b { display:block; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); margin-bottom:2px; }
  .day { margin-top:36px; background:#fff; border:1px solid rgba(26,26,46,.08); border-radius:20px; overflow:hidden; page-break-inside:avoid; }
  .day-head { display:flex; gap:14px; align-items:center; padding:18px 22px; background:var(--sand); }
  .day-num { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; background:var(--ink); color:var(--cream); font-family:Georgia,serif; font-size:20px; }
  .day-label { font-size:11px; text-transform:uppercase; letter-spacing:.14em; color:var(--faint); }
  .day h2 { font-size:17px; }
  .item { display:flex; gap:16px; padding:18px 22px; border-top:1px solid rgba(26,26,46,.06); }
  .item img { width:110px; height:110px; object-fit:cover; border-radius:12px; flex-shrink:0; }
  .item h3 { font-size:15px; margin-bottom:4px; }
  .item p { font-size:14px; color:var(--soft); }
  .meta { margin-top:6px; font-size:12.5px !important; color:var(--faint) !important; }
  .map { color:var(--gold-deep); text-decoration:none; }
  .panel { margin-top:28px; background:#fff; border:1px solid rgba(26,26,46,.08); border-radius:20px; padding:22px; page-break-inside:avoid; }
  .panel h2 { font-size:17px; margin-bottom:10px; }
  .panel ul { list-style:none; }
  .panel li { padding:4px 0; color:var(--soft); font-size:14px; }
  .panel table { width:100%; border-collapse:collapse; }
  .panel td { padding:7px 0; border-bottom:1px solid rgba(26,26,46,.06); font-size:14px; color:var(--soft); }
  .panel .loc { font-weight:600; color:var(--ink); padding-right:16px; white-space:nowrap; }
  .big { font-family:Georgia,serif; font-size:28px; }
  .muted { color:var(--faint); font-size:12.5px; margin-bottom:8px; }
  footer { margin-top:40px; padding-top:20px; border-top:1px solid rgba(26,26,46,.1); color:var(--faint); font-size:12px; text-align:center; }
  @media print {
    body { background:#fff; }
    .wrap { padding:0; max-width:100%; }
    .hero img { height:220px; }
    a { color:inherit; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="brand">✈ AVIAWINGS</div>
  ${plan.heroImage ? `<div class="hero"><img src="${esc(plan.heroImage)}" alt="${esc(plan.destination)}" /></div>` : ""}
  <p class="dest">${esc(plan.destination)} · ${esc(plan.country)}</p>
  <h1>${esc(plan.title)}</h1>
  <p class="summary">${esc(plan.summary)}</p>
  <div class="stats">
    <div class="stat"><b>${esc(labels.bestTime)}</b>${esc(plan.stats.bestTime)}</div>
    <div class="stat"><b>${esc(labels.language)}</b>${esc(plan.stats.language)}</div>
    <div class="stat"><b>${esc(labels.currency)}</b>${esc(plan.stats.currency)}</div>
  </div>
  ${days}
  ${budget}
  ${packing}
  ${phrases}
  ${tips}
  <footer>${esc(labels.preparedBy)} · aviawings.com<br/>${esc(labels.disclaimer)}</footer>
</div>
</body>
</html>`;
}

export function downloadHtmlFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printAsPdf(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    html.replace(
      "</body>",
      `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400))</script></body>`
    )
  );
  w.document.close();
}
