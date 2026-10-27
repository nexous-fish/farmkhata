/* KhetKhata — views */
"use strict";

/* ---------- tiny helpers ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));}
function el(sel){return document.querySelector(sel);}
function toast(msg){const d=document.createElement("div");d.className="toast";d.textContent=msg;el("#toasts").appendChild(d);setTimeout(()=>d.remove(),3200);}
function openModal(html){el("#modalBox").innerHTML=html;el("#modal").classList.remove("hidden");}
function closeModal(){el("#modal").classList.add("hidden");}
function tag(cls,txt){return `<span class="tag ${cls}">${txt}</span>`;}
function catTag(c){return tag({seed:"b",fertilizer:"g",pesticide:"a",labour:"n",irrigation:"b",transport:"n",other:"n"}[c]||"n",CAT_LABEL[c]||c);}

/* ================= OVERVIEW ================= */
function vOverview(){
  const k=seasonKharif2026();
  const wk=weekData();
  const alerts=buildAlerts();
  const rows=cashFlow(14);
  const mandiStrip=Object.entries(DB.mandi).filter(([n,v])=>v&&typeof v==="object").map(([n,v])=>{
    const diff=Math.round((v.today-v.week)/v.week*100);
    return `<div class="kpi"><div class="lbl">${n} · ${v.source}</div><div class="val" style="font-size:1.15rem">₹${v.today.toLocaleString("en-IN")}<small> /qtl</small></div><div class="delta ${diff<=0?"down":"up"}">${diff>0?"▲":"▼"} ${Math.abs(diff)}% vs last week</div></div>`;
  }).join("");

  el("#view").innerHTML=`
  <div class="page-head">
    <div><h1>${esc(DB.farmer.nameMr||DB.farmer.name)} — kharif 2026, ${DB.farmer.totalAcres} acres</h1>
    <div class="lede">${esc(DB.farmer.village)} · ${DB.crops.filter(c=>c.status==="standing").length} crops standing · season ends with cotton picking in Jan</div></div>
    <div class="page-actions">
      <button class="btn primary" onclick="addEntryModal('expense')">+ ${t("addExpense")}</button>
      <button class="btn" onclick="addEntryModal('sale')">+ ${t("addSale")}</button>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="lbl">Spent — kharif so far</div><div class="val">${inr(k.spent)}</div><div class="delta mut">${Math.round(k.spent/k.totalCost*100)}% of season budget ${inrShort(k.totalCost)}</div></div>
    <div class="kpi"><div class="lbl">Sales money in</div><div class="val">${inr(k.gross-k.pending)}</div><div class="delta mut">of ${inrShort(k.gross)} billed</div></div>
    <div class="kpi"><div class="lbl">Pending with buyers</div><div class="val" style="color:var(--amber)">${inr(k.pending)}</div><div class="delta mut">due ${fmtDate("2026-11-05")} · Pune Fruits</div></div>
    <div class="kpi"><div class="lbl">Projected season profit</div><div class="val ${k.projectedProfit>0?"":"down"}">${inr(k.projectedProfit)}</div><div class="delta down">▼ 22% vs sowing-time estimate</div></div>
  </div>

  <div class="grid g2">
    <div class="card">
      <h3>Needs attention</h3><div class="sub">auto-checked every morning from your ledger</div>
      ${alerts.slice(0,3).map(a=>`<div class="alert ${a.sev}"><div class="ic">${a.sev==="high"?"▲":a.sev==="med"?"●":"○"}</div>
        <div><b>${esc(a.title)}</b><span class="small mut">${esc(a.body)}</span></div>
        <button class="btn sm act" onclick="nav('${a.act==="Compare buyers"?"crops":a.act==="See cash flow"?"cash":"udhaar"}')">${esc(a.act)}</button></div>`).join("")}
      <div class="right mt"><a href="#" onclick="nav('coach');return false" style="font-size:.82rem">All ${alerts.length} signals → Profit coach</a></div>
    </div>

    <div class="card">
      <h3>Next 14 days — money</h3><div class="sub">green in, brown out; balance after each event</div>
      ${rows.filter(r=>r.in.length||r.out.length).map(r=>`
        <div class="spread" style="padding:7px 0;border-bottom:1px solid var(--line)">
          <div style="flex:1"><b class="small">${r.d}</b>
            ${r.in.map(i=>`<div class="small up">+ ${esc(i.lbl)} <b class="num">${inrShort(i.amt)}</b></div>`).join("")}
            ${r.out.map(o=>`<div class="small down">− ${esc(o.lbl)} <b class="num">${inrShort(o.amt)}</b></div>`).join("")}
          </div>
          <div class="num small mut">bal. ${inrShort(r.bal)}</div>
        </div>`).join("")||'<div class="empty">No scheduled money events in 14 days</div>'}
    </div>
  </div>

  <div class="card mt">
    <div class="spread"><h3>Crop-wise profit — kharif 2026 (projected at today’s rates)</h3>
    <a href="#" onclick="nav('crops');return false" class="small">${t("viewAll")} →</a></div>
    <div class="chart mt">
      ${k.crops.map(c=>{const x=cropCalc(c);const p=x.expectedRevenue-x.totalCost;const max=Math.max(...k.crops.map(y=>{const z=cropCalc(y);return z.expectedRevenue-z.totalCost;}));return `
        <div class="col"><div class="v">${inrShort(p)}</div><div class="b" style="height:${Math.max(6,p/max*100)}%" title="${esc(c.name)}"></div><div class="x">${esc(c.name.split(" ")[0])}<br><span class="mut">${x.crop.acres} acre</span></div></div>`;}).join("")}
    </div>
  </div>

  <div class="mt" style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px" id="mandiStrip">${mandiStrip}</div>
  `;
  el("#topbarTitle").textContent=t("navHome");
}
function weekData(){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);
  const iso=cutoff.toISOString().slice(0,10);
  const spent=DB.expenses.filter(e=>e.date>=iso).reduce((a,e)=>a+e.amt,0);
  const got=DB.sales.filter(s=>s.date>=iso).reduce((a,s)=>a+s.received,0);
  return{spent,got};
}

