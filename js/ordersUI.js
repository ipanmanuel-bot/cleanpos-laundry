// ===== ORDERS UI LAYER =====
// Covers: order form, order list, kanban tracking, receipt/detail modals, WA notifications
// Depends on global state and helpers defined in main.js (resolved at call-time).

// ===== ORDER FORM =====
function buildOrderForm(pre) {
  buildOrderTypeDropdowns();
  const oel = g(pre + '-outlet');
  if (oel) {
    oel.innerHTML = outlets.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    if (pre === 'sno' && curStaff?.oid) oel.value = curStaff.oid;
    else oel.value = outlets[0]?.id || '';
  }
  const el = g(pre + '-addons'); if (!el) return;
  const ch = pre === 'no' ? 'calcO' : 'calcS';
  el.innerHTML = addons.map(a =>
    `<label id="${pre}-lbl-${a.id}" style="display:flex;align-items:center;gap:7px;font-size:13px;cursor:pointer;padding:8px;border-radius:8px;border:2px solid var(--b1);transition:all .15s"><input type="checkbox" id="${pre}-ck-${a.id}" onchange="${ch}();toggleAddonLbl('${pre}','${a.id}',this.checked)"> ${a.name} <span style="font-size:11px;color:var(--t2)">(+${Number(a.price).toLocaleString('id-ID')}${a.unit === 'per_qty' ? '/qty' : ''})</span></label>`
  ).join('');
}

function updWalletOption(pre) {
  if (!membershipEnabled) return;
  const pmSel = g(pre+'-pm');
  const infoEl = g(pre+'-wallet-info');
  if (!pmSel) return;
  const phone = (g(pre+'-phone')?.value||'').trim().replace(/^[-—]+$/, '');
  const cust = phone ? customers[phone] : null;
  const bal = cust?.balance||0;
  // Remove old wallet option if present
  for (let i = pmSel.options.length-1; i >= 0; i--) {
    if (pmSel.options[i].value === 'Dompet Member') pmSel.remove(i);
  }
  const balExpired = isBalanceExpired(cust);
  if (cust && bal > 0 && !balExpired) {
    pmSel.add(new Option('💳 Dompet Member ('+fmt(bal)+')', 'Dompet Member'));
    pmSel.value = 'Dompet Member'; // auto-select when balance exists
    if (infoEl) { infoEl.style.display=''; infoEl.innerHTML=`💳 Saldo member: <strong>${fmt(bal)}</strong>`; }
    const psSel = g(pre+'-ps'); if (psSel) { psSel.value = 'Lunas'; dpTgl(pre); }
  } else if (cust && bal > 0 && balExpired) {
    if (infoEl) { infoEl.style.display=''; infoEl.innerHTML=`⚠️ Saldo <strong>${fmt(bal)}</strong> telah kadaluarsa`; infoEl.style.color='var(--re,#c62828)'; }
    if (pmSel.value === 'Dompet Member') { pmSel.value = 'Tunai'; const psSel = g(pre+'-ps'); if (psSel) { psSel.value = 'Belum Bayar'; dpTgl(pre); } }
  } else {
    if (pmSel.value === 'Dompet Member') { pmSel.value = 'Tunai'; const psSel = g(pre+'-ps'); if (psSel) { psSel.value = 'Belum Bayar'; dpTgl(pre); } }
    if (infoEl) infoEl.style.display='none';
  }
}

function custSearch(pre) {
  const q = (g(pre+'-cust-srch')?.value||'').toLowerCase().trim();
  const drop = g(pre+'-cust-drop');
  if (!drop) return;
  if (!q) { drop.style.display='none'; return; }
  const matches = Object.values(customers).filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  ).slice(0,8);
  if (!matches.length) { drop.style.display='none'; return; }
  drop.innerHTML = matches.map(c => {
    const bal = c.balance||0;
    const balBadge = membershipEnabled && bal > 0
      ? `<span style="font-size:11px;font-weight:700;color:var(--p);background:var(--pl);padding:1px 8px;border-radius:10px;margin-left:6px">💳 ${fmt(bal)}</span>`
      : '';
    return `<div onclick="pickCust('${pre}','${esc(c.phone)}')" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:8px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${esc(c.name)}${balBadge}</div>
        <div style="font-size:12px;color:var(--t2)">${esc(c.phone)}</div>
      </div>
    </div>`;
  }).join('');
  drop.style.display = '';
}

function pickCust(pre, phone) {
  const c = customers[phone]; if (!c) return;
  const nameEl = g(pre+'-name'); if (nameEl) nameEl.value = c.name;
  const phoneEl = g(pre+'-phone'); if (phoneEl) phoneEl.value = c.phone;
  const srchEl = g(pre+'-cust-srch'); if (srchEl) srchEl.value = '';
  const drop = g(pre+'-cust-drop'); if (drop) drop.style.display = 'none';
  updWalletOption(pre);
}

// Close customer dropdowns when clicking outside
document.addEventListener('click', e => {
  ['no','sno'].forEach(pre => {
    const wrap = g(pre+'-cust-srch')?.parentElement;
    if (wrap && !wrap.contains(e.target)) {
      const drop = g(pre+'-cust-drop'); if (drop) drop.style.display = 'none';
    }
  });
});

function toggleAddonLbl(pre, aid, checked) {
  const lbl = g(pre + '-lbl-' + aid); if (!lbl) return;
  lbl.style.borderColor = checked ? 'var(--p)' : 'var(--b1)';
  lbl.style.background  = checked ? 'var(--pl)' : '';
  lbl.style.color        = checked ? 'var(--pd)' : '';
}

