// ===== ORDERS UI LAYER =====
// Covers: order form, order list, kanban tracking, receipt/detail modals, WA notifications
// Depends on global state and helpers defined in main.js (resolved at call-time).

// ─── Satuan cart state ───
let _noSatuanCart = [];
let _snoSatuanCart = [];
function _getSatuanCart(pre){ return pre==='no' ? _noSatuanCart : _snoSatuanCart; }
function _setSatuanCart(pre, cart){ if(pre==='no') _noSatuanCart=cart; else _snoSatuanCart=cart; }

// ─── Voucher code state ───
const _voucherState = {};
function _getVS(pre){ if(!_voucherState[pre])_voucherState[pre]={code:'',promo:null}; return _voucherState[pre]; }

// ─── Dismissed auto-promo state (per prefix) ───
const _dismissedPromo = {};
function dismissAutoPromo(pre) {
  const type = g(pre + '-type')?.value;
  const cat  = g(pre + '-cat')?.value;
  if (type && cat) {
    const p = getActivePromo(type, cat);
    if (p) _dismissedPromo[pre] = p.id;
  }
  if (pre === 'no') calcO(); else calcS();
}

function applyVoucherCode(pre) {
  const input = g(pre + '-voucher-input');
  const code = (input?.value || '').trim().toUpperCase();
  if (!code) { toast('Masukkan kode voucher terlebih dahulu'); return; }
  const today = String(typeof TODAY_DAY !== 'undefined' ? TODAY_DAY : new Date().getDay());
  const todayISO = typeof TODAY_ISO !== 'undefined' ? TODAY_ISO : new Date().toISOString().split('T')[0];
  const curOid = (typeof curStaff !== 'undefined' && curStaff?.oid) || (typeof curOutlet !== 'undefined' && curOutlet?.id) || 'all';
  const promo = (typeof promos !== 'undefined' ? promos : []).find(p => {
    if (!p.active || !p.useCode) return false;
    const dayOk = !p.days?.length || p.days.includes(today);
    const dateOk = (!p.from || todayISO >= p.from) && (!p.to || todayISO <= p.to);
    const outletOk = !p.outlets?.length || p.outlets.includes(curOid);
    if (!dayOk || !dateOk || !outletOk) return false;
    if (p.codeType === 'bulk') return p.codes?.some(c => (c.code||'').toUpperCase() === code && !c.used);
    return (p.code || '').toUpperCase() === code;
  });
  const vs = _getVS(pre);
  if (!promo) {
    toast('❌ Kode voucher tidak valid atau sudah digunakan');
    vs.code = ''; vs.promo = null;
    _renderVoucherApplied(pre, null);
    if (pre === 'no') calcO(); else calcS();
    return;
  }
  vs.code = code; vs.promo = promo;
  toast('✅ Voucher diterapkan: ' + promo.name);
  _renderVoucherApplied(pre, promo);
  if (pre === 'no') calcO(); else calcS();
}

function removeVoucherCode(pre) {
  const vs = _getVS(pre);
  vs.code = ''; vs.promo = null;
  const input = g(pre + '-voucher-input');
  if (input) input.value = '';
  _renderVoucherApplied(pre, null);
  if (pre === 'no') calcO(); else calcS();
}

