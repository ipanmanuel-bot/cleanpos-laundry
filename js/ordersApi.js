// ===== ORDERS API LAYER (Supabase sync) =====
// Depends on: supabaseClient.js (sbUpsert, sbDelete, sbFetch, currentUserId)
// All functions reference global state (orders, customers, outlets, etc.) at call-time.

// --- Data mapping: JS object ↔ DB row ---
function orderToRow(o) {
  return {
    user_id: currentUserId,
    id: o.id, name: o.name, phone: o.phone,
    svc_type: o.svcType, svc_cat: o.svcCat,
    qty: o.qty, raw_qty: o.rawQty,
    satuan_lines: JSON.stringify(o.satuanLines || []),
    add_ons: JSON.stringify(o.addOns), add_on_amt: o.addOnAmt,
    base: o.base, disc_type: o.discType, disc_amt: o.discAmt,
    promo_amt: o.promoAmt, total: o.total,
    pay_method: o.payMethod, pay_status: o.payStatus,
    status: o.status, notes: o.notes,
    date: o.date, iso_date: o.isoDate,
    wa_sent: o.waSent, handled_by: o.handledBy,
    outlet_id: o.outletId
  };
}
function rowToOrder(r) {
  let satuanLines = [], addOns = [];
  try { satuanLines = JSON.parse(r.satuan_lines || '[]'); } catch(e) { console.error('[parse] satuan_lines:', e); }
  try { addOns = JSON.parse(r.add_ons || '[]'); } catch(e) { console.error('[parse] add_ons:', e); }
  return {
    id: r.id, name: r.name, phone: r.phone,
    svcType: r.svc_type, svcCat: r.svc_cat,
    qty: r.qty, rawQty: r.raw_qty,
    satuanLines, addOns, addOnAmt: r.add_on_amt,
    base: r.base, discType: r.disc_type, discAmt: r.disc_amt,
    promoAmt: r.promo_amt, total: r.total,
    payMethod: r.pay_method, payStatus: r.pay_status,
    status: r.status, notes: r.notes,
    date: r.date, isoDate: r.iso_date,
    waSent: r.wa_sent, handledBy: r.handled_by,
    outletId: r.outlet_id
  };
}

// --- Sync: Orders ---
function syncOrder(o) { sbUpsert('orders', orderToRow(o)); }

// --- Sync: Customers ---
function syncCustomer(c) {
  sbUpsert('customers', {
    user_id: currentUserId,
    id: c.phone, name: c.name, phone: c.phone,
    orders: c.orders, total: c.total, balance: c.balance||0, last_date: c.lastDate
  });
}

// --- Sync: Member Transactions ---
function syncMemberTxn(txn) {
  sbUpsert('member_txns', {
    user_id: currentUserId,
    id: txn.id, phone: txn.phone, type: txn.type,
    amount: txn.amount,
    base_amount: txn.baseAmount != null ? txn.baseAmount : null,
    bonus_amount: txn.bonusAmount != null ? txn.bonusAmount : null,
    note: txn.note||null,
    order_id: txn.orderId||null,
    time: txn.time
  });
}
function deleteMemberTxn(id) { sbDelete('member_txns', id); }

// --- Sync: Outlets ---
function syncOutlet(o) {
  sbUpsert('outlets', { user_id: currentUserId, id: o.id, name: o.name, addr: o.addr, color: o.color });
}
function deleteOutlet(id) { sbDelete('outlets', id); }

// --- Sync: Employees ---
function syncEmployee(e) {
  sbUpsert('employees', {
    user_id: currentUserId,
    id: String(e.id), name: e.name, role: e.role, outlet_id: e.oid,
    pin: e.pin, status: e.status, cuti_used: e.cutiUsed,
    clock_in: e.clockIn, clock_out: e.clockOut
  });
}
function deleteEmployee(id) { sbDelete('employees', String(id)); }

// --- Sync: Kas ---
function syncKas(l) {
  sbUpsert('kas_log', {
    user_id: currentUserId,
    id: String(l.id), type: l.type, desc: l.desc, note: l.note,
    amount: l.amount, time: l.time, outlet_id: l.outletId
  });
}

// --- Sync: Expenses ---
function syncExpense(e) {
  sbUpsert('expenses', {
    user_id: currentUserId,
    id: String(e.id), cat: e.cat, label: e.label, nominal: e.nominal,
    date: e.date, note: e.note, src: e.src, outlet_id: e.outletId
  });
}
function deleteExpense(id) { sbDelete('expenses', String(id)); }

// --- Sync: Printers ---
function syncPrinter(p) {
  sbUpsert('printers', {
    user_id: currentUserId,
    id: p.id, name: p.name, conn: p.conn, ip: p.ip,
    width: p.width, role: p.role, status: p.status
  });
}
function deletePrinter_sb(id) { sbDelete('printers', id); }