function bQty(type, cat, qty) {
  if (!isKgType(type)) return qty;
  const svc = getSvcById(type);
  const apply = svc?.minKgApply || {};
  const min = svc?.minKg || 0;
  return (apply[cat] && qty < min) ? min : qty;
}

function buildSatuanOrderItems(pre) {
  const el = g(pre + '-satuan-items'); if (!el) return;
  const cat = g(pre + '-cat')?.value || 'regular';
  if (!satuanItems.length) {
    el.innerHTML = '<div style="color:var(--t2);font-size:13px;padding:8px 0">Belum ada item satuan. Tambah di menu Harga.</div>';
    return;
  }
  const ch = pre === 'no' ? 'calcO()' : 'calcS()';
  el.innerHTML = satuanItems.map(item => {
    const price = item.prices[cat] || 0;
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--b1)">
      <div style="flex:1"><div style="font-weight:600;font-size:13px">${esc(item.name)}</div><div style="font-size:11px;color:var(--t2)">${fmt(price)} / pcs</div></div>
      <input type="number" id="${pre}-sat-${item.id}" value="0" min="0" step="1" style="width:60px;text-align:center;font-size:16px;font-weight:700;padding:6px 8px" oninput="${ch}">
    </div>`;
  }).join('');
}

function typeChange(pre) {
  const type = g(pre + '-type')?.value;
  const isSat = type === 'satuan';
  const kgSect = g(pre + '-kg-sect'); if (kgSect) kgSect.style.display = isSat ? 'none' : '';
  const satSect = g(pre + '-satuan-sect');
  if (satSect) { satSect.style.display = isSat ? '' : 'none'; if (isSat) buildSatuanOrderItems(pre); }
  if (pre === 'no') calcO(); else calcS();
}

function catChange(pre) {
  const type = g(pre + '-type')?.value;
  if (type === 'satuan') buildSatuanOrderItems(pre);
  if (pre === 'no') calcO(); else calcS();
}

function getActivePromo(type, cat) {
  const key = type + '-' + cat;
  const curOid = curStaff?.oid || (curOutlet?.id) || 'all';
  return promos.find(p => {
    if (!p.active) return false;
    const dm = p.days.length === 0 || p.days.includes(String(TODAY_DAY));
    const dateOk = (!p.from || TODAY_ISO >= p.from) && (!p.to || TODAY_ISO <= p.to);
    const svcOk = p.svc === 'all' || p.svc === key;
    const outletOk = !p.outlets || p.outlets.length === 0 || p.outlets.includes(curOid);
    return dm && dateOk && svcOk && outletOk;
  });
}

function calcPromoDisc(p, base, qty) {
  if (!p) return 0;
  if (p.discType === 'persen') return base * (p.discVal / 100);
  if (p.discType === 'flat')   return p.discVal;
  return p.discVal * qty;
}

function discTypeChange(pre) {
  const t = g(pre + '-disc-type')?.value || 'none';
  const w = g(pre + '-dv-w'); if (w) w.style.display = t === 'none' ? 'none' : 'block';
  const dl = g(pre + '-dv-lbl'); if (dl) dl.textContent = { persen: 'Nilai (%)', flat: 'Nominal (Rp)', per_qty: 'Per Kg/Pcs (Rp)' }[t] || 'Nilai';
}

function calcBase(pre) {
  const type = g(pre + '-type').value, cat = g(pre + '-cat').value;
  const EST = { regular: '2-3 hari', sameday: '± 8 jam', express: '1 hari' };
  const est = g(pre + '-est'); if (est) est.value = EST[cat] || '';

  if (type === 'satuan') {
    const satuanLines = [];
    satuanItems.forEach(item => {
      const qEl = g(pre + '-sat-' + item.id);
      const qty = parseInt(qEl?.value) || 0;
      if (qty > 0) {
        const unitPrice = item.prices[cat] || 0;
        satuanLines.push({ id: item.id, name: item.name, qty, unitPrice, lineTotal: unitPrice * qty });
      }
    });
    const base = satuanLines.reduce((s, l) => s + l.lineTotal, 0);
    const bq = satuanLines.reduce((s, l) => s + l.qty, 0);
    let addTotal = 0; const addonLines = [];
    addons.forEach(a => {
      const ck = g(pre + '-ck-' + a.id);
      if (ck && ck.checked) { const v = a.unit === 'per_qty' ? a.price * bq : a.price; addTotal += v; addonLines.push({ n: a.name, v }); }
    });
    return { type, cat, rawQty: bq, bq, base, addTotal, addonLines, subtotal: base + addTotal, actPromo: getActivePromo(type, cat), satuanLines };
  }

  const rawQty = parseFloat(g(pre + '-qty').value) || 1;
  const bq = bQty(type, cat, rawQty);
  const svc = getSvcById(type);
  const apply = svc?.minKgApply || {};
  const minKgVal = svc?.minKg || 0;
  const hasMin = isKgType(type) && !!apply[cat];
  const ql = g(pre + '-qty-lbl'); if (ql) ql.childNodes[0].textContent = isKgType(type) ? 'Berat (' + (svc?.unit || 'kg') + ') ' : 'Jumlah (' + (svc?.unit || 'pcs') + ') ';
  const mb = g(pre + '-min-b'); if (mb) { mb.style.display = hasMin ? 'inline' : 'none'; mb.textContent = 'min.' + minKgVal + 'kg'; }
  const mw = g(pre + '-min-w'); if (mw) { mw.style.display = hasMin && rawQty < minKgVal ? 'block' : 'none'; mw.textContent = '→ Dihitung ' + minKgVal + 'kg'; }
  const base = (getP()[type]?.[cat] || 0) * bq;
  let addTotal = 0; const addonLines = [];
  addons.forEach(a => {
    const ck = g(pre + '-ck-' + a.id);
    if (ck && ck.checked) { const v = a.unit === 'per_qty' ? a.price * bq : a.price; addTotal += v; addonLines.push({ n: a.name, v }); }
  });
  return { type, cat, rawQty, bq, base, addTotal, addonLines, subtotal: base + addTotal, actPromo: getActivePromo(type, cat), satuanLines: [] };
}

function doCalc(pre, hasDisc) {
  const res = calcBase(pre);
  const { type, cat, bq, base, addTotal, addonLines, subtotal, actPromo, satuanLines } = res;
  let promoEnabled = true; const pc = g(pre + '-promo-chk'); if (pc) promoEnabled = pc.checked;
  let promoAmt = actPromo && promoEnabled ? Math.min(calcPromoDisc(actPromo, subtotal, bq), subtotal) : 0;
  const pb = g(pre + '-promo-box');
  if (actPromo && pb) {
    pb.innerHTML = `<div class="${promoEnabled ? 'pb-act' : 'pb-off'}"><div style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">🎟️</span><div><div style="font-weight:700;font-size:13px;color:${promoEnabled ? '#3d6b10' : 'var(--t2)'}">${actPromo.name}</div><div style="font-size:11px;color:${promoEnabled ? '#4a7a15' : 'var(--t3)'}">${actPromo.discType === 'persen' ? actPromo.discVal + '%' : fmt(calcPromoDisc(actPromo, subtotal, bq))} diskon</div></div></div><label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="${pre}-promo-chk" ${promoEnabled ? 'checked' : ''} onchange="${pre === 'no' ? 'calcO' : 'calcS'}()"> Pakai promo</label></div></div>`;
  } else if (pb) pb.innerHTML = '';
  let discType = 'none', discAmt = 0;
  if (hasDisc) {
    discType = g(pre + '-disc-type')?.value || 'none';
    const dv = parseFloat(g(pre + '-disc-val')?.value) || 0;
    if (discType === 'persen')  discAmt = subtotal * (dv / 100);
    else if (discType === 'flat')    discAmt = dv;
    else if (discType === 'per_qty') discAmt = dv * bq;
    discAmt = Math.min(discAmt, subtotal);
  }
  const total = Math.max(0, subtotal - promoAmt - discAmt);
  const pv = g(pre + '-preview');
  if (pv) {
    let html = '';
    if (type === 'satuan') {
      if (satuanLines?.length) { satuanLines.forEach(l => { html += `<div class="sr"><span>${l.name} × ${l.qty} pcs × ${fmt(l.unitPrice)}</span><span>${fmt(l.lineTotal)}</span></div>`; }); }
      else { html = `<div class="sr" style="color:var(--t2)"><span>Pilih item satuan di atas</span><span>—</span></div>`; }
    } else {
      html = `<div class="sr"><span style="text-transform:capitalize">${getSvcById(type)?.name||type} ${cat} × ${bq}${getSvcUnit(type)||'pcs'} × ${fmt(getP()[type]?.[cat]||0)}</span><span>${fmt(base)}</span></div>`;
    }
    addonLines.forEach(al => { html += `<div class="sr"><span>${al.n}</span><span>${fmt(al.v)}</span></div>`; });
    if (promoAmt > 0) html += `<div class="sr" style="color:var(--p)"><span>🎟️ ${actPromo.name}</span><span>- ${fmt(promoAmt)}</span></div>`;
    if (discAmt > 0)  html += `<div class="sr" style="color:var(--re)"><span>Diskon manual</span><span>- ${fmt(discAmt)}</span></div>`;
    pv.innerHTML = html;
  }
  const tv = g(pre + '-total'); if (tv) tv.textContent = fmt(total);
  return { type, cat, bq, rawQty: res.rawQty, base, addTotal, addonLines, promoAmt, discType, discAmt, total, actPromo };
}