function _renderVoucherApplied(pre, promo) {
  const box = g(pre + '-voucher-applied');
  const row = g(pre + '-voucher-input-row');
  if (!box) return;
  if (promo) {
    const vs = _getVS(pre);
    box.style.display = 'block';
    box.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--pl);border-radius:9px;padding:9px 12px;margin-bottom:8px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--p)">🎟️ ${esc(promo.name)}</div>
        <div style="font-size:11px;color:var(--pd);margin-top:2px">${esc(vs.code)}</div>
      </div>
      <button type="button" onclick="removeVoucherCode('${pre}')" style="border:none;background:none;cursor:pointer;color:var(--t3);font-size:20px;padding:0 0 0 8px;line-height:1">×</button>
    </div>`;
    if (row) row.style.display = 'none';
  } else {
    box.style.display = 'none'; box.innerHTML = '';
    if (row) row.style.display = 'flex';
  }
}

function _markVoucherUsed(pre, orderId) {
  const vs = _getVS(pre);
  if (!vs.promo || !vs.code) return;
  const p = (typeof promos !== 'undefined' ? promos : []).find(x => x.id === vs.promo.id);
  if (!p) return;
  if (p.codeType === 'bulk' && p.codes) {
    const entry = p.codes.find(c => (c.code||'').toUpperCase() === vs.code && !c.used);
    if (entry) { entry.used = true; entry.usedAt = new Date().toISOString(); entry.orderId = orderId; }
  }
  // single-code promos don't get "used" marked (reusable by nature)
  if (typeof syncSettings === 'function') syncSettings();
  vs.code = ''; vs.promo = null;
}

// ===== ORDER FORM =====
function buildOrderForm(pre) {
  buildOrderTypeDropdowns();
  const oel = g(pre + '-outlet');
  if (oel) {
    oel.innerHTML = outlets.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    if (pre === 'sno' && curStaff?.oid) oel.value = curStaff.oid;
    else oel.value = outlets[0]?.id || '';
  }
  // Build addons visual cards (unified for all prefixes)
  const addGrid = g(pre + '-addons');
  if (addGrid) {
    addGrid.innerHTML = addons.filter(a => a.active !== false).map(a => {
      const unit = a.unit === 'order' ? '/order' : `/${a.unit||'pcs'}`;
      const toggleFn = pre === 'no' ? `_noToggleAddon('${a.id}')` : `_toggleAddon('${pre}','${a.id}')`;
      return `<div class="no-addon-card" id="${pre}-addon-card-${a.id}" onclick="${toggleFn}">
        <div class="no-addon-check"><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="no-addon-name">${esc(a.name)}</div>
        <div class="no-addon-price">${fmt(a.price||0)}${unit}</div>
      </div>`;
    }).join('') || '<div style="color:var(--t2);font-size:13px">Belum ada layanan tambahan.</div>';
  }
  // Rebuild visual type/tier cards for all prefixes
  if (typeof _noRebuildSvcCards === 'function') {
    _noRebuildSvcCards(pre);
    _noRebuildTierCards(pre);
  }
  if (typeof _applyKgStep === 'function') _applyKgStep();
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
    // Legacy (SNO) dropdown
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
  const selId = pre + '-sat-sel';
  const satSel = g(selId);
  if (satSel) {
    const activeItems = satuanItems.filter(x => x.active !== false);
    satSel.innerHTML = activeItems.length
      ? '<option value="">-- Pilih Item --</option>' + activeItems.map(item => `<option value="${item.id}">${esc(item.name)} — ${esc(item.unit || 'pcs')}</option>`).join('')
      : '<option value="">Belum ada item satuan</option>';
  }
  // Populate tier dropdown
  const tierSel = g(pre + '-sat-tier');
  if (tierSel) {
    const activeTiers = typeof _activePoOptions === 'function' ? _activePoOptions('satuan') : [];
    tierSel.innerHTML = '<option value="">-- Opsi Harga --</option>' + activeTiers.map(po => `<option value="${po.key}">${esc(po.label)}${po.est?' ('+esc(po.est)+')':''}</option>`).join('');
  }
  _renderSatuanCartTable(pre);
}

function _renderSatuanCartTable(pre) {
  const el = g(pre + '-satuan-items'); if (!el) return;
  const cart = _getSatuanCart(pre);
  if (!cart.length) {
    el.innerHTML = '<div style="color:var(--t2);font-size:13px;padding:10px 0;text-align:center">Belum ada item. Pilih item di atas lalu klik + Tambah Item.</div>';
    return;
  }
  // Full table with OPSI HARGA + ESTIMASI columns (unified for all prefixes)
  el.innerHTML = `<div class="sat-cart-wrap">
    <table class="sat-cart-tbl">
      <thead><tr>
        <th>Item</th><th>Opsi Harga</th><th>Estimasi</th><th>Qty</th><th>Harga Satuan</th><th>Subtotal</th><th></th>
      </tr></thead>
      <tbody>
        ${cart.map((line, idx) => `<tr>
          <td><span style="font-weight:600">${esc(line.name)}</span></td>
          <td><span style="font-size:11px;background:#e8f5e9;color:#2e7d32;padding:2px 7px;border-radius:20px;font-weight:700">${esc(line.tierLabel||line.tierKey||'–')}</span></td>
          <td><span style="font-size:11px;color:var(--t2)">${esc(line.tierEst||'–')}</span></td>
          <td>${line.qty} ${esc(line.unit||'pcs')}</td>
          <td>${fmt(line.unitPrice)}</td>
          <td style="font-weight:700">${fmt(line.lineTotal)}</td>
          <td><button onclick="removeFromSatuanCart('${pre}',${idx})" style="border:none;background:none;color:var(--t2);cursor:pointer;font-size:16px;padding:0 4px;line-height:1" title="Hapus">×</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function _updateSatPrice(pre='no'){
  const selEl=g(pre+'-sat-sel');
  const tierEl=g(pre+'-sat-tier');
  const estEl=g(pre+'-sat-est');
  const priceEl=g(pre+'-sat-price');
  if(!selEl||!tierEl) return;
  const itemId=selEl.value;
  const item=satuanItems.find(x=>x.id===itemId);
  // Rebuild tier dropdown filtered by selected item's tierApply
  if(tierEl&&typeof _activePoOptions==='function'){
    const prevTier=tierEl.value;
    const baseTiers=_activePoOptions('satuan');
    const availTiers=item?baseTiers.filter(po=>(item.tierApply||{})[po.key]!==false):baseTiers;
    tierEl.innerHTML='<option value="">-- Opsi Harga --</option>'+availTiers.map(po=>`<option value="${po.key}">${esc(po.label)}${po.est?' ('+esc(po.est)+')':''}</option>`).join('');
    // Auto-select if only one tier available
    if(availTiers.length===1){tierEl.value=availTiers[0].key;}
    else if(availTiers.find(po=>po.key===prevTier)){tierEl.value=prevTier;}
  }
  const tierKey=tierEl.value;
  // Update estimasi badge
  const po=typeof priceOptions!=='undefined'?priceOptions.find(p=>p.key===tierKey):null;
  if(estEl){
    if(po&&po.est){estEl.textContent=po.est;estEl.style.display='inline-flex';}
    else estEl.style.display='none';
  }
  // Update price display
  if(priceEl){
    if(item&&tierKey){
      const p=item.prices?.[tierKey]||0;
      priceEl.textContent=p?'Harga Satuan '+fmt(p):'Harga: –';
    } else {
      priceEl.textContent='';
    }
  }
}
function _noUpdateSatPrice(){_updateSatPrice('no');}
function _snoUpdateSatPrice(){_updateSatPrice('sno');}

function addToSatuanCart(pre) {
  const selEl = g(pre + '-sat-sel');
  const qtyEl = g(pre + '-sat-qty');
  if (!selEl || !selEl.value) { toast('⚠️ Pilih item terlebih dahulu'); return; }
  if (!qtyEl || parseInt(qtyEl.value) < 1) { toast('⚠️ Qty harus minimal 1'); return; }
  const qty = parseInt(qtyEl?.value) || 1;
  const itemId = selEl.value;
  const item = satuanItems.find(x => x.id === itemId); if (!item) return;
  // Per-item tier selection (unified for all prefixes)
  const tierEl = g(pre + '-sat-tier');
  if (!tierEl || !tierEl.value) { toast('⚠️ Pilih opsi harga terlebih dahulu'); return; }
  const tierKey = tierEl.value;
  const po = typeof priceOptions !== 'undefined' ? priceOptions.find(p => p.key === tierKey) : null;
  const tierLabel = po?.label || tierKey;
  const tierEst = po?.est || '';
  const unitPrice = item.prices?.[tierKey] || 0;
  const cart = _getSatuanCart(pre);
  // Each item+tier combo is a separate line
  const existing = cart.find(l => l.id === itemId && l.tierKey === tierKey);
  if (existing) { existing.qty += qty; existing.lineTotal = existing.unitPrice * existing.qty; }
  else { cart.push({ id: itemId, name: item.name, unit: item.unit || 'pcs', qty, unitPrice, lineTotal: unitPrice * qty, tierKey, tierLabel, tierEst }); }
  if (qtyEl) qtyEl.value = '1';
  _renderSatuanCartTable(pre);
  _updateSatPrice(pre);
  if (pre === 'no') calcO(); else calcS();
}

function removeFromSatuanCart(pre, idx) {
  const cart = _getSatuanCart(pre);
  cart.splice(idx, 1);
  _renderSatuanCartTable(pre);
  if (pre === 'no') calcO(); else calcS();
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
    if (p.useCode) return false; // code-required promos only apply via voucher input
    const dm = p.days.length === 0 || p.days.includes(String(TODAY_DAY));
    const dateOk = (!p.from || TODAY_ISO >= p.from) && (!p.to || TODAY_ISO <= p.to);
    const outletOk = !p.outlets || p.outlets.length === 0 || p.outlets.includes(curOid);
    if (!dm || !dateOk || !outletOk) return false;
    if (p.targets) {
      if (type === 'satuan') {
        const st = p.targets.satuan || [];
        if (!st.length) return false;
        if (st[0] === 'all') return true;
        return st.some(t => t.endsWith('-' + cat) || t === cat);
      } else {
        const kt = p.targets.kiloan || [];
        if (!kt.length) return false;
        if (kt[0] === 'all') return true;
        return kt.includes(cat);
      }
    }
    const svcOk = p.svc === 'all' || p.svc === key || p.svc === type + '-all';
    return svcOk;
  });
}

function calcPromoDisc(p, base, qty) {
  if (!p) return 0;
  if (p.discType === 'persen')     return base * (p.discVal / 100);
  if (p.discType === 'flat')       return p.discVal;
  if (p.discType === 'persen_qty') return base * (p.discVal / 100) * qty;
  if (p.discType === 'per_qty')    return p.discVal * qty;
  return p.discVal * qty;
}

function discTypeChange(pre) {
  const t = g(pre + '-disc-type')?.value || 'none';
  const w = g(pre + '-dv-w'); if (w) w.style.display = t === 'none' ? 'none' : 'block';
  const dl = g(pre + '-dv-lbl'); if (dl) dl.textContent = { persen: 'Nilai (%)', flat: 'Nominal (Rp)', per_qty: 'Per Kg/Pcs (Rp)' }[t] || 'Nilai';
}

function calcBase(pre) {
  const typeEl = g(pre + '-type');
  const catEl = g(pre + '-cat');
  if (!typeEl || !catEl) return { type: 'kiloan', cat: 'regular', rawQty: 1, bq: 1, base: 0, addTotal: 0, addonLines: [], subtotal: 0, actPromo: null, satuanLines: [] };
  const type = typeEl.value, cat = catEl.value;
  // Use priceOptions for est if available
  const poEst = (typeof priceOptions !== 'undefined' ? priceOptions.find(po => po.key === cat)?.est : null);
  const EST = { regular: '2-3 hari', sameday: '± 8 jam', express: '1 hari' };
  const est = g(pre + '-est'); if (est) est.value = poEst != null ? poEst : (EST[cat] || '');

  // Helper to check addon selection (card for all prefixes, checkbox as fallback)
  function isAddonSelected(a) {
    const card = g(pre + '-addon-card-' + a.id);
    if (card) return card.classList.contains('on');
    const ck = g(pre + '-ck-' + a.id);
    return ck && ck.checked;
  }

  if (type === 'satuan') {
    // Cart-based: read from _getSatuanCart (always use per-item tierKey)
    const cart = _getSatuanCart(pre);
    const satuanLines = cart.map(line => {
      const item = satuanItems.find(x => x.id === line.id);
      const tierKey = line.tierKey || cat;
      const unitPrice = item ? (item.prices?.[tierKey] || 0) : line.unitPrice;
      return { id: line.id, name: line.name, unit: line.unit || 'pcs', qty: line.qty, unitPrice, lineTotal: unitPrice * line.qty, tierKey: line.tierKey };
    });
    // Sync prices back to cart
    cart.forEach((line, i) => { line.unitPrice = satuanLines[i].unitPrice; line.lineTotal = satuanLines[i].lineTotal; });
    const base = satuanLines.reduce((s, l) => s + l.lineTotal, 0);
    const bq = satuanLines.reduce((s, l) => s + l.qty, 0);
    let addTotal = 0; const addonLines = [];
    addons.forEach(a => {
      if (isAddonSelected(a)) { const v = a.unit === 'per_qty' ? a.price * bq : a.price; addTotal += v; addonLines.push({ n: a.name, v }); }
    });
    return { type, cat, rawQty: bq, bq, base, addTotal, addonLines, subtotal: base + addTotal, actPromo: getActivePromo(type, cat), satuanLines };
  }

  // Kiloan: support both 'no-kg' (new UI) and 'no-qty' (legacy/SNO)
  const qtyInput = pre === 'no' ? (g('no-kg') || g('no-qty')) : g(pre + '-qty');
  const rawQty = parseFloat(qtyInput?.value) || 1;
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
    if (isAddonSelected(a)) { const v = a.unit === 'per_qty' ? a.price * bq : a.price; addTotal += v; addonLines.push({ n: a.name, v }); }
  });
  return { type, cat, rawQty, bq, base, addTotal, addonLines, subtotal: base + addTotal, actPromo: getActivePromo(type, cat), satuanLines: [] };
}

function doCalc(pre, hasDisc) {
  const res = calcBase(pre);
  const { type, cat, bq, base, addTotal, addonLines, subtotal, satuanLines } = res;
  // Voucher promo overrides auto-detected promo; dismissed promos are skipped
  const vs = _getVS(pre);
  const isVoucher = !!vs.promo;
  const autoPromo = (_dismissedPromo[pre] && res.actPromo?.id === _dismissedPromo[pre]) ? null : res.actPromo;
  const actPromo = vs.promo || autoPromo;
  let promoAmt = actPromo ? Math.min(calcPromoDisc(actPromo, subtotal, bq), subtotal) : 0;
  const pb = g(pre + '-promo-box');
  if (autoPromo && !isVoucher && pb) {
    // Show auto-promo box with X dismiss button
    const discLbl = autoPromo.discType === 'persen' ? autoPromo.discVal + '%' : fmt(calcPromoDisc(autoPromo, subtotal, bq));
    pb.style.display = 'block';
    pb.innerHTML = `<div class="pb-act" style="display:flex;align-items:center;justify-content:space-between;gap:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">🎟️</span><div><div style="font-weight:700;font-size:13px;color:#3d6b10">${esc(autoPromo.name)}</div><div style="font-size:11px;color:#4a7a15">${esc(discLbl)} diskon otomatis</div></div></div><button type="button" onclick="dismissAutoPromo('${pre}')" style="border:none;background:none;cursor:pointer;color:var(--t3);font-size:20px;padding:0 4px;line-height:1;flex-shrink:0" title="Hapus promo ini">×</button></div>`;
  } else if (pb) { pb.style.display = 'none'; pb.innerHTML = ''; }
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
  return { type, cat, bq, rawQty: res.rawQty, base, addTotal, addonLines, promoAmt, discType, discAmt, total, actPromo, subtotal, satuanLines };
}

function _noToggleAddon(id) {
  const card = g('no-addon-card-' + id);
  if (card) card.classList.toggle('on');
  calcO();
}
function _toggleAddon(pre, id) {
  const card = g(pre + '-addon-card-' + id);
  if (card) card.classList.toggle('on');
  if (pre === 'no') calcO(); else calcS();
}

function _noTogglePromo(pre='no') {
  const box = g(pre+'-promo-box');
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function _noUpdateSummary(res, pre='no') {
  const el = g(pre+'-sum-body'); if (!el) return;
  const name = (g(pre+'-name')?.value||'').trim();
  const phone = (g(pre+'-phone')?.value||'').trim();
  const outletId = g(pre+'-outlet')?.value;
  const outletName = (typeof outlets !== 'undefined' ? outlets.find(o=>String(o.id)===String(outletId))?.name : null) || outletId || '–';

  if (!res) {
    el.innerHTML = '<div style="padding:20px;color:var(--t2);font-size:13px;text-align:center">Isi form di sebelah kiri untuk melihat ringkasan pesanan.</div>';
    return;
  }

  // Customer avatar initials
  const initials = name ? name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2) : '?';
  const custHtml = `<div class="no-sum-cust">
    <div class="no-sum-av">${initials}</div>
    <div class="no-sum-av-info">
      <div class="no-sum-av-name">${esc(name||'Pelanggan Baru')}</div>
      <div class="no-sum-av-phone">${esc(phone||'–')}</div>
    </div>
  </div>`;

  // Outlet row
  const outletHtml = `<div class="no-sum-sect-lbl">Outlet</div>
    <div class="no-sum-row"><span>${esc(outletName)}</span></div>`;

  // Items section
  let itemsHtml = '';
  if (res.type === 'satuan' && res.satuanLines && res.satuanLines.length) {
    const cnt = res.satuanLines.length;
    itemsHtml = `<div class="no-sum-sect-lbl">Item Pesanan (${cnt})</div>
      <div>${res.satuanLines.map(line=>{
        const cartLine = _getSatuanCart(pre).find(l=>l.id===line.id&&l.tierKey===line.tierKey);
        const tierLbl = cartLine?.tierLabel || '';
        const tierEst = cartLine?.tierEst || '';
        return `<div class="no-sum-item-row">
          <div class="no-sum-item-name">
            <span>${esc(line.name)}</span>
            <span class="no-sum-item-badge">${tierLbl?esc(tierLbl)+(tierEst?' · '+esc(tierEst):''):''} × ${line.qty} ${esc(line.unit||'pcs')}</span>
          </div>
          <div class="no-sum-item-val">${fmt(line.lineTotal)}</div>
        </div>`;
      }).join('')}</div>`;
  } else if (res.type === 'kiloan' || (res.type !== 'satuan')) {
    const tierLbl = (typeof priceOptions!=='undefined'?priceOptions.find(p=>p.key===res.cat)?.label:null)||res.cat||'';
    const svcName = (typeof serviceTypes!=='undefined'?serviceTypes.find(s=>s.id===res.type)?.name:null)||'Kiloan';
    const itemCnt = parseInt(g(pre+'-item-count')?.value)||null;
    itemsHtml = `<div class="no-sum-sect-lbl">Item Pesanan</div>
      <div class="no-sum-item-row">
        <div class="no-sum-item-name">
          <span>${esc(svcName)}</span>
          <span class="no-sum-item-badge">${esc(tierLbl)} · ${res.rawQty||0} kg${itemCnt?` · ${itemCnt} item`:''}</span>
        </div>
        <div class="no-sum-item-val">${fmt(res.base||0)}</div>
      </div>`;
  }

  // Addons
  let addonsHtml = '';
  if (res.addonLines && res.addonLines.length) {
    addonsHtml = `<div class="no-sum-sect-lbl">Layanan Tambahan (${res.addonLines.length})</div>
      <div>${res.addonLines.map(a=>`<div class="no-sum-item-row">
        <div class="no-sum-item-name">${esc(a.n||a.name)}</div>
        <div class="no-sum-item-val">${fmt(a.v||a.total||0)}</div>
      </div>`).join('')}</div>`;
  }

  // Subtotal + discount + total
  const promoAmt = res.promoAmt || 0;
  const manualDiscAmt = res.discAmt || 0;
  const total = res.total || Math.max(0, (res.subtotal||0) - promoAmt - manualDiscAmt);

  let financeHtml = `<div class="no-sum-row" style="margin-top:10px"><span style="color:var(--t2)">Subtotal</span><span style="font-weight:600">${fmt(res.subtotal||0)}</span></div>`;
  if (promoAmt > 0 && res.actPromo) {
    financeHtml += `<div class="no-sum-row"><span style="color:#e53935">Diskon (${esc(res.actPromo?.name||'Promo')})</span><span style="color:#e53935;font-weight:600">–${fmt(promoAmt)}</span></div>`;
  }
  if (manualDiscAmt > 0) {
    financeHtml += `<div class="no-sum-row"><span style="color:#e53935">Diskon Manual</span><span style="color:#e53935;font-weight:600">–${fmt(manualDiscAmt)}</span></div>`;
  }
  financeHtml += `<a class="no-sum-discount" onclick="_noTogglePromo('${pre}')">+ Tambah Diskon</a>`;
  financeHtml += `<div class="no-sum-row total"><span>Total</span><span>${fmt(total)}</span></div>`;

  el.innerHTML = custHtml + outletHtml + itemsHtml + addonsHtml + financeHtml;

  // Update total element (for calcChg) and change display
  const tv = g(pre+'-total'); if (tv) tv.textContent = fmt(total);
  const cash = parseFloat(g(pre+'-cash')?.value||'0')||0;
  const chgEl = g(pre+'-chg'); if(chgEl) chgEl.textContent = fmt(Math.max(0,cash-total));
}

// New order wrappers for new HTML
function searchCust(pre, val) {
  // Adapts the new no-cust-search input to work with custSearch/pickCust logic
  const q = (val||'').toLowerCase().trim();
  const resultsEl = g(pre + '-cust-results');
  if (!resultsEl) { custSearch(pre); return; }
  if (!q) { resultsEl.innerHTML = ''; return; }
  const matches = Object.values(customers).filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  ).slice(0,8);
  if (!matches.length) { resultsEl.innerHTML = ''; return; }
  resultsEl.innerHTML = `<div style="position:absolute;top:0;left:0;right:0;background:var(--ca);border:1.5px solid var(--p);border-radius:var(--rs);box-shadow:var(--sh2);z-index:100;max-height:220px;overflow-y:auto">${
    matches.map(c => {
      const bal = c.balance||0;
      const balBadge = typeof membershipEnabled !== 'undefined' && membershipEnabled && bal > 0
        ? `<span style="font-size:11px;font-weight:700;color:var(--p);background:var(--pl);padding:1px 8px;border-radius:10px;margin-left:6px">💳 ${fmt(bal)}</span>`
        : '';
      return `<div onclick="pickNewCust('${pre}','${esc(c.phone)}')" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--b1)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
        <div style="font-weight:600;font-size:13px">${esc(c.name)}${balBadge}</div>
        <div style="font-size:12px;color:var(--t2)">${esc(c.phone)}</div>
      </div>`;
    }).join('')
  }</div>`;
}

function pickNewCust(pre, phone) {
  const c = customers[phone]; if (!c) return;
  const nameEl = g(pre+'-name'); if (nameEl) nameEl.value = c.name;
  const phoneEl = g(pre+'-phone'); if (phoneEl) phoneEl.value = c.phone;
  const srchEl = g(pre+'-cust-search'); if (srchEl) srchEl.value = '';
  const resEl = g(pre+'-cust-results'); if (resEl) resEl.innerHTML = '';
  if (pre === 'no') calcO(); else calcS();
}

function submitOrder() {
  submitO('o');
}

function saveDraft() {
  const name = (g('no-name')?.value||'').trim();
  if (!name) { toast('⚠️ Isi nama pelanggan terlebih dahulu'); return; }
  toast('✓ Draft disimpan: ' + name);
}

function calcO() { const res = doCalc('no', true); if (typeof _noUpdateSummary === 'function') _noUpdateSummary(res, 'no'); else calcChg('no'); }
function calcS() { const res = doCalc('sno', false); if (typeof _noUpdateSummary === 'function') _noUpdateSummary(res, 'sno'); else calcChg('sno'); }
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
  // Read addons: card state (checkbox as fallback)
  const addOns = [];
  addons.forEach(a => {
    const card = g(pre + '-addon-card-' + a.id);
    if (card && card.classList.contains('on')) { addOns.push({ id: a.id, name: a.name }); return; }
    const ck = g(pre + '-ck-' + a.id);
    if (ck && ck.checked) addOns.push({ id: a.id, name: a.name });
  });
  // Normalize payment method and status for 'no' prefix (new values)
  const pmRaw = g(pre + '-pm')?.value || 'Tunai';
  const psRaw = g(pre + '-ps')?.value || 'Belum Bayar';
  const pmMap = { cash: 'Tunai', transfer: 'Transfer', qris: 'QRIS', other: 'Lainnya' };
  const psMap = { paid: 'Lunas', dp: 'DP', unpaid: 'Belum Bayar' };
  const payMethod = (pre === 'no' ? (pmMap[pmRaw] || pmRaw) : pmRaw);
  const payStatus = (pre === 'no' ? (psMap[psRaw] || psRaw) : psRaw);
  const o = {
    id: genId(), name, phone, svcType: res.type, svcCat: res.cat,
    qty: res.bq, rawQty: res.rawQty, itemCount: parseInt(g(pre+'-item-count')?.value)||null,
    satuanLines: res.satuanLines || [], addOns, addOnAmt: res.addTotal,
    base: res.base, discType: res.discType, discAmt: res.discAmt,
    promoAmt: res.promoAmt, total: res.total,
    payMethod, payStatus,
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
  // Mark voucher code as used (for bulk unique codes)
  _markVoucherUsed(pre, o.id);
  // Reset voucher + dismissed promo state
  _renderVoucherApplied(pre, null);
  const vi = g(pre + '-voucher-input'); if (vi) vi.value = '';
  _dismissedPromo[pre] = null;
  if (phone !== '—') addCust(name, phone, o.total, TODAY_STR);
  if (o.payMethod === 'Tunai' && o.payStatus === 'Lunas')
    kasLog.push({ id: kasCtr++, type: 'in', desc: 'Penjualan Cash', note: name + ' · ' + o.id, amount: o.total, time: NOW(), date: TODAY_ISO, outletId: o.outletId });
  if (membershipEnabled && o.payMethod === 'Dompet Member' && phone !== '—') {
    const cust = customers[phone];
    if (cust) {
      cust.balance = (cust.balance||0) - o.total;
      const txnId = 'MBR-'+String(memberTxnCtr++).padStart(5,'0');
      memberTxns.push({ id: txnId, phone, type: 'deduct', amount: o.total, baseAmount: null, bonusAmount: null, note: null, orderId: o.id, time: NOW() });
    }
  }
  [pre + '-name', pre + '-phone', pre + '-note', pre + '-cash'].forEach(id => { const el = g(id); if (el) el.value = ''; });
  addons.forEach(a => {
    const card = g(pre + '-addon-card-' + a.id); if (card) card.classList.remove('on');
    const ck = g(pre + '-ck-' + a.id); if (ck) ck.checked = false;
  });
  if (pre === 'no') {
    const kgEl = g('no-kg'); if (kgEl) kgEl.value = '1';
    const icEl = g('no-item-count'); if (icEl) icEl.value = '';
  } else {
    const kgEl = g('sno-qty'); if (kgEl) kgEl.value = '1';
    const icEl = g('sno-item-count'); if (icEl) icEl.value = '';
  }
  const qq = g(pre + '-qty'); if (qq) qq.value = '1';
  const dt = g(pre + '-disc-type'); if (dt) dt.value = 'none';
  const dv = g(pre + '-disc-val'); if (dv) dv.value = '0';
  const dw = g(pre + '-dv-w');  if (dw) dw.style.display = 'none';
  const ps = g(pre + '-ps');    if (ps) ps.value = pre === 'no' ? 'unpaid' : 'Belum Bayar';
  const dpg = g(pre + '-dp-g'); if (dpg) dpg.style.display = 'none';
  // Reset satuan cart (new cart-based approach)
  _setSatuanCart(pre, []);
  if (res.type === 'satuan') buildSatuanOrderItems(pre);
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
function setOrdOutlet(id) { ordOutlet = id; _ordPage = 1; _renderOrdFilterChips(); renderOrders(); }
function setOrdFst(v) { ordFst = v; _ordPage = 1; _renderOrdFilterChips(); renderOrders(); }
function setOrdFpy(v) { ordFpy = v; _ordPage = 1; _renderOrdFilterChips(); renderOrders(); }

function setOrdDateFilter(f) {
  ordDateFilter = f; _ordPage = 1;
  // Keep staff date chips working
  ['all','today','week','month','custom'].forEach(k => {
    const sb = g('sodf-'+k); if (sb) sb.className = 'chip' + (f===k?' on':'');
  });
  const scr = g('sodf-custom-range'); if (scr) scr.style.display = f==='custom'?'flex':'none';
  // Update owner filter panel
  _renderOrdFilterChips();
  const ocr = g('orf-custom-range'); if (ocr) ocr.style.display = f==='custom'?'flex':'none';
  renderOrders();
}

function resetOrdFilters() {
  ordOutlet = 'all'; ordFst = ''; ordFpy = ''; ordDateFilter = 'all'; _ordPage = 1;
  const ocr = g('orf-custom-range'); if (ocr) ocr.style.display = 'none';
  _renderOrdFilterChips();
  renderOrders();
}

function setOrdPage(p) {
  _ordPage = Math.max(1, p);
  renderOrders();
}

function openOrdFilterPanel() {
  // Hide outlet section for staff (they always see only their outlet)
  const orfOutletSec = g('orf-outlet')?.closest('.orf-section');
  if (orfOutletSec) orfOutletSec.style.display = curRole === 'owner' ? '' : 'none';
  // Outlet chips
  const oc = g('orf-outlet');
  if (oc) oc.innerHTML = [{id:'all',name:'Semua'},...outlets.map(o=>({id:o.id,name:o.name}))]
    .map(o=>`<button class="orf-chip${ordOutlet===o.id?' on':''}" onclick="setOrdOutlet('${o.id}')">${esc(o.name)}</button>`).join('');
  // Status chips
  const sc = g('orf-status');
  if (sc) sc.innerHTML = ['Semua',...STATUS_LIST]
    .map(s=>`<button class="orf-chip${(s==='Semua'?ordFst==='':ordFst===s)?' on':''}" onclick="setOrdFst('${s==='Semua'?'':s}')">${esc(s)}</button>`).join('');
  // Pay chips
  const pc = g('orf-pay');
  if (pc) pc.innerHTML = ['Semua','Belum Bayar','DP','Lunas']
    .map(p=>`<button class="orf-chip${(p==='Semua'?ordFpy==='':ordFpy===p)?' on':''}" onclick="setOrdFpy('${p==='Semua'?'':p}')">${esc(p)}</button>`).join('');
  // Date chips
  const dc = g('orf-date');
  if (dc) dc.innerHTML = [{v:'all',l:'Semua'},{v:'today',l:'Hari Ini'},{v:'week',l:'Minggu Ini'},{v:'month',l:'Bulan Ini'},{v:'custom',l:'Custom'}]
    .map(d=>`<button class="orf-chip${ordDateFilter===d.v?' on':''}" onclick="setOrdDateFilter('${d.v}')">${esc(d.l)}</button>`).join('');
  const ocr = g('orf-custom-range'); if (ocr) ocr.style.display = ordDateFilter==='custom'?'flex':'none';
  openModal('m-ord-filter');
}

// Re-render just the chips inside the open filter panel (keeps .on state in sync)
function _renderOrdFilterChips() {
  document.querySelectorAll('#orf-outlet .orf-chip').forEach(b => b.classList.toggle('on', b.textContent.trim()==='Semua'?ordOutlet==='all':b.onclick?.toString().includes(`'${ordOutlet}'`)));
  document.querySelectorAll('#orf-status .orf-chip').forEach(b => { const v=b.getAttribute('onclick')?.match(/setOrdFst\('([^']*)'\)/)?.[1]??null; if(v!==null) b.classList.toggle('on',v===ordFst); });
  document.querySelectorAll('#orf-pay    .orf-chip').forEach(b => { const v=b.getAttribute('onclick')?.match(/setOrdFpy\('([^']*)'\)/)?.[1]??null; if(v!==null) b.classList.toggle('on',v===ordFpy); });
  document.querySelectorAll('#orf-date   .orf-chip').forEach(b => { const v=b.getAttribute('onclick')?.match(/setOrdDateFilter\('([^']*)'\)/)?.[1]??null; if(v!==null) b.classList.toggle('on',v===ordDateFilter); });
}

function _renderOrdActiveChips() {
  const isO = curRole === 'owner';
  const wrap = g(isO ? 'ord-active-chips' : 's-ord-active-chips'); if (!wrap) return;
  const dtL = {today:'Hari Ini',week:'Minggu Ini',month:'Bulan Ini',custom:'Custom'};
  const chips = [];
  if (isO && ordOutlet !== 'all') { const oc=go(ordOutlet); chips.push(`<span class="ofc ofc-out">${esc(oc?.name||ordOutlet)}<button class="ofc-x" onclick="setOrdOutlet('all')">×</button></span>`); }
  if (ordFst !== '')     chips.push(`<span class="ofc ofc-st">${esc(ordFst)}<button class="ofc-x" onclick="setOrdFst('')">×</button></span>`);
  if (ordFpy !== '')     { const cls=ordFpy==='Lunas'?'ofc-pay-ok':ordFpy==='DP'?'ofc-pay-dp':'ofc-pay-no'; chips.push(`<span class="ofc ${cls}">${esc(ordFpy)}<button class="ofc-x" onclick="setOrdFpy('')">×</button></span>`); }
  if (ordDateFilter!=='all') chips.push(`<span class="ofc ofc-dt">${dtL[ordDateFilter]||ordDateFilter}<button class="ofc-x" onclick="setOrdDateFilter('all')">×</button></span>`);
  wrap.innerHTML = chips.join('');
  wrap.style.display = chips.length ? 'flex' : 'none';
  const cnt = chips.length;
  const badge = g(isO ? 'ord-filter-badge' : 's-ord-filter-badge'); if (badge) { badge.textContent=cnt; badge.style.display=cnt?'inline':'none'; }
  const btn = g(isO ? 'ord-filter-btn' : 's-ord-filter-btn'); if (btn) btn.className = 'btn bsm'+(cnt?' bp':'');
}

function _newCustBadge(o) {
  if (!o.phone || o.phone === '—') return '';
  const c = (typeof customers !== 'undefined') ? customers[o.phone] : null;
  if (!c || c.orders !== 1) return '';
  return '<span class="badge-new-cust">NEW</span>';
}

function renderOrders() {
  const isO = curRole === 'owner';
  const q = ((isO ? g('o-srch') : g('s-srch'))?.value || '').toLowerCase();
  const fs = ordFst;
  const fp = ordFpy;

  // Date filter range
  let dateFrom = null, dateTo = null;
  if (ordDateFilter === 'today') {
    dateFrom = dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'week') {
    const _d = new Date(); _d.setHours(0,0,0,0);
    const _dow = (_d.getDay() + 6) % 7;
    const _wkStart = new Date(_d); _wkStart.setDate(_wkStart.getDate() - _dow);
    dateFrom = _isoStr(_wkStart); dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'month') {
    const _d = new Date();
    dateFrom = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-01`;
    dateTo = TODAY_ISO;
  } else if (ordDateFilter === 'custom') {
    dateFrom = g('o-date-from')?.value || g('s-date-from')?.value || '';
    dateTo   = g('o-date-to')?.value   || g('s-date-to')?.value   || '';
  }

  const fullList = orders.filter(o => {
    const matchQ = !q || o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || (o.phone && o.phone.includes(q));
    const matchS = !fs || o.status === fs;
    const matchP = !fp || o.payStatus === fp;
    const matchO = isO ? (ordOutlet === 'all' || o.outletId === ordOutlet) : (curStaff ? o.outletId === curStaff.oid : true);
    const oDate = _orderDateISO(o);
    const matchD = !dateFrom || (oDate >= dateFrom && (!dateTo || oDate <= dateTo));
    return matchQ && matchS && matchP && matchO && matchD;
  }).slice().sort((a, b) => (b.isoDate || '').localeCompare(a.isoDate || ''));

  const _PER_PAGE = 10;
  const _totalPages = Math.max(1, Math.ceil(fullList.length / _PER_PAGE));
  if (_ordPage > _totalPages) _ordPage = _totalPages;
  const list = fullList.slice((_ordPage - 1) * _PER_PAGE, _ordPage * _PER_PAGE);

  _renderOrdActiveChips();

  // Mobile cards
  const cardWrap = g(isO ? 'ord-cards' : 's-ord-cards');
  if (cardWrap) _renderOrdCards(list, cardWrap);

  // Table
  const tbId = isO ? 'ord-tb' : 's-ord-tb';
  const tb = g(tbId); if (!tb) return;
  const colspan = isO ? 11 : 10;
  if (!fullList.length) {
    tb.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;padding:24px;color:var(--t2)">Tidak ada pesanan ditemukan</td></tr>`;
    if (isO) _renderOrdPager(0, 1);
    return;
  }
  const waBtn = o => (o.status === 'Selesai' || o.status === 'Diambil')
    ? (o.waSent ? `<span class="badge gg">✓</span>` : `<button class="btn bp bsm" onclick="openWaMod('${o.id}')">💬</button>`)
    : '—';
  if (isO) {
    tb.innerHTML = list.map(o => { const _oc=go(o.outletId);const _osc=_oc?.color?safeColor(_oc.color):'#ccc';return `<tr>
      <td style="font-size:11px;font-family:monospace;white-space:nowrap">${esc(o.id)}</td>
      <td><div style="font-weight:600">${esc(o.name)}${_newCustBadge(o)}</div><div style="font-size:11px;color:var(--t2)">${esc(o.phone)}</div></td>
      <td><span style="font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;background:${_osc}18;color:${_oc?.color?safeColor(_oc.color):'#666'}">${esc(_oc?.name || '—')}</span></td>
      <td style="font-size:12px;white-space:nowrap;text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</td>
      <td style="font-weight:700;white-space:nowrap">${fmt(o.total)}</td>
      <td><span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span></td>
      <td><button class="badge ${SL_PAY[o.payStatus]}" style="cursor:pointer;border:none;font-family:inherit;font-size:inherit" onclick="openPayPicker('${o.id}',this)">${esc(o.payStatus)}</button></td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.date||'—')}</td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.pickupDate||'—')}</td>
      <td>${waBtn(o)}</td>
      <td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="showDetail('${o.id}')">Detail</button><button class="btn bsm" onclick="showRcpt('${o.id}')">Struk</button><button class="btn bsm" onclick="copyTrackingLink('${o.id}')" title="Salin link tracking pelanggan">🔗</button><button class="btn bsm bre" onclick="deleteOrder('${o.id}')">Hapus</button></div></td>
    </tr>`; }).join('');
  } else {
    tb.innerHTML = list.map(o => `<tr>
      <td style="font-size:11px;font-family:monospace;white-space:nowrap">${esc(o.id)}</td>
      <td><div style="font-weight:600">${esc(o.name)}${_newCustBadge(o)}</div><div style="font-size:11px;color:var(--t2)">${esc(o.phone)}</div></td>
      <td style="font-size:12px;white-space:nowrap;text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</td>
      <td style="font-weight:700;white-space:nowrap">${fmt(o.total)}</td>
      <td><span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span></td>
      <td><button class="badge ${SL_PAY[o.payStatus]}" style="cursor:pointer;border:none;font-family:inherit;font-size:inherit" onclick="openPayPicker('${o.id}',this)">${esc(o.payStatus)}</button></td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.date||'—')}</td>
      <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.pickupDate||'—')}</td>
      <td>${waBtn(o)}</td>
      <td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="showDetail('${o.id}')">Detail</button><button class="btn bsm" onclick="showRcpt('${o.id}')">Struk</button><button class="btn bsm" onclick="copyTrackingLink('${o.id}')" title="Salin link tracking pelanggan">🔗</button></div></td>
    </tr>`).join('');
  }
  _renderOrdPager(fullList.length, _totalPages);
}

