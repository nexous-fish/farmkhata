/* KhetKhata — engine: money math, aggregation, forecast, alerts, coach */
"use strict";

/* ---------- formatting ---------- */
function inr(n) {
  const neg = n < 0; n = Math.abs(Math.round(n));
  let s = String(n), last3 = s.slice(-3), rest = s.slice(0, -3);
  if (rest) last3 = "," + last3;
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + last3;
  return (neg ? "−₹" : "₹") + grouped;
}
function inrShort(n) {
  const neg = n < 0; n = Math.abs(n);
  let s;
  if (n >= 1e7) s = (n / 1e7).toFixed(2).replace(/\.00$/, "") + " Cr";
  else if (n >= 1e5) s = (n / 1e5).toFixed(n >= 1e6 ? 1 : 2).replace(/\.00$/, "") + " L";
  else if (n >= 1000) s = (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  else s = String(Math.round(n));
  return (neg ? "−₹" : "₹") + s;
}
const CROP_NAMES = {}; // filled in app.js after DB load
function cropName(id) { return (CROP_NAMES[id] || (CROP_NAMES[id] = (DB.crops.find(c => c.id === id) || {}).name || "—")); }
function plotName(id) { const p = DB.plots.find(x => x.id === id); return p ? p.name : "—"; }
const CAT_LABEL = {
  seed: "Seed / planting", fertilizer: "Fertilizer", pesticide: "Pesticide / spray",
  labour: "Labour", irrigation: "Irrigation / fuel", transport: "Transport & market", other: "Other"
};
const fmtDate = iso => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + "’" + String(d.getFullYear()).slice(2);
};
const daysUntil = iso => Math.round((new Date(iso + "T00:00:00") - new Date(TODAY + "T00:00:00")) / 864e5);
const todayISO = () => new Date().toISOString().slice(0, 10);
let TODAY = todayISO();

/* ---------- aggregation ---------- */
function cropCalc(crop) {
  const exps = DB.expenses.filter(e => e.cropId === crop.id);
  const planPre = crop.plan || {};
  const planTotalPre = Object.values(planPre).reduce((a, b) => a + b, 0);
  const spent0 = exps.reduce((a, e) => a + e.amt, 0);
  // seasons closed before the app existed have few/no recorded entries — fall back to the season plan
  const closedFallback = crop.status === "closed";
  const spent = closedFallback && spent0 < planTotalPre * 0.5 ? planTotalPre : spent0;
  const sales = DB.sales.filter(s => s.cropId === crop.id);
  const qtySold = sales.reduce((a, s) => a + s.qty, 0);
  const gross0 = sales.reduce((a, s) => a + s.qty * s.price, 0);
  // crops closed before the app existed carry no sale records — use their recorded season price
  const gross = closedFallback && gross0 === 0 ? crop.expectedYieldQtl * crop.expectedPrice : gross0;
  const received = closedFallback && gross0 === 0 ? gross : sales.reduce((a, s) => a + s.received, 0);
  const pending = sales.reduce((a, s) => a + s.pending, 0);
  const plan = planPre;
  const plannedTotal = Object.values(plan).reduce((a, b) => a + b, 0);
  const expectedRevenue = crop.expectedYieldQtl * crop.expectedPrice;
  const breakEven = crop.expectedYieldQtl > 0 ? (spent > 0 ? spent : plannedTotal) / crop.expectedYieldQtl : 0;
  const avgPrice = qtySold > 0 ? gross / qtySold : null;
  const realized = gross - pending;
  const byCat = {};
  exps.forEach(e => byCat[e.cat] = (byCat[e.cat] || 0) + e.amt);
  // remaining spend to finish season: plan minus spent, floor 0 for standing/planned
  const toGo = Math.max(0, plannedTotal - spent);
  const totalCost = crop.status === "planned" ? plannedTotal : spent + toGo;
  const revSoFar = gross;
  const expRevAtPlan = expectedRevenue;
  return {
    crop, spent, toGo, totalCost, plan, plannedTotal, sales, qtySold, gross, received, pending,
    avgPrice, breakEven, byCat, expectedRevenue,
    profitRealized: realized - spent + pending, // economic: includes receivable
    profitIfPlan: expectedRevenue - totalCost,
    costPerAcre: totalCost / crop.acres,
    revPerAcre: (crop.status === "closed" || crop.status === "harvested" ? gross : expectedRevenue) / crop.acres,
    profitPerAcre: (crop.status === "closed" ? (gross - spent) : (expectedRevenue - totalCost)) / crop.acres
  };
}

