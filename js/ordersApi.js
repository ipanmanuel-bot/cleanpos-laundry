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
  return {
    id: r.id, name: r.name, phone: r.phone,
    svcType: r.svc_type, svcCat: r.svc_cat,
    qty: r.qty, rawQty: r.raw_qty,
    satuanLines: JSON.parse(r.satuan_lines || '[]'),
    addOns: JSON.parse(r.add_ons || '[]'), addOnAmt: r.add_on_amt,
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
    orders: c.orders, total: c.total, last_date: c.lastDate
  });
}

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
function syncSettings() {
  sbUpsert('settings', {
    user_id: currentUserId,
    id: 'main',
    store_name: storeName, store_addr: storeAddr,
    store_wa: storeWa, store_footer: storeFooter,
    owner_pwd: ownerPwd,
    service_types: JSON.stringify(serviceTypes),
    satuan_items: JSON.stringify(satuanItems),
    addons: JSON.stringify(addons),
    promos: JSON.stringify(promos),
    wa_tpl_selesai: waTplSelesai,
    wa_tpl_new: JSON.stringify(waTplNew)
  });
}

// --- Fetch all tables and load into local state ---
async function supaLoadAll() {
  toast('☁️ Memuat data dari cloud...');
  const [
    ordersData, custsData, outletsData, empsData,
    kasData, expData, printersData, settingsData
  ] = await Promise.all([
    sbFetch('orders'), sbFetch('customers'), sbFetch('outlets'),
    sbFetch('employees'), sbFetch('kas_log'), sbFetch('expenses'),
    sbFetch('printers'), sbFetch('settings')
  ]);

  if (ordersData)   { orders = ordersData.map(rowToOrder); orderCtr = orders.length + 1; }
  if (custsData)    { customers = {}; custsData.forEach(c => { customers[c.phone] = { name: c.name, phone: c.phone, orders: c.orders, total: c.total, lastDate: c.last_date }; }); }
  if (outletsData)  { outlets = outletsData.map(r => ({ id: r.id, name: r.name, addr: r.addr, color: r.color })); }
  if (empsData)     { employees = empsData.map(r => ({ id: Number(r.id), name: r.name, role: r.role, oid: r.outlet_id, pin: r.pin, status: r.status, cutiUsed: r.cuti_used, clockIn: r.clock_in, clockOut: r.clock_out })); empCtr = employees.length + 1; }
  if (kasData)      { kasLog = kasData.map(r => ({ id: Number(r.id), type: r.type, desc: r.desc, note: r.note, amount: r.amount, time: r.time, outletId: r.outlet_id })); kasCtr = kasLog.length + 1; }
  if (expData)      { expenses = expData.map(r => ({ id: Number(r.id), cat: r.cat, label: r.label, nominal: r.nominal, date: r.date, note: r.note, src: r.src, outletId: r.outlet_id })); expCtr = expenses.length + 1; }
  if (printersData) { printers = printersData.map(r => ({ id: r.id, name: r.name, conn: r.conn, ip: r.ip, width: r.width, role: r.role, status: r.status })); printerCtr = printers.length + 1; }
  if (settingsData && settingsData.length) {
    const s = settingsData[0];
    if (s.store_name)    storeName = s.store_name;
    if (s.store_addr)    storeAddr = s.store_addr;
    if (s.store_wa)      storeWa = s.store_wa;
    if (s.store_footer)  storeFooter = s.store_footer;
    if (s.owner_pwd)     ownerPwd = s.owner_pwd;
    if (s.service_types) serviceTypes = JSON.parse(s.service_types);
    if (s.satuan_items)  satuanItems = JSON.parse(s.satuan_items);
    if (s.addons)        addons = JSON.parse(s.addons);
    if (s.promos)        promos = JSON.parse(s.promos);
    if (s.wa_tpl_selesai) waTplSelesai = s.wa_tpl_selesai;
    if (s.wa_tpl_new)    waTplNew = JSON.parse(s.wa_tpl_new);
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
        // Only process events for this user (RLS should handle this but double-check)
        if (payload.new.user_id && payload.new.user_id !== currentUserId) return;
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
    syncSettings()
  ]);
  toast('✅ Semua data berhasil dipush ke Supabase!');
}