function calcO() { doCalc('no', true); calcChg('no'); }
function calcS() { doCalc('sno', false); calcChg('sno'); }
function calcChg(pre) {
  const tot = parseInt((g(pre + '-total')?.textContent || '').replace(/\D/g, '')) || 0;
  const rcv = parseInt(g(pre + '-cash')?.value) || 0;
  const ch = g(pre + '-chg'); if (ch) ch.textContent = fmt(Math.max(0, rcv - tot));
}
function dpTgl(pre) {
  const el = g(pre + '-dp-g'); if (el) el.style.display = g(pre + '-ps')?.value === 'DP' ? 'block' : 'none';
}

function buildOrder(pre) {
  const name = (g(pre + '-name')?.value || '').trim(); if (!name) { toast('⚠️ Nama pelanggan wajib diisi!'); return null; }
  const _phoneRaw = (g(pre + '-phone')?.value || '').trim().replace(/^[-—]+$/, '');
  const phone = _phoneRaw || '—';
  const res = doCalc(pre, pre === 'no');
  const addOns = []; addons.forEach(a => { const ck = g(pre + '-ck-' + a.id); if (ck && ck.checked) addOns.push({ id: a.id, name: a.name }); });
  const o = {
    id: genId(), name, phone, svcType: res.type, svcCat: res.cat,
    qty: res.bq, rawQty: res.rawQty, satuanLines: res.satuanLines || [], addOns, addOnAmt: res.addTotal,
    base: res.base, discType: res.discType, discAmt: res.discAmt,
    promoAmt: res.promoAmt, total: res.total,
    payMethod: g(pre + '-pm')?.value || 'Tunai',
    payStatus: g(pre + '-ps')?.value || 'Belum Bayar',
    status: 'Diterima', notes: g(pre + '-note')?.value || '',
    date: TODAY_STR, isoDate: new Date().toISOString(), pickupDate: null, waSent: false,
    handledBy: curStaff ? curStaff.name : 'Owner',
    outletId: g(pre + '-outlet')?.value || (curStaff ? curStaff.oid : (curOutlet?.id || outlets[0]?.id || 'o1'))
  };
  // Wallet payment: validate before pushing order
  if (membershipEnabled && o.payMethod === 'Dompet Member') {
    const walletCust = phone !== '—' ? customers[phone] : null;
    const walletBal = Number(walletCust?.balance || 0);
    const walletTotal = Number(o.total || 0);
    console.log('[wallet check] phone:', phone, '| found:', !!walletCust, '| balance:', walletBal, '| total:', walletTotal);
    if (walletCust && isBalanceExpired(walletCust)) {
      toast('⚠️ Saldo member telah kadaluarsa!');
      return null;
    }
    if (!walletCust || walletBal < walletTotal) {
      toast('⚠️ Saldo tidak cukup! Saldo: ' + fmt(walletBal) + ' | Total: ' + fmt(walletTotal));
      return null;
    }
    o.payStatus = 'Lunas';
  }
  orders.push(o); orderCtr++;
  if (phone !== '—') addCust(name, phone, o.total, TODAY_STR);
  if (o.payMethod === 'Tunai' && o.payStatus === 'Lunas')
    kasLog.push({ id: kasCtr++, type: 'in', desc: 'Penjualan Cash', note: name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId });
  if (membershipEnabled && o.payMethod === 'Dompet Member' && phone !== '—') {
    const cust = customers[phone];
    if (cust) {
      cust.balance = (cust.balance||0) - o.total;
      const txnId = 'MBR-'+String(memberTxnCtr++).padStart(5,'0');
      memberTxns.push({ id: txnId, phone, type: 'deduct', amount: o.total, baseAmount: null, bonusAmount: null, note: null, orderId: o.id, time: NOW() });
    }
  }
  [pre + '-name', pre + '-phone', pre + '-note', pre + '-cash'].forEach(id => { const el = g(id); if (el) el.value = ''; });
  addons.forEach(a => { const ck = g(pre + '-ck-' + a.id); if (ck) ck.checked = false; });
  const qq = g(pre + '-qty'); if (qq) qq.value = '1';
  const dt = g(pre + '-disc-type'); if (dt) dt.value = 'none';
  const dv = g(pre + '-disc-val'); if (dv) dv.value = '0';
  const dw = g(pre + '-dv-w');  if (dw) dw.style.display = 'none';
  const ps = g(pre + '-ps');    if (ps) ps.value = 'Belum Bayar';
  const dpg = g(pre + '-dp-g'); if (dpg) dpg.style.display = 'none';
  if (res.type === 'satuan') satuanItems.forEach(item => { const el = g(pre + '-sat-' + item.id); if (el) el.value = '0'; });
  if (membershipEnabled) updWalletOption(pre);
  if (pre === 'no') calcO(); else calcS();
  return o;
}