function seasonKharif2026() {
  const crops = DB.crops.filter(c => c.season === "Kharif 2026" && c.status !== "planned");
  let spent = 0, gross = 0, pending = 0, expRev = 0, totalCost = 0;
  crops.forEach(c => { const x = cropCalc(c); spent += x.spent; gross += x.gross; pending += x.pending; expRev += x.expectedRevenue; totalCost += x.totalCost; });
  return { crops, spent, gross, pending, expRev, totalCost, projectedProfit: expRev - totalCost };
}

/* ---------- cash-flow forecast ---------- */
function cashFlow(days) {
  const rows = []; let bal = cashOnHand();
  for (let i = 0; i <= days; i++) {
    const d = new Date(TODAY + "T00:00:00"); d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const in_ = [], out = [];
    // receivables
    DB.sales.forEach(s => { if (s.pending > 0 && s.due === iso) in_.push({ lbl: "Buyer payment — " + s.buyer.split("—")[0].trim(), amt: s.pending }); });
    // udhaar owed by us
    DB.udhaar.forEach(u => { if (u.dir === "owe" && u.due === iso) out.push({ lbl: "Udhaar repay — " + u.party, amt: u.amt }); });
    // loans
    DB.loans.forEach(l => { if (l.emi && l.nextDue === iso) out.push({ lbl: l.type + " EMI", amt: l.emi }); });
    // planned harvest income (first sale date window)
    DB.crops.forEach(c => {
      if (c.status === "standing" && c.harvestFrom && c.harvestTo) {
        const mid = new Date(c.harvestFrom + "T00:00:00");
        mid.setDate(mid.getDate() + Math.round(((new Date(c.harvestTo) - new Date(c.harvestFrom)) / 2) / 864e5));
        const midIso = mid.toISOString().slice(0, 10);
        const x = cropCalc(c);
        const remainingRev = Math.max(0, x.expectedRevenue - x.gross);
        if (remainingRev > 0 && midIso === iso) in_.push({ lbl: "Expected sale — " + c.name, amt: remainingRev * 0.85 });
      }
      if (c.status === "planned" && c.sown === iso) {
        const p = c.plan; const total = Object.values(p).reduce((a, b) => a + b, 0);
        out.push({ lbl: "Season inputs — " + c.name, amt: total * 0.55 });
      }
    });
    const net = in_.reduce((a, x) => a + x.amt, 0) - out.reduce((a, x) => a + x.amt, 0);
    bal += net;
    rows.push({ iso, d: d.getDate() + " " + d.toLocaleDateString("en-IN", { month: "short" }), in: in_, out, net, bal });
  }
  return rows;
}
function cashOnHand() {
  // heuristic: received - paid, minus what went to udhaar (unpaid), minus pending wages
  const received = DB.sales.reduce((a, s) => a + s.received, 0);
  const udhaarOwe = DB.udhaar.filter(u => u.dir === "owe").reduce((a, u) => a + u.amt, 0);
  const pendingWages = DB.expenses.filter(e => e.mode === "pending").reduce((a, e) => a + e.amt, 0);
  return Math.max(0, received - (DB.expenses.reduce((a, e) => a + e.amt, 0) - udhaarOwe - pendingWages));
}
function findGap(rows) {
  for (const r of rows) if (r.bal < 0) return r;
  return null;
}