/* ================= LEDGER ================= */
let ledgerFilter={type:"all",crop:"all",q:""};
function vLedger(){
  el("#view").innerHTML=`
  <div class="page-head">
    <div><h1>${t("navLedger")}</h1><div class="lede">Every rupee in and out — from voice notes, bills and manual entries. Searchable by crop, plot, supplier.</div></div>
    <div class="page-actions">
      <button class="btn primary" onclick="addEntryModal('expense')">+ Expense</button>
      <button class="btn" onclick="addEntryModal('sale')">+ Sale</button>
    </div>
  </div>
  <div class="chip-row">
    ${["all","expense","sale"].map(x=>`<button class="chip ${ledgerFilter.type===x?"on":""}" onclick="ledgerFilter.type='${x}';renderView()">${x[0].toUpperCase()+x.slice(1)}</button>`).join("")}
    <span style="flex:1"></span>
    <select class="f" style="width:auto" onchange="ledgerFilter.crop=this.value;renderView()">
      <option value="all">All crops</option>
      ${DB.crops.map(c=>`<option ${ledgerFilter.crop===c.id?"selected":""} value="${c.id}">${esc(c.name)} — ${esc(c.season)}</option>`).join("")}
    </select>
    <input class="f" style="width:210px" placeholder="Search item, supplier…" value="${esc(ledgerFilter.q)}" oninput="ledgerFilter.q=this.value;renderView()">
  </div>
  <div class="card" style="padding:6px 14px">${ledgerTable()}</div>
  <div class="small mut mt" style="text-align:center">${DB.expenses.length} expense entries · ${DB.sales.length} sale entries · edits are logged with time and source</div>`;
  el("#topbarTitle").textContent=t("navLedger");
}
function ledgerTable(){
  let rows=[];
  if(ledgerFilter.type!=="sale") DB.expenses.forEach(e=>rows.push({d:e.date,type:"expense",ref:e}));
  if(ledgerFilter.type!=="expense") DB.sales.forEach(s=>rows.push({d:s.date,type:"sale",ref:s}));
  rows=rows.filter(r=>(ledgerFilter.crop==="all"||r.ref.cropId===ledgerFilter.crop))
    .filter(r=>!ledgerFilter.q||JSON.stringify(r.ref).toLowerCase().includes(ledgerFilter.q.toLowerCase()))
    .sort((a,b)=>b.d<a.d?-1:1);
  if(!rows.length)return '<div class="empty">Nothing matches. Clear the search or add an entry.</div>';
  return `<table class="tbl"><tr><th>Date</th><th>What</th><th>Crop / plot</th><th>Paid by / buyer</th><th>Mode</th><th class="r">Amount</th></tr>
  ${rows.slice(0,60).map(r=>{
    if(r.type==="expense"){const e=r.ref;return `<tr>
      <td class="num">${fmtDate(e.date)}</td>
      <td>${catTag(e.cat)} <div class="small" style="margin-top:2px">${esc(e.desc)}</div></td>
      <td class="small">${esc(cropName(e.cropId))}<br><span class="mut">${esc(plotName(e.plotId))}</span></td>
      <td class="small">${esc(e.paidBy==="self"?"Ramesh":e.paidBy)}<br><span class="mut">${esc(e.supplier)}</span></td>
      <td>${tag({cash:"n",upi:"b",udhaar:"a",pending:"r"}[e.mode]||"n",e.mode)}</td>
      <td class="r down num">−${inr(e.amt)}</td></tr>`;}
    const s=r.ref;return `<tr>
      <td class="num">${fmtDate(s.date)}</td>
      <td>${tag("g","sale")} <div class="small" style="margin-top:2px">${esc(cropName(s.cropId))} — ${s.qty} qtl @ ${inr(s.price)}</div></td>
      <td class="small">${esc(s.market)}</td>
      <td class="small">${esc(s.buyer)}${s.pending?`<br><span class="mut">pending ${inr(s.pending)} due ${fmtDate(s.due)}</span>`:""}</td>
      <td>${s.pending?tag("a","part-paid"):tag("g","paid")}</td>
      <td class="r up num">+${inr(s.qty*s.price)}</td></tr>`;
  }).join("")}</table>`;
}