function _renderOrdPager(total, totalPages) {
  const wrap = g(curRole === 'owner' ? 'ord-pager' : 's-ord-pager'); if (!wrap) return;
  if (totalPages <= 1) { wrap.innerHTML = ''; return; }
  const p = _ordPage;
  let btns = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= p - 1 && i <= p + 1)) {
      btns += `<button class="btn bsm${i === p ? ' bp' : ''}" onclick="setOrdPage(${i})" style="min-width:32px;padding:4px 8px">${i}</button>`;
    } else if (i === p - 2 || i === p + 2) {
      btns += `<span style="align-self:center;color:var(--t2);padding:0 2px;font-size:13px">…</span>`;
    }
  }
  wrap.innerHTML = `<div style="display:flex;align-items:center;gap:5px;justify-content:center;padding:12px 0 4px;flex-wrap:wrap">
    <span style="font-size:11px;color:var(--t2);margin-right:4px">${total} pesanan</span>
    <button class="btn bsm" onclick="setOrdPage(${p - 1})" ${p === 1 ? 'disabled' : ''} style="min-width:32px;padding:4px 8px">‹</button>
    ${btns}
    <button class="btn bsm" onclick="setOrdPage(${p + 1})" ${p === totalPages ? 'disabled' : ''} style="min-width:32px;padding:4px 8px">›</button>
  </div>`;
}