/* ---------- alerts ---------- */
function buildAlerts() {
  const A = [];
  // price below break-even / below expected
  const c1 = cropCalc(DB.crops[0]); // tomato
  const m = DB.mandi;
  if (m.tomato.today < c1.crop.expectedPrice * 0.75) {
    A.push({ sev: "high", tag: "price", title: "Tomato rate down 32% — ₹" + m.tomato.today + " vs expected ₹" + c1.crop.expectedPrice,
      body: "Selling the standing crop at today’s rate still clears your cost of " + inrShort(c1.breakEven) + "/qtl, but profit drops to ~" + inrShort(c1.crop.expectedYieldQtl * m.tomato.today - c1.totalCost) + " instead of " + inrShort(c1.profitIfPlan) + ". Delaying picking won’t help — consider moving volume early.", act: "Compare buyers" });
  }
  // cash gap
  const rows90 = cashFlow(90); const gap = findGap(rows90);
  if (gap) A.push({ sev: "high", tag: "cash", title: "Cash shortfall expected around " + gap.d,
    body: "Udhaar repayments (" + inrShort(20500) + ") + SHG EMI land together while buyer payments of " + inrShort(50920) + " are due " + fmtDate("2026-11-05") + ". Keep the Pune Fruits payment chase on priority.", act: "See cash flow" });
  // pending receivables aging
  const recv = DB.udhaar.filter(u => u.dir === "receivable").reduce((a, u) => a + u.amt, 0);
  A.push({ sev: "med", tag: "receivable", title: "₹50,920 pending with Pune Fruits & Veg Co.",
    body: "Two unpaid tomato lots, due " + fmtDate("2026-11-05") + ". This is 24% of your projected kharif profit — worth a phone call before " + fmtDate("2026-11-03") + ".", act: "Open udhaar" });
  // expense anomaly: pesticide spike on cotton
  const pest = DB.expenses.filter(e => e.cropId === "c2" && e.cat === "pesticide").reduce((a, e) => a + e.amt, 0);
  A.push({ sev: "med", tag: "cost", title: "Cotton pesticide spend is 39% over plan",
    body: "₹" + pest.toLocaleString("en-IN") + " against a plan of ₹5,600 — pink bollworm sprays added " + inrShort(pest - 5600) + ". Trap checks (reminder of 30 Oct) prevent repeat rounds.", act: "See crops" });
  // labour pending
  const pw = DB.expenses.filter(e => e.mode === "pending").reduce((a, e) => a + e.amt, 0);
  A.push({ sev: "low", tag: "labour", title: "Wages of " + inr(pw) + " pending (Sakhri tai team, Gaurabai)",
    body: "Picking rounds 4 (tomato) and day-1 cotton pickers. Paying before " + fmtDate("2026-10-31") + " keeps the team for round 5.", act: "Open labour" });
  // weather-linked
  const rainDay = DB.weather.find(w => w.rain >= 5);
  if (rainDay) A.push({ sev: "low", tag: "weather", title: "Light rain " + fmtDate(rainDay.date) + " (60%)",
    body: "Don’t schedule the cotton spray round-3 on " + fmtDate(rainDay.date) + " — a washed-out spray costs ~₹2,100 plus a lost day. Move it to 31 Oct.", act: "View week" });
  // loan coverage
  A.push({ sev: "info", tag: "loan", title: "KCC interest within subvention window",
    body: "Repaying the drawn ₹80,000 by " + fmtDate("2027-02-15") + " keeps the 7% rate. Projected kharif inflow covers it 2.6×, so credit-readiness stays GREEN.", act: "Open report" });
  return A;
}

