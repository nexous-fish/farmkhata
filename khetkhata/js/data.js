/* KhetKhata — seed data (demo). All money in INR. Dates ISO. */
"use strict";

const SEED = {
  farmer: {
    name: "Ramesh Bandu Patil",
    nameMr: "रमेश बंडू पाटील",
    phone: "+91 98220 41127",
    village: "Shirur (Kasarwadi phata)",
    district: "Pune",
    state: "Maharashtra",
    language: "en",
    literacyNote: "Prefers voice + pictures over typing",
    totalAcres: 6.5,
    ownedAcres: 5.0,
    leasedAcres: 1.5,
    irrigation: "Drip on bagayat plot, rest rainfed",
    joined: "2025-06-12",
    fpo: "Shirur Taluka Farmer Producer Co.",
    family: [
      { id: "f1", name: "Sunita Patil", relation: "Wife", canAdd: true, spent: 0 },
      { id: "f2", name: "Sunil Patil", relation: "Brother", canAdd: true, spent: 0 },
      { id: "f3", name: "Amit Patil", relation: "Son (college)", canAdd: true, spent: 0 }
    ]
  },

  plots: [
    { id: "p1", name: "Killa no. 12", acres: 2.5, soil: "Black cotton", water: "Rainfed" },
    { id: "p2", name: "Nadi-tircha bagayat", acres: 2.0, soil: "Loamy", water: "Drip + river pump" },
    { id: "p3", name: "Gharajawar (leased)", acres: 2.0, soil: "Medium black", water: "Borewell", leaseRent: 9000 }
  ],

  crops: [
    {
      id: "c1", name: "Tomato (Abhilash)", season: "Kharif 2026", plotId: "p2", acres: 2.0,
      sown: "2026-06-18", harvestFrom: "2026-09-20", harvestTo: "2026-11-10",
      expectedYieldQtl: 260, expectedPrice: 1400, status: "standing",
      stage: "Picking round 4 of ~7",
      plan: { seed: 9800, fertilizer: 18600, pesticide: 9400, labour: 24000, irrigation: 4800, transport: 11800, other: 6600 }
    },
    {
      id: "c2", name: "Cotton (Bt)", season: "Kharif 2026", plotId: "p1", acres: 2.5,
      sown: "2026-06-05", harvestFrom: "2026-10-15", harvestTo: "2027-01-15",
      expectedYieldQtl: 12, expectedPrice: 7200, status: "standing",
      stage: "Picking started, pink bollworm watch",
      plan: { seed: 2800, fertilizer: 6900, pesticide: 5600, labour: 14000, irrigation: 2400, transport: 1800, other: 1100 }
    },
    {
      id: "c3", name: "Soybean", season: "Kharif 2026", plotId: "p3", acres: 2.0,
      sown: "2026-06-28", harvestFrom: "2026-10-05", harvestTo: "2026-10-15",
      expectedYieldQtl: 14.5, expectedPrice: 4800, status: "harvested",
      stage: "Harvested 10 Oct, stock at home",
      plan: { seed: 4200, fertilizer: 5800, pesticide: 1900, labour: 4400, irrigation: 0, transport: 1600, other: 0 }
    },
    {
      id: "c4", name: "Wheat", season: "Rabi 2025-26", plotId: "p3", acres: 2.0,
      sown: "2025-11-05", harvestFrom: "2026-03-15", harvestTo: "2026-03-25",
      expectedYieldQtl: 44, expectedPrice: 2350, status: "closed",
      stage: "Sold out in March",
      plan: { seed: 6400, fertilizer: 11200, pesticide: 900, labour: 9600, irrigation: 4800, transport: 5400, other: 900 }
    },
    {
      id: "c5", name: "Onion (planned)", season: "Rabi 2026-27", plotId: "p3", acres: 2.0,
      sown: "2026-11-20", harvestFrom: "2027-03-10", harvestTo: "2027-04-10",
      expectedYieldQtl: 200, expectedPrice: 1600, status: "planned",
      stage: "Nursery not yet sown",
      plan: { seed: 3500, fertilizer: 22000, pesticide: 6500, labour: 26000, irrigation: 9000, transport: 12000, other: 7000 }
    }
  ],

  expenses: [
    { id: "e101", date: "2026-06-05", cat: "seed", cropId: "c2", plotId: "p1", amt: 2800, desc: "Bt cotton seed 3 packets (Ajeet-155)", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "upi", source: "manual" },
    { id: "e102", date: "2026-06-08", cat: "labour", cropId: "c1", plotId: "p2", amt: 2400, desc: "Land prep + bed making, 4 labour", supplier: "Sakhri tai team", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e103", date: "2026-06-10", cat: "other", cropId: "c1", plotId: "p2", amt: 3500, desc: "Tractor rotavator 2 hours", supplier: "Jyotiba Tractor Seva", paidBy: "self", mode: "cash", source: "bill" },
    { id: "e104", date: "2026-06-15", cat: "other", cropId: "c1", plotId: "p2", amt: 2400, desc: "Plastic mulch 2 rolls", supplier: "Krushi Bazar Pune", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e105", date: "2026-06-20", cat: "seed", cropId: "c1", plotId: "p2", amt: 9800, desc: "Tomato seedlings 14,000 nos (Abhilash)", supplier: "Green Leaf Nursery, Koregaon", paidBy: "brother", mode: "upi", source: "bill" },
    { id: "e106", date: "2026-06-24", cat: "fertilizer", cropId: "c1", plotId: "p2", amt: 9400, desc: "DAP 4 bags + 10:26:26 2 bags", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "udhaar", source: "bill" },
    { id: "e107", date: "2026-06-26", cat: "fertilizer", cropId: "c2", plotId: "p1", amt: 6900, desc: "Urea 3 bags + DAP 2 bags", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e108", date: "2026-06-30", cat: "fertilizer", cropId: "c3", plotId: "p3", amt: 4200, desc: "Soybean seed 60 kg (JS-335)", supplier: "Taluka Seed Shop", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e109", date: "2026-07-08", cat: "pesticide", cropId: "c1", plotId: "p2", amt: 3100, desc: "Saaf fungicide + sticker", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e110", date: "2026-07-14", cat: "irrigation", cropId: "c1", plotId: "p2", amt: 1800, desc: "Diesel for pump (2 refill)", supplier: "Sharma Diesel", paidBy: "wife", mode: "cash", source: "voice" },
    { id: "e111", date: "2026-07-20", cat: "labour", cropId: "c1", plotId: "p2", amt: 4200, desc: "Planting 6 labour", supplier: "Sakhri tai team", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e112", date: "2026-07-28", cat: "fertilizer", cropId: "c1", plotId: "p2", amt: 5200, desc: "19:19:19 drip fertigation 10 kg x2", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "udhaar", source: "bill" },
    { id: "e113", date: "2026-08-02", cat: "irrigation", cropId: "c1", plotId: "p2", amt: 2200, desc: "Drip lateral repair + grommet", supplier: "Krushi Bazar Pune", paidBy: "son", mode: "upi", source: "bill" },
    { id: "e114", date: "2026-08-06", cat: "fertilizer", cropId: "c3", plotId: "p3", amt: 1600, desc: "Urea top dress 1.5 bag", supplier: "Taluka Seed Shop", paidBy: "self", mode: "cash", source: "manual" },
    { id: "e115", date: "2026-08-12", cat: "pesticide", cropId: "c2", plotId: "p1", amt: 2300, desc: "Extra spray for pink bollworm (Emamectin)", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "udhaar", source: "bill" },
    { id: "e116", date: "2026-08-18", cat: "pesticide", cropId: "c1", plotId: "p2", amt: 2600, desc: "Fruit borer spray round 2", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e117", date: "2026-08-25", cat: "labour", cropId: "c1", plotId: "p2", amt: 5600, desc: "Staking + weeding 8 labour days", supplier: "Sakhri tai team", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e118", date: "2026-09-01", cat: "irrigation", cropId: "c1", plotId: "p2", amt: 1200, desc: "Diesel refill", supplier: "Sharma Diesel", paidBy: "wife", mode: "udhaar", source: "voice" },
    { id: "e119", date: "2026-09-06", cat: "pesticide", cropId: "c1", plotId: "p2", amt: 2400, desc: "Copper spray before monsoon end", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e120", date: "2026-09-10", cat: "other", cropId: "c1", plotId: "p2", amt: 1800, desc: "Staking twine + bamboo", supplier: "Local", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e121", date: "2026-09-16", cat: "other", cropId: "c1", plotId: "p2", amt: 2400, desc: "Crates deposit 24 nos", supplier: "Moschi market agent", paidBy: "son", mode: "upi", source: "bill" },
    { id: "e122", date: "2026-09-22", cat: "labour", cropId: "c1", plotId: "p2", amt: 4800, desc: "First picking 6 labour", supplier: "Sakhri tai team", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e123", date: "2026-09-24", cat: "transport", cropId: "c1", plotId: "p2", amt: 2600, desc: "Tempo to Moshi market 2 trips", supplier: "Bapu Tempo Service", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e124", date: "2026-09-28", cat: "other", cropId: "c1", plotId: "p2", amt: 4200, desc: "Packing + market fee round 1-2", supplier: "Moshi market", paidBy: "self", mode: "cash", source: "manual" },
    { id: "e125", date: "2026-10-03", cat: "labour", cropId: "c2", plotId: "p1", amt: 3400, desc: "Weeding cotton 5 labour days", supplier: "Bapu + 4", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e126", date: "2026-10-08", cat: "transport", cropId: "c3", plotId: "p3", amt: 1600, desc: "Combine harvester share + trolley", supplier: "Nimgaon custom hiring", paidBy: "self", mode: "upi", source: "bill" },
    { id: "e127", date: "2026-10-12", cat: "labour", cropId: "c1", plotId: "p2", amt: 5200, desc: "Picking round 2-3, 7 labour", supplier: "Sakhri tai team", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e128", date: "2026-10-16", cat: "transport", cropId: "c1", plotId: "p2", amt: 2600, desc: "Tempo to market 2 trips", supplier: "Bapu Tempo Service", paidBy: "self", mode: "cash", source: "voice" },
    { id: "e129", date: "2026-10-20", cat: "other", cropId: "c1", plotId: "p2", amt: 3100, desc: "Packing + market fee round 3", supplier: "Moshi market", paidBy: "self", mode: "cash", source: "manual" },
    { id: "e130", date: "2026-10-21", cat: "pesticide", cropId: "c2", plotId: "p1", amt: 2100, desc: "Pink bollworm spray round 2", supplier: "Vithal Krishi Seva Kendra", paidBy: "self", mode: "udhaar", source: "bill" },
    { id: "e131", date: "2026-10-24", cat: "irrigation", cropId: "c1", plotId: "p2", amt: 1400, desc: "Diesel refill (Sharma Diesel)", supplier: "Sharma Diesel", paidBy: "wife", mode: "udhaar", source: "voice" },
    { id: "e132", date: "2026-10-26", cat: "labour", cropId: "c1", plotId: "p2", amt: 2600, desc: "Picking round 4 — 4 days wage pending", supplier: "Sakhri tai team", paidBy: "self", mode: "pending", source: "voice" },
    { id: "e133", date: "2026-10-27", cat: "labour", cropId: "c2", plotId: "p1", amt: 1800, desc: "Cotton picking day 1 — 2 women", supplier: "Gaurabai + 1", paidBy: "self", mode: "pending", source: "voice" },
    { id: "e134", date: "2026-10-27", cat: "other", cropId: "c4", plotId: "p3", amt: 900, desc: "Wheat — gunny bags 20 nos (past season, late entry)", supplier: "Local gunny", paidBy: "self", mode: "cash", source: "manual" }
  ],

  sales: [
    { id: "s1", date: "2026-09-23", cropId: "c1", qty: 32, price: 1180, buyer: "Moshi Market — Ganesh Traders", market: "Moshi (Pune)", transport: 1300, received: 37760, pending: 0, note: "Grade A lots" },
    { id: "s2", date: "2026-09-30", cropId: "c1", qty: 28, price: 1080, buyer: "Pune Fruits & Veg Co.", market: "Moshi (Pune)", transport: 1300, received: 0, pending: 30240, due: "2026-11-05", note: "Payment due after Diwali stock clearance" },
    { id: "s3", date: "2026-10-08", cropId: "c1", qty: 24, price: 980, buyer: "Moshi Market — Ganesh Traders", market: "Moshi (Pune)", transport: 1300, received: 23520, pending: 0, note: "Rate falling, small fruit mix" },
    { id: "s4", date: "2026-10-17", cropId: "c1", qty: 22, price: 940, buyer: "Pune Fruits & Veg Co.", market: "Moshi (Pune)", transport: 1300, received: 0, pending: 20680, due: "2026-11-05", note: "2nd unpaid lot" },
    { id: "s5", date: "2026-10-12", cropId: "c3", qty: 9.3, price: 4650, buyer: "Indapur Soy Processor", market: "Indapur", transport: 1100, received: 43245, pending: 0, note: "Straight to processor, no commission" },
    { id: "s6", date: "2026-10-27", cropId: "c2", qty: 1.4, price: 7250, buyer: "Kapadganj Cotton Ginning", market: "Kapadganj", transport: 400, received: 10150, pending: 0, note: "First picking, FFT rate" }
  ],

  loans: [
    { id: "l1", type: "Kisan Credit Card", bank: "Bank of Maharashtra, Shirur branch", limit: 150000, drawn: 80000, rate: "7% (with prompt-repay subvention)", emi: null, nextDue: "2027-02-15", nextDueAmt: 80000, note: "Interest serviced quarterly; crop cycle repayment", status: "active" },
    { id: "l2", type: "SHG group loan (Mauli Mahila Bachat Gat)", bank: "Via Sunita's SHG", limit: 30000, drawn: 30000, rate: "12%", emi: 2500, nextDue: "2026-11-05", nextDueAmt: 2500, note: "18 instalments paid, 12 left", status: "active" }
  ],

  udhaar: [
    { id: "u1", party: "Vithal Krishi Seva Kendra", kind: "dealer", dir: "owe", amt: 14600, opened: "2026-06-24", due: "2026-11-15", note: "Fertilizer + pesticide running account", settled: 0 },
    { id: "u2", party: "Sharma Diesel Pump", kind: "dealer", dir: "owe", amt: 4400, opened: "2026-09-01", due: "2026-11-30", note: "Diesel for pump", settled: 0 },
    { id: "u3", party: "Pune Fruits & Veg Co.", kind: "buyer", dir: "receivable", amt: 50920, opened: "2026-09-30", due: "2026-11-05", note: "Tomato lots 2 + 4", settled: 0 },
    { id: "u4", party: "Jyotiba Tractor Seva", kind: "dealer", dir: "owe", amt: 1500, opened: "2026-10-05", due: "2026-11-10", note: "Remaining of rotavator bill", settled: 0 }
  ],

  labour: [
    { id: "lb1", name: "Sakhri tai team", cropId: "c1", plotId: "p2", days: 31, rate: 350, paid: 21800, pending: 2600, note: "Bed making → picking round 4" },
    { id: "lb2", name: "Bapu + 4 (weeding)", cropId: "c2", plotId: "p1", days: 5, rate: 350, paid: 3400, pending: 0, note: "Cotton weeding" },
    { id: "lb3", name: "Gaurabai + 1 (picking)", cropId: "c2", plotId: "p1", days: 2, rate: 400, paid: 0, pending: 1800, note: "Cotton picking started" },
    { id: "lb4", name: "Combine crew (soybean)", cropId: "c3", plotId: "p3", days: 1, rate: 4400, paid: 4400, pending: 0, note: "Custom hiring, machine rate" }
  ],

  reminders: [
    { id: "r1", due: "2026-10-29", title: "Tomato round-4 picking — confirm buyer rate before harvest", cropId: "c1", why: "Mandi rate is below your break-even buffer; check Ganesh Trader vs Pune Fruits", status: "open", costLink: "picking labour ₹350/day" },
    { id: "r2", due: "2026-10-30", title: "Check pink bollworm pheromone traps, Killa 12", cropId: "c2", why: "Neighbour Patil's field caught moths; one spray now saves a ₹2,300 emergency spray later", status: "open", costLink: "pesticide budget" },
    { id: "r3", due: "2026-11-05", title: "SHG EMI ₹2,500 — Sunita's group", cropId: null, why: "Auto-deduction from cash box; keep money aside", status: "open", costLink: "loan repayment" },
    { id: "r4", due: "2026-11-08", title: "Soil test for Gharajawar before wheat sowing", cropId: "c5", why: "Last rabi urea use was high; soil-card report cut fertilizer cost ~15% for Jadhav mama", status: "open", costLink: "fertilizer budget" },
    { id: "r5", due: "2026-10-20", title: "Soybean stock — sell before price dips further", cropId: "c3", why: "Diwali demand window", status: "postponed", costLink: "storage loss ~₹60/qtl per month" },
    { id: "r6", due: "2026-10-12", title: "Diesel refill before pump service", cropId: "c1", why: "", status: "done", costLink: "" }
  ],

  mandi: {
    updated: "2026-10-28",
    tomato:  { today: 950,  week: 1020, month: 1380, unit: "₹/qtl", source: "Pune APMC (Moshi)" },
    cotton:  { today: 7250, week: 7300, month: 7600, unit: "₹/qtl", source: "Kapadganj + FFT" },
    soybean: { today: 4700, week: 4780, month: 5100, unit: "₹/qtl", source: "Indapur processor" },
    wheat:   { today: 2400, week: 2380, month: 2360, unit: "₹/qtl", source: "Pune APMC" },
    onion:   { today: 1450, week: 1500, month: 2100, unit: "₹/qtl", source: "Pune APMC" }
  },

  weather: [
    { date: "2026-10-29", cond: "Clear", tmax: 33, tmin: 17, rain: 0 },
    { date: "2026-10-30", cond: "Light rain (60%)", tmax: 29, tmin: 18, rain: 8 },
    { date: "2026-10-31", cond: "Partly cloudy", tmax: 31, tmin: 16, rain: 2 },
    { date: "2026-11-01", cond: "Clear", tmax: 32, tmin: 15, rain: 0 },
    { date: "2026-11-02", cond: "Clear", tmax: 33, tmin: 14, rain: 0 }
  ],

  consent: [
    { date: "2026-09-14", action: "Credit-readiness report shared with Shirur FPO (procurement planning)", by: "self", ref: "RPT-2026-091" },
    { date: "2026-08-02", action: "Allowed FPO agronomist to view crop-wise cost summary", by: "self", ref: "AGR-view" },
    { date: "2026-06-12", action: "Account created; data-use terms accepted", by: "self", ref: "onboarding" }
  ],

  notif: { frequency: "important", paused: false },

  fpoFarmers: [
    { name: "Ramesh Patil", village: "Shirur", acres: 6.5, crops: "Tomato, Cotton, Soybean", seasonProfit: 208000, receivable: 50920, udhaar: 20500, risk: "price", consent: "full" },
    { name: "Vitthal Jadhav", village: "Nimgaon", acres: 4.0, crops: "Onion, Jowar", seasonProfit: 142000, receivable: 0, udhaar: 9000, risk: "none", consent: "full" },
    { name: "Sakhri Shinde", village: "Shirur", acres: 2.0, crops: "Tomato, Marigold", seasonProfit: 61000, receivable: 18400, udhaar: 4200, risk: "cash", consent: "summary" },
    { name: "Bapu Kale", village: "Kurkumbh", acres: 9.0, crops: "Sugarcane, Soybean", seasonProfit: 265000, receivable: 71000, udhaar: 31000, risk: "cash", consent: "full" },
    { name: "Ganpat More", village: "Pargaon", acres: 3.5, crops: "Cotton, Bajra", seasonProfit: 78000, receivable: 9500, udhaar: 14000, risk: "loan", consent: "summary" },
    { name: "Sunita Mhaske", village: "Shirur", acres: 1.5, crops: "Marigold, Vegetables", seasonProfit: 88000, receivable: 6200, udhaar: 0, risk: "none", consent: "summary" },
    { name: "Dnyaneshwar Kale", village: "Kurkumbh", acres: 5.0, crops: "Soybean, Wheat", seasonProfit: -18000, receivable: 0, udhaar: 22000, risk: "loss", consent: "none" }
  ]
};