function submitO(role) {
  const pre = role === 'o' ? 'no' : 'sno';
  const o = buildOrder(pre); if (!o) return;
  showRcpt(o.id); curWaNewOrder = o;
  setTimeout(() => { setWaNewType('konfirmasi', g('wa-new-chips').querySelector('.chip')); openModal('m-wa-new'); }, 600);
  if (role === 'o') refreshODash(); else refreshSDash();
}

// ===== ORDERS LIST =====
function setOrdOutlet(id) { ordOutlet = id; renderOrders(); }

function setOrdDateFilter(f) {
  ordDateFilter = f;
  ['all','today','week','month','custom'].forEach(k => {
    const ob = g('odf-'+k);  if (ob) ob.className = 'btn bsm bpill' + (f===k?' bp':'');
    const sb = g('sodf-'+k); if (sb) sb.className = 'btn bsm bpill' + (f===k?' bp':'');
  });
  const ocr = g('odf-custom-range');  if (ocr) ocr.style.display = f==='custom'?'flex':'none';
  const scr = g('sodf-custom-range'); if (scr) scr.style.display = f==='custom'?'flex':'none';
  renderOrders();
}

function renderOrders() {
  const isO = curRole === 'owner';
  if (isO) { const oc = g('ord-outlet-chips'); if (oc) oc.innerHTML = buildOutletFilterChips(ordOutlet, 'setOrdOutlet'); }
  const q = ((isO ? g('o-srch') : g('s-srch'))?.value || '').toLowerCase();
  const fs = (isO ? g('o-fst') : g('s-fst'))?.value || '';
  const fp = isO ? (g('o-fpy')?.value || '') : '';

  // Date filter range
  let dateFrom = null, dateTo = null;
  if (ordDateFilter === 'today') {
    dateFrom = dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'week') {
    const _d = new Date(); _d.setHours(0,0,0,0);
    const _dow = (_d.getDay() + 6) % 7; // 0=Mon
    const _wkStart = new Date(_d); _wkStart.setDate(_wkStart.getDate() - _dow);
    dateFrom = _isoStr(_wkStart); dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'month') {
    const _d = new Date();
    dateFrom = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-01`;
    dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'custom') {
    dateFrom = (isO ? g('o-date-from') : g('s-date-from'))?.value || '';
    dateTo   = (isO ? g('o-date-to')   : g('s-date-to'))?.value   || '';
  }

  const list = orders.filter(o => {
    const matchQ = !q || o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    const matchS = !fs || o.status === fs;
    const matchP = !fp || o.payStatus === fp;
    const matchO = !isO || ordOutlet === 'all' || o.outletId === ordOutlet;
    const oDate = _orderDateISO(o);
    const matchD = !dateFrom || (oDate >= dateFrom && (!dateTo || oDate <= dateTo));
    return matchQ && matchS && matchP && matchO && matchD;
  }).slice().sort((a, b) => (b.isoDate || '').localeCompare(a.isoDate || ''));

  const tbId = isO ? 'ord-tb' : 's-ord-tb';
  const tb = g(tbId); if (!tb) return;
  const colspan = isO ? 11 : 9;
  if (!list.length) { tb.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;padding:24px;color:var(--t2)">Tidak ada pesanan ditemukan</td></tr>`; return; }
  const waBtn = o => (o.status === 'Selesai' || o.status === 'Diambil')
    ? (o.waSent ? `<span class="badge gg">✓</span>` : `<button class="btn bp bsm" onclick="openWaMod('${o.id}')">💬</button>`)
    : '—';
  if (isO) {
    tb.innerHTML = list.map(o => { const _oc=go(o.outletId);const _osc=_oc?.color?safeColor(_oc.color):'#ccc';return `<tr>
      <td style="font-size:11px;font-family:monospace;white-space:nowrap">${esc(o.id)}</td>
      <td><div style="font-weight:600">${esc(o.name)}</div><div style="font-size:11px;color:var(--t2)">${esc(o.phone)}</div></td>
      <td><span style="font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;background:${_osc}18;color:${_oc?.color?safeColor(_oc.color):'#666'}">${esc(_oc?.name || '—')}</span></td>
      <td style="font-size:12px;white-space:nowrap;text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</td>
      <td style="font-weight:700;white-space:nowrap">${fmt(o.total)}</td>
      <td><span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span></td>
      <td><span class="badge ${SL_PAY[o.payStatus]}">${esc(o.payStatus)}</span></td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.date||'—')}</td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.pickupDate||'—')}</td>
      <td>${waBtn(o)}</td>
      <td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="showDetail('${o.id}')">Detail</button><button class="btn bsm" onclick="showRcpt('${o.id}')">Struk</button><button class="btn bsm bre" onclick="deleteOrder('${o.id}')">Hapus</button></div></td>
    </tr>`; }).join('');
  } else {
    tb.innerHTML = list.map(o => `<tr>
      <td style="font-size:11px;font-family:monospace;white-space:nowrap">${esc(o.id)}</td>
      <td style="font-weight:600">${esc(o.name)}</td>
      <td style="font-size:12px;white-space:nowrap;text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</td>
      <td><span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span></td>
      <td><span class="badge ${SL_PAY[o.payStatus]}">${esc(o.payStatus)}</span></td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.date||'—')}</td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.pickupDate||'—')}</td>
      <td>${waBtn(o)}</td>
      <td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="showDetail('${o.id}')">Detail</button><button class="btn bsm" onclick="showRcpt('${o.id}')">Struk</button></div></td>
    </tr>`).join('');
  }
}

