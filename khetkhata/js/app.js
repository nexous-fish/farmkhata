/* KhetKhata — app shell, router, onboarding */
"use strict";

/* ---------- persistence ---------- */
let DB;
try { DB = JSON.parse(localStorage.getItem("kk_db")) || null; } catch (e) { DB = null; }
if (!DB) { DB = JSON.parse(JSON.stringify(SEED)); }
function save() { try { localStorage.setItem("kk_db", JSON.stringify(DB)); } catch (e) {} }
DB.crops.forEach(c => CROP_NAMES[c.id] = c.name);

const PAGES = {
  overview: { icon: "⌂", grp: "navFarm" },
  ledger:   { icon: "▤", grp: "navMoney" },
  crops:    { icon: "❋", grp: "navMoney" },
  cash:     { icon: "≈", grp: "navMoney" },
  udhaar:   { icon: "⇄", grp: "navMoney" },
  coach:    { icon: "✦", grp: "navGrow" },
  reminders:{ icon: "◔", grp: "navGrow", cnt: () => DB.reminders.filter(r => r.status === "open").length },
  people:   { icon: "☌", grp: "navGrow" },
  reports:  { icon: "🖩", grp: "navShare" },
  settings: { icon: "⚙", grp: "navShare" }
};
let PAGE = "overview";
let ROLE = "farmer";

function renderSidebar() {
  const groups = ["navFarm", "navMoney", "navGrow", "navShare"];
  el("#sidebar").innerHTML = `
    <div class="brand"><div class="mark">Khet<b>Khata</b></div><div class="sub">खेत का हिसाब</div></div>
    <nav class="nav">
      ${groups.map(g => `<div class="grp">${t(g)}</div>` +
        Object.entries(PAGES).filter(([, p]) => p.grp === g).map(([id, p]) => `
          <a href="#" class="${PAGE === id && ROLE === "farmer" ? "on" : ""}" onclick="nav('${id}');return false">
            <span class="ic">${p.icon}</span>${t(id === "overview" ? "navHome" : id === "ledger" ? "navLedger" : id === "crops" ? "navCrops" : id === "cash" ? "navCash" : id === "udhaar" ? "navUdhaar" : id === "coach" ? "navCoach" : id === "reminders" ? "navReminders" : id === "people" ? "navPeople" : id === "reports" ? "navReports" : "navSettings")}
            ${p.cnt ? `<span class="cnt">${p.cnt()}</span>` : ""}
          </a>`).join("")).join("")}
    </nav>
    <div class="farmer-card">
      <b>${esc(DB.farmer.nameMr || DB.farmer.name)}</b>
      ${esc(DB.farmer.village)}<br>
      <span class="mut">${DB.farmer.totalAcres} acres · ${esc(DB.farmer.fpo.split(" ").slice(0, 2).join(" "))}</span>
    </div>`;
}

function nav(page) {
  PAGE = page; ROLE = "farmer"; el("#roleSwitch").value = "farmer";
  renderSidebar(); renderView(); el(".side").classList.remove("open"); window.scrollTo(0, 0);
}

function renderView() {
  if (ROLE === "fpo") { vFpo(); return; }
  if (ROLE === "lender") { vLender(); return; }
  ({ overview: vOverview, ledger: vLedger, crops: vCrops, cash: vCash, coach: vCoach,
     reminders: vReminders, people: vPeople, udhaar: vUdhaar, reports: vReports, settings: vSettings }[PAGE] || vOverview)();
}

function renderApp() {
  renderSidebar(); renderView();
}

/* ---------- language quick switch ---------- */
function langModal() {
  openModal(`<h3>भाषा बदलें · Change language</h3>
  <div class="lang-grid mt">
    ${LANGS.map(l => `<button class="lang-opt ${DB.farmer.language === l.id ? "on" : ""}" onclick="DB.farmer.language='${l.id}';save();closeModal();renderApp()">
      <div class="nm">${l.name}</div><div class="en">${l.en}</div></button>`).join("")}
  </div>`);
}