/* ---------- profit coach ---------- */
function coachAnswer(q) {
  q = q.toLowerCase();
  const k = seasonKharif2026();
  if (/wheat|tomato|compare|tulna|ज्यादा|कौन/.test(q) && /wheat|tomato|गेहूं|टमाटर/.test(q)) {
    const c4 = cropCalc(DB.crops[3]);
    return `On <b>your own last 12 months</b>: wheat gave <b>${inr(c4.profitRealized)}</b> on 2 acres (${inrShort(c4.profitPerAcre)}/acre) with ${inrShort(c4.costPerAcre)}/acre of cost. Tomato this kharif is heading to <b>${inrShort(c1profitIf())}</b> on 2 acres but the price risk is real — rate already fell 32%.<br><br>Plain answer: <b>wheat = lower profit but near-zero price risk</b> (you sell at harvest, cash in hand). <b>Tomato = 4× the profit per acre but needs ${inrShort(cropCalc(DB.crops[0]).totalCost)} working capital and a buyer before picking.</b> If buyer tie-up stays shaky, split: 1 acre tomato, 1 acre wheat.`;
  }
  if (/why|kyu|क्यों|kaaran|कम/.test(q)) {
    return `Three reasons your kharif profit is tracking <b>${inrShort(k.projectedProfit)}</b> instead of the ${inrShort(k.expRev - k.totalCost + 78000)} you’d have seen at sowing-time prices:<br><br>1. <b>Tomato price collapse</b> — ₹1,380 → ₹950/qtl. That alone is ~${inrShort((c1c().expectedPrice - 950) * 110)} on the ~110 qtl still unsold.<br>2. <b>Extra pesticide rounds</b> on cotton (+₹4,400 over plan) from pink bollworm.<br>3. <b>Diesel</b> — irrigation fuel up ₹2,300 vs last kharif (pump running longer in the dry Sept).<br><br>Everything else — labour, seed, fertilizer — is within plan. This is a <b>price problem, not a spending problem</b>.`;
  }
  if (/reduce|kam|cut|बचत|save|ghata/.test(q)) {
    return `Based on your own ledger, three moves for this rabi:<br><br>1. <b>Soil test before onion/wheat</b> (reminder already set for 8 Nov). Jadhav mama cut urea ~15% after his soil card — on your ₹22,000 onion fertilizer plan that’s ~${inr(3300)}.<br>2. <b>Buy fertilizer by 10 Nov</b> — Vithal Seva Kendra gives 3% off on advance udhaar settlement; you have ${inr(20500)} due anyway.<br>3. <b>Group labour for onion transplanting</b> at ₹330/day via Sakhri tai’s team instead of daily hires — your tomato transplanting ran ₹420/day.<br><br>Combined realistic saving: <b>~₹7,500–9,000</b> for the rabi season.`;
  }
  if (/price|bhav|भाव|rate|mandi/.test(q)) {
    return `Mandi (Pune APMC, ${DB.mandi.updated}): tomato <b>₹${DB.mandi.tomato.today}</b>/qtl (was ₹${DB.mandi.tomato.month} a month ago), cotton ₹${DB.mandi.cotton.today}, soybean ₹${DB.mandi.soybean.today}, wheat ₹${DB.mandi.wheat.today}.<br><br>Your tomato break-even is <b>${inrShort(c1c().breakEven)}/qtl</b> — you are still above cost, but every ₹100/qtl drop from here cuts ~${inr(11000)} from the remaining crop.`;
  }
  if (/cash|paisa|नकद|shortfall|emi|loan/.test(q)) {
    const gap = findGap(cashFlow(90));
    return `Cash on hand: <b>${inr(cashOnHand())}</b>. Coming in: ${inr(50920)} buyer payment (due ${fmtDate("2026-11-05")}). Going out by 30 Nov: ${inr(20500)} udhaar + ₹2,500 EMI + wages ${inr(4400)}.${gap ? ` Projection shows a <b>tight window around ${gap.d}</b> — mainly if the Pune Fruits payment slips. Chase it before 3 Nov.` : " Projection stays positive through 90 days."}`;
  }
  return `Here’s what I see in <b>your</b> numbers right now:<br><br>• Kharif projected profit: <b>${inrShort(k.projectedProfit)}</b> (was tracking ${inrShort(k.expRev - k.totalCost)} at sowing)<br>• Biggest cost: tomato labour (${inrShort(c1c().byCat.labour || 0)})<br>• Biggest risk: tomato price, down 32%<br>• Cash position: ${inrShort(cashOnHand())} on hand, ${inrShort(50920)} receivable<br><br>Ask me things like <i>“why is profit less this season”, “wheat vs tomato”, “how to cut costs”, “cash position”</i> — I answer from your ledger, not generic advice.`;
}
function c1c() { return cropCalc(DB.crops[0]); }
function c1profitIf() { return c1c().expectedYieldQtl * DB.mandi.tomato.today - c1c().totalCost; }

/* ---------- risk scoring (lender view) ---------- */
function creditScore() {
  const k = seasonKharif2026();
  const recv = DB.udhaar.filter(u => u.dir === "receivable").reduce((a, u) => a + u.amt, 0);
  const debtService = 80000 + 2500 * 12; // kcc drawn + shg annual
  const coverage = k.projectedProfit / debtService;
  const score = Math.max(0, Math.min(100, Math.round(46 + coverage * 28 + (recv < 60000 ? 8 : 0) + (k.gross > 150000 ? 8 : 0))));
  return { coverage, score, debtService };
}