// ===== KANBAN / TRACKING =====
function setTrkOutlet(id) { trkOutlet = id; renderKanban('o'); }

function renderKanban(role) {
  const cols = ['Diterima', 'Mencuci', 'Mengeringkan', 'Menyetrika', 'Selesai'];
  const aId = role === 'o' ? 'o-trk-alert' : 's-trk-alert';
  const kId = role === 'o' ? 'o-kanban' : 's-kanban';
  if (role === 'o') { const tc = g('trk-outlet-chips'); if (tc) tc.innerHTML = buildOutletFilterChips(trkOutlet, 'setTrkOutlet'); }
  const filtOrders = role === 'o' && trkOutlet !== 'all' ? orders.filter(o => o.outletId === trkOutlet) : orders;
  const wp = filtOrders.filter(o => o.status === 'Selesai' && !o.waSent);
  const al = g(aId); if (al) al.innerHTML = wp.length ? `<div style="background:var(--pl);border:2px solid var(--p);border-radius:10px;padding:11px 14px;font-size:13px;color:#3d6b10;margin-bottom:10px">💬 ${wp.length} cucian selesai belum dinotif WA</div>` : '';
  const kb = g(kId); if (!kb) return;
  kb.innerHTML = cols.map(st => {
    const items = filtOrders.filter(o => o.status === st);
    return `<div class="kcol"><div class="khd"><span>${st}</span><span style="background:var(--ca);padding:1px 7px;border-radius:12px;font-size:10px">${items.length}</span></div>${items.length
      ? items.map(o => { const _oc=go(o.outletId);const _ocColor=_oc?.color?safeColor(_oc.color):'var(--t2)'; return `<div class="kcard${st === 'Selesai' ? ' kdone' : ''}">
          <div style="font-size:10px;font-family:monospace;color:var(--t2)">${esc(o.id)}</div>
          <div style="font-weight:700;font-size:12px;margin:3px 0">${esc(o.name)}</div>
          <div style="font-size:10px;font-weight:600;color:${_ocColor};">${esc(_oc?.name || '')}</div>
          <div style="font-size:11px;color:var(--t2)">${esc(o.svcType)}·${o.qty}${getSvcUnit(o.svcType)}</div>
          ${st === 'Selesai' ? `<div style="margin-top:8px">${o.waSent ? '<span class="badge gg" style="font-size:10px">✓ WA Terkirim</span>' : `<button class="btn bp bpill" style="width:100%;padding:6px;font-size:11px" onclick="openWaMod('${o.id}')">💬 Kirim WA</button>`}</div>` : ''}
          ${st === 'Selesai' ? `<div style="margin-top:6px"><button class="btn bpill" style="width:100%;padding:7px;font-size:11px;font-weight:700;background:var(--p);color:#fff;border-color:var(--p)" onclick="updSt('${o.id}','Diambil','${role}')">✓ Sudah Diambil</button></div>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:8px">${STATUS_LIST.filter(s => s !== 'Diambil').map(s => `<button class="btn bsm${s === st ? ' bp' : ''}" style="font-size:10px;padding:3px 6px" onclick="updSt('${o.id}','${s}','${role}')">${s}</button>`).join('')}</div>
        </div>`; }).join('')
      : '<div style="font-size:11px;color:var(--t2);text-align:center;padding:14px">Kosong</div>'}</div>`;
  }).join('');
}

function updSt(id, st, role) {
  const o = orders.find(x => x.id === id); if (!o) return;
  o.status = st;
  if (st === 'Diambil' && !o.pickupDate) o.pickupDate = TODAY_STR;
  if (st === 'Selesai' && !o.waSent) setTimeout(() => openWaMod(id), 300);
  renderKanban(role); renderOrders();
  if (role === 'o') refreshODash(); else refreshSDash();
}

// ===== RECEIPT / DETAIL =====
function rcptOpenWa() {
  const o = orders.find(x => x.id === curRcptOrderId); if (!o) return;
  curWaNewOrder = o;
  setWaNewType('konfirmasi', g('wa-new-chips').querySelector('.chip'));
  openModal('m-wa-new');
}
function showRcpt(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  curRcptOrderId = id;
  let lines;
  if (o.svcType === 'satuan' && o.satuanLines && o.satuanLines.length) {
    lines = o.satuanLines.map(l => `<div class="rrow"><span>${esc(l.name)} × ${l.qty}</span><span>${(l.lineTotal||0).toLocaleString('id-ID')}</span></div>`).join('');
  } else {
    lines = `<div class="rrow"><span style="text-transform:capitalize">${esc(o.svcType)} ${esc(o.svcCat)} × ${o.qty}${getSvcUnit(o.svcType)}</span><span>${(o.base||0).toLocaleString('id-ID')}</span></div>`;
  }
  o.addOns.forEach(a => { const ad = addons.find(x => x.id === a.id); if (ad) { const v = ad.unit === 'per_qty' ? ad.price * o.qty : ad.price; lines += `<div class="rrow"><span>${esc(a.name)}</span><span>${v.toLocaleString('id-ID')}</span></div>`; } });
  if (o.promoAmt > 0) lines += `<div class="rrow" style="color:var(--p)"><span>Diskon Promo</span><span>- ${o.promoAmt.toLocaleString('id-ID')}</span></div>`;
  if (o.discAmt > 0)  lines += `<div class="rrow" style="color:var(--re)"><span>Diskon Manual</span><span>- ${o.discAmt.toLocaleString('id-ID')}</span></div>`;
  g('m-rcpt-body').innerHTML = `<div class="rcpt"><div class="rc rb">CLEANPOS LAUNDRY</div><div class="rc" style="font-size:10px">${esc(go(o.outletId)?.addr||'')}</div><hr class="rdash"><div class="rrow"><span>No Nota</span><span>${esc(o.id)}</span></div><div class="rrow"><span>Pelanggan</span><span>${esc(o.name)}</span></div><div class="rrow"><span>Kasir</span><span>${esc(o.handledBy||'—')}</span></div><div class="rrow"><span>Tgl Masuk</span><span>${esc(o.date)}</span></div><hr class="rdash">${lines}<hr class="rdash"><div class="rrow"><span>Status</span><span>${esc(o.payStatus)}</span></div><div class="rrow rb"><span>Total</span><span>${o.total.toLocaleString('id-ID')}</span></div><div class="rrow"><span>Metode</span><span>${esc(o.payMethod)}</span></div><hr class="rdash"><div class="rc">Terima kasih! 🙏</div></div>`;
  openModal('m-rcpt');
}

function deleteOrder(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  confirm_('Hapus Pesanan?', `Pesanan ${o.id} atas nama ${o.name} akan dihapus.`, () => {
    confirm_('Yakin Hapus?', 'Tindakan ini permanen dan tidak dapat dibatalkan.', () => {
      orders = orders.filter(x => x.id !== id);
      sbDelete('orders', id);
      renderOrders();
      if (curRole === 'owner') refreshODash(); else refreshSDash();
      toast('🗑️ Pesanan ' + id + ' dihapus.');
    });
  });
}

function showDetail(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  g('m-detail-title').textContent = o.id;
  g('m-detail-body').innerHTML = `<div class="g2" style="margin-bottom:14px">
    <div class="mc2"><div class="ml">Status</div><div style="margin-top:6px"><span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span></div></div>
    <div class="mc2"><div class="ml">Pembayaran</div><div style="margin-top:6px"><span class="badge ${SL_PAY[o.payStatus]}">${esc(o.payStatus)}</span></div></div>
  </div>
  <div class="rcpt" style="margin-bottom:12px">
    <div class="rrow"><span style="color:var(--t2)">Pelanggan</span><span>${esc(o.name)}</span></div>
    <div class="rrow"><span style="color:var(--t2)">WA</span><span>${esc(o.phone)}</span></div>
    <div class="rrow"><span style="color:var(--t2)">Outlet</span><span>${esc(go(o.outletId)?.name || '—')}</span></div>
    <div class="rrow"><span style="color:var(--t2)">Layanan</span><span style="text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</span></div>
    <div class="rrow"><span style="color:var(--t2)">Jumlah</span><span>${o.qty}${getSvcUnit(o.svcType)}${o.rawQty && o.rawQty !== o.qty ? ` <span style="font-size:10px;color:var(--am)">(input:${o.rawQty}→min${getSvcById(o.svcType)?.minKg||0}kg)</span>` : ''}</span></div>
    <div class="rrow rb" style="border-top:1px dashed #ccc;padding-top:5px;margin-top:4px"><span>Total</span><span>${fmt(o.total)}</span></div>
  </div>
  ${o.status === 'Selesai' || o.status === 'Diambil' ? `<div style="padding:10px;background:${o.waSent ? 'var(--pl)' : 'var(--amb)'};border-radius:10px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:${o.waSent ? '#3d6b10' : 'var(--am)'}">${o.waSent ? '✓ Notif WA terkirim' : 'Notif WA belum dikirim'}</span>${!o.waSent ? `<button class="btn bp bsm bpill" onclick="cm('m-detail');openWaMod('${o.id}')">💬 Kirim WA</button>` : ''}</div>` : ''}
  <div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Update Status Pesanan</div>
  <div style="display:flex;flex-wrap:wrap;gap:5px">${STATUS_LIST.map(s => `<button class="btn bsm${s === o.status ? ' bp' : ''}" onclick="setStModal('${id}','${s}',this)">${s}</button>`).join('')}</div></div>
  <div><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Update Status Bayar</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">${['Belum Bayar', 'DP', 'Lunas'].map(ps => `<button class="btn bsm${ps === o.payStatus ? ' bp' : ''}" onclick="setPayModal('${id}','${ps}',this)">${ps}</button>`).join('')}</div></div>`;
  g('m-detail-ft').innerHTML = `<button class="btn" onclick="cm('m-detail')">Tutup</button><button class="btn bp" onclick="cm('m-detail');showRcpt('${id}')">Struk</button>`;
  openModal('m-detail');
}