/* ---------- onboarding ---------- */
let OB = { step: 0, lang: "en", data: { name: "", phone: "", village: "", acres: 4, plots: [], crops: [], loan: "kcc" } };
const CROP_OPTIONS = [
  { id: "tomato", name: "टमाटर / Tomato" }, { id: "wheat", name: "गेहूं / Wheat" },
  { id: "cotton", name: "कापूस / Cotton" }, { id: "soybean", name: "सोयाबीन / Soybean" },
  { id: "onion", name: "कांदा / Onion" }, { id: "jowar", name: "ज्वारी / Jowar" },
  { id: "bajra", name: "बाजरी / Bajra" }, { id: "sugarcane", name: "ऊस / Sugarcane" }
];

function obShow() {
  const steps = 5;
  const s = OB.step;
  el("#onboarding").classList.remove("hidden");
  el("#onboarding").innerHTML = `<div class="onb-wrap">
    <div class="logo">Khet<b>Khata</b> <span style="font-size:.85rem;color:var(--ink-3)">· खेत का हिसाब</span></div>
    <div class="step-ind">${Array.from({ length: steps }, (_, i) => `<i class="${i <= s ? "on" : ""}"></i>`).join("")}</div>
    ${[
      /* 0 language */
      `<h1>Choose your language</h1>
       <div class="hint">Hindi, Hinglish and regional languages are supported. You can change it any time — a family member can set it for you too.</div>
       <div class="lang-grid">
        ${LANGS.map(l => `<button class="lang-opt ${OB.lang === l.id ? "on" : ""}" onclick="OB.lang='${l.id}';obShow()">
          <div class="nm">${l.name}</div><div class="en">${l.en}</div></button>`).join("")}
       </div>
       <div class="wa-note">✆ &nbsp;No smartphone? Onboarding also works on a family member’s phone, or through WhatsApp buttons on any basic handset with WhatsApp installed.</div>`,
      /* 1 profile */
      `<h1>Your details</h1>
       <div class="hint">Only the basics — name and village. No documents needed right now.</div>
       <label class="fl">Full name</label><input class="f" id="obName" placeholder="e.g. Ramesh Bandu Patil" value="${esc(OB.data.name)}">
       <label class="fl">Mobile number</label><input class="f" id="obPhone" placeholder="10 digits" value="${esc(OB.data.phone)}">
       <label class="fl">Village / Taluka</label><input class="f" id="obVillage" placeholder="Taluka, district" value="${esc(OB.data.village)}">
       <div class="mini-note">📞 A shared phone is fine — any family member can keep the books from this number.</div>`,
      /* 2 farm */
      `<h1>How much land?</h1>
       <div class="hint">Rough numbers are fine — you can correct them later.</div>
       <label class="fl">Total land (acres)</label><input class="f" id="obAcres" type="number" step="0.5" value="${OB.data.acres}">
       <label class="fl">Plots — add each piece separately (name them, e.g. “Killa 12”)</label>
       <div id="obPlots"></div>
       <button class="btn sm mt" onclick="obAddPlot()">+ Add plot</button>
       <div class="mini-note">Each plot gets its own account — cost per acre shows plot by plot.</div>`,
      /* 3 crops */
      `<h1>Which crops, which season?</h1>
       <div class="hint">Pick this season’s crops. Give an approximate harvest date — we’ll build reminders around it.</div>
       <div class="crop-pick" id="obCrops">
        ${CROP_OPTIONS.map(c => `<button class="cp ${OB.data.crops.includes(c.id) ? "on" : ""}" onclick="obToggleCrop('${c.id}',this)">${c.name}</button>`).join("")}
       </div>
       <label class="fl" style="margin-top:18px">Expected harvest of the first crop (approx.)</label>
       <input class="f" type="date" id="obHarvest" value="2027-02-15">
       <div class="mini-note">Season cost, break-even price and cash-flow forecast link up automatically.</div>`,
      /* 4 loans */
      `<h1>Any loan or udhaar?</h1>
       <div class="hint">Reminders and cash-flow will account for it, so repayments never arrive as a surprise.</div>
       <label class="fl">Which credit is running?</label>
       <select class="f" id="obLoan">
         <option value="kcc">KCC / bank crop loan</option>
         <option value="shg">SHG / bachat gat loan</option>
         <option value="both">Both</option>
         <option value="none">None</option>
       </select>
       <label class="fl">Dealer udhaar outstanding right now (₹, optional)</label>
       <input class="f" type="number" id="obUdhaar" placeholder="Amount if any">
       <div class="wa-note">✆ &nbsp;That’s it! Every morning you’ll get a two-line summary — spent, received, pending. This web dashboard stays available for you and your family.</div>`
    ][s]}
    <div class="foot-nav">
      <button class="btn" ${s === 0 ? "style='visibility:hidden'" : ""} onclick="OB.step--;obShow()">← Back</button>
      <button class="btn primary" onclick="obNext()">${s === steps - 1 ? "Finish ✓" : "Next →"}</button>
    </div>
  </div>`;
  if (s === 2) { if (!OB.data.plots.length) obAddPlot("Killa 1"); obRenderPlots(); }
}
function obAddPlot(name) {
  OB.data.plots.push({ name: name || "", acres: 1 });
  obRenderPlots();
}
function obRenderPlots() {
  el("#obPlots").innerHTML = OB.data.plots.map((p, i) => `
    <div class="flex mt" style="gap:8px">
      <input class="f" placeholder="Plot ka naam" value="${esc(p.name)}" oninput="OB.data.plots[${i}].name=this.value" style="flex:2">
      <input class="f" type="number" step="0.5" value="${p.acres}" oninput="OB.data.plots[${i}].acres=+this.value" style="flex:1">
      ${OB.data.plots.length > 1 ? `<button class="btn sm" onclick="OB.data.plots.splice(${i},1);obRenderPlots()">✕</button>` : ""}
    </div>`).join("");
}
function obToggleCrop(id, btn) {
  const i = OB.data.crops.indexOf(id);
  if (i >= 0) OB.data.crops.splice(i, 1); else OB.data.crops.push(id);
  btn.classList.toggle("on");
}
function obNext() {
  const s = OB.step;
  if (s === 1) {
    OB.data.name = el("#obName").value.trim();
    OB.data.phone = el("#obPhone").value.trim();
    OB.data.village = el("#obVillage").value.trim();
    if (!OB.data.name) return toast("Name is required");
  }
  if (s === 2) OB.data.acres = +el("#obAcres").value || 4;
  if (s === 4) { finishOnboarding(); return; }
  OB.step++; obShow();
}
function finishOnboarding() {
  // Apply onboarding over the seed demo data so the dashboard is instantly rich,
  // while carrying the farmer's own name/village/language into the profile.
  DB.farmer.language = OB.lang;
  if (OB.data.name) { DB.farmer.name = OB.data.name; DB.farmer.nameMr = OB.data.name; el("#avatar").textContent = OB.data.name[0]; }
  if (OB.data.village) DB.farmer.village = OB.data.village;
  if (OB.data.phone) DB.farmer.phone = "+91 " + OB.data.phone;
  DB.farmer.totalAcres = OB.data.acres || DB.farmer.totalAcres;
  DB.consent.unshift({ date: todayISO(), action: "Account created via onboarding; language set to " + OB.lang, by: "self", ref: "onboarding-v2" });
  save();
  localStorage.setItem("kk_onb", "1");
  el("#onboarding").classList.add("hidden");
  el("#shell").classList.remove("hidden");
  renderApp();
  toast("Swagat, " + (DB.farmer.name.split(" ")[0]) + "! Demo season loaded hai — numbers browser me save hote hain.");
}

/* ---------- boot ---------- */
function resetDemo() {
  localStorage.removeItem("kk_db"); localStorage.removeItem("kk_onb");
  location.reload();
}
window.addEventListener("DOMContentLoaded", () => {
  el("#avatar").textContent = (DB.farmer.nameMr || DB.farmer.name).trim()[0];
  el("#btnLang").onclick = langModal;
  el("#btnBurger").onclick = () => el(".side").classList.toggle("open");
  el("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  el("#roleSwitch").addEventListener("change", e => {
    ROLE = e.target.value;
    renderSidebar();
    if (ROLE !== "farmer") renderView(); else renderView();
    window.scrollTo(0, 0);
  });
  const onb = localStorage.getItem("kk_onb");
  if (!onb) { obShow(); }
  else { el("#shell").classList.remove("hidden"); renderApp(); }
  // deep-link ?page=crops etc.
  const q = new URLSearchParams(location.search).get("page");
  if (q && PAGES[q]) { PAGE = q; renderApp(); }
});