// --- Sync: Settings (one row per user, id='main') ---
// NOTE: owner_pwd is stored as a SHA-256 hash (prefixed 'sha256:'), never plain text
function syncSettings() {
  sbUpsert('settings', {
    user_id: currentUserId,
    id: 'main',
    store_name: storeName, store_addr: storeAddr,
    store_wa: storeWa, store_footer: storeFooter,
    owner_pwd: ownerPwd,   // always a 'sha256:...' hash — see hashSecret()
    service_types: JSON.stringify(serviceTypes),
    satuan_items: JSON.stringify(satuanItems),
    addons: JSON.stringify(addons),
    promos: JSON.stringify(promos),
    wa_tpl_selesai: waTplSelesai,
    wa_tpl_new: JSON.stringify(waTplNew),
    cuti_per_bulan: cutiPerBulan,
    membership_enabled: membershipEnabled,
    membership_bonus: membershipBonus
  });
}

// --- Fetch all tables and load into local state ---
async function supaLoadAll() {
  toast('☁️ Memuat data dari cloud...');
  const [
    ordersData, custsData, outletsData, empsData,
    kasData, expData, printersData, settingsData, subData, memberTxnData
  ] = await Promise.all([
    sbFetch('orders'), sbFetch('customers'), sbFetch('outlets'),
    sbFetch('employees'), sbFetch('kas_log'), sbFetch('expenses'),
    sbFetch('printers'), sbFetch('settings'), sbFetch('subscriptions'),
    sbFetch('member_txns')
  ]);

  if (ordersData)   { orders = ordersData.map(rowToOrder); orderCtr = orders.length + 1; }
  if (custsData)    { customers = {}; custsData.forEach(c => { customers[c.phone] = { name: c.name, phone: c.phone, orders: c.orders, total: c.total, balance: c.balance||0, lastDate: c.last_date }; }); }
  if (outletsData)  {
    // Deduplicate by id (recovers from counter-collision bug where two outlets got same id)
    const _oMap = new Map(); outletsData.forEach(r => { if (!_oMap.has(r.id)) _oMap.set(r.id, r); });
    const _hadDupes = _oMap.size < outletsData.length;
    outlets = Array.from(_oMap.values()).map(r => ({ id: r.id, name: r.name, addr: r.addr, color: r.color }));
    // Update outletCtr so new outlets never collide with existing numeric IDs
    const _oNums = outlets.map(o => parseInt((o.id||'').replace(/\D/g,''))).filter(n => !isNaN(n) && n > 0);
    if (_oNums.length) outletCtr = Math.max(..._oNums) + 1;
    // If we found and removed dupes, re-sync clean list to cloud
    if (_hadDupes) { console.warn('[supa] Ditemukan outlet dengan ID duplikat — data dibersihkan otomatis'); outlets.forEach(o => syncOutlet(o)); }
  }
  if (empsData)     {
    employees = empsData.map(r => ({ id: Number(r.id), name: r.name, role: r.role, oid: r.outlet_id, pin: r.pin, status: r.status, cutiUsed: r.cuti_used, clockIn: r.clock_in, clockOut: r.clock_out }));
    // Use max id to avoid collisions (length-based counter fails if ids aren't sequential)
    empCtr = employees.reduce((mx, e) => Math.max(mx, e.id || 0), 0) + 1;
  }
  if (kasData)      { kasLog = kasData.map(r => ({ id: Number(r.id), type: r.type, desc: r.desc, note: r.note, amount: r.amount, time: r.time, outletId: r.outlet_id })); kasCtr = kasLog.reduce((mx,l)=>Math.max(mx,l.id||0),0)+1; }
  if (expData)      { expenses = expData.map(r => ({ id: Number(r.id), cat: r.cat, label: r.label, nominal: r.nominal, date: r.date, note: r.note, src: r.src, outletId: r.outlet_id })); expCtr = expenses.reduce((mx,e)=>Math.max(mx,e.id||0),0)+1; }
  if (printersData) { printers = printersData.map(r => ({ id: r.id, name: r.name, conn: r.conn, ip: r.ip, width: r.width, role: r.role, status: r.status })); printerCtr = printers.length + 1; }
  if (settingsData && settingsData.length) {
    const s = settingsData[0];
    if (s.store_name)    storeName = s.store_name;
    if (s.store_addr)    storeAddr = s.store_addr;
    if (s.store_wa)      storeWa = s.store_wa;
    if (s.store_footer)  storeFooter = s.store_footer;
    if (s.owner_pwd)     ownerPwd = s.owner_pwd;   // loaded as hash; compared via hashSecret()
    try { if (s.service_types) serviceTypes = JSON.parse(s.service_types); } catch(e) { console.error('[parse] service_types:', e); }
    try { if (s.satuan_items)  satuanItems  = JSON.parse(s.satuan_items);  } catch(e) { console.error('[parse] satuan_items:', e); }
    try { if (s.addons)        addons       = JSON.parse(s.addons);        } catch(e) { console.error('[parse] addons:', e); }
    try { if (s.promos)        promos       = JSON.parse(s.promos);        } catch(e) { console.error('[parse] promos:', e); }
    if (s.wa_tpl_selesai) waTplSelesai = s.wa_tpl_selesai;
    try { if (s.wa_tpl_new)    waTplNew     = JSON.parse(s.wa_tpl_new);    } catch(e) { console.error('[parse] wa_tpl_new:', e); }
    if (s.cuti_per_bulan) cutiPerBulan = Number(s.cuti_per_bulan);
    if (s.membership_enabled != null) membershipEnabled = !!s.membership_enabled;
    if (s.membership_bonus  != null) membershipBonus  = Number(s.membership_bonus);
  }
  if (memberTxnData) {
    memberTxns = memberTxnData.map(r => ({ id: r.id, phone: r.phone, type: r.type, amount: r.amount, baseAmount: r.base_amount, bonusAmount: r.bonus_amount, note: r.note, orderId: r.order_id, time: r.time }));
    memberTxnCtr = memberTxns.reduce((mx,t) => { const n=parseInt((t.id||'').replace(/\D/g,'')); return isNaN(n)?mx:Math.max(mx,n); }, 0) + 1;
    // Reconcile customer balances from transaction log (authoritative source).
    // This fixes stale/zero balance in the customers table after page reload.
    const _phoneSet = new Set(memberTxns.map(t => t.phone));
    _phoneSet.forEach(ph => {
      if (!customers[ph]) return;
      const _computed = memberTxns
        .filter(t => t.phone === ph)
        .reduce((sum, t) => t.type === 'deposit' ? sum + (t.amount||0) : sum - (t.amount||0), 0);
      const _correct = Math.max(0, _computed);
      if (customers[ph].balance !== _correct) {
        customers[ph].balance = _correct;
        syncCustomer(customers[ph]); // push corrected balance back to Supabase
      }
    });
  }
  if (subData && subData.length) {
    currentPlan       = subData[0].plan        || 'basic';
    currentPlanStatus = subData[0].status       || 'active';
    currentPlanExpiry = subData[0].expires_at   || null;
  } else {
    currentPlan = 'basic'; currentPlanStatus = 'trial';
    const _trialExp = new Date(); _trialExp.setDate(_trialExp.getDate() + 14);
    currentPlanExpiry = _trialExp.toISOString();
    sbUpsert('subscriptions', { user_id: currentUserId, plan: 'basic', status: 'trial', expires_at: currentPlanExpiry }, 'user_id');
  }
  toast('✅ Data cloud berhasil dimuat!');
  supaSubscribeOrders();
}