function setStModal(id, st, btn) {
  const o = orders.find(x => x.id === id); if (!o) return;
  o.status = st;
  btn.closest('div').querySelectorAll('.btn').forEach(b => { if (b.onclick && b.onclick.toString().includes('setStModal')) b.classList.remove('bp'); });
  btn.classList.add('bp');
  if (st === 'Selesai' && !o.waSent) setTimeout(() => { cm('m-detail'); openWaMod(id); }, 400);
  renderOrders();
  if (curRole === 'owner') refreshODash(); else refreshSDash();
}

function setPayModal(id, ps, btn) {
  const o = orders.find(x => x.id === id); if (!o) return;
  o.payStatus = ps;
  btn.closest('div').querySelectorAll('.btn').forEach(b => { if (b.onclick && b.onclick.toString().includes('setPayModal')) b.classList.remove('bp'); });
  btn.classList.add('bp');
  if (ps === 'Lunas' && o.payMethod === 'Tunai')
    kasLog.push({ id: kasCtr++, type: 'in', desc: 'Penjualan Cash (diperbarui)', note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId });
  renderOrders();
  if (curRole === 'owner') refreshODash(); else refreshSDash();
  toast('✓ Status bayar: ' + ps);
}

// ===== WA NOTIFICATIONS =====
function buildMsg(tpl, o) {
  return tpl
    .replace(/{nama}/g, o.name)
    .replace(/{id}/g, o.id)
    .replace(/{total}/g, fmt(o.total))
    .replace(/{layanan}/g, o.svcType + ' ' + o.svcCat)
    .replace(/{est}/g, { regular: '2-3 hari', express: '1 hari', sameday: '± 8 jam' }[o.svcCat] || '');
}