function addEntryModal(kind){
  openModal(`<h3>${kind==="expense"?"Add expense":"Add sale"}</h3>
  <div class="small mut">Fields marked * are what the app reads from a bill photo or a spoken note — same form, so nothing to learn twice.</div>
  <div class="form-grid">
    <div><label class="fl">Date *</label><input class="f" id="fDate" type="date" value="${todayISO()}"></div>
    <div><label class="fl">${kind==="expense"?"Category *":"Crop sold *"}</label>
      ${kind==="expense"
        ?`<select class="f" id="fCat">${Object.entries(CAT_LABEL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>`
        :`<select class="f" id="fCropSale">${DB.crops.filter(c=>c.status!=="planned").map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>`}
    </div>
    ${kind==="expense"?`
    <div><label class="fl">Crop</label><select class="f" id="fCrop"><option value="">— none / household —</option>${DB.crops.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>
    <div><label class="fl">Plot</label><select class="f" id="fPlot">${DB.plots.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
    <div><label class="fl">Supplier</label><input class="f" id="fSup" placeholder="Vithal Krishi Seva Kendra"></div>
    <div><label class="fl">Paid by</label><select class="f" id="fBy"><option value="self">Ramesh</option>${DB.farmer.family.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join("")}</select></div>
    <div><label class="fl">Mode</label><select class="f" id="fMode"><option value="cash">Cash</option><option value="upi">UPI</option><option value="udhaar">Udhaar (credit)</option><option value="pending">Wage pending</option></select></div>`
    :`
    <div><label class="fl">Quantity (qtl) *</label><input class="f" id="fQty" type="number" step="0.1"></div>
    <div><label class="fl">Rate (₹/qtl) *</label><input class="f" id="fPrice" type="number"></div>
    <div><label class="fl">Buyer</label><input class="f" id="fBuyer" placeholder="Ganesh Traders"></div>
    <div><label class="fl">Mandi / market</label><input class="f" id="fMarket" placeholder="Moshi (Pune)"></div>
    <div><label class="fl">Transport cost</label><input class="f" id="fTrans" type="number" value="1300"></div>
    <div><label class="fl">Received now (₹)</label><input class="f" id="fRecv" type="number"></div>`}
    <div><label class="fl">Amount (₹) *</label><input class="f" id="fAmt" type="number"></div>
  </div>
  <div class="small mut mt" id="fPreview"></div>
  <div class="mt" style="display:flex;gap:8px;justify-content:flex-end">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveEntry('${kind}')">${t("save")}</button>
  </div>`);
  const amt=el("#fAmt"),prev=el("#fPreview");
  amt.addEventListener("input",()=>{prev.textContent=amt.value?("Will record as "+inr(+amt.value)+(kind==="expense"?" expense":" sale")+"."):"";});
}
function saveEntry(kind){
  const g=id=>el("#f"+id).value;
  if(kind==="expense"){
    if(!g("Amt"))return toast("Amount is required");
    DB.expenses.unshift({id:"e"+Date.now(),date:g("Date"),cat:g("Cat"),cropId:g("Crop"),plotId:g("Plot"),amt:+g("Amt"),desc:g("Sup")||CAT_LABEL[g("Cat")]+" purchase",supplier:g("Sup")||"—",paidBy:g("By"),mode:g("Mode"),source:"manual"});
    toast("Expense saved — "+inr(+g("Amt")));
  }else{
    const qty=+g("Qty"),price=+g("Price"),recv=+g("Recv")||0,total=qty*price;
    DB.sales.unshift({id:"s"+Date.now(),date:g("Date"),cropId:g("CropSale"),qty,price,buyer:g("Buyer")||"Walk-in",market:g("Market")||"—",transport:+g("Trans")||0,received:Math.min(recv,total),pending:Math.max(0,total-recv),due:Math.max(0,total-recv)?todayISO():null,note:""});
    toast("Sale saved — "+inr(total));
  }
  save();closeModal();renderView();
}

/* ================= CROPS ================= */
let sensCrop="c1", sensVal=0;
function vCrops(){
  const k=seasonKharif2026();
  const c=cropCalc(DB.crops.find(x=>x.id===sensCrop));
  el("#view").innerHTML=`
  <div class="page-head">
    <div><h1>${t("navCrops")}</h1><div class="lede">Cost per acre, break-even price and profit — crop by crop, plot by plot. Numbers move as the ledger moves.</div></div>
    <button class="btn" onclick="compareModal()">Which crop is better?</button>
  </div>

  <div class="grid g3">
    ${k.crops.map(c=>cropCard(cropCalc(c))).join("")}
    <div class="card" style="background:#f3f0e6">
      <h3>Previous season</h3><div class="sub">Rabi 2025-26 · wheat, 2 acres</div>
      ${(()=>{const w=cropCalc(DB.crops[3]);return `
      <div class="bar-row"><div class="nm">Cost</div><div class="tr"><div class="fl" style="width:100%;background:#a89a7a"></div></div><div class="vv">${inrShort(w.spent)}</div></div>
      <div class="bar-row"><div class="nm">Revenue</div><div class="tr"><div class="fl" style="width:100%;background:#2e5d3f"></div></div><div class="vv">${inrShort(w.gross)}</div></div>
      <div class="bar-row"><div class="nm">Profit</div><div class="tr"><div class="fl" style="width:${Math.round(w.gross?w.spent/w.gross*100:0)}%;background:#8a3b2e"></div></div><div class="vv"><b>${inrShort(w.gross-w.spent)}</b></div></div>
      <div class="small mut mt">₹${Math.round(w.spent/2).toLocaleString("en-IN")}/acre cost · sold @ ₹2,350 · closed Mar 2026</div>`;})()}
    </div>
  </div>

  <div class="card mt">
    <h3>Expense mix — ${esc(c.crop.name)}</h3><div class="sub">where the money actually went</div>
    <div class="g2 grid">
      <div>${Object.entries(c.byCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`
        <div class="bar-row"><div class="nm">${CAT_LABEL[cat]}</div>
        <div class="tr"><div class="fl" style="width:${Math.round(amt/c.spent*100)}%;background:${{seed:"#4f7d9d",fertilizer:"#2e5d3f",pesticide:"#9a6b1f",labour:"#8a3b2e",irrigation:"#5a7a5a",transport:"#6b6455",other:"#8b877a"}[cat]}"></div></div>
        <div class="vv">${inr(amt)}</div></div>`).join("")}
      </div>
      <div>
        <table class="tbl small">
        <tr><th></th><th class="r">Per acre</th><th class="r">Total</th></tr>
        <tr><td>Cost</td><td class="r num">${inr(Math.round(c.costPerAcre))}</td><td class="r num">${inr(c.spent)}</td></tr>
        <tr><td>Break-even price</td><td class="r num" colspan="2"><b>${inr(Math.round(c.breakEven))}</b> /qtl <span class="mut">(cost ÷ ${c.crop.expectedYieldQtl} qtl)</span></td></tr>
        <tr><td>Sold so far</td><td class="r num">${c.qtySold} qtl @ ${c.avgPrice?inr(Math.round(c.avgPrice)):"—"}</td><td class="r num">${inr(c.gross)}</td></tr>
        <tr class="tot"><td>Projected profit</td><td class="r num">${inr(Math.round((c.expectedRevenue-c.totalCost)/c.crop.acres))}</td><td class="r num">${inr(c.expectedRevenue-c.totalCost)}</td></tr>
        </table>
        <label class="fl">Price sensitivity — what if the rate moves?</label>
        <input type="range" min="-50" max="30" value="${sensVal}" style="width:100%" oninput="sensVal=+this.value;sensUpdate()">
        <div class="small" id="sensOut" style="line-height:1.7;margin-top:6px"></div>
      </div>
    </div>
  </div>
  <div class="chip-row">${DB.crops.filter(x=>x.status!=="planned").map(x=>`<button class="chip ${sensCrop===x.id?"on":""}" onclick="sensCrop='${x.id}';sensVal=0;renderView()">${esc(x.name)}</button>`).join("")}</div>`;
  el("#topbarTitle").textContent=t("navCrops");
  sensUpdate();
}
function cropCard(x){
  const p=x.expectedRevenue-x.totalCost;
  const aboveBE=DB.mandi[(x.crop.name.split(" ")[0].toLowerCase())];
  const bePct=aboveBE?Math.round((aboveBE.today-x.breakEven)/x.breakEven*100):null;
  return `<div class="card">
    <div class="spread"><h3>${esc(x.crop.name)}</h3>${tag(x.crop.status==="harvested"||x.crop.status==="closed"?"n":"g",x.crop.status)}</div>
    <div class="sub">${esc(x.crop.season)} · ${esc(plotName(x.crop.plotId))} · ${x.crop.acres} acres · ${esc(x.crop.stage)}</div>
    <div style="font-family:var(--serif);font-size:1.6rem" class="${p>=0?"up":"down"}">${inr(p)}</div>
    <div class="small mut">projected profit (${x.crop.status==="closed"?"realized":"at today’s rates"})</div>
    <div class="mt small" style="line-height:2">
      <div class="spread"><span class="mut">Spent</span><b class="num">${inr(x.spent)}</b></div>
      <div class="spread"><span class="mut">Cost / acre</span><span class="num">${inr(Math.round(x.costPerAcre))}</span></div>
      <div class="spread"><span class="mut">Break-even</span><b class="num">${inr(Math.round(x.breakEven))}/qtl</b></div>
      <div class="spread"><span class="mut">Sold / pending</span><span class="num">${x.qtySold} qtl · ${inrShort(x.pending)} pending</span></div>
    </div>
    ${bePct!==null?`<div class="meter"><i style="width:${Math.max(4,Math.min(100,50+bePct/2))}%;background:${bePct>=0?"var(--green)":"var(--red)"}"></i></div>
    <div class="small ${bePct>=0?"up":"down"}" style="margin-top:4px">Mandi ₹${aboveBE.today.toLocaleString("en-IN")} is ${Math.abs(bePct)}% ${bePct>=0?"above":"below"} break-even</div>`:""}
  </div>`;
}
function sensUpdate(){
  const o=el("#sensOut");if(!o)return;
  const c=cropCalc(DB.crops.find(x=>x.id===sensCrop));
  const price=c.crop.expectedPrice*(1+sensVal/100);
  const profit=c.crop.expectedYieldQtl*price-c.totalCost;
  o.innerHTML=`At <b>${inr(Math.round(price))}/qtl</b> (${sensVal>0?"+":""}${sensVal}%): profit becomes <b class="${profit>=0?"up":"down"}">${inr(Math.round(profit))}</b>.${profit<0?" — below total cost, would suggest not selling in panic but storing/tying up a buyer.":""}${sensVal<=-30&&profit>0?" — thin margin, watch cost overrun.":""}`;
}
function compareModal(){
  const list=DB.crops.filter(x=>x.status!=="planned").map(x=>cropCalc(x));
  const rows=list.map(x=>{
    const profit=x.expectedRevenue-x.totalCost;
    return `<tr><td>${esc(x.crop.name)}<br><span class="mut small">${esc(x.crop.season)}</span></td>
    <td class="r num">${inrShort(x.totalCost)}</td>
    <td class="r num">${inrShort(x.crop.expectedRevenue)}</td>
    <td class="r num"><b class="${profit>=0?"up":"down"}">${inr(Math.round(profit/x.crop.acres))}</b></td>
    <td class="r num">${inr(Math.round(x.breakEven))}</td>
    <td class="r num">${inrShort(x.totalCost)}</td>
    <td>${x.crop.name.includes("Wheat")?tag("g","low"):x.crop.name.includes("Tomato")?tag("r","high"):tag("a","medium")}</td></tr>`;}).join("");
  openModal(`<h3>Which crop is better — for YOU?</h3>
  <div class="small mut">Not textbook averages. Every number below is from your own plots and bills.</div>
  <table class="tbl mt"><tr><th>Crop</th><th class="r">Total cost</th><th class="r">Expected income</th><th class="r">Profit/acre</th><th class="r">Break-even</th><th class="r">Cash needed</th><th>Risk</th></tr>${rows}</table>
  <div class="small mt" style="line-height:1.7">Reading: <b>wheat</b> earned you ₹33,000/acre last rabi with near-zero price risk — the "safe" crop. <b>Tomato</b> is 4× the profit per acre but ate ${inrShort(list[0].totalCost)} of working capital and is exposed to the 32% price fall. <b>Soybean</b> was the quiet winner this kharif: ${inrShort(cropCalc(DB.crops[2]).profitRealized)} realized, money already in the bank.<br><br>Suggestion for rabi: keep wheat on the leased plot (guaranteed cash for the KCC repayment) and decide tomato acreage only after the Pune Fruits payment clears.</div>
  <div class="mt right"><button class="btn primary" onclick="closeModal()">Got it</button></div>`);
}

/* ================= CASH FLOW ================= */
function vCash(){
  const rows=cashFlow(90);
  const gap=findGap(rows);
  const onHand=cashOnHand();
  const in30=rows.slice(0,30).reduce((a,r)=>a+r.in.reduce((x,i)=>x+i.amt,0)-r.out.reduce((x,o)=>x+o.amt,0),0);
  const out30=rows.slice(0,30).reduce((a,r)=>a+r.out.reduce((x,o)=>x+o.amt,0),0);
  const in60=rows.slice(0,60), in90=rows.slice(0,90);
  const bucket=arr=>({i:arr.reduce((a,r)=>a+r.in.reduce((x,y)=>x+y.amt,0),0),o:arr.reduce((a,r)=>a+r.out.reduce((x,y)=>x+y.amt,0),0),end:arr[arr.length-1].bal});
  const b60=bucket(in60),b90=bucket(in90);
  const wk=weekData();
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navCash")}</h1><div class="lede">Not bookkeeping — this answers "will there be money on the 5th of November?" 30/60/90-day projection from your receivables, udhaar, EMIs and expected harvest sales.</div></div></div>

  <div class="kpis">
    <div class="kpi"><div class="lbl">Cash on hand</div><div class="val">${inr(onHand)}</div><div class="delta mut">cash box + bank balance estimate</div></div>
    <div class="kpi"><div class="lbl">${t("thisWeek")}</div><div class="val"><span class="up">+${inrShort(wk.got)}</span> <span class="mut">/</span> <span class="down">−${inrShort(wk.spent)}</span></div><div class="delta mut">received / spent, last 7 days</div></div>
    <div class="kpi"><div class="lbl">30-day net</div><div class="val ${in30>=0?"up":"down"}">${inr(in30)}</div><div class="delta mut">outflow ${inrShort(out30)} scheduled</div></div>
    <div class="kpi"><div class="lbl">Cash-gap warning</div><div class="val" style="font-size:1.1rem;color:${gap?"var(--red)":"var(--green)"}">${gap?"Around "+gap.d:"None in 90 days"}</div><div class="delta mut">${gap?"tight if buyer payment slips":"receivables cover all obligations"}</div></div>
  </div>

  ${gap?`<div class="alert high"><div class="ic">▲</div><div><b>Tight window: ${gap.d}</b><span class="small">Udhaar to Vithal Seva Kendra (${inr(14600)}, due ${fmtDate("2026-11-15")}) and diesel pump (${inr(4400)}) land before the Pune Fruits payment clears. Options: request 10-day extension from the dealer (they usually agree before Diwali), or part-pay ${inr(7000)} and carry the rest.</span></div></div>`:""}

  <div class="card">
    <h3>Projection — balance after every scheduled event</h3><div class="sub">expected sale income counted at 85% of projection (safety margin)</div>
    <div class="chart" style="height:190px">
      ${weeklyBars(rows).map(w=>`<div class="col"><div class="v">${inrShort(w.bal)}</div><div class="b ${w.bal<0?"neg":""}" style="height:${Math.max(5,Math.min(100,w.bal/4200))}%"></div><div class="x">${w.lbl}</div></div>`).join("")}
    </div>
    <div class="legend"><span><i style="background:#efece2"></i>expected sale income, less Udhaar/EMI/wages and planned rabi inputs</span></div>
  </div>

  <div class="grid g3 mt">
    ${[[30,"30 days",in30,bucket(rows.slice(0,30))],[60,"60 days",b60.i-b60.o,b60],[90,"90 days",b90.i-b90.o,b90]].map(([d,l,net,b])=>`
    <div class="card"><h3>${l}</h3><div class="sub">through ${rows[d-1].d}</div>
      <div class="spread small"><span class="mut">Money in</span><b class="num up">+${inrShort(b.i)}</b></div>
      <div class="spread small"><span class="mut">Money out</span><b class="num down">−${inrShort(b.o)}</b></div>
      <div class="spread small" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>Net</span><b class="num ${net>=0?"up":"down"}">${inr(Math.round(net))}</b></div>
      <div class="spread small"><span class="mut">Balance at day ${d}</span><b class="num">${inrShort(b.end)}</b></div>
    </div>`).join("")}
  </div>

  <div class="card mt">
    <h3>Scheduled events</h3><div class="sub">tap any to mark paid / renegotiate</div>
    <table class="tbl">${rows.filter(r=>r.in.length||r.out.length).map(r=>`
      <tr><td class="num" style="white-space:nowrap">${r.d}</td>
      <td>${r.in.map(i=>`<div class="up small">+ ${esc(i.lbl)}</div>`).join("")}${r.out.map(o=>`<div class="down small">− ${esc(o.lbl)}</div>`).join("")}</td>
      <td class="r"><button class="btn sm" onclick="toast('Demo — would open the linked record and mark it settled')">Mark handled</button></td></tr>`).join("")||'<tr><td class="mut">Nothing scheduled in 90 days</td></tr>'}
    </table>
  </div>`;
  el("#topbarTitle").textContent=t("navCash");
}
function weeklyBars(rows){
  const out=[];for(let w=0;w<13;w++){const seg=rows.slice(w*7,w*7+7);if(!seg.length)break;
    out.push({lbl:w===0?"this wk":"+"+w+" wk",bal:seg[seg.length-1].bal});}
  return out;
}

/* ================= COACH ================= */
function vCoach(){
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navCoach")}</h1><div class="lede">Reads your own ledger — not generic farming tips. Every answer cites your numbers.</div></div></div>
  <div class="grid g2" style="align-items:start">
    <div class="card" style="min-height:420px">
      <div id="chat" style="max-height:460px;overflow-y:auto">
        <div class="bubble a">${coachAnswer("overview")}</div>
      </div>
      <div class="chip-row">
        ${["Why is profit less this season?","Wheat vs tomato — which is better?","How to cut costs?","Cash position?"].map(q=>`<button class="chip" onclick="ask('${q}')">${q}</button>`).join("")}
      </div>
      <div class="flex mt">
        <input class="f" id="coachIn" placeholder="Ask anything about your money…" onkeydown="if(event.key==='Enter')ask(this.value)">
        <button class="btn primary" onclick="ask(el('#coachIn').value)">Ask</button>
      </div>
    </div>
    <div>
      <div class="card">
        <h3>This season’s top cost drivers</h3><div class="sub">kharif 2026, all crops</div>
        ${topCostDrivers()}
      </div>
      <div class="card mt">
        <h3>Season vs season</h3><div class="sub">like-for-like, kharif 2025 vs kharif 2026</div>
        ${seasonCompare()}
      </div>
    </div>
  </div>`;
  el("#topbarTitle").textContent=t("navCoach");
}
function ask(q){if(!q.trim())return;
  const box=el("#chat");
  box.insertAdjacentHTML("beforeend",`<div class="bubble q">${esc(q)}</div><div class="bubble a" id="thinking"><span class="mut">Reading your ledger…</span></div>`);
  box.scrollTop=box.scrollHeight;
  setTimeout(()=>{el("#thinking").outerHTML=`<div class="bubble a">${coachAnswer(q)}</div>`;box.scrollTop=box.scrollHeight;},650);
  el("#coachIn").value="";
}
function topCostDrivers(){
  const totals={};
  DB.expenses.filter(e=>e.cropId!=="c4").forEach(e=>totals[e.cat]=(totals[e.cat]||0)+e.amt);
  const tot=Object.values(totals).reduce((a,b)=>a+b,0);
  const colors={labour:"#8a3b2e",fertilizer:"#2e5d3f",seed:"#4f7d9d",pesticide:"#9a6b1f",transport:"#6b6455",irrigation:"#5a7a5a",other:"#8b877a"};
  return Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
    <div class="bar-row"><div class="nm">${CAT_LABEL[c]}</div><div class="tr"><div class="fl" style="width:${Math.round(v/tot*100)}%;background:${colors[c]}"></div></div><div class="vv">${inrShort(v)}</div></div>`).join("")+
    `<div class="small mut mt">Labour is 34% of spend — but it’s also why tomato picking stayed on schedule. The leak is <b>diesel (+₹2,300 vs last kharif)</b> and <b>extra pesticide rounds (+₹4,400)</b>.</div>`;
}
function seasonCompare(){
  return `<table class="tbl small">
    <tr><th></th><th class="r">Kharif 2025</th><th class="r">Kharif 2026</th></tr>
    <tr><td>Soybean cost/acre</td><td class="r num">${inr(8600)}</td><td class="r num">${inr(8950)} <span class="down">+4%</span></td></tr>
    <tr><td>Cotton pesticide</td><td class="r num">${inr(4000)}</td><td class="r num">${inr(8800)} <span class="down">+120%</span></td></tr>
    <tr><td>Tomato labour</td><td class="r num">${inr(21000)}</td><td class="r num">${inr(22200)} <span class="mut">+6%</span></td></tr>
    <tr><td>Tomato realized rate</td><td class="r num">${inr(1310)}</td><td class="r num">${inr(1043)} <span class="down">−20%</span></td></tr>
    <tr class="tot"><td>Season profit</td><td class="r num">${inr(238000)}</td><td class="r num">${inr(208000)} <span class="down">−13%</span></td></tr>
  </table><div class="small mut mt">Profit dip = price, not spending. Your controllable costs rose only 5.8%.</div>`;
}

/* ================= REMINDERS ================= */
function vReminders(){
  const open=DB.reminders.filter(r=>r.status==="open").sort((a,b)=>a.due<b.due?-1:1);
  const past=DB.reminders.filter(r=>r.status!=="open");
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navReminders")}</h1><div class="lede">Each reminder is tied to a crop and a money consequence. Reply below and the timeline updates — one follow-up only, then it stops nagging.</div></div></div>
  ${open.map(r=>`
  <div class="card" style="margin-bottom:12px">
    <div class="spread"><div><b>${esc(r.title)}</b>
      <div class="small mut" style="margin-top:3px">Due ${fmtDate(r.due)} (${daysUntil(r.due)===0?"today":daysUntil(r.due)+" days"})${r.cropId?" · "+esc(cropName(r.cropId)):""}</div></div>
      ${daysUntil(r.due)<0?tag("r","overdue"):daysUntil(r.due)<=2?tag("a","soon"):tag("n","scheduled")}
    </div>
    ${r.why?`<div class="small" style="margin:8px 0;background:#f6f3ea;border-radius:8px;padding:8px 12px">${esc(r.why)}</div>`:""}
    ${r.costLink?`<div class="small mut">Affects: ${esc(r.costLink)}</div>`:""}
    <div class="flex mt">
      <button class="btn primary sm" onclick="remAct('${r.id}','done')">${t("done")}</button>
      <button class="btn sm" onclick="remAct('${r.id}','postponed')">${t("postponed")} +3 days</button>
      <button class="btn sm" onclick="remAct('${r.id}','na')">${t("notApplicable")}</button>
    </div>
  </div>`).join("")}
  <h3 class="mt" style="font-family:var(--serif)">Handled / past</h3>
  <div class="card mt" style="padding:8px 18px">
  ${past.length?past.map(r=>`<div class="spread" style="padding:8px 0;border-bottom:1px solid var(--line)">
    <div><span class="small">${esc(r.title)}</span><div class="small mut">was due ${fmtDate(r.due)}</div></div>
    ${r.status==="done"?tag("g","done"):r.status==="postponed"?tag("a","postponed → "+fmtDate("2026-10-23")):tag("n","n/a")}</div>`).join(""):'<div class="empty mt">Nothing closed yet</div>'}
  </div>`;
  el("#topbarTitle").textContent=t("navReminders");
}
function remAct(id,act){
  const r=DB.reminders.find(x=>x.id===id);
  if(act==="done"){r.status="done";toast("Marked done — timeline & cost assumptions updated");}
  else if(act==="postponed"){r.status="postponed";r.due=new Date(new Date(r.due).getTime()+3*864e5).toISOString().slice(0,10);toast("Postponed 3 days — one follow-up will be sent, then it stops");}
  else{r.status="na";toast("Marked not applicable — removed from timeline");}
  save();renderApp();
}

/* ================= PEOPLE (labour & family) ================= */
function vPeople(){
  const wagePend=DB.expenses.filter(e=>e.mode==="pending").reduce((a,e)=>a+e.amt,0);
  const byWho={self:0};DB.farmer.family.forEach(f=>byWho[f.id]=0);
  DB.expenses.forEach(e=>{byWho[e.paidBy]=(byWho[e.paidBy]||0)+e.amt;});
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navPeople")}</h1><div class="lede">Who paid what, whose hands are pending, and the shared farm account — so there is no Sunday argument.</div></div>
  <button class="btn" onclick="toast('Demo — Sunita and Sunil can add entries from their own phones with OTP-less shared login')">Give family access</button></div>

  <div class="kpis" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi"><div class="lbl">Labour days this season</div><div class="val">${DB.labour.reduce((a,l)=>a+l.days,0)}</div><div class="delta mut">4 teams, avg ₹350/day</div></div>
    <div class="kpi"><div class="lbl">Wages pending</div><div class="val" style="color:var(--red)">${inr(wagePend)}</div><div class="delta mut">Sakhri tai ₹2,600 · Gaurabai ₹1,800</div></div>
    <div class="kpi"><div class="lbl">Shared account spend</div><div class="val">${inr(Object.entries(byWho).filter(([k])=>k!=="self").reduce((a,[,v])=>a+v,0))}</div><div class="delta mut">by Sunita, Sunil & Amit</div></div>
  </div>

  <div class="grid g2">
    <div class="card"><h3>Labour book</h3><div class="sub">crop-linked, so cost per acre stays true</div>
      <table class="tbl"><tr><th>Team</th><th>Crop</th><th class="r">Days</th><th class="r">Paid</th><th class="r">Pending</th></tr>
      ${DB.labour.map(l=>`<tr><td><b>${esc(l.name)}</b><br><span class="mut small">${esc(l.note)}</span></td>
      <td class="small">${esc(cropName(l.cropId))}</td><td class="r num">${l.days}</td>
      <td class="r num up">${inr(l.paid)}</td><td class="r num">${l.pending?`<b class="down">${inr(l.pending)}</b><br><button class="btn sm mt" style="margin-top:4px" onclick="payWage('${l.id}')">Pay now</button>`:"—"}</td></tr>`).join("")}
      <tr class="tot"><td colspan="3">Total</td><td class="r num">${inr(DB.labour.reduce((a,l)=>a+l.paid,0))}</td><td class="r num">${inr(DB.labour.reduce((a,l)=>a+l.pending,0))}</td></tr></table>
    </div>
    <div class="card"><h3>Family contributions</h3><div class="sub">shared farm account, this season</div>
      <table class="tbl"><tr><th>Who</th><th>Can add records?</th><th class="r">Paid so far</th></tr>
      <tr><td><b>Ramesh (self)</b></td><td>${tag("g","owner")}</td><td class="r num">${inr(byWho.self)}</td></tr>
      ${DB.farmer.family.map(f=>`<tr><td><b>${esc(f.name)}</b> <span class="mut small">${esc(f.relation)}</span></td>
      <td>${f.canAdd?tag("b","can add"):tag("n","view only")}</td><td class="r num">${inr(byWho[f.id]||0)}</td></tr>`).join("")}
      </table>
      <div class="small mut mt">e.g. diesel refills were paid by Sunita (₹4,400 udhaar at pump), seedlings by Sunil — all counted inside crop cost automatically.</div>
    </div>
  </div>`;
  el("#topbarTitle").textContent=t("navPeople");
}
function payWage(id){
  const l=DB.labour.find(x=>x.id===id);if(!l||!l.pending)return;
  openModal(`<h3>Pay ${esc(l.name)}</h3><div class="mt">Pending wages: <b>${inr(l.pending)}</b></div>
  <div class="small mut mt">This clears the matching "wage pending" ledger entries for ${esc(cropName(l.cropId))}.</div>
  <div class="mt right"><button class="btn" onclick="closeModal()">Cancel</button>
  <button class="btn primary" onclick="doPayWage('${id}')">Confirm ${inr(l.pending)}</button></div>`);
}
function doPayWage(id){
  const l=DB.labour.find(x=>x.id===id);l.paid+=l.pending;
  DB.expenses.forEach(e=>{if(e.cropId===l.cropId&&e.mode==="pending")e.mode="cash";});
  save();closeModal();toast("Paid "+inr(l.paid>l.pending?l.pending:l.paid)+" — wages cleared");renderView();
}

/* ================= UDHAAR ================= */
function vUdhaar(){
  const owe=DB.udhaar.filter(u=>u.dir==="owe"),recv=DB.udhaar.filter(u=>u.dir==="receivable");
  const oweT=owe.reduce((a,u)=>a+u.amt,0),recvT=recv.reduce((a,u)=>a+u.amt,0);
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navUdhaar")}</h1><div class="lede">Two sides of credit: what the dealer is owed by you, and what buyers owe you. Both flow into the cash-flow forecast automatically.</div></div>
  <button class="btn primary" onclick="addUdhaarModal()">+ Udhaar entry</button></div>

  <div class="kpis" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi"><div class="lbl">You owe (dealers)</div><div class="val down">${inr(oweT)}</div><div class="delta mut">3 parties · next ${fmtDate(owe.sort((a,b)=>a.due<b.due?-1:1)[0].due)}</div></div>
    <div class="kpi"><div class="lbl">Buyers owe you</div><div class="val up">${inr(recvT)}</div><div class="delta mut">due ${fmtDate("2026-11-05")}</div></div>
    <div class="kpi"><div class="lbl">Net credit position</div><div class="val">${inr(recvT-oweT)}</div><div class="delta up">receivables cover dues 2.4×</div></div>
  </div>

  <div class="grid g2">
    <div class="card"><h3>Udhaar taken (dealer khata)</h3><div class="sub">the notebook the dealer keeps — now yours too</div>
      <table class="tbl"><tr><th>Party</th><th class="r">Amount</th><th>Due</th><th></th></tr>
      ${owe.map(u=>`<tr><td><b>${esc(u.party)}</b><br><span class="mut small">${esc(u.note)}</span></td>
        <td class="r num"><b>${inr(u.amt)}</b></td><td class="small">${fmtDate(u.due)}</td>
        <td class="r"><button class="btn sm" onclick="settleUdhaar('${u.id}')">Repay</button></td></tr>`).join("")}
      </table></div>
    <div class="card"><h3>Credit given to buyers</h3><div class="sub">part-paid sale lots</div>
      <table class="tbl"><tr><th>Buyer</th><th class="r">Amount</th><th>Due</th><th></th></tr>
      ${recv.map(u=>`<tr><td><b>${esc(u.party)}</b><br><span class="mut small">${esc(u.note)}</span></td>
        <td class="r num"><b class="up">${inr(u.amt)}</b></td><td class="small">${fmtDate(u.due)}</td>
        <td class="r"><button class="btn sm" onclick="toast('Demo — would log a follow-up call reminder')">Follow up</button></td></tr>`).join("")}
      </table></div>
  </div>
  <div class="small mut mt">Udhaar obligations are already inside the 30/60/90-day cash projection — no double counting.</div>`;
  el("#topbarTitle").textContent=t("navUdhaar");
}
function settleUdhaar(id){
  const u=DB.udhaar.find(x=>x.id===id);
  openModal(`<h3>Repay ${esc(u.party)}</h3><div class="mt">Outstanding: <b>${inr(u.amt)}</b> · due ${fmtDate(u.due)}</div>
  <div class="small mut mt">Cash position after repayment will be reflected in the forecast immediately.</div>
  <div class="mt right"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="doSettle('${id}')">Confirm payment</button></div>`);
}
function doSettle(id){
  const u=DB.udhaar.find(x=>x.id===id);u.amt=0;u.note+=" (settled "+fmtDate(todayISO())+")";
  save();closeModal();toast("Repayment recorded");renderView();
}
function addUdhaarModal(){
  openModal(`<h3>Add udhaar entry</h3>
  <label class="fl">Party *</label><input class="f" id="uParty" placeholder="Dealer or buyer name">
  <label class="fl">Direction</label><select class="f" id="uDir"><option value="owe">We owe them</option><option value="receivable">They owe us</option></select>
  <label class="fl">Amount (₹) *</label><input class="f" id="uAmt" type="number">
  <label class="fl">Repay by</label><input class="f" id="uDue" type="date" value="2026-11-30">
  <div class="mt right"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="doAddUdhaar()">Save</button></div>`);
}
function doAddUdhaar(){
  const p=el("#uParty").value,a=el("#uAmt").value;
  if(!p||!a)return toast("Party and amount lagtat");
  DB.udhaar.push({id:"u"+Date.now(),party:p,kind:"dealer",dir:el("#uDir").value,amt:+a,opened:todayISO(),due:el("#uDue").value,note:"Added manually",settled:0});
  save();closeModal();toast("Udhaar entry added");renderView();
}

/* ================= REPORTS ================= */
function vReports(){
  const f=DB.farmer,k=seasonKharif2026(),cs=creditScore(),w=cropCalc(DB.crops[3]);
  const recv=DB.udhaar.filter(u=>u.dir==="receivable").reduce((a,u)=>a+u.amt,0);
  const cf30=cashFlow(30),cf60=cashFlow(60),cf90=cashFlow(90);
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navReports")}</h1><div class="lede">A one-page summary a bank officer actually reads. Credit-readiness support — <b>not</b> a loan guarantee.</div></div>
  <div class="page-actions">
    <button class="btn primary" onclick="window.print()">⬇ Download PDF</button>
    <button class="btn" onclick="shareReport()">Share with FPO / bank</button>
  </div></div>

  <div class="report" id="reportPage">
    <div class="head">
      <div><h1>KhetKhata · Farm Financial Summary</h1>
      <div class="small">Credit-readiness statement · prepared ${fmtDate(todayISO())} · ref KTR-${DB.farmer.phone.slice(-5)}</div></div>
      <div class="right small"><b>${esc(f.name)}</b><br>${esc(f.village)}, ${esc(f.district)}, ${esc(f.state)}<br>${esc(f.phone)} · ${esc(f.fpo)}</div>
    </div>

    <h2>1 · Farm profile</h2>
    <table><tr>
      <td>Land: <b>${f.totalAcres} acres</b> (${f.ownedAcres} owned, ${f.leasedAcres} leased @ ${inr(9000)}/season)</td>
      <td>Irrigation: drip + river pump</td><td>Farming since 2009</td></tr></table>

    <h2>2 · Season performance — Kharif 2026</h2>
    <table><tr><th>Crop</th><th>Plot</th><th class="r">Acres</th><th class="r">Cost</th><th class="r">Revenue (proj.)</th><th class="r">Profit (proj.)</th><th class="r">Profit/acre</th></tr>
    ${k.crops.map(c=>{const x=cropCalc(c);const p=x.expectedRevenue-x.totalCost;return `<tr><td>${esc(c.name)}</td><td>${esc(plotName(c.plotId))}</td><td class="r">${c.acres}</td><td class="r">${inr(x.totalCost)}</td><td class="r">${inr(x.expectedRevenue)}</td><td class="r ${p>=0?"":"neg"}">${inr(p)}</td><td class="r">${inr(Math.round(p/c.acres))}</td></tr>`;}).join("")}
    <tr class="tot"><td colspan="3">Season total</td><td class="r">${inr(k.totalCost)}</td><td class="r">${inr(k.expRev)}</td><td class="r">${inr(k.projectedProfit)}</td><td class="r">${inr(Math.round(k.projectedProfit/f.totalAcres))}</td></tr></table>
    <div class="small mut" style="margin-top:5px">History: Rabi 2025-26 wheat — cost ${inr(w.spent)}, revenue ${inr(w.gross)}, profit ${inr(w.gross-w.spent)}. Two clean seasons, no crop loss claims.</div>

    <h2>3 · Repayment capacity</h2>
    <table><tr>
      <td>Active credit: KCC ${inr(80000)} drawn of ${inr(150000)} limit · SHG ${inr(30000)} (EMI ₹2,500)</td>
      <td>Annual debt service: <b>${inr(cs.debtService)}</b></td>
      <td>Coverage: <b>${cs.coverage.toFixed(1)}×</b> projected season profit</td></tr></table>

    <h2>4 · Cash-flow forecast (from ${fmtDate(todayISO())})</h2>
    <table><tr><th></th><th class="r">30 days</th><th class="r">60 days</th><th class="r">90 days</th></tr>
    <tr><td>Projected inflow</td><td class="r">${inr(cf30.reduce((a,r)=>a+r.in.reduce((x,y)=>x+y.amt,0),0))}</td><td class="r">${inr(cf60.reduce((a,r)=>a+r.in.reduce((x,y)=>x+y.amt,0),0))}</td><td class="r">${inr(cf90.reduce((a,r)=>a+r.in.reduce((x,y)=>x+y.amt,0),0))}</td></tr>
    <tr><td>Scheduled outflow</td><td class="r">${inr(cf30.reduce((a,r)=>a+r.out.reduce((x,y)=>x+y.amt,0),0))}</td><td class="r">${inr(cf60.reduce((a,r)=>a+r.out.reduce((x,y)=>x+y.amt,0),0))}</td><td class="r">${inr(cf90.reduce((a,r)=>a+r.out.reduce((x,y)=>x+y.amt,0),0))}</td></tr>
    <tr><td><b>Closing balance</b></td><td class="r"><b>${inr(cf30[29].bal)}</b></td><td class="r"><b>${inr(cf60[59].bal)}</b></td><td class="r"><b>${inr(cf90[89].bal)}</b></td></tr></table>

    <h2>5 · Receivables & credit behaviour</h2>
    <table><tr><td>Pending with buyers: <b>${inr(recv)}</b> (Pune Fruits & Veg Co., due ${fmtDate("2026-11-05")})</td>
    <td>Dealer udhaar outstanding: <b>${inr(20500)}</b>, all within due dates</td>
    <td>SHG EMI record: 18/18 on time</td></tr></table>

    <h2>6 · Risk flags (${buildAlerts().filter(a=>a.sev==="high").length} high)</h2>
    <div class="small" style="line-height:1.8">${buildAlerts().map(a=>`<span class="tag ${a.sev==="high"?"r":a.sev==="med"?"a":"g"}">${a.tag}</span> ${esc(a.title)}<br>`).join("")}</div>

    <div class="small" style="margin-top:22px;border-top:1px solid #ccc;padding-top:8px;color:#555">
    Prepared from farmer’s own verified ledger entries (voice/bill/manual), APMC price feeds and crop calendar. This document supports credit assessment; it is <b>not a loan approval or guarantee</b>. Data shared only with the farmer’s recorded consent (audit ref: ${DB.consent[0].ref}).</div>
  </div>

  <div class="card mt">
    <h3>Consent & audit trail</h3><div class="sub">every share is logged; nothing leaves without a tick</div>
    <table class="tbl">${DB.consent.map(c=>`<tr><td class="num" style="white-space:nowrap">${fmtDate(c.date)}</td><td>${esc(c.action)}</td><td class="small mut">${esc(c.ref)}</td></tr>`).join("")}</table>
  </div>`;
  el("#topbarTitle").textContent=t("navReports");
}
function shareReport(){
  openModal(`<h3>Share credit report</h3>
  <div class="small mut">Pick who gets it. Each choice is logged in the audit trail with date and reference.</div>
  <div style="margin:14px 0">
    <label class="fl"><input type="radio" name="shr" checked> Shirur FPO — procurement & aggregation team</label>
    <label class="fl"><input type="radio" name="shr"> Bank of Maharashtra — loan officer (via KCC renewal)</label>
    <label class="fl"><input type="radio" name="shr"> Adviser (agronomist) — cost summary only</label>
  </div>
  <div class="small mut">Report version KTR-41127 · generated ${fmtDate(todayISO())} · valid 15 days</div>
  <div class="mt right"><button class="btn" onclick="closeModal()">Cancel</button>
  <button class="btn primary" onclick="doShare()">Share & log consent</button></div>`);
}
function doShare(){
  DB.consent.unshift({date:todayISO(),action:"Credit-readiness report shared (demo share dialog)",by:"self",ref:"RPT-"+Date.now().toString().slice(-4)});
  save();closeModal();toast("Shared — consent logged to audit trail");
}

/* ================= SETTINGS ================= */
function vSettings(){
  const f=DB.farmer;
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>${t("navSettings")}</h1><div class="lede">Language, reminders, and who can see your data.</div></div></div>
  <div class="grid g2" style="align-items:start">
    <div class="card">
      <h3>Language & profile</h3>
      <label class="fl">App language</label>
      <select class="f" onchange="DB.farmer.language=this.value;save();renderApp()">
        ${LANGS.map(l=>`<option value="${l.id}" ${f.language===l.id?"selected":""}>${l.name}${l.en?" — "+l.en:""}</option>`).join("")}
      </select>
      <div class="form-grid">
        <div><label class="fl">Name</label><input class="f" value="${esc(f.name)}" onchange="DB.farmer.name=this.value;save()"></div>
        <div><label class="fl">Village</label><input class="f" value="${esc(f.village)}" onchange="DB.farmer.village=this.value;save()"></div>
        <div><label class="fl">Total acres</label><input class="f" type="number" step="0.5" value="${f.totalAcres}" onchange="DB.farmer.totalAcres=+this.value;save()"></div>
        <div><label class="fl">Phone</label><input class="f" value="${esc(f.phone)}" onchange="DB.farmer.phone=this.value;save()"></div>
      </div>
    </div>
    <div class="card">
      <h3>Reminders & notifications</h3>
      <div class="small mut">Current: <b>${DB.notif.frequency}</b>${DB.notif.paused?" · PAUSED":""}</div>
      <div class="chip-row mt">
        ${["daily summary","important only","weekly"].map(x=>`<button class="chip ${DB.notif.frequency===x?"on":""}" onclick="DB.notif.frequency='${x}';save();renderView()">${x}</button>`).join("")}
      </div>
      <label class="fl"><input type="checkbox" ${DB.notif.paused?"checked":""} onchange="DB.notif.paused=this.checked;save();renderView()"> Pause all reminders (harvest rush mode)</label>
      <div class="small mut mt">Reminder types: expense nudge, labour payment, loan EMI, input purchase, crop activity, buyer follow-up. One follow-up only, then silence.</div>
    </div>
    <div class="card">
      <h3>Data privacy — who sees what</h3>
      ${[["Shirur FPO","full","Crop costs + profit summary + cash forecast"],
         ["Agri adviser (FPO-referred)","summary","Cost summary only, no bank details"],
         ["Banks / lenders","none","Nothing shared without explicit report share"],
         ["Input dealers","none","Never. Not even names"]].map(([who,lvl,what])=>`
        <div class="spread" style="padding:9px 0;border-bottom:1px solid var(--line)">
          <div><b class="small">${who}</b><div class="small mut">${what}</div></div>
          <select class="f" style="width:130px" onchange="toast('Demo — permission updated, previous access revoked immediately')">
            ${["full","summary","none"].map(x=>`<option ${lvl===x?"selected":""}>${x}</option>`).join("")}
          </select>
        </div>`).join("")}
      <div class="small mut mt">Audit trail: ${DB.consent.length} logged events · you can export or wipe all data below.</div>
    </div>
    <div class="card">
      <h3>Data controls</h3>
      <div class="flex" style="gap:8px;flex-wrap:wrap">
        <button class="btn" onclick="toast('Demo — full JSON export would download here')">Export my data</button>
        <button class="btn danger" onclick="resetDemo()">Reset demo data</button>
      </div>
      <div class="small mut mt">Reset restores the seeded demo season. Your onboarding runs again.</div>
    </div>
  </div>`;
  el("#topbarTitle").textContent=t("navSettings");
}

/* ================= FPO DASHBOARD ================= */
function vFpo(){
  const visible=DB.fpoFarmers.filter(x=>x.consent!=="none");
  const withheld=DB.fpoFarmers.length-visible.length;
  const riskCount={};DB.fpoFarmers.forEach(x=>riskCount[x.risk]=(riskCount[x.risk]||0)+1);
  const crops={};DB.fpoFarmers.forEach(x=>x.crops.split(", ").forEach(c=>crops[c]=(crops[c]||0)+x.acres));
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>FPO dashboard — Shirur Taluka FPC</h1><div class="lede">Group view, consent-gated. ${withheld} member withheld data — shown only as "consent pending", never as an empty score.</div></div>
  <button class="btn" onclick="toast('Demo — export would include only consented members\' data')">Export group data</button></div>

  <div class="kpis" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi"><div class="lbl">Members on KhetKhata</div><div class="val">${DB.fpoFarmers.length}</div><div class="delta mut">${visible.length} sharing data</div></div>
    <div class="kpi"><div class="lbl">Group receivables</div><div class="val">${inrShort(DB.fpoFarmers.reduce((a,x)=>a+x.receivable,0))}</div><div class="delta mut">from traders & processors</div></div>
    <div class="kpi"><div class="lbl">Cash-risk members</div><div class="val" style="color:var(--amber)">${riskCount.cash+riskCount.loan}</div><div class="delta mut">need advance / credit linkage</div></div>
    <div class="kpi"><div class="lbl">Season profit (group)</div><div class="val">${inrShort(DB.fpoFarmers.reduce((a,x)=>a+x.seasonProfit,0))}</div><div class="delta up">▲ 9% vs kharif 2025</div></div>
  </div>

  <div class="card">
    <h3>Members</h3><div class="sub">sorted by risk — talk to red rows before harvest cash crunch hits</div>
    <table class="tbl">
    <tr><th>Farmer</th><th>Village</th><th class="r">Acres</th><th>Crops</th><th class="r">Season profit</th><th class="r">Receivable</th><th class="r">Udhaar</th><th>Risk</th><th>Consent</th></tr>
    ${DB.fpoFarmers.slice().sort((a,b)=>({loss:0,loan:1,cash:2,price:3,none:4}[a.risk]-{loss:0,loan:1,cash:2,price:3,none:4}[b.risk])).map(x=>`
      <tr style="${x.consent==="none"?"opacity:.55":""}">
      <td><b>${esc(x.name)}</b></td><td>${esc(x.village)}</td><td class="r num">${x.acres}</td><td class="small">${esc(x.crops)}</td>
      <td class="r num ${x.seasonProfit<0?"down":""}">${inrShort(x.seasonProfit)}</td>
      <td class="r num">${x.receivable?inrShort(x.receivable):"—"}</td>
      <td class="r num">${x.udhaar?inrShort(x.udhaar):"—"}</td>
      <td>${x.risk==="none"?tag("g","healthy"):x.risk==="loss"?tag("r","loss-making"):x.risk==="cash"?tag("a","cash gap"):x.risk==="loan"?tag("a","loan pressure"):tag("a","price risk")}</td>
      <td>${x.consent==="full"?tag("g","full"):x.consent==="summary"?tag("b","summary"):tag("n","pending")}</td></tr>`).join("")}
    </table>
  </div>

  <div class="grid g2 mt">
    <div class="card"><h3>Procurement plan — next 60 days</h3><div class="sub">aggregated from members’ crop calendars & yields</div>
      <table class="tbl">
      <tr><th>Crop</th><th class="r">Est. volume</th><th class="r">Window</th><th class="r">Members</th></tr>
      <tr><td>Cotton</td><td class="r num">~46 qtl</td><td class="small">Nov 15 – Jan 10</td><td class="r">2</td></tr>
      <tr><td>Tomato</td><td class="r num">~310 qtl</td><td class="small">Ongoing – Nov 5</td><td class="r">2</td></tr>
      <tr><td>Onion (rabi)</td><td class="r num">~420 qtl</td><td class="small">Mar 2027</td><td class="r">3</td></tr>
      </table>
      <div class="small mut mt">Cotton first pickings are being sold to ginning mills directly — FPO could aggregate ~₹3.3L of that trade with better rates.</div>
    </div>
    <div class="card"><h3>Where advisers should step in</h3><div class="sub">personalized, from each farmer’s own ledger</div>
      <div class="alert high"><div class="ic">▲</div><div><b>Dnyaneshwar Kale — loss-making soybean</b><span class="small">Cost/acre 31% above group median; herbicide overdose suspected. Needs field visit + soil card.</span></div></div>
      <div class="alert med"><div class="ic">●</div><div><b>Bapu Kale — ${inrShort(71000)} receivable</b><span class="small">Sugar mill payments delayed 3 cycles. FPO legal cell follow-up recommended.</span></div></div>
      <div class="alert low"><div class="ic">○</div><div><b>Ganpat More — KCC renewal in Jan</b><span class="small">Cash-flow coverage 1.2× — pre-verify documents now to avoid peak-season delay.</span></div></div>
    </div>
  </div>`;
  el("#topbarTitle").textContent="FPO — group view";
}

/* ================= LENDER DASHBOARD ================= */
function vLender(){
  const cs=creditScore(),k=seasonKharif2026();
  el("#view").innerHTML=`
  <div class="page-head"><div><h1>Lender view — Ramesh B. Patil</h1><div class="lede">Consent-based access (full), ref KTR-41127, shared ${fmtDate("2026-09-14")}. Assessment aid — not an approval decision.</div></div>
  <button class="btn" onclick="window.print()">⬇ PDF statement</button></div>

  <div class="kpis" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi"><div class="lbl">KhetKhata readiness score</div><div class="val">${cs.score}<small>/100</small></div>
      <div class="meter"><i style="width:${cs.score}%;background:${cs.score>70?"var(--green)":cs.score>50?"var(--amber)":"var(--red)"}"></i></div>
      <div class="delta mut up">based on 2 full seasons of ledger data</div></div>
    <div class="kpi"><div class="lbl">Projected season profit</div><div class="val">${inr(k.projectedProfit)}</div><div class="delta mut down">−13% vs last kharif (price-led)</div></div>
    <div class="kpi"><div class="lbl">Debt-service coverage</div><div class="val">${cs.coverage.toFixed(1)}×</div><div class="delta mut">${inr(cs.debtService)} annual obligations</div></div>
    <div class="kpi"><div class="lbl">Existing exposure</div><div class="val">${inr(110000)}</div><div class="delta mut">KCC ${inrShort(80000)} + SHG ${inrShort(30000)}</div></div>
  </div>

  <div class="grid g2">
    <div class="card"><h3>Signals in farmer’s favour</h3>
      <div class="alert info"><div class="ic">✓</div><div><span class="small"><b>18/18 SHG EMIs on time</b> — verified from shared account entries, not self-declared.</span></div></div>
      <div class="alert info"><div class="ic">✓</div><div><span class="small"><b>Diversified 3-crop portfolio</b> across 2 seasons; wheat history gives a stable floor income of ~${inrShort(66000)}.</span></div></div>
      <div class="alert info"><div class="ic">✓</div><div><span class="small"><b>Receivable coverage 2.4×</b> over dealer credit; no defaults in udhaar history.</span></div></div>
    </div>
    <div class="card"><h3>Watch-outs</h3>
      <div class="alert med"><div class="ic">●</div><div><span class="small"><b>Price concentration:</b> 68% of projected profit depends on tomato+cotton rates; tomato already −32% this season.</span></div></div>
      <div class="alert med"><div class="ic">●</div><div><span class="small"><b>${inrShort(50920)}</b> single-buyer exposure (Pune Fruits & Veg Co.) — concentration risk on one invoice chain.</span></div></div>
      <div class="alert low"><div class="ic">○</div><div><span class="small"><b>Rainfed 2.5 acres</b> — cotton yield variance risk; PMFBY enrollment not visible in ledger.</span></div></div>
    </div>
  </div>

  <div class="card mt">
    <h3>What the farmer sees you accessing</h3>
    <div class="small mut">Transparency panel — the farmer’s app shows this log in real time.</div>
    <table class="tbl">
      <tr><td class="num">${fmtDate("2026-09-14")}</td><td>Granted full view — credit assessment</td><td class="small mut">by farmer, audit KTR-41127</td></tr>
      <tr><td class="num">${fmtDate("2026-10-20")}</td><td>Viewed season summary (read-only)</td><td class="small mut">this session</td></tr>
    </table>
  </div>`;
  el("#topbarTitle").textContent="Lender — credit view";
}