function copyTrackingLink(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  if (!o.tracking_token) {
    o.tracking_token = genTrackingToken();
    if (typeof syncOrder === 'function') syncOrder(o);
  }
  const url = window.location.origin + window.location.pathname + '?track=' + o.tracking_token;
  navigator.clipboard.writeText(url).then(() => {
    toast('🔗 Link tracking disalin!');
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    toast('🔗 Link tracking disalin!');
  });
}

const _IC_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const _IC_LINK = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const _IC_RECEIPT = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
const _IC_MSG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const _IC_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const _IC_TRASH = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

function _renderOrdCards(list, wrap) {
  if (!list.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = list.map(o => {
    const _oc = go(o.outletId);
    const _ocColor = _oc?.color ? safeColor(_oc.color) : '#aaa';
    const initials = o.name ? o.name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase() : '?';
    const canWa = o.status === 'Selesai' || o.status === 'Diambil';
    const waAct = canWa ? (o.waSent
      ? `<button class="oib grn" disabled title="WA terkirim" style="opacity:.5">${_IC_CHECK}</button>`
      : `<button class="oib grn" onclick="openWaMod('${esc(o.id)}')" title="Kirim WA">${_IC_MSG}</button>`) : '';
    return `<div class="ocard">
      <div class="ocard-hd" onclick="toggleOrdCard('${esc(o.id)}')">
        <div class="ocard-av">${initials}</div>
        <div class="ocard-info">
          <div class="ocard-name">${esc(o.name)}${_newCustBadge(o)}</div>
          <div class="ocard-id">${esc(o.id)}</div>
          <div class="ocard-tags">
            <span class="badge ${SL_STATUS[o.status]}">${esc(o.status)}</span>
            <span class="badge ${SL_PAY[o.payStatus]}">${esc(o.payStatus)}</span>
          </div>
        </div>
        <div class="ocard-rhs">
          <div class="ocard-total">${fmt(o.total)}</div>
          <svg class="ocard-chev" id="ochev-${esc(o.id)}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      <div class="ocard-meta">
        <span style="text-transform:capitalize">${esc(o.svcType)}·${esc(o.svcCat)}</span>
        ${_oc ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${_ocColor}"></span><span style="font-weight:600;color:${_ocColor}">${esc(_oc.name)}</span>` : ''}
        <span>${esc(o.date||'—')}</span>
      </div>
      <div class="ocard-body" id="obody-${esc(o.id)}" style="display:none">
        <div class="ocard-dg">
          <div><div class="ocard-dl">No. WA</div><div class="ocard-dv">${esc(o.phone||'—')}</div></div>
          <div><div class="ocard-dl">Outlet</div><div class="ocard-dv">${esc(_oc?.name||'—')}</div></div>
          <div><div class="ocard-dl">Total</div><div class="ocard-dv">${fmt(o.total)}</div></div>
          <div><div class="ocard-dl">Tgl Masuk</div><div class="ocard-dv">${esc(o.date||'—')}</div></div>
          ${o.pickupDate?`<div><div class="ocard-dl">Tgl Ambil</div><div class="ocard-dv">${esc(o.pickupDate)}</div></div>`:''}
          ${o.notes?`<div style="grid-column:1/-1"><div class="ocard-dl">Catatan</div><div class="ocard-dv">${esc(o.notes)}</div></div>`:''}
        </div>
        <div class="ocard-acts">
          <button class="oib blu" onclick="showDetail('${esc(o.id)}')" title="Detail">${_IC_EYE}</button>
          <button class="oib" onclick="showRcpt('${esc(o.id)}')" title="Struk">${_IC_RECEIPT}</button>
          <button class="oib" onclick="copyTrackingLink('${esc(o.id)}')" title="Salin link tracking">${_IC_LINK}</button>
          ${waAct}
          ${curRole === 'owner' ? `<button class="oib red" onclick="deleteOrder('${esc(o.id)}')" title="Hapus">${_IC_TRASH}</button>` : ''}
          <button class="btn bsm bp" onclick="openPayPicker('${esc(o.id)}',this)" style="margin-left:auto;border-radius:var(--rp)">${esc(o.payStatus)}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleOrdCard(id) {
  const body = g('obody-'+id); const chev = g('ochev-'+id); if (!body) return;
  const open = body.style.display === 'none';
  body.style.display = open ? 'block' : 'none';
  if (chev) chev.classList.toggle('open', open);
}

// ===== KANBAN / TRACKING =====
var _trkAccOpen = null;

function setTrkOutlet(id) { trkOutlet = id; renderKanban('o'); }

function _trkTime(o) {
  if (!o.isoDate) return '';
  try { const d = new Date(o.isoDate); return d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}); } catch(e) { return ''; }
}

function _trkBadge(o) {
  const c = (o.svcCat || '').toLowerCase();
  if (c.includes('express')) return '<span class="trk-badge-express">Express</span>';
  if (c.includes('sameday') || c.includes('same day')) return '<span class="trk-badge-sameday">Sameday</span>';
  return '';
}

function _trkCardHtml(o, st, role) {
  const t = _trkTime(o);
  const badge = _trkBadge(o);
  const nextMap = {Diterima:'Mencuci', Mencuci:'Mengeringkan', Mengeringkan:'Menyetrika', Menyetrika:'Selesai'};
  const ctaLbl = {Diterima:'Mulai Mencuci', Mencuci:'Lanjut Mengeringkan', Mengeringkan:'Lanjut Menyetrika', Menyetrika:'Selesaikan'};
  const next = nextMap[st];
  let ctaHtml = '';
  if (next) {
    ctaHtml = `<button class="trk-card-btn" onclick="updSt('${o.id}','${next}','${role}')">${ctaLbl[st]}</button>`;
  } else if (st === 'Selesai') {
    if (!o.waSent) {
      ctaHtml = `<div style="display:flex;flex-direction:column;gap:4px">
        <button class="trk-card-btn trk-card-btn-wa" onclick="openWaMod('${o.id}')">Kirim WA</button>
        <button class="trk-card-btn trk-card-btn-done" onclick="updSt('${o.id}','Diambil','${role}')">Sudah Diambil</button>
      </div>`;
    } else {
      ctaHtml = `<button class="trk-card-btn trk-card-btn-done" onclick="updSt('${o.id}','Diambil','${role}')">Sudah Diambil</button>`;
    }
  }
  return `<div class="trk-card">
    <div class="trk-card-id">${esc(o.id)}</div>
    <div class="trk-card-name">${esc(o.name)}</div>
    <div class="trk-card-svc">${esc(o.svcType)} · ${o.qty}${getSvcUnit(o.svcType)}</div>
    <div class="trk-card-time">${t ? `<span class="trk-card-time-txt">${t}</span>` : ''}${badge}</div>
    ${ctaHtml}
  </div>`;
}

var _TRK_COL_IC   = {Diterima:'inbox', Mencuci:'droplets', Mengeringkan:'wind', Menyetrika:'thermometer', Selesai:'check-circle'};
var _TRK_COL_BG   = {Diterima:'#e3f2fd', Mencuci:'#e8f5e9', Mengeringkan:'#f3e5f5', Menyetrika:'#fff3e0', Selesai:'#e8f5e9'};
var _TRK_COL_CLR  = {Diterima:'#1565c0', Mencuci:'#2e7d32', Mengeringkan:'#7b1fa2', Menyetrika:'#e65100', Selesai:'#2e7d32'};
var _trkShowAll = {};

function _trkShowAllToggle(st, role) {
  _trkShowAll[st] = !_trkShowAll[st];
  renderKanban(role);
}

function _trkColHtml(st, items, role) {
  const ic = _TRK_COL_IC[st] || 'circle';
  const bg = _TRK_COL_BG[st] || 'var(--pl)';
  const clr = _TRK_COL_CLR[st] || 'var(--p)';
  const MAX = 3;
  const showAll = !!_trkShowAll[st];
  const shown = showAll ? items : items.slice(0, MAX);
  const extra = items.length - MAX;
  const cards = shown.map(o => _trkCardHtml(o, st, role)).join('');
  const moreTxt = extra > 0
    ? `<button class="trk-col-more" onclick="_trkShowAllToggle('${st}','${role}')">${showAll ? 'Sembunyikan' : `+${extra} pesanan lainnya`}</button>`
    : '';
  const emptyTxt = items.length === 0 ? '<div class="trk-col-empty">Kosong</div>' : '';
  return `<div class="trk-col">
    <div class="trk-col-hd">
      <div class="trk-col-ic" style="background:${bg}"><i data-lucide="${ic}" style="color:${clr}"></i></div>
      <span class="trk-col-title" style="color:${clr}">${st}</span>
      <span class="trk-col-cnt">${items.length}</span>
    </div>
    <div class="trk-col-body">${cards}${moreTxt}${emptyTxt}</div>
  </div>`;
}

function _trkAccordionHtml(groups, role) {
  return Object.entries(groups).map(([st, items]) => {
    const ic = _TRK_COL_IC[st] || 'circle';
    const bg = _TRK_COL_BG[st] || 'var(--pl)';
    const clr = _TRK_COL_CLR[st] || 'var(--p)';
    const isOpen = _trkAccOpen === st;
    const safeId = st.replace(/\s/g, '');
    const cards = items.map(o => _trkCardHtml(o, st, role)).join('');
    return `<div>
      <div class="trk-acc-hd${isOpen ? ' on' : ''}" onclick="_trkAccToggle('${st}','${role}')">
        <div class="trk-acc-ic" style="background:${bg}"><i data-lucide="${ic}" style="color:${clr}"></i></div>
        <span class="trk-acc-title">${st}</span>
        ${items.length ? `<span class="trk-acc-cnt">${items.length}</span>` : ''}
        <svg class="trk-acc-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div id="trk-acc-body-${safeId}" style="display:${isOpen ? 'flex' : 'none'};flex-direction:column;gap:6px;padding:0 0 6px">${cards || '<div class="trk-col-empty">Kosong</div>'}</div>
    </div>`;
  }).join('');
}

function _trkAccToggle(st, role) {
  _trkAccOpen = (_trkAccOpen === st) ? null : st;
  renderKanban(role);
}

function renderKanban(role) {
  const cols = ['Diterima', 'Mencuci', 'Mengeringkan', 'Menyetrika', 'Selesai'];
  if (role === 'o') {
    const tc = g('trk-outlet-chips');
    if (tc) tc.innerHTML = buildOutletFilterChips(trkOutlet, 'setTrkOutlet');
  }
  const src = role === 'o'
    ? (trkOutlet !== 'all' ? orders.filter(o => o.outletId === trkOutlet) : orders)
    : (curStaff ? orders.filter(o => o.outletId === curStaff.oid) : orders);

  const searchId = role === 'o' ? 'trk-search' : 's-trk-search';
  const q = (g(searchId) ? g(searchId).value.trim().toLowerCase() : '');
  const filtOrders = q
    ? src.filter(o => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
    : src;

  const aId = role === 'o' ? 'o-trk-alert' : 's-trk-alert';
  const wp = filtOrders.filter(o => o.status === 'Selesai' && !o.waSent);
  const al = g(aId);
  if (al) al.innerHTML = wp.length
    ? `<div style="background:var(--pl);border:2px solid var(--p);border-radius:10px;padding:10px 14px;font-size:13px;color:#3d6b10;margin-bottom:10px;display:flex;align-items:center;gap:7px"><i data-lucide="message-circle" style="width:15px;height:15px;stroke-width:2;flex-shrink:0;display:block"></i>${wp.length} cucian selesai belum dinotif WA</div>`
    : '';

  const groups = {};
  cols.forEach(st => { groups[st] = filtOrders.filter(o => o.status === st); });

  const kb = g(role === 'o' ? 'o-kanban' : 's-kanban');
  if (kb) kb.innerHTML = cols.map(st => _trkColHtml(st, groups[st], role)).join('');

  const acc = g(role === 'o' ? 'o-trk-acc' : 's-trk-acc');
  if (acc) acc.innerHTML = _trkAccordionHtml(groups, role);

  const bbar = g(role === 'o' ? 'o-trk-bbar' : 's-trk-bbar');
  if (bbar) {
    const active = filtOrders.filter(o => o.status !== 'Diambil').length;
    const inProg = filtOrders.filter(o => !['Selesai', 'Diambil'].includes(o.status)).length;
    const selesai = groups['Selesai'].length;
    bbar.innerHTML = `
      <span class="trk-bottom-stat">Aktif: <b>${active}</b></span>
      <span class="trk-bottom-stat">Diproses: <b>${inProg}</b></span>
      <span class="trk-bottom-stat">Selesai: <b>${selesai}</b></span>
      ${wp.length ? `<span style="color:var(--am);font-weight:600;margin-left:auto">${wp.length} belum dinotif WA</span>` : ''}
    `;
  }

  lucide.createIcons();
}

function updSt(id, st, role) {
  const o = orders.find(x => x.id === id); if (!o) return;
  o.status = st;
  if (st === 'Diambil' && !o.pickupDate) o.pickupDate = TODAY_STR;
  if (st === 'Diambil' && !o.pickedUpAt) o.pickedUpAt = new Date().toISOString();
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
  var o = null;
  for (var _i = 0; _i < orders.length; _i++) { if (orders[_i].id === id) { o = orders[_i]; break; } }
  if (!o) return;
  curRcptOrderId = id;
  // Snapshot the order so Supabase realtime updates between modal-open and print-click
  // don't corrupt the print data (realtime rowToOrder may have null base if column missing).
  try { curRcptOrder = JSON.parse(JSON.stringify(o)); } catch(e) { curRcptOrder = o; }

  try {
    // --- product lines ---
    // If base is missing/zero (e.g. column not returned from Supabase on some devices),
    // back-calculate it from total so the receipt always shows a meaningful amount.
    var baseStored = Number(o.base) || 0;
    var baseDisplay = baseStored > 0
      ? baseStored
      : Math.max(0, Number(o.total||0) - Number(o.addOnAmt||0) + Number(o.promoAmt||0) + Number(o.discAmt||0));

    var lines = '';
    var satuanLines = o.satuanLines || [];
    if (o.svcType === 'satuan' && satuanLines.length > 0) {
      for (var si = 0; si < satuanLines.length; si++) {
        var sl = satuanLines[si];
        var slAmt = Number(sl.lineTotal) > 0 ? Number(sl.lineTotal) : 0;
        lines += '<div class="rrow"><span>' + esc(sl.name || '') + ' x' + (sl.qty || 0) + '</span><span>' + slAmt.toLocaleString('id-ID') + '</span></div>';
      }
    } else {
      var svcUnit = 'pcs';
      try { svcUnit = getSvcUnit(o.svcType || '') || 'pcs'; } catch(e) {}
      var svcLabel = (String(o.svcType || '') + ' ' + String(o.svcCat || '')).trim() || 'Layanan';
      lines = '<div class="rrow"><span style="text-transform:capitalize">' + esc(svcLabel) + ' x' + (o.qty || 0) + esc(svcUnit) + '</span><span>' + baseDisplay.toLocaleString('id-ID') + '</span></div>';
    }

    // --- add-ons ---
    var addOnList = o.addOns || [];
    var addonsSafe = (typeof addons !== 'undefined' && addons) ? addons : [];
    for (var ai = 0; ai < addOnList.length; ai++) {
      var aon = addOnList[ai];
      var ad = null;
      for (var di = 0; di < addonsSafe.length; di++) { if (addonsSafe[di].id === aon.id) { ad = addonsSafe[di]; break; } }
      if (ad) {
        var av = ad.unit === 'per_qty' ? ad.price * (o.qty || 0) : ad.price;
        lines += '<div class="rrow"><span>' + esc(aon.name || '') + '</span><span>' + Number(av || 0).toLocaleString('id-ID') + '</span></div>';
      }
    }
    if (Number(o.promoAmt) > 0) lines += '<div class="rrow" style="color:var(--p)"><span>Diskon Promo</span><span>- ' + Number(o.promoAmt).toLocaleString('id-ID') + '</span></div>';
    if (Number(o.discAmt)  > 0) lines += '<div class="rrow" style="color:var(--re)"><span>Diskon Manual</span><span>- ' + Number(o.discAmt).toLocaleString('id-ID') + '</span></div>';

    // --- outlet ---
    var outletAddr = '';
    try { var outletObj = go(o.outletId); if (outletObj && outletObj.addr) outletAddr = outletObj.addr; } catch(e) {}

    // --- assemble ---
    var html = '<div class="rcpt">'
      + '<div class="rc rb">CLEANPOS LAUNDRY</div>'
      + '<div class="rc" style="font-size:10px">' + esc(outletAddr) + '</div>'
      + '<hr class="rdash">'
      + '<div class="rrow"><span>No Nota</span><span>' + esc(o.id || '') + '</span></div>'
      + '<div class="rrow"><span>Pelanggan</span><span>' + esc(o.name || '') + '</span></div>'
      + '<div class="rrow"><span>Kasir</span><span>' + esc(o.handledBy || '\u2014') + '</span></div>'
      + '<div class="rrow"><span>Tgl Masuk</span><span>' + esc(o.date || '') + '</span></div>'
      + '<hr class="rdash">'
      + lines
      + '<hr class="rdash">'
      + '<div class="rrow"><span>Status</span><span>' + esc(o.payStatus || '') + '</span></div>'
      + '<div class="rrow rb"><span>Total</span><span>' + Number(o.total || 0).toLocaleString('id-ID') + '</span></div>'
      + '<div class="rrow"><span>Metode</span><span>' + esc(o.payMethod || '') + '</span></div>'
      + '<hr class="rdash">'
      + '<div class="rc">Terima kasih!</div>'
      + '</div>';

    g('m-rcpt-body').innerHTML = html;
  } catch(e) {
    g('m-rcpt-body').innerHTML = '<div style="padding:12px">'
      + '<div style="font-weight:700;margin-bottom:8px">Struk</div>'
      + '<div>No: ' + esc(o.id || '') + '</div>'
      + '<div>Pelanggan: ' + esc(o.name || '') + '</div>'
      + '<div>Layanan: ' + esc(o.svcType || '') + ' ' + esc(o.svcCat || '') + '</div>'
      + '<div>Total: ' + Number(o.total || 0) + '</div>'
      + '<div>Metode: ' + esc(o.payMethod || '') + '</div>'
      + '</div>';
  }

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
  if (curRole === 'staff' && curStaff && o.outletId !== curStaff.oid) return;
  g('m-detail-title').textContent = o.id;
  const _custBal = membershipEnabled && o.phone && o.phone !== '—' ? (customers[o.phone]?.balance || 0) : 0;
  const _custBalExpired = membershipEnabled && o.phone && o.phone !== '—' ? isBalanceExpired(customers[o.phone]) : false;
  const _showWallet = membershipEnabled && (_custBal > 0 && !_custBalExpired || o.payMethod === 'Dompet Member');
  const _walletLabel = _custBal > 0 && !_custBalExpired ? `💳 Dompet Member (${fmt(_custBal + (o.payMethod === 'Dompet Member' ? o.total : 0))})` : '💳 Dompet Member';
  const _payMethods = ['Tunai', 'QRIS', 'Transfer', ...(_showWallet ? ['Dompet Member'] : [])];
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
    ${o.itemCount ? `<div class="rrow"><span style="color:var(--t2)">Jumlah Item</span><span>${o.itemCount} item</span></div>` : ''}
    <div class="rrow"><span style="color:var(--t2)">Metode Bayar</span><span style="font-weight:600">${esc(o.payMethod || '—')}</span></div>
    <div class="rrow rb" style="border-top:1px dashed #ccc;padding-top:5px;margin-top:4px"><span>Total</span><span>${fmt(o.total)}</span></div>
  </div>
  ${o.status === 'Selesai' || o.status === 'Diambil' ? `<div style="padding:10px;background:${o.waSent ? 'var(--pl)' : 'var(--amb)'};border-radius:10px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:${o.waSent ? '#3d6b10' : 'var(--am)'}">${o.waSent ? '✓ Notif WA terkirim' : 'Notif WA belum dikirim'}</span>${!o.waSent ? `<button class="btn bp bsm bpill" onclick="cm('m-detail');openWaMod('${o.id}')">💬 Kirim WA</button>` : ''}</div>` : ''}
  <div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Update Status Pesanan</div>
  <div style="display:flex;flex-wrap:wrap;gap:5px">${STATUS_LIST.map(s => `<button class="btn bsm${s === o.status ? ' bp' : ''}" onclick="setStModal('${id}','${s}',this)">${s}</button>`).join('')}</div></div>
  <div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Update Status Bayar</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">${['Belum Bayar', 'DP', 'Lunas'].map(ps => `<button class="btn bsm${ps === o.payStatus ? ' bp' : ''}" onclick="setPayModal('${id}','${ps}',this)">${ps}</button>`).join('')}</div></div>
  <div><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Ganti Metode Bayar</div>
  ${_custBalExpired && o.payMethod !== 'Dompet Member' ? `<div style="font-size:12px;color:var(--re,#c62828);margin-bottom:6px">⚠️ Saldo member kadaluarsa</div>` : ''}
  <div style="display:flex;gap:6px;flex-wrap:wrap">${_payMethods.map(pm => `<button class="btn bsm${pm === o.payMethod ? ' bp' : ''}" onclick="changePayMethod('${id}','${pm}')">${pm === 'Dompet Member' ? _walletLabel : pm}</button>`).join('')}</div></div>
  ${curRole === 'owner' && outlets.length > 1 ? `<div style="margin-top:12px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Pindah Outlet</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">${outlets.map(ol => `<button class="btn bsm${ol.id === o.outletId ? ' bp' : ''}" onclick="changeOrderOutlet('${id}','${ol.id}',this)">${esc(ol.name)}</button>`).join('')}</div></div>` : ''}`;
  g('m-detail-ft').innerHTML = `<button class="btn" onclick="cm('m-detail')">Tutup</button><button class="btn bp" onclick="cm('m-detail');showRcpt('${id}')">Struk</button>`;
  openModal('m-detail');
}

function setStModal(id, st, btn) {
  const o = orders.find(x => x.id === id); if (!o) return;
  o.status = st;
  if (st === 'Diambil' && !o.pickedUpAt) o.pickedUpAt = new Date().toISOString();
  btn.closest('div').querySelectorAll('.btn').forEach(b => { if (b.onclick && b.onclick.toString().includes('setStModal')) b.classList.remove('bp'); });
  btn.classList.add('bp');
  if (st === 'Selesai' && !o.waSent) setTimeout(() => { cm('m-detail'); openWaMod(id); }, 400);
  renderOrders();
  if (curRole === 'owner') refreshODash(); else refreshSDash();
}

function setPayModal(id, ps, btn) {
  const o = orders.find(x => x.id === id); if (!o) return;
  const prev = o.payStatus;
  if (prev === ps) { btn.classList.add('bp'); return; }
  const willKoreksi = prev === 'Lunas' && o.payMethod === 'Tunai';
  function _applyPayModal() {
    o.payStatus = ps;
    btn.closest('div').querySelectorAll('.btn').forEach(b => { if (b.onclick && b.onclick.toString().includes('setPayModal')) b.classList.remove('bp'); });
    btn.classList.add('bp');
    if (ps === 'Lunas' && o.payMethod === 'Tunai') {
      const entry = { id: kasCtr++, type: 'in', desc: 'Penjualan Cash', note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
      kasLog.push(entry); syncKas(entry);
    } else if (prev === 'Lunas' && o.payMethod === 'Tunai') {
      const entry = { id: kasCtr++, type: 'out', desc: 'Koreksi Kas – ' + o.id, note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
      kasLog.push(entry); syncKas(entry);
    }
    renderOrders();
    if (curRole === 'owner') refreshODash(); else refreshSDash();
    toast('✓ Status bayar: ' + ps);
  }
  if (willKoreksi) {
    confirm_('Batalkan Pembayaran Tunai?', 'Ini akan membuat Koreksi Kas –' + fmt(o.total) + ' di kas kasir. Lanjutkan?', () => { _applyPayModal(); if (typeof syncOrder === 'function') syncOrder(o); });
  } else {
    _applyPayModal();
  }
}

function changeOrderOutlet(id, newOutletId, btn) {
  const o = orders.find(x => x.id === id); if (!o) return;
  if (o.outletId === newOutletId) return;
  const oldName = go(o.outletId)?.name || o.outletId;
  const newName = go(newOutletId)?.name || newOutletId;
  o.outletId = newOutletId;
  if (typeof syncOrder === 'function') syncOrder(o);
  btn.closest('div').querySelectorAll('.btn').forEach(b => b.classList.remove('bp'));
  btn.classList.add('bp');
  renderOrders();
  if (curRole === 'owner') refreshODash();
  toast(`✓ Outlet diubah: ${oldName} → ${newName}`);
}

function setPayStatus(id, ps) {
  const o = orders.find(x => x.id === id); if (!o) return;
  if (o.payStatus === ps) return;
  const prev = o.payStatus;
  const willKoreksi = prev === 'Lunas' && o.payMethod === 'Tunai';
  function _applyPayStatus() {
    o.payStatus = ps;
    if (ps === 'Lunas' && o.payMethod === 'Tunai') {
      const entry = { id: kasCtr++, type: 'in', desc: 'Penjualan Cash', note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
      kasLog.push(entry); syncKas(entry);
    } else if (prev === 'Lunas' && o.payMethod === 'Tunai') {
      const entry = { id: kasCtr++, type: 'out', desc: 'Koreksi Kas – ' + o.id, note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
      kasLog.push(entry); syncKas(entry);
    }
    renderOrders();
    if (curRole === 'owner') refreshODash(); else refreshSDash();
    toast('✓ Status bayar: ' + ps);
  }
  if (willKoreksi) {
    confirm_('Batalkan Pembayaran Tunai?', 'Ini akan membuat Koreksi Kas –' + fmt(o.total) + ' di kas kasir. Lanjutkan?', () => { _applyPayStatus(); if (typeof syncOrder === 'function') syncOrder(o); });
  } else {
    _applyPayStatus();
  }
}

function openPayPicker(id, el) {
  const existing = document.getElementById('_pay-pop');
  if (existing) { existing.remove(); if (existing.dataset.oid === id) return; }
  const o = orders.find(x => x.id === id); if (!o) return;
  const pop = document.createElement('div');
  pop.id = '_pay-pop';
  pop.dataset.oid = id;
  pop.style.cssText = 'position:fixed;z-index:9999;background:var(--ca,#fff);border:1px solid var(--b1,#e0e0e0);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);padding:6px;display:flex;flex-direction:column;gap:4px;min-width:110px';
  ['Belum Bayar', 'DP', 'Lunas'].forEach(ps => {
    const btn = document.createElement('button');
    btn.className = 'btn bsm' + (ps === o.payStatus ? ' bp' : '');
    btn.style.cssText = 'text-align:left;justify-content:flex-start';
    btn.textContent = ps;
    btn.onmousedown = e => { e.stopPropagation(); setPayStatus(id, ps); pop.remove(); };
    pop.appendChild(btn);
  });
  document.body.appendChild(pop);
  const r = el.getBoundingClientRect();
  pop.style.top = Math.min(r.bottom + 4, window.innerHeight - 150) + 'px';
  pop.style.left = Math.min(r.left, window.innerWidth - 130) + 'px';
  setTimeout(() => {
    document.addEventListener('mousedown', function h(e) {
      if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('mousedown', h); }
    });
  }, 0);
}

// ===== CHANGE PAYMENT METHOD =====
function changePayMethod(id, newMethod) {
  const o = orders.find(x => x.id === id); if (!o) return;
  if (o.payMethod === newMethod) return;
  const oldMethod = o.payMethod;
  const wasLunas = o.payStatus === 'Lunas';

  // Guard: confirm before creating Koreksi Kas when switching away from Tunai+Lunas
  if (oldMethod === 'Tunai' && wasLunas) {
    confirm_('Ganti Metode Bayar?', 'Order ini sudah Lunas (Tunai). Mengganti metode akan membuat Koreksi Kas –' + fmt(o.total) + '. Lanjutkan?', () => _doChangePayMethod(id, newMethod));
    return;
  }
  _doChangePayMethod(id, newMethod);
}
function _doChangePayMethod(id, newMethod) {
  const o = orders.find(x => x.id === id); if (!o) return;
  const oldMethod = o.payMethod;
  const wasLunas = o.payStatus === 'Lunas';

  // Reverse Tunai kas entry if switching away from Tunai while Lunas
  if (oldMethod === 'Tunai' && wasLunas) {
    const entry = { id: kasCtr++, type: 'out', desc: 'Koreksi Kas – ' + o.id, note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
    kasLog.push(entry); syncKas(entry);
  }

  // Reverse Dompet Member deduction if switching away from it
  if (oldMethod === 'Dompet Member') {
    const cust = o.phone && o.phone !== '—' ? customers[o.phone] : null;
    if (cust) {
      cust.balance = (cust.balance || 0) + o.total;
      const deductIdx = memberTxns.findIndex(t => t.orderId === o.id && t.type === 'deduct');
      if (deductIdx !== -1) {
        const removed = memberTxns.splice(deductIdx, 1)[0];
        deleteMemberTxn(removed.id);
        syncCustomer(cust);
      }
    }
    o.payStatus = 'Belum Bayar';
  }

  // Setup Dompet Member if switching to it
  if (newMethod === 'Dompet Member') {
    if (!membershipEnabled) { toast('⚠️ Fitur membership tidak aktif'); return; }
    const phone = o.phone;
    const cust = phone && phone !== '—' ? customers[phone] : null;
    if (!cust) { toast('⚠️ Pelanggan tidak terdaftar sebagai member'); return; }
    if (isBalanceExpired(cust)) { toast('⚠️ Saldo member telah kadaluarsa!'); return; }
    const bal = Number(cust.balance || 0);
    if (bal < o.total) { toast('⚠️ Saldo tidak cukup! Saldo: ' + fmt(bal) + ' | Total: ' + fmt(o.total)); return; }
    cust.balance = bal - o.total;
    const txnId = 'MBR-' + String(memberTxnCtr++).padStart(5, '0');
    const txn = { id: txnId, phone, type: 'deduct', amount: o.total, baseAmount: null, bonusAmount: null, note: 'Ganti metode bayar', orderId: o.id, time: NOW() };
    memberTxns.push(txn);
    syncMemberTxn(txn);
    syncCustomer(cust);
    o.payStatus = 'Lunas';
  }

  // Add Tunai kas entry if switching to Tunai while Lunas
  if (newMethod === 'Tunai' && o.payStatus === 'Lunas') {
    const entry = { id: kasCtr++, type: 'in', desc: 'Penjualan Cash', note: o.name + ' · ' + o.id, amount: o.total, time: NOW(), outletId: o.outletId };
    kasLog.push(entry); syncKas(entry);
  }

  o.payMethod = newMethod;
  renderOrders();
  if (curRole === 'owner') refreshODash(); else refreshSDash();
  // Refresh detail modal if open for this order
  if (g('m-detail')?.className?.includes('on') && g('m-detail-title')?.textContent === id) showDetail(id);
  if (typeof syncOrder === 'function') syncOrder(o);
  toast('✓ Metode bayar diubah: ' + newMethod);
}

// ===== WA NOTIFICATIONS =====
function buildMsg(tpl, o) {
  const trackingUrl = o.tracking_token
    ? (window.location.origin + window.location.pathname + '?track=' + o.tracking_token)
    : '';
  const bayarTxt = o.payStatus === 'Lunas' ? 'Lunas' : o.payStatus === 'DP' ? 'DP (Belum Lunas)' : 'Belum Lunas';
  return tpl
    .replace(/{nama}/g, o.name)
    .replace(/{id}/g, o.id)
    .replace(/{total}/g, fmt(o.total))
    .replace(/{layanan}/g, o.svcType + ' ' + o.svcCat)
    .replace(/{est}/g, { regular: '2-3 hari', express: '1 hari', sameday: '± 8 jam' }[o.svcCat] || '')
    .replace(/{link}/g, trackingUrl)
    .replace(/{bayar}/g, bayarTxt);
}

function fmtPh(p) {
  let n = p.replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n;
}

function openWaMod(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  if (curRole === 'staff' && curStaff && o.outletId !== curStaff.oid) return;
  const msg = buildMsg(waTplSelesai, o);
  g('m-wa-body').innerHTML = `<div style="margin-bottom:12px"><div style="font-weight:600;font-size:14px">${esc(o.name)}</div><div style="font-size:12px;color:var(--t2)">${esc(o.id)} · ${esc(o.phone)}</div></div><div class="wa-bg"><div class="wa-bbl">${esc(msg).replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div></div>`;
  g('m-wa-send').onclick = () => {
    if (o.phone && o.phone !== '—') openWa(o.phone, msg);
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
      openWa(curWaNewOrder.phone, buildMsg(waTplNew[curWaNewType], curWaNewOrder));
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
  const linkOn = g('wa-link-toggle')?.classList.contains('on') !== false;
  const exLink = linkOn ? 'https://cleanpos.app/track/LDRY-001' : '';
  p.innerHTML = el.value
    .replace(/{nama}/g,    '<strong>Budi Santoso</strong>')
    .replace(/{id}/g,      '<strong>LDRY-001</strong>')
    .replace(/{total}/g,   '<strong>Rp 21.000</strong>')
    .replace(/{layanan}/g, 'kiloan regular')
    .replace(/{est}/g,     '2-3 hari')
    .replace(/{link}/g,    exLink ? '<a href="#" style="color:#0a5c7a">' + exLink + '</a>' : '<em style="color:#aaa">[link tracking]</em>')
    .replace(/{bayar}/g,   '<strong>Lunas</strong>')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g,   '<em>$1</em>')
    .replace(/~(.*?)~/g,   '<s>$1</s>')
    .replace(/\n/g, '<br>');
  const cc = g('wa-char-count'); if (cc) cc.textContent = el.value.length + ' karakter';
}

function insertWaVar(varStr) {
  const ta = g('wa-tpl'); if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  ta.value = ta.value.slice(0, s) + varStr + ta.value.slice(e);
  ta.selectionStart = ta.selectionEnd = s + varStr.length;
  ta.focus();
  prevTpl();
}

function waTplWrap(open, close) {
  const ta = g('wa-tpl'); if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || 'teks';
  ta.value = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e);
  ta.selectionStart = s + open.length;
  ta.selectionEnd = s + open.length + sel.length;
  ta.focus();
  prevTpl();
}

function waTplList() {
  const ta = g('wa-tpl'); if (!ta) return;
  const s = ta.selectionStart;
  const insert = '\n• Item 1\n• Item 2\n• Item 3';
  ta.value = ta.value.slice(0, s) + insert + ta.value.slice(s);
  ta.selectionStart = ta.selectionEnd = s + insert.length;
  ta.focus();
  prevTpl();
}

const WA_TPL_DEFAULTS = {
  selesai:     `Halo {nama} 👋\n\nCucian Anda sudah *selesai* dan siap diambil! 🎉\n\n📋 No: *{id}*\n👕 Layanan: {layanan}\n💰 Total: *{total}*\n💳 Status: {bayar}\n\nTerima kasih sudah menggunakan CleanPOS Laundry! 🙏`,
  konfirmasi:  `Halo {nama} 👋\n\nPesanan Anda sudah *diterima* di CleanPOS Laundry. 🧺\n\n📋 No: *{id}*\n👕 Layanan: {layanan}\n💰 Total: *{total}*\n\nKami akan kabarkan saat cucian siap diambil! 🙏`,
  tagih_dp:    `Halo {nama} 👋\n\nPesanan Anda sudah dicatat!\n📋 No: *{id}*\n💰 Total: *{total}*\n\nMohon transfer DP 50% ke:\n🏦 BCA 1234567890 a/n Laundry Kita\n\nKirim bukti transfer ya! 🙏`,
  tagih_lunas: `Halo {nama} 👋\n\nKonfirmasi pembayaran:\n📋 No: *{id}*\n💰 Total: *{total}*\n\nTransfer ke:\n🏦 BCA 1234567890 a/n Laundry Kita\nAtau bayar tunai saat pickup. 🙏`
};

function resetWaTpl() {
  const def = WA_TPL_DEFAULTS[curWaTplTab];
  if (!def) return;
  const ta = g('wa-tpl'); if (ta) { ta.value = def; prevTpl(); }
}

function saveTpl() {
  const val = g('wa-tpl')?.value || '';
  if (curWaTplTab === 'selesai') { waTplSelesai = val; }
  else { waTplNew[curWaTplTab] = val; }
  if (typeof syncSettings === 'function') syncSettings();
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
  const myOrders = curStaff ? orders.filter(o => o.outletId === curStaff.oid) : orders;
  const pend = myOrders.filter(o => o.status === 'Selesai' && !o.waSent);
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