function fmtPh(p) {
  let n = p.replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n;
}

function openWaMod(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  const msg = buildMsg(waTplSelesai, o);
  g('m-wa-body').innerHTML = `<div style="margin-bottom:12px"><div style="font-weight:600;font-size:14px">${esc(o.name)}</div><div style="font-size:12px;color:var(--t2)">${esc(o.id)} · ${esc(o.phone)}</div></div><div class="wa-bg"><div class="wa-bbl">${esc(msg).replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div></div>`;
  g('m-wa-send').onclick = () => {
    if (o.phone && o.phone !== '—') window.open('https://wa.me/' + fmtPh(o.phone) + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
    o.waSent = true;
    waLog.unshift({ orderId: o.id, name: o.name, phone: o.phone, time: NOW() + ', ' + TODAY_STR });
    cm('m-wa'); toast('💬 WA terbuka untuk ' + o.name);
    renderOrders();
    renderWaCenter(); renderSWa();
    if (curRole === 'owner') refreshODash(); else refreshSDash();
  };
  openModal('m-wa');
}

function setWaNewType(type, el) {
  curWaNewType = type;
  document.querySelectorAll('#wa-new-chips .chip').forEach(c => c.classList.remove('on'));
  if (el) el.classList.add('on');
  if (!curWaNewOrder) return;
  const msg = buildMsg(waTplNew[type] || waTplNew.konfirmasi, curWaNewOrder);
  const p = g('wa-new-preview'); if (p) p.innerHTML = msg.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  const sb = g('m-wa-new-send');
  if (sb) sb.onclick = () => {
    if (curWaNewOrder?.phone && curWaNewOrder.phone !== '—')
      window.open('https://wa.me/' + fmtPh(curWaNewOrder.phone) + '?text=' + encodeURIComponent(buildMsg(waTplNew[curWaNewType], curWaNewOrder)), '_blank', 'noopener,noreferrer');
    waLog.unshift({ orderId: curWaNewOrder.id, name: curWaNewOrder.name, phone: curWaNewOrder.phone, time: NOW() + ', ' + TODAY_STR });
    cm('m-wa-new'); toast('💬 WA konfirmasi terkirim!');
  };
}

const WA_TPL_HINTS = {
  selesai:     'Dikirim otomatis saat status pesanan berubah ke Selesai',
  tagih_dp:    'Digunakan saat pesanan baru masuk dan status bayar = DP',
  tagih_lunas: 'Digunakan saat menagih pelunasan pembayaran',
  konfirmasi:  'Dikirim otomatis saat pesanan baru dibuat'
};

function switchWaTplTab(type, el) {
  curWaTplTab = type;
  document.querySelectorAll('#wa-tpl-tabs .chip').forEach(c => c.classList.remove('on'));
  if (el) el.classList.add('on');
  const hint = g('wa-tpl-hint'); if (hint) hint.textContent = WA_TPL_HINTS[type] || '';
  const tpl = type === 'selesai' ? waTplSelesai : (waTplNew[type] || '');
  const ta = g('wa-tpl'); if (ta) { ta.value = tpl; prevTpl(); }
}

function prevTpl() {
  const el = g('wa-tpl'), p = g('wa-prev'); if (!el || !p) return;
  p.innerHTML = el.value
    .replace(/{nama}/g,    '<strong>Budi Santoso</strong>')
    .replace(/{id}/g,      '<strong>LDRY-001</strong>')
    .replace(/{total}/g,   '<strong>Rp 21.000</strong>')
    .replace(/{layanan}/g, 'kiloan regular')
    .replace(/{est}/g,     '2-3 hari')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function saveTpl() {
  const val = g('wa-tpl')?.value || '';
  if (curWaTplTab === 'selesai') { waTplSelesai = val; }
  else { waTplNew[curWaTplTab] = val; }
  toast('✓ Template "' + { selesai: 'Pesanan Selesai', tagih_dp: 'Tagih DP', tagih_lunas: 'Tagih Lunas', konfirmasi: 'Konfirmasi Terima' }[curWaTplTab] + '" tersimpan!');
}

function renderWaCenter() {
  const tpl = curWaTplTab === 'selesai' ? waTplSelesai : (waTplNew[curWaTplTab] || '');
  const ta = g('wa-tpl'); if (ta) ta.value = tpl;
  prevTpl();
  const pend = orders.filter(o => o.status === 'Selesai' && !o.waSent);
  const cnt = g('wa-pend-cnt'); if (cnt) { cnt.textContent = pend.length; cnt.className = 'badge ' + (pend.length ? 'gam' : 'gg'); }
  const pl = g('wa-pend-list');
  if (pl) pl.innerHTML = pend.length
    ? pend.map(o => `<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--b1)"><div><div style="font-weight:600;font-size:13px">${esc(o.name)}</div><div style="font-size:11px;color:var(--t2)">${esc(o.id)} · ${fmt(o.total)}</div></div><button class="btn bp bsm bpill" onclick="openWaMod('${o.id}')">💬 Kirim WA</button></div>`).join('')
    : '<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Semua sudah dinotifikasi ✓</div>';
  const ll = g('wa-log-list');
  if (ll) ll.innerHTML = waLog.length
    ? waLog.map(l => `<div class="li_"><div class="lic">💬</div><div style="flex:1"><div style="font-weight:600">${esc(l.name)}</div><div style="font-size:11px;color:var(--t2)">${esc(l.orderId)}</div></div><span style="font-size:11px;color:var(--t2)">${esc(l.time)}</span><span class="badge gg">✓</span></div>`).join('')
    : '<div style="text-align:center;padding:18px;color:var(--t2);font-size:13px">Belum ada riwayat</div>';
}

function renderSWa() {
  const pend = orders.filter(o => o.status === 'Selesai' && !o.waSent);
  const cnt = g('s-wa-pend-cnt'); if (cnt) { cnt.textContent = pend.length; cnt.className = 'badge ' + (pend.length ? 'gam' : 'gg'); }
  const pl = g('s-wa-pend-list');
  if (pl) pl.innerHTML = pend.length
    ? pend.map(o => `<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--b1)"><div><div style="font-weight:600;font-size:13px">${esc(o.name)}</div><div style="font-size:11px;color:var(--t2)">${esc(o.id)}</div></div><button class="btn bp bsm bpill" onclick="openWaMod('${o.id}')">💬 Kirim</button></div>`).join('')
    : '<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Semua sudah dinotifikasi ✓</div>';
  const ll = g('s-wa-log');
  if (ll) ll.innerHTML = waLog.length
    ? waLog.slice(0, 5).map(l => `<div class="li_"><div class="lic">💬</div><div style="flex:1;font-weight:600">${esc(l.name)}</div><span class="badge gg">✓</span></div>`).join('')
    : '<div style="text-align:center;padding:16px;color:var(--t2);font-size:13px">Belum ada</div>';
}