// --- Realtime: subscribe to orders table changes ---
function supaSubscribeOrders() {
  if (!supaEnabled || !supabase) return;
  if (supaRealtimeCh) supabase.removeChannel(supaRealtimeCh);
  supaRealtimeCh = supabase.channel('orders-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const incoming = rowToOrder(payload.new);
        // Strict check: drop events that don't belong to the current user
        if (payload.new?.user_id !== currentUserId) return;
        const idx = orders.findIndex(o => o.id === incoming.id);
        if (idx >= 0) orders[idx] = incoming; else orders.push(incoming);
      } else if (payload.eventType === 'DELETE') {
        orders = orders.filter(o => o.id !== payload.old.id);
      }
      renderOrders();
      if (curRole === 'owner') refreshODash(); else refreshSDash();
    })
    .subscribe();
}

// --- Push all local data to Supabase (initial migration) ---
async function supaPushAll() {
  if (!supaEnabled) { toast('⚠️ Hubungkan Supabase dulu'); return; }
  if (!currentUserId) { toast('⚠️ Login diperlukan'); return; }
  toast('⬆️ Mendorong semua data...');
  await Promise.all([
    ...orders.map(o => sbUpsert('orders', orderToRow(o))),
    ...Object.values(customers).map(c => sbUpsert('customers', { user_id: currentUserId, id: c.phone, name: c.name, phone: c.phone, orders: c.orders, total: c.total, last_date: c.lastDate })),
    ...outlets.map(o => sbUpsert('outlets', { user_id: currentUserId, id: o.id, name: o.name, addr: o.addr, color: o.color })),
    ...employees.map(e => sbUpsert('employees', { user_id: currentUserId, id: String(e.id), name: e.name, role: e.role, outlet_id: e.oid, pin: e.pin, status: e.status, cuti_used: e.cutiUsed, clock_in: e.clockIn, clock_out: e.clockOut })),
    ...kasLog.map(l => sbUpsert('kas_log', { user_id: currentUserId, id: String(l.id), type: l.type, desc: l.desc, note: l.note, amount: l.amount, time: l.time, outlet_id: l.outletId })),
    ...expenses.map(e => sbUpsert('expenses', { user_id: currentUserId, id: String(e.id), cat: e.cat, label: e.label, nominal: e.nominal, date: e.date, note: e.note, src: e.src, outlet_id: e.outletId })),
    ...printers.map(p => sbUpsert('printers', { user_id: currentUserId, id: p.id, name: p.name, conn: p.conn, ip: p.ip, width: p.width, role: p.role, status: p.status })),
    ...memberTxns.map(t => syncMemberTxn(t)),
    syncSettings()
  ]);
  toast('✅ Semua data berhasil dipush ke Supabase!');
}
