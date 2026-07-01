// ===== GLOBAL STATE =====
let ownerPwd = 'owner123';
const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

// ===== SUBSCRIPTION PLANS =====
const PLAN_LIMITS = { basic: 1, elite: 5, enterprise: 20 };
const PLANS = {
  basic:      { name:'Basic',      icon:'leaf',  outlets:1,  price:30000,  annual:270000,   blurb:'Rp 30.000/bln',    color:'#6B6B65' },
  elite:      { name:'Elite',      icon:'star',  outlets:5,  price:50000,  annual:450000,   blurb:'Rp 50.000/bln',    color:'#1976D2' },
  enterprise: { name:'Enterprise', icon:'crown', outlets:20, price:90000,  annual:810000,   blurb:'Rp 90.000/bln',    color:'#7B1FA2' }
};
const TODAY = new Date(), TODAY_DAY = TODAY.getDay();
const TODAY_ISO = `${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`;
const TODAY_STR = TODAY.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
const NOW = () => new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

let outlets = [
  {id:'o1',name:'Pusat \u2013 Menteng',addr:'Jl. Menteng Raya No.12',color:'#8DC440'},
  {id:'o2',name:'Cabang Kemang',addr:'Jl. Kemang Selatan No.5',color:'#1976D2'}
];
let outletCtr = 3;
let employees = [
  {id:1,name:'Ayu Putri',role:'Kasir',oid:'o1',pin:'1234',status:'off',cutiUsed:0,clockIn:null,clockOut:null},
  {id:2,name:'Doni Saputra',role:'Staff',oid:'o1',pin:'5678',status:'off',cutiUsed:0,clockIn:null,clockOut:null},
  {id:3,name:'Rina Wati',role:'Staff',oid:'o2',pin:'9999',status:'off',cutiUsed:1,clockIn:null,clockOut:null},
  {id:4,name:'Bimo Aji',role:'Kasir',oid:'o2',pin:'1111',status:'off',cutiUsed:0,clockIn:null,clockOut:null}
];
let empCtr = 5;
let serviceTypes = [
  {id:'kiloan',name:'Kiloan',unit:'kg',prices:{regular:7000,sameday:12000,express:10000},minKg:3,minKgApply:{regular:true,sameday:true,express:false}}
];
let svcCtr = 3;
let satuanItems = [
  {id:'sat1',name:'Bed Cover',prices:{regular:15000,sameday:20000,express:25000}},
  {id:'sat2',name:'Jaket',prices:{regular:8000,sameday:12000,express:15000}},
  {id:'sat3',name:'Selimut',prices:{regular:10000,sameday:15000,express:18000}},
  {id:'sat4',name:'Kemeja',prices:{regular:5000,sameday:8000,express:10000}},
];
let satItemCtr = 10;
function getP(){const p={};serviceTypes.forEach(s=>{p[s.id]=s.prices;});return p;}
function getSvcById(id){return serviceTypes.find(s=>s.id===id);}
function getSvcUnit(type){return getSvcById(type)?.unit||'pcs';}
function isKgType(type){return getSvcById(type)?.unit==='kg';}
let addons = [
  {id:'a1',name:'Parfum',price:3000,unit:'flat'},
  {id:'a2',name:'Setrika saja',price:4000,unit:'per_qty'},
  {id:'a3',name:'Antar / Ongkir',price:10000,unit:'flat'}
];
let addonCtr = 4;
let promos = [
  {id:'pr1',name:'Promo Selasa Hemat',svc:'satuan-regular',discType:'flat',discVal:7000,days:['2'],from:'',to:'',note:'Cuci satuan diskon 7rb tiap Selasa',active:true,outlets:[]},
  {id:'pr2',name:'Happy Weekend',svc:'kiloan-regular',discType:'persen',discVal:10,days:['6','0'],from:'',to:'',note:'Kiloan diskon 10% tiap Sabtu & Minggu',active:true,outlets:[]}
];
let promoCtr = 3; let editPromoId = null; let selDays = []; let promoOutlets = [];
let orders = []; let orderCtr = 1; let customers = {};
let memberTxns = []; let memberTxnCtr = 1;
let membershipEnabled = false; let membershipBonus = 10;
let membershipStyle = 'deposit'; let membershipMinDeposit = 0;
let membershipPackages = []; let membershipPkgCtr = 1;
let membershipExpiryEnabled = false; let membershipExpiryDays = 30;
let waLog = [];
let waTplSelesai = `Halo {nama} \uD83D\uDC4B\n\nCucian Anda sudah *selesai* dan siap diambil! \uD83C\uDF89\n\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDC55 Layanan: {layanan}\n\uD83D\uDCB0 Total: *{total}*\n\nTerima kasih sudah menggunakan CleanPOS Laundry! \uD83D\uDE4F`;
let waTplNew = {
  konfirmasi:  `Halo {nama} \uD83D\uDC4B\n\nPesanan Anda sudah *diterima* di CleanPOS Laundry. \uD83E\uDDFA\n\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDC55 Layanan: {layanan}\n\uD83D\uDCB0 Total: *{total}*\n\nKami akan kabarkan saat cucian siap diambil! \uD83D\uDE4F`,
  tagih_dp:    `Halo {nama} \uD83D\uDC4B\n\nPesanan Anda sudah dicatat!\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDCB0 Total: *{total}*\n\nMohon transfer DP 50% ke:\n\uD83C\uDFE6 BCA 1234567890 a/n Laundry Kita\n\nKirim bukti transfer ya! \uD83D\uDE4F`,
  tagih_lunas: `Halo {nama} \uD83D\uDC4B\n\nKonfirmasi pembayaran:\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDCB0 Total: *{total}*\n\nTransfer ke:\n\uD83C\uDFE6 BCA 1234567890 a/n Laundry Kita\nAtau bayar tunai saat pickup. \uD83D\uDE4F`
};
let curWaNewType = 'konfirmasi'; let curWaNewOrder = null; let curRcptOrderId = null; let curRcptOrder = null;
let storeName = 'CleanPOS Laundry'; let storeAddr = ''; let storeWa = ''; let storeFooter = 'Terima kasih atas kepercayaan Anda! \uD83D\uDE4F';
let cutiPerBulan = 2;
let kgStep = 0.5; // increment step for kiloan weight input (0.1 / 0.5 / 1)
// Delivery queue settings
let pickupSlots = []; // [{ id, label, timeStart, timeEnd, active }]
let pickupRadiusKm = 3.0;
let pickupExtraCharge = 5000;
let deliveryQueue = []; let deliveryQueueCtr = 1;
let courierPhone = localStorage.getItem('cleanpos_courier_phone') || '';
let curWaTplTab = 'selesai';
let kasLog = []; let kasCtr = 1; let kasType = 'setor';
let kasTypeFilter = 'all'; let kasDateFilter = 'today'; let _kasPage = 1;
const _KAS_PAGE = 20;
let expenses = []; let expCtr = 1;
let printers = [];
let printerCtr = 1; let btDevice = null; let _editPrinterId = null;
const _PRINTERS_KEY = 'cleanpos_printers';
let rptFilter = 'today'; let empFilter = 'all';
let dashPeriod = localStorage.getItem('cleanpos_dash_period') || 'bulanan'; let dashOffset = 0; let _dashChart = null; let dashOutlet = 'all';
let ordOutlet = 'all'; let trkOutlet = 'all'; let kasOutlet = 'all'; let expOutlet = 'all'; let rptOutlet = 'all';
let ordDateFilter = 'all'; let ordDateFrom = ''; let ordDateTo = '';
let ordFst = ''; let ordFpy = '';
let _ordPage = 1;
let _custFilter = 'all'; let _custPage = 1;
let rptStatusFilter = ''; let rptPayFilter = ''; let _rptTxPage = 1;
let curRole = null; let curStaff = null; let curOutlet = null;
let pinEntry = ''; let selOutletColor = '#8DC440';
// Notification settings
let notifWaPending = true; let notifProsesKosong = true; let notifBelumLunas = true; let notifDurasiLama = true;
let notifProsesKosongDelay = 15; let notifDurasiMencuci = 100; let notifDurasiMengeringkan = 80;
// In-app notification center
let appNotifications = [];
const _NOTIF_KEY = 'cleanpos_notifs';
let editSvcId = null;
let editSatItemId = null;
let _pricingTab = 'kiloan';
let _editPoKey = null;
let priceOptions = [
  {key:'regular',label:'Reguler',est:'2-3 Hari',order:1,active:true},
  {key:'sameday',label:'Same Day',est:'± 8 jam',order:2,active:true},
  {key:'express',label:'Express',est:'Hari yang sama',order:3,active:true}
];

// ===== MEMBER CARD TEMPLATE =====
const _CARD_BG_KEY = 'cleanpos_mbr_card_bg';
const _CARD_FIELDS_KEY = 'cleanpos_mbr_card_fields';
const CARD_FONTS = ['Poppins','Montserrat','Raleway','Nunito','Lato','Open Sans','Roboto','Playfair Display','Dancing Script','Pacifico'];
let memberCardBg = null;
let memberCardFields = [
  { id:'name',    label:'Nama',   x:50, y:70, fontSize:48, color:'#ffffff', bold:true,  shadow:true, align:'center', fontFamily:'Poppins', visible:true },
  { id:'phone',   label:'No. WA', x:50, y:81, fontSize:30, color:'#eeeeee', bold:false, shadow:true, align:'center', fontFamily:'Poppins', visible:true },
  { id:'balance', label:'Saldo',  x:50, y:91, fontSize:40, color:'#ffd700', bold:true,  shadow:true, align:'center', fontFamily:'Poppins', visible:true }
];
let _cardActiveField = 'name';
let _cardBgImg = null;
let _cardSendCust = null;
let _cardInteract = null; // { mode:'drag'|'resize', fieldId, startX, startY, origX, origY, origFontSize }
let _cardFieldDragSrcId = null;

// ===== ORDER TRACKING =====
const _TRACKING_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
let _trkRefreshTimer = null;

function genTrackingToken() {
  // 8-char URL-safe alphanumeric (no ambiguous chars like 0/O, 1/l/I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let t = '';
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function _cleanExpiredTokens() {
  if (!supaEnabled || !currentUserId) return;
  const now = Date.now();
  orders.forEach(o => {
    if (o.tracking_token && o.pickedUpAt && (now - new Date(o.pickedUpAt).getTime()) > _TRACKING_EXPIRY_MS) {
      o.tracking_token = null;
      syncOrder(o);
    }
  });
}

function _backfillTrackingOrders() {
  // Backfill store_name on order rows that have a tracking token but were created
  // before the store_name column was added. Runs silently on owner login.
  if (!supaEnabled || !currentUserId || !storeName) return;
  orders.filter(o => o.tracking_token && !o.storeName).forEach(o => syncOrder(o));
}

async function renderTrackingPage(token) {
  clearTimeout(_trkRefreshTimer);

  const PAY_CLS    = {'Belum Bayar':'gr_','DP':'gam','Lunas':'gg'};
  const SL         = ['Diterima','Mencuci','Mengeringkan','Menyetrika','Selesai','Diambil'];
  const _s = 'width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const SL_SVGS = {
    Diterima:    `<svg ${_s}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
    Mencuci:     `<svg ${_s}><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
    Mengeringkan:`<svg ${_s}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
    Menyetrika:  `<svg ${_s}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>`,
    Selesai:     `<svg ${_s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    Diambil:     `<svg ${_s}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
  };
  const SL_SUB     = {
    Diterima:    'Pesanan diterima di laundry',
    Mencuci:     'Sedang dalam proses cuci',
    Mengeringkan:'Sedang dalam proses pengeringan',
    Menyetrika:  'Sedang dalam proses setrika',
    Selesai:     'Cucian siap diambil',
    Diambil:     'Pesanan telah diambil'
  };

  function _trkShow(id) {
    ['trk-loading','trk-expired','trk-notfound','trk-card'].forEach(k => {
      const el = g(k); if (el) el.style.display = k === id ? '' : 'none';
    });
  }
  function _fmtTs(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID',{day:'numeric',month:'short'}) + ', '
         + d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id,name,status,svc_type,svc_cat,qty,satuan_lines,add_ons,add_on_amt,total,pay_status,iso_date,picked_up_at,tracking_token,store_name')
    .eq('tracking_token', token)
    .single();

  if (error || !data) { _trkShow('trk-notfound'); return; }

  // Expiry: 24h after picked_up_at
  if (data.status === 'Diambil' && data.picked_up_at) {
    if (Date.now() - new Date(data.picked_up_at).getTime() > _TRACKING_EXPIRY_MS) {
      supabase.from('orders').update({ tracking_token: null }).eq('tracking_token', token).then(() => {});
      _trkShow('trk-expired'); return;
    }
  }

  _trkShow('trk-card');

  // Store name in header
  const sn = g('trk-store-name');
  if (sn) sn.textContent = data.store_name || 'Laundry';

  // Order date subtitle
  const od = g('trk-order-date');
  if (od) od.textContent = 'Masuk ' + _fmtTs(data.iso_date);

  // Status pill
  const isDone = data.status === 'Diambil';
  const pill = g('trk-status-pill');
  if (pill) {
    const pillColor = isDone ? 'var(--p)' : '#1976D2';
    const pillBg    = isDone ? 'var(--pl)' : '#E3F2FD';
    pill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:100px;background:${pillBg};color:${pillColor};font-weight:700;font-size:12px"><span style="width:7px;height:7px;border-radius:50%;background:${pillColor};display:block;flex-shrink:0"></span>${isDone ? 'Selesai' : 'Sedang Diproses'}</span>`;
  }

  // Vertical timeline
  const tl = g('trk-timeline');
  if (tl) {
    const curIdx = SL.indexOf(data.status);
    tl.innerHTML = SL.map((s, i) => {
      const done   = i < curIdx;
      const active = i === curIdx;
      const future = i > curIdx;
      const isLast = i === SL.length - 1;
      const ts     = i === 0 ? _fmtTs(data.iso_date) : (s === 'Diambil' && done ? _fmtTs(data.picked_up_at) : '');
      const circBorder  = done || active ? 'var(--p)' : '#D8D8D3';
      const circBg      = done ? 'var(--p)' : active ? 'var(--pl)' : '#F4F5F0';
      const iconColor   = done ? '#fff' : active ? 'var(--p)' : '#C5C5BE';
      const nameWeight  = active ? '700' : done ? '600' : '500';
      const nameColor   = future ? '#ABABAB' : '#1A1A1A';
      const subColor    = active ? 'var(--p)' : future ? '#CECECE' : '#6B6B65';
      const connector   = !isLast
        ? `<div style="width:2px;height:22px;background:${done ? 'var(--p)' : '#E8E8E4'};border-radius:2px;margin:3px 0 3px 17px"></div>`
        : '';
      return `<div>
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:36px;height:36px;border-radius:50%;border:2px solid ${circBorder};background:${circBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${iconColor};${active ? 'box-shadow:0 0 0 4px var(--p20)' : ''}">${SL_SVGS[s]}</div>
          <div style="flex:1;padding-top:5px;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
              <div style="font-weight:${nameWeight};font-size:14px;color:${nameColor}">${s}</div>
              ${ts ? `<div style="font-size:11px;color:#ABABAB;white-space:nowrap;flex-shrink:0">${ts}</div>` : ''}
            </div>
            <div style="font-size:12px;color:${subColor};margin-top:1px">${SL_SUB[s]}</div>
          </div>
        </div>
        ${connector}
      </div>`;
    }).join('');
  }

  // Order details row
  let satuanLines = []; try { satuanLines = JSON.parse(data.satuan_lines || '[]'); } catch(e) {}
  let addOns = []; try { addOns = JSON.parse(data.add_ons || '[]'); } catch(e) {}

  const od2 = g('trk-order-details');
  if (od2) {
    const svcLabel = data.svc_type === 'satuan'
      ? 'Satuan · ' + (data.svc_cat||'')
      : (data.svc_type||'') + ' · ' + (data.svc_cat||'') + ' · ' + data.qty + (data.svc_type === 'kiloan' ? ' kg' : ' pcs');
    const payBadge = `<span class="badge ${PAY_CLS[data.pay_status]||'gy'}">${esc(data.pay_status)}</span>`;
    od2.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-weight:700;font-size:15px">${esc(data.name)}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${esc(data.id)} · ${esc(svcLabel)}</div>
        </div>
        ${payBadge}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
        <span style="font-size:12px;color:var(--t2)">Total</span>
        <span style="font-weight:700;font-size:15px;color:var(--p)">${fmt(data.total)}</span>
      </div>`;
  }

  // Auto-refresh
  const ri = g('trk-refresh-info');
  if (!isDone) {
    _trkRefreshTimer = setTimeout(() => renderTrackingPage(token), 30000);
    if (ri) ri.textContent = 'Diperbarui otomatis setiap 30 detik';
  } else {
    if (ri) ri.textContent = '🎉 Pesanan sudah diambil — terima kasih!';
  }
}

const SL_STATUS = {Diterima:'gy',Mencuci:'gbl',Mengeringkan:'gam',Menyetrika:'gam',Selesai:'gp',Diambil:'gg'};
const SL_PAY = {'Belum Bayar':'gr_',DP:'gam',Lunas:'gg'};
const STATUS_LIST = ['Diterima','Mencuci','Mengeringkan','Menyetrika','Selesai','Diambil'];
function getSvcLbl(key){if(key==='all')return 'Semua Layanan';const parts=key.split('-');const catKey=parts[1];const catLbl=(typeof priceOptions!=='undefined'?priceOptions.find(po=>po.key===catKey)?.label:null)||{regular:'Regular',sameday:'Same-day',express:'Express'}[catKey]||catKey||'';if(parts[0]==='satuan')return 'Satuan '+catLbl;const svc=getSvcById(parts[0]);return svc?(svc.name+' '+catLbl).trim():key;}
const SVC_LBL = new Proxy({},{get:(t,k)=>getSvcLbl(k)});
const CAT_ICONS = {gaji:'\uD83D\uDC64',bonus:'\uD83C\uDF81',listrik:'\u26A1',air:'\uD83D\uDCA7',deterjen:'\uD83E\uDDF4',transport:'\uD83D\uDE97',makan:'\uD83C\uDF71',lain:'\uD83D\uDCE6'};
const CAT_LBL = {gaji:'Gaji Karyawan',bonus:'Bonus',listrik:'Listrik',air:'Air',deterjen:'Deterjen/Sabun',transport:'Transport',makan:'Uang Makan',lain:'Lain-Lain'};

// ===== HELPERS =====
function fmt(n){return 'Rp '+Math.round(Math.abs(n||0)).toLocaleString('id-ID');}
function g(id){return document.getElementById(id);}
// Open WhatsApp without going through wa.me redirect servers.
// Mobile: native app deep link. Desktop: WhatsApp Web direct URL.
function openWa(phone, msg) {
  const p = fmtPh(phone);
  const t = encodeURIComponent(msg);
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = 'whatsapp://send?phone=' + p + '&text=' + t;
  } else {
    window.open('https://web.whatsapp.com/send?phone=' + p + '&text=' + t, '_blank', 'noopener,noreferrer');
  }
}
function ini(n){return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();}
function go(id){return outlets.find(o=>o.id===id);}

// ===== ANTAR JEMPUT HELPERS =====
// Inline SVG icon snippets used in dynamically rendered HTML
const _SVG_CAR=`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-1px;flex-shrink:0"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
const _SVG_PKG=`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-1px;flex-shrink:0"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><line x1="12" y1="22.08" x2="12" y2="12"/><line x1="12" y1="12" x2="3.27" y2="6.96"/><line x1="12" y1="12" x2="20.73" y2="6.96"/></svg>`;
const _SVG_WARN=`<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-1px;flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const _SVG_CHECK=`<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-1px;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>`;
const _SVG_TRUCK=`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-1px;margin-right:4px;flex-shrink:0"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
// Haversine distance between two lat/lng points → km
function haversineKm(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
// Extract lat,lng from a Google Maps URL or plain "lat, lng" string. Returns [lat,lng] or null.
// Handles common Google Maps formats:
//   https://maps.app.goo.gl/...  (short link — can't resolve without HTTP, skip)
//   https://www.google.com/maps/@-6.123,106.456,15z
//   https://www.google.com/maps/place/.../@-6.123,106.456,15z
//   https://www.google.com/maps?q=-6.123,106.456
//   https://www.google.com/maps/search/?api=1&query=-6.123,106.456
//   https://maps.google.com/?ll=-6.123,106.456
//   Plain: -6.123, 106.456
function extractLatLng(val){
  if(!val||!val.trim())return null;
  const s=val.trim();
  // 1. @lat,lng,zoom — used in /maps/@... and /place/.../@...
  let m=s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  // 2. query= or q= or ll= param
  if(!m)m=s.match(/[?&](?:query|q|ll)=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
  // 3. !3d<lat>!4d<lng> — embedded in place URLs
  if(!m){const lat3d=s.match(/!3d(-?\d+\.\d+)/),lng4d=s.match(/!4d(-?\d+\.\d+)/);if(lat3d&&lng4d)m=[null,lat3d[1],lng4d[1]];}
  // 4. Plain "lat, lng" or "lat,lng"
  if(!m)m=s.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if(!m)return null;
  const lat=parseFloat(m[1]),lng=parseFloat(m[2]);
  if(lat>=-90&&lat<=90&&lng>=-180&&lng<=180)return[lat,lng];
  return null;
}
// Detect Google Maps short URLs (maps.app.goo.gl / goo.gl/maps)
function _isShortMapsUrl(val){
  return !!(val&&(val.includes('maps.app.goo.gl')||val.includes('goo.gl/maps')));
}
// Extract lat/lng from any HTML/URL string using all known patterns
function _extractCoordsFromText(text){
  if(!text)return null;
  // Pattern: @lat,lng
  let c=extractLatLng(text);if(c)return c;
  // Pattern: !3d<lat>!4d<lng> (embedded in place URLs & HTML)
  const lat3d=text.match(/!3d(-?\d+\.\d+)/),lng4d=text.match(/!4d(-?\d+\.\d+)/);
  if(lat3d&&lng4d){const lt=parseFloat(lat3d[1]),ln=parseFloat(lng4d[1]);if(lt>=-90&&lt<=90&&ln>=-180&&ln<=180)return[lt,ln];}
  // Pattern: center=lat%2Clng or center=lat,lng (URL-encoded)
  const ctr=text.match(/center=(-?\d+\.\d+)[%2C,]+(-?\d+\.\d+)/i);
  if(ctr)return[parseFloat(ctr[1]),parseFloat(ctr[2])];
  // Pattern: "lat":-6.xxx,"lng":106.xxx in JSON
  const jlat=text.match(/"lat(?:itude)?"\s*:\s*(-?\d+\.\d+)/),jlng=text.match(/"ln?g(?:itude)?"\s*:\s*(-?\d+\.\d+)/);
  if(jlat&&jlng)return[parseFloat(jlat[1]),parseFloat(jlng[1])];
  // Pattern: ll=lat,lng
  const ll=text.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if(ll)return[parseFloat(ll[1]),parseFloat(ll[2])];
  return null;
}
// Resolve short Maps URL via Vercel serverless function. Returns [lat,lng] or null.
async function resolveLatLng(val){
  const direct=extractLatLng(val);
  if(direct)return direct;
  if(!_isShortMapsUrl(val))return null;
  try{
    const r=await fetch('/api/resolve-url?url='+encodeURIComponent(val.trim()));
    if(!r.ok)return null;
    const data=await r.json();
    // Server already extracted coords from URL + HTML scan
    if(data.lat&&data.lng)return[data.lat,data.lng];
    // Fallback: try parsing the final URL client-side
    if(data.url){const c=_extractCoordsFromText(data.url);if(c)return c;}
  }catch(e){console.warn('[resolveLatLng]',e.message);}
  return null;
}
// Reverse geocode using Nominatim (free, no key). Returns area string or null.
async function nominatimArea(lat,lng){
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=15`,{headers:{'Accept-Language':'id'}});
    const d=await r.json();
    const a=d.address;
    return a?.neighbourhood||a?.suburb||a?.village||a?.town||a?.city_district||a?.city||null;
  }catch(e){return null;}
}
// Compute distance from customer to nearest outlet. Returns {km, hasCharge, outletId}.
function calcPickupCharge(cLat,cLng,outletId){
  const outlet=outletId?outlets.find(o=>o.id===outletId):outlets[0];
  if(!outlet?.lat||!outlet?.lng)return{km:null,hasCharge:false,outletId:outlet?.id||null};
  const km=haversineKm(cLat,cLng,outlet.lat,outlet.lng);
  const tolerance=0.3;
  return{km,hasCharge:km>(pickupRadiusKm+tolerance),outletId:outlet.id};
}
// Render a small radius badge string (used in request forms and list rows)
function radiusBadge(distKm){
  if(distKm==null)return'';
  const tolerance=0.3;
  const over=distKm>(pickupRadiusKm+tolerance);
  const col=over?'#E53935':'#2e7d32';
  const icon=over?_SVG_WARN:_SVG_CHECK;
  return`<span style="font-size:11px;font-weight:600;color:${col};background:${over?'#ffebee':'#e8f5e9'};padding:2px 7px;border-radius:20px;display:inline-flex;align-items:center;gap:3px">${icon} ${distKm.toFixed(1)} km${over?' (ada biaya '+fmt(pickupExtraCharge)+')':''}</span>`;
}

function toast(m){const t=g('toast');t.textContent=m;t.style.display='block';clearTimeout(t._x);t._x=setTimeout(()=>t.style.display='none',2700);}
function cm(id){g(id).className='mbg';}
function openModal(id){document.querySelectorAll('.mbg.on').forEach(el=>{el.className='mbg';});g(id).className='mbg on';}
function showScr(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));g(id).classList.add('on');window.scrollTo(0,0);if(id==='scr-login'){const el=g('login-scr-email');if(el)el.textContent=currentUserEmail||'';const lb=g('login-scr-logout');if(lb)lb.style.display=currentUserEmail?'':'none';}}
function showApp(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));document.querySelectorAll('.app').forEach(a=>a.classList.remove('on'));g(id).classList.add('on');window.scrollTo(0,0);}
function togglePwd(id,btn){const el=g(id);el.type=el.type==='password'?'text':'password';btn.innerHTML=el.type==='password'?'<i data-lucide="eye"></i>':'<i data-lucide="eye-off"></i>';lucide.createIcons({nodes:[btn]});}
function confirm_(title,msg,onOk){g('mc-title').textContent=title;g('mc-msg').textContent=msg;g('mc-ok').onclick=()=>{cm('m-confirm');onOk();};openModal('m-confirm');}
function confirmBack(){confirm_('Kembali ke Menu Awal?','Sesi ini akan berakhir.',()=>{curRole=null;curStaff=null;showScr('scr-login');document.querySelectorAll('.app').forEach(a=>a.classList.remove('on'));});}
function openDrawer(){const app=document.querySelector('.app.on');if(!app)return;app.querySelector('.sbnav')?.classList.add('open');app.querySelector('.mob-drawer-bg')?.classList.add('on');}
function closeDrawer(){document.querySelectorAll('.sbnav').forEach(n=>n.classList.remove('open'));document.querySelectorAll('.mob-drawer-bg').forEach(b=>b.classList.remove('on'));}
function showMore(){g('more-bg').className='more-bg on';}
function closeMore(){g('more-bg').className='more-bg';}
function mMore(pg){closeMore();oGo(pg,null);}
function buildOutletFilterChips(selId,fnName){
  const all=[{id:'all',name:'Semua Outlet',color:null},...outlets.map(o=>({id:o.id,name:o.name,color:o.color}))];
  return all.map(o=>`<span class="chip${selId===o.id?' on':''}" onclick="${fnName}('${o.id}')" style="${selId===o.id&&o.color?`background:${safeColor(o.color)}18;border-color:${safeColor(o.color)};color:${safeColor(o.color)}`:''}">` +
    `${o.color?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${safeColor(o.color)};margin-right:5px;vertical-align:middle"></span>`:''}${esc(o.name)}</span>`).join('');
}

// ===== LOGIN =====
async function doFirstTimeSetup() {
  const name = (g('setup-store-name')?.value || '').trim();
  const addr = (g('setup-store-addr')?.value || '').trim();
  const wa   = (g('setup-store-wa')?.value || '').trim();
  const pwd  = g('setup-pwd')?.value || '';
  const conf = g('setup-pwd-confirm')?.value || '';
  const errEl = g('setup-err'), btn = g('setup-btn');
  const showErr = msg => { if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } };
  if (!name)            { showErr('⚠️ Nama toko wajib diisi.'); return; }
  if (!pwd)             { showErr('⚠️ Password owner wajib diisi.'); return; }
  if (pwd === 'owner123') { showErr('⚠️ Gunakan password selain "owner123".'); return; }
  if (pwd.length < 4)   { showErr('⚠️ Password minimal 4 karakter.'); return; }
  if (pwd !== conf)     { showErr('⚠️ Konfirmasi password tidak cocok.'); return; }
  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
  storeName = name; storeAddr = addr; storeWa = wa;
  ownerPwd = await hashSecret(pwd);
  syncSettings();
  if (btn) { btn.disabled = false; btn.textContent = 'Mulai Gunakan CleanPOS →'; }
  ['setup-store-name','setup-store-addr','setup-store-wa','setup-pwd','setup-pwd-confirm'].forEach(id => { const el = g(id); if (el) el.value = ''; });
  showScr('scr-login');
  toast('✅ Setup selesai! Selamat menggunakan CleanPOS.');
}
function confirmLogout(){confirm_('Keluar dari Akun?','Kamu akan keluar dan perlu login kembali untuk mengakses data.',()=>authLogout());}
function goOwnerPwd(){showScr('scr-opwd');g('opwd-in').focus();}
async function doOwnerLogin(){
  const input=g('opwd-in').value;
  let match=false;
  if(ownerPwd.startsWith('sha256:')){
    match=(await hashSecret(input))===ownerPwd;
  } else {
    match=input===ownerPwd;
    if(match){ownerPwd=await hashSecret(input);syncSettings();}  // auto-upgrade plain text → hash
  }
  if(match){g('opwd-err').style.display='none';g('opwd-in').value='';curRole='owner';showApp('owner-app');initOwner();}
  else g('opwd-err').style.display='block';
}
function goOutletSelect(){
  showScr('scr-outlet');
  g('outlet-btns').innerHTML=outlets.map(o=>`<button class="ob${curOutlet&&curOutlet.id===o.id?' sel':''}" onclick="pickOutlet('${o.id}')"><div class="odot" style="background:${safeColor(o.color)}"></div><div style="flex:1;text-align:left"><div style="font-weight:700;font-size:15px">${esc(o.name)}</div><div style="font-size:12px;color:var(--t2);margin-top:2px">${esc(o.addr)}</div></div><span style="color:var(--t3);font-size:22px">\u203A</span></button>`).join('');
}
function pickOutlet(id){curOutlet=go(id);showScr('scr-staff');buildStaffBtns();}
function buildStaffBtns(){
  if(!curOutlet)return;
  g('staff-outlet-name').textContent=curOutlet.name;
  g('staff-outlet-sub').textContent='Pilih namamu untuk masuk';
  const list=employees.filter(e=>e.oid===curOutlet.id);
  g('staff-btns').innerHTML=list.length?list.map(e=>`<button class="sb" onclick="pickStaff(${e.id})"><div class="avatar">${esc(ini(e.name))}</div><div style="flex:1;text-align:left"><div style="font-weight:700;font-size:15px">${esc(e.name)}</div><div style="font-size:12px;color:var(--t2)">${esc(e.role)}</div></div><span class="badge ${e.status==='in'?'gg':e.status==='cuti'?'gpu':'gy'}">${e.status==='in'?'Masuk':e.status==='cuti'?'Cuti':'Off'}</span></button>`).join(''):`<div style="text-align:center;padding:24px;color:var(--t2);font-size:14px">Belum ada karyawan di outlet ini</div>`;
}
function pickStaff(id){curStaff=employees.find(e=>e.id===id);pinEntry='';resetPinDots();g('pin-name').textContent='Halo, '+curStaff.name.split(' ')[0]+'!';g('pin-sub').textContent='Masukkan PIN 4 digit kamu';g('pin-err').textContent='';showScr('scr-pin');}
function kp(n){if(!curStaff||pinEntry.length>=4)return;pinEntry+=n;updPinDots();if(pinEntry.length===4)setTimeout(chkPin,150);}
function dp(){if(pinEntry.length>0){pinEntry=pinEntry.slice(0,-1);updPinDots();}}
function updPinDots(){for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd'+(i<pinEntry.length?' on':'');}}
function resetPinDots(){pinEntry='';for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd';}}
async function chkPin(){
  const stored=curStaff.pin;
  let match=false;
  if(stored&&stored.startsWith('sha256:')){
    match=(await hashSecret(pinEntry))===stored;
  } else {
    match=pinEntry===stored;
    if(match){
      // Auto-upgrade plain-text PIN to hash
      const hashed=await hashSecret(pinEntry);
      curStaff.pin=hashed;
      employees.find(e=>e.id===curStaff.id).pin=hashed;
      syncEmployee(employees.find(e=>e.id===curStaff.id));
    }
  }
  if(match){curRole='staff';showApp('staff-app');initStaff();}
  else{g('pin-err').textContent='PIN salah. Coba lagi.';for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd er';}setTimeout(()=>{pinEntry='';updPinDots();g('pin-err').textContent='';},900);}
}

// ===== NAV =====
function isPlanExpired(){
  const d = _daysLeft();
  return d !== null && d <= 0;
}

function _planExpiredGate(){
  // Show settings and toast, return true if blocked
  if(!isPlanExpired()) return false;
  oGo('settings', document.querySelector('#o-nav .ni[onclick*="settings"]'));
  toast('⚠️ Langganan berakhir — selesaikan pembayaran di Pengaturan untuk melanjutkan.');
  return true;
}

function oGo(pg,el){
  // Block all pages except settings when plan/trial has expired
  if(pg !== 'settings' && isPlanExpired()){
    // Force to settings
    document.querySelectorAll('#o-mc .page').forEach(p=>p.classList.remove('on'));
    document.querySelectorAll('#o-nav .ni').forEach(n=>n.classList.remove('on'));
    const sp = g('o-p-settings'); if(sp) sp.classList.add('on');
    const sEl = document.querySelector('#o-nav .ni[onclick*="settings"]'); if(sEl) sEl.classList.add('on');
    g('o-mc').scrollTop = 0;
    renderSettings();
    toast('⚠️ Langganan berakhir — selesaikan pembayaran untuk melanjutkan.');
    return;
  }
  document.querySelectorAll('#o-mc .page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('#o-nav .ni').forEach(n=>n.classList.remove('on'));
  const p=g('o-p-'+pg);if(p)p.classList.add('on');if(el)el.classList.add('on');
  g('o-mc').scrollTop=0;
  const pm={dashboard:()=>requestAnimationFrame(refreshODash),orders:renderOrders,tracking:()=>renderKanban('o'),delivery:renderDeliveryPage,wa:renderWaCenter,kas:renderKas,expenses:renderExpenses,reports:renderReports,employees:renderEmployees,outlets:renderOutlets,customers:renderCusts,pricing:renderPricing,promo:renderPromo,settings:renderSettings,notifications:renderNotifications,'card-design':renderMemberCardDesign};
  if(pm[pg])pm[pg]();
  if(pg==='new-order'){buildOrderForm('no');calcO();}
  closeDrawer();
}
function oGoB(pg,el){document.querySelectorAll('#owner-app .bnav .bni').forEach(n=>n.classList.remove('on'));if(el)el.classList.add('on');oGo(pg,null);}
function sGo(pg,el){
  document.querySelectorAll('#s-mc .page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('#s-nav .ni').forEach(n=>n.classList.remove('on'));
  const p=g('s-p-'+pg);if(p)p.classList.add('on');if(el)el.classList.add('on');
  g('s-mc').scrollTop=0;
  const pm={dashboard:refreshSDash,orders:renderOrders,tracking:()=>renderKanban('s'),wa:renderSWa,membership:renderMembership,delivery:renderDeliveryPage,printer:renderPrinters,notifications:renderNotifications};
  if(pm[pg])pm[pg]();
  if(pg==='new-order'){buildOrderForm('sno');calcS();}
  closeDrawer();
}
function sGoB(pg,el){document.querySelectorAll('#staff-app .bnav .bni').forEach(n=>n.classList.remove('on'));if(el)el.classList.add('on');sGo(pg,null);}

// ===== SEED DATA =====
function genId(){const r=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();return `LDRY-${r}`;}
function addCust(name,phone,total,date){if(!customers[phone])customers[phone]={name,phone,orders:0,total:0,balance:0,lastDate:date};customers[phone].orders++;customers[phone].total+=total;customers[phone].lastDate=date;}
function seed(){
  const kiloanSeeds=[
    {name:'Budi Santoso',phone:'081234567890',svc:'kiloan',cat:'regular',qty:3,st:'Selesai',pay:'Lunas',waSent:true,oid:'o1'},
    {name:'Siti Rahayu',phone:'082345678901',svc:'kiloan',cat:'express',qty:2,st:'Mencuci',pay:'Belum Bayar',waSent:false,oid:'o1'},
    {name:'Dewi Lestari',phone:'084567890123',svc:'kiloan',cat:'regular',qty:3,st:'Mengeringkan',pay:'DP',waSent:false,oid:'o1'},
  ];
  kiloanSeeds.forEach((d,i)=>{
    orderCtr=i+1;
    const bq=bQty(d.svc,d.cat,d.qty);
    const base=(getSvcById(d.svc)?.prices[d.cat]||0)*bq;
    const seedHours=[8,10,14];
    const isoFull=new Date(TODAY_ISO+'T'+(seedHours[i]<10?'0':'')+seedHours[i]+':30:00').toISOString();
    orders.push({id:genId(),name:d.name,phone:d.phone,svcType:d.svc,svcCat:d.cat,qty:bq,rawQty:d.qty,satuanLines:[],addOns:[],addOnAmt:0,base,discType:'none',discAmt:0,promoAmt:0,total:base,payMethod:'Tunai',payStatus:d.pay,status:d.st,notes:'',date:TODAY_STR,isoDate:isoFull,waSent:d.waSent,handledBy:'Owner',outletId:d.oid});
    addCust(d.name,d.phone,base,TODAY_STR);
  });
  const satSeeds=[
    {name:'Andi Kurniawan',phone:'083456789012',cat:'sameday',st:'Selesai',pay:'Lunas',waSent:false,oid:'o2',lines:[{id:'sat1',qty:1},{id:'sat3',qty:2}]},
    {name:'Reza Firmansyah',phone:'085678901234',cat:'express',st:'Diterima',pay:'Lunas',waSent:false,oid:'o2',lines:[{id:'sat2',qty:1},{id:'sat4',qty:2}]},
  ];
  satSeeds.forEach((d,i)=>{
    orderCtr=kiloanSeeds.length+i+1;
    const satuanLines=d.lines.map(l=>{const item=satuanItems.find(s=>s.id===l.id);return{id:l.id,name:item?.name||l.id,qty:l.qty,unitPrice:item?.prices[d.cat]||0,lineTotal:(item?.prices[d.cat]||0)*l.qty};});
    const base=satuanLines.reduce((s,l)=>s+l.lineTotal,0);
    const qty=satuanLines.reduce((s,l)=>s+l.qty,0);
    const satHours=[11,16];
    const isoFull2=new Date(TODAY_ISO+'T'+(satHours[i]<10?'0':'')+satHours[i]+':00:00').toISOString();
    orders.push({id:genId(),name:d.name,phone:d.phone,svcType:'satuan',svcCat:d.cat,qty,rawQty:qty,satuanLines,addOns:[],addOnAmt:0,base,discType:'none',discAmt:0,promoAmt:0,total:base,payMethod:'Tunai',payStatus:d.pay,status:d.st,notes:'',date:TODAY_STR,isoDate:isoFull2,waSent:d.waSent,handledBy:'Owner',outletId:d.oid});
    addCust(d.name,d.phone,base,TODAY_STR);
  });
  if(orders[0].waSent)waLog.push({orderId:orders[0].id,name:orders[0].name,phone:orders[0].phone,time:NOW()+', '+TODAY_STR});
  // --- Yesterday seed data (for period comparison) ---
  const yd=new Date(TODAY);yd.setDate(yd.getDate()-1);
  const ydISO=_isoStr(yd);const ydStr=yd.toLocaleDateString('id-ID',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
  const ydSeeds=[
    {name:'Budi Santoso',phone:'081234567890',svc:'kiloan',cat:'regular',qty:5,pay:'Lunas',oid:'o1',hr:9},
    {name:'Siti Rahayu',phone:'082345678901',svc:'kiloan',cat:'express',qty:3,pay:'Lunas',oid:'o1',hr:14},
    {name:'Dewi Lestari',phone:'084567890123',svc:'kiloan',cat:'sameday',qty:4,pay:'Lunas',oid:'o2',hr:17},
  ];
  ydSeeds.forEach(d=>{
    orderCtr++;
    const bq=bQty(d.svc,d.cat,d.qty);
    const base=(getSvcById(d.svc)?.prices[d.cat]||0)*bq;
    const isoFull3=new Date(ydISO+'T'+(d.hr<10?'0':'')+d.hr+':00:00').toISOString();
    orders.push({id:genId(),name:d.name,phone:d.phone,svcType:d.svc,svcCat:d.cat,qty:bq,rawQty:d.qty,satuanLines:[],addOns:[],addOnAmt:0,base,discType:'none',discAmt:0,promoAmt:0,total:base,payMethod:'Tunai',payStatus:d.pay,status:'Diambil',notes:'',date:ydStr,isoDate:isoFull3,waSent:true,handledBy:'Owner',outletId:d.oid});
    addCust(d.name,d.phone,base,ydStr);
  });
  orderCtr=10;
  kasLog=[{id:1,type:'modal',desc:'Setor Modal',note:'modal kembalian pagi',amount:200000,time:'08:00',outletId:'o1'},{id:2,type:'in',desc:'Penjualan Cash',note:'Budi Santoso',amount:21000,time:'09:14',outletId:'o1'},{id:3,type:'out',desc:'Tarik Kas',note:'beli deterjen',amount:50000,time:'11:30',outletId:'o1'}];
  kasCtr=4;
  expenses=[{id:1,cat:'listrik',label:'Listrik',nominal:150000,date:TODAY_ISO,note:'Tagihan PLN',src:'transfer',outletId:'o1'},{id:2,cat:'deterjen',label:'Deterjen/Sabun',nominal:75000,date:TODAY_ISO,note:'Attack 2kg',src:'cash',outletId:'o2'}];
  expCtr=3;
}

// ===== INIT =====
function initOwner(){
  loadPrintersFromStorage();
  _loadNotifications();_updateNotifBadge();
  setInterval(_generateNotifications,5*60*1000);
  setTimeout(_generateNotifications,5000);
  const _tlbl=g('today-lbl'); if(_tlbl) _tlbl.textContent=DAYS_ID[TODAY_DAY]+', '+TODAY_STR;
  const ta=g('wa-tpl');if(ta)ta.value=waTplSelesai;
  prevTpl();renderPricing();renderPromo();renderSettings();
  renderPlanBadge();renderSubCard();checkPlanExpiry();
  if(isPlanExpired()){
    // Land directly on settings so user can pay
    oGo('settings', document.querySelector('#o-nav .ni[onclick*="settings"]'));
  } else {
    buildOrderForm('no');calcO();
    refreshODash();
  }
  _resetIdleTimer();
}
function initStaff(){loadPrintersFromStorage();_updateNotifBadge();g('staff-role-lbl').textContent='\uD83D\uDC64 '+curStaff.name;g('s-greet').textContent='Halo, '+curStaff.name+'!';updStaffClk();buildOrderForm('sno');calcS();refreshSDash();_resetIdleTimer();}
function renderSettings(){
  renderSubCard();
  renderPrinters();
  if(g('s-store'))g('s-store').value=storeName;
  if(g('s-wa'))g('s-wa').value=storeWa;
  if(g('s-footer'))g('s-footer').value=storeFooter;
  if(g('s-cuti'))g('s-cuti').value=cutiPerBulan;
  // Notification settings
  [['notif-wa-pending',notifWaPending],['notif-proses-kosong',notifProsesKosong],['notif-belum-lunas',notifBelumLunas],['notif-durasi-lama',notifDurasiLama]].forEach(([id,val])=>{
    const cb=g(id);if(cb)cb.checked=val;
    const btn=g(id+'-btn');if(btn){btn.classList.toggle('on',val);btn.classList.toggle('off',!val);}
  });
  if(g('notif-delay'))g('notif-delay').value=notifProsesKosongDelay;
  if(g('notif-dur-mencuci'))g('notif-dur-mencuci').value=notifDurasiMencuci;
  if(g('notif-dur-mengeringkan'))g('notif-dur-mengeringkan').value=notifDurasiMengeringkan;
  // kg step radio
  const kgRadio=document.querySelector(`input[name="s-kgstep"][value="${kgStep}"]`);
  if(kgRadio){kgRadio.checked=true;_syncKgStepLabels();}
  else{const def=document.querySelector('input[name="s-kgstep"][value="0.5"]');if(def){def.checked=true;_syncKgStepLabels();}}
  const isElite=(currentPlan==='elite'||currentPlan==='enterprise')&&currentPlanStatus==='active';
  const mCard=g('membership-settings-card');
  if(mCard){
    let lockEl=mCard.querySelector('.mbr-lock');
    if(!isElite){
      if(!lockEl){
        lockEl=document.createElement('div');lockEl.className='mbr-lock';
        lockEl.style.cssText='position:absolute;inset:0;background:rgba(255,255,255,.88);backdrop-filter:blur(3px);border-radius:var(--r);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;z-index:2;';
        lockEl.innerHTML='<i data-lucide="lock" style="width:28px;height:28px;stroke-width:1.75;color:var(--t2)"></i><div style="font-size:13px;font-weight:700;color:var(--t1)">Fitur Elite</div><div style="font-size:12px;color:var(--t2);text-align:center;padding:0 24px;max-width:260px">Upgrade ke paket <strong>Elite</strong> untuk mengaktifkan Membership & Saldo Pelanggan</div><button class="btn bp bsm bpill" style="margin-top:4px" onclick="showUpgradeModal()">Upgrade Sekarang</button>';
        mCard.style.position='relative';
        mCard.appendChild(lockEl);
        lucide.createIcons({nodes:[lockEl]});
      }
    } else {
      if(lockEl)lockEl.remove();
      mCard.style.position='';
    }
  }
  const mt=g('membership-toggle');
  if(mt)mt.className='toggle'+(membershipEnabled?' on':' off');
  const mbs=g('membership-bonus-section');
  if(mbs)mbs.style.display=membershipEnabled?'':'none';
  // Style tabs
  const isPkg=membershipStyle==='package';
  const sbd=g('mbr-style-btn-deposit'),sbp=g('mbr-style-btn-package');
  if(sbd)sbd.className='btn bpill bsm'+(isPkg?'':' bp');
  if(sbp)sbp.className='btn bpill bsm'+(isPkg?' bp':'');
  // Deposit settings vs package settings
  const mds=g('mbr-deposit-settings'),mps=g('mbr-package-settings');
  if(mds)mds.style.display=isPkg?'none':'';
  if(mps)mps.style.display=isPkg?'':'none';
  // Deposit sub-fields
  if(g('s-mbr-bonus'))g('s-mbr-bonus').value=membershipBonus;
  if(g('s-mbr-min-deposit'))g('s-mbr-min-deposit').value=membershipMinDeposit;
  const met=g('membership-expiry-toggle');
  if(met)met.className='toggle'+(membershipExpiryEnabled?' on':' off');
  const mes=g('membership-expiry-section');
  if(mes)mes.style.display=membershipExpiryEnabled?'':'none';
  if(g('s-mbr-expiry-days'))g('s-mbr-expiry-days').value=membershipExpiryDays;
  // Package list
  if(isPkg)renderMbrPackages();
  // Card designer preview
  setTimeout(()=>{ drawMemberCardPreview(); selectCardField(_cardActiveField); },50);
  // Pickup settings (only if tab is visible)
  if(g('set-tc-pickup')?.classList.contains('on'))renderPickupSettings();
}
function switchSettingsTab(tab,el){
  document.querySelectorAll('.set-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.set-tc').forEach(c=>c.classList.remove('on'));
  if(el)el.classList.add('on');
  const tc=g('set-tc-'+tab);if(tc)tc.classList.add('on');
  if(tab==='mbr')setTimeout(()=>{drawMemberCardPreview();selectCardField(_cardActiveField);},60);
  if(tab==='pickup')renderPickupSettings();
}
function renderPickupSettings(){
  if(g('s-pickup-radius'))g('s-pickup-radius').value=pickupRadiusKm;
  if(g('s-pickup-charge'))g('s-pickup-charge').value=pickupExtraCharge;
  const list=g('pickup-slots-list');
  if(!list)return;
  if(!pickupSlots.length){list.innerHTML='<div style="font-size:12px;color:var(--t2);padding:6px 0">Belum ada slot. Tambahkan slot jadwal di bawah.</div>';return;}
  list.innerHTML=pickupSlots.map((s,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--b1);border-radius:var(--rs);margin-bottom:6px;background:var(--bg)"><span style="font-size:13px;font-weight:600">${esc(s.name)}</span><button class="btn bsm" style="padding:3px 10px;font-size:12px;color:#c62828;border-color:#ffcdd2" onclick="deletePickupSlot(${i})">Hapus</button></div>`).join('');
}
function savePickupSettings(){
  const r=parseFloat(g('s-pickup-radius')?.value)||3.0;
  const c=parseFloat(g('s-pickup-charge')?.value)||5000;
  if(r<0.5){toast('Radius minimal 0.5 km');return;}
  pickupRadiusKm=r;pickupExtraCharge=c;
  syncSettings();toast('Pengaturan antar jemput disimpan');
}
function addPickupSlot(){
  const name=(g('s-slot-name')?.value||'').trim();
  if(!name){toast('Nama slot wajib diisi');return;}
  pickupSlots.push({id:'sl'+Date.now(),name});
  if(g('s-slot-name'))g('s-slot-name').value='';
  renderPickupSettings();syncSettings();
}
function deletePickupSlot(idx){
  pickupSlots.splice(idx,1);
  renderPickupSettings();syncSettings();
}

// ===== MODAL: REQUEST JEMPUT =====
let _pickupEditId = null; // null = new, else ID of dq entry being edited

function _fillSlotSelect(selId){
  const sel=g(selId);if(!sel)return;
  const prev=sel.value;
  sel.innerHTML='<option value="">-- Pilih Slot --</option>';
  pickupSlots.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;sel.appendChild(o);});
  if(prev)sel.value=prev;
}
function _fillOutletSelect(selId){
  const sel=g(selId);if(!sel)return;
  sel.innerHTML=outlets.map(o=>`<option value="${esc(o.id)}">${esc(o.name)}</option>`).join('');
}

function openPickupModal(editId=null){
  _pickupEditId=editId;
  if(g('mpk-cust-results'))g('mpk-cust-results').innerHTML='';
  const today=new Date().toISOString().split('T')[0];
  if(editId){
    const dq=deliveryQueue.find(d=>d.id===editId);
    if(!dq)return;
    g('m-pickup-title').textContent='Edit Request Jemput';
    if(g('mpk-name'))g('mpk-name').value=dq.name||'';
    if(g('mpk-phone'))g('mpk-phone').value=dq.phone||'';
    if(g('mpk-addr'))g('mpk-addr').value=dq.address||'';
    if(g('mpk-lat'))g('mpk-lat').value=dq.lat||'';
    if(g('mpk-lng'))g('mpk-lng').value=dq.lng||'';
    if(g('mpk-loc'))g('mpk-loc').value=(dq.lat&&dq.lng)?`${dq.lat}, ${dq.lng}`:'';
    if(g('mpk-loc-badge'))g('mpk-loc-badge').innerHTML=(dq.lat&&dq.lng)?radiusBadge(dq.distanceKm):'';
    if(g('mpk-date'))g('mpk-date').value=dq.date||today;
    if(g('mpk-notes'))g('mpk-notes').value=dq.notes||'';
  } else {
    g('m-pickup-title').textContent='Request Jemput';
    ['mpk-name','mpk-phone','mpk-addr','mpk-notes','mpk-loc'].forEach(id=>{if(g(id))g(id).value='';});
    if(g('mpk-lat'))g('mpk-lat').value='';if(g('mpk-lng'))g('mpk-lng').value='';
    if(g('mpk-loc-badge'))g('mpk-loc-badge').innerHTML='';
    if(g('mpk-date'))g('mpk-date').value=today;
    if(g('mpk-charge-info'))g('mpk-charge-info').textContent='';
  }
  _fillSlotSelect('mpk-slot');
  if(editId){const dq=deliveryQueue.find(d=>d.id===editId);if(dq&&g('mpk-slot'))g('mpk-slot').value=dq.slotId||'';}
  // Outlet select — only show if multiple outlets
  const outWrap=g('mpk-outlet-wrap');
  if(outWrap)outWrap.style.display=outlets.length>1?'':'none';
  _fillOutletSelect('mpk-outlet');
  if(curOutlet&&g('mpk-outlet'))g('mpk-outlet').value=curOutlet;
  openModal('m-pickup');
}

function onPickupNameInput(val){
  const q=(val||'').toLowerCase().trim();
  const res=g('mpk-cust-results');if(!res)return;
  if(!q){res.innerHTML='';return;}
  const matches=Object.values(customers).filter(c=>
    c.name.toLowerCase().includes(q)||c.phone.includes(q)
  ).slice(0,8);
  if(!matches.length){res.innerHTML='';return;}
  res.innerHTML=`<div style="position:absolute;top:100%;left:0;right:0;background:var(--ca);border:1.5px solid var(--p);border-radius:var(--rs);box-shadow:var(--sh2);z-index:200;max-height:220px;overflow-y:auto">${
    matches.map(c=>`<div onclick="pickPickupCust('${esc(c.phone)}')" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--b1)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
      <div style="font-weight:600;font-size:13px">${esc(c.name)}</div>
      <div style="font-size:12px;color:var(--t2)">${esc(c.phone)}${c.address?` · ${esc(c.address)}`:''}${c.lat&&c.lng?` <span style="color:var(--p);font-size:11px">Lokasi tersimpan</span>`:''}</div>
    </div>`).join('')
  }</div>`;
}

function pickPickupCust(phone){
  const c=customers[phone];if(!c)return;
  if(g('mpk-name'))g('mpk-name').value=c.name||'';
  if(g('mpk-phone'))g('mpk-phone').value=c.phone||'';
  if(g('mpk-cust-results'))g('mpk-cust-results').innerHTML='';
  // Pre-fill address and location
  if(c.address&&g('mpk-addr'))g('mpk-addr').value=c.address;
  if(c.lat&&c.lng){
    if(g('mpk-lat'))g('mpk-lat').value=c.lat;
    if(g('mpk-lng'))g('mpk-lng').value=c.lng;
    if(g('mpk-loc'))g('mpk-loc').value=`${c.lat}, ${c.lng}`;
    _updatePickupChargeBadge(c.lat,c.lng);
  }
}

function onPickupPhoneInput(phone){
  const c=customers[fmtPh(phone)||phone];
  if(!c)return;
  if(g('mpk-name')&&!g('mpk-name').value)g('mpk-name').value=c.name||'';
  // Pre-fill location if customer has saved lat/lng
  if(c.lat&&c.lng&&g('mpk-lat')&&!g('mpk-lat').value){
    g('mpk-lat').value=c.lat;g('mpk-lng').value=c.lng;
    if(g('mpk-loc'))g('mpk-loc').value=`${c.lat}, ${c.lng}`;
    _updatePickupChargeBadge(c.lat,c.lng);
  }
  if(c.address&&g('mpk-addr')&&!g('mpk-addr').value)g('mpk-addr').value=c.address;
}

async function onPickupLocInput(val){
  const badge=g('mpk-loc-badge');
  let coords=extractLatLng(val);
  if(!coords&&_isShortMapsUrl(val)){
    if(badge)badge.innerHTML='<span style="color:var(--t2);font-size:11px">Mengambil koordinat...</span>';
    coords=await resolveLatLng(val);
    if(!coords){
      if(badge)badge.innerHTML=`<span style="color:#c62828;font-size:11px">Tidak bisa baca otomatis. <a href="${val.trim()}" target="_blank" rel="noopener" style="color:var(--p)">Buka link ini</a>, lalu salin URL panjang dari address bar browser dan paste kembali di sini.</span>`;
      return;
    }
  }
  if(coords){
    const[lat,lng]=coords;
    if(g('mpk-lat'))g('mpk-lat').value=lat;if(g('mpk-lng'))g('mpk-lng').value=lng;
    _updatePickupChargeBadge(lat,lng);
  } else {
    if(g('mpk-lat'))g('mpk-lat').value='';if(g('mpk-lng'))g('mpk-lng').value='';
    if(badge)badge.innerHTML='';
    if(g('mpk-charge-info'))g('mpk-charge-info').textContent='';
  }
}

function _updatePickupChargeBadge(lat,lng){
  const outletId=g('mpk-outlet')?.value||null;
  const res=calcPickupCharge(lat,lng,outletId);
  if(g('mpk-loc-badge'))g('mpk-loc-badge').innerHTML=res.km!=null?radiusBadge(res.km):'';
  if(g('mpk-charge-info'))g('mpk-charge-info').innerHTML=res.hasCharge?`<span style="color:#c62828">Biaya tambahan <strong>${fmt(pickupExtraCharge)}</strong> akan ditambahkan ke invoice.</span>`:'';
}

async function savePickupRequest(){
  const name=(g('mpk-name')?.value||'').trim();
  const rawPhone=(g('mpk-phone')?.value||'').trim();
  const phone=fmtPh(rawPhone)||rawPhone;
  if(!name||!phone){toast('Nama dan nomor HP wajib diisi');return;}
  const lat=g('mpk-lat')?.value?parseFloat(g('mpk-lat').value):null;
  const lng=g('mpk-lng')?.value?parseFloat(g('mpk-lng').value):null;
  if(!lat||!lng){
    const locEl=g('mpk-loc');
    if(locEl){locEl.style.borderColor='var(--re)';locEl.focus();setTimeout(()=>locEl.style.borderColor='',2500);}
    toast('Lokasi jemput wajib diisi dan harus valid (koordinat terdeteksi)');return;
  }
  const address=(g('mpk-addr')?.value||'').trim();
  const slotId=g('mpk-slot')?.value||null;
  const date=g('mpk-date')?.value||new Date().toISOString().split('T')[0];
  const notes=(g('mpk-notes')?.value||'').trim();
  const outletId=outlets.length>1?(g('mpk-outlet')?.value||outlets[0]?.id):outlets[0]?.id;

  // Compute charge
  const chargeRes=lat&&lng?calcPickupCharge(lat,lng,outletId):{km:null,hasCharge:false,outletId};
  // Auto-tag area from Nominatim if lat/lng available
  let area=null;
  if(lat&&lng){toast('Mendeteksi area...');area=await nominatimArea(lat,lng);}

  const id=_pickupEditId||('dq'+Date.now());
  const dq={id,type:'pickup',name,phone,address:address||null,lat,lng,area,slotId,date,status:'Menunggu',distanceKm:chargeRes.km,hasCharge:chargeRes.hasCharge,orderId:null,outletId,notes:notes||null,createdAt:new Date().toISOString()};

  // Save customer lat/lng for future use
  if(lat&&lng){
    const cust=customers[phone]||{name,phone,orders:0,total:0,balance:0,lastDate:null,balanceExpiry:null};
    cust.lat=lat;cust.lng=lng;if(address)cust.address=address;
    customers[phone]=cust;syncCustomer(cust);
  }

  const existing=deliveryQueue.findIndex(d=>d.id===id);
  if(existing>=0)deliveryQueue[existing]=dq;else deliveryQueue.push(dq);
  syncDeliveryQueue(dq);
  _pickupEditId=null;
  cm('m-pickup');
  toast('Request jemput disimpan');
  if(typeof renderDeliveryPage==='function')renderDeliveryPage();
}

// ===== MODAL: REQUEST ANTAR =====
let _deliveryOrderId = null;

function openDeliveryModal(orderId){
  _deliveryOrderId=orderId;
  const o=orders.find(x=>x.id===orderId);
  if(!o){toast('Order tidak ditemukan');return;}
  const infoEl=g('mdl-order-info');
  if(infoEl)infoEl.innerHTML=`<strong>${esc(o.name)}</strong> &middot; ${esc(o.id)}<br><span style="color:var(--t2)">${esc(getSvcLbl(o.svcType+'-'+o.svcCat)||o.svcType||'')} &middot; ${fmt(o.total)}</span>`;
  ['mdl-addr','mdl-notes','mdl-loc'].forEach(id=>{if(g(id))g(id).value='';});
  if(g('mdl-lat'))g('mdl-lat').value='';if(g('mdl-lng'))g('mdl-lng').value='';
  if(g('mdl-loc-badge'))g('mdl-loc-badge').innerHTML='';
  if(g('mdl-charge-info'))g('mdl-charge-info').textContent='';
  // Pre-fill from customer data
  const phone=fmtPh(o.phone)||o.phone;
  const cust=customers[phone];
  if(cust?.lat&&cust?.lng){
    if(g('mdl-lat'))g('mdl-lat').value=cust.lat;
    if(g('mdl-lng'))g('mdl-lng').value=cust.lng;
    if(g('mdl-loc'))g('mdl-loc').value=`${cust.lat}, ${cust.lng}`;
    _updateDeliveryChargeBadge(cust.lat,cust.lng,o.outletId);
  }
  if(cust?.address&&g('mdl-addr'))g('mdl-addr').value=cust.address;
  const today=new Date().toISOString().split('T')[0];
  if(g('mdl-date'))g('mdl-date').value=today;
  _fillSlotSelect('mdl-slot');
  openModal('m-delivery');
}

async function onDeliveryLocInput(val){
  const locBadge=g('mdl-loc-badge');
  let coords=extractLatLng(val);
  if(!coords&&_isShortMapsUrl(val)){
    if(locBadge)locBadge.innerHTML='<span style="color:var(--t2);font-size:11px">Mengambil koordinat...</span>';
    coords=await resolveLatLng(val);
    if(!coords){
      if(locBadge)locBadge.innerHTML=`<span style="color:#c62828;font-size:11px">Tidak bisa baca otomatis. <a href="${val.trim()}" target="_blank" rel="noopener" style="color:var(--p)">Buka link ini</a>, lalu salin URL panjang dari address bar browser dan paste kembali di sini.</span>`;
      return;
    }
  }
  if(coords){
    const[lat,lng]=coords;
    if(g('mdl-lat'))g('mdl-lat').value=lat;if(g('mdl-lng'))g('mdl-lng').value=lng;
    const o=orders.find(x=>x.id===_deliveryOrderId);
    _updateDeliveryChargeBadge(lat,lng,o?.outletId||null);
  } else {
    if(g('mdl-lat'))g('mdl-lat').value='';if(g('mdl-lng'))g('mdl-lng').value='';
    if(locBadge)locBadge.innerHTML='';
    if(g('mdl-charge-info'))g('mdl-charge-info').textContent='';
  }
}

function _updateDeliveryChargeBadge(lat,lng,outletId){
  const res=calcPickupCharge(lat,lng,outletId);
  if(g('mdl-loc-badge'))g('mdl-loc-badge').innerHTML=res.km!=null?radiusBadge(res.km):'';
  const o=orders.find(x=>x.id===_deliveryOrderId);
  const alreadyCharged=o&&_orderHasDeliveryCharge(o);
  if(g('mdl-charge-info'))g('mdl-charge-info').innerHTML=res.hasCharge&&!alreadyCharged?`<span style="color:#c62828">Biaya antar jemput <strong>${fmt(pickupExtraCharge)}</strong> akan ditambahkan ke invoice order.</span>`:res.hasCharge&&alreadyCharged?'<span style="color:var(--t2)">Biaya sudah termasuk di invoice.</span>':'';
}

function _orderHasDeliveryCharge(o){
  return !!(o.addOns||[]).find(a=>a.key==='delivery_charge');
}

async function saveDeliveryRequest(){
  const o=orders.find(x=>x.id===_deliveryOrderId);
  if(!o){toast('Order tidak ditemukan');return;}
  const lat=g('mdl-lat')?.value?parseFloat(g('mdl-lat').value):null;
  const lng=g('mdl-lng')?.value?parseFloat(g('mdl-lng').value):null;
  const address=(g('mdl-addr')?.value||'').trim();
  const slotId=g('mdl-slot')?.value||null;
  const date=g('mdl-date')?.value||new Date().toISOString().split('T')[0];
  const notes=(g('mdl-notes')?.value||'').trim();

  const chargeRes=lat&&lng?calcPickupCharge(lat,lng,o.outletId):{km:null,hasCharge:false,outletId:o.outletId};
  let area=null;
  if(lat&&lng){toast('Mendeteksi area...');area=await nominatimArea(lat,lng);}

  const id='dq'+Date.now();
  const dq={id,type:'delivery',name:o.name,phone:o.phone,address:address||null,lat,lng,area,slotId,date,status:'Menunggu',distanceKm:chargeRes.km,hasCharge:chargeRes.hasCharge,orderId:o.id,outletId:o.outletId,notes:notes||null,createdAt:new Date().toISOString()};

  // Save customer lat/lng
  const phone=fmtPh(o.phone)||o.phone;
  if(lat&&lng){
    const cust=customers[phone]||{name:o.name,phone,orders:0,total:0,balance:0,lastDate:null,balanceExpiry:null};
    cust.lat=lat;cust.lng=lng;if(address)cust.address=address;
    customers[phone]=cust;syncCustomer(cust);
  }

  // Add delivery charge to order invoice if applicable and not already charged
  if(chargeRes.hasCharge&&!_orderHasDeliveryCharge(o)){
    o.addOns=o.addOns||[];
    o.addOns.push({key:'delivery_charge',label:'Antar Jemput',amt:pickupExtraCharge});
    o.addOnAmt=(o.addOnAmt||0)+pickupExtraCharge;
    o.total=(o.total||0)+pickupExtraCharge;
    syncOrder(o);
  }

  deliveryQueue.push(dq);
  syncDeliveryQueue(dq);
  _deliveryOrderId=null;
  cm('m-delivery');
  toast('Request antar disimpan');
  if(typeof renderDeliveryPage==='function')renderDeliveryPage();
  renderOrders();
}

// ===== HALAMAN JEMPUT & ANTAR =====
let _dqFilter = 'active';
let _dqOpenDates = new Set();

function _fmtDqDate(dk){
  if(dk==='—')return'—';
  try{const d=new Date(dk+'T00:00:00');return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return dk;}
}

// Returns role-aware element ID for delivery page elements
function _dqId(id){return curRole==='staff'?'s-'+id:id;}

function toggleDqDate(dk){
  if(_dqOpenDates.has(dk))_dqOpenDates.delete(dk);else _dqOpenDates.add(dk);
  renderDeliveryPage();
}

function setDqFilter(f, btn){
  _dqFilter=f;
  document.querySelectorAll('#'+_dqId('dq-filter-chips')+' .btn').forEach(b=>b.classList.remove('bp'));
  if(btn)btn.classList.add('bp');
  renderDeliveryPage();
}

function renderDeliveryPage(){
  const list=g(_dqId('dq-list'));if(!list)return;
  const today=new Date().toISOString().slice(0,10);
  if(_dqOpenDates.size===0)_dqOpenDates.add(today);

  // Active items based on filter
  let items=[...deliveryQueue];
  if(_dqFilter==='pickup')items=items.filter(d=>d.type==='pickup');
  else if(_dqFilter==='delivery')items=items.filter(d=>d.type==='delivery');
  else if(_dqFilter==='pending')items=items.filter(d=>d.status==='Menunggu');
  else if(_dqFilter==='done')items=items.filter(d=>d.status==='Selesai');
  else if(_dqFilter==='active')items=items.filter(d=>d.status!=='Selesai');

  // Selesai items per date for collapsed section (Opsi C) — only when showing active
  const showDoneSection=(_dqFilter==='active');
  const selesaiByDate={};
  if(showDoneSection){
    deliveryQueue.filter(d=>d.status==='Selesai').forEach(d=>{
      const dk=d.date||'—';if(!selesaiByDate[dk])selesaiByDate[dk]=[];selesaiByDate[dk].push(d);
    });
  }

  // Build set of all date keys to render
  const byDate={};
  items.forEach(d=>{const dk=d.date||'—';if(!byDate[dk])byDate[dk]=[];byDate[dk].push(d);});
  const allDates=new Set([...Object.keys(byDate),...Object.keys(selesaiByDate)]);
  const sortedDates=[...allDates].sort().reverse();

  if(!sortedDates.length){
    list.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--t2)">Belum ada request antar jemput.</div>';
    g(_dqId('dq-route-panel')).style.display='none';
    return;
  }

  list.innerHTML=sortedDates.map(dk=>{
    const activeRows=byDate[dk]||[];
    const doneRows=selesaiByDate[dk]||[];
    if(!activeRows.length&&!doneRows.length)return'';

    const isOpen=_dqOpenDates.has(dk);
    const isToday=dk===today;
    const label=isToday?`${_fmtDqDate(dk)} — Hari ini`:_fmtDqDate(dk);
    const chevron=isOpen?'▼':'▶';
    const countBadge=activeRows.length
      ?`<span style="font-size:11px;color:var(--p);font-weight:600">${activeRows.length} aktif${doneRows.length?' · '+doneRows.length+' selesai':''}</span>`
      :`<span style="font-size:11px;color:var(--t2)">${doneRows.length} selesai</span>`;

    // Slot groups for active rows
    const bySlot={};
    activeRows.forEach(d=>{const sk=d.slotId||'__noSlot__';if(!bySlot[sk])bySlot[sk]=[];bySlot[sk].push(d);});
    const slotHtml=Object.entries(bySlot).map(([sk,sRows])=>{
      const slotName=sk==='__noSlot__'?'Tanpa Slot':(pickupSlots.find(s=>s.id===sk)?.name||sk);
      return `<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">${esc(slotName)}</div>${sRows.map(d=>_dqRow(d)).join('')}</div>`;
    }).join('');

    // Collapsed Selesai section (Opsi C)
    const doneSection=doneRows.length&&showDoneSection
      ?`<details style="margin-top:4px"><summary style="cursor:pointer;font-size:11px;color:var(--t2);padding:5px 0;list-style:none;display:flex;align-items:center;gap:5px;user-select:none">&#9654; ${doneRows.length} selesai</summary><div style="margin-top:6px">${doneRows.map(d=>_dqRow(d)).join('')}</div></details>`
      :'';

    const body=isOpen
      ?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--b1)">${slotHtml}${doneSection}<div style="margin-top:8px;display:flex;justify-content:flex-end"><button class="btn bsm bp bpill" onclick="buildRoute('${esc(dk)}')"><i data-lucide="map" style="width:12px;height:12px;stroke-width:2.5;display:inline;vertical-align:-1px;margin-right:4px"></i>Buat Rute</button></div></div>`
      :'';

    return `<div class="card" style="margin-bottom:8px;padding:10px 12px">
      <div onclick="toggleDqDate('${esc(dk)}')" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--t2);width:12px;display:inline-block">${chevron}</span>
          <span style="font-size:13px;font-weight:700;color:var(--t1)">${esc(label)}</span>
        </div>
        ${countBadge}
      </div>
      ${body}
    </div>`;
  }).join('');

  lucide.createIcons({nodes:[list]});
}


function _dqRow(d){
  const isPickup=d.type==='pickup';
  const typeIcon=isPickup?_SVG_CAR:_SVG_PKG;
  const typeText=isPickup?'Jemput':'Antar';
  const typeBg=isPickup?'#e3f2fd':'#f3e5f5';
  const typeCol=isPickup?'#1565c0':'#6a1b9a';
  const statusColor={Menunggu:'var(--am)',Dijemput:'var(--p)',Diantar:'var(--p)',Selesai:'var(--g)'};
  const col=statusColor[d.status]||'var(--t2)';
  const distBadge=d.distanceKm!=null?radiusBadge(d.distanceKm):'';
  const done=d.status==='Selesai';
  const progressLabel=isPickup?'Dijemput':'Diantar';
  const progressStatus=isPickup?'Dijemput':'Diantar';
  const btnProgress=done?'':`<button class="btn bsm bp bpill" onclick="updateDqStatus('${esc(d.id)}','${progressStatus}')" style="font-size:11px;padding:4px 8px">${progressLabel}</button>`;
  const btnSelesai=done?'':`<button class="btn bsm bpill" onclick="updateDqStatus('${esc(d.id)}','Selesai')" style="font-size:11px;padding:4px 8px;color:#2e7d32;border-color:#a5d6a7">Selesai</button>`;
  const btnEdit=`<button class="btn bsm bg bpill" onclick="openPickupModal('${esc(d.id)}')" style="font-size:11px;padding:4px 8px">Edit</button>`;
  const btnHapus=`<button class="btn bsm bre bpill" onclick="deleteDqEntry('${esc(d.id)}')" style="font-size:11px;padding:4px 8px">Hapus</button>`;
  const grid=done
    ?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">${btnEdit}${btnHapus}</div>`
    :`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">${btnProgress}${btnSelesai}${btnEdit}${btnHapus}</div>`;
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1.5px solid var(--b1);border-radius:var(--rs);margin-bottom:6px;gap:10px;background:var(--bg);min-height:72px">
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;flex-wrap:wrap">
        <span style="font-size:11px;font-weight:700;background:${typeBg};color:${typeCol};padding:1px 7px;border-radius:20px;display:inline-flex;align-items:center;gap:3px;flex-shrink:0">${typeIcon}${typeText}</span>
        <span style="font-size:13px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${esc(d.name)}</span>
        <span style="font-size:11px;font-weight:600;color:${col};flex-shrink:0">${esc(d.status)}</span>
        ${d.hasCharge?`<span style="font-size:11px;color:var(--re,#c62828);flex-shrink:0">+${fmt(pickupExtraCharge)}</span>`:''}
      </div>
      <div style="font-size:11px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px">${esc(d.address||'Alamat belum diisi')}</div>
      <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">${distBadge}${d.orderId?`<span style="font-size:10px;color:var(--t2)">${esc(d.orderId)}</span>`:''}</div>
    </div>
    <div style="flex-shrink:0;width:138px">${grid}</div>
  </div>`;
}

function updateDqStatus(id, newStatus){
  const dq=deliveryQueue.find(d=>d.id===id);if(!dq)return;
  dq.status=newStatus;
  syncDeliveryQueue(dq);
  // Auto mark order as Diambil when delivery is complete
  if(newStatus==='Selesai'&&dq.type==='delivery'&&dq.orderId){
    const o=orders.find(x=>x.id===dq.orderId);
    if(o&&o.status!=='Diambil'){o.status='Diambil';o.pickedUpAt=new Date().toISOString();syncOrder(o);renderOrders();}
  }
  renderDeliveryPage();
  toast('✓ Status diperbarui: '+newStatus);
}

function deleteDqEntry(id){
  confirm_('Hapus Request?','Request ini akan dihapus permanen.',()=>{
    deliveryQueue=deliveryQueue.filter(d=>d.id!==id);
    deleteDeliveryQueue(id);
    renderDeliveryPage();
    toast('Request dihapus');
  });
}

// ===== PANEL RUTE =====
let _routeItems = [];

function buildRoute(dateKey){
  const items=deliveryQueue.filter(d=>d.date===dateKey&&d.status!=='Selesai'&&d.lat&&d.lng);
  if(!items.length){toast('Tidak ada lokasi valid untuk rute ini');return;}
  // Nearest-neighbor from outlet
  const outlet=outlets.find(o=>o.lat&&o.lng)||null;
  const origin=outlet?{lat:outlet.lat,lng:outlet.lng}:null;
  _routeItems=_nearestNeighbor(items,origin);
  g(_dqId('dq-route-panel')).style.display='';
  const rl=g(_dqId('dq-route-list'));
  if(!rl)return;
  const rows=_routeItems.map((d,i)=>{
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--b1)">
      <div style="width:26px;height:26px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${i+1}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${esc(d.name)}</div><div style="font-size:12px;color:var(--t2)">${esc(d.address||`${d.lat},${d.lng}`)}</div><div style="font-size:11px;color:var(--t2);margin-top:2px;display:flex;align-items:center;gap:3px">${d.type==='pickup'?_SVG_CAR:_SVG_PKG}${d.type==='pickup'?'Jemput':'Antar'}${d.area?' · '+esc(d.area):''}</div></div>
    </div>`;
  }).join('');
  rl.innerHTML=rows||(outlet?`<div style="padding:8px 0 0;font-size:12px;color:var(--t2)">Dimulai dari ${esc(outlet.name)}</div>`:'')+rows;
  // Populate kurir dropdown — filter by outlets involved in this route
  const routeOutletIds=new Set(_routeItems.map(d=>d.outletId).filter(Boolean));
  const kurirList=employees.filter(e=>e.isKurir&&e.phone&&(
    !e.kurirOutlets?.length || e.kurirOutlets.some(oid=>routeOutletIds.has(oid))
  ));
  const sel=g(_dqId('dq-kurir-sel'));
  const manualWrap=g(_dqId('dq-kurir-phone-wrap'));
  if(sel){
    if(kurirList.length){
      sel.style.display='';
      sel.innerHTML=kurirList.map(e=>`<option value="${esc(e.phone)}">${esc(e.name)} — ${esc(e.phone)}</option>`).join('');
      if(manualWrap)manualWrap.style.display='none';
    } else {
      sel.style.display='none';
      if(manualWrap)manualWrap.style.display='';
      if(g(_dqId('dq-courier-phone')))g(_dqId('dq-courier-phone')).value=courierPhone;
    }
  }
  lucide.createIcons({nodes:[g(_dqId('dq-route-panel'))]});
}

function _nearestNeighbor(items, origin){
  if(!items.length)return[];
  let remaining=[...items];
  const result=[];
  let cur=origin;
  while(remaining.length){
    let nearest=null,minD=Infinity,minI=-1;
    remaining.forEach((d,i)=>{
      if(!cur){nearest=d;minI=i;minD=0;return;}
      const dist=haversineKm(cur.lat,cur.lng,d.lat,d.lng);
      if(dist<minD){minD=dist;nearest=d;minI=i;}
    });
    result.push(nearest);remaining.splice(minI,1);cur=nearest;
  }
  return result;
}

function openRouteMap(){
  if(!_routeItems.length){toast('Buat rute dulu');return;}
  const outlet=outlets.find(o=>o.lat&&o.lng);
  // Build Google Maps Directions URL with waypoints API format
  // Origin & destination = outlet (round trip). Waypoints = stops in order.
  const stops=_routeItems.filter(d=>d.lat&&d.lng);
  if(!stops.length){toast('Tidak ada koordinat pada titik rute ini');return;}
  let url='https://www.google.com/maps/dir/?api=1';
  if(outlet){
    url+=`&origin=${outlet.lat},${outlet.lng}`;
    url+=`&destination=${outlet.lat},${outlet.lng}`;
    if(stops.length)url+=`&waypoints=${stops.map(d=>`${d.lat},${d.lng}`).join('|')}`;
  } else {
    // No outlet — first stop is origin, last is destination
    url+=`&origin=${stops[0].lat},${stops[0].lng}`;
    url+=`&destination=${stops[stops.length-1].lat},${stops[stops.length-1].lng}`;
    if(stops.length>2)url+=`&waypoints=${stops.slice(1,-1).map(d=>`${d.lat},${d.lng}`).join('|')}`;
  }
  url+='&travelmode=driving';
  window.open(url,'_blank','noopener,noreferrer');
}

function saveCourierPhone(val){
  courierPhone=val.trim();
  localStorage.setItem('cleanpos_courier_phone', courierPhone);
}

function sendRouteToCourier(){
  if(!_routeItems.length){toast('Buat rute dulu');return;}
  // Get phone from kurir dropdown (if visible) or manual input
  const sel=g(_dqId('dq-kurir-sel'));
  const phone=(sel&&sel.style.display!=='none'?sel.value:g(_dqId('dq-courier-phone'))?.value||'').trim();
  if(!phone){toast('Pilih atau isi nomor WA kurir');return;}
  // Get kurir name for greeting
  const kurirEmp=employees.find(e=>e.phone===phone&&e.isKurir);
  const kurirName=kurirEmp?kurirEmp.name:'Kurir';
  const outlet=outlets.find(o=>o.lat&&o.lng);
  let msg=`Halo ${kurirName}, berikut rute antar jemput hari ini:\n\n`;
  _routeItems.forEach((d,i)=>{
    msg+=`${i+1}. *${d.name}* — ${d.type==='pickup'?'JEMPUT':'ANTAR'}\n   ${d.address||`${d.lat},${d.lng}`}\n`;
    if(d.lat&&d.lng)msg+=`   https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}\n`;
    msg+='\n';
  });
  if(outlet)msg+=`Kembali ke outlet: *${outlet.name}*\n${outlet.addr?outlet.addr:''}`;
  openWa(phone,msg);
}

function _togglePwVis(id,btn){
  const inp=g(id);if(!inp)return;
  inp.type=inp.type==='text'?'password':'text';
  const ic=btn.querySelector('i');
  if(ic){ic.setAttribute('data-lucide',inp.type==='text'?'eye-off':'eye');lucide.createIcons({nodes:[btn]});}
}
function _setCardColor(hex,el){
  const f=memberCardFields.find(x=>x.id===_cardActiveField);if(!f)return;
  f.color=hex;if(g('card-color'))g('card-color').value=hex;
  document.querySelectorAll('.set-color-sw').forEach(s=>s.classList.remove('on'));
  if(el)el.classList.add('on');
  updateCardFieldStyle();
}
function _moveCardField(dx,dy){
  const f=memberCardFields.find(x=>x.id===_cardActiveField);if(!f)return;
  f.x=Math.max(0,Math.min(100,f.x+dx));f.y=Math.max(0,Math.min(100,f.y+dy));
  drawMemberCardPreview();
}
function _resetCardFieldPos(){
  const DEFS={name:{x:50,y:70},phone:{x:50,y:81},balance:{x:50,y:91}};
  const f=memberCardFields.find(x=>x.id===_cardActiveField);
  if(!f||!DEFS[f.id])return;
  f.x=DEFS[f.id].x;f.y=DEFS[f.id].y;drawMemberCardPreview();
}
function initMemberCard() {
  try { const b=localStorage.getItem(_CARD_BG_KEY); if(b){memberCardBg=b;_cardBgImg=new Image();_cardBgImg.onload=()=>drawMemberCardPreview();_cardBgImg.src=b;} } catch(e){}
  try { const f=localStorage.getItem(_CARD_FIELDS_KEY); if(f) memberCardFields=JSON.parse(f); } catch(e){}
  // Migrate: add visible:true if missing
  memberCardFields.forEach(f=>{if(f.visible===undefined)f.visible=true;});
  // Preload all card fonts so canvas renders them correctly
  CARD_FONTS.forEach(fam=>{
    document.fonts.load('400 48px "'+fam+'"');
    document.fonts.load('700 48px "'+fam+'"');
  });
}

function drawMemberCardPreview() {
  const canvas=g('card-preview-canvas'); if(!canvas) return;
  const wrap=g('card-canvas-wrap');
  const maxW=wrap?Math.max(300,(wrap.clientWidth||700)-4):700;
  const scale=maxW/1350;
  const W=Math.round(1350*scale),H=Math.round(1080*scale);
  canvas.width=W; canvas.height=H; canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const _previewCust={name:'Nama Pelanggan',phone:'08xxxxxxxxxx',balance:75000};
  _drawCardOnCanvas(canvas,_previewCust,scale,true);
  if(g('card-canvas-hint')) g('card-canvas-hint').style.display=memberCardBg?'none':'';
  if(g('card-clear-btn')) g('card-clear-btn').style.display=memberCardBg?'':'none';
  _attachCardCanvasListeners();
  // Re-draw once fonts are confirmed loaded (ensures Google Fonts render in canvas)
  const usedFonts=[...new Set(memberCardFields.map(f=>f.fontFamily||'Poppins'))];
  Promise.all(usedFonts.flatMap(fam=>[
    document.fonts.load('400 48px "'+fam+'"'),
    document.fonts.load('700 48px "'+fam+'"')
  ])).then(()=>{ if(g('card-preview-canvas')===canvas) _drawCardOnCanvas(canvas,_previewCust,scale,true); });
}

function _drawCardOnCanvas(canvas,cust,scale,showHandles) {
  const ctx=canvas.getContext('2d'); const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  if(_cardBgImg&&_cardBgImg.complete&&_cardBgImg.naturalWidth>0) {
    const iW=_cardBgImg.naturalWidth,iH=_cardBgImg.naturalHeight,r=Math.max(W/iW,H/iH);
    ctx.drawImage(_cardBgImg,(W-iW*r)/2,(H-iH*r)/2,iW*r,iH*r);
  } else {
    const gr=ctx.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#1a237e'); gr.addColorStop(1,'#4a148c');
    ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
  }
  const vals={name:cust.name||'—',phone:cust.phone||'—',balance:fmt(cust.balance||0)};
  memberCardFields.forEach(f=>{
    if(f.visible===false)return;
    const text=vals[f.id]||''; const x=f.x/100*W,y=f.y/100*H;
    const fs=Math.max(8,Math.round(f.fontSize*scale));
    const ff='"'+(f.fontFamily||'Poppins')+'",sans-serif';
    ctx.save();
    ctx.font=(f.bold?'bold ':'')+fs+'px '+ff;
    ctx.textAlign=f.align; ctx.textBaseline='middle';
    if(f.shadow){ctx.shadowColor='rgba(0,0,0,0.75)';ctx.shadowBlur=Math.max(3,fs*.25);ctx.shadowOffsetX=ctx.shadowOffsetY=Math.max(1,Math.round(fs*.04));}
    ctx.fillStyle=f.color; ctx.fillText(text,x,y); ctx.restore();
    if(showHandles){
      const isActive=f.id===_cardActiveField;
      ctx.save();
      ctx.font=(f.bold?'bold ':'')+fs+'px '+ff; ctx.textAlign=f.align; ctx.textBaseline='middle';
      const mW=ctx.measureText(text).width+Math.round(16*scale),mH=fs+Math.round(10*scale);
      let bx=x; if(f.align==='center') bx-=mW/2; else if(f.align==='right') bx-=mW;
      ctx.strokeStyle=isActive?'#4caf50':'rgba(255,255,255,0.5)';
      ctx.lineWidth=isActive?Math.max(1.5,1.5*scale):Math.max(1,scale);
      ctx.setLineDash([Math.round(4*scale),Math.round(3*scale)]);
      ctx.strokeRect(bx,y-mH/2,mW,mH);
      ctx.setLineDash([]);
      // Label tag
      const tfs=Math.max(8,Math.round(10*scale));
      ctx.font='bold '+tfs+'px Arial'; ctx.textAlign='left'; ctx.textBaseline='bottom';
      ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
      ctx.fillStyle=isActive?'#4caf50':'rgba(255,255,255,0.75)';
      ctx.fillText(f.label,bx,y-mH/2-2);
      // Resize handle: filled square at bottom-right corner
      const HS=Math.max(5,Math.round(8*scale));
      ctx.fillStyle=isActive?'#4caf50':'rgba(255,255,255,0.75)';
      ctx.fillRect(bx+mW-HS,y+mH/2-HS,HS*2,HS*2);
      if(isActive){
        ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(1,scale*0.8);
        ctx.strokeRect(bx+mW-HS,y+mH/2-HS,HS*2,HS*2);
      }
      ctx.restore();
    }
  });
}

function loadMemberCardBg(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{memberCardBg=e.target.result;_cardBgImg=new Image();_cardBgImg.onload=drawMemberCardPreview;_cardBgImg.src=memberCardBg;};
  reader.readAsDataURL(file); input.value='';
}
function clearMemberCardBg(){memberCardBg=null;_cardBgImg=null;drawMemberCardPreview();}

function selectCardField(id) {
  _cardActiveField=id;
  const f=memberCardFields.find(x=>x.id===id); if(!f) return;
  memberCardFields.forEach(x=>{const b=g('card-field-btn-'+x.id);if(b)b.classList.toggle('bp',x.id===id);});
  if(g('card-font')) g('card-font').value=f.fontFamily||'Poppins';
  if(g('card-fs')) g('card-fs').value=f.fontSize;
  if(g('card-color')) g('card-color').value=f.color;
  if(g('card-bold')) g('card-bold').checked=f.bold;
  if(g('card-shadow')) g('card-shadow').checked=f.shadow;
  if(g('card-field-label')) g('card-field-label').textContent=f.label.toUpperCase();
  ['left','center','right'].forEach(a=>{const b=g('card-align-'+a);if(b)b.classList.toggle('bp',f.align===a);});
  const _lmap={name:'Nama Pelanggan',phone:'Nomor WhatsApp',balance:'Saldo Member'};
  if(g('card-active-label-text'))g('card-active-label-text').textContent=_lmap[f.id]||f.label;
  drawMemberCardPreview();
}

function updateCardFieldStyle() {
  const f=memberCardFields.find(x=>x.id===_cardActiveField); if(!f) return;
  if(g('card-font')?.value) f.fontFamily=g('card-font').value;
  const fsV=parseInt(g('card-fs')?.value); if(!isNaN(fsV)&&fsV>0) f.fontSize=fsV;
  f.color=g('card-color')?.value||f.color;
  f.bold=!!g('card-bold')?.checked;
  f.shadow=!!g('card-shadow')?.checked;
  drawMemberCardPreview();
}

function setCardAlign(align) {
  const f=memberCardFields.find(x=>x.id===_cardActiveField); if(!f) return;
  f.align=align;
  ['left','center','right'].forEach(a=>{const b=g('card-align-'+a);if(b)b.classList.toggle('bp',a===align);});
  drawMemberCardPreview();
}

// ===== CARD CANVAS DRAG / RESIZE =====
function _getCardEventPos(e, canvas) {
  const rect=canvas.getBoundingClientRect();
  const sx=canvas.width/rect.width, sy=canvas.height/rect.height;
  const src=e.touches?e.touches[0]:e;
  return { x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy };
}

function _getFieldBBoxPx(f, canvas) {
  const W=canvas.width,H=canvas.height,scale=W/1350;
  const fs=Math.max(8,Math.round(f.fontSize*scale));
  const ff='"'+(f.fontFamily||'Poppins')+'",sans-serif';
  const ctx=canvas.getContext('2d');
  ctx.font=(f.bold?'bold ':'')+fs+'px '+ff;
  const vals={name:'Nama Pelanggan',phone:'08xxxxxxxxxx',balance:fmt(75000)};
  const text=vals[f.id]||f.label;
  const mW=ctx.measureText(text).width+Math.round(16*scale);
  const mH=fs+Math.round(10*scale);
  const x=f.x/100*W, y=f.y/100*H;
  let bx=x;
  if(f.align==='center') bx-=mW/2; else if(f.align==='right') bx-=mW;
  return { x:bx, y:y-mH/2, w:mW, h:mH, scale };
}

function _cardHitTest(px, py, canvas) {
  const scale=canvas.width/1350;
  const HS=Math.max(5,Math.round(8*scale))*2; // hit area for resize handle
  for(let i=memberCardFields.length-1;i>=0;i--){
    const f=memberCardFields[i];
    const bb=_getFieldBBoxPx(f,canvas);
    // Resize handle at bottom-right corner
    if(px>=bb.x+bb.w-HS&&px<=bb.x+bb.w+HS&&py>=bb.y+bb.h-HS&&py<=bb.y+bb.h+HS){
      return { mode:'resize', fieldId:f.id };
    }
    // Drag: anywhere inside bounding box
    if(px>=bb.x&&px<=bb.x+bb.w&&py>=bb.y&&py<=bb.y+bb.h){
      return { mode:'drag', fieldId:f.id };
    }
  }
  return null;
}

function _startCardInteract(e) {
  const canvas=g('card-preview-canvas'); if(!canvas) return;
  e.preventDefault();
  const pos=_getCardEventPos(e,canvas);
  const hit=_cardHitTest(pos.x,pos.y,canvas);
  if(hit){
    if(hit.fieldId!==_cardActiveField) selectCardField(hit.fieldId);
    const f=memberCardFields.find(x=>x.id===hit.fieldId);
    _cardInteract={ mode:hit.mode, fieldId:hit.fieldId, startX:pos.x, startY:pos.y, origX:f.x, origY:f.y, origFontSize:f.fontSize };
  }
}

function _moveCardInteract(e) {
  const canvas=g('card-preview-canvas'); if(!canvas) return;
  e.preventDefault();
  const pos=_getCardEventPos(e,canvas);
  const _prev={name:'Nama Pelanggan',phone:'08xxxxxxxxxx',balance:75000};
  const sc=canvas.width/1350;
  if(_cardInteract){
    const f=memberCardFields.find(x=>x.id===_cardInteract.fieldId); if(!f) return;
    const dx=pos.x-_cardInteract.startX, dy=pos.y-_cardInteract.startY;
    if(_cardInteract.mode==='drag'){
      f.x=Math.max(0,Math.min(100,_cardInteract.origX+dx/canvas.width*100));
      f.y=Math.max(0,Math.min(100,_cardInteract.origY+dy/canvas.height*100));
    } else {
      // Resize: horizontal drag scales fontSize
      const newFs=Math.max(8,Math.round(_cardInteract.origFontSize+dx/sc));
      f.fontSize=newFs;
      if(g('card-fs')) g('card-fs').value=newFs;
    }
    _drawCardOnCanvas(canvas,_prev,sc,true);
  } else {
    // Hover cursor
    const hit=_cardHitTest(pos.x,pos.y,canvas);
    canvas.style.cursor=hit?(hit.mode==='resize'?'nwse-resize':'grab'):'crosshair';
  }
}

function _endCardInteract(e) {
  if(_cardInteract){
    _cardInteract=null;
    const f=memberCardFields.find(x=>x.id===_cardActiveField);
    if(f&&g('card-fs')) g('card-fs').value=f.fontSize;
    drawMemberCardPreview();
  }
}

function _attachCardCanvasListeners() {
  const canvas=g('card-preview-canvas'); if(!canvas||canvas._cardListeners) return;
  canvas._cardListeners=true;
  canvas.addEventListener('mousedown',_startCardInteract);
  canvas.addEventListener('mousemove',_moveCardInteract);
  canvas.addEventListener('mouseup',_endCardInteract);
  canvas.addEventListener('mouseleave',_endCardInteract);
  canvas.addEventListener('touchstart',_startCardInteract,{passive:false});
  canvas.addEventListener('touchmove',_moveCardInteract,{passive:false});
  canvas.addEventListener('touchend',_endCardInteract);
}

function saveMemberCardTemplate() {
  try {
    if(memberCardBg) localStorage.setItem(_CARD_BG_KEY,memberCardBg); else localStorage.removeItem(_CARD_BG_KEY);
    localStorage.setItem(_CARD_FIELDS_KEY,JSON.stringify(memberCardFields));
    toast('✅ Template kartu disimpan!');
  } catch(e){ toast('⚠️ Gagal menyimpan. Kompres gambar terlebih dahulu (ukuran besar = localStorage penuh).'); }
}

// ===== MEMBER CARD DESIGN PAGE =====
function renderMemberCardDesign(){
  _renderCardFieldsList();
  _updateCardStylingPanel();
  drawMemberCardPreview();
}
function _renderCardFieldsList(){
  const el=g('card-fields-list');if(!el)return;
  const lmap={name:'Nama Pelanggan',phone:'Nomor WhatsApp',balance:'Saldo Member'};
  el.innerHTML=memberCardFields.map(f=>`
    <div class="mcd-field-item" draggable="true" data-field-id="${f.id}"
      ondragstart="_cardFieldDragStart(event,'${f.id}')"
      ondragover="_cardFieldDragOver(event)"
      ondrop="_cardFieldDrop(event,'${f.id}')">
      <div class="mcd-drag-handle"><i data-lucide="grip-vertical" style="width:16px;height:16px;stroke-width:2;display:block"></i></div>
      <label style="display:flex;align-items:center;gap:8px;flex:1;cursor:pointer">
        <input type="checkbox" ${f.visible!==false?'checked':''} onchange="toggleCardFieldVisible('${f.id}',this.checked)" style="accent-color:var(--p);width:15px;height:15px;cursor:pointer">
        <span style="font-size:13px;font-weight:600;color:var(--t1)">${lmap[f.id]||f.label}</span>
      </label>
    </div>`).join('');
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function toggleCardFieldVisible(id,checked){
  const f=memberCardFields.find(x=>x.id===id);if(f){f.visible=checked;drawMemberCardPreview();}
}
function _cardFieldDragStart(e,id){_cardFieldDragSrcId=id;e.dataTransfer.effectAllowed='move';}
function _cardFieldDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}
function _cardFieldDrop(e,targetId){
  e.preventDefault();
  if(!_cardFieldDragSrcId||_cardFieldDragSrcId===targetId)return;
  const si=memberCardFields.findIndex(f=>f.id===_cardFieldDragSrcId);
  const ti=memberCardFields.findIndex(f=>f.id===targetId);
  if(si<0||ti<0)return;
  const [moved]=memberCardFields.splice(si,1);
  memberCardFields.splice(ti,0,moved);
  _cardFieldDragSrcId=null;
  _renderCardFieldsList();
  drawMemberCardPreview();
}
function _updateCardStylingPanel(){
  const f=memberCardFields.find(x=>x.id===_cardActiveField);if(!f)return;
  const lmap={name:'Nama Pelanggan',phone:'Nomor WhatsApp',balance:'Saldo Member'};
  if(g('card-active-label-text'))g('card-active-label-text').textContent=lmap[f.id]||f.label;
  if(g('card-font'))g('card-font').value=f.fontFamily||'Poppins';
  if(g('card-fs'))g('card-fs').value=f.fontSize;
  if(g('card-color'))g('card-color').value=f.color;
  if(g('card-bold'))g('card-bold').checked=f.bold;
  if(g('card-shadow'))g('card-shadow').checked=f.shadow;
  document.querySelectorAll('#card-styling-panel .set-color-sw').forEach(s=>{
    const bg=s.style.backgroundColor||s.style.background;
    try{const tc=document.createElement('canvas');tc.width=1;tc.height=1;const c=tc.getContext('2d');c.fillStyle=f.color;c.fillRect(0,0,1,1);const td=c.getImageData(0,0,1,1).data;c.fillStyle=bg;c.fillRect(0,0,1,1);const sd=c.getImageData(0,0,1,1).data;s.classList.toggle('on',Math.abs(td[0]-sd[0])<5&&Math.abs(td[1]-sd[1])<5&&Math.abs(td[2]-sd[2])<5);}catch(ex){s.classList.remove('on');}
  });
}
function _resetCardFieldStyle(){
  const SDEFS={name:{fontSize:48,color:'#ffffff',bold:true,shadow:true,fontFamily:'Poppins',align:'center'},phone:{fontSize:30,color:'#eeeeee',bold:false,shadow:true,fontFamily:'Poppins',align:'center'},balance:{fontSize:40,color:'#ffd700',bold:true,shadow:true,fontFamily:'Poppins',align:'center'}};
  const f=memberCardFields.find(x=>x.id===_cardActiveField);
  if(!f||!SDEFS[f.id])return;
  Object.assign(f,SDEFS[f.id]);
  _updateCardStylingPanel();
  drawMemberCardPreview();
}
function _resetAllCardFieldPos(){
  const PDEFS={name:{x:50,y:70},phone:{x:50,y:81},balance:{x:50,y:91}};
  memberCardFields.forEach(f=>{if(PDEFS[f.id]){f.x=PDEFS[f.id].x;f.y=PDEFS[f.id].y;}});
  drawMemberCardPreview();
  toast('Posisi direset');
}
function downloadCardTemplate(){
  const c=document.createElement('canvas');c.width=1350;c.height=1080;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1350,1080);
  ctx.strokeStyle='#e8e8e8';ctx.lineWidth=1;
  for(let x=0;x<=1350;x+=135){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1080);ctx.stroke();}
  for(let y=0;y<=1080;y+=108){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1350,y);ctx.stroke();}
  ctx.fillStyle='#c0c0c0';ctx.font='22px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Template Kartu Member — 1350 × 1080 px',675,540);
  const lnk=document.createElement('a');lnk.download='template-kartu-member.png';
  lnk.href=c.toDataURL('image/png');lnk.click();
  toast('Template diunduh');
}
function _previewCardWA(){
  const phone=Object.keys(customers)[0];
  if(phone)openSendMemberCard(phone);
  else toast('Belum ada data pelanggan untuk preview.');
}

function downloadCardGuide() {
  const c=document.createElement('canvas'); c.width=1350; c.height=1080;
  const ctx=c.getContext('2d');
  const gr=ctx.createLinearGradient(0,0,1350,1080); gr.addColorStop(0,'#e8eaf6'); gr.addColorStop(1,'#fce4ec');
  ctx.fillStyle=gr; ctx.fillRect(0,0,1350,1080);
  ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=1;
  for(let x=0;x<=1350;x+=135){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1080);ctx.stroke();}
  for(let y=0;y<=1080;y+=108){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1350,y);ctx.stroke();}
  ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.setLineDash([10,6]);
  ctx.beginPath();ctx.moveTo(675,0);ctx.lineTo(675,1080);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,540);ctx.lineTo(1350,540);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#283593'; ctx.font='bold 52px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('PANDUAN TEMPLATE KARTU MEMBER',675,86);
  ctx.fillStyle='#555'; ctx.font='26px Arial';
  ctx.fillText('Ukuran: 1350 × 1080 px  ·  Buat background Anda, lalu upload ke aplikasi',675,140);
  const pad=70; ctx.strokeStyle='#e91e63'; ctx.lineWidth=3; ctx.setLineDash([14,7]);
  ctx.strokeRect(pad,pad,1350-pad*2,1080-pad*2); ctx.setLineDash([]);
  ctx.fillStyle='#e91e63'; ctx.font='bold 18px Arial'; ctx.textAlign='left';
  ctx.fillText('◄ Safe zone — jangan taruh elemen penting di luar garis merah ini',pad+6,pad-18);
  const zones=[
    {y:756,h:74,c:'#1976d2',txt:'[ NAMA PELANGGAN ]',hint:'default: 50%, 70%'},
    {y:874,h:58,c:'#388e3c',txt:'[ NOMOR WHATSAPP ]',hint:'default: 50%, 81%'},
    {y:978,h:68,c:'#e65100',txt:'[ SALDO MEMBER ]',  hint:'default: 50%, 91%'},
  ];
  zones.forEach(z=>{
    ctx.fillStyle=z.c+'1a'; ctx.strokeStyle=z.c; ctx.lineWidth=2.5; ctx.setLineDash([12,6]);
    ctx.fillRect(180,z.y-z.h/2,990,z.h); ctx.strokeRect(180,z.y-z.h/2,990,z.h); ctx.setLineDash([]);
    ctx.fillStyle=z.c; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(z.txt,675,z.y);
    ctx.fillStyle='#aaa'; ctx.font='16px Arial'; ctx.textAlign='right';
    ctx.fillText(z.hint,1172,z.y);
  });
  ctx.fillStyle='#aaa'; ctx.font='20px Arial'; ctx.textAlign='center';
  ctx.fillText('Posisi & style teks bisa diubah di Pengaturan → Kartu Member Digital',675,1042);
  const lnk=document.createElement('a'); lnk.download='panduan-kartu-member.jpg';
  lnk.href=c.toDataURL('image/jpeg',0.92); lnk.click(); toast('✅ Panduan template diunduh!');
}

function _buildCardWaMsg(cu) {
  return 'Halo *'+cu.name+'*! 🎉\n\nSaldo member kamu saat ini: *'+fmt(cu.balance||0)+'*\n\nTerima kasih telah menjadi pelanggan setia kami! 🙏\n— '+(storeName||'CleanPOS Laundry');
}

function openSendMemberCard(phone) {
  const c=customers[phone]; if(!c) return;
  _cardSendCust=c;
  // Customer info panel
  if(g('sc-cust-info')) g('sc-cust-info').innerHTML=`<div style="font-weight:700;font-size:14px;color:var(--t1)">${esc(c.name)}</div><div style="font-size:12px;color:var(--t2);margin-top:1px">${esc(c.phone||'—')}</div><div style="margin-top:8px;font-size:13px">Saldo: <span style="font-weight:700;color:var(--p)">${fmt(c.balance||0)}</span></div>`;
  // Pre-fill WA message textarea
  if(g('card-wa-msg')){g('card-wa-msg').value=_buildCardWaMsg(c);_scUpdateCharCount();}
  // Show/hide card preview section
  const hasCard=!!memberCardBg;
  if(g('card-send-preview-wrap')) g('card-send-preview-wrap').style.display=hasCard?'':'none';
  if(g('card-send-no-tmpl')) g('card-send-no-tmpl').style.display=hasCard?'none':'';
  if(g('card-send-with-img-btn')) g('card-send-with-img-btn').style.display=hasCard?'':'none';
  if(g('card-download-btn')) g('card-download-btn').style.display=hasCard?'':'none';
  if(hasCard){
    const canvas=g('card-send-canvas');
    if(canvas){
      const maxW=Math.min((window.innerWidth||400)-80,480);
      const scale=maxW/1350;
      canvas.width=Math.round(1350*scale); canvas.height=Math.round(1080*scale);
      canvas.style.width=canvas.width+'px'; canvas.style.height=canvas.height+'px';
      if(_cardBgImg&&_cardBgImg.complete&&_cardBgImg.naturalWidth>0){
        _drawCardOnCanvas(canvas,c,scale,false);
      } else {
        _cardBgImg=new Image(); _cardBgImg.onload=()=>_drawCardOnCanvas(canvas,c,scale,false); _cardBgImg.src=memberCardBg;
      }
    }
    const hasShare=typeof navigator.share!=='undefined';
    if(g('card-send-hint')) g('card-send-hint').textContent=hasShare
      ?'Di HP: tap tombol hijau → pilih WhatsApp dari menu share yang muncul'
      :'Gambar akan didownload otomatis, lalu lampirkan manual di WhatsApp';
  } else {
    if(g('card-send-hint')) g('card-send-hint').textContent='';
  }
  openModal('m-send-card');
}

function sendTextOnlyWA() {
  if(!_cardSendCust) return;
  const msg=g('card-wa-msg')?.value||_buildCardWaMsg(_cardSendCust);
  openWa(_cardSendCust.phone, msg);
}

function downloadMemberCard() {
  if(!_cardSendCust) return;
  const c=document.createElement('canvas'); c.width=1350; c.height=1080;
  _drawCardOnCanvas(c,_cardSendCust,1,false);
  const lnk=document.createElement('a');
  lnk.download='kartu-member-'+(_cardSendCust.name||'member').toLowerCase().replace(/\s+/g,'-')+'.jpg';
  lnk.href=c.toDataURL('image/jpeg',0.92); lnk.click(); toast('✅ Kartu diunduh!');
}

async function sendCardViaWA() {
  if(!_cardSendCust) return;
  const cu=_cardSendCust;
  const msg=g('card-wa-msg')?.value||_buildCardWaMsg(cu);
  const fc=document.createElement('canvas'); fc.width=1350; fc.height=1080;
  _drawCardOnCanvas(fc,cu,1,false);
  if(navigator.share&&navigator.canShare){
    try{
      const blob=await new Promise(res=>fc.toBlob(res,'image/jpeg',0.92));
      const file=new File([blob],'kartu-member.jpg',{type:'image/jpeg'});
      if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Kartu Member '+cu.name,text:msg});return;}
    }catch(e){if(e.name==='AbortError')return;}
  }
  const lnk=document.createElement('a'); lnk.download='kartu-member.jpg';
  lnk.href=fc.toDataURL('image/jpeg',0.92); lnk.click();
  setTimeout(()=>{
    openWa(cu.phone, msg);
    if(g('card-send-hint')) g('card-send-hint').textContent='📎 Gambar diunduh — di WhatsApp tap ikon lampiran dan pilih gambar yang baru diunduh.';
  },600);
}

function saveStoreInfo(){
  storeName=(g('s-store')?.value||'').trim()||'CleanPOS Laundry';
  // storeAddr intentionally not updated here (managed via Outlet settings)
  storeWa=(g('s-wa')?.value||'').trim();
  storeFooter=(g('s-footer')?.value||'').trim();
  syncSettings();
  toast('\u2713 Info toko tersimpan!');
}
function saveEmpSettings(){
  const v=parseInt(g('s-cuti')?.value)||2;
  if(v<1||v>31){toast('\u26A0\uFE0F Jatah cuti harus antara 1–31 hari');return;}
  cutiPerBulan=v;
  // update the employee page header label
  const lbl=g('emp-cuti-lbl');if(lbl)lbl.textContent=cutiPerBulan+'x';
  renderEmployees();
  syncSettings();
  toast('\u2713 Pengaturan karyawan tersimpan!');
}

function _syncKgStepLabels(){
  document.querySelectorAll('input[name="s-kgstep"]').forEach(r=>{
    const lbl=r.closest('label');if(!lbl)return;
    // chip style (new UI)
    lbl.classList.toggle('on',!!r.checked);
    // fallback inline style for any legacy usage
    lbl.style.borderColor=r.checked?'var(--p)':'var(--b1)';
    lbl.style.background=r.checked?'var(--p)':'';
    lbl.style.color=r.checked?'#fff':'';
  });
}

function _applyKgStep(){
  const inp=g('no-kg');if(inp){inp.step=String(kgStep);inp.min=String(kgStep);}
  const inp2=g('sno-qty');if(inp2){inp2.step=String(kgStep);inp2.min=String(kgStep);}
}

function saveOrderSettings(){
  const sel=document.querySelector('input[name="s-kgstep"]:checked');
  if(!sel){toast('\u26A0\uFE0F Pilih kenaikan berat');return;}
  kgStep=parseFloat(sel.value)||0.5;
  _applyKgStep();
  syncSettings();
  toast('\u2713 Pengaturan pesanan tersimpan!');
}

// ===== DASHBOARDS =====
// --- helpers ---
const _MN_S = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
const _MN_F = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const _DAYS_S = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

function _isoStr(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function _orderDateISO(o){ return (o.isoDate||'').slice(0,10); }
function _orderHour(o){ if(o.isoDate&&o.isoDate.length>10){ return new Date(o.isoDate).getHours(); } return 12; }
function _fmtK(n){ if(!n)return '0'; if(n>=1000000)return (n/1000000).toFixed(n%1000000===0?0:1)+' jt'; if(n>=1000)return Math.round(n/1000)+' rb'; return String(Math.round(n)); }
function _fmtPct(pct){
  if(pct===null||pct===undefined)return '';
  const up=pct>=0;
  return `<span class="${up?'dpct-up':'dpct-dn'}">${up?'↑':'↓'} ${Math.abs(pct).toFixed(2)}%</span>`;
}
function _pct(cur,prev){ return prev===0?null:((cur-prev)/prev*100); }

function setDashPeriod(p){ dashPeriod=p; dashOffset=0; try{localStorage.setItem('cleanpos_dash_period',p);}catch(e){} refreshODash(); }
function setDashOutlet(id){ dashOutlet=id; refreshODash(); }
function navDash(dir){ const n=dashOffset+dir; if(n>0)return; dashOffset=n; refreshODash(); }

function getDashRange(){
  const today=new Date(); today.setHours(0,0,0,0);

  if(dashPeriod==='harian'){
    const cur=new Date(today); cur.setDate(cur.getDate()+dashOffset);
    const prev=new Date(cur); prev.setDate(prev.getDate()-1);
    const curISO=_isoStr(cur), prevISO=_isoStr(prev);
    const fmtD=d=>d.getDate()+' '+_MN_S[d.getMonth()]+' '+String(d.getFullYear()).slice(2);
    const fmtFull=d=>d.getDate()+' '+_MN_F[d.getMonth()]+' '+d.getFullYear();
    return { period:'harian',
      curISO, curEndISO: curISO, prevISO, prevEndISO: prevISO,
      rangeLabel: fmtD(cur)+' - '+fmtD(cur), chartLabel: fmtFull(cur),
      buckets:24, bucketLabel:i=>(i<10?'0':'')+i+':00',
      bucketOf:o=>_orderDateISO(o)===curISO?_orderHour(o):-1,
      prevBucketOf:o=>_orderDateISO(o)===prevISO?_orderHour(o):-1
    };
  }

  if(dashPeriod==='mingguan'){
    const dow=(today.getDay()+6)%7; // 0=Mon
    const wkStart=new Date(today); wkStart.setDate(wkStart.getDate()-dow+dashOffset*7);
    const wkEnd=new Date(wkStart); wkEnd.setDate(wkEnd.getDate()+6);
    const pwkStart=new Date(wkStart); pwkStart.setDate(pwkStart.getDate()-7);
    const pwkEnd=new Date(wkEnd); pwkEnd.setDate(pwkEnd.getDate()-7);
    const wkISO=_isoStr(wkStart), wkEndISO=_isoStr(wkEnd);
    const pwkISO=_isoStr(pwkStart), pwkEndISO=_isoStr(pwkEnd);
    const fmtD=d=>d.getDate()+' '+_MN_S[d.getMonth()]+' '+String(d.getFullYear()).slice(2);
    return { period:'mingguan',
      curISO:wkISO, curEndISO:wkEndISO, prevISO:pwkISO, prevEndISO:pwkEndISO,
      rangeLabel:fmtD(wkStart)+' - '+fmtD(wkEnd), chartLabel:'Minggu '+fmtD(wkStart)+' – '+fmtD(wkEnd),
      buckets:7, bucketLabel:i=>_DAYS_S[i],
      bucketOf:o=>{const d=_orderDateISO(o);if(d<wkISO||d>wkEndISO)return -1;return Math.floor((new Date(d+'T12:00:00')-wkStart)/86400000);},
      prevBucketOf:o=>{const d=_orderDateISO(o);if(d<pwkISO||d>pwkEndISO)return -1;return Math.floor((new Date(d+'T12:00:00')-pwkStart)/86400000);}
    };
  }

  // Bulanan
  const mStart=new Date(today.getFullYear(),today.getMonth()+dashOffset,1);
  const mEnd=new Date(mStart.getFullYear(),mStart.getMonth()+1,0);
  const pmStart=new Date(mStart.getFullYear(),mStart.getMonth()-1,1);
  const pmEnd=new Date(mStart.getFullYear(),mStart.getMonth(),0);
  const mISO=_isoStr(mStart), mEndISO=_isoStr(mEnd);
  const pmISO=_isoStr(pmStart), pmEndISO=_isoStr(pmEnd);
  const days=mEnd.getDate();
  return { period:'bulanan',
    curISO:mISO, curEndISO:mEndISO, prevISO:pmISO, prevEndISO:pmEndISO,
    rangeLabel:_MN_F[mStart.getMonth()]+' '+mStart.getFullYear(), chartLabel:_MN_F[mStart.getMonth()]+' '+mStart.getFullYear(),
    buckets:days, bucketLabel:i=>String(i+1),
    bucketOf:o=>{const d=_orderDateISO(o);if(d<mISO||d>mEndISO)return -1;return parseInt(d.slice(8),10)-1;},
    prevBucketOf:o=>{const d=_orderDateISO(o);if(d<pmISO||d>pmEndISO)return -1;return parseInt(d.slice(8),10)-1;}
  };
}

function _ordersInRange(curISO, curEndISO){
  return orders.filter(o=>{
    const d=_orderDateISO(o);
    const inRange=d>=curISO&&d<=curEndISO;
    const inOutlet=dashOutlet==='all'||o.outletId===dashOutlet;
    return inRange&&inOutlet;
  });
}

function _calcDashStats(cur, prev, curISO, curEndISO, prevISO, prevEndISO){
  const sum=arr=>arr.reduce((s,o)=>s+o.total,0);
  const total=sum(cur), prevTotal=sum(prev);
  const belum=cur.filter(o=>o.payStatus!=='Lunas').reduce((s,o)=>s+o.total,0);
  const bayar=cur.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0);
  const trx=cur.length, prevTrx=prev.length;
  // Pesanan Diterima (status = Diterima)
  const diterima=cur.filter(o=>o.status==='Diterima').length;
  const prevDiterima=prev.filter(o=>o.status==='Diterima').length;
  // Pesanan Selesai (status = Selesai or Diambil)
  const selesai=cur.filter(o=>['Selesai','Diambil'].includes(o.status)).length;
  const prevSelesai=prev.filter(o=>['Selesai','Diambil'].includes(o.status)).length;
  // Pengeluaran
  const _expFilter=e=>dashOutlet==='all'||!e.outletId||e.outletId===dashOutlet;
  const pengeluaran=expenses.filter(e=>e.date>=curISO&&e.date<=curEndISO&&_expFilter(e)).reduce((s,e)=>s+e.nominal,0);
  const prevPengeluaran=expenses.filter(e=>e.date>=prevISO&&e.date<=prevEndISO&&_expFilter(e)).reduce((s,e)=>s+e.nominal,0);
  return { total, prevTotal, belum, bayar,
    trx, prevTrx, diterima, prevDiterima, selesai, prevSelesai,
    pengeluaran, prevPengeluaran,
    pctTotal:_pct(total,prevTotal), pctTrx:_pct(trx,prevTrx),
    pctPengeluaran:_pct(pengeluaran,prevPengeluaran),
    pctDiterima:_pct(diterima,prevDiterima), pctSelesai:_pct(selesai,prevSelesai)
  };
}

function _renderDashStats(s, range){
  const el=g('dash-stats'); if(!el)return;
  // Month-to-date accumulation (always for the month of curStart)
  const mISO=range.curISO.slice(0,7);
  const mOrders=orders.filter(o=>o.payStatus==='Lunas'&&_orderDateISO(o).startsWith(mISO)&&(dashOutlet==='all'||o.outletId===dashOutlet));
  const mTotal=mOrders.reduce((sum,o)=>sum+o.total,0);
  // Days elapsed in that month (up to today or end of period)
  const dayOfMonth=parseInt(range.curEndISO.slice(8),10)||1;
  const daysInMonth=new Date(parseInt(range.curISO.slice(0,4)),parseInt(range.curISO.slice(5,7)),0).getDate();
  const proj=dayOfMonth>0?Math.round(mTotal/dayOfMonth*daysInMonth):0;

  const scTotal=`<div class="dsc dsc-total">
    <div class="dsc-lbl">Total Penjualan ${_fmtPct(s.pctTotal)}</div>
    <div class="dsc-val" style="font-size:22px">${fmt(s.total)}</div>
    <div class="dsc-sub">Akumulasi dari Awal Bulan ${fmt(mTotal)}<br>Proyeksi Bulan Ini ${fmt(proj)}</div>
  </div>`;

  const scBelum=`<div class="dsc">
    <div class="dsc-lbl">Penjualan Belum Dibayar</div>
    <div class="dsc-val">${fmt(s.belum)}</div>
  </div>`;

  const scBayar=`<div class="dsc">
    <div class="dsc-lbl">Penjualan Terbayar ${_fmtPct(s.pctTotal)}</div>
    <div class="dsc-val">${fmt(s.bayar)}</div>
  </div>`;

  const scTrx=`<div class="dsc">
    <div class="dsc-lbl">Transaksi ${_fmtPct(s.pctTrx)}</div>
    <div class="dsc-val">${s.trx}</div>
  </div>`;

  const scPengeluaran=`<div class="dsc">
    <div class="dsc-lbl">Pengeluaran ${_fmtPct(s.pctPengeluaran)}</div>
    <div class="dsc-val">${fmt(s.pengeluaran)}</div>
  </div>`;

  const scDiterima=`<div class="dsc">
    <div class="dsc-lbl">Pesanan Diterima ${_fmtPct(s.pctDiterima)}</div>
    <div class="dsc-val">${s.diterima}</div>
  </div>`;

  const scSelesai=`<div class="dsc">
    <div class="dsc-lbl">Pesanan Selesai ${_fmtPct(s.pctSelesai)}</div>
    <div class="dsc-val">${s.selesai}</div>
  </div>`;

  el.innerHTML = scTotal + scBelum + scTrx + scPengeluaran + scBayar + scDiterima + scSelesai;
}

function _renderDashChart(curOrders, prevOrders, range, _retry){
  const canvas=g('dash-chart'); if(!canvas)return;
  // Wait until the canvas and its container have real dimensions
  if(!canvas.offsetWidth || !(canvas.parentElement?.offsetHeight)){
    if((_retry||0)<10) setTimeout(()=>_renderDashChart(curOrders,prevOrders,range,(_retry||0)+1), 40);
    return;
  }
  // Destroy previous chart instance
  if(_dashChart){_dashChart.destroy();_dashChart=null;}

  const N=range.buckets;
  const curData=Array(N).fill(0);
  const prevData=Array(N).fill(0);
  curOrders.forEach(o=>{const i=range.bucketOf(o);if(i>=0&&i<N)curData[i]+=o.total||0;});
  prevOrders.forEach(o=>{const i=range.prevBucketOf(o);if(i>=0&&i<N)prevData[i]+=o.total||0;});
  const labels=Array.from({length:N},(_,i)=>range.bucketLabel(i));

  const ctx=canvas.getContext('2d');
  const h=canvas.parentElement.offsetHeight||260;
  const gradCur=ctx.createLinearGradient(0,0,0,h);
  gradCur.addColorStop(0,'rgba(141,196,64,0.22)');gradCur.addColorStop(1,'rgba(141,196,64,0)');
  const gradPrev=ctx.createLinearGradient(0,0,0,h);
  gradPrev.addColorStop(0,'rgba(180,180,180,0.22)');gradPrev.addColorStop(1,'rgba(180,180,180,0)');

  const tooltipEl=g('dash-tooltip');

  _dashChart=new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[
        {label:'Periode Sebelumnya',data:prevData,borderColor:'#C0C0C0',backgroundColor:gradPrev,
         fill:true,tension:0.4,pointRadius:0,pointHoverRadius:4,borderWidth:2,pointHoverBackgroundColor:'#C0C0C0'},
        {label:'Total Penjualan',data:curData,borderColor:'#8DC440',backgroundColor:gradCur,
         fill:true,tension:0.4,pointRadius:0,pointHoverRadius:5,borderWidth:2.5,pointHoverBackgroundColor:'#8DC440'}
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{display:false},
        tooltip:{enabled:false,external(context){
          if(!tooltipEl)return;
          const {tooltip}=context;
          if(tooltip.opacity===0||!tooltip.dataPoints?.length){tooltipEl.style.display='none';return;}
          const idx=tooltip.dataPoints[0].dataIndex;
          const curV=curData[idx]||0, prevV=prevData[idx]||0;
          const lbl=labels[idx]??'';
          const pct=prevV===0?null:((curV-prevV)/prevV*100);
          const pctHtml=pct===null?'':`<div style="display:inline-block;background:${pct>=0?'#2E7D32':'#E53935'};color:#fff;font-size:11px;font-weight:700;border-radius:5px;padding:1px 7px;margin-bottom:6px">${pct>=0?'↑':'↓'} ${Math.abs(pct).toFixed(2)}%</div>`;
          tooltipEl.innerHTML=`${pctHtml}<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8DC440;flex-shrink:0"></span><span style="flex:1;color:#ccc">${lbl}</span><strong>${fmt(curV)}</strong></div><div style="display:flex;align-items:center;gap:6px;color:#aaa"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#C0C0C0;flex-shrink:0"></span><span style="flex:1">${lbl}</span><span>${fmt(prevV)}</span></div>`;
          const pos=context.chart.canvas.getBoundingClientRect();
          const x=pos.left+tooltip.caretX;
          const y=pos.top+tooltip.caretY;
          tooltipEl.style.display='block';
          const tw=tooltipEl.offsetWidth||180;
          const left=x+tw+16>window.innerWidth?x-tw-10:x+10;
          tooltipEl.style.left=left+'px';
          tooltipEl.style.top=Math.max(8,y-40)+'px';
        }}
      },
      scales:{
        x:{
          grid:{color:'rgba(0,0,0,0.04)'},
          ticks:{color:'#9A9A9A',font:{size:11},maxRotation:0,
            callback(v,i){
              // For harian: show every 2nd hour; for others: all
              if(N===24)return i%2===0?labels[i]:'';
              if(N===7)return labels[i];
              // Bulanan: show every 5th
              return(i%5===0||i===N-1)?labels[i]:'';
            }
          }
        },
        y:{
          grid:{color:'rgba(0,0,0,0.04)'},
          ticks:{color:'#9A9A9A',font:{size:11},callback:v=>_fmtK(v)},
          beginAtZero:true
        }
      }
    }
  });

  // Update chart label
  const lbl=g('dash-chart-lbl'); if(lbl)lbl.textContent=range.chartLabel;
}

function refreshODash(_attempt){
  // If cloud data hasn't loaded yet, retry every 200ms (up to ~6s) rather than render empty stats
  if(!_supaDataLoaded){
    if((_attempt||0)<30) setTimeout(()=>refreshODash((_attempt||0)+1),200);
    return;
  }
  // "Diperbarui" timestamp
  const upEl=g('dash-updated');
  if(upEl){const n=new Date();upEl.textContent='Diperbarui '+n.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})+', '+n.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}

  const range=getDashRange();

  // Update period tab buttons
  ['harian','mingguan','bulanan'].forEach(p=>{
    const btn=g('dtab-'+p); if(!btn)return;
    btn.classList.toggle('on',p===dashPeriod);
  });

  // Outlet filter chips
  const ochips=g('dash-outlet-chips');
  if(ochips&&outlets.length>1){
    ochips.style.display='flex';
    const tabs=[{id:'all',label:'Semua Outlet',color:null},...outlets.map(o=>({id:o.id,label:o.name,color:o.color}))];
    ochips.innerHTML=tabs.map(t=>{
      const on=t.id===dashOutlet;
      const sc=t.color?safeColor(t.color):'';
      const style=on&&sc?`background:${sc}18;border-color:${sc};color:${sc}`:'';
      return `<span class="chip${on?' on':''}" style="${style}" onclick="setDashOutlet('${t.id}')">${sc?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sc};margin-right:5px;vertical-align:middle"></span>`:''}${esc(t.label)}</span>`;
    }).join('');
  } else if(ochips){
    ochips.style.display='none';
  }

  // Date range label
  const rngEl=g('dash-range'); if(rngEl)rngEl.textContent=range.rangeLabel;

  // Next button disable if at current period
  const nextBtn=g('dash-nav-next'); if(nextBtn)nextBtn.disabled=dashOffset===0;

  // Get orders
  const curOrders=_ordersInRange(range.curISO,range.curEndISO);
  const prevOrders=_ordersInRange(range.prevISO,range.prevEndISO);

  // Stats
  const stats=_calcDashStats(curOrders,prevOrders,range.curISO,range.curEndISO,range.prevISO,range.prevEndISO);
  _renderDashStats(stats,range);

  // Chart
  _renderDashChart(curOrders,prevOrders,range);

  // WA alert
  const wp=orders.filter(o=>o.status==='Selesai'&&!o.waSent);
  const wa=g('o-wa-alert');
  if(wa)wa.innerHTML=wp.length?`<div style="background:var(--pl);border:2px solid var(--p);border-radius:var(--r);padding:13px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:13px;color:#3d6b10">${wp.length} cucian selesai belum dinotif WA</div><button class="btn bp bsm bpill" onclick="oGo('wa',null)">Kirim</button></div>`:'';
}
function refreshSDash(){
  const myOrders=curStaff?orders.filter(o=>o.outletId===curStaff.oid):orders;
  const wp=myOrders.filter(o=>o.status==='Selesai'&&!o.waSent);
  const sm=g('s-metrics');if(sm)sm.innerHTML=`<div class="mc2 cam"><div class="ml">Pesanan Aktif</div><div class="mv">${myOrders.filter(o=>!['Selesai','Diambil'].includes(o.status)).length}</div></div><div class="mc2 cg"><div class="ml">Selesai</div><div class="mv">${myOrders.filter(o=>o.status==='Selesai').length}</div></div><div class="mc2 cr"><div class="ml">Belum WA</div><div class="mv">${wp.length}</div></div>`;
  const sa=g('s-wa-alert');if(sa)sa.innerHTML=wp.length?`<div style="background:var(--pl);border:2px solid var(--p);border-radius:var(--r);padding:12px 15px;display:flex;align-items:center;justify-content:space-between"><div style="font-size:13px;color:#3d6b10">\uD83D\uDCAC ${wp.length} cucian belum dinotif</div><button class="btn bp bsm bpill" onclick="sGo('wa',null)">Kirim</button></div>`:'';
  const last=myOrders.slice().sort((a,b)=>(b.isoDate||'').localeCompare(a.isoDate||'')).slice(0,5);
  const sr=g('s-recent');if(sr)sr.innerHTML=last.length?'<table><tbody>'+last.map(o=>`<tr><td style="font-size:11px;font-family:monospace;color:var(--t2)">${o.id}</td><td style="font-weight:600">${o.name}</td><td><span class="badge ${SL_STATUS[o.status]}">${o.status}</span></td><td><span class="badge ${SL_PAY[o.payStatus]}">${o.payStatus}</span></td></tr>`).join('')+'</tbody></table>':'<div style="text-align:center;padding:20px;color:var(--t2)">Belum ada pesanan</div>';
  updStaffClk();
}

// ===== EMPLOYEES =====
let _empCollapsed = {}; // tracks which outlet sections are collapsed
let _empExpanded = {}; // tracks which mobile employee cards are expanded

function buildEmpChips(){
  const el=g('emp-filter-chips');if(!el)return;
  const tabs=[{id:'all',label:'Semua Outlet',color:null},...outlets.map(o=>({id:o.id,label:o.name,color:o.color}))];
  el.innerHTML=tabs.map(t=>{
    const on=empFilter===t.id;
    const sc=t.color?safeColor(t.color):'';
    const style=on&&sc?`background:${sc}18;border-color:${sc};color:${sc}`:'';
    return `<span class="chip${on?' on':''}" style="${style}" onclick="setEmpFilter('${t.id}')">${sc?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sc};margin-right:5px;vertical-align:middle"></span>`:''}${esc(t.label)}</span>`;
  }).join('');
}

function setEmpFilter(id){empFilter=id;renderEmployees();}

function _empLastLoginLbl(e){
  if(!e.clockIn&&!e.lastLoginDate)return'—';
  const d=e.lastLoginDate||TODAY_ISO;
  const t=e.clockIn||'';
  if(d===TODAY_ISO)return t?`Hari ini, ${t}`:'Hari ini';
  const yest=new Date(new Date().getTime()-86400000).toISOString().slice(0,10);
  if(d===yest)return t?`Kemarin, ${t}`:'Kemarin';
  const diff=Math.round((new Date(TODAY_ISO)-new Date(d))/(1000*60*60*24));
  if(diff>0&&diff<30)return`${diff} hari lalu`;
  return d||'—';
}

function _empAvatarColor(name){
  const colors=['#4CAF50','#2196F3','#9C27B0','#FF9800','#E91E63','#00BCD4','#795548','#607D8B'];
  let h=0;for(let i=0;i<name.length;i++)h=(h+name.charCodeAt(i))%colors.length;
  return colors[h];
}

function _empAksesHtml(e){
  if(e.status==='in'){
    return`<div class="emp-akses"><div class="emp-akses-dot" style="background:#4CAF50"></div><div><div class="emp-akses-lbl" style="color:#3d7a10">Masuk</div>${e.clockIn?`<div class="emp-akses-time">${esc(e.clockIn)}</div>`:''}</div></div>`;
  }
  if(e.status==='cuti'){
    return`<div class="emp-akses"><div class="emp-akses-dot" style="background:#9C27B0"></div><div><div class="emp-akses-lbl" style="color:#9C27B0">Cuti</div></div></div>`;
  }
  if(e.status==='sakit'){
    return`<div class="emp-akses"><div class="emp-akses-dot" style="background:#FF9800"></div><div><div class="emp-akses-lbl" style="color:#FF9800">Sakit</div></div></div>`;
  }
  return`<div class="emp-akses"><div class="emp-akses-dot" style="background:#bbb"></div><div><div class="emp-akses-lbl" style="color:var(--t2)">Belum Masuk</div><div class="emp-akses-time">—</div></div></div>`;
}

function renderEmployees(){
  buildEmpChips();
  const q=(g('emp-search')?.value||'').toLowerCase().trim();
  const list=(empFilter==='all'?employees:employees.filter(e=>e.oid===empFilter))
    .filter(e=>!q||e.name.toLowerCase().includes(q)||(e.phone||'').includes(q)||(e.role||'').toLowerCase().includes(q));
  const el=g('emp-list');if(!el)return;
  const footer=g('emp-footer');
  const outletList=empFilter==='all'?outlets:outlets.filter(o=>o.id===empFilter);
  if(!list.length){
    el.innerHTML=`<div style="text-align:center;padding:32px 24px;color:var(--t2)"><div style="font-size:13px;font-weight:500;margin-bottom:4px">Tidak ada karyawan</div><div style="font-size:12px">Klik + Tambah Karyawan untuk menambahkan.</div></div>`;
    if(footer)footer.textContent='';
    return;
  }
  let html='';
  outletList.forEach(o=>{
    const grp=list.filter(e=>e.oid===o.id);
    if(!grp.length&&empFilter!=='all')return;
    if(!grp.length&&empFilter==='all'&&!q)return;
    const collapsed=_empCollapsed[o.id]===true;
    const sc=safeColor(o.color);
    const isCompact=grp.length>1; // multi-employee outlets use compact collapsed rows
    html+=`<div class="emp-sec" id="emp-sec-${o.id}">
      <div class="emp-sec-hd" onclick="_empToggleSec('${o.id}')">
        <div class="emp-sec-dot" style="background:${sc}"></div>
        <span class="emp-sec-name">${esc(o.name)}</span>
        <span class="emp-sec-cnt">${grp.length} karyawan</span>
        <div style="flex:1"></div>
        <i data-lucide="${collapsed?'chevron-down':'chevron-up'}" style="width:16px;height:16px;stroke-width:2;color:var(--t2);display:block"></i>
      </div>
      ${collapsed?'':`<div id="emp-wrap-${o.id}">
        <div class="emp-table-wrap emp-desktop-only">
          <table class="emp-tbl">
            <thead><tr>
              <th>Karyawan</th><th>Role</th><th>PIN</th><th>Akses</th><th>Sisa Cuti</th><th>Last Login</th><th>Actions</th>
            </tr></thead>
            <tbody>${grp.map(e=>_empRow(e)).join('')}</tbody>
          </table>
        </div>
        <div class="emp-mobile-only">${grp.map(e=>_empMobCard(e,isCompact)).join('')}</div>
        <div class="emp-add-row" onclick="openAddEmpOutlet('${o.id}')">
          <i data-lucide="plus" style="width:14px;height:14px;stroke-width:2.5;display:block"></i> Tambah Karyawan di ${esc(o.name)}
        </div>
      </div>`}
    </div>`;
  });
  el.innerHTML=html;
  if(footer)footer.textContent=`Menampilkan ${list.length} dari ${employees.length} karyawan`;
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function _empRow(e){
  const av=_empAvatarColor(e.name);
  const sisaCuti=Math.max(0,cutiPerBulan-(e.cutiUsed||0));
  const clkBtn=e.status==='in'
    ?`<button class="btn bsm btn-clkout" onclick="empAct(${e.id},'clkout')">Clock Out</button>`
    :`<button class="btn bsm btn-clkin" onclick="empAct(${e.id},'clkin')">Clock In</button>`;
  return`<tr>
    <td data-label="Karyawan">
      <div class="emp-av-cell">
        <div class="emp-av" style="background:${av}">${esc(ini(e.name))}</div>
        <div>
          <div class="emp-cell-name">${esc(e.name)}</div>
          <div class="emp-cell-phone">${esc(e.phone||'—')}</div>
        </div>
      </div>
    </td>
    <td data-label="Role" style="font-size:13px;color:var(--t1)">${esc(e.role||'—')}${e.isKurir?`<span style="margin-left:5px;font-size:10px;font-weight:700;background:#e3f2fd;color:#1565c0;padding:1px 6px;border-radius:20px;vertical-align:middle">Kurir</span>`:''}</td>
    <td data-label="PIN"><span class="emp-pin">${e.pin?'••••':'<span style="color:var(--re);font-size:11px">Belum diset</span>'}</span></td>
    <td data-label="Akses">${_empAksesHtml(e)}</td>
    <td data-label="Sisa Cuti"><span class="emp-cuti-val">${sisaCuti}x</span></td>
    <td data-label="Last Login"><span class="emp-lastlogin">${esc(_empLastLoginLbl(e))}</span></td>
    <td data-label="Actions">
      <div class="emp-actions">
        ${clkBtn}
        <div class="emp-cuti-wrap" style="position:relative">
          <button class="btn bsm btn-cuti-dd" onclick="_empCutiDd(event,${e.id})">Cuti <i data-lucide="chevron-down" style="width:11px;height:11px;stroke-width:2;display:block"></i></button>
          <div class="emp-kebab-dd" id="emp-cuti-dd-${e.id}">
            <button onclick="_empCutiAct(${e.id},'cuti')">Ambil Cuti${e.cutiUsed>=cutiPerBulan?' (Habis)':''}</button>
            <button onclick="_empCutiAct(${e.id},'sakit')">Sakit</button>
            <button onclick="_empCutiAct(${e.id},'off')">Reset ke Off</button>
          </div>
        </div>
        <button class="btn bsm" onclick="openEditEmp(${e.id})">Edit</button>
        <div style="position:relative">
          <button class="emp-kebab" onclick="_empKebab(event,${e.id})"><i data-lucide="more-vertical" style="width:14px;height:14px;stroke-width:2;display:block"></i></button>
          <div class="emp-kebab-dd" id="emp-kbb-${e.id}">
            <button onclick="resetEmpPin(${e.id});_closeAllEmpDd()">Reset PIN</button>
            <button onclick="_empToggleAktif(${e.id});_closeAllEmpDd()">Nonaktifkan</button>
            <button class="danger" onclick="delEmp(${e.id});_closeAllEmpDd()">Hapus</button>
          </div>
        </div>
      </div>
    </td>
  </tr>`;
}

function _empMobCard(e, isCompact){
  const av=_empAvatarColor(e.name);
  const sisaCuti=Math.max(0,cutiPerBulan-(e.cutiUsed||0));
  // Status badge
  let badgeCls='emp-mob-badge-off',badgeDot='#9CA3AF',badgeLbl='Belum Masuk';
  if(e.status==='in'){badgeCls='emp-mob-badge-in';badgeDot='#16A34A';badgeLbl='Masuk';}
  else if(e.status==='cuti'){badgeCls='emp-mob-badge-cuti';badgeDot='#9C27B0';badgeLbl='Cuti';}
  else if(e.status==='sakit'){badgeCls='emp-mob-badge-sakit';badgeDot='#F57C00';badgeLbl='Sakit';}
  else if(e.status==='nonaktif'){badgeCls='emp-mob-badge-nonaktif';badgeDot='#9CA3AF';badgeLbl='Nonaktif';}
  const timeStr=(e.status==='in'&&e.clockIn)?e.clockIn:'';
  // Default: single-emp outlets start expanded; multi-emp outlets start collapsed
  const isExpanded=isCompact?(_empExpanded[e.id]===true):(_empExpanded[e.id]!==false);
  const chevIcon=isExpanded?'chevron-down':'chevron-right';
  const clkBtn=e.status==='in'
    ?`<button class="emp-mob-act-btn emp-mob-act-clkout" onclick="empAct(${e.id},'clkout')">Clock Out</button>`
    :`<button class="emp-mob-act-btn emp-mob-act-clkin" onclick="empAct(${e.id},'clkin')">Clock In</button>`;
  return`<div class="emp-mob-item" id="emp-mob-item-${e.id}">
    <div class="emp-mob-row" onclick="_empToggleExpand(${e.id})">
      <div class="emp-mob-av" style="background:${av}">${esc(ini(e.name))}</div>
      <div class="emp-mob-meta">
        <div class="emp-mob-name">${esc(e.name)}</div>
        <div class="emp-mob-phone">${esc(e.phone||'—')}</div>
      </div>
      <div class="emp-mob-status-col">
        <span class="emp-mob-badge ${badgeCls}"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${badgeDot}"></span>${esc(badgeLbl)}</span>
        ${timeStr?`<div class="emp-mob-time">${esc(timeStr)}</div>`:''}
      </div>
      <i data-lucide="${chevIcon}" id="emp-mob-chev-${e.id}" style="width:16px;height:16px;stroke-width:2;color:var(--t2);display:block;flex-shrink:0;margin-left:4px"></i>
    </div>
    <div class="emp-mob-detail" id="emp-mob-detail-${e.id}" style="display:${isExpanded?'block':'none'}">
      <div class="emp-mob-info-grid">
        <div><div class="emp-mob-info-lbl">Role</div><div class="emp-mob-info-val">${esc(e.role||'—')}</div></div>
        <div><div class="emp-mob-info-lbl">PIN</div><div class="emp-mob-info-val">${e.pin?'••••':'<span style="color:var(--re);font-size:11px;font-weight:400">Belum diset</span>'}</div></div>
        <div><div class="emp-mob-info-lbl">Sisa Cuti</div><div class="emp-mob-info-val">${sisaCuti}x</div></div>
        <div><div class="emp-mob-info-lbl">Last Login</div><div class="emp-mob-info-val">${esc(_empLastLoginLbl(e))}</div></div>
      </div>
      <div class="emp-mob-actions-lbl">Actions</div>
      <div class="emp-mob-actions">
        ${clkBtn}
        <div class="emp-cuti-wrap" style="position:relative">
          <button class="emp-mob-act-btn btn-cuti-dd" onclick="_empCutiDd(event,${e.id})">Cuti <i data-lucide="chevron-down" style="width:11px;height:11px;stroke-width:2;display:block"></i></button>
          <div class="emp-kebab-dd" id="emp-cuti-dd-${e.id}">
            <button onclick="_empCutiAct(${e.id},'cuti')">Ambil Cuti${e.cutiUsed>=cutiPerBulan?' (Habis)':''}</button>
            <button onclick="_empCutiAct(${e.id},'sakit')">Sakit</button>
            <button onclick="_empCutiAct(${e.id},'off')">Reset ke Off</button>
          </div>
        </div>
        <button class="emp-mob-act-btn" onclick="openEditEmp(${e.id})">Edit</button>
        <div style="position:relative">
          <button class="emp-mob-act-more" onclick="_empKebab(event,${e.id})"><i data-lucide="more-vertical" style="width:14px;height:14px;stroke-width:2;display:block"></i></button>
          <div class="emp-kebab-dd" id="emp-kbb-${e.id}">
            <button onclick="resetEmpPin(${e.id});_closeAllEmpDd()">Reset PIN</button>
            <button onclick="_empToggleAktif(${e.id});_closeAllEmpDd()">${e.status==='nonaktif'?'Aktifkan':'Nonaktifkan'}</button>
            <button class="danger" onclick="delEmp(${e.id});_closeAllEmpDd()">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function _empToggleExpand(id){
  const detail=g('emp-mob-detail-'+id);
  const chev=g('emp-mob-chev-'+id);
  if(!detail)return;
  const isOpen=detail.style.display!=='none';
  detail.style.display=isOpen?'none':'block';
  _empExpanded[id]=!isOpen;
  if(chev){
    chev.setAttribute('data-lucide',isOpen?'chevron-right':'chevron-down');
    if(typeof lucide!=='undefined')lucide.createIcons();
  }
}

function _empToggleSec(oid){
  _empCollapsed[oid]=!_empCollapsed[oid];
  renderEmployees();
}

function _empKebab(e,id){
  e.stopPropagation();
  const dd=g('emp-kbb-'+id);if(!dd)return;
  const wasOpen=dd.classList.contains('open');
  _closeAllEmpDd();
  if(!wasOpen)dd.classList.add('open');
}

function _empCutiDd(e,id){
  e.stopPropagation();
  const dd=g('emp-cuti-dd-'+id);if(!dd)return;
  const wasOpen=dd.classList.contains('open');
  _closeAllEmpDd();
  if(!wasOpen)dd.classList.add('open');
}

function _closeAllEmpDd(){
  document.querySelectorAll('.emp-kebab-dd').forEach(d=>d.classList.remove('open'));
}

function _empCutiAct(id,act){
  _closeAllEmpDd();
  if(act==='off'){
    const e=employees.find(x=>x.id===id);if(!e)return;
    e.status='off';
    renderEmployees();
    syncEmployee(e);
    toast(e.name+' → Status direset ke Off');
    return;
  }
  empAct(id,act);
}

function _empToggleAktif(id){
  const e=employees.find(x=>x.id===id);if(!e)return;
  if(e.status==='nonaktif'){e.status='off';toast(e.name+' → Diaktifkan kembali');}
  else{e.status='nonaktif';toast(e.name+' → Dinonaktifkan');}
  renderEmployees();
  syncEmployee(e);
}

function empAct(id,act){
  const e=employees.find(x=>x.id===id);if(!e)return;
  if(act==='clkin'){
    e.status='in';e.clockIn=NOW();e.clockOut=null;
    e.lastLoginDate=TODAY_ISO;
  }else if(act==='clkout'){
    e.status='off';e.clockOut=NOW();
  }else if(act==='cuti'){
    if(e.cutiUsed>=cutiPerBulan){toast('Jatah cuti habis');return;}
    e.status='cuti';e.cutiUsed++;e.clockIn=null;e.clockOut=null;
  }else if(act==='sakit'){
    e.status='sakit';e.clockIn=null;e.clockOut=null;
  }
  renderEmployees();syncEmployee(e);
  toast(e.name+' \u2192 '+{clkin:'Clock In',clkout:'Clock Out',cuti:'Cuti ('+e.cutiUsed+'/'+cutiPerBulan+')',sakit:'Sakit'}[act]);
  if(curStaff&&curStaff.id===id){curStaff=e;updStaffClk();}
}

let _pinResetEmpId=null; let _editEmpId=null;

function resetEmpPin(id){
  const e=employees.find(x=>x.id===id);if(!e)return;
  _pinResetEmpId=id;
  const t=g('m-pin-reset-title');if(t)t.textContent='Reset PIN – '+e.name;
  ['pr-pin','pr-pin2'].forEach(id=>{const el=g(id);if(el)el.value='';});
  const err=g('pr-err');if(err)err.style.display='none';
  openModal('m-pin-reset');
  setTimeout(()=>g('pr-pin')?.focus(),100);
}

async function savePinReset(){const e=employees.find(x=>x.id===_pinResetEmpId);if(!e)return;const p=g('pr-pin')?.value||'',p2=g('pr-pin2')?.value||'';const err=g('pr-err');if(!/^\d{4}$/.test(p)){if(err){err.textContent='PIN harus 4 digit angka.';err.style.display='block';}return;}if(p!==p2){if(err){err.textContent='Konfirmasi PIN tidak cocok.';err.style.display='block';}return;}e.pin=await hashSecret(p);renderEmployees();syncEmployee(e);cm('m-pin-reset');toast('\u2713 PIN '+e.name+' diubah');}

function delEmp(id){
  confirm_('Hapus Karyawan?','Data ini akan dihapus permanen.',()=>{
    employees=employees.filter(x=>x.id!==id);
    renderEmployees();deleteEmployee(id);
    toast('Karyawan dihapus');
  });
}

function _empSetKurir(isOn){
  const btn=g('me-kurir-toggle');
  if(btn){btn.className='toggle'+(isOn?' on':' off');}
  const panel=g('me-kurir-outlets');
  if(panel)panel.style.display=isOn?'':'none';
}
function toggleEmpKurir(){
  const btn=g('me-kurir-toggle');if(!btn)return;
  const isOn=btn.classList.contains('on');
  _empSetKurir(!isOn);
}
function _buildKurirOutletChecks(selected=[]){
  const wrap=g('me-kurir-outlet-checks');if(!wrap)return;
  wrap.innerHTML=outlets.map(o=>`
    <label style="display:flex;align-items:center;gap:8px;padding:7px 0;cursor:pointer;font-size:13px">
      <input type="checkbox" id="me-ko-${esc(o.id)}" value="${esc(o.id)}" ${selected.includes(o.id)?'checked':''} style="width:15px;height:15px;accent-color:var(--p);flex-shrink:0">
      <span>${esc(o.name)}</span>
    </label>`).join('');
}
function _getKurirOutlets(){
  return outlets.filter(o=>g('me-ko-'+o.id)?.checked).map(o=>o.id);
}

function openAddEmp(){
  _editEmpId=null;
  ['me-n','me-ph','me-p'].forEach(id=>{const el=g(id);if(el)el.value='';});
  if(g('me-r'))g('me-r').value='Kasir';
  g('me-o').innerHTML=outlets.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('');
  if(empFilter!=='all'&&g('me-o'))g('me-o').value=empFilter;
  const pw=g('me-pin-wrap');if(pw)pw.style.display='';
  _empSetKurir(false);
  _buildKurirOutletChecks([]);
  g('m-emp-title').textContent='Tambah Karyawan';
  openModal('m-emp');
}

function openAddEmpOutlet(oid){
  openAddEmp();
  const sel=g('me-o');if(sel)sel.value=oid;
}

function openEditEmp(id){
  const e=employees.find(x=>x.id===id);if(!e)return;
  _editEmpId=id;
  if(g('me-n'))g('me-n').value=e.name;
  if(g('me-ph'))g('me-ph').value=e.phone||'';
  if(g('me-r'))g('me-r').value=e.role;
  g('me-o').innerHTML=outlets.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('');
  if(g('me-o'))g('me-o').value=e.oid;
  const pw=g('me-pin-wrap');if(pw)pw.style.display='none';
  _empSetKurir(!!e.isKurir);
  _buildKurirOutletChecks(e.kurirOutlets||[]);
  g('m-emp-title').textContent='Edit Karyawan';
  openModal('m-emp');
}

async function saveEmp(){
  const name=(g('me-n')?.value||'').trim();
  if(!name){toast('Nama wajib diisi');return;}
  const oid=g('me-o')?.value;
  if(!oid){toast('Pilih outlet terlebih dahulu');return;}
  const role=g('me-r')?.value||'Kasir';
  const phone=(g('me-ph')?.value||'').trim();
  const isKurir=g('me-kurir-toggle')?.classList.contains('on')||false;
  const kurirOutlets=isKurir?_getKurirOutlets():[];
  if(_editEmpId){
    const e=employees.find(x=>x.id===_editEmpId);if(!e)return;
    e.name=name;e.oid=oid;e.role=role;e.phone=phone;e.isKurir=isKurir;e.kurirOutlets=kurirOutlets;
    _editEmpId=null;cm('m-emp');renderEmployees();buildStaffBtns();syncEmployee(e);
    toast('Data '+name+' diperbarui');return;
  }
  const pin=g('me-p')?.value||'';
  if(!pin){toast('PIN wajib diisi');return;}
  if(!/^\d{4}$/.test(pin)){toast('PIN harus 4 digit angka');return;}
  const newId=Date.now();
  const hashedPin=await hashSecret(pin);
  employees.push({id:newId,name,role,oid,phone,pin:hashedPin,status:'off',cutiUsed:0,clockIn:null,clockOut:null,lastLoginDate:null,isKurir,kurirOutlets});
  cm('m-emp');renderEmployees();buildStaffBtns();
  syncEmployee(employees.find(x=>x.id===newId));
  toast('Karyawan '+name+' ditambahkan');
}

function updStaffClk(){if(!curStaff)return;const e=employees.find(x=>x.id===curStaff.id);if(!e)return;const stM={in:'Sedang bekerja \u00B7 Masuk: '+e.clockIn,off:'Belum clock in hari ini',cuti:'Cuti hari ini',sakit:'Sakit hari ini'};const cs=g('s-clk-st');if(cs)cs.textContent=stM[e.status]||'';const cb=g('s-clk-btns');if(!cb)return;cb.innerHTML=e.status==='in'?`<button class="btn bre bsm bpill" onclick="staffClk('clkout')">Clock Out</button>`:e.status==='off'?`<button class="btn bp bsm bpill" onclick="staffClk('clkin')">Clock In</button>`:`<span class="badge ${e.status==='cuti'?'gpu':'gam'}">${e.status==='cuti'?'Cuti':'Sakit'}</span>`;}
function staffClk(act){if(!curStaff)return;empAct(curStaff.id,act);}

// Close employee dropdowns when clicking outside
document.addEventListener('click', function(e){
  if(!e.target.closest('.emp-cuti-wrap')&&!e.target.closest('[id^="emp-kbb-"]')&&!e.target.closest('.emp-kebab')){
    _closeAllEmpDd();
  }
});

// ===== SUBSCRIPTION =====
let _renewCycle = 'monthly'; // 'monthly' | 'annual'

function _daysLeft(){
  if(!currentPlanExpiry) return null;
  const diff = new Date(currentPlanExpiry) - new Date();
  return Math.ceil(diff / 86400000);
}

function renderPlanBadge(){
  const p = PLANS[currentPlan] || PLANS.basic;
  const nameEl = g('plan-badge-name'), emojiEl = g('plan-badge-emoji');
  if(nameEl) nameEl.textContent = p.name;
  if(emojiEl){ emojiEl.innerHTML = `<i data-lucide="${p.icon}"></i>`; lucide.createIcons({nodes:[emojiEl]}); }
  const subEl = g('plan-badge-sub');
  if(subEl){
    const d = _daysLeft();
    const isTrial = currentPlanStatus === 'trial';
    if(d !== null && d <= 0){
      subEl.textContent = isTrial ? 'Trial Berakhir' : 'Expired';
      subEl.style.color = '#E53935';
    } else if(isTrial){
      subEl.textContent = d !== null ? `Trial: ${d} hari lagi` : 'Trial';
      subEl.style.color = d !== null && d <= 3 ? '#F57C00' : '#888';
    } else if(currentPlanStatus === 'active'){
      if(d === null){ subEl.textContent = ''; }
      else if(d <= 7){ subEl.textContent = `${d} hari lagi`; subEl.style.color = '#F57C00'; }
      else { subEl.textContent = `${d} hari lagi`; subEl.style.color = '#888'; }
    } else {
      subEl.textContent = '';
    }
  }
}

function checkPlanExpiry(){
  // Lock/unlock the nav
  const nav = g('o-nav');
  if(nav){ if(isPlanExpired()) nav.classList.add('plan-locked'); else nav.classList.remove('plan-locked'); }
  // Also lock the Buat Pesanan button
  const fabBtn = document.querySelector('.fab-sb .fab');
  if(fabBtn){ fabBtn.disabled = isPlanExpired(); fabBtn.style.opacity = isPlanExpired() ? '.35' : ''; }

  const el = g('plan-expiry-banner');
  if(!el) return;
  const d = _daysLeft();
  const isTrial = currentPlanStatus === 'trial';
  if(d === null){ el.style.display = 'none'; return; }
  if(d <= 0){
    el.style.display = 'block';
    el.style.background = 'var(--reb)'; el.style.border = '1px solid #E53935'; el.style.color = 'var(--re)';
    el.innerHTML = isTrial
      ? `Masa trial 14 hari kamu sudah berakhir. Silakan berlangganan untuk terus menggunakan CleanPOS. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showUpgradeModal()">Pilih Plan →</a>`
      : `Plan <strong>${PLANS[currentPlan]?.name}</strong> kamu sudah expired. Outlet dibatasi ke 1. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showRenewModal('${currentPlan}')">Perpanjang sekarang →</a>`;
    if(outlets.length > 1) toast('Langganan berakhir — hanya 1 outlet aktif.');
  } else if(d <= 7){
    el.style.display = 'block';
    el.style.background = 'var(--amb)'; el.style.border = '1px solid #FFE082'; el.style.color = 'var(--am)';
    el.innerHTML = isTrial
      ? `Masa trial kamu berakhir dalam <strong>${d} hari</strong>. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showUpgradeModal()">Pilih Plan →</a>`
      : `Plan <strong>${PLANS[currentPlan]?.name}</strong> berakhir dalam <strong>${d} hari</strong>. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showRenewModal('${currentPlan}')">Perpanjang →</a>`;
  } else {
    el.style.display = 'none';
  }
}

function showUpgradeModal(){
  const el = g('upgrade-cards'); if(!el) return;
  const isTrial = currentPlanStatus === 'trial';
  const isSubscribed = currentPlanStatus === 'active'; // paid & active
  const FEATS = ['Pesanan tak terbatas','Laporan keuangan','Multi-karyawan','Sync cloud real-time','Support WhatsApp'];
  el.innerHTML = Object.entries(PLANS).map(([key,p]) => {
    const isCurrent = key === currentPlan;
    // A plan is "locked / no action" only if it's the current active (paid) subscription
    const isActiveHere = isCurrent && isSubscribed;
    let btnLabel, btnAttr;
    if(isActiveHere){
      btnLabel = 'Perpanjang'; btnAttr = `onclick="showRenewModal('${key}')"`;
    } else {
      btnLabel = isTrial ? 'Berlangganan →' : (isCurrent ? 'Berlangganan →' : 'Upgrade →');
      btnAttr = `onclick="showRenewModal('${key}')"`;
    }
    return `<div style="border:2px solid ${isCurrent?p.color:'var(--b1)'};border-radius:var(--r);padding:16px;display:flex;flex-direction:column;gap:10px;background:${isCurrent?p.color+'12':'var(--ca)'}">
      <div style="text-align:center">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:${p.color}18;color:${p.color}"><i data-lucide="${p.icon}" style="width:22px;height:22px;stroke-width:1.75"></i></div>
        <div style="font-weight:800;font-size:15px;color:${p.color};margin-top:6px">${p.name}</div>
        <div style="font-size:12px;color:var(--t2);margin-top:2px;font-weight:600">${p.blurb}</div>
        ${isTrial&&isCurrent?`<div style="font-size:10px;margin-top:4px;background:${p.color}22;color:${p.color};border-radius:6px;padding:2px 8px;display:inline-block;font-weight:700">Sedang Trial</div>`:''}
      </div>
      <div style="height:1px;background:var(--b1)"></div>
      <div style="font-size:12px;line-height:2;color:var(--t2)">
        <div style="font-weight:700;color:${p.color};font-size:13px;margin-bottom:4px">${p.outlets} Outlet</div>
        ${FEATS.map(f=>`<div style="display:flex;align-items:center;gap:5px"><i data-lucide="check" style="width:12px;height:12px;stroke-width:2.5;color:#4CAF50;flex-shrink:0"></i>${f}</div>`).join('')}
      </div>
      <button class="btn bfull bpill" style="font-size:12px;background:${p.color};border-color:${p.color};color:#fff" ${btnAttr}>
        ${btnLabel}
      </button>
    </div>`;
  }).join('');
  lucide.createIcons({nodes:[el]});
  openModal('m-upgrade');
}

function showRenewModal(plan){
  _renewCycle = 'monthly';
  cm('m-upgrade');
  const p = PLANS[plan] || PLANS.elite;
  const titleEl = g('renew-plan-name');
  const isRenewal = currentPlanStatus === 'active' && currentPlan === plan;
  if(titleEl){ titleEl.innerHTML = `<i data-lucide="${p.icon}" style="width:16px;height:16px;stroke-width:2;vertical-align:middle;margin-right:4px"></i>${p.name} — ${isRenewal ? 'Perpanjang' : 'Berlangganan'}`; lucide.createIcons({nodes:[titleEl]}); }
  _renderRenewModal(plan);
  openModal('m-renew');
}

function _setRenewCycle(cycle){
  _renewCycle = cycle;
  const mBtn = g('renew-cycle-monthly'), aBtn = g('renew-cycle-annual');
  if(mBtn){ mBtn.style.background = cycle==='monthly'?'var(--p)':'var(--ca)'; mBtn.style.color = cycle==='monthly'?'#fff':'var(--t1)'; mBtn.style.borderColor = cycle==='monthly'?'var(--p)':'var(--b1)'; }
  if(aBtn){ aBtn.style.background = cycle==='annual'?'var(--p)':'var(--ca)'; aBtn.style.color = cycle==='annual'?'#fff':'var(--t1)'; aBtn.style.borderColor = cycle==='annual'?'var(--p)':'var(--b1)'; }
  const plan = g('renew-pay-btn')?.dataset.plan;
  if(plan) _renderRenewPrice(plan);
}

function _renderRenewModal(plan){
  const p = PLANS[plan];
  const payBtn = g('renew-pay-btn');
  if(payBtn) payBtn.dataset.plan = plan;
  _setRenewCycle('monthly');
  _renderRenewPrice(plan);
}

function _renderRenewPrice(plan){
  const p = PLANS[plan]; if(!p) return;
  const isAnnual = _renewCycle === 'annual';
  const price = isAnnual ? p.annual : p.price;
  const days = isAnnual ? 365 : 30;
  const saving = isAnnual ? fmt(p.price*12 - p.annual) : null;
  const priceEl = g('renew-price-display');
  if(priceEl){
    priceEl.innerHTML = `<div style="font-size:22px;font-weight:800;color:var(--p)">${fmt(price)}</div>
      <div style="font-size:12px;color:var(--t2);margin-top:4px">+${days} hari aktif${isAnnual&&saving?' · <span style="color:#4CAF50;font-weight:700">Hemat '+saving+'</span>':''}</div>`;
  }
}

// processSuccessfulPayment — called after Snap onSuccess.
// The webhook (midtrans-webhook Edge Function) is the authoritative source;
// we re-fetch here to get the updated plan written by the webhook.
async function processSuccessfulPayment(){
  const subData = await sbFetch('subscriptions');
  if(subData && subData.length){
    currentPlan       = subData[0].plan       || 'basic';
    currentPlanStatus = subData[0].status      || 'active';
    currentPlanExpiry = subData[0].expires_at  || null;
  }
  renderPlanBadge();
  renderSubCard();
  checkPlanExpiry();
  oGo('dashboard', document.querySelector('#o-nav .ni[onclick*="dashboard"]'));
  const expStr = currentPlanExpiry
    ? new Date(currentPlanExpiry).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})
    : '';
  toast(`✅ Plan ${PLANS[currentPlan]?.name} aktif! Berakhir ${expStr}`);
}

function renderSubCard(){
  const el = g('settings-sub-card'); if(!el) return;
  const p = PLANS[currentPlan] || PLANS.basic;
  const d = _daysLeft();
  const isExpired = d !== null && d <= 0;
  const isWarn = d !== null && d > 0 && d <= 7;

  const isTrial = currentPlanStatus === 'trial';

  // Status badge (uses .set-plan-badge class)
  let statusHtml;
  if(isTrial && isExpired){
    statusHtml = `<span class="set-plan-badge err">Trial Berakhir</span>`;
  } else if(isTrial){
    statusHtml = `<span class="set-plan-badge warn">Trial Gratis</span>`;
  } else if(isExpired){
    statusHtml = `<span class="set-plan-badge err">Expired</span>`;
  } else if(currentPlanStatus === 'active'){
    statusHtml = `<span class="set-plan-badge">Aktif</span>`;
  } else {
    statusHtml = `<span class="set-plan-badge warn">${currentPlanStatus}</span>`;
  }

  el.innerHTML = `<div class="set-plan-card">
    <div class="set-plan-ic"><i data-lucide="${p.icon}" style="width:20px;height:20px;stroke-width:1.75;display:block"></i></div>
    <div style="flex:1;min-width:0">
      <div class="set-plan-name">${p.name} Plan ${statusHtml}</div>
      <div class="set-plan-meta">${p.outlets} Outlet${currentPlanExpiry?' \u2022 Berakhir '+new Date(currentPlanExpiry).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}):''}</div>
      ${d!==null&&d>0?`<div class="set-plan-days">${d} hari lagi</div>`:''}
    </div>
    <button class="btn bsm bpill" style="border-color:${p.color};color:${p.color};white-space:nowrap;flex-shrink:0" onclick="${isTrial||isExpired?'showUpgradeModal()':'showUpgradeModal()'}">${isTrial||isExpired?'Berlangganan':'Kelola Plan'}</button>
  </div>`;
  lucide.createIcons({nodes:[el]});
}

// ===== MIDTRANS PAYMENT =====
function initMidtransPayment(plan, cycle){
  (async () => {
    const btn = g('renew-pay-btn');
    if(btn){ btn.disabled = true; btn.textContent = '⏳ Memproses...'; }
    try {
      // Get the user's auth token to authenticate with the Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if(!session) { toast('⚠️ Sesi habis, silakan login ulang.'); return; }

      // Call Edge Function to get a Snap token (Server Key stays on the server)
      const res = await fetch(SUPA_URL + '/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({ plan, cycle })
      });
      const data = await res.json();
      if(!res.ok || data.error) throw new Error(data.error || 'Gagal membuat transaksi');

      // Open Midtrans Snap popup
      window.snap.pay(data.snap_token, {
        onSuccess: async () => {
          // Payment confirmed — webhook will update Supabase.
          // Wait briefly then re-fetch subscription to reflect the new plan.
          toast('✅ Pembayaran berhasil! Mengaktifkan plan...');
          cm('m-renew'); cm('m-upgrade');
          await new Promise(r => setTimeout(r, 3500));
          await processSuccessfulPayment();
        },
        onPending: () => {
          toast('⏳ Pembayaran pending. Cek email untuk instruksi selanjutnya.');
          cm('m-renew'); cm('m-upgrade');
        },
        onError: () => {
          toast('❌ Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => { /* user dismissed popup */ }
      });
    } catch(err) {
      console.error('[payment]', err);
      toast('❌ ' + (err.message || 'Terjadi kesalahan. Coba lagi.'));
    } finally {
      if(btn){ btn.disabled = false; btn.textContent = 'Bayar Sekarang'; }
    }
  })();
}

// ===== OUTLETS =====
let _editOutletId = null;
const _OUT_COLORS=['#8DC440','#1976D2','#E53935','#F57C00','#7B1FA2','#4CAF50','#00897B','#F06292'];
// Store icon SVG (Lucide-style)
const _IC_STORE=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 9v11h14V9"/><path d="M9 21v-6h6v6"/></svg>`;

function renderOutlets(){
  const q=(g('out-srch')?.value||'').toLowerCase();
  const sort=g('out-sort')?.value||'az';
  let list=outlets.filter(o=>!q||(o.name||'').toLowerCase().includes(q)||(o.addr||'').toLowerCase().includes(q));
  list=list.slice().sort((a,b)=>{
    if(sort==='za')return (b.name||'').localeCompare(a.name||'');
    if(sort==='txn')return orders.filter(o=>o.outletId===b.id).length-orders.filter(o=>o.outletId===a.id).length;
    if(sort==='emp')return employees.filter(e=>e.oid===b.id).length-employees.filter(e=>e.oid===a.id).length;
    return (a.name||'').localeCompare(b.name||'');
  });
  const st=g('out-status-txt');
  if(st)st.textContent=`Menampilkan ${list.length} dari ${outlets.length} outlet`;
  const grid=g('outlet-grid');
  if(!grid)return;
  grid.innerHTML=list.map(o=>{
    const sc=safeColor(o.color||'#8DC440');
    const empCnt=employees.filter(e=>e.oid===o.id).length;
    const txnCnt=orders.filter(ord=>ord.outletId===o.id).length;
    const hours=o.hours||'—';
    const addr=o.addr||'—';
    return `<div class="out-card">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
        <div class="out-icon-box" style="background:${sc}18;color:${sc}">${_IC_STORE}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="width:7px;height:7px;border-radius:50%;background:#43a047;display:inline-block;flex-shrink:0"></span>
            <span style="font-size:11px;font-weight:600;color:#43a047">Aktif</span>
          </div>
          <div style="font-size:16px;font-weight:800;color:var(--t1);line-height:1.2;margin-bottom:4px">${esc(o.name)}</div>
          <div style="display:flex;align-items:flex-start;gap:5px;font-size:11px;color:var(--t2)">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${esc(addr)}</span>
          </div>
        </div>
        <div style="position:relative" id="out-more-wrap-${o.id}">
          <button onclick="_outMore('${o.id}')" style="background:none;border:1.5px solid var(--b1);border-radius:8px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
      <div style="display:flex;gap:0;padding:12px 0;border-top:1.5px solid var(--b1);border-bottom:1.5px solid var(--b1);margin-bottom:14px">
        <div class="out-stat" style="flex:1;padding-right:12px;border-right:1px solid var(--b1)">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span class="out-stat-val">${empCnt}</span>
          </div>
          <span class="out-stat-lbl">Karyawan</span>
        </div>
        <div class="out-stat" style="flex:1;padding:0 12px;border-right:1px solid var(--b1)">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="out-stat-val">${txnCnt}</span>
          </div>
          <span class="out-stat-lbl">Transaksi</span>
        </div>
        <div class="out-stat" style="flex:1;padding-left:12px">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="out-stat-val" style="font-size:11px">${esc(hours)}</span>
          </div>
          <span class="out-stat-lbl">Buka hari ini</span>
        </div>
      </div>
      <button class="btn bsm" onclick="manageOutlet('${o.id}')" style="width:100%;border:1.5px solid var(--p);color:var(--p);background:none;font-weight:600">Kelola Outlet</button>
    </div>`;
  }).join('')+`
  <div class="out-card-add" onclick="openAddOutlet()">
    <div style="width:44px;height:44px;border-radius:50%;background:var(--pl);display:flex;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
    <div style="font-size:14px;font-weight:700;color:var(--t1)">Tambah Outlet Baru</div>
    <div style="font-size:12px;color:var(--t2);text-align:center">Buat outlet / cabang baru<br>untuk bisnis Anda</div>
  </div>`;
  g('out-pager')&&(g('out-pager').innerHTML='');
}
function _outMore(id){
  const wrap=g('out-more-wrap-'+id);if(!wrap)return;
  const existing=wrap.querySelector('.out-dd');if(existing){existing.remove();return;}
  const dd=document.createElement('div');dd.className='out-dd';
  dd.innerHTML=`
    <button onclick="_outMoreClose('${id}');editOutlet('${id}')">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-2px;margin-right:6px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
    </button>
    <button onclick="_outMoreClose('${id}');manageOutlet('${id}')">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-2px;margin-right:6px"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>Kelola
    </button>
    <button class="danger" onclick="_outMoreClose('${id}');delOutlet('${id}')">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-2px;margin-right:6px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>Hapus
    </button>`;
  wrap.appendChild(dd);
  setTimeout(()=>document.addEventListener('click',function _cl(e){if(!wrap.contains(e.target)){dd.remove();document.removeEventListener('click',_cl,true);}},true),0);
}
function _outMoreClose(id){const dd=g('out-more-wrap-'+id)?.querySelector('.out-dd');if(dd)dd.remove();}
function manageOutlet(id){
  // Switch to the outlet context — navigate to orders filtered by this outlet
  const o=outlets.find(x=>x.id===id);if(!o)return;
  ordOutlet=id;oGo('orders',null);
  toast('Mengelola outlet: '+esc(o.name));
}
function _openOutletModal(){
  selOutletColor=_editOutletId?(outlets.find(x=>x.id===_editOutletId)?.color||'#8DC440'):'#8DC440';
  const cols=_OUT_COLORS;
  g('mo-colors').innerHTML=cols.map(c=>`<div onclick="selOutletColor='${c}';document.querySelectorAll('.oc').forEach(x=>{x.style.outline='none';x.style.outlineOffset='0'});this.style.outline='3px solid ${c}';this.style.outlineOffset='3px'" class="oc" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;${c===selOutletColor?`outline:3px solid ${c};outline-offset:3px`:''}"></div>`).join('');
  openModal('m-outlet');
}
function openAddOutlet(){
  _editOutletId=null;
  g('mo-title').textContent='Tambah Outlet';
  ['mo-n','mo-a','mo-h','mo-loc'].forEach(id=>{const el=g(id);if(el)el.value='';});
  if(g('mo-lat'))g('mo-lat').value='';
  if(g('mo-lng'))g('mo-lng').value='';
  if(g('mo-loc-badge'))g('mo-loc-badge').textContent='';
  if(g('mo-washing'))g('mo-washing').value=1;
  if(g('mo-drying'))g('mo-drying').value=1;
  _openOutletModal();
}
function editOutlet(id){
  const o=outlets.find(x=>x.id===id);if(!o)return;
  _editOutletId=id;
  g('mo-title').textContent='Edit Outlet';
  if(g('mo-n'))g('mo-n').value=o.name||'';
  if(g('mo-a'))g('mo-a').value=o.addr&&o.addr!=='—'?o.addr:'';
  if(g('mo-h'))g('mo-h').value=o.hours||'';
  if(g('mo-washing'))g('mo-washing').value=o.washingCount||1;
  if(g('mo-drying'))g('mo-drying').value=o.dryingCount||1;
  if(g('mo-lat'))g('mo-lat').value=o.lat||'';
  if(g('mo-lng'))g('mo-lng').value=o.lng||'';
  if(g('mo-loc'))g('mo-loc').value=(o.lat&&o.lng)?`${o.lat}, ${o.lng}`:'';
  if(g('mo-loc-badge'))g('mo-loc-badge').textContent=(o.lat&&o.lng)?`Koordinat: ${(+o.lat).toFixed(5)}, ${(+o.lng).toFixed(5)}`:'';
  _openOutletModal();
}
function saveOutlet(){
  const name=g('mo-n').value.trim();
  if(!name){toast('Nama outlet wajib diisi');return;}
  const addr=g('mo-a').value.trim()||'—';
  const hours=g('mo-h').value.trim()||'—';
  const washingCount=Math.max(1,parseInt(g('mo-washing')?.value)||1);
  const dryingCount=Math.max(1,parseInt(g('mo-drying')?.value)||1);
  const lat=g('mo-lat')?.value?parseFloat(g('mo-lat').value)||null:null;
  const lng=g('mo-lng')?.value?parseFloat(g('mo-lng').value)||null:null;
  if(_editOutletId){
    const o=outlets.find(x=>x.id===_editOutletId);
    if(o){o.name=name;o.addr=addr;o.hours=hours;o.color=selOutletColor;o.washingCount=washingCount;o.dryingCount=dryingCount;o.lat=lat;o.lng=lng;}
    syncOutlet(o);
    _editOutletId=null;
    cm('m-outlet');renderOutlets();buildEmpChips();goOutletSelect();toast('Outlet diperbarui');
    return;
  }
  const max=PLAN_LIMITS[currentPlan]||1;
  if(outlets.length>=max){cm('m-outlet');toast('Plan '+( PLANS[currentPlan]?.name||'Basic')+' maksimal '+max+' outlet');showUpgradeModal();return;}
  const newO={id:'o'+Date.now(),name,addr,hours,color:selOutletColor,washingCount,dryingCount,lat,lng};
  outlets.push(newO);syncOutlet(newO);
  cm('m-outlet');renderOutlets();buildEmpChips();goOutletSelect();toast('Outlet "'+name+'" ditambahkan');
}
function adjMachine(type,delta){
  const id='mo-'+type;const el=g(id);if(!el)return;
  el.value=Math.max(1,Math.min(20,(parseInt(el.value)||1)+delta));
}
function parseOutletLoc(val){
  const badge=g('mo-loc-badge');
  if(!val||!val.trim()){if(badge)badge.textContent='';if(g('mo-lat'))g('mo-lat').value='';if(g('mo-lng'))g('mo-lng').value='';return;}
  const coords=extractLatLng(val);
  if(coords){
    const[lat,lng]=coords;
    if(g('mo-lat'))g('mo-lat').value=lat;
    if(g('mo-lng'))g('mo-lng').value=lng;
    if(badge)badge.textContent=`Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } else {
    if(badge)badge.textContent='Format tidak dikenali. Gunakan link Google Maps atau koordinat.';
    if(g('mo-lat'))g('mo-lat').value='';if(g('mo-lng'))g('mo-lng').value='';
  }
}
function delOutlet(id){confirm_('Hapus Outlet?','Outlet ini akan dihapus permanen.',()=>{outlets=outlets.filter(x=>x.id!==id);renderOutlets();buildEmpChips();toast('Outlet dihapus');});}

// ===== NOTIFICATION CENTER =====
function _loadNotifications(){
  try{const d=localStorage.getItem(_NOTIF_KEY);if(d){
    const raw=JSON.parse(d);
    // Deduplicate legacy data: keep only 1 entry per (type+outletId) key
    const seen=new Map();
    appNotifications=raw.filter(n=>{const k=n.type+(n.outletId||'');if(seen.has(k))return false;seen.set(k,true);return true;});
  }}catch(e){appNotifications=[];}
}
function _saveNotifications(){try{localStorage.setItem(_NOTIF_KEY,JSON.stringify(appNotifications.slice(0,50)));}catch(e){}}
function _updateNotifBadge(){
  const count=appNotifications.filter(n=>!n.read).length;
  ['o-notif-badge','o-notif-badge-b','s-notif-badge','s-notif-badge-b','s-notif-badge-h'].forEach(id=>{
    const el=g(id);if(!el)return;
    if(count>0){el.textContent=count>99?'99+':count;el.style.display='flex';}
    else el.style.display='none';
  });
}
function _fmtNotifTime(iso){if(!iso)return'';try{const d=new Date(iso);return d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}catch(e){return'';}}
function markNotifRead(id){
  const n=appNotifications.find(x=>x.id===id);if(!n)return;
  n.read=true;_saveNotifications();_updateNotifBadge();
  document.querySelectorAll('[id="notif-item-'+id+'"]').forEach(el=>{el.classList.remove('notif-unread');const dot=el.querySelector('.notif-dot');if(dot)dot.style.display='none';});
}
function markAllNotifsRead(){
  appNotifications.forEach(n=>n.read=true);_saveNotifications();_updateNotifBadge();renderNotifications();
}
function clearAllNotifs(){
  appNotifications=[];_saveNotifications();_updateNotifBadge();renderNotifications();
}
function _generateNotifications(){
  // Upsert pattern: each notification type has exactly 1 slot.
  // - Condition active + body changed or was read → update & mark unread
  // - Condition active + same body + already unread → no-op
  // - Condition resolved → remove entry
  const now=new Date();let changed=false;
  function _upsert(type,outletId,title,body){
    const idx=appNotifications.findIndex(n=>n.type===type&&(outletId?n.outletId===outletId:!n.outletId));
    if(idx>=0){
      const ex=appNotifications[idx];
      if(ex.body!==body||ex.read){appNotifications[idx]={...ex,title,body,time:now.toISOString(),read:false};changed=true;}
    }else{
      appNotifications.unshift({id:'n'+Date.now()+'_'+type+(outletId||''),type,title,body,time:now.toISOString(),read:false,outletId:outletId||undefined});
      changed=true;
    }
  }
  function _resolve(type,outletId){
    const before=appNotifications.length;
    appNotifications=appNotifications.filter(n=>!(n.type===type&&(outletId?n.outletId===outletId:!n.outletId)));
    if(appNotifications.length!==before)changed=true;
  }
  // 1. WA Pending
  if(notifWaPending){const count=orders.filter(o=>o.status==='Selesai'&&!o.waSent).length;if(count>0)_upsert('wa-pending',null,'Pesanan selesai belum di WA',`Ada ${count} pesanan selesai yang belum dikirim WhatsApp.`);else _resolve('wa-pending',null);}
  // 2. Belum Lunas
  if(notifBelumLunas){const count=orders.filter(o=>o.status==='Selesai'&&o.payStatus!=='Lunas').length;if(count>0)_upsert('belum-lunas',null,'Pesanan selesai belum lunas',`Ada ${count} pesanan selesai yang belum berstatus Lunas.`);else _resolve('belum-lunas',null);}
  // 3. Proses Kosong (per outlet)
  if(notifProsesKosong){outlets.forEach(outlet=>{const mencuciCount=orders.filter(o=>o.status==='Mencuci'&&o.outletId===outlet.id).length;const pendingCount=orders.filter(o=>o.status==='Diterima'&&o.outletId===outlet.id).length;if(mencuciCount<=1&&pendingCount>0)_upsert('proses-kosong',outlet.id,'Kolom Mencuci kosong',`Kolom Mencuci di ${outlet.name} kosong selama ${notifProsesKosongDelay} menit. Segera proses ${pendingCount} pesanan yang diterima.`);else _resolve('proses-kosong',outlet.id);});}
  // 4. Durasi Lama
  if(notifDurasiLama){const nowMs=now.getTime();const lama=orders.filter(o=>{if(o.status!=='Mencuci'||!o.isoDate)return false;try{return(nowMs-new Date(o.isoDate).getTime())/60000>notifDurasiMencuci;}catch(e){return false;}});if(lama.length>0)_upsert('durasi-lama',null,'Durasi proses terlalu lama',`${lama.length} pesanan di proses Mencuci melebihi ${notifDurasiMencuci} menit.`);else _resolve('durasi-lama',null);}
  if(changed){_saveNotifications();_updateNotifBadge();const opg=g('o-p-notifications');const spg=g('s-p-notifications');if((opg&&opg.classList.contains('on'))||(spg&&spg.classList.contains('on')))renderNotifications();}
}
function _toggleNotifBtn(cbId,btnId){
  const cb=g(cbId);const btn=g(btnId);if(!cb||!btn)return;
  cb.checked=!cb.checked;
  btn.classList.toggle('on',cb.checked);btn.classList.toggle('off',!cb.checked);
}
function saveNotifSettings(){
  notifWaPending=!!g('notif-wa-pending')?.checked;
  notifProsesKosong=!!g('notif-proses-kosong')?.checked;
  notifBelumLunas=!!g('notif-belum-lunas')?.checked;
  notifDurasiLama=!!g('notif-durasi-lama')?.checked;
  notifProsesKosongDelay=parseInt(g('notif-delay')?.value)||15;
  notifDurasiMencuci=parseInt(g('notif-dur-mencuci')?.value)||100;
  notifDurasiMengeringkan=parseInt(g('notif-dur-mengeringkan')?.value)||80;
  syncSettings();toast('Pengaturan notifikasi disimpan');
}
function renderNotifications(){
  _updateNotifBadge();
  ['notif-list','s-notif-list'].forEach(listId=>{
  const el=g(listId);if(!el)return;
  if(!appNotifications.length){
    el.innerHTML=`<div style="text-align:center;padding:48px 20px;color:var(--t2)"><div style="width:48px;height:48px;border-radius:50%;background:var(--bg);border:2px solid var(--b1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><i data-lucide="bell" style="width:22px;height:22px;stroke-width:1.5;display:block;color:var(--t3)"></i></div><div style="font-size:14px;font-weight:600;margin-bottom:4px">Tidak ada notifikasi</div><div style="font-size:12px">Notifikasi operasional akan muncul di sini.</div></div>`;
    if(typeof lucide!=='undefined')lucide.createIcons();return;
  }
  const TYPE_META={
    'wa-pending':{icon:'message-circle',bg:'#EDF5D8',fg:'#6FA32E'},
    'proses-kosong':{icon:'bar-chart-2',bg:'#E3F2FD',fg:'#1565C0'},
    'belum-lunas':{icon:'file-text',bg:'#FFF8E1',fg:'#E65100'},
    'durasi-lama':{icon:'clock',bg:'#FFEBEE',fg:'#C62828'}
  };
  el.innerHTML=appNotifications.map(n=>{
    const m=TYPE_META[n.type]||{icon:'bell',bg:'var(--bg)',fg:'var(--t2)'};
    return `<div class="notif-item${n.read?'':' notif-unread'}" id="notif-item-${n.id}" onclick="markNotifRead('${n.id}')" style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--b1);cursor:pointer;background:${n.read?'var(--ca)':'var(--pl)'};transition:background .15s">
      <div style="width:38px;height:38px;border-radius:10px;background:${m.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${m.fg}"><i data-lucide="${m.icon}" style="width:18px;height:18px;stroke-width:1.75;display:block"></i></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:${n.read?'500':'700'};color:var(--t1);margin-bottom:2px">${n.title}</div>
        <div style="font-size:12px;color:var(--t2);line-height:1.5">${n.body}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <div style="font-size:11px;color:var(--t3)">${_fmtNotifTime(n.time)}</div>
        <div class="notif-dot" style="width:8px;height:8px;border-radius:50%;background:var(--p);${n.read?'display:none':''}"></div>
      </div>
    </div>`;
  }).join('');
  if(typeof lucide!=='undefined')lucide.createIcons();
  }); // end forEach listId
}

// ===== CUSTOMERS =====
// ===== MEMBERSHIP EXPIRY HELPERS =====
function todayISO(){ return new Date().toISOString().split('T')[0]; }
function fmtExpiry(iso){ if(!iso)return '—'; const [y,m,d]=iso.split('-'); return d+'/'+m+'/'+y; }
function isBalanceExpired(c){
  if(!c||!membershipExpiryEnabled||!(c.balance||0)||!c.balanceExpiry)return false;
  return c.balanceExpiry<todayISO();
}
function checkExpiredBalances(){
  if(!membershipExpiryEnabled)return;
  Object.values(customers).forEach(c=>{
    if((c.balance||0)>0&&isBalanceExpired(c)){
      const txnId='MBR-'+String(memberTxnCtr++).padStart(5,'0');
      const txn={id:txnId,phone:c.phone,type:'expired',amount:c.balance,baseAmount:null,bonusAmount:null,note:'Saldo kadaluarsa',orderId:null,time:NOW()};
      memberTxns.push(txn);syncMemberTxn(txn);
      c.balance=0;c.balanceExpiry=null;
      syncCustomer(c);
    }
  });
}

// ===== CUSTOMER PAGE — REDESIGN =====
const _C_IC_WA = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const _C_IC_CARD = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
const _C_IC_MORE = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;

function setCustFilter(f) {
  _custFilter = f; _custPage = 1;
  ['all','ada','nol'].forEach(k => { const b = g('cfb-'+k); if (b) b.className = 'cfb' + (f===k?' on':''); });
  renderCusts();
}
function setCustPage(p) { _custPage = Math.max(1, p); renderCusts(); }

function renderCusts() {
  const q = (g('cust-srch')?.value||'').toLowerCase();
  _renderCustSummary();
  const all = Object.values(customers);
  const list = all.filter(c => {
    const matchQ = !q || (c.name||'').toLowerCase().includes(q) || (c.phone||'').includes(q);
    const bal = c.balance||0;
    const matchF = _custFilter==='all' || (_custFilter==='ada'&&bal>0) || (_custFilter==='nol'&&bal<=0);
    return matchQ && matchF;
  }).sort((a,b) => (b.lastDate||'').localeCompare(a.lastDate||'') || (a.name||'').localeCompare(b.name||''));
  const _PER = 10;
  const _tp = Math.max(1, Math.ceil(list.length/_PER));
  if (_custPage > _tp) _custPage = _tp;
  const paged = list.slice((_custPage-1)*_PER, _custPage*_PER);
  _renderCustTable(paged);
  _renderCustCards(paged);
  _renderCustPager(list.length, _tp);
}

function _renderCustSummary() {
  const wrap = g('cust-summary'); if (!wrap) return;
  if (!membershipEnabled) { wrap.style.display='none'; return; }
  wrap.style.display = '';
  const all = Object.values(customers);
  const totalBal = all.reduce((s,c) => s+(c.balance||0), 0);
  const withBal = all.filter(c => (c.balance||0)>0).length;
  const zeroBal = all.length - withBal;
  wrap.innerHTML = `
    <div class="cust-sum-card">
      <div style="font-size:10px;font-weight:700;color:var(--t2);letter-spacing:.06em;margin-bottom:6px;text-transform:uppercase">Total Saldo</div>
      <div style="font-size:20px;font-weight:800;color:var(--p)">${fmt(totalBal)}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:2px">dari ${all.length} pelanggan</div>
    </div>
    <div class="cust-sum-card">
      <div style="font-size:10px;font-weight:700;color:var(--t2);letter-spacing:.06em;margin-bottom:6px;text-transform:uppercase">Ada Saldo</div>
      <div style="font-size:20px;font-weight:800;color:var(--p)">${withBal}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:2px">${all.length?Math.round(withBal/all.length*100):0}% dari total</div>
    </div>
    <div class="cust-sum-card">
      <div style="font-size:10px;font-weight:700;color:var(--t2);letter-spacing:.06em;margin-bottom:6px;text-transform:uppercase">Saldo 0</div>
      <div style="font-size:20px;font-weight:800;color:var(--t2)">${zeroBal}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:2px">${all.length?Math.round(zeroBal/all.length*100):0}% dari total</div>
    </div>`;
}

function _renderCustTable(list) {
  const tb = g('cust-tb'); if (!tb) return;
  if (!list.length) { tb.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--t2)">Tidak ada pelanggan ditemukan</td></tr>`; return; }
  try { tb.innerHTML = list.map(c => {
    const initials = (c.name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
    const bal = c.balance||0;
    let balCell = '—';
    if (membershipEnabled) {
      let bHtml = bal>0 ? `<span style="font-weight:700;color:var(--p);font-size:14px">${fmt(bal)}</span>` : `<span style="color:var(--t2);font-size:14px">Rp 0</span>`;
      if (membershipExpiryEnabled&&bal>0&&c.balanceExpiry) {
        const dl=Math.round((new Date(c.balanceExpiry+'T00:00:00')-new Date(todayISO()+'T00:00:00'))/86400000);
        const ec=dl<0?'var(--re,#c62828)':dl<=7?'var(--amb,#e65100)':'var(--t2)';
        bHtml+=`<div style="font-size:10px;color:${ec};margin-top:1px">${dl<0?'Kadaluarsa':'sd '+fmtExpiry(c.balanceExpiry)}</div>`;
      }
      balCell = bHtml;
    }
    const acts = membershipEnabled
      ? `<div style="display:flex;gap:5px;align-items:center">
           <button class="btn bsm bp" onclick="openMemberDeposit('${esc(c.phone)}')" style="gap:4px">+ Deposit</button>
           <button class="btn bsm" onclick="openSendMemberCard('${esc(c.phone)}')" title="Membership Card" style="padding:5px 8px">${_C_IC_CARD}</button>
           <button class="btn bsm bwa" onclick="openWa('${esc(c.phone)}','')" title="WhatsApp" style="padding:5px 8px">${_C_IC_WA}</button>
           <div style="position:relative" id="cmw-${esc(c.phone)}"><button class="btn bsm" onclick="_custMoreMenu('${esc(c.phone)}')" style="padding:5px 8px">${_C_IC_MORE}</button></div>
         </div>`
      : `<div style="display:flex;gap:5px;align-items:center">
           <button class="btn bsm" onclick="openEditCust('${esc(c.phone)}')">Edit</button>
           <button class="btn bsm bwa" onclick="openWa('${esc(c.phone)}','')" title="WhatsApp" style="padding:5px 8px">${_C_IC_WA}</button>
           <div style="position:relative" id="cmw-${esc(c.phone)}"><button class="btn bsm" onclick="_custMoreMenu('${esc(c.phone)}')" style="padding:5px 8px">${_C_IC_MORE}</button></div>
         </div>`;
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="cust-av">${initials}</div>
        <div><div class="cust-name">${esc(c.name)}</div><div class="cust-ph">${esc(c.phone||'—')}</div></div>
      </div></td>
      <td><div style="font-weight:700;font-size:14px">${fmt(c.total||0)}</div><div style="font-size:11px;color:var(--t2);margin-top:1px">${c.orders||0} transaksi</div></td>
      <td>${balCell}</td>
      <td style="font-size:12px;color:var(--t2);white-space:nowrap">${esc(c.lastDate||'—')}</td>
      <td>${acts}</td>
    </tr>`;
  }).join(''); } catch(e) { console.error('[renderCusts table]', e); tb.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--re,#c62828)">Error rendering. Coba refresh halaman.</td></tr>`; }
}

function _renderCustCards(list) {
  const wrap = g('cust-cards'); if (!wrap) return;
  const IC_WA14 = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  const IC_CARD14 = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
  const IC_MORE14 = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
  if (!list.length) { wrap.innerHTML=`<div style="text-align:center;padding:32px;color:var(--t2);font-size:13px">Tidak ada pelanggan ditemukan</div>`; return; }
  try { wrap.innerHTML = list.map(c => {
    const initials = (c.name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
    const bal = c.balance||0;
    const balBadge = membershipEnabled ? `<div style="font-size:${bal>0?'15px':'13px'};font-weight:${bal>0?'800':'500'};color:${bal>0?'var(--p)':'var(--t2)'};">${fmt(bal)}</div><div style="font-size:10px;color:var(--t2)">${bal>0?'Saldo aktif':'Tidak ada saldo'}</div>` : '';
    return `<div class="cust-card">
      <div class="cust-card-top">
        <div class="cust-av">${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="cust-name">${esc(c.name)}</div>
          <div class="cust-ph">${esc(c.phone||'—')}</div>
        </div>
        ${membershipEnabled?`<div style="text-align:right">${balBadge}</div>`:''}
      </div>
      <div class="cust-card-meta">
        <span>${fmt(c.total||0)}</span>
        <span style="color:var(--b1)">•</span>
        <span>${c.orders||0} transaksi</span>
        <span style="color:var(--b1)">•</span>
        <span>${esc(c.lastDate||'—')}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        ${membershipEnabled?`<button class="btn bsm bp" onclick="openMemberDeposit('${esc(c.phone)}')" style="gap:4px">+ Deposit</button><button class="btn bsm" onclick="openSendMemberCard('${esc(c.phone)}')" style="gap:4px;padding:5px 9px">${IC_CARD14}</button>`:''}
        <button class="btn bsm bwa" onclick="openWa('${esc(c.phone)}','')" style="gap:4px;padding:5px 9px">${IC_WA14}</button>
        <div style="position:relative" id="cmm-${esc(c.phone)}"><button class="btn bsm" onclick="_custMoreMenu('${esc(c.phone)}')" style="padding:5px 8px">${IC_MORE14}</button></div>
      </div>
    </div>`;
  }).join(''); } catch(e) { console.error('[renderCusts cards]', e); wrap.innerHTML=`<div style="text-align:center;padding:32px;color:var(--re,#c62828);font-size:13px">Error rendering. Coba refresh halaman.</div>`; }
}

function _renderCustPager(total, totalPages) {
  const wrap = g('cust-pager'); if (!wrap) return;
  if (totalPages <= 1) { wrap.innerHTML = ''; return; }
  const p = _custPage;
  let btns = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i===1||i===totalPages||(i>=p-1&&i<=p+1)) btns+=`<button class="btn bsm${i===p?' bp':''}" onclick="setCustPage(${i})" style="min-width:32px;padding:4px 8px">${i}</button>`;
    else if (i===p-2||i===p+2) btns+=`<span style="align-self:center;color:var(--t2);padding:0 2px;font-size:13px">…</span>`;
  }
  wrap.innerHTML = `<div style="display:flex;align-items:center;gap:5px;justify-content:center;padding:12px 16px;border-top:1px solid var(--b1);flex-wrap:wrap">
    <span style="font-size:11px;color:var(--t2);margin-right:4px">${total} pelanggan</span>
    <button class="btn bsm" onclick="setCustPage(${p-1})" ${p===1?'disabled':''} style="min-width:32px;padding:4px 8px">‹</button>
    ${btns}
    <button class="btn bsm" onclick="setCustPage(${p+1})" ${p===totalPages?'disabled':''} style="min-width:32px;padding:4px 8px">›</button>
  </div>`;
}

function _custMoreMenu(phone) {
  document.querySelectorAll('.cust-dd').forEach(d => d.remove());
  const anchor = g('cmw-'+phone) || g('cmm-'+phone); if (!anchor) return;
  const c = customers[phone];
  const items = [
    {label:'Edit', fn:`openEditCust('${phone}')`},
    ...(membershipEnabled?[{label:'Riwayat Saldo', fn:`openMemberTxnHistory('${phone}')`}]:[]),
    {label:'Simpan Kontak', fn:`_custSaveContact('${phone}')`},
  ];
  const dd = document.createElement('div');
  dd.className = 'cust-dd';
  dd.style.cssText = 'position:absolute;right:0;top:calc(100% + 4px);background:var(--ca);border:1.5px solid var(--b1);border-radius:10px;box-shadow:var(--sh2);z-index:300;min-width:160px;overflow:hidden';
  dd.innerHTML = items.map(it=>`<button style="display:block;width:100%;text-align:left;padding:9px 14px;background:none;border:none;cursor:pointer;font-size:13px;font-family:inherit;color:var(--t1);transition:background .1s" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="document.querySelectorAll('.cust-dd').forEach(d=>d.remove());${it.fn}">${it.label}</button>`).join('');
  anchor.appendChild(dd);
  setTimeout(()=>document.addEventListener('click',function _cl(e){if(!anchor.contains(e.target)){dd.remove();document.removeEventListener('click',_cl);}},true),0);
}
function _custSaveContact(phone) { const c=customers[phone]; if(c) saveToContacts(c.phone,c.name); }

// ===== MEMBERSHIP CARD SEND MODAL HELPERS =====
function _setMsgPreset(type) {
  if (!_cardSendCust) return;
  const c=_cardSendCust; const bal=fmt(c.balance||0); const store=storeName||'CleanPOS Laundry';
  const msgs = {
    saldo:`Halo *${c.name}*!\n\nBerikut kartu membership kamu.\nSaldo saat ini: *${bal}*\n\nTerima kasih telah menjadi pelanggan setia kami!\n— ${store}`,
    promo:`Halo *${c.name}*!\n\nKami punya promo spesial untuk kamu.\nSaldo kamu saat ini: *${bal}*\n\nYuk gunakan sekarang!\n— ${store}`,
    reminder:`Halo *${c.name}*!\n\nSaldo laundry kamu saat ini: *${bal}*\n\nJangan lupa untuk melakukan laundry ya!\n— ${store}`,
  };
  const ta=g('card-wa-msg'); if(ta){ta.value=msgs[type]||'';_scUpdateCharCount();}
}
function _scUpdateCharCount() {
  const ta=g('card-wa-msg'); const cc=g('sc-char-count');
  if(ta&&cc) cc.textContent=(ta.value.length)+' / 500';
}

// ===== EXPORT TO DEVICE CONTACT =====
function saveToContacts(phone, name) {
  const tel = '+' + fmtPh(phone);
  const vcf = 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:' + name + '\r\nTEL;TYPE=CELL:' + tel + '\r\nEND:VCARD';
  const blob = new Blob([vcf], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.replace(/\s+/g, '_') + '.vcf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('📥 Buka file .vcf untuk simpan kontak');
}

// ===== IMPORT CONTACTS =====
async function importContacts(){
  // Try Contact Picker API (Android Chrome 80+)
  if(navigator.contacts&&navigator.contacts.select){
    try{
      const raw=await navigator.contacts.select(['name','tel'],{multiple:true});
      _importContactList(raw.map(function(c){return{name:(c.name&&c.name[0])||'',phone:(c.tel&&c.tel[0])||''};}));
      return;
    }catch(e){
      if(e.name==='AbortError')return; // user cancelled
      // other error: fall through to file picker
    }
  }
  // Fallback: VCF file picker
  var inp=document.createElement('input');
  inp.type='file';inp.accept='.vcf,text/vcard';inp.multiple=true;
  inp.onchange=async function(){
    var contacts=[];
    for(var i=0;i<inp.files.length;i++){
      var text=await inp.files[i].text();
      contacts=contacts.concat(_parseVcf(text));
    }
    _importContactList(contacts);
  };
  inp.click();
}

function _parseVcf(text){
  var contacts=[];
  var blocks=text.replace(/\r\n|\r/g,'\n').split(/BEGIN:VCARD/i).slice(1);
  for(var b=0;b<blocks.length;b++){
    var name='',phone='';
    var lines=blocks[b].split('\n');
    for(var l=0;l<lines.length;l++){
      var line=lines[l],up=line.toUpperCase();
      if(up.startsWith('FN:')){name=line.slice(3).trim();}
      else if(!name&&up.startsWith('N:')){
        var parts=line.slice(2).split(';');
        name=([parts[1],parts[0]].filter(Boolean).join(' ')).trim();
      }else if(!phone&&(up.startsWith('TEL')||up.indexOf('TEL;')!==-1)){
        var colon=line.indexOf(':');
        if(colon!==-1){phone=line.slice(colon+1).replace(/[\s\-\(\)\.]/g,'').trim();}
      }
    }
    if(name&&phone)contacts.push({name:name,phone:phone});
  }
  return contacts;
}

function _importContactList(list){
  var added=0,skipped=0;
  for(var i=0;i<list.length;i++){
    var c=list[i];
    if(!c.name||!c.phone){skipped++;continue;}
    var phone=c.phone.replace(/[^\d+]/g,'');
    if(!phone){skipped++;continue;}
    if(customers[phone]){skipped++;continue;}
    customers[phone]={name:c.name,phone:phone,orders:0,total:0,balance:0,lastDate:TODAY_STR};
    syncCustomer(customers[phone]);
    added++;
  }
  renderCusts();
  if(curRole==='staff')renderMembership();
  toast(added>0?'✅ '+added+' kontak ditambahkan'+(skipped>0?', '+skipped+' dilewati':''):'⚠️ Tidak ada kontak baru'+(skipped>0?' ('+skipped+' sudah terdaftar)':''));
}

// ===== ADD CUSTOMER =====
function openAddCust(){
  if(g('ac-name'))g('ac-name').value='';
  if(g('ac-phone'))g('ac-phone').value='';
  openModal('m-add-cust');
  setTimeout(()=>g('ac-name')?.focus(),100);
}
function saveNewCust(){
  const name=(g('ac-name')?.value||'').trim();
  if(!name){toast('⚠️ Nama pelanggan wajib diisi');return;}
  const phone=(g('ac-phone')?.value||'').trim()||'—';
  if(phone!=='—'&&customers[phone]){toast('⚠️ Nomor WA sudah terdaftar: '+customers[phone].name);return;}
  const key=phone==='—'?('cust-'+Date.now()):phone;
  customers[key]={name,phone:key,orders:0,total:0,balance:0,lastDate:TODAY_STR};
  syncCustomer(customers[key]);
  cm('m-add-cust');
  renderCusts();
  toast('✅ Pelanggan '+name+' berhasil ditambahkan');
  if(membershipEnabled) setTimeout(()=>openMemberDeposit(key),300);
}

// ===== EDIT CUSTOMER =====
let _ecOldPhone=null;
function openEditCust(phone){
  const c=customers[phone];if(!c)return;
  _ecOldPhone=phone;
  if(g('ec-name'))g('ec-name').value=c.name;
  if(g('ec-phone'))g('ec-phone').value=(phone==='—'||/^cust-/.test(phone))?'':phone;
  if(g('ec-address'))g('ec-address').value=c.address||'';
  const hasCoords=c.lat&&c.lng;
  if(g('ec-gmaps'))g('ec-gmaps').value=hasCoords?`${c.lat}, ${c.lng}`:'';
  const link=g('ec-gmaps-link');
  if(link){
    if(hasCoords){link.href=`https://www.google.com/maps?q=${c.lat},${c.lng}`;link.style.display='';}
    else{link.href='#';link.style.display='none';}
  }
  openModal('m-edit-cust');
  setTimeout(()=>g('ec-name')?.focus(),100);
}
async function saveEditCust(){
  const name=(g('ec-name')?.value||'').trim();
  if(!name){toast('⚠️ Nama pelanggan wajib diisi');return;}
  const newPhone=(g('ec-phone')?.value||'').trim()||_ecOldPhone;
  // Check duplicate only if phone actually changed
  if(newPhone!==_ecOldPhone&&customers[newPhone]){toast('⚠️ Nomor WA sudah terdaftar: '+customers[newPhone].name);return;}
  const c=customers[_ecOldPhone];if(!c)return;
  // Parse address & coordinates (support short Maps URLs)
  const address=(g('ec-address')?.value||'').trim()||null;
  const gmapsVal=(g('ec-gmaps')?.value||'').trim();
  let lat=null,lng=null;
  if(gmapsVal){
    if(_isShortMapsUrl(gmapsVal)){
      toast('Mengambil koordinat dari link...');
      const coords=await resolveLatLng(gmapsVal);
      if(coords){lat=coords[0];lng=coords[1];}
      else toast('Koordinat tidak ditemukan. Coba salin koordinat langsung (lat,lng).');
    } else {
      const coords=extractLatLng(gmapsVal);
      if(coords){lat=coords[0];lng=coords[1];}
    }
  }
  // If phone changed, re-key in customers object
  if(newPhone!==_ecOldPhone){
    customers[newPhone]={...c,name,phone:newPhone,address,lat,lng};
    delete customers[_ecOldPhone];
    // Update all orders referencing the old phone
    orders.forEach(o=>{if(o.phone===_ecOldPhone)o.phone=newPhone;});
    // Update member transactions
    memberTxns.forEach(t=>{if(t.phone===_ecOldPhone)t.phone=newPhone;});
    syncCustomer(customers[newPhone]);
    sbDelete('customers',_ecOldPhone);
  } else {
    c.name=name;c.address=address;c.lat=lat;c.lng=lng;
    syncCustomer(c);
  }
  cm('m-edit-cust');
  renderCusts();
  toast('✅ Data pelanggan diperbarui');
}

// ===== MEMBERSHIP =====
let _mdPhone=null;

let _selectedPkg=null;
function openMemberDeposit(phone){
  const c=customers[phone];if(!c)return;
  _mdPhone=phone;_selectedPkg=null;
  if(g('md-title'))g('md-title').textContent='Deposit Member';
  if(g('md-cust-info'))g('md-cust-info').innerHTML=`<span style="font-weight:700">${esc(c.name)}</span> <span style="color:var(--t2)">${esc(phone)}</span><br><span style="font-size:12px;color:var(--t2)">Saldo saat ini: <strong style="color:var(--p)">${fmt(c.balance||0)}</strong></span>`;
  if(g('md-note'))g('md-note').value='';
  const isPkg=membershipStyle==='package';
  if(g('md-deposit-mode'))g('md-deposit-mode').style.display=isPkg?'none':'';
  if(g('md-package-mode'))g('md-package-mode').style.display=isPkg?'':'none';
  if(isPkg){
    renderDepositPackages();
  } else {
    if(g('md-amount'))g('md-amount').value='';
    if(g('md-preview'))g('md-preview').style.display='none';
    // Show min deposit hint if set
    const mh=g('md-min-hint');
    if(mh){mh.style.display=membershipMinDeposit>0?'':'none';if(membershipMinDeposit>0&&g('md-min-lbl'))g('md-min-lbl').textContent=fmt(membershipMinDeposit);}
  }
  openModal('m-member-deposit');
  if(!isPkg)setTimeout(()=>g('md-amount')?.focus(),100);
}

function renderDepositPackages(){
  const el=g('md-pkg-picker');if(!el)return;
  if(!membershipPackages.length){
    el.innerHTML='<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Belum ada paket tersedia. Tambahkan di Pengaturan.</div>';
    return;
  }
  el.innerHTML=membershipPackages.map(p=>`<div id="md-pkg-${esc(p.id)}" onclick="selectDepositPkg('${esc(p.id)}')" style="padding:12px 14px;border:2px solid var(--b1);border-radius:var(--rs);background:var(--ca);margin-bottom:8px;cursor:pointer;transition:border-color .15s,background .15s"><div style="font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${esc(p.name)}</div><div style="display:flex;gap:16px;flex-wrap:wrap"><div style="font-size:12px"><div style="color:var(--t2)">Harga</div><strong>${fmt(p.price)}</strong></div><div style="font-size:12px"><div style="color:var(--t2)">Bonus</div><strong style="color:var(--p)">+${fmt(p.bonus)}</strong></div><div style="font-size:12px"><div style="color:var(--t2)">Saldo Masuk</div><strong style="color:var(--p)">${fmt(p.price+p.bonus)}</strong></div>${p.expiryDays>0?`<div style="font-size:12px"><div style="color:var(--t2)">Masa Berlaku</div><strong>${p.expiryDays} Hari</strong></div>`:''}</div></div>`).join('');
}

function selectDepositPkg(id){
  _selectedPkg=membershipPackages.find(p=>p.id===id)||null;
  membershipPackages.forEach(p=>{
    const el=g('md-pkg-'+p.id);if(!el)return;
    if(p.id===id){el.style.borderColor='var(--p)';el.style.background='var(--pl,rgba(141,196,64,.12))';}
    else{el.style.borderColor='var(--b1)';el.style.background='var(--ca)';}
  });
}

function calcDepositPreview(){
  const base=parseInt(g('md-amount')?.value)||0;
  const prev=g('md-preview');
  if(!base||base<=0){if(prev)prev.style.display='none';return;}
  const bonus=Math.round(base*(membershipBonus/100));
  const total=base+bonus;
  if(g('md-base-lbl'))g('md-base-lbl').textContent=fmt(base);
  const bonusRow=g('md-bonus-row');
  if(bonusRow)bonusRow.style.display=membershipBonus>0?'':'none';
  if(g('md-bonus-lbl'))g('md-bonus-lbl').textContent=`Bonus (${membershipBonus}%)`;
  if(g('md-bonus-amt'))g('md-bonus-amt').textContent=`+ ${fmt(bonus)}`;
  if(g('md-total-lbl'))g('md-total-lbl').textContent=fmt(total);
  if(prev)prev.style.display='';
}

function saveDeposit(){
  const c=customers[_mdPhone];if(!c)return;
  const note=(g('md-note')?.value||'').trim();
  const payMethod=(g('md-pay-method')?.value||'Tunai');
  let base,bonus,credited,expiryDays=null;

  if(membershipStyle==='package'){
    if(!_selectedPkg){toast('⚠️ Pilih paket terlebih dahulu');return;}
    base=_selectedPkg.price;
    bonus=_selectedPkg.bonus;
    credited=base+bonus;
    expiryDays=_selectedPkg.expiryDays>0?_selectedPkg.expiryDays:null;
  } else {
    base=parseInt(g('md-amount')?.value)||0;
    if(!base||base<=0){toast('⚠️ Masukkan jumlah deposit');return;}
    if(membershipMinDeposit>0&&base<membershipMinDeposit){
      toast('⚠️ Minimum deposit '+fmt(membershipMinDeposit)+'. Jumlah terlalu kecil.');return;
    }
    bonus=Math.round(base*(membershipBonus/100));
    credited=base+bonus;
    if(membershipExpiryEnabled)expiryDays=membershipExpiryDays;
  }

  const txnId='MBR-'+String(memberTxnCtr++).padStart(5,'0');
  const txn={id:txnId,phone:_mdPhone,type:'deposit',amount:credited,baseAmount:base,bonusAmount:bonus,note:note||null,orderId:null,time:NOW()};
  memberTxns.push(txn);
  c.balance=(c.balance||0)+credited;
  if(expiryDays){
    const _exp=new Date();_exp.setDate(_exp.getDate()+expiryDays);
    c.balanceExpiry=_exp.toISOString().split('T')[0];
  }
  syncMemberTxn(txn);
  syncCustomer(c);
  if(payMethod==='Tunai'){
    const kasEntry={id:kasCtr++,type:'in',desc:'Deposit Member – '+c.name,note:note||null,amount:base,time:NOW(),date:TODAY_ISO,outletId:curStaff?.oid||curOutlet?.id||(outlets[0]?.id||'')};
    kasLog.push(kasEntry);
    syncKas(kasEntry);
  }
  cm('m-member-deposit');
  renderCusts();
  if(curRole==='staff')renderMembership();
  toast('✅ Deposit '+fmt(credited)+' berhasil'+(bonus>0?' (bonus '+fmt(bonus)+')':''));
}

function openMemberTxnHistory(phone){
  const c=customers[phone];if(!c)return;
  if(g('mt-title'))g('mt-title').textContent='Riwayat – '+c.name;
  if(g('mt-cust-info'))g('mt-cust-info').textContent=phone;
  if(g('mt-balance'))g('mt-balance').textContent=fmt(c.balance||0);
  const txns=memberTxns.filter(t=>t.phone===phone).slice().reverse();
  const list=g('mt-list');if(!list)return;
  if(!txns.length){list.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2);font-size:13px">Belum ada riwayat transaksi</div>';}
  else{
    list.innerHTML=txns.map(t=>{
      const isDeposit=t.type==='deposit';
      const isExpired=t.type==='expired';
      const color=isDeposit?'var(--p)':'var(--re)';
      const sign=isDeposit?'+':'-';
      const typeLabel=isDeposit?'Deposit':isExpired?'Saldo Kadaluarsa':'Bayar Pesanan';
      const sub=isDeposit&&t.bonusAmount?`<div style="font-size:11px;color:var(--t2)">Bayar: ${fmt(t.baseAmount)} + Bonus: ${fmt(t.bonusAmount)}</div>`:t.orderId?`<div style="font-size:11px;color:var(--t2)">${esc(t.orderId)}</div>`:'';
      const delBtn=curRole==='owner'&&isDeposit?`<button class="btn bre bsm" onclick="deleteMemberDeposit('${esc(t.id)}','${esc(phone)}',${t.amount})">Hapus</button>`:'';
      return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--b1)"><div style="flex:1"><div style="font-weight:600;font-size:13px">${typeLabel}</div>${sub}<div style="font-size:11px;color:var(--t3);margin-top:2px">${esc(t.time)}${t.note?` · ${esc(t.note)}`:''}</div></div><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:15px;color:${color}">${sign}${fmt(t.amount)}</span>${delBtn}</div></div>`;
    }).join('');
  }
  openModal('m-member-txn');
}

function deleteMemberDeposit(txnId,phone,amount){
  confirm_('Hapus Deposit?',`Saldo ${fmt(amount)} akan dikurangi dari akun ${customers[phone]?.name||phone}.`,()=>{
    const idx=memberTxns.findIndex(t=>t.id===txnId);if(idx<0)return;
    const c=customers[phone];
    if(c)c.balance=Math.max(0,(c.balance||0)-amount);
    memberTxns.splice(idx,1);
    deleteMemberTxn(txnId);
    if(c)syncCustomer(c);
    cm('m-member-txn');
    renderCusts();
    toast('Deposit dihapus');
  });
}

function renderMembership(){
  const disEl=g('s-mbr-disabled');
  const conEl=g('s-mbr-content');
  if(!membershipEnabled){
    if(disEl)disEl.style.display='';
    if(conEl)conEl.style.display='none';
    return;
  }
  if(disEl)disEl.style.display='none';
  if(conEl)conEl.style.display='';
  const q=(g('s-mbr-srch')?.value||'').toLowerCase();
  const list=Object.values(customers).filter(c=>!q||c.name.toLowerCase().includes(q)||c.phone.includes(q));
  const el=g('s-mbr-list');if(!el)return;
  if(!list.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2)">Tidak ada pelanggan</div>';return;}
  el.innerHTML=list.map(c=>{
    const bal=c.balance||0;
    let exHtml='';
    if(membershipExpiryEnabled&&bal>0&&c.balanceExpiry){
      const today=todayISO();
      const daysLeft=Math.round((new Date(c.balanceExpiry+'T00:00:00')-new Date(today+'T00:00:00'))/(86400000));
      let exColor=daysLeft<0?'var(--re,#c62828)':daysLeft<=7?'var(--amb,#e65100)':'var(--gr,#2e7d32)';
      exHtml=`<div style="font-size:10px;color:${exColor};margin-top:1px">${daysLeft<0?'Kadaluarsa':'sd '+fmtExpiry(c.balanceExpiry)}</div>`;
    }
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--b1);border-radius:var(--rs);background:var(--ca);margin-bottom:8px"><div style="flex:1"><div style="font-weight:700;font-size:14px">${esc(c.name)}</div><div style="font-size:12px;color:var(--t2)">${esc(c.phone)}</div></div><div style="text-align:right;margin-right:8px"><div style="font-size:11px;color:var(--t2)">Saldo</div><div style="font-weight:800;font-size:16px;color:var(--p)">${fmt(bal)}</div>${exHtml}</div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn bsm" onclick="openSendMemberCard('${esc(c.phone)}')" title="Kirim Saldo / Kartu" style="padding-left:6px;padding-right:6px">🎫</button><button class="btn bp bsm" onclick="openMemberDeposit('${esc(c.phone)}')">+ Deposit</button><button class="btn bsm" onclick="openEditCust('${esc(c.phone)}')">Edit</button></div></div>`;
  }).join('');
}

function toggleMembership(){
  if((currentPlan!=='elite'&&currentPlan!=='enterprise')||currentPlanStatus!=='active'){showUpgradeModal();return;}
  membershipEnabled=!membershipEnabled;
  renderSettings();
  syncSettings();
  toast(membershipEnabled?'✅ Membership diaktifkan':'Membership dinonaktifkan');
}

function saveMembershipSettings(){
  if(membershipStyle==='deposit'){
    const v=parseInt(g('s-mbr-bonus')?.value);
    if(isNaN(v)||v<0||v>100){toast('⚠️ Bonus harus antara 0–100%');return;}
    membershipBonus=v;
    const md=parseInt(g('s-mbr-min-deposit')?.value)||0;
    if(md<0){toast('⚠️ Minimum deposit tidak boleh negatif');return;}
    membershipMinDeposit=md;
    if(membershipExpiryEnabled){
      const ed=parseInt(g('s-mbr-expiry-days')?.value);
      if(isNaN(ed)||ed<1||ed>365){toast('⚠️ Masa berlaku harus antara 1–365 hari');return;}
      membershipExpiryDays=ed;
    }
  }
  syncSettings();
  toast('✅ Pengaturan membership tersimpan!');
}

function switchMembershipStyle(style){
  membershipStyle=style;
  renderSettings();
  syncSettings();
}

// ===== MEMBERSHIP PACKAGES =====
function renderMbrPackages(){
  const el=g('mbr-pkg-list');if(!el)return;
  if(!membershipPackages.length){
    el.innerHTML='<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px;border:2px dashed var(--b1);border-radius:10px">Belum ada paket. Klik "+ Tambah Paket" untuk membuat paket.</div>';
    return;
  }
  el.innerHTML=membershipPackages.map(p=>`<div style="display:flex;align-items:stretch;gap:12px;padding:12px 14px;border:1px solid var(--b1);border-radius:var(--rs);background:var(--ca);margin-bottom:8px"><div style="flex:1"><div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">${esc(p.name)}</div><div style="font-size:12px;color:var(--t2);line-height:1.9">Harga <strong style="color:var(--t1)">${fmt(p.price)}</strong> &nbsp;·&nbsp; Bonus <strong style="color:var(--p)">${fmt(p.bonus)}</strong> &nbsp;·&nbsp; Masa Berlaku <strong>${p.expiryDays>0?p.expiryDays+' Hari':'Tanpa Batas'}</strong></div></div><div style="display:flex;flex-direction:column;gap:5px;justify-content:center"><button class="btn bsm" onclick="openAddMbrPackage('${esc(p.id)}')">Edit</button><button class="btn bre bsm" onclick="deleteMbrPackage('${esc(p.id)}')">Hapus</button></div></div>`).join('');
}

let _editPkgId=null;
function openAddMbrPackage(id){
  _editPkgId=id||null;
  const pkg=id?membershipPackages.find(p=>p.id===id):null;
  if(g('mpkg-title'))g('mpkg-title').textContent=pkg?'Edit Paket':'Tambah Paket';
  if(g('mpkg-name'))g('mpkg-name').value=pkg?pkg.name:'';
  if(g('mpkg-price'))g('mpkg-price').value=pkg?pkg.price:'';
  if(g('mpkg-bonus'))g('mpkg-bonus').value=pkg?pkg.bonus:'';
  if(g('mpkg-expiry'))g('mpkg-expiry').value=pkg?pkg.expiryDays:'';
  openModal('m-mbr-pkg');
  setTimeout(()=>g('mpkg-name')?.focus(),100);
}

function saveMbrPackage(){
  const name=(g('mpkg-name')?.value||'').trim();
  if(!name){toast('⚠️ Nama paket wajib diisi');return;}
  const price=parseInt(g('mpkg-price')?.value)||0;
  if(price<=0){toast('⚠️ Harga paket harus lebih dari 0');return;}
  const bonus=parseInt(g('mpkg-bonus')?.value)||0;
  const expiryDays=parseInt(g('mpkg-expiry')?.value)||0;
  if(_editPkgId){
    const pkg=membershipPackages.find(p=>p.id===_editPkgId);
    if(pkg){pkg.name=name;pkg.price=price;pkg.bonus=bonus;pkg.expiryDays=expiryDays;}
  } else {
    membershipPackages.push({id:'pkg'+String(membershipPkgCtr++).padStart(3,'0'),name,price,bonus,expiryDays});
  }
  cm('m-mbr-pkg');
  renderMbrPackages();
  syncSettings();
  toast('✅ Paket '+(name)+' disimpan');
}

function deleteMbrPackage(id){
  const pkg=membershipPackages.find(p=>p.id===id);if(!pkg)return;
  confirm_('Hapus Paket?','Paket "'+pkg.name+'" akan dihapus.',()=>{
    membershipPackages=membershipPackages.filter(p=>p.id!==id);
    renderMbrPackages();
    syncSettings();
    toast('Paket dihapus');
  });
}

function toggleMembershipExpiry(){
  if((currentPlan!=='elite'&&currentPlan!=='enterprise')||currentPlanStatus!=='active'){showUpgradeModal();return;}
  membershipExpiryEnabled=!membershipExpiryEnabled;
  if(membershipExpiryEnabled)checkExpiredBalances();
  renderSettings();
  renderCusts();
  syncSettings();
  toast(membershipExpiryEnabled?'✅ Masa berlaku saldo diaktifkan':'Masa berlaku saldo dinonaktifkan');
}

// ===== PRICING & ADDONS =====
function _activePoOptions(cat){return priceOptions.filter(po=>cat==='kiloan'?po.activeKiloan!==false:cat==='satuan'?po.activeSatuan!==false:(po.activeKiloan!==false||po.activeSatuan!==false)).sort((a,b)=>(a.order||0)-(b.order||0));}
function _getPoLabel(key){return priceOptions.find(po=>po.key===key)?.label||key;}
function _getPoEst(key){return priceOptions.find(po=>po.key===key)?.est||'';}
function _minPrice(prices,cat){const vals=_activePoOptions(cat).map(po=>prices?.[po.key]||0).filter(v=>v>0);return vals.length?Math.min(...vals):0;}

// ─── Main entry ───
function renderPricing(){
  _renderPricingTab(_pricingTab);
  buildOrderTypeDropdowns();
  rebuildPromoSvcSelect();
  _noRebuildSvcCards();
  _noRebuildTierCards();
}

function setPricingTab(tab, btn){
  _pricingTab=tab;
  document.querySelectorAll('.ptab-btn').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  ['kiloan','satuan','tambahan'].forEach(t=>{const p=g('ptab-'+t);if(p)p.classList.toggle('on',t===tab);});
  _renderPricingTab(tab);
  // update header actions
  _renderPricingHeaderActions(tab);
}

function _renderPricingHeaderActions(tab){
  const el=g('prc-header-actions');if(!el)return;
  if(tab==='kiloan'){
    el.innerHTML=`<button class="btn bsm" style="display:flex;align-items:center;gap:5px" onclick="openPriceOptModal('kiloan')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> Kelola Opsi Harga Kiloan</button>
    <button class="btn bp bsm" onclick="openAddSvc()">+ Tambah Layanan Kiloan</button>`;
  }else if(tab==='satuan'){
    el.innerHTML=`<button class="btn bsm" style="display:flex;align-items:center;gap:5px" onclick="openPriceOptModal('satuan')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> Kelola Opsi Harga Satuan</button>
    <button class="btn bp bsm" onclick="openAddSatuanItem()">+ Tambah Layanan Satuan</button>`;
  }else{
    el.innerHTML=`<button class="btn bp bsm" onclick="openAddAddon()">+ Tambah Layanan Tambahan</button>`;
  }
}

function _renderPricingTab(tab){
  if(tab==='kiloan') _renderKiloanTab();
  else if(tab==='satuan') _renderSatuanTab();
  else _renderTambahanTab();
  _renderPricingHeaderActions(tab);
}

// ─── Kiloan tab ───
function _renderKiloanTab(){
  const pane=g('ptab-kiloan');if(!pane)return;
  let html=`<div class="prc-banner warn" style="margin-bottom:16px">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <div>Semua layanan kiloan akan menggunakan set opsi harga yang sama. Ubah opsi harga di menu "Kelola Opsi Harga Kiloan".</div>
  </div>
  <div class="pricing-split">
    <div id="prc-kiloan-left">${_renderKiloanLeft()}</div>
    <div id="prc-kiloan-right">${_renderKiloanRight()}</div>
  </div>`;
  pane.innerHTML=html;
}

function _renderKiloanLeft(){
  const allPo=_activePoOptions('kiloan');
  const DRAG_ICON=`<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/><circle cx="2" cy="5" r="1.2"/><circle cx="8" cy="5" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/></svg>`;
  const GEAR_ICON=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  const INFO_ICON=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Berat minimum yang harus dipenuhi"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  const EDIT_ICON=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const DEL_ICON=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  const CHECK_ON=`<svg class="chip-on" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const CHECK_OFF=`<svg class="chip-off" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;

  let html=`<div class="card" style="padding:0;overflow:hidden;margin-bottom:10px">
    <div style="padding:14px 16px 10px">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px">Daftar Layanan Kiloan</div>
      <div style="font-size:12px;color:var(--t2)">Kelola item layanan kiloan yang tersedia di outlet Anda.</div>
    </div>
    <div class="prc-col-hdr">
      <div style="flex:1">Nama Layanan</div>
      <div style="width:48px;text-align:center">Satuan</div>
      <div style="width:150px">Harga Dasar</div>
      <div style="width:72px;text-align:center">Status</div>
      <div style="width:70px;text-align:right">Aksi</div>
    </div>`;

  if(!serviceTypes.length){
    html+=`<div style="text-align:center;color:var(--t2);padding:24px;font-size:13px">Belum ada layanan kiloan. Klik "+ Tambah" untuk menambahkan.</div>`;
  } else {
    serviceTypes.forEach(s=>{
      const active=s.active!==false;
      const minP=_minPrice(s.prices||{},'kiloan');
      const mk=s.minKg||0;
      const tierApply=s.tierApply||{};
      const chips=allPo.map(po=>{
        const isOn=tierApply[po.key]!==false;
        return `<div class="prc-tier-chip${isOn?' on':''}" id="chip-${s.id}-${po.key}" onclick="_toggleTierChip(this)">${CHECK_OFF}${CHECK_ON}${esc(po.label)}</div>`;
      }).join('');
      html+=`<div class="prc-svc-wrap" id="prc-svc-wrap-${s.id}">
        <div class="prc-svc-row">
          <div class="prc-svc-col-name">
            <div style="font-weight:700;font-size:13px">${esc(s.name)}</div>
            ${s.desc?`<div style="font-size:11px;color:var(--t2);margin-top:1px">${esc(s.desc)}</div>`:''}
          </div>
          <div class="prc-svc-col-unit">${esc(s.unit||'kg')}</div>
          <div class="prc-svc-col-price">Mulai dari <strong>${fmt(minP)}</strong></div>
          <div class="prc-svc-col-status"><span class="prc-badge-${active?'on':'off'}">${active?'Aktif':'Nonaktif'}</span></div>
          <div class="prc-svc-col-aksi">
            <button class="btn bsm" title="Edit" onclick="openEditSvc('${s.id}')">${EDIT_ICON}</button>
            ${serviceTypes.length>1?`<button class="btn bre bsm" title="Hapus" onclick="delSvc('${s.id}')">${DEL_ICON}</button>`:''}
          </div>
        </div>
        <div class="prc-svc-settings">
          <div class="prc-svc-settings-hdr">${GEAR_ICON} Pengaturan Layanan</div>
          <div class="prc-svc-settings-body">
            <div class="prc-minkg-group">
              <div class="prc-minkg-lbl">Min. berat ${INFO_ICON}</div>
              <input type="number" class="prc-minkg-input" id="svc-mkg-${s.id}" value="${mk}" min="0" max="50" step="0.5">
              <span style="font-size:12px;color:var(--t2)">kg</span>
            </div>
            <div class="prc-tier-apply-group">
              <div class="prc-tier-apply-lbl">Berlaku untuk tier</div>
              <div class="prc-tier-chips" id="chips-${s.id}">${chips}</div>
            </div>
          </div>
          <div class="prc-svc-save-row">
            <button class="btn bp bsm bpill" onclick="saveSvcSettings('${s.id}')">Simpan</button>
          </div>
        </div>
      </div>`;
    });
  }
  html+=`</div>
  <button class="btn bp bfull" onclick="openAddSvc()">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Tambah Layanan Kiloan
  </button>`;
  return html;
}

function _renderKiloanRight(){
  return _renderPriceOptsPanel('Kiloan');
}
function _renderKiloanRight_unused(){
  const tiers=[...priceOptions].sort((a,b)=>(a.order||0)-(b.order||0));
  const activeCount=tiers.filter(t=>t.active!==false).length;
  const DRAG_ICON=`<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/><circle cx="2" cy="5" r="1.2"/><circle cx="8" cy="5" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/></svg>`;
  const EDIT_ICON=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const DEL_ICON=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

  let html=`<div class="prc-opts-panel">
    <div class="prc-opts-hdr">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div>
          <div style="font-weight:700;font-size:14px">Opsi Harga Kiloan (Universal)</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">Opsi harga ini berlaku untuk semua layanan kiloan.</div>
        </div>
        <span class="badge gy" style="font-size:11px;flex-shrink:0">${activeCount} Opsi</span>
      </div>
    </div>
    <div style="padding:12px 12px 0">
      <div class="prc-col-hdr" style="border:none;padding:0 2px 8px;border-bottom:1px solid var(--b1);margin-bottom:8px">
        <div style="width:24px"></div>
        <div style="flex:1">Opsi Harga</div>
        <div style="width:90px">Estimasi</div>
        <div style="width:40px;text-align:center">Urutan</div>
        <div style="width:110px">Status</div>
        <div style="width:60px;text-align:right">Aksi</div>
      </div>`;

  if(!tiers.length){
    html+=`<div style="text-align:center;color:var(--t2);padding:20px;font-size:13px">Belum ada tier. Klik "+ Tambah" untuk menambahkan.</div>`;
  } else {
    tiers.forEach((po,idx)=>{
      const on=po.active!==false;
      const meta=typeof _getTierMeta==='function'?_getTierMeta(po.key,po.label):{bg:'#e8f5e9',fg:'#2e7d32',badge_bg:'#c8e6c9',badge_fg:'#1b5e20',svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'};
      html+=`<div class="prc-po-row${on?' prc-po-active':''}" id="prc-po-row-${po.key}" draggable="true"
        ondragstart="_poDragStart(event,'${po.key}')"
        ondragover="_poDragOver(event,'${po.key}')"
        ondrop="_poDrop(event,'${po.key}')"
        ondragend="_poDragEnd()">
        <div class="prc-po-drag" title="Seret untuk reorder">${DRAG_ICON}</div>
        <div class="prc-po-icon-cell">
          <div class="prc-po-icon" style="background:${meta.bg};color:${meta.fg}">${meta.svg}</div>
          <div class="prc-po-name-block">
            <div class="prc-po-name">${esc(po.label)}</div>
            ${po.est?`<span class="prc-po-est-badge" style="background:${meta.badge_bg};color:${meta.badge_fg}">${esc(po.est)}</span>`:''}
          </div>
        </div>
        <div class="prc-po-est-col">${esc(po.est||'—')}</div>
        <div class="prc-po-order-col">${idx+1}</div>
        <div class="prc-po-status-col">
          <span class="prc-po-status-badge ${on?'prc-badge-on':'prc-badge-off'}">${on?'Aktif':'Nonaktif'}</span>
          <button class="toggle ${on?'on':'off'}" style="transform:scale(.8);transform-origin:left;flex-shrink:0" onclick="togglePriceOptActive('${po.key}')"></button>
        </div>
        <div class="prc-po-aksi-col">
          <button class="btn bsm" title="Edit" onclick="openEditPriceOpt('${po.key}')">${EDIT_ICON}</button>
          <button class="btn bre bsm" title="Hapus" onclick="_deletePriceOpt('${po.key}')">${DEL_ICON}</button>
        </div>
      </div>`;
    });
  }

  html+=`</div>
    <div style="padding:8px 12px 2px">
      <button class="prc-po-add-btn" onclick="openAddPriceOpt()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Opsi Harga
      </button>
    </div>
    <div style="padding:0 12px 12px">
      <div class="prc-po-info-box">
        <div style="display:flex;align-items:flex-start;gap:7px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <ul class="prc-po-info-box" style="background:none;border:none;padding:0;margin:0">
            <li>Opsi harga yang diubah akan berlaku untuk semua layanan kiloan.</li>
            <li>Estimasi waktu ditampilkan saat membuat pesanan.</li>
            <li>Urutan menentukan posisi opsi harga di form order.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>`;
  return html;
}

// ─── Satuan tab ───
function _renderSatuanTab(){
  const pane=g('ptab-satuan');if(!pane)return;
  const activePo=_activePoOptions('satuan');

  let html=`<div class="pricing-split">`;

  // ── Left: satuan item list ──
  html+=`<div>
    <div style="margin-bottom:10px">
      <div style="font-weight:700;font-size:15px;margin-bottom:8px">Daftar Layanan Satuan</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <input id="prc-sat-srch" class="ord-search" placeholder="Cari layanan satuan..." oninput="_filterSatuanList()" style="flex:1;min-width:0">
        <button class="btn bsm" title="Filter" style="padding:8px 10px;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:10px" id="prc-sat-tbl-wrap">`;
  html+=_renderSatuanTable(satuanItems,activePo);
  html+=`</div>
    <button class="btn bp bfull" onclick="openAddSatuanItem()">+ Tambah Layanan Satuan</button>
  </div>`;

  // ── Right: price options panel ──
  html+=_renderPriceOptsPanel('Satuan');
  html+=`</div>`;
  pane.innerHTML=html;
}

function _renderSatuanTable(items, activePo){
  let html=`<table class="prc-tbl"><thead><tr>
    <th>NAMA LAYANAN</th><th>SATUAN</th><th>HARGA DASAR</th><th>OPSI HARGA</th><th>STATUS</th><th>AKSI</th>
  </tr></thead><tbody>`;
  if(!items.length){
    html+=`<tr><td colspan="6" style="text-align:center;color:var(--t2);padding:20px">Belum ada item satuan. Klik + Tambah.</td></tr>`;
  }else{
    items.forEach(item=>{
      const active=item.active!==false;
      const minP=_minPrice(item.prices||{},'satuan');
      const opsiCount=activePo.length;
      html+=`<tr>
        <td><div style="font-weight:600">${esc(item.name)}</div>${item.desc?`<div style="font-size:11px;color:var(--t2)">${esc(item.desc)}</div>`:''}</td>
        <td style="color:var(--t2)">${esc(item.unit||'pcs')}</td>
        <td>Mulai dari <strong>${fmt(minP)}</strong></td>
        <td><span class="badge gy" style="font-size:11px">${opsiCount} opsi</span></td>
        <td><span class="prc-badge-${active?'on':'off'}">${active?'Aktif':'Nonaktif'}</span></td>
        <td><div style="display:flex;gap:6px;align-items:center">
          <button class="btn bsm" title="Pengaturan" onclick="openItemSettings('${item.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="btn bre bsm" title="Hapus" onclick="delSatuanItem('${item.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
        </div></td>
      </tr>`;
    });
  }
  html+=`</tbody></table>`;
  return html;
}

function _filterSatuanList(){
  const q=(g('prc-sat-srch')?.value||'').toLowerCase().trim();
  const filtered=q?satuanItems.filter(x=>x.name.toLowerCase().includes(q)):satuanItems;
  const wrap=g('prc-sat-tbl-wrap');if(wrap)wrap.innerHTML=_renderSatuanTable(filtered,_activePoOptions('satuan'));
}

// ─── Tambahan tab ───
function _renderTambahanTab(){
  const pane=g('ptab-tambahan');if(!pane)return;
  let html=`<div style="margin-bottom:12px">
    <div style="font-weight:700;font-size:15px;margin-bottom:2px">Layanan Tambahan</div>
    <div style="font-size:12px;color:var(--t2)">Otomatis muncul sebagai opsi centang di form Buat Pesanan.</div>
  </div>`;
  if(!addons.length){
    html+=`<div style="text-align:center;padding:32px;color:var(--t2);background:var(--ca);border:1.5px solid var(--b1);border-radius:12px">Belum ada layanan tambahan.</div>`;
  }else{
    html+=`<div class="card" style="padding:0;overflow:hidden;margin-bottom:10px"><table class="prc-tbl"><thead><tr>
      <th>NAMA</th><th>HARGA</th><th>SATUAN</th><th>AKSI</th>
    </tr></thead><tbody>`;
    addons.forEach(a=>{
      html+=`<tr>
        <td><input value="${esc(a.name)}" onchange="updAddon('${a.id}','name',this.value)" style="border:none;background:none;font-size:13px;font-weight:600;width:100%;padding:0;font-family:inherit;color:var(--t1)"></td>
        <td><input type="number" value="${a.price}" onchange="updAddon('${a.id}','price',this.value)" style="width:90px;font-size:13px;padding:4px 6px"></td>
        <td><select onchange="updAddon('${a.id}','unit',this.value)" style="font-size:12px;padding:4px 6px;width:120px"><option value="flat" ${a.unit==='flat'?'selected':''}>per pesanan</option><option value="per_qty" ${a.unit==='per_qty'?'selected':''}>per kg/pcs</option></select></td>
        <td><button class="btn bre bsm" onclick="delAddon('${a.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button></td>
      </tr>`;
    });
    html+=`</tbody></table></div>`;
  }
  html+=`<button class="btn bp bfull" onclick="openAddAddon()">+ Tambah Layanan Tambahan</button>`;
  pane.innerHTML=html;
}

// ─── Price Options right panel ───
function _renderPriceOptsPanel(type){
  const cat=type.toLowerCase(); // 'kiloan' or 'satuan'
  const tiers=[...priceOptions].sort((a,b)=>(a.order||0)-(b.order||0));
  const activeCount=tiers.filter(t=>(cat==='kiloan'?t.activeKiloan:t.activeSatuan)!==false).length;
  let html=`<div class="prc-opts-panel">
    <div class="prc-opts-hdr">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div>
          <div style="font-weight:700;font-size:14px">Opsi Harga ${esc(type)}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">Aktif/nonaktif per kategori — mengatur tampilan opsi di form pesanan ${esc(type.toLowerCase())}.</div>
        </div>
        <span class="badge gy" style="font-size:11px;flex-shrink:0">${activeCount} Aktif</span>
      </div>
    </div>
    <table class="prc-tbl"><thead><tr>
      <th>OPSI HARGA</th><th>ESTIMASI</th><th>URUTAN</th><th>STATUS ${esc(type.toUpperCase())}</th><th>AKSI</th>
    </tr></thead><tbody>`;
  tiers.forEach(po=>{
    const on=(cat==='kiloan'?po.activeKiloan:po.activeSatuan)!==false;
    html+=`<tr style="${on?'':'opacity:.55'}">
      <td style="font-weight:600">${esc(po.label)}</td>
      <td style="color:var(--t2)">${esc(po.est||'—')}</td>
      <td style="color:var(--t2);text-align:center">${po.order||'—'}</td>
      <td><span class="prc-badge-${on?'on':'off'}">${on?'Aktif':'Nonaktif'}</span></td>
      <td><div style="display:flex;gap:5px;align-items:center">
        <button class="toggle ${on?'on':'off'}" style="transform:scale(.75);transform-origin:left" onclick="togglePriceOptActive('${po.key}','${cat}')"></button>
        <button class="btn bsm" title="Edit" onclick="openEditPriceOpt('${po.key}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      </div></td>
    </tr>`;
  });
  html+=`</tbody></table>
    <div style="padding:12px 16px;border-top:1px solid var(--b1)">
      <button class="btn bfull" style="font-size:12px" onclick="openAddPriceOpt()">+ Tambah Opsi Harga</button>
    </div>
    <div class="prc-banner info" style="margin:0 12px 12px;border-radius:8px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <ul style="margin:0;padding-left:16px">
        <li>Toggle di sini hanya mengatur kategori <strong>${esc(type)}</strong> — tidak mempengaruhi kategori lain.</li>
        <li>Estimasi waktu ditampilkan saat membuat pesanan.</li>
        <li>Urutan menentukan posisi opsi harga di form order.</li>
      </ul>
    </div>
  </div>`;
  return html;
}

// ─── Price Options modal (add/edit tier) ───
function openPriceOptModal(type){
  // Open the existing m-price-opt modal but just show the list — for now reuse openEditPriceOpt for first tier
  // Actually just show a toast directing user to edit individual tiers
  toast('Klik ✏️ pada baris opsi harga untuk mengedit.');
}
function openAddPriceOpt(){
  _editPoKey=null;
  g('m-po-title').textContent='Tambah Opsi Harga';
  if(g('m-po-subtitle'))g('m-po-subtitle').textContent='Buat tier baru untuk opsi harga kiloan yang berlaku untuk semua layanan.';
  g('mpo-label').value='';
  g('mpo-est').value='';
  const btn=g('mpo-active-btn');if(btn){btn.classList.add('on');btn.classList.remove('off');}
  if(g('mpo-active'))g('mpo-active').value='1';
  if(g('mpo-active-lbl')){g('mpo-active-lbl').textContent='Aktif digunakan';g('mpo-active-lbl').style.color='var(--p)';}
  openModal('m-price-opt');
}

function togglePriceOptActive(key,cat){
  const po=priceOptions.find(x=>x.key===key);if(!po)return;
  if(cat==='kiloan'){ po.activeKiloan=!(po.activeKiloan!==false); }
  else if(cat==='satuan'){ po.activeSatuan=!(po.activeSatuan!==false); }
  else { po.activeKiloan=!po.activeKiloan; po.activeSatuan=!po.activeSatuan; } // fallback
  syncSettings();
  const isOn=cat==='satuan'?(po.activeSatuan!==false):(po.activeKiloan!==false);
  toast((isOn?'✓ Aktif untuk '+cat+': ':'Nonaktif untuk '+cat+': ')+po.label);
  renderPricing();
  _noRebuildTierCards();
}

function openEditPriceOpt(key){
  _editPoKey=key;
  const po=priceOptions.find(x=>x.key===key);if(!po)return;
  g('m-po-title').textContent='Edit Opsi Harga';
  if(g('m-po-subtitle'))g('m-po-subtitle').textContent='Perbarui nama, estimasi, atau status tier ini.';
  g('mpo-label').value=po.label;
  g('mpo-est').value=po.est||'';
  const active=po.active!==false;
  g('mpo-active').value=active?'1':'0';
  const btn=g('mpo-active-btn');if(btn){btn.classList.toggle('on',active);btn.classList.toggle('off',!active);}
  const lbl=g('mpo-active-lbl');if(lbl){lbl.textContent=active?'Aktif digunakan':'Nonaktif';lbl.style.color=active?'var(--p)':'var(--t2)';}
  openModal('m-price-opt');
}

function _toggleMpoActive(){
  const cur=g('mpo-active').value==='1';
  g('mpo-active').value=cur?'0':'1';
  const btn=g('mpo-active-btn');if(btn){btn.classList.toggle('on',!cur);btn.classList.toggle('off',cur);}
  const lbl=g('mpo-active-lbl');if(lbl){lbl.textContent=cur?'Nonaktif':'Aktif digunakan';lbl.style.color=cur?'var(--t2)':'var(--p)';}
}

function savePriceOpt(){
  const label=(g('mpo-label')?.value||'').trim();if(!label){toast('⚠️ Nama tier wajib diisi');return;}
  const active=g('mpo-active').value==='1';
  const est=g('mpo-est')?.value||'';
  if(_editPoKey){
    const po=priceOptions.find(x=>x.key===_editPoKey);if(!po)return;
    po.label=label;po.est=est;po.active=active;
    if(po.activeKiloan===undefined)po.activeKiloan=active;
    if(po.activeSatuan===undefined)po.activeSatuan=active;
  }else{
    // new tier: generate a key from label
    const key='tier_'+Date.now();
    const nextOrder=priceOptions.length?Math.max(...priceOptions.map(po=>po.order||0))+1:1;
    priceOptions.push({key,label,est,order:nextOrder,active,activeKiloan:active,activeSatuan:active});
  }
  cm('m-price-opt');renderPricing();syncSettings();
  toast(_editPoKey?'✓ Tier diperbarui: '+label:'✓ Tier ditambahkan: '+label);_editPoKey=null;
}

// ─── Per-item sub-page (Satuan) ───
let _itemPageId=null;
function openItemSettings(id){
  const item=satuanItems.find(x=>x.id===id);if(!item)return;
  _itemPageId=id;
  const mainPage=g('prc-main-page');const itemPage=g('prc-item-page');
  if(mainPage)mainPage.style.display='none';if(itemPage)itemPage.style.display='';
  _renderItemSettingsPage(item);
}

function backToPricingList(){
  _itemPageId=null;
  const mainPage=g('prc-main-page');const itemPage=g('prc-item-page');
  if(mainPage)mainPage.style.display='';if(itemPage)itemPage.style.display='none';
  // refresh satuan tab
  if(_pricingTab==='satuan')_renderSatuanTab();
}

function _renderItemSettingsPage(item){
  const activePo=_activePoOptions('satuan');
  const allPo=[...priceOptions].filter(po=>po.activeSatuan!==false).sort((a,b)=>(a.order||0)-(b.order||0));
  const active=item.active!==false;

  let html=`
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn bsm" style="display:flex;align-items:center;gap:5px" onclick="backToPricingList()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Kembali ke Daftar Layanan Satuan
    </button>
    <div style="flex:1"></div>
    <button class="btn bre bsm" onclick="toggleItemActive('${item.id}')" id="item-toggle-btn">${active?'Nonaktifkan Layanan':'Aktifkan Layanan'}</button>
  </div>
  <div class="pt" style="margin-bottom:4px">Pengaturan: ${esc(item.name)} (${esc(item.unit||'pcs')})</div>
  <div style="font-size:13px;color:var(--t2);margin-bottom:18px">Atur harga dasar dan opsi harga untuk item satuan ini.</div>
  <div class="pricing-split">
    <!-- Left: form -->
    <div class="card">
      <div class="fg"><label>Nama Layanan</label><input id="ips-name" value="${esc(item.name)}" placeholder="Nama item"></div>
      <div class="fg"><label>Satuan</label>
        <select id="ips-unit" style="padding:8px 10px;font-size:13px;font-family:inherit;border:1.5px solid var(--b1);border-radius:8px;background:var(--ca);color:var(--t1);outline:none;width:100%">
          ${['pcs','item','lembar','pasang','kg'].map(u=>`<option value="${u}" ${(item.unit||'pcs')===u?'selected':''}>${u}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label>Deskripsi (opsional)</label><input id="ips-desc" value="${esc(item.desc||'')}" placeholder="Contoh: Bed cover ukuran single/double/king"></div>
      <div class="fg" style="margin-bottom:0">
        <label>Harga Dasar</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="number" id="ips-base" value="${activePo.length?item.prices?.[activePo[0].key]||0:0}" min="0" style="flex:1;font-size:14px;font-weight:700;padding:8px 10px" oninput="_ipsUpdateBaseInPanel()">
          <span style="color:var(--t2);font-size:13px">/ ${esc(item.unit||'pcs')}</span>
        </div>
        <div style="font-size:11px;color:var(--t2);margin-top:4px">Harga mulai dari untuk opsi termurah.</div>
      </div>
      <div class="div_" style="margin:14px 0"></div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:600;font-size:14px">Status</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${active?'Aktif':'Nonaktif'}</div>
        </div>
        <button class="toggle ${active?'on':'off'}" id="ips-active-btn" onclick="_ipsToggleActive()"></button>
        <input type="hidden" id="ips-active" value="${active?'1':'0'}">
      </div>
    </div>
    <!-- Right: per-tier prices + per-item active toggle -->
    <div class="prc-opts-panel">
      <div class="prc-opts-hdr">
        <div style="font-weight:700;font-size:14px;margin-bottom:2px">Opsi Harga untuk ${esc(item.name)}</div>
        <div style="font-size:12px;color:var(--t2)">Aktifkan opsi dan atur harga khusus untuk item ini.</div>
      </div>
      <table class="prc-tbl"><thead><tr>
        <th>OPSI HARGA</th><th>HARGA</th><th>AKTIF ITEM INI</th>
      </tr></thead><tbody id="ips-price-tbody">`;
  allPo.forEach(po=>{
    const itemOn=(item.tierApply||{})[po.key]!==false;
    const price=item.prices?.[po.key]||0;
    html+=`<tr id="ips-row-${po.key}" style="${itemOn?'':'opacity:.55'}">
      <td><div style="font-weight:600">${esc(po.label)}</div>${po.est?`<div style="font-size:11px;color:var(--t2)">${esc(po.est)}</div>`:''}</td>
      <td><input type="number" id="ips-price-${po.key}" value="${price}" min="0" style="width:90px;font-size:13px;font-weight:700;padding:5px 8px;text-align:right"></td>
      <td><button class="toggle ${itemOn?'on':'off'}" id="ips-tier-btn-${po.key}" style="transform:scale(.85);transform-origin:center" onclick="toggleItemTierApply('${item.id}','${po.key}')"></button></td>
    </tr>`;
  });
  html+=`</tbody></table>
      <div class="prc-banner info" style="margin:12px;border-radius:8px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <ul style="margin:0;padding-left:16px">
          <li>Toggle menonaktifkan opsi ini khusus untuk item ini — tidak mempengaruhi layanan satuan lain.</li>
          <li>Harga tetap tersimpan meski opsi dinonaktifkan.</li>
        </ul>
      </div>
    </div>
  </div>
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
    <button class="btn" onclick="backToPricingList()">Batal</button>
    <button class="btn bp bpill" onclick="saveItemSettings()">Simpan Perubahan</button>
  </div>`;

  const el=g('prc-item-content');if(el)el.innerHTML=html;
}

function _ipsToggleActive(){
  const cur=g('ips-active').value==='1';
  g('ips-active').value=cur?'0':'1';
  const btn=g('ips-active-btn');if(btn){btn.classList.toggle('on',!cur);btn.classList.toggle('off',cur);}
}
function _ipsUpdateBaseInPanel(){
  const val=parseInt(g('ips-base')?.value)||0;
  const activePo=_activePoOptions('satuan');
  if(activePo.length){const el=g('ips-price-'+activePo[0].key);if(el)el.value=val;}
}
function toggleItemActive(id){
  const item=satuanItems.find(x=>x.id===id);if(!item)return;
  item.active=!(item.active!==false);
  const btn=g('item-toggle-btn');if(btn)btn.textContent=item.active?'Nonaktifkan Layanan':'Aktifkan Layanan';
  const ab=g('ips-active-btn');if(ab){ab.classList.toggle('on',item.active);ab.classList.toggle('off',!item.active);}
  if(g('ips-active'))g('ips-active').value=item.active?'1':'0';
  syncSettings();toast((item.active?'✓ Aktif: ':'Nonaktif: ')+item.name);
}
function toggleItemTierApply(itemId,tierKey){
  const item=satuanItems.find(x=>x.id===itemId);if(!item)return;
  if(!item.tierApply)item.tierApply={};
  item.tierApply[tierKey]=item.tierApply[tierKey]===false?true:false;
  const on=item.tierApply[tierKey]!==false;
  const row=g('ips-row-'+tierKey);
  if(row){
    row.style.opacity=on?'':'0.55';
    const btn=g('ips-tier-btn-'+tierKey);
    if(btn){btn.classList.toggle('on',on);btn.classList.toggle('off',!on);}
  }
}
function saveItemSettings(){
  const item=satuanItems.find(x=>x.id===_itemPageId);if(!item)return;
  item.name=(g('ips-name')?.value||'').trim()||item.name;
  item.unit=g('ips-unit')?.value||item.unit;
  item.desc=g('ips-desc')?.value||'';
  item.active=g('ips-active')?.value!=='0';
  const prices=Object.assign({},item.prices||{});
  priceOptions.forEach(po=>{const el=g('ips-price-'+po.key);if(el)prices[po.key]=parseInt(el.value)||0;});
  item.prices=prices;
  buildSatuanOrderItems('no');buildSatuanOrderItems('sno');calcO();calcS();syncSettings();
  toast('✓ Pengaturan '+item.name+' disimpan');
  backToPricingList();
}

// ─── Service modal helpers ───
function _getTierMeta(key, label) {
  const k = (key + ' ' + label).toLowerCase();
  if (k.includes('super') || k.includes('vip')) return {
    bg:'#f3e5f5', fg:'#7b1fa2', badge_bg:'#e1bee7', badge_fg:'#6a1b9a',
    svg:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
  };
  if (k.includes('express')) return {
    bg:'#e3f2fd', fg:'#1565c0', badge_bg:'#bbdefb', badge_fg:'#0d47a1',
    svg:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'
  };
  if (k.includes('same') || k.includes('sameday')) return {
    bg:'#fff3e0', fg:'#e65100', badge_bg:'#ffe0b2', badge_fg:'#bf360c',
    svg:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
  };
  if (k.includes('jam') || k.includes('hour')) return {
    bg:'#fce4ec', fg:'#c62828', badge_bg:'#f8bbd0', badge_fg:'#b71c1c',
    svg:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  };
  return {
    bg:'#e8f5e9', fg:'#2e7d32', badge_bg:'#c8e6c9', badge_fg:'#1b5e20',
    svg:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  };
}

let _msvcPendingRefresh = false;
function _msvcUnitChange() {
  const unit = g('msvc-unit')?.value || 'kg';
  const helpers = { kg:'Harga akan dihitung berdasarkan per kilogram.', pcs:'Harga akan dihitung per item / pcs.', pasang:'Harga akan dihitung per pasang.', meter:'Harga akan dihitung per meter.' };
  const hlp = g('msvc-unit-helper'); if (hlp) hlp.textContent = helpers[unit] || '';
  // Update all price labels in tier cards
  const lbl = 'Harga per ' + unit;
  document.querySelectorAll('.msvc-price-lbl').forEach(el => el.textContent = lbl);
}

function _renderSvcPriceRows(containerId, prices) {
  const el = g(containerId); if (!el) return;
  const activeOpts = _activePoOptions('kiloan');
  const unit = g('msvc-unit')?.value || 'kg';
  if (!activeOpts.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--t2);font-size:13px;padding:16px 0">Belum ada tier harga. Klik "Tambah Tier" untuk menambahkan.</div>';
    return;
  }
  el.innerHTML = activeOpts.map((po, idx) => {
    const meta = _getTierMeta(po.key, po.label);
    const price = prices?.[po.key] || 0;
    const hasPrice = price > 0;
    return `<div class="msvc-tier-card${hasPrice ? ' has-price' : ''}" id="msvc-tc-${po.key}" draggable="true"
        ondragstart="_msvcDragStart(event,'${po.key}')"
        ondragover="_msvcDragOver(event,'${po.key}')"
        ondrop="_msvcDrop(event,'${po.key}')"
        ondragend="_msvcDragEnd()">
      <div class="msvc-tier-drag" title="Seret untuk reorder">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/><circle cx="2" cy="5" r="1.2"/><circle cx="8" cy="5" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/></svg>
      </div>
      <div class="msvc-tier-icon" style="background:${meta.bg};color:${meta.fg}">${meta.svg}</div>
      <div class="msvc-tier-info">
        <div class="msvc-tier-name">
          ${esc(po.label)}
          ${po.est ? `<span class="msvc-tier-badge" style="background:${meta.badge_bg};color:${meta.badge_fg}">${esc(po.est)}</span>` : ''}
          ${hasPrice ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${meta.fg}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` : ''}
        </div>
        ${po.est ? `<div class="msvc-tier-est">Estimasi selesai ${esc(po.est)}</div>` : ''}
      </div>
      <div class="msvc-price-side">
        <div class="msvc-price-lbl">Harga per ${esc(unit)}</div>
        <div class="msvc-price-row">
          <span class="msvc-price-rp">Rp</span>
          <input type="number" class="msvc-price-input" id="${containerId}-${po.key}"
            value="${price || ''}" min="0" placeholder="0"
            oninput="_msvcPriceChange(this,'msvc-tc-${po.key}')">
        </div>
      </div>
      <button class="msvc-tier-del" title="Hapus tier" onclick="_msvcDelTier('${po.key}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>`;
  }).join('');
}
function _readSvcPriceRows(containerId){
  const prices={};
  priceOptions.forEach(po=>{const el=g(containerId+'-'+po.key);if(el)prices[po.key]=parseInt(el.value)||0;});
  return prices;
}

// ─── Kiloan settings helpers ───
function _toggleTierChip(el){
  el.classList.toggle('on');
}

function saveSvcSettings(id){
  const s=getSvcById(id);if(!s)return;
  const kg=parseFloat(g('svc-mkg-'+id)?.value)||0;
  s.minKg=kg;
  const tierApply={};
  priceOptions.forEach(po=>{
    const chip=document.getElementById('chip-'+id+'-'+po.key);
    tierApply[po.key]=chip?chip.classList.contains('on'):true;
  });
  s.tierApply=tierApply;
  s.minKgApply={...tierApply};
  calcO();calcS();
  syncSettings();
  toast('Pengaturan '+esc(s.name)+' disimpan');
}

function _deletePriceOpt(key){
  const po=priceOptions.find(p=>p.key===key);
  if(!po)return;
  if(!confirm('Hapus tier "'+po.label+'"? Harga yang menggunakan tier ini akan ikut terhapus.'))return;
  priceOptions=priceOptions.filter(p=>p.key!==key);
  priceOptions.forEach((p,i)=>p.order=i+1);
  syncSettings();
  renderPricing();
  toast('Tier dihapus: '+po.label);
}

let _svcDragId=null;
function _svcDragStart(e,id){_svcDragId=id;document.getElementById('prc-svc-wrap-'+id)?.classList.add('dragging');}
function _svcDragEnd(){_svcDragId=null;document.querySelectorAll('.prc-svc-wrap').forEach(el=>el.classList.remove('dragging'));}
function _svcDragOver(e,id){e.preventDefault();}
function _svcDrop(e,targetId){
  e.preventDefault();
  if(!_svcDragId||_svcDragId===targetId)return;
  const fi=serviceTypes.findIndex(s=>s.id===_svcDragId);
  const ti=serviceTypes.findIndex(s=>s.id===targetId);
  if(fi<0||ti<0)return;
  serviceTypes.splice(ti,0,serviceTypes.splice(fi,1)[0]);
  const left=g('prc-kiloan-left');if(left)left.innerHTML=_renderKiloanLeft();
  syncSettings();
}

let _poDragKey=null;
function _poDragStart(e,key){_poDragKey=key;document.getElementById('prc-po-row-'+key)?.classList.add('dragging');}
function _poDragEnd(){_poDragKey=null;document.querySelectorAll('.prc-po-row').forEach(el=>el.classList.remove('dragging'));}
function _poDragOver(e,key){e.preventDefault();}
function _poDrop(e,targetKey){
  e.preventDefault();
  if(!_poDragKey||_poDragKey===targetKey)return;
  const fi=priceOptions.findIndex(p=>p.key===_poDragKey);
  const ti=priceOptions.findIndex(p=>p.key===targetKey);
  if(fi<0||ti<0)return;
  priceOptions.splice(ti,0,priceOptions.splice(fi,1)[0]);
  priceOptions.forEach((p,i)=>p.order=i+1);
  const right=g('prc-kiloan-right');if(right)right.innerHTML=_renderKiloanRight();
  syncSettings();
}

function saveSvcMinKg(id){const s=getSvcById(id);if(!s)return;const val=parseFloat(g('mkg-'+id)?.value)||0;s.minKg=val;const apply={};priceOptions.forEach(po=>{apply[po.key]=!!(g('mka-'+id+'-'+po.key)?.checked);});s.minKgApply=apply;calcO();calcS();syncSettings();toast('✓ Min. berat '+s.name+' diperbarui');}
function updSatuanItemPrice(id,cat,val){const item=satuanItems.find(x=>x.id===id);if(!item)return;item.prices[cat]=parseInt(val)||0;buildSatuanOrderItems('no');calcO();buildSatuanOrderItems('sno');calcS();syncSettings();}
function updSvcPrice(id,cat,val){const s=getSvcById(id);if(!s)return;s.prices[cat]=parseInt(val)||0;buildOrderForm('no');calcO();buildOrderForm('sno');calcS();syncSettings();}

function buildOrderTypeDropdowns(){
  ['no-type','sno-type'].forEach(selId=>{
    const el=g(selId);if(!el)return;
    const curVal=el.value;
    el.innerHTML=serviceTypes.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')+`<option value="satuan">Satuan</option>`;
    if(serviceTypes.find(s=>s.id===curVal)||curVal==='satuan')el.value=curVal;
  });
}
// rebuildPromoSvcSelect is now a no-op stub (defined in promo section below)

// ─── Kiloan/Satuan modals (add) ───
function _toggleMsvcActive(){
  const cur=g('msvc-active').value==='1';
  g('msvc-active').value=cur?'0':'1';
  const btn=g('msvc-active-btn');if(btn){btn.classList.toggle('on',!cur);btn.classList.toggle('off',cur);}
  const card=g('msvc-status-card');if(card)card.classList.toggle('active',!cur);
}
function _msvcPriceChange(input, cardId) {
  const card = g(cardId); if (!card) return;
  const val = parseFloat(input.value) || 0;
  card.classList.toggle('has-price', val > 0);
}

let _msvcDragKey = null;
function _msvcDragStart(e, key) { _msvcDragKey = key; e.currentTarget.classList.add('dragging'); }
function _msvcDragEnd() {
  _msvcDragKey = null;
  document.querySelectorAll('.msvc-tier-card').forEach(c => c.classList.remove('dragging'));
}
function _msvcDragOver(e, key) { e.preventDefault(); }
function _msvcDrop(e, targetKey) {
  e.preventDefault();
  if (!_msvcDragKey || _msvcDragKey === targetKey) return;
  const fromIdx = priceOptions.findIndex(p => p.key === _msvcDragKey);
  const toIdx = priceOptions.findIndex(p => p.key === targetKey);
  if (fromIdx < 0 || toIdx < 0) return;
  const moved = priceOptions.splice(fromIdx, 1)[0];
  priceOptions.splice(toIdx, 0, moved);
  priceOptions.forEach((p, i) => p.order = i + 1);
  const prices = _readSvcPriceRows('msvc-price-rows');
  _renderSvcPriceRows('msvc-price-rows', prices);
  syncSettings();
}

function _msvcDelTier(key) {
  if (!confirm('Hapus tier ini? Harga layanan yang menggunakan tier ini akan ikut terhapus.')) return;
  priceOptions = priceOptions.filter(p => p.key !== key);
  const prices = _readSvcPriceRows('msvc-price-rows');
  delete prices[key];
  _renderSvcPriceRows('msvc-price-rows', prices);
  syncSettings();
}

function _toggleMsatActive(){
  const cur=g('msat-active').value==='1';
  g('msat-active').value=cur?'0':'1';
  const btn=g('msat-active-btn');if(btn){btn.classList.toggle('on',!cur);btn.classList.toggle('off',cur);}
}
function openAddSvc(){
  editSvcId=null;
  const t=g('m-svc-title');if(t)t.textContent='Tambah Layanan Kiloan';
  if(g('msvc-name'))g('msvc-name').value='';
  if(g('msvc-desc')){g('msvc-desc').value='';const cnt=g('msvc-desc-cnt');if(cnt)cnt.textContent='0';}
  if(g('msvc-unit'))g('msvc-unit').value='kg';
  _msvcUnitChange();
  if(g('msvc-active'))g('msvc-active').value='1';
  const ab=g('msvc-active-btn');if(ab){ab.classList.add('on');ab.classList.remove('off');}
  const sc=g('msvc-status-card');if(sc)sc.classList.add('active');
  _renderSvcPriceRows('msvc-price-rows',{});
  openModal('m-svc');
}
function openEditSvc(id){
  editSvcId=id;const s=getSvcById(id);if(!s)return;
  const t=g('m-svc-title');if(t)t.textContent='Edit Layanan Kiloan';
  if(g('msvc-name'))g('msvc-name').value=s.name;
  if(g('msvc-desc')){const desc=s.desc||'';g('msvc-desc').value=desc;const cnt=g('msvc-desc-cnt');if(cnt)cnt.textContent=desc.length;}
  if(g('msvc-unit'))g('msvc-unit').value=s.unit||'kg';
  _msvcUnitChange();
  const active=s.active!==false;
  if(g('msvc-active'))g('msvc-active').value=active?'1':'0';
  const ab=g('msvc-active-btn');if(ab){ab.classList.toggle('on',active);ab.classList.toggle('off',!active);}
  const sc=g('msvc-status-card');if(sc)sc.classList.toggle('active',active);
  _renderSvcPriceRows('msvc-price-rows',s.prices||{});
  openModal('m-svc');
}
function saveSvc(){
  const name=(g('msvc-name')?.value||'').trim();if(!name){toast('⚠️ Nama layanan wajib diisi');return;}
  const unit=g('msvc-unit')?.value||'pcs';
  const desc=g('msvc-desc')?.value||'';
  const active=g('msvc-active')?.value!=='0';
  const prices=_readSvcPriceRows('msvc-price-rows');
  if(editSvcId){const s=getSvcById(editSvcId);if(s){s.name=name;s.unit=unit;s.desc=desc;s.active=active;s.prices=prices;}}
  else{const id='svc'+svcCtr++;serviceTypes.push({id,name,unit,desc,active,prices,minKg:0,minKgApply:{}});}
  cm('m-svc');renderPricing();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();syncSettings();
  toast(editSvcId?'✓ Layanan diperbarui: '+name:'✓ Layanan ditambahkan: '+name);editSvcId=null;
}
function delSvc(id){if(serviceTypes.length<=1){toast('⚠️ Minimal harus ada 1 jenis layanan');return;}confirm_('Hapus Layanan?','Jenis layanan ini akan dihapus. Pesanan yang sudah ada tidak terpengaruh.',()=>{serviceTypes=serviceTypes.filter(s=>s.id!==id);renderPricing();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();toast('Layanan dihapus');});}
function openAddSatuanItem(){
  editSatItemId=null;
  g('m-sat-title').textContent='Tambah Item Satuan';
  if(g('msat-name'))g('msat-name').value='';
  if(g('msat-desc'))g('msat-desc').value='';
  if(g('msat-unit'))g('msat-unit').value='pcs';
  if(g('msat-active'))g('msat-active').value='1';
  const ab=g('msat-active-btn');if(ab){ab.classList.add('on');ab.classList.remove('off');}
  _renderSvcPriceRows('msat-price-rows',{});
  openModal('m-satuan-item');
}
function openEditSatuanItem(id){openItemSettings(id);}
function saveSatuanItem(){
  const name=(g('msat-name')?.value||'').trim();if(!name){toast('⚠️ Nama item wajib diisi');return;}
  const unit=g('msat-unit')?.value||'pcs';
  const desc=g('msat-desc')?.value||'';
  const active=g('msat-active')?.value!=='0';
  const prices=_readSvcPriceRows('msat-price-rows');
  if(editSatItemId){const item=satuanItems.find(x=>x.id===editSatItemId);if(item){item.name=name;item.unit=unit;item.desc=desc;item.active=active;item.prices=prices;}}
  else{satuanItems.push({id:'sat'+satItemCtr++,name,unit,desc,active,prices});}
  cm('m-satuan-item');renderPricing();buildSatuanOrderItems('no');buildSatuanOrderItems('sno');calcO();calcS();syncSettings();
  toast(editSatItemId?'✓ Item diperbarui: '+name:'✓ Item ditambahkan: '+name);editSatItemId=null;
}
function delSatuanItem(id){confirm_('Hapus Item?','Item ini akan dihapus dari daftar Satuan.',()=>{satuanItems=satuanItems.filter(x=>x.id!==id);renderPricing();buildSatuanOrderItems('no');buildSatuanOrderItems('sno');calcO();calcS();syncSettings();toast('Item dihapus');});}

function renderAddonList(){/* kept for compat, actual render is in _renderTambahanTab */}
function updAddon(id,key,val){const a=addons.find(x=>x.id===id);if(!a)return;a[key]=key==='price'?parseInt(val)||0:val;buildOrderForm('no');calcO();buildOrderForm('sno');calcS();}
function delAddon(id){addons=addons.filter(x=>x.id!==id);_renderTambahanTab();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();}
function openAddAddon(){g('mad-n').value='';g('mad-p').value='';g('mad-u').value='flat';openModal('m-addon');}
function saveAddon(){const name=g('mad-n').value.trim();if(!name){toast('⚠️ Nama wajib diisi');return;}addons.push({id:'a'+addonCtr++,name,price:parseInt(g('mad-p').value)||0,unit:g('mad-u').value});cm('m-addon');_renderTambahanTab();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();toast('✓ Layanan tambahan ditambahkan');}
function renderSvcTypeList(){}
function renderSatuanItemsList(){}

// ─── New Order: visual type/tier cards ───
function _noRebuildSvcCards(pre='no'){
  const el=g(pre+'-stype-cards');if(!el)return;
  const typeInp=g(pre+'-type');
  let curType=typeInp?.value||'';
  // If current type is not a valid service ID and not 'satuan', default to first service
  const validIds=serviceTypes.map(s=>s.id);
  if(!validIds.includes(curType)&&curType!=='satuan'){
    curType=serviceTypes[0]?.id||'kiloan';
    if(typeInp)typeInp.value=curType;
    const kgSect=g(pre+'-kg-sect');const satSect=g(pre+'-satuan-sect');
    if(kgSect)kgSect.style.display='block';
    if(satSect)satSect.style.display='none';
  }
  // One card per service type, plus Satuan at the end
  const types=serviceTypes.map(s=>({key:s.id,label:s.name,desc:s.desc||(s.unit==='kg'?'Layanan berbasis berat (kg)':'Layanan berbasis item')}));
  types.push({key:'satuan',label:'Satuan',desc:'Layanan berbasis item / pcs'});
  // Adjust grid columns (max 3 per row)
  el.style.gridTemplateColumns=`repeat(${Math.min(types.length,3)},1fr)`;
  el.innerHTML=types.map(t=>`
    <div class="no-type-card${curType===t.key?' on':''}" data-type-key="${esc(t.key)}" onclick="_noPickType('${t.key}','${pre}')">
      <div class="no-type-radio"><div class="no-type-radio-dot"></div></div>
      <div class="no-type-body">
        <div class="no-type-lbl">${esc(t.label)}</div>
        <div class="no-type-desc">${esc(t.desc)}</div>
      </div>
      <div class="no-type-check"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    </div>
  `).join('');
}
function _noRebuildTierCards(pre='no'){
  const el=g(pre+'-tier-cards');if(!el)return;
  const curCat=g(pre+'-cat')?.value||'regular';
  const type=g(pre+'-type')?.value||'kiloan';
  const tierSect=g(pre+'-tier-sect');
  if(tierSect)tierSect.style.display=(type==='satuan'?'none':'block');
  let activeTiers=_activePoOptions('kiloan');
  // Filter by service's tierApply if applicable
  const svc=type!=='satuan'?getSvcById(type):null;
  if(svc&&svc.tierApply){
    activeTiers=activeTiers.filter(po=>svc.tierApply[po.key]!==false);
  }
  el.style.gridTemplateColumns=`repeat(${Math.max(activeTiers.length,1)},1fr)`;
  el.innerHTML=activeTiers.map(po=>`
    <div class="no-type-card${curCat===po.key?' on':''}" onclick="_noPickTier('${po.key}','${pre}')" style="padding:10px 12px">
      <div class="no-type-radio"><div class="no-type-radio-dot"></div></div>
      <div class="no-type-body">
        <div class="no-type-lbl" style="font-size:12px">${esc(po.label)}</div>
        ${po.est?`<div class="no-type-desc">${esc(po.est)}</div>`:''}
      </div>
    </div>
  `).join('');
  if(activeTiers.length===1&&curCat!==activeTiers[0].key){
    const sel=g(pre+'-cat');if(sel)sel.value=activeTiers[0].key;
    catChange(pre);
  }
}
function _noPickType(key,pre='no'){
  const inp=g(pre+'-type');if(inp)inp.value=key;
  // Show/hide kg vs satuan sections
  const kgSect=g(pre+'-kg-sect');const satSect=g(pre+'-satuan-sect');
  if(kgSect)kgSect.style.display=(key!=='satuan'?'block':'none');
  if(satSect)satSect.style.display=(key==='satuan'?'block':'none');
  // Update card styling (only service type cards, not tier cards)
  const svcGrid=g(pre+'-stype-cards');
  if(svcGrid)svcGrid.querySelectorAll('.no-type-card').forEach(c=>{
    c.classList.toggle('on', c.dataset.typeKey === key);
  });
  if(typeof _noRebuildTierCards==='function')_noRebuildTierCards(pre);
  if(key==='satuan'&&typeof buildSatuanOrderItems==='function')buildSatuanOrderItems(pre);
  if(pre==='no')calcO();else calcS();
}
function _noPickTier(key,pre='no'){
  const sel=g(pre+'-cat');if(sel){sel.value=key;}
  _noRebuildTierCards(pre);
  catChange(pre);
}
function _noUpdateSatSelPrices(){
  const cat=g('no-cat')?.value||'regular';
  const sel=g('no-sat-sel');if(!sel)return;
  const activeItems=satuanItems.filter(x=>x.active!==false);
  sel.innerHTML=activeItems.length
    ? activeItems.map(item=>`<option value="${item.id}">${esc(item.name)} — ${fmt(item.prices?.[cat]||0)} / ${esc(item.unit||'pcs')}</option>`).join('')
    : '<option value="">Belum ada item satuan</option>';
}

// ===== PROMO =====
let _promoTabState = 'aktif';
let _mpStep = 1;
let _mpMaxStep = 1;
let _mpState = {};
const _DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const _DAY_VALS = ['0','1','2','3','4','5','6'];

function isPromoToday(p){if(!p.active)return false;const dm=p.days.length===0||p.days.includes(String(TODAY_DAY));return dm&&(!p.from||TODAY_ISO>=p.from)&&(!p.to||TODAY_ISO<=p.to);}
function isPromoScheduled(p){if(!p.active)return false;if(!p.from)return false;return p.from>TODAY_ISO;}
function promoDiscLbl(p){
  if(p.discType==='persen')return `-${p.discVal}%`;
  if(p.discType==='persen_qty')return `-${p.discVal}%/qty`;
  if(p.discType==='flat')return `-${fmt(p.discVal)}`;
  if(p.discType==='per_qty')return `-${fmt(p.discVal)}/qty`;
  return `-${fmt(p.discVal)}`;
}

function _promoTabClick(el){
  document.querySelectorAll('#promo-filter-tabs .promo-ftab').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  _promoTabState=el.dataset.tab;
  renderPromo();
}

function _promoSvcLbl(p){
  if(p.targets){
    const parts=[];
    if(p.targets.kiloan&&p.targets.kiloan.length){
      if(p.targets.kiloan[0]==='all')parts.push('Semua Kiloan');
      else parts.push('Kiloan: '+p.targets.kiloan.map(k=>{const po=priceOptions.find(x=>x.key===k);return po?po.label:k;}).join(', '));
    }
    if(p.targets.satuan&&p.targets.satuan.length){
      if(p.targets.satuan[0]==='all')parts.push('Semua Satuan');
      else parts.push('Satuan');
    }
    return parts.join(' & ')||'Semua Layanan';
  }
  const SVC_LBL_={all:'Semua Layanan','kiloan-regular':'Kiloan Reguler','kiloan-sameday':'Kiloan Same Day','kiloan-express':'Kiloan Express','satuan-regular':'Satuan Reguler','satuan-sameday':'Satuan Same Day','satuan-express':'Satuan Express'};
  return SVC_LBL_[p.svc]||p.svc||'—';
}

function _promoDayLbl(p){
  if(!p.days||!p.days.length)return 'Setiap hari';
  return p.days.map(d=>_DAYS_SHORT[parseInt(d)]||d).join(', ');
}

function _promoOutletLbl(p){
  if(!p.outlets||!p.outlets.length)return 'Semua Outlet';
  return p.outlets.map(oid=>{const o=outlets.find(x=>x.id===oid);return o?o.name:oid;}).join(', ');
}

function renderPromo(){
  const el=g('promo-list');if(!el)return;
  const q=(g('promo-search')?.value||'').toLowerCase().trim();
  const aktif=promos.filter(p=>p.active&&!isPromoScheduled(p));
  const terjadwal=promos.filter(p=>p.active&&isPromoScheduled(p));
  const nonaktif=promos.filter(p=>!p.active);
  const setCount=(id,n)=>{const el=g(id);if(el)el.textContent=n;};
  setCount('pcnt-aktif',aktif.length);
  setCount('pcnt-terjadwal',terjadwal.length);
  setCount('pcnt-nonaktif',nonaktif.length);
  let list=_promoTabState==='aktif'?aktif:_promoTabState==='terjadwal'?terjadwal:nonaktif;
  if(q)list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.note||'').toLowerCase().includes(q));
  if(!list.length){
    el.innerHTML=`<div style="text-align:center;padding:32px 24px;color:var(--t2)"><div style="font-size:13px;font-weight:500;margin-bottom:4px">Belum ada promo</div><div style="font-size:12px">Klik + Tambah Promo untuk membuat promo baru.</div></div>`;
    return;
  }
  el.innerHTML=list.map(p=>_promoCard(p)).join('');
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function _promoCard(p){
  const svcLbl=_promoSvcLbl(p);
  const dayLbl=_promoDayLbl(p);
  const outLbl=_promoOutletLbl(p);
  const discLbl=promoDiscLbl(p);
  const _dtMap={flat:'Diskon Nominal',persen:'Persentase Total',persen_qty:'Persentase Satuan',per_qty:'Rp per Kg/Unit'};
  const discType=_dtMap[p.discType]||p.discType||'—';
  const period=p.from||p.to?`${p.from||'—'} — ${p.to||'—'}`:'Tanpa batas';
  return `<div class="promo-card">
    <div style="display:flex;align-items:flex-start;gap:14px">
      <div class="promo-icon-wrap">
        <i data-lucide="${p.discType==='persen'?'percent':'tag'}" style="width:18px;height:18px;stroke-width:2;color:var(--p)"></i>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px">
          <div style="font-size:15px;font-weight:700;color:var(--t1)">${esc(p.name)}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="toggle ${p.active?'on':'off'}" onclick="togglePromo('${p.id}')"></button>
          </div>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">
          <span class="badge" style="background:var(--pl);color:var(--p);font-size:10px">${esc(svcLbl)}</span>
          <span class="badge" style="background:#fff3f3;color:var(--re);font-size:10px;font-weight:700">${esc(discLbl)}</span>
          <span class="badge" style="background:var(--bg);color:var(--t2);font-size:10px">${esc(dayLbl)}</span>
          <span class="badge" style="background:var(--bg);color:var(--t2);font-size:10px">${esc(outLbl)}</span>
          ${p.useCode?`<span class="badge" style="background:#f3e5f5;color:#7b1fa2;font-size:10px">🎟️ ${p.codeType==='bulk'?(()=>{const tot=p.codes?.length||0;const used=p.codes?.filter(c=>c.used).length||0;return tot+' kode · '+(tot-used)+' tersedia';})():p.code||'Kode Voucher'}</span>`:''}
        </div>
        ${p.note?`<div style="font-size:12px;color:var(--t2);margin-bottom:8px">${esc(p.note)}</div>`:''}
        <div class="promo-meta-grid">
          <div class="promo-meta-item">
            <div class="pml"><i data-lucide="tag" style="width:10px;height:10px;stroke-width:2"></i> Tipe Promo</div>
            <div class="pmv">${esc(discType)}</div>
          </div>
          <div class="promo-meta-item">
            <div class="pml"><i data-lucide="layers" style="width:10px;height:10px;stroke-width:2"></i> Berlaku Untuk</div>
            <div class="pmv">${esc(svcLbl)}</div>
          </div>
          <div class="promo-meta-item">
            <div class="pml"><i data-lucide="calendar" style="width:10px;height:10px;stroke-width:2"></i> Berlaku Pada</div>
            <div class="pmv">${esc(dayLbl)}</div>
          </div>
          <div class="promo-meta-item">
            <div class="pml"><i data-lucide="store" style="width:10px;height:10px;stroke-width:2"></i> Outlet</div>
            <div class="pmv">${esc(outLbl)}</div>
          </div>
        </div>
        <div class="promo-card-footer">
          <div style="font-size:11px;color:var(--t2);display:flex;align-items:center;gap:4px">
            <i data-lucide="calendar-range" style="width:11px;height:11px;stroke-width:2"></i>
            Periode: ${esc(period)}
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn bsm" onclick="openEditPromo('${p.id}')">Edit</button>
            <button class="btn bre bsm" onclick="delPromo('${p.id}')">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function togglePromo(id){const p=promos.find(x=>x.id===id);if(!p)return;p.active=!p.active;renderPromo();syncSettings();toast((p.active?'Promo aktif':'Promo nonaktif')+': '+p.name);}
function delPromo(id){confirm_('Hapus Promo?','Promo ini akan dihapus.',()=>{promos=promos.filter(x=>x.id!==id);renderPromo();syncSettings();toast('Promo dihapus');});}

// ── Step modal ──
function _mpSvgChk(){return `<i data-lucide="check" style="width:12px;height:12px;stroke-width:3;display:block"></i>`;}

function _mpUpdateSidebar(){
  for(let i=1;i<=5;i++){
    const el=document.querySelector(`#mp-sidebar [data-step="${i}"]`);
    if(!el)continue;
    el.classList.toggle('act',i===_mpStep);
    el.classList.toggle('done',i<_mpStep);
    const num=el.querySelector('.mp-sn');
    if(num){
      if(i<_mpStep){num.innerHTML='<i data-lucide="check" style="width:11px;height:11px;stroke-width:3;display:block"></i>';}
      else{num.textContent=i;}
    }
  }
  const back=g('mp-btn-back');if(back)back.style.display=_mpStep>1?'':'none';
  const next=g('mp-btn-next');if(next)next.textContent=_mpStep===5?'Simpan Promo':'Lanjutkan';
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function _mpRenderContent(){
  const el=g('mp-content');if(!el)return;
  if(_mpStep===1)el.innerHTML=_mpStep1Html();
  else if(_mpStep===2)el.innerHTML=_mpStep2Html();
  else if(_mpStep===3)el.innerHTML=_mpStep3Html();
  else if(_mpStep===4)el.innerHTML=_mpStep4Html();
  else el.innerHTML=_mpStep5Html();
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function _mpStep1Html(){
  const s=_mpState;
  const days=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const dayVals=['1','2','3','4','5','6','0'];
  const daysHtml=days.map((d,i)=>`<button type="button" class="dpill${(s.days||[]).includes(dayVals[i])?' sel':''}" onclick="_mpToggleDay('${dayVals[i]}',this)">${d}</button>`).join('');
  return `<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:18px">1. Informasi Promo</div>
  <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end;margin-bottom:16px">
    <div class="fg" style="margin-bottom:0">
      <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px;display:block">Nama Promo <span style="color:#e53935">*</span></label>
      <input id="mp-n" placeholder="Contoh: Promo Selasa Hemat" value="${esc(s.name||'')}">
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;padding-bottom:2px">
      <label style="font-size:12px;font-weight:600;color:var(--t2)">Status</label>
      <div style="display:flex;align-items:center;gap:8px">
        <button type="button" class="toggle ${s.active!==false?'on':'off'}" id="mp-active-btn" onclick="_mpToggleActive()"></button>
        <span id="mp-active-lbl" style="font-size:12px;font-weight:500;color:${s.active!==false?'var(--p)':'var(--t2)'};">${s.active!==false?'Aktif':'Nonaktif'}</span>
      </div>
    </div>
  </div>
  <div class="fg" style="margin-bottom:16px">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px;display:block">Periode Promo</label>
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center">
      <input type="date" id="mp-from" value="${esc(s.from||'')}" placeholder="Dari tanggal">
      <div style="color:var(--t2);font-size:13px;text-align:center">—</div>
      <input type="date" id="mp-to" value="${esc(s.to||'')}" placeholder="Sampai tanggal">
    </div>
    <div style="font-size:11px;color:var(--t2);margin-top:5px">Kosongkan jika tidak ada batas waktu.</div>
  </div>
  <div class="fg" style="margin-bottom:16px">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:10px;display:block">Hari Aktif</label>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${daysHtml}</div>
    <div style="font-size:11px;color:var(--t2);margin-top:7px">Kosongkan untuk berlaku setiap hari.</div>
  </div>
  <div class="fg" style="margin-bottom:0">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:10px;display:block">Berlaku di Outlet</label>
    <div style="display:flex;gap:10px">
      <div class="outlet-opt${(s.outletMode||'all')==='all'?' sel':''}" onclick="_mpSetOutletMode('all')">
        <div class="outlet-opt-icon"><i data-lucide="store" style="width:16px;height:16px;stroke-width:2;display:block"></i></div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--t1)">Semua Outlet</div>
          <div style="font-size:11px;color:var(--t2)">Berlaku untuk semua outlet</div>
        </div>
        ${(s.outletMode||'all')==='all'?`<i data-lucide="check" style="width:16px;height:16px;stroke-width:2.5;color:var(--p);margin-left:auto;flex-shrink:0;display:block"></i>`:''}
      </div>
      <div class="outlet-opt${(s.outletMode||'all')==='specific'?' sel':''}" onclick="_mpSetOutletMode('specific')">
        <div class="outlet-opt-icon"><i data-lucide="map-pin" style="width:16px;height:16px;stroke-width:2;display:block"></i></div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--t1)">Pilih Outlet Tertentu</div>
          <div style="font-size:11px;color:var(--t2)">Pilih outlet yang ingin mendapatkan promo</div>
        </div>
        ${(s.outletMode||'all')==='specific'?`<i data-lucide="check" style="width:16px;height:16px;stroke-width:2.5;color:var(--p);margin-left:auto;flex-shrink:0;display:block"></i>`:''}
      </div>
    </div>
    ${(s.outletMode)==='specific'?`<div id="mp-outlet-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">${outlets.map(o=>{const sel=(s.outlets||[]).includes(o.id);return `<span class="chip${sel?' on':''}" onclick="_mpToggleOutlet('${o.id}')" style="${sel?`background:${o.color}18;border-color:${o.color};color:${o.color}`:''}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${o.color};margin-right:5px;vertical-align:middle"></span>${esc(o.name)}</span>`;}).join('')}</div>`:''}
  </div>`;
}

function _mpStep2Html(){
  const s=_mpState;
  const activePo=_activePoOptions('kiloan');
  const activePoSatuan=_activePoOptions('satuan');
  const activeSatuan=satuanItems.filter(x=>x.active!==false);
  const kiloanAll=(s.kiloanTargets||[])[0]==='all';
  const kiloanChecked=k=>kiloanAll||(s.kiloanTargets||[]).includes(k);
  const satuanAll=(s.satuanTargets||[])[0]==='all';
  const mChk=(itemId,tierKey)=>{
    if(satuanAll)return true;
    return (s.satuanTargets||[]).includes(itemId+'-'+tierKey);
  };
  // Kiloan service selection
  const multiSvc=serviceTypes.length>1;
  const ksAll=(s.kiloanServiceTargets||[]).length===0||(s.kiloanServiceTargets||[])[0]==='all';
  const ksChk=id=>ksAll||(s.kiloanServiceTargets||[]).includes(id);
  // Min qty
  const hasKiloan=(s.kiloanTargets||[]).length>0;
  const hasSatuan=(s.satuanTargets||[]).length>0;
  const minOn=s.minQtyEnabled||false;
  return `<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:18px">2. Berlaku untuk Layanan</div>
  <div class="mp-accord">
    <div class="mp-accord-hd" onclick="_mpToggleAccord('kiloan')">
      <i data-lucide="shirt" style="width:18px;height:18px;stroke-width:1.8;color:var(--p);flex-shrink:0;display:block"></i>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:var(--t1)">Kiloan</div>
        <div style="font-size:11px;color:var(--t2)">Atur layanan kiloan yang mendapatkan promo</div>
      </div>
      <i data-lucide="${s._kiloanOpen!==false?'chevron-up':'chevron-down'}" style="width:16px;height:16px;stroke-width:2;color:var(--t2);display:block"></i>
    </div>
    ${s._kiloanOpen!==false?`<div class="mp-accord-bd">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:6px;font-size:13px;font-weight:600;color:var(--t1)">
        <input type="checkbox" id="mp-kiloan-all" ${kiloanAll?'checked':''} onchange="_mpKiloanAllChg(this)"> Semua Kiloan
      </label>
      <div style="font-size:11px;color:var(--t2);margin-bottom:10px;margin-left:26px">Aktifkan untuk semua layanan dan tier kiloan.</div>
      ${multiSvc?`<div style="margin-bottom:12px;margin-left:4px">
        <div style="font-size:12px;font-weight:600;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">Pilih Layanan</div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;font-size:13px;color:var(--t1)">
          <input type="checkbox" id="mp-ks-all" ${ksAll?'checked':''} onchange="_mpKiloanSvcAllChg(this)"> Semua Layanan Kiloan
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:26px">
          ${serviceTypes.map(sv=>`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;padding:6px 12px;border:1.5px solid ${ksChk(sv.id)?'var(--p)':'var(--b1)'};border-radius:8px;background:${ksChk(sv.id)?'var(--pl)':'var(--ca)'};color:${ksChk(sv.id)?'var(--p)':'var(--t1)'}">
            <input type="checkbox" id="mp-ks-${sv.id}" ${ksChk(sv.id)?'checked':''} onchange="_mpKiloanSvcChg('${sv.id}',this)"> ${esc(sv.name)}
          </label>`).join('')}
        </div>
      </div>`:''}
      <div style="margin-left:4px">
        <div style="font-size:12px;font-weight:600;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">Pilih Tier</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${activePo.map(po=>`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;padding:6px 12px;border:1.5px solid ${kiloanChecked(po.key)?'var(--p)':'var(--b1)'};border-radius:8px;background:${kiloanChecked(po.key)?'var(--pl)':'var(--ca)'};color:${kiloanChecked(po.key)?'var(--p)':'var(--t1)'}">
            <input type="checkbox" id="mp-k-${po.key}" ${kiloanChecked(po.key)?'checked':''} onchange="_mpKiloanTierChg('${po.key}',this)"> ${esc(po.label)}
          </label>`).join('')}
        </div>
      </div>
    </div>`:''}
  </div>
  <div class="mp-accord">
    <div class="mp-accord-hd" onclick="_mpToggleAccord('satuan')">
      <i data-lucide="package" style="width:18px;height:18px;stroke-width:1.8;color:var(--p);flex-shrink:0;display:block"></i>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:var(--t1)">Satuan</div>
        <div style="font-size:11px;color:var(--t2)">Atur layanan satuan yang mendapatkan promo</div>
      </div>
      <i data-lucide="${s._satuanOpen!==false?'chevron-up':'chevron-down'}" style="width:16px;height:16px;stroke-width:2;color:var(--t2);display:block"></i>
    </div>
    ${s._satuanOpen!==false?`<div class="mp-accord-bd">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;font-size:13px;font-weight:600;color:var(--t1)">
        <input type="checkbox" id="mp-satuan-all" ${satuanAll?'checked':''} onchange="_mpSatuanAllChg(this)"> Semua Satuan
      </label>
      <div style="font-size:11px;color:var(--t2);margin-bottom:12px;margin-left:26px">Aktifkan untuk semua layanan satuan.</div>
      ${activeSatuan.length&&activePoSatuan.length?`
      <div style="overflow-x:auto">
        <table class="mp-matrix">
          <thead>
            <tr>
              <th style="min-width:120px">Layanan Satuan</th>
              ${activePoSatuan.map(po=>`<th>${esc(po.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${activeSatuan.map(item=>`<tr>
              <td>${esc(item.name)}</td>
              ${activePoSatuan.map(po=>`<td><input type="checkbox" ${mChk(item.id,po.key)?'checked':''} onchange="_mpMatrixChg('${item.id}','${po.key}',this)" style="width:16px;height:16px;cursor:pointer"></td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`:'<div style="font-size:12px;color:var(--t2)">Belum ada item satuan atau tier aktif.</div>'}
    </div>`:''}
  </div>
  <div style="border:1.5px solid var(--b1);border-radius:12px;padding:16px;margin-top:8px;background:var(--ca)">
    <div style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:12px">Syarat Minimum Pesanan</div>
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--t1);margin-bottom:${minOn?'14px':'0'}">
      <input type="checkbox" id="mp-minqty-toggle" ${minOn?'checked':''} onchange="_mpMinQtyToggle(this)">
      Aktifkan syarat minimum
    </label>
    ${minOn?`<div style="display:flex;flex-direction:column;gap:10px;padding-left:26px">
      ${hasKiloan?`<div style="display:flex;align-items:center;gap:10px">
        <label style="font-size:13px;color:var(--t1);min-width:100px">Kiloan minimal</label>
        <input type="number" min="0" step="0.5" value="${s.minQtyKiloan||''}" placeholder="0" oninput="_mpState.minQtyKiloan=parseFloat(this.value)||0" style="width:80px">
        <span style="font-size:13px;color:var(--t2)">kg</span>
      </div>`:''}
      ${hasSatuan?`<div style="display:flex;align-items:center;gap:10px">
        <label style="font-size:13px;color:var(--t1);min-width:100px">Satuan minimal</label>
        <input type="number" min="0" step="1" value="${s.minQtySatuan||''}" placeholder="0" oninput="_mpState.minQtySatuan=parseInt(this.value)||0" style="width:80px">
        <span style="font-size:13px;color:var(--t2)">pcs</span>
      </div>`:''}
      ${!hasKiloan&&!hasSatuan?`<div style="font-size:12px;color:var(--t2)">Pilih layanan kiloan atau satuan di atas terlebih dahulu.</div>`:''}
    </div>`:''}
  </div>`;
}

function _mpStep3Html(){
  const s=_mpState;
  const dt=s.discType||'flat';
  const types=[
    {v:'flat',       l:'Rp Nominal',           desc:'Potongan tetap dalam Rupiah dari total harga.'},
    {v:'persen',     l:'Persentase Total',      desc:'Potongan persen dari total harga pesanan.'},
    {v:'persen_qty', l:'Persentase Satuan',     desc:'Potongan persen per kg atau per item.'},
    {v:'per_qty',    l:'Rp per Kg / Unit',      desc:'Potongan nominal tetap per kg atau per item.'},
  ];
  const labels={flat:'Nominal (Rp)',persen:'Persentase (%)',persen_qty:'Persentase per Kg/Unit (%)',per_qty:'Nominal per Kg/Unit (Rp)'};
  const helpers={flat:'Contoh: 5000 untuk potongan Rp 5.000 dari total.',persen:'Contoh: 10 untuk potongan 10% dari total pesanan.',persen_qty:'Contoh: 5 untuk potongan 5% per kg atau per item.',per_qty:'Contoh: 2000 untuk potongan Rp 2.000 per kg atau item.'};
  return `<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:18px">3. Diskon</div>
  <div class="fg" style="margin-bottom:16px">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:10px;display:block">Jenis Diskon <span style="color:#e53935">*</span></label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${types.map(x=>`<label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:13px;padding:10px 12px;border:1.5px solid ${dt===x.v?'var(--p)':'var(--b1)'};border-radius:9px;background:${dt===x.v?'var(--pl)':'var(--ca)'}">
        <input type="radio" name="mp-dt-r" value="${x.v}" ${dt===x.v?'checked':''} onchange="_mpDiscTypeChg('${x.v}')" style="margin-top:2px;flex-shrink:0">
        <div>
          <div style="font-weight:600;color:${dt===x.v?'var(--p)':'var(--t1)'}">${x.l}</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px;line-height:1.4">${x.desc}</div>
        </div>
      </label>`).join('')}
    </div>
  </div>
  <div class="fg" style="margin-bottom:0">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px;display:block">${labels[dt]||'Nilai'} <span style="color:#e53935">*</span></label>
    <input type="number" id="mp-dv" placeholder="0" min="0" value="${s.discVal||''}" oninput="_mpState.discVal=parseFloat(this.value)||0">
    <div style="font-size:11px;color:var(--t2);margin-top:5px">${helpers[dt]||''}</div>
  </div>`;
}

function _mpStep4Html(){
  const s=_mpState;
  return `<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:18px">4. Catatan (Opsional)</div>
  <div class="fg" style="margin-bottom:0">
    <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px;display:block">Catatan Internal</label>
    <textarea id="mp-note" placeholder="Keterangan untuk kasir atau referensi internal..." rows="4" style="resize:none">${esc(s.note||'')}</textarea>
    <div style="font-size:11px;color:var(--t2);margin-top:5px">Catatan ini tidak ditampilkan ke pelanggan.</div>
  </div>`;
}

function _mpStep5Html(){
  const s=_mpState;
  const useCode=s.useCode||false;
  const codeType=s.codeType||'single';
  const codes=s.codes||[];
  const usedCount=codes.filter(c=>c.used).length;
  return `<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:6px">5. Kode Voucher</div>
  <div style="font-size:12px;color:var(--t2);margin-bottom:18px">Opsional — aktifkan jika promo ini memerlukan kode untuk ditukarkan.</div>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1.5px solid var(--b1);border-radius:12px;margin-bottom:18px;background:var(--ca)">
    <div>
      <div style="font-size:13px;font-weight:600;color:var(--t1)">Promo ini memerlukan kode voucher</div>
      <div style="font-size:11px;color:var(--t2);margin-top:3px">Pelanggan harus memasukkan kode untuk mendapatkan diskon</div>
    </div>
    <button type="button" class="toggle ${useCode?'on':'off'}" id="mp-use-code-btn" onclick="_mpToggleUseCode()"></button>
    <input type="checkbox" id="mp-use-code" ${useCode?'checked':''} style="display:none">
  </div>
  <div id="mp-code-opts" style="display:${useCode?'block':'none'}">
    <div style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:10px">Tipe Kode</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px">
      <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;padding:12px;border:1.5px solid ${codeType==='single'?'var(--p)':'var(--b1)'};border-radius:10px;background:${codeType==='single'?'var(--pl)':'var(--ca)'}">
        <input type="radio" name="mp-code-type" value="single" ${codeType==='single'?'checked':''} onchange="_mpCodeTypeChg('single')" style="margin-top:2px;flex-shrink:0">
        <div>
          <div style="font-weight:600;font-size:13px;color:${codeType==='single'?'var(--p)':'var(--t1)'}">Satu Kode</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px;line-height:1.4">Satu kode berlaku untuk semua pelanggan, tidak terbatas penggunaan</div>
        </div>
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;padding:12px;border:1.5px solid ${codeType==='bulk'?'var(--p)':'var(--b1)'};border-radius:10px;background:${codeType==='bulk'?'var(--pl)':'var(--ca)'}">
        <input type="radio" name="mp-code-type" value="bulk" ${codeType==='bulk'?'checked':''} onchange="_mpCodeTypeChg('bulk')" style="margin-top:2px;flex-shrink:0">
        <div>
          <div style="font-weight:600;font-size:13px;color:${codeType==='bulk'?'var(--p)':'var(--t1)'}">Kode Unik (Bulk)</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px;line-height:1.4">Setiap kode hanya bisa digunakan sekali, import dari CSV/Excel</div>
        </div>
      </label>
    </div>
    <div id="mp-single-wrap" style="display:${codeType==='single'?'block':'none'}">
      <div class="fg" style="margin-bottom:0">
        <label style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px;display:block">Kode Voucher <span style="color:#e53935">*</span></label>
        <input id="mp-single-code" placeholder="Contoh: HEMAT10" value="${esc(s.code||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
        <div style="font-size:11px;color:var(--t2);margin-top:5px">Kode tidak case-sensitive saat digunakan pelanggan.</div>
      </div>
    </div>
    <div id="mp-bulk-wrap" style="display:${codeType==='bulk'?'block':'none'}">
      <div style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px">Import Kode dari File</div>
      <label style="display:flex;align-items:center;gap:10px;padding:14px 16px;border:1.5px dashed var(--b2);border-radius:10px;cursor:pointer;background:var(--bg)" onclick="g('mp-bulk-file').click()">
        <i data-lucide="upload" style="width:20px;height:20px;stroke-width:1.8;color:var(--p);flex-shrink:0;display:block"></i>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--t1)">Upload CSV atau Excel (.xlsx, .xls)</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">Satu kode per baris (atau kolom A di Excel). Tidak perlu header.</div>
        </div>
      </label>
      <input type="file" id="mp-bulk-file" accept=".csv,.xlsx,.xls" style="display:none" onchange="_mpImportCodes(this)">
      ${codes.length?`<div style="margin-top:12px;padding:10px 14px;background:var(--pl);border-radius:9px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--p)">${codes.length} kode diimport</div>
          <div style="font-size:11px;color:var(--pd);margin-top:2px">${codes.length-usedCount} tersedia · ${usedCount} sudah digunakan</div>
        </div>
        <button type="button" onclick="_mpClearCodes()" style="border:none;background:none;cursor:pointer;font-size:11px;color:var(--re);font-weight:600">Hapus semua</button>
      </div>
      <div style="max-height:140px;overflow-y:auto;margin-top:8px;border:1px solid var(--b1);border-radius:8px">
        ${codes.slice(0,200).map(c=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;font-size:12px;border-bottom:1px solid var(--b1)">
          <span style="font-family:monospace;color:${c.used?'var(--t3)':'var(--t1)'};text-decoration:${c.used?'line-through':'none'}">${esc(c.code)}</span>
          <span style="font-size:10px;color:${c.used?'var(--re)':'var(--p)'}">${c.used?'Terpakai':'Tersedia'}</span>
        </div>`).join('')}
        ${codes.length>200?`<div style="padding:8px 12px;font-size:11px;color:var(--t2);text-align:center">+${codes.length-200} kode lainnya</div>`:''}
      </div>`:`<div style="margin-top:10px;font-size:12px;color:var(--t2)">Belum ada kode diimport.</div>`}
    </div>
  </div>`;
}

function _mpToggleUseCode(){
  const btn=g('mp-use-code-btn'); const chk=g('mp-use-code'); const opts=g('mp-code-opts');
  if(!btn||!chk)return;
  const on=!chk.checked;
  chk.checked=on;
  btn.className='toggle '+(on?'on':'off');
  _mpState.useCode=on;
  if(opts)opts.style.display=on?'block':'none';
}

function _mpCodeTypeChg(val){
  _mpState.codeType=val;
  const sw=g('mp-single-wrap'); const bw=g('mp-bulk-wrap');
  if(sw)sw.style.display=val==='single'?'block':'none';
  if(bw)bw.style.display=val==='bulk'?'block':'none';
  // update radio border colors
  document.querySelectorAll('input[name="mp-code-type"]').forEach(r=>{
    const lbl=r.closest('label');
    if(lbl){lbl.style.borderColor=r.value===val?'var(--p)':'var(--b1)';lbl.style.background=r.value===val?'var(--pl)':'var(--ca)';}
    const title=lbl?.querySelector('div>div');if(title)title.style.color=r.value===val?'var(--p)':'var(--t1)';
  });
}

function _mpImportCodes(input){
  const file=input.files?.[0]; if(!file)return;
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='csv'){
    const reader=new FileReader();
    reader.onload=e=>{
      const lines=e.target.result.split(/\r?\n/);
      const codes=lines.map(l=>l.trim().replace(/^["']|["']$/g,'').toUpperCase()).filter(l=>l&&l.length>0);
      _mpState.codes=(codes).map(c=>({code:c,used:false,usedAt:null,orderId:null}));
      _mpRenderContent();
    };
    reader.readAsText(file);
  } else if(ext==='xlsx'||ext==='xls'){
    if(typeof XLSX==='undefined'){toast('⚠️ Library Excel belum dimuat, coba refresh halaman');return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1});
      const codes=rows.map(r=>(String(r[0]||'')).trim().toUpperCase()).filter(c=>c&&c.length>0);
      _mpState.codes=codes.map(c=>({code:c,used:false,usedAt:null,orderId:null}));
      _mpRenderContent();
    };
    reader.readAsArrayBuffer(file);
  } else {
    toast('Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls');
  }
}

function _mpClearCodes(){
  _mpState.codes=[];
  _mpRenderContent();
}

// Step navigation
function _mpGo(step){
  if(step>_mpMaxStep)return;
  _mpSaveCurrentStepState();
  _mpStep=step;
  _mpUpdateSidebar();
  _mpRenderContent();
}

function _mpNext(){
  if(_mpStep===5){savePromo();return;}
  if(!_mpValidate())return;
  _mpSaveCurrentStepState();
  _mpStep++;
  if(_mpStep>_mpMaxStep)_mpMaxStep=_mpStep;
  _mpUpdateSidebar();
  _mpRenderContent();
}

function _mpPrev(){
  if(_mpStep<=1)return;
  _mpSaveCurrentStepState();
  _mpStep--;
  _mpUpdateSidebar();
  _mpRenderContent();
}

function _mpSaveCurrentStepState(){
  if(_mpStep===1){
    _mpState.name=(g('mp-n')?.value||'').trim();
    _mpState.from=g('mp-from')?.value||'';
    _mpState.to=g('mp-to')?.value||'';
  } else if(_mpStep===3){
    _mpState.discVal=parseFloat(g('mp-dv')?.value)||0;
  } else if(_mpStep===4){
    _mpState.note=g('mp-note')?.value||'';
  } else if(_mpStep===5){
    _mpState.useCode=g('mp-use-code')?.checked||false;
    _mpState.codeType=document.querySelector('input[name="mp-code-type"]:checked')?.value||'single';
    _mpState.code=(g('mp-single-code')?.value||'').trim().toUpperCase();
    // bulk codes are already in _mpState.codes from the import handler
  }
}

function _mpValidate(){
  if(_mpStep===1){
    const name=(g('mp-n')?.value||'').trim();
    if(!name){toast('Nama promo wajib diisi');return false;}
    _mpState.name=name;
  }
  if(_mpStep===3){
    const val=parseFloat(g('mp-dv')?.value)||0;
    if(!val){toast('Nilai diskon wajib diisi');return false;}
    _mpState.discVal=val;
  }
  return true;
}

// Interactivity helpers
function _mpToggleActive(){
  _mpState.active=_mpState.active===false?true:false;
  const btn=g('mp-active-btn');const lbl=g('mp-active-lbl');
  if(btn){btn.classList.toggle('on',_mpState.active!==false);btn.classList.toggle('off',_mpState.active===false);}
  if(lbl){lbl.textContent=_mpState.active!==false?'Aktif':'Nonaktif';lbl.style.color=_mpState.active!==false?'var(--p)':'var(--t2)';}
}

function _mpToggleDay(val,el){
  const days=_mpState.days||[];
  if(days.includes(val)){_mpState.days=days.filter(d=>d!==val);el.classList.remove('sel');}
  else{_mpState.days=[...days,val];el.classList.add('sel');}
}

function _mpSetOutletMode(mode){
  _mpState.outletMode=mode;
  if(mode==='all')_mpState.outlets=[];
  _mpRenderContent();
}

function _mpToggleOutlet(id){
  const outlets_=_mpState.outlets||[];
  if(outlets_.includes(id))_mpState.outlets=outlets_.filter(x=>x!==id);
  else _mpState.outlets=[...outlets_,id];
  const chips=g('mp-outlet-chips');
  if(chips)chips.querySelectorAll('.chip').forEach(c=>{
    const onclickAttr=c.getAttribute('onclick')||'';
    const m=onclickAttr.match(/'([^']+)'/);
    if(m)c.classList.toggle('on',(_mpState.outlets||[]).includes(m[1]));
  });
}

function _mpToggleAccord(type){
  if(type==='kiloan')_mpState._kiloanOpen=_mpState._kiloanOpen===false?true:false;
  else _mpState._satuanOpen=_mpState._satuanOpen===false?true:false;
  _mpRenderContent();
}

function _mpKiloanAllChg(cb){
  _mpState.kiloanTargets=cb.checked?['all']:[];
  _mpState.kiloanServiceTargets=cb.checked?['all']:[];
  const activePo=_activePoOptions('kiloan');
  activePo.forEach(po=>{const el=g('mp-k-'+po.key);if(el)el.checked=cb.checked;});
  serviceTypes.forEach(sv=>{const el=g('mp-ks-'+sv.id);if(el)el.checked=cb.checked;});
  const allSvcCb=g('mp-ks-all');if(allSvcCb)allSvcCb.checked=cb.checked;
  _mpRenderContent();
}

function _mpKiloanTierChg(key,cb){
  const t=_mpState.kiloanTargets||[];
  if(t[0]==='all'){_mpState.kiloanTargets=_activePoOptions('kiloan').map(po=>po.key).filter(k=>k!==key);}
  else if(cb.checked){if(!t.includes(key))_mpState.kiloanTargets=[...t,key];}
  else{_mpState.kiloanTargets=t.filter(k=>k!==key);}
  const allCb=g('mp-kiloan-all');
  if(allCb){const activePo=_activePoOptions('kiloan');const allChk=activePo.every(po=>(_mpState.kiloanTargets||[]).includes(po.key));allCb.checked=allChk;allCb.indeterminate=!allChk&&(_mpState.kiloanTargets||[]).length>0;}
  _mpRenderContent();
}

function _mpKiloanSvcAllChg(cb){
  _mpState.kiloanServiceTargets=cb.checked?['all']:[];
  serviceTypes.forEach(sv=>{const el=g('mp-ks-'+sv.id);if(el)el.checked=cb.checked;});
  _mpRenderContent();
}

function _mpKiloanSvcChg(id,cb){
  const t=_mpState.kiloanServiceTargets||[];
  if(t[0]==='all'){_mpState.kiloanServiceTargets=serviceTypes.map(sv=>sv.id).filter(k=>k!==id);}
  else if(cb.checked){if(!t.includes(id))_mpState.kiloanServiceTargets=[...t,id];}
  else{_mpState.kiloanServiceTargets=t.filter(k=>k!==id);}
  const allCb=g('mp-ks-all');
  if(allCb){const allChk=serviceTypes.every(sv=>(_mpState.kiloanServiceTargets||[]).includes(sv.id));allCb.checked=allChk;allCb.indeterminate=!allChk&&(_mpState.kiloanServiceTargets||[]).length>0;}
  _mpRenderContent();
}

function _mpMinQtyToggle(cb){
  _mpState.minQtyEnabled=cb.checked;
  _mpRenderContent();
}

function _mpSatuanAllChg(cb){
  _mpState.satuanTargets=cb.checked?['all']:[];
  document.querySelectorAll('.mp-matrix input[type="checkbox"]').forEach(el=>{el.checked=cb.checked;});
  _mpRenderContent();
}

function _mpMatrixChg(itemId,tierKey,cb){
  const t=_mpState.satuanTargets||[];
  const key=itemId+'-'+tierKey;
  if(t[0]==='all'){
    const activePo_=_activePoOptions('satuan');
    const activeSatuan_=satuanItems.filter(x=>x.active!==false);
    _mpState.satuanTargets=[];
    activeSatuan_.forEach(item=>activePo_.forEach(po=>{if(!(item.id===itemId&&po.key===tierKey))_mpState.satuanTargets.push(item.id+'-'+po.key);}));
  } else if(cb.checked){
    if(!t.includes(key))_mpState.satuanTargets=[...t,key];
  } else {
    _mpState.satuanTargets=t.filter(k=>k!==key);
  }
  const allCb=g('mp-satuan-all');
  if(allCb){
    const activePo_=_activePoOptions('satuan');
    const activeSatuan_=satuanItems.filter(x=>x.active!==false);
    const total=activeSatuan_.length*activePo_.length;
    const checked=(_mpState.satuanTargets||[]).length;
    allCb.checked=checked===total;
    allCb.indeterminate=checked>0&&checked<total;
  }
}

function _mpDiscTypeChg(val){
  _mpState.discType=val;
  _mpRenderContent();
}

function promoDiscChange(){} // kept for backward compat

// ── Open modal ──
function openAddPromo(){
  editPromoId=null;
  _mpStep=1;_mpMaxStep=1;
  _mpState={name:'',active:true,from:'',to:'',days:[],outletMode:'all',outlets:[],kiloanTargets:[],kiloanServiceTargets:[],satuanTargets:[],discType:'persen',discVal:0,note:'',useCode:false,codeType:'single',code:'',codes:[],minQtyEnabled:false,minQtyKiloan:0,minQtySatuan:0,_kiloanOpen:true,_satuanOpen:true};
  g('m-promo-title').textContent='Tambah Promo';
  _mpUpdateSidebar();
  _mpRenderContent();
  openModal('m-promo');
}

function openEditPromo(id){
  editPromoId=id;
  const p=promos.find(x=>x.id===id);if(!p)return;
  _mpStep=1;_mpMaxStep=5;
  let kiloanTargets=[];let satuanTargets=[];
  if(p.targets){
    kiloanTargets=p.targets.kiloan||[];
    satuanTargets=p.targets.satuan||[];
  } else if(p.svc){
    if(p.svc==='all'){kiloanTargets=['all'];satuanTargets=['all'];}
    else if(p.svc.startsWith('kiloan-')){kiloanTargets=[p.svc.replace('kiloan-','')];}
    else if(p.svc.startsWith('satuan-')){satuanTargets=['all'];}
  }
  _mpState={name:p.name,active:p.active!==false,from:p.from||'',to:p.to||'',days:[...(p.days||[])],outletMode:(p.outlets&&p.outlets.length)?'specific':'all',outlets:[...(p.outlets||[])],kiloanTargets,kiloanServiceTargets:[...(p.targets?.kiloanServices||[])],satuanTargets,discType:p.discType||'persen',discVal:p.discVal||0,note:p.note||'',useCode:p.useCode||false,codeType:p.codeType||'single',code:p.code||'',codes:[...(p.codes||[])],minQtyEnabled:p.minQty?.enabled||false,minQtyKiloan:p.minQty?.kiloan||0,minQtySatuan:p.minQty?.satuan||0,_kiloanOpen:true,_satuanOpen:true};
  g('m-promo-title').textContent='Edit Promo';
  _mpUpdateSidebar();
  _mpRenderContent();
  openModal('m-promo');
}

function savePromo(){
  _mpSaveCurrentStepState();
  const name=(_mpState.name||'').trim();
  if(!name){toast('Nama promo wajib diisi');_mpGo(1);return;}
  const val=_mpState.discVal||0;
  if(!val){toast('Nilai diskon wajib diisi');_mpGo(3);return;}
  const kt=_mpState.kiloanTargets||[];
  const st=_mpState.satuanTargets||[];
  let svc='all';
  if(kt.length&&!st.length){svc=kt[0]==='all'?'kiloan-all':'kiloan-'+kt[0];}
  else if(st.length&&!kt.length){svc=st[0]==='all'?'satuan-all':'satuan-'+((st[0]||'').split('-')[1]||'regular');}
  // Validate voucher code if enabled
  const useCode=_mpState.useCode||false;
  const codeType=_mpState.codeType||'single';
  if(useCode&&codeType==='single'&&!(_mpState.code||'').trim()){toast('Masukkan kode voucher atau nonaktifkan opsi kode voucher');_mpGo(5);return;}
  if(useCode&&codeType==='bulk'&&!(_mpState.codes||[]).length){toast('Import kode voucher terlebih dahulu atau nonaktifkan opsi kode voucher');_mpGo(5);return;}
  const ks=_mpState.kiloanServiceTargets||[];
  const obj={
    id:editPromoId||'pr'+promoCtr++,
    name,svc,
    targets:{kiloan:[...kt],kiloanServices:ks.length?[...ks]:['all'],satuan:[...st]},
    discType:_mpState.discType||'persen',
    discVal:val,
    days:[...(_mpState.days||[])],
    from:_mpState.from||'',
    to:_mpState.to||'',
    note:_mpState.note||'',
    active:_mpState.active!==false,
    outlets:[...(_mpState.outletMode==='all'?[]:(_mpState.outlets||[]))],
    useCode,
    codeType,
    code:useCode&&codeType==='single'?(_mpState.code||'').trim().toUpperCase():'',
    codes:useCode&&codeType==='bulk'?[...(_mpState.codes||[])]:[],
    minQty:{enabled:_mpState.minQtyEnabled||false,kiloan:_mpState.minQtyKiloan||0,satuan:_mpState.minQtySatuan||0}
  };
  if(editPromoId){const i=promos.findIndex(x=>x.id===editPromoId);if(i>=0)promos[i]={...promos[i],...obj,id:editPromoId};}
  else promos.unshift(obj);
  cm('m-promo');
  syncSettings();
  renderPromo();
  toast(editPromoId?'Promo diperbarui':'Promo ditambahkan: '+name);
}

// tDay kept for any old references
function tDay(el,day){el.classList.toggle('sel');const days=_mpState.days||[];if(el.classList.contains('sel')){if(!days.includes(day))_mpState.days=[...days,day];}else _mpState.days=days.filter(d=>d!==day);}
function buildPromoOutletChips(sel){}
function togglePromoOutlet(id){}
function rebuildPromoSvcSelect(){}

// ===== KAS KASIR =====
function setKasOutlet(id){kasOutlet=id;_kasPage=1;renderKas();}

function _kasDateRange(){
  if(kasDateFilter==='today')return{from:TODAY_ISO,to:TODAY_ISO};
  if(kasDateFilter==='yesterday'){const y=new Date(TODAY);y.setDate(y.getDate()-1);const ys=y.toISOString().split('T')[0];return{from:ys,to:ys};}
  if(kasDateFilter==='week'){const w=new Date(TODAY);w.setDate(w.getDate()-6);return{from:w.toISOString().split('T')[0],to:TODAY_ISO};}
  if(kasDateFilter==='month')return{from:TODAY_ISO.slice(0,7)+'-01',to:TODAY_ISO};
  return null;
}

function _kasFilteredList(){
  const range=_kasDateRange();
  let fl=kasOutlet==='all'?[...kasLog]:kasLog.filter(l=>!l.outletId||l.outletId===kasOutlet);
  if(range)fl=fl.filter(l=>{if(!l.date)return kasDateFilter==='today';return l.date>=range.from&&l.date<=range.to;});
  if(kasTypeFilter==='in')fl=fl.filter(l=>l.type==='in'&&!(l.desc||'').toLowerCase().includes('deposit'));
  else if(kasTypeFilter==='out')fl=fl.filter(l=>l.type==='out');
  else if(kasTypeFilter==='modal')fl=fl.filter(l=>l.type==='modal'||(l.type==='in'&&(l.desc||'').toLowerCase().includes('deposit')));
  else if(kasTypeFilter==='penjualan')fl=fl.filter(l=>l.type==='in'&&(l.desc||'').toLowerCase().includes('penjualan'));
  const q=(g('kas-search')?.value||'').toLowerCase().trim();
  if(q)fl=fl.filter(l=>(l.desc+' '+(l.note||'')).toLowerCase().includes(q));
  return fl;
}

function _kasTypeChip(el,val){
  kasTypeFilter=val;_kasPage=1;
  document.querySelectorAll('#kas-type-chips .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  renderKasLog();
}

function toggleKasSearch(){
  const w=g('kas-search-wrap');if(!w)return;
  const vis=w.style.display!=='none';
  w.style.display=vis?'none':'block';
  if(!vis){g('kas-search')?.focus();}
  else{if(g('kas-search'))g('kas-search').value='';renderKasLog();}
}

function toggleKasDateDd(){
  const dd=g('kas-date-dd');if(!dd)return;
  if(dd.style.display==='block'){dd.style.display='none';return;}
  const opts=[{v:'today',l:'Hari ini'},{v:'yesterday',l:'Kemarin'},{v:'week',l:'7 Hari Terakhir'},{v:'month',l:'Bulan Ini'},{v:'all',l:'Semua'}];
  dd.innerHTML=opts.map(o=>`<button class="${kasDateFilter===o.v?'on':''}" onclick="_setKasDate('${o.v}')">${esc(o.l)}</button>`).join('');
  dd.style.display='block';
  setTimeout(()=>document.addEventListener('click',function _cl(e){if(!g('kas-date-btn-wrap')?.contains(e.target)){dd.style.display='none';document.removeEventListener('click',_cl,true);}},true),0);
}

function _setKasDate(v){
  kasDateFilter=v;_kasPage=1;
  const lbl={today:'Hari ini',yesterday:'Kemarin',week:'7 Hari Terakhir',month:'Bulan Ini',all:'Semua'};
  const el=g('kas-date-lbl');if(el)el.textContent=lbl[v]||'Hari ini';
  const dd=g('kas-date-dd');if(dd)dd.style.display='none';
  renderKas();
}

function kasLoadMore(){_kasPage++;renderKasLog();}

function openKasDeposit(){
  kasTypeFilter='modal';_kasPage=1;
  document.querySelectorAll('#kas-type-chips .chip').forEach(c=>{c.classList.toggle('on',c.dataset.v==='modal');});
  renderKasLog();
  g('kas-log-card')?.scrollIntoView({behavior:'smooth'});
}

function renderKasLog(){
  const allFl=_kasFilteredList().sort((a,b)=>{
    const da=(a.date||'0000-00-00')+' '+(a.time||'00:00');
    const db=(b.date||'0000-00-00')+' '+(b.time||'00:00');
    return db.localeCompare(da);
  });
  const pageItems=allFl.slice(0,_kasPage*_KAS_PAGE);
  const hasMore=allFl.length>pageItems.length;
  const groups={};
  pageItems.forEach(l=>{const dk=l.date||'unknown';if(!groups[dk])groups[dk]=[];groups[dk].push(l);});
  const sortedDates=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  const yestISO=(()=>{const y=new Date(TODAY);y.setDate(y.getDate()-1);return y.toISOString().split('T')[0];})();
  const _dlbl=d=>{
    if(d==='unknown')return 'Tanggal tidak diketahui';
    const dd=new Date(d+'T00:00:00');
    const s=dd.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
    if(d===TODAY_ISO)return s+' (Hari ini)';
    if(d===yestISO)return s+' (Kemarin)';
    return s;
  };
  const _icoClass=l=>l.type==='modal'?'kas-tx-ico-modal':l.type==='out'?'kas-tx-ico-out':'kas-tx-ico-in';
  const _icoSvg=l=>{
    if(l.type==='out')return '<i data-lucide="arrow-up-circle" style="width:16px;height:16px;stroke-width:2;display:block"></i>';
    if(l.type==='modal')return '<i data-lucide="arrow-down-to-line" style="width:16px;height:16px;stroke-width:2;display:block"></i>';
    return '<i data-lucide="arrow-down-circle" style="width:16px;height:16px;stroke-width:2;display:block"></i>';
  };
  const _badge=l=>{
    if(l.type==='modal')return '<span class="kas-tx-badge kas-tx-badge-modal">Deposit</span>';
    if(l.type==='out')return '<span class="kas-tx-badge kas-tx-badge-out">Pengeluaran</span>';
    if((l.desc||'').toLowerCase().includes('penjualan'))return '<span class="kas-tx-badge kas-tx-badge-in">Penjualan</span>';
    return '<span class="kas-tx-badge kas-tx-badge-in">Pemasukan</span>';
  };
  const _amt=l=>{
    const cls=l.type==='out'?'kas-tx-amt-out':'kas-tx-amt-in';
    return `<div class="kas-tx-amt ${cls}">${l.type==='out'?'-':'+'}${fmt(l.amount)}</div>`;
  };
  const kl=g('kas-log');if(!kl)return;
  if(!sortedDates.length){
    kl.innerHTML='<div style="text-align:center;padding:32px 20px;color:var(--t2);font-size:13px">Belum ada riwayat kas</div>';
    if(g('kas-load-more-wrap'))g('kas-load-more-wrap').style.display='none';
    return;
  }
  kl.innerHTML=sortedDates.map(dk=>`<div class="kas-tx-group"><div class="kas-tx-date-hd">${_dlbl(dk)}</div>${groups[dk].map(l=>`<div class="kas-tx-row"><span class="kas-tx-ico ${_icoClass(l)}">${_icoSvg(l)}</span><div class="kas-tx-body"><div class="kas-tx-name">${esc(l.desc)}</div><div class="kas-tx-meta">${esc(l.note||'—')}</div></div>${_badge(l)}<div class="kas-tx-right"><div class="kas-tx-time">${esc(l.time||'—')}</div>${_amt(l)}</div></div>`).join('')}</div>`).join('');
  const lmw=g('kas-load-more-wrap');if(lmw)lmw.style.display=hasMore?'block':'none';
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function renderKas(){
  const kc=g('kas-outlet-chips');
  if(kc){
    if(kasOutlet==='all'&&outlets.length>0)kasOutlet=outlets[0].id;
    kc.innerHTML=outlets.map(o=>{const sc=safeColor(o.color);return `<span class="chip${kasOutlet===o.id?' on':''}" onclick="setKasOutlet('${o.id}')" style="${kasOutlet===o.id?`background:${sc}18;border-color:${sc};color:${sc}`:''}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sc};margin-right:5px;vertical-align:middle"></span>${esc(o.name)}</span>`;}).join('');
  }
  // Running balance (all-time, outlet-filtered)
  const allOtl=kasLog.filter(l=>kasOutlet==='all'||!l.outletId||l.outletId===kasOutlet);
  const saldo=allOtl.reduce((s,l)=>l.type==='out'?s-l.amount:s+l.amount,0);
  // Period metrics
  const range=_kasDateRange();
  let periodOtl=allOtl;
  if(range)periodOtl=allOtl.filter(l=>{if(!l.date)return kasDateFilter==='today';return l.date>=range.from&&l.date<=range.to;});
  const modal=periodOtl.filter(x=>x.type==='modal').reduce((s,x)=>s+x.amount,0);
  const cashIn=periodOtl.filter(x=>x.type==='in').reduce((s,x)=>s+x.amount,0);
  const cashOut=periodOtl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);
  // Insight: compare today vs yesterday
  const yestISO=(()=>{const y=new Date(TODAY);y.setDate(y.getDate()-1);return y.toISOString().split('T')[0];})();
  const todayNet=allOtl.filter(l=>l.date===TODAY_ISO).reduce((s,l)=>l.type==='out'?s-l.amount:s+l.amount,0);
  const yestNet=allOtl.filter(l=>l.date===yestISO).reduce((s,l)=>l.type==='out'?s-l.amount:s+l.amount,0);
  const diff=todayNet-yestNet;
  const isPos=diff>=0;
  // Summary cards
  const km=g('kas-metrics');
  if(km)km.innerHTML=`
    <div class="kas-sc kas-sc-main">
      <span class="kas-sc-ico"><i data-lucide="wallet" style="width:16px;height:16px;stroke-width:2;display:block"></i></span>
      <div class="kas-sc-lbl">Kas Saat Ini</div>
      <div class="kas-sc-val">${fmt(saldo)}</div>
      <div class="kas-sc-sub">Saldo tersedia di laci kas</div>
    </div>
    <div class="kas-sc kas-sc-orange">
      <span class="kas-sc-ico"><i data-lucide="coins" style="width:16px;height:16px;stroke-width:2;display:block"></i></span>
      <div class="kas-sc-lbl">Modal Awal</div>
      <div class="kas-sc-val">${fmt(modal)}</div>
      <div class="kas-sc-sub">Total modal yang disetor</div>
    </div>
    <div class="kas-sc kas-sc-softgreen">
      <span class="kas-sc-ico"><i data-lucide="trending-up" style="width:16px;height:16px;stroke-width:2;display:block"></i></span>
      <div class="kas-sc-lbl">Pemasukan Cash</div>
      <div class="kas-sc-val">+${fmt(cashIn)}</div>
      <div class="kas-sc-sub">Total pemasukan hari ini</div>
    </div>
    <div class="kas-sc kas-sc-red">
      <span class="kas-sc-ico"><i data-lucide="trending-down" style="width:16px;height:16px;stroke-width:2;display:block"></i></span>
      <div class="kas-sc-lbl">Pengeluaran Cash</div>
      <div class="kas-sc-val">-${fmt(cashOut)}</div>
      <div class="kas-sc-sub">Total pengeluaran hari ini</div>
    </div>`;
  // Insight card
  const ki=g('kas-insight');
  if(ki)ki.innerHTML=`
    <span class="kas-insight-ico"><i data-lucide="${isPos?'trending-up':'trending-down'}" style="width:24px;height:24px;stroke-width:2;display:block"></i></span>
    <div style="flex:1;min-width:0">
      <div class="kas-insight-title">Insight Hari Ini</div>
      <div class="kas-insight-val">Kas ${isPos?'bertambah':'berkurang'} ${fmt(Math.abs(diff))}</div>
      <div class="kas-insight-sub">Dibandingkan kemarin (${new Date(yestISO+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})})</div>
    </div>`;
  renderKasLog();
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function openKas(type){
  kasType=type;
  g('m-kas-title').textContent=type==='setor'?'Setor Modal':'Tarik Kas';
  g('mk-nom').value='';g('mk-note').value='';g('mk-hint').textContent='';
  openModal('m-kas');
}
function kasNomHint(){const v=parseInt(g('mk-nom').value)||0;g('mk-hint').textContent=v>0?'= '+fmt(v):'';}
function submitKas(){
  const nom=parseInt(g('mk-nom').value)||0;
  if(!nom||nom<=0){toast('\u26A0\uFE0F Masukkan nominal yang valid');return;}
  if(kasType==='tarik'){
    const fl=kasLog.filter(l=>kasOutlet==='all'||!l.outletId||l.outletId===kasOutlet);
    const s=fl.reduce((s,l)=>l.type==='out'?s-l.amount:s+l.amount,0);
    if(nom>s){toast('\u26A0\uFE0F Nominal melebihi saldo ('+fmt(s)+')');return;}
  }
  const oid=kasOutlet!=='all'?kasOutlet:(curStaff?.oid||null);
  kasLog.push({id:kasCtr++,type:kasType==='setor'?'modal':'out',desc:kasType==='setor'?'Setor Modal':'Tarik Kas',note:g('mk-note').value||'—',amount:nom,time:NOW(),date:TODAY_ISO,outletId:oid});
  cm('m-kas');renderKas();
  toast(kasType==='setor'?'\u2713 Modal disetor: '+fmt(nom):'\u2713 Kas ditarik: '+fmt(nom));
}

// ===== EXPENSES =====
function setExpOutlet(id){expOutlet=id;renderExpenses();}
function renderExpenses(){
  const ec=g('exp-outlet-chips');if(ec)ec.innerHTML=buildOutletFilterChips(expOutlet,'setExpOutlet');
  const exo=g('ex-outlet');if(exo&&!exo.options.length)outlets.forEach(o=>{const opt=document.createElement('option');opt.value=o.id;opt.textContent=o.name;exo.appendChild(opt);});
  const today=TODAY_ISO,thisMonth=today.slice(0,7);
  const filtExp=expOutlet==='all'?expenses:expenses.filter(e=>!e.outletId||e.outletId===expOutlet);
  const expToday=filtExp.filter(e=>e.date===today).reduce((s,e)=>s+e.nominal,0);
  const expMonth=filtExp.filter(e=>e.date.startsWith(thisMonth)).reduce((s,e)=>s+e.nominal,0);
  const filtOrd=expOutlet==='all'?orders:orders.filter(o=>o.outletId===expOutlet);
  const rev=filtOrd.filter(o=>o.payStatus==='Lunas'&&o.isoDate&&_orderDateISO(o).startsWith(thisMonth)).reduce((s,o)=>s+o.total,0);
  const profit=rev-expMonth;
  const outLbl=expOutlet==='all'?'Semua Outlet':(outlets.find(o=>o.id===expOutlet)?.name||'');
  const em=g('exp-metrics');if(em)em.innerHTML=`<div class="mc2 cam"><div class="ml">Pengeluaran Hari Ini${outLbl?` \u00B7 ${outLbl}`:''}</div><div class="mv" style="font-size:16px">${fmt(expToday)}</div></div><div class="mc2 cr"><div class="ml">Pengeluaran Bulan Ini</div><div class="mv" style="font-size:16px">${fmt(expMonth)}</div></div><div class="mc2 ${profit>=0?'cg':'cr'}"><div class="ml">Estimasi Profit</div><div class="mv" style="font-size:16px">${profit>=0?'+':'-'}${fmt(Math.abs(profit))}</div></div>`;
  const filter=g('ex-filter')?.value||'all';
  const list=[...filtExp].reverse().filter(e=>{if(filter==='today')return e.date===today;if(filter==='month')return e.date.startsWith(thisMonth);return true;});
  const el=g('exp-log');if(!el)return;
  el.innerHTML=list.length?list.map(e=>{const _oc=e.outletId?go(e.outletId):null;const _oColor=_oc?.color?safeColor(_oc.color):'var(--t2)';return `<div class="li_" style="align-items:flex-start;flex-wrap:wrap;gap:6px"><div class="lic" style="margin-top:2px">${CAT_ICONS[e.cat]||'\uD83D\uDCE6'}</div><div id="exp-view-${e.id}" style="flex:1;min-width:0"><div style="font-weight:600">${esc(e.label)}</div><div style="font-size:11px;color:var(--t2);margin-top:2px">${esc(e.note||'')} \u00B7 ${e.src==='cash'?'\uD83D\uDCB5 Cash':'\uD83C\uDFE6 Transfer'} \u00B7 ${esc(e.date)}${_oc?` \u00B7 <span style='color:${_oColor};font-weight:600'>${esc(_oc.name||'')}</span>`:''}</div></div><div id="exp-edit-${e.id}" style="flex:1;min-width:0;display:none"><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px"><input id="ee-nom-${e.id}" type="number" value="${e.nominal}" placeholder="Nominal" style="font-size:12px;padding:6px 8px"><input id="ee-date-${e.id}" type="date" value="${esc(e.date)}" style="font-size:12px;padding:6px 8px"></div><input id="ee-note-${e.id}" value="${esc(e.note||'')}" placeholder="Catatan..." style="font-size:12px;padding:6px 8px;width:100%;margin-bottom:5px"><div style="display:flex;gap:5px"><button class="btn bp bsm" onclick="saveExpEdit(${e.id})">Simpan</button><button class="btn bsm" onclick="cancelExpEdit(${e.id})">Batal</button></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0"><div style="font-weight:700;color:var(--re)">-${fmt(e.nominal)}</div><div style="display:flex;gap:4px"><button class="btn bsm" onclick="startExpEdit(${e.id})">Edit</button><button class="btn bre bsm" onclick="delExpense(${e.id})">Hapus</button></div></div></div>`;}).join(''):'<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Tidak ada data</div>';
}
function startExpEdit(id){document.getElementById('exp-view-'+id).style.display='none';document.getElementById('exp-edit-'+id).style.display='block';}
function cancelExpEdit(id){document.getElementById('exp-view-'+id).style.display='block';document.getElementById('exp-edit-'+id).style.display='none';}
function saveExpEdit(id){const e=expenses.find(x=>x.id===id);if(!e)return;const nom=parseInt(document.getElementById('ee-nom-'+id)?.value)||0;const date=document.getElementById('ee-date-'+id)?.value||e.date;const note=document.getElementById('ee-note-'+id)?.value||'';if(!nom){toast('\u26A0\uFE0F Nominal tidak valid');return;}e.nominal=nom;e.date=date;e.note=note;renderExpenses();toast('\u2713 Pengeluaran diperbarui');}
function delExpense(id){confirm_('Hapus Pengeluaran?','Data ini akan dihapus permanen.',()=>{expenses=expenses.filter(x=>x.id!==id);renderExpenses();toast('Pengeluaran dihapus');});}
function exCatChg(){g('ex-lain-w').style.display=g('ex-cat').value==='lain'?'block':'none';}
function exNomChg(){exSrcChg();}
function exSrcChg(){const src=g('ex-src').value,nom=parseInt(g('ex-nom').value)||0;const w=g('ex-kas-w');if(!w)return;if(src==='cash'){const oid=g('ex-outlet')?.value||kasOutlet;const fl=kasLog.filter(l=>!l.outletId||l.outletId===oid);const s=fl.filter(x=>x.type!=='out').reduce((s,x)=>s+x.amount,0)-fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);if(nom>s){w.style.display='block';w.style.background='var(--reb)';w.style.color='var(--re)';w.style.border='1px solid var(--re)';w.textContent='\u26A0\uFE0F Saldo kas tidak cukup. Saldo: '+fmt(s);}else if(nom>0){w.style.display='block';w.style.background='var(--pl)';w.style.color='#3d6b10';w.style.border='1px solid var(--p)';w.textContent='\u2713 Saldo mencukupi. Setelah: '+fmt(s-nom);}else w.style.display='none';}else w.style.display='none';}
function submitExpense(){const cat=g('ex-cat').value,nom=parseInt(g('ex-nom').value)||0,date=g('ex-date').value,src=g('ex-src').value,note=g('ex-note').value;if(!nom||nom<=0){toast('\u26A0\uFE0F Masukkan nominal yang valid');return;}if(!date){toast('\u26A0\uFE0F Pilih tanggal');return;}if(cat==='lain'&&!g('ex-lain-n').value.trim()){toast('\u26A0\uFE0F Isi nama pengeluaran');return;}const expOut=g('ex-outlet')?.value||outlets[0]?.id||'o1';if(src==='cash'){const fl=kasLog.filter(l=>!l.outletId||l.outletId===expOut);const s=fl.filter(x=>x.type!=='out').reduce((s,x)=>s+x.amount,0)-fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);if(nom>s){toast('\u26A0\uFE0F Saldo kas tidak cukup!');return;}kasLog.push({id:kasCtr++,type:'out',desc:'Pengeluaran: '+(CAT_LBL[cat]||cat),note:note||'—',amount:nom,time:NOW(),date:TODAY_ISO,outletId:expOut});}const label=cat==='lain'?g('ex-lain-n').value.trim():CAT_LBL[cat];expenses.push({id:expCtr++,cat,label,nominal:nom,date,note,src,outletId:expOut});['ex-nom','ex-note','ex-lain-n'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('ex-kas-w'))g('ex-kas-w').style.display='none';renderExpenses();renderKas();toast(src==='cash'?'\u2713 Pengeluaran dicatat \u00B7 Kas berkurang '+fmt(nom):'\u2713 Pengeluaran dicatat via Transfer');}

// ===== REPORTS =====
const _RPT_PERIODS=[
  {v:'today',l:'Hari Ini'},{v:'week',l:'7 Hari Terakhir'},{v:'month',l:'Bulan Ini'},
  {v:'3month',l:'3 Bulan Terakhir'},{v:'year',l:'Tahun Ini'},{v:'custom',l:'Kustom'}
];
function toggleRptPeriodDd(){
  const dd=g('rpt-period-dd');if(!dd)return;
  if(dd.style.display==='block'){dd.style.display='none';return;}
  dd.innerHTML=_RPT_PERIODS.map(p=>`<button class="rpt-period-opt${rptFilter===p.v?' on':''}" onclick="setRpt('${p.v}');g('rpt-period-dd').style.display='none'">${p.l}</button>`).join('');
  dd.style.display='block';
  setTimeout(()=>document.addEventListener('click',function _cl(e){if(!g('rpt-period-wrap')?.contains(e.target)){dd.style.display='none';document.removeEventListener('click',_cl,true);}},true),0);
}
function setRptOutlet(id){rptOutlet=id;_rptTxPage=1;renderReports();}
function setRpt(f){
  rptFilter=f;_rptTxPage=1;
  const lbl=_RPT_PERIODS.find(p=>p.v===f)?.l||'Hari Ini';
  const el=g('rpt-period-lbl');if(el)el.textContent=lbl;
  const rc=g('rpt-custom');if(rc)rc.style.display=f==='custom'?'flex':'none';
  if(f!=='custom')renderReports();
}
function openRptFilter(){
  // populate outlet chips
  const oc=g('rpt-f-outlets');
  if(oc){const all=[{id:'all',name:'Semua'},...outlets];oc.innerHTML=all.map(o=>`<button class="chip rft-o${rptOutlet===o.id?' on':''}" data-v="${o.id}" onclick="_rftChip(this,'o')">${esc(o.name)}</button>`).join('');}
  // restore status/pay chips
  document.querySelectorAll('.rft-s').forEach(b=>b.classList.toggle('on',b.dataset.v===rptStatusFilter));
  document.querySelectorAll('.rft-p').forEach(b=>b.classList.toggle('on',b.dataset.v===rptPayFilter));
  openModal('m-rpt-filter');
}
function _rftChip(el,group){
  const cls='.rft-'+group;
  document.querySelectorAll(cls).forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
}
function applyRptFilter(){
  const outletEl=document.querySelector('.rft-o.on');
  const statusEl=document.querySelector('.rft-s.on');
  const payEl=document.querySelector('.rft-p.on');
  if(outletEl)rptOutlet=outletEl.dataset.v;
  rptStatusFilter=statusEl?statusEl.dataset.v:'';
  rptPayFilter=payEl?payEl.dataset.v:'';
  _rptTxPage=1;
  cm('m-rpt-filter');
  renderReports();
}
function resetRptFilters(){
  rptOutlet='all';rptStatusFilter='';rptPayFilter='';_rptTxPage=1;
  cm('m-rpt-filter');
  renderReports();
}
function _rptUpdatePeriodUI(){
  const lbl=_RPT_PERIODS.find(p=>p.v===rptFilter)?.l||'Hari Ini';
  const el=g('rpt-period-lbl');if(el)el.textContent=lbl;
}
function _rptUpdateSummary(filteredCount){
  let parts=[];
  if(rptOutlet!=='all'){const o=outlets.find(x=>x.id===rptOutlet);parts.push(o?.name||rptOutlet);}
  else parts.push('Semua Outlet');
  let activeFilters=0;
  if(rptStatusFilter)activeFilters++;
  if(rptPayFilter)activeFilters++;
  const txt=g('rpt-summary-txt');
  if(txt)txt.textContent=parts.join(' · ')+(activeFilters?` · ${activeFilters} filter aktif`:'')+(filteredCount!==undefined?` · ${filteredCount} transaksi`:'');
  const rb=g('rpt-reset-btn');
  if(rb)rb.style.display=(rptOutlet!=='all'||rptStatusFilter||rptPayFilter)?'inline':'none';
  // update filter badge
  const fb=g('rpt-filter-badge');
  if(fb){const n=(rptOutlet!=='all'?1:0)+(rptStatusFilter?1:0)+(rptPayFilter?1:0);fb.textContent=n;fb.style.display=n?'inline-flex':'none';}
}
function filterOrdersByDate(){
  const today=TODAY_ISO,thisMonth=today.slice(0,7);
  const ld=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  let base=rptOutlet==='all'?orders:orders.filter(o=>o.outletId===rptOutlet);
  if(rptFilter==='today')base=base.filter(o=>_orderDateISO(o)===today);
  else if(rptFilter==='week'){const d=new Date(TODAY);d.setDate(d.getDate()-6);base=base.filter(o=>o.isoDate&&_orderDateISO(o)>=ld(d));}
  else if(rptFilter==='month')base=base.filter(o=>o.isoDate&&_orderDateISO(o).startsWith(thisMonth));
  else if(rptFilter==='3month'){const d=new Date(TODAY);d.setMonth(d.getMonth()-3);base=base.filter(o=>o.isoDate&&_orderDateISO(o)>=ld(d));}
  else if(rptFilter==='year'){const d=new Date(TODAY);d.setFullYear(d.getFullYear()-1);base=base.filter(o=>o.isoDate&&_orderDateISO(o)>=ld(d));}
  else if(rptFilter==='custom'){const fr=g('rpt-from')?.value,to=g('rpt-to')?.value;if(fr&&to)base=base.filter(o=>o.isoDate&&_orderDateISO(o)>=fr&&_orderDateISO(o)<=to);}
  if(rptStatusFilter)base=base.filter(o=>o.status===rptStatusFilter);
  if(rptPayFilter)base=base.filter(o=>o.payStatus===rptPayFilter);
  return base;
}
function _rptSetTxPage(p){_rptTxPage=p;renderReports();}
function renderReports(){
  _rptUpdatePeriodUI();
  const filtered=filterOrdersByDate();
  const fr=rptFilter==='custom'?g('rpt-from')?.value:'';
  const to_=rptFilter==='custom'?g('rpt-to')?.value:'';
  const ld=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  // expenses filtered by same date/outlet range (not by status/pay)
  const baseExp=rptOutlet==='all'?expenses:expenses.filter(e=>!e.outletId||e.outletId===rptOutlet);
  const filtExp=baseExp.filter(e=>{
    if(rptFilter==='today')return e.date===TODAY_ISO;
    if(rptFilter==='week'){const d=new Date(TODAY);d.setDate(d.getDate()-6);return e.date>=ld(d);}
    if(rptFilter==='month')return e.date.startsWith(TODAY_ISO.slice(0,7));
    if(rptFilter==='3month'){const d=new Date(TODAY);d.setMonth(d.getMonth()-3);return e.date>=ld(d);}
    if(rptFilter==='year'){const d=new Date(TODAY);d.setFullYear(d.getFullYear()-1);return e.date>=ld(d);}
    if(rptFilter==='custom'&&fr&&to_)return e.date>=fr&&e.date<=to_;
    return true;
  });
  const rev=filtered.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0);
  const totalExp=filtExp.reduce((s,e)=>s+e.nominal,0);
  const profit=rev-totalExp;
  _rptUpdateSummary(filtered.length);

  // --- KPI cards ---
  const avgOrder=filtered.length?Math.round(rev/filtered.length):0;
  const paidCount=filtered.filter(o=>o.payStatus==='Lunas').length;
  const rm=g('rpt-metrics');
  if(rm)rm.innerHTML=`
    <div class="rpt-kpi">
      <div class="rpt-kpi-icon" style="background:#e8f5e9"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#43a047" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
      <div class="rpt-kpi-lbl">Pendapatan</div>
      <div class="rpt-kpi-val">${fmt(rev)}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:4px">${filtered.length} pesanan</div>
    </div>
    <div class="rpt-kpi">
      <div class="rpt-kpi-icon" style="background:#fce4ec"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div>
      <div class="rpt-kpi-lbl">Pengeluaran</div>
      <div class="rpt-kpi-val">${fmt(totalExp)}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:4px">${filtExp.length} item</div>
    </div>
    <div class="rpt-kpi">
      <div class="rpt-kpi-icon" style="background:${profit>=0?'#e8f5e9':'#fce4ec'}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${profit>=0?'#43a047':'#e53935'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <div class="rpt-kpi-lbl">Profit Bersih</div>
      <div class="rpt-kpi-val" style="color:${profit>=0?'var(--p)':'var(--re)'}">${profit>=0?'+':''}${fmt(profit)}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:4px">Margin ${rev?Math.round(profit/rev*100):0}%</div>
    </div>
    <div class="rpt-kpi">
      <div class="rpt-kpi-icon" style="background:#e3f2fd"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e88e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
      <div class="rpt-kpi-lbl">Rata-rata Order</div>
      <div class="rpt-kpi-val">${fmt(avgOrder)}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:4px">${paidCount} lunas</div>
    </div>`;

  // --- Income vs Expense bars ---
  const maxBar=Math.max(rev,totalExp,1);
  const revPct=Math.round(rev/maxBar*100);
  const expPct=Math.round(totalExp/maxBar*100);
  const rexp=g('rpt-exp');
  if(rexp)rexp.innerHTML=`
    <div class="rpt-bar-row" style="margin-bottom:10px">
      <div class="rpt-bar-dot" style="background:#43a047"></div>
      <div class="rpt-bar-lbl">Pemasukan</div>
      <div class="rpt-bar-track"><div class="rpt-bar-fill" style="width:${revPct}%;background:#43a047"></div></div>
      <div class="rpt-bar-amt">${fmt(rev)}</div>
    </div>
    <div class="rpt-bar-row">
      <div class="rpt-bar-dot" style="background:#e53935"></div>
      <div class="rpt-bar-lbl">Pengeluaran</div>
      <div class="rpt-bar-track"><div class="rpt-bar-fill" style="width:${expPct}%;background:#e53935"></div></div>
      <div class="rpt-bar-amt">${fmt(totalExp)}</div>
    </div>
    ${filtExp.length?`<div style="border-top:1.5px solid var(--b1);margin-top:14px;padding-top:12px">
      <div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Detail Pengeluaran</div>
      ${filtExp.map(e=>`<div class="rpt-exp-row"><div style="width:26px;height:26px;border-radius:7px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px">${CAT_ICONS[e.cat]||'📦'}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12px">${esc(e.label)}</div>${e.note?`<div style="font-size:11px;color:var(--t2)">${esc(e.note)}</div>`:''}</div><div style="text-align:right;flex-shrink:0"><div style="font-weight:700;font-size:12px;color:var(--re)">-${fmt(e.nominal)}</div><div style="font-size:10px;color:var(--t2)">${esc(e.date.slice(5))}</div></div></div>`).join('')}
    </div>`:''}`;

  // --- Payment breakdown ---
  const pm={Tunai:0,QRIS:0,Transfer:0};
  filtered.filter(o=>o.payStatus==='Lunas').forEach(o=>{if(pm[o.payMethod]!==undefined)pm[o.payMethod]+=o.total;});
  const pmTotal=Object.values(pm).reduce((s,v)=>s+v,0)||1;
  const rp=g('rpt-pay');
  if(rp)rp.innerHTML=Object.entries(pm).map(([k,v])=>`
    <div class="rpt-pay-row">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="rpt-bar-dot" style="background:var(--p)"></div>
        <span style="font-size:13px">${k}</span>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;font-size:13px">${fmt(v)}</div>
        <div style="font-size:10px;color:var(--t2)">${Math.round(v/pmTotal*100)}%</div>
      </div>
    </div>`).join('');

  // --- Service types ---
  const sv={...Object.fromEntries(serviceTypes.map(s=>[s.id,0])),satuan:0};
  filtered.forEach(o=>{if(sv[o.svcType]!==undefined)sv[o.svcType]++;});
  const maxSv=Math.max(...Object.values(sv),1);
  const rs=g('rpt-svc');
  if(rs)rs.innerHTML=Object.entries(sv).map(([k,v])=>`
    <div class="rpt-svc-row">
      <span style="font-size:12px;flex:1">${esc(getSvcById(k)?.name||(k==='satuan'?'Satuan':k))}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:60px;height:5px;background:var(--b1);border-radius:4px;overflow:hidden"><div style="width:${Math.round(v/maxSv*100)}%;height:100%;background:var(--p);border-radius:4px"></div></div>
        <span style="font-size:12px;font-weight:700;min-width:20px;text-align:right">${v}</span>
      </div>
    </div>`).join('');

  // --- Paginated transaction table ---
  const _PER=10;
  const _tp=Math.max(1,Math.ceil(filtered.length/_PER));
  if(_rptTxPage>_tp)_rptTxPage=_tp;
  const paged=filtered.slice((_rptTxPage-1)*_PER,_rptTxPage*_PER);
  const rt=g('rpt-tb');
  if(rt)rt.innerHTML=paged.length?paged.map(o=>`<tr>
    <td style="font-size:11px;font-family:monospace;white-space:nowrap">${esc(o.id)}</td>
    <td>${esc(o.name||'—')}</td>
    <td style="white-space:nowrap">${esc(getSvcLbl(o.svcType+'-'+o.svcCat)||o.svcType||'')}</td>
    <td style="font-weight:700;white-space:nowrap">${fmt(o.total)}</td>
    <td><span class="badge ${SL_STATUS[o.status]||''}">${esc(o.status||'')}</span></td>
    <td><span class="badge ${SL_PAY[o.payStatus]||''}">${esc(o.payStatus||'')}</span></td>
    <td style="font-size:11px;color:var(--t2);white-space:nowrap">${esc(o.date||'')}</td>
  </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--t2)">Tidak ada data untuk periode ini</td></tr>';

  // Pager
  const rtp=g('rpt-tx-pager');
  if(!rtp)return;
  if(_tp<=1){rtp.innerHTML='';return;}
  let pages=[];
  for(let i=1;i<=_tp;i++){
    if(i===1||i===_tp||Math.abs(i-_rptTxPage)<=1)pages.push(i);
    else if(pages[pages.length-1]!=='…')pages.push('…');
  }
  rtp.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;gap:5px;padding:12px 0">
    <button class="btn bsm" ${_rptTxPage===1?'disabled':''} onclick="_rptSetTxPage(${_rptTxPage-1})" style="min-width:32px;padding:0 8px">‹</button>
    ${pages.map(p=>p==='…'?`<span style="color:var(--t2);font-size:13px;padding:0 2px">…</span>`:`<button class="btn bsm${p===_rptTxPage?' bp':''}" onclick="_rptSetTxPage(${p})" style="min-width:32px;padding:0 8px">${p}</button>`).join('')}
    <button class="btn bsm" ${_rptTxPage===_tp?'disabled':''} onclick="_rptSetTxPage(${_rptTxPage+1})" style="min-width:32px;padding:0 8px">›</button>
  </div>`;
}

// ===== PRINTER =====
function savePrintersToStorage(){try{localStorage.setItem(_PRINTERS_KEY,JSON.stringify(printers));}catch(e){console.error('[storage] printers:',e);}}
function loadPrintersFromStorage(){try{const raw=localStorage.getItem(_PRINTERS_KEY);if(raw){const d=JSON.parse(raw);if(Array.isArray(d)){printers=d;printerCtr=printers.reduce((mx,p)=>{const n=parseInt((p.id||'').replace(/\D/g,''));return isNaN(n)?mx:Math.max(mx,n);},0)+1;}}}catch(e){console.error('[storage] load printers:',e);}}
function renderPrinters(){
  const items=printers.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px"><div style="width:40px;height:40px;border-radius:10px;background:var(--pl);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--p)"><i data-lucide="printer" style="width:20px;height:20px;stroke-width:1.75;display:block"></i></div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${esc(p.name)}</div><div style="font-size:11px;color:var(--t2);margin-top:2px">${{usb:'USB',bluetooth:'Bluetooth',network:'LAN/WiFi'}[p.conn]||p.conn} \u00B7 ${esc(p.width)}mm \u00B7 ${p.role==='receipt'?'Struk':p.role==='label'?'Label':'\u2014'}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px"><div style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:${p.status==='online'?'var(--p)':'var(--re)'};display:inline-block"></span><span style="font-size:11px;color:var(--t2)">${p.status==='online'?'Online':'Offline'}</span></div><div style="display:flex;gap:5px">${p.conn==='bluetooth'?`<button class="btn bsm" onclick="testBtPrinter('${p.id}')">Test</button>`:''}<button class="btn bsm" onclick="editPrinter('${p.id}')">Edit</button><button class="btn bre bsm" onclick="delPrinter('${p.id}')">Hapus</button></div></div></div>`).join('');
  const el=g('printer-list');if(el)el.innerHTML=items;
  const sel=g('s-printer-list');if(sel)sel.innerHTML=items||(printers.length?'':'<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Belum ada printer.</div>');
  const empty=g('printer-empty');if(empty)empty.style.display=printers.length?'none':'';
  if(printers.length&&el)lucide.createIcons({nodes:[el]});
}
function openAddPrinter(){_editPrinterId=null;btDevice=null;['mpr-n'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('mpr-c'))g('mpr-c').value='usb';if(g('mpr-w'))g('mpr-w').value='58';if(g('mpr-ip'))g('mpr-ip').value='';if(g('mpr-ip-w'))g('mpr-ip-w').style.display='none';if(g('mpr-r'))g('mpr-r').value='none';if(g('mpr-bt-section'))g('mpr-bt-section').style.display='none';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';if(g('bt-found-wrap'))g('bt-found-wrap').style.display='none';if(g('bt-scan-status'))g('bt-scan-status').textContent='';const warn=g('bt-support-warn');if(warn)warn.style.display='none';const t=g('m-printer-title');if(t)t.textContent='Tambah Printer';openModal('m-printer');}
function editPrinter(id){const p=printers.find(x=>x.id===id);if(!p)return;_editPrinterId=id;btDevice=null;if(g('mpr-n'))g('mpr-n').value=p.name;if(g('mpr-c')){g('mpr-c').value=p.conn;prConnChg();}if(g('mpr-w'))g('mpr-w').value=p.width;if(g('mpr-ip'))g('mpr-ip').value=p.ip||'';if(g('mpr-r'))g('mpr-r').value=p.role;if(g('bt-found-wrap'))g('bt-found-wrap').style.display='none';if(g('bt-scan-status'))g('bt-scan-status').textContent='';const t=g('m-printer-title');if(t)t.textContent='Edit Printer';openModal('m-printer');}
function prConnChg(){const conn=g('mpr-c').value;if(g('mpr-ip-w'))g('mpr-ip-w').style.display=conn==='network'?'block':'none';const btSec=g('mpr-bt-section');const manSec=g('mpr-manual-section');if(conn==='bluetooth'){if(btSec)btSec.style.display='block';if(manSec)manSec.style.display='none';btDevice=null;if(g('bt-found-wrap'))g('bt-found-wrap').style.display='none';if(g('bt-scan-status'))g('bt-scan-status').textContent='';const warn=g('bt-support-warn');if(!navigator.bluetooth){if(warn){warn.style.display='block';warn.textContent='\u26A0\uFE0F Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome di Android/Desktop. iOS Safari tidak didukung.';}}else if(warn)warn.style.display='none';}else{if(btSec)btSec.style.display='none';if(manSec)manSec.style.display='block';}}
async function scanBluetooth(){const btn=g('bt-scan-btn');const status=g('bt-scan-status');if(!navigator.bluetooth){status.textContent='\u274C Browser tidak mendukung Bluetooth.';status.style.color='var(--re)';return;}btn.disabled=true;btn.textContent='\uD83D\uDD0D Mencari...';status.textContent='Membuka dialog pemilihan perangkat...';status.style.color='var(--t2)';try{const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['000018f0-0000-1000-8000-00805f9b34fb','0000ff00-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb','battery_service','generic_access']});btDevice=device;status.textContent='\u2713 Perangkat dipilih!';status.style.color='var(--p)';const fw=g('bt-found-wrap');const dn=g('bt-device-name');if(fw)fw.style.display='block';if(dn)dn.textContent=device.name||'Printer Bluetooth';if(g('mpr-n'))g('mpr-n').value=device.name||'Printer Bluetooth';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';toast('\u2713 Printer "'+(device.name||'Bluetooth')+'" ditemukan!');}catch(e){status.textContent=e.name==='NotFoundError'?'Pencarian dibatalkan.':'\u274C Gagal: '+e.message;status.style.color=e.name==='NotFoundError'?'var(--t2)':'var(--re)';}finally{btn.disabled=false;btn.textContent='\uD83D\uDD0D Cari Printer Bluetooth';}}
function selectBtDevice(){if(!btDevice)return;if(g('mpr-n'))g('mpr-n').value=btDevice.name||'Printer Bluetooth';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';toast('\u2713 Printer dipilih: '+(btDevice.name||'BT Printer'));}
async function testBtPrinter(id){const p=printers.find(x=>x.id===id);if(!p)return;if(!navigator.bluetooth){toast('\u26A0\uFE0F Browser tidak mendukung Web Bluetooth');return;}toast('\uD83D\uDCF6 Menghubungi printer '+p.name+'...');try{const device=await navigator.bluetooth.requestDevice({filters:[{name:p.name}],optionalServices:['000018f0-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb']});const server=await device.gatt.connect();p.status='online';renderPrinters();toast('\u2713 '+p.name+' terhubung!');server.disconnect();}catch(e){p.status='offline';renderPrinters();toast('\u274C Gagal terhubung ke '+p.name);}}
function savePrinter(){const name=g('mpr-n')?.value.trim();if(!name){toast('\u26A0\uFE0F Nama printer wajib diisi');return;}const conn=g('mpr-c').value;const width=g('mpr-w').value;const role=g('mpr-r').value;const ip=g('mpr-ip')?.value||'';if(_editPrinterId){const p=printers.find(x=>x.id===_editPrinterId);if(!p)return;if(role!=='none')printers.forEach(q=>{if(q.id!==_editPrinterId&&q.role===role)q.role='none';});p.name=name;p.conn=conn;p.ip=ip;p.width=width;p.role=role;_editPrinterId=null;cm('m-printer');renderPrinters();savePrintersToStorage();toast('\u2713 Printer diperbarui!');}else{if(role!=='none')printers.forEach(p=>{if(p.role===role)p.role='none';});printers.push({id:'p'+printerCtr++,name,conn,ip,width,role,status:'online',btId:btDevice?.id||null});btDevice=null;cm('m-printer');renderPrinters();savePrintersToStorage();toast('\u2713 Printer "'+name+'" ditambahkan!');}}
function delPrinter(id){confirm_('Hapus Printer?','Printer ini akan dihapus dari daftar.',()=>{printers=printers.filter(x=>x.id!==id);renderPrinters();savePrintersToStorage();toast('Printer dihapus');});}

// ===== BLUETOOTH PRINT ENGINE =====
const BT_SERVICES=['000018f0-0000-1000-8000-00805f9b34fb','0000ff00-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb'];
const BT_CHARS=['00002af1-0000-1000-8000-00805f9b34fb','0000ff02-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb'];
let _btConnectedDevice=null;
const _BT_ID_KEY='cleanpos_bt_device_id';
function escCmd(...bytes){return new Uint8Array(bytes);}
function escText(str){return new TextEncoder().encode(str);}
function concat(...arrays){const total=arrays.reduce((s,a)=>s+a.length,0);const out=new Uint8Array(total);let offset=0;arrays.forEach(a=>{out.set(a,offset);offset+=a.length;});return out;}
// ASCII-safe number formatter for ESC/POS — avoids locale-specific Unicode separators
// that can corrupt the byte stream on some Android WebView versions.
function fmtAmt(n){return String(Math.round(Math.abs(Number(n)||0))).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
function buildEscReceipt(o){
  var ESC=0x1B,GS=0x1D,LF=0x0A;
  var INIT=escCmd(ESC,0x40),ALIGN_C=escCmd(ESC,0x61,0x01),ALIGN_L=escCmd(ESC,0x61,0x00);
  var BOLD_ON=escCmd(ESC,0x45,0x01),BOLD_OFF=escCmd(ESC,0x45,0x00);
  var FONT_LARGE=escCmd(GS,0x21,0x11),FONT_NORM=escCmd(GS,0x21,0x00);
  var CUT=escCmd(GS,0x56,0x42,0x00),NL=escCmd(LF);
  var activePrinter=printers.find(function(p){return p.conn==='bluetooth'&&p.role==='receipt';})||printers.find(function(p){return p.conn==='bluetooth';})||null;
  var W=(activePrinter&&activePrinter.width==='58')?32:48;
  var dash=escText('-'.repeat(W)+'\n');
  var outlet=outlets.find(function(x){return x.id===o.outletId;});

  // Word-wrap by whole words (no mid-word breaks)
  var wrapWords=function(text,width){
    var words=String(text||'').split(' ');
    var lines=[],cur='';
    for(var i=0;i<words.length;i++){
      var w=words[i];if(!w)continue;
      if(!cur){cur=w;}
      else if((cur+' '+w).length<=width){cur+=' '+w;}
      else{lines.push(cur);cur=w;}
    }
    if(cur)lines.push(cur);
    return lines.length?lines:[''];
  };

  // Two-column pad helper
  var pad=function(l,r){
    var ls=String(l==null?'':l),rs=String(r==null?'':r);
    var gap=W-ls.length-rs.length;
    return gap>0?ls+' '.repeat(gap)+rs+'\n':ls+'\n'+' '.repeat(Math.max(0,W-rs.length))+rs+'\n';
  };

  // Item rendered as two lines: name / indented detail + right-aligned total
  // IMPORTANT: use concat() not + for Uint8Array joining
  var itemBlock=function(name,detail,total){
    var nameLine=String(name)+'\n';
    var det='  '+String(detail),tot=String(total);
    var gap=W-det.length-tot.length;
    var detLine=gap>0?det+' '.repeat(gap)+tot+'\n':det+'\n'+' '.repeat(Math.max(0,W-tot.length))+tot+'\n';
    return concat(escText(nameLine),escText(detLine));
  };

  // Product lines
  var baseDisplay=Number(o.base)>0?Number(o.base):Math.max(0,Number(o.total||0)-Number(o.addOnAmt||0)+Number(o.promoAmt||0)+Number(o.discAmt||0));
  var svcBlocks=[];
  if(o.svcType==='satuan'&&o.satuanLines&&o.satuanLines.length){
    for(var _si=0;_si<o.satuanLines.length;_si++){
      var _l=o.satuanLines[_si];
      var _qty=Number(_l.qty)||0;
      var _tot=Number(_l.lineTotal)||0;
      var _unit=_qty>0?fmtAmt(Math.round(_tot/_qty)):'0';
      svcBlocks.push(itemBlock(String(_l.name||''),_qty+'x '+_unit,fmtAmt(_tot)));
    }
  }else{
    var svcName=(getSvcById(o.svcType)&&getSvcById(o.svcType).name)||String(o.svcType||'');
    var svcLabel=(svcName+' '+String(o.svcCat||'')).trim()||'Layanan';
    var svcU=String((getSvcUnit&&getSvcUnit(o.svcType))||'');
    svcBlocks.push(itemBlock(svcLabel,String(o.qty||0)+svcU,'Rp '+fmtAmt(baseDisplay)));
  }

  // Build header — store name word-wrapped at half-width because FONT_LARGE doubles char width
  var nameWrapW=Math.floor(W/2);
  var nameLines=wrapWords(String(storeName||''),nameWrapW);
  var parts=[INIT,ALIGN_C,FONT_LARGE,BOLD_ON];
  for(var _ni=0;_ni<nameLines.length;_ni++)parts.push(escText(nameLines[_ni]+'\n'));
  parts.push(BOLD_OFF,FONT_NORM);
  var outletName=String((outlet&&outlet.name)||'');
  if(outletName)parts.push(escText(outletName+'\n'));
  var addr=String((outlet&&outlet.addr)||storeAddr||'');
  if(addr)parts.push(escText(addr+'\n'));
  if(storeWa)parts.push(NL,escText(String(storeWa)+'\n'));
  parts.push(NL,ALIGN_L,dash);

  // Order info
  parts.push(escText(pad('No Nota:',o.id)));
  parts.push(escText(pad('Pelanggan:',o.name)));
  parts.push(escText(pad('Kasir:',o.handledBy||'-')));
  parts.push(escText(pad('Tanggal:',o.date||'')));
  parts.push(dash);

  // Items
  for(var _bi=0;_bi<svcBlocks.length;_bi++)parts.push(svcBlocks[_bi]);

  // Add-ons
  var addOnList=o.addOns||[];
  for(var _ai=0;_ai<addOnList.length;_ai++){
    var _a=addOnList[_ai];
    var _ad=null;
    for(var _di=0;_di<addons.length;_di++){if(addons[_di].id===_a.id){_ad=addons[_di];break;}}
    if(_ad){var _v=_ad.unit==='per_qty'?_ad.price*(o.qty||0):_ad.price;parts.push(escText(pad(String(_a.name||''),'Rp '+fmtAmt(_v))));}
  }

  // Dash then discounts then Total (discount lines sit between dash and Total)
  parts.push(dash);
  if(Number(o.promoAmt)>0)parts.push(escText(pad('Diskon Promo:','-Rp '+fmtAmt(o.promoAmt))));
  if(Number(o.discAmt)>0)parts.push(escText(pad('Diskon Manual:','-Rp '+fmtAmt(o.discAmt))));
  parts.push(BOLD_ON);
  parts.push(escText(pad('Total:','Rp '+fmtAmt(o.total))));
  parts.push(BOLD_OFF);
  parts.push(escText(pad('Metode:',o.payMethod||'')));
  parts.push(escText(pad('Status:',o.payStatus||'')));
  parts.push(dash,ALIGN_C);
  if(storeFooter){storeFooter.split('\n').forEach(function(line){if(line.trim())parts.push(escText(line+'\n'));});}
  else{parts.push(escText('Terima kasih telah mempercayakan\n'),escText('cucian Anda kepada kami!\n'));}
  parts.push(NL,NL,NL,CUT);
  return concat.apply(null,parts);
}
function buildEscLabel(o){
  const ESC=0x1B,GS=0x1D,LF=0x0A;
  const INIT=escCmd(ESC,0x40),ALIGN_C=escCmd(ESC,0x61,0x01),ALIGN_L=escCmd(ESC,0x61,0x00);
  const BOLD_ON=escCmd(ESC,0x45,0x01),BOLD_OFF=escCmd(ESC,0x45,0x00);
  const FONT_LARGE=escCmd(GS,0x21,0x11),FONT_NORM=escCmd(GS,0x21,0x00);
  const CUT=escCmd(GS,0x56,0x42,0x00),NL=escCmd(LF);
  const activePrinter=printers.find(p=>p.conn==='bluetooth'&&p.role==='label')||printers.find(p=>p.conn==='bluetooth')||null;
  const W=activePrinter?.width==='58'?32:48;
  const dash=escText('-'.repeat(W)+'\n');
  const outlet=outlets.find(x=>x.id===o.outletId);
  return concat(INIT,ALIGN_C,BOLD_ON,FONT_LARGE,escText(o.name+'\n'),FONT_NORM,BOLD_OFF,dash,ALIGN_L,escText('No: '+o.id+'\n'),escText('Outlet: '+(outlet?.name||'')+'\n'),escText('Layanan: '+(getSvcLbl(o.svcType+'-'+o.svcCat)||o.svcType)+' | '+o.qty+(getSvcUnit(o.svcType)||'')+'\n'),escText('Masuk: '+o.date+'\n'),dash,ALIGN_C,escText(storeName+'\n'),NL,NL,CUT);
}
function _btRegisterDevice(device){
  _btConnectedDevice=device;
  try{localStorage.setItem(_BT_ID_KEY,device.id);}catch(e){}
  device.addEventListener('gattserverdisconnected',()=>{_btConnectedDevice=null;});
}
async function getOrPickBtDevice(){
  // 1. Already have an in-memory reference — try to reconnect silently
  if(_btConnectedDevice){
    try{if(!_btConnectedDevice.gatt.connected)await _btConnectedDevice.gatt.connect();return _btConnectedDevice;}
    catch(e){_btConnectedDevice=null;}
  }
  // 2. Try silent reconnect via getDevices() (Chrome 85+, no dialog)
  const savedId=localStorage.getItem(_BT_ID_KEY);
  if(savedId&&navigator.bluetooth.getDevices){
    try{
      const permitted=await navigator.bluetooth.getDevices();
      const saved=permitted.find(d=>d.id===savedId);
      if(saved){
        await saved.gatt.connect();
        _btRegisterDevice(saved);
        return saved;
      }
    }catch(e){/* fall through to picker */}
  }
  // 3. Show picker — first time or saved device no longer available
  const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:BT_SERVICES});
  _btRegisterDevice(device);
  return device;
}
async function sendToBtPrinter(data){
  if(!navigator.bluetooth){toast('\u26A0\uFE0F Browser tidak mendukung Web Bluetooth. Gunakan Chrome.');return false;}
  toast('\uD83D\uDCF6 Menghubungkan ke printer...');
  try{
    const device=await getOrPickBtDevice();
    const server=await device.gatt.connect();
    let characteristic=null;
    for(const svcUuid of BT_SERVICES){try{const svc=await server.getPrimaryService(svcUuid);for(const charUuid of BT_CHARS){try{characteristic=await svc.getCharacteristic(charUuid);break;}catch(e){}}if(!characteristic){const chars=await svc.getCharacteristics();characteristic=chars.find(c=>c.properties.writeWithoutResponse||c.properties.write)||chars[0]||null;}if(characteristic)break;}catch(e){}}
    if(!characteristic){toast('\u274C Karakteristik printer tidak ditemukan. Cek model printer.');return false;}
    // Use small chunks (128 bytes) with 60ms delay so the printer buffer never overflows.
    // Android writeValueWithoutResponse sends data without flow control — large chunks cause
    // the printer to drop the middle of the receipt. Mac works with 512 because Chrome on Mac
    // uses acknowledged writes internally; Android does not.
    const CHUNK=128;
    const useWithout=characteristic.properties.writeWithoutResponse&&!characteristic.properties.write;
    for(let i=0;i<data.length;i+=CHUNK){const chunk=data.slice(i,i+CHUNK);if(useWithout)await characteristic.writeValueWithoutResponse(chunk);else await characteristic.writeValue(chunk);await new Promise(r=>setTimeout(r,60));}
    toast('\u2705 Berhasil dicetak!');return true;
  }catch(e){
    if(e.name==='NotFoundError'||e.name==='NotAllowedError'){toast('\u26A0\uFE0F Pemilihan printer dibatalkan.');_btConnectedDevice=null;try{localStorage.removeItem(_BT_ID_KEY);}catch(e2){}}
    else if(e.name==='NetworkError'){toast('\u274C Printer terputus. Coba cetak lagi.');_btConnectedDevice=null;}
    else{toast('\u274C Gagal cetak: '+e.message);_btConnectedDevice=null;}
    return false;
  }
}
async function printCurrentReceipt(){const o=curRcptOrder||orders.find(x=>x.id===curRcptOrderId);if(!o){toast('\u26A0\uFE0F Data pesanan tidak ditemukan.');return;}await sendToBtPrinter(buildEscReceipt(o));}
async function printCurrentLabel(){const o=curRcptOrder||orders.find(x=>x.id===curRcptOrderId);if(!o){toast('\u26A0\uFE0F Data pesanan tidak ditemukan.');return;}await sendToBtPrinter(buildEscLabel(o));}

// ===== SETTINGS =====
async function changePwd(){
  const cur=g('s-cur').value,nw=g('s-new').value,cfm=g('s-cfm').value;
  const msg=g('s-pwd-msg');
  let curOk=false;
  if(ownerPwd.startsWith('sha256:')){curOk=(await hashSecret(cur))===ownerPwd;}
  else{curOk=cur===ownerPwd;}
  if(!curOk){msg.style.color='var(--re)';msg.textContent='Password saat ini salah.';return;}
  if(nw.length<4){msg.style.color='var(--re)';msg.textContent='Password baru minimal 4 karakter.';return;}
  if(nw!==cfm){msg.style.color='var(--re)';msg.textContent='Konfirmasi password tidak cocok.';return;}
  ownerPwd=await hashSecret(nw);syncSettings();
  ['s-cur','s-new','s-cfm'].forEach(id=>{g(id).value='';});
  msg.style.color='var(--p)';msg.textContent='\u2713 Password berhasil diubah!';
  setTimeout(()=>{msg.textContent='';},3000);toast('\u2713 Password owner berhasil diubah!');
}

// ===== EXCEL EXPORT (SheetJS) =====
const XLSX_CDNS=['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js','https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js'];
function loadXLSX(cb){
  if(typeof XLSX!=='undefined'){cb();return;}
  let tried=0;
  function tryNext(){
    if(tried>=XLSX_CDNS.length){toast('⚠️ Gagal memuat library Excel. Cek koneksi internet.');return;}
    const s=document.createElement('script');
    s.src=XLSX_CDNS[tried++];
    s.onload=()=>{if(typeof XLSX!=='undefined')cb();else tryNext();};
    s.onerror=tryNext;
    document.head.appendChild(s);
  }
  toast('⏳ Memuat library Excel...');
  tryNext();
}
function makeSheet(title,infoLine,headers,rows,totalsRow,colWidths){
  const aoa=[];aoa.push([title]);if(infoLine)aoa.push([infoLine]);aoa.push([]);aoa.push(headers);rows.forEach(r=>aoa.push(r));if(totalsRow)aoa.push(totalsRow);
  const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=colWidths.map(w=>({wch:w}));
  const merges=[{s:{r:0,c:0},e:{r:0,c:headers.length-1}}];if(infoLine)merges.push({s:{r:1,c:0},e:{r:1,c:headers.length-1}});ws['!merges']=merges;
  ws['!rows']=[{hpt:18},{hpt:14}];return ws;
}
function exportCustomers(){
  loadXLSX(()=>{
  const wb=XLSX.utils.book_new();const cl=Object.values(customers);
  const info='Tanggal Export: '+TODAY_STR+'  |  Total Pelanggan: '+cl.length+' orang';
  const headers=['No','Nama Pelanggan','No. WhatsApp','Total Pesanan','Total Transaksi (Rp)','Order Terakhir'];
  const rows=cl.map((cu,i)=>[i+1,cu.name,cu.phone,cu.orders,cu.total,cu.lastDate]);
  const tots=['','JUMLAH','',cl.reduce((s,cu)=>s+cu.orders,0),cl.reduce((s,cu)=>s+cu.total,0),''];
  const ws=makeSheet('DATA PELANGGAN \u2014 CleanPOS Laundry',info,headers,rows,tots,[5,26,18,14,22,16]);
  XLSX.utils.book_append_sheet(wb,ws,'Pelanggan');XLSX.writeFile(wb,'CleanPOS_Pelanggan_'+TODAY_ISO+'.xlsx');
  toast('\u2713 Export Excel pelanggan berhasil!');
  });}
function exportReport(){
  loadXLSX(()=>{
  const filtered=filterOrdersByDate();const wb=XLSX.utils.book_new();
  const outLbl=rptOutlet==='all'?'Semua Outlet':(outlets.find(o=>o.id===rptOutlet)?.name||'');
  const perLbl={'today':'Hari Ini','week':'7 Hari Terakhir','month':'Bulan Ini','3month':'3 Bulan Terakhir','year':'1 Tahun Terakhir','custom':'Custom'}[rptFilter]||rptFilter;
  const rev=filtered.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0);
  const baseExp=rptOutlet==='all'?expenses:expenses.filter(e=>!e.outletId||e.outletId===rptOutlet);
  const totalExp=baseExp.reduce((s,e)=>s+e.nominal,0);const profit=rev-totalExp;
  const info='Outlet: '+outLbl+'  |  Periode: '+perLbl+'  |  Export: '+TODAY_STR;
  const sumAoa=[['LAPORAN KEUANGAN \u2014 CleanPOS Laundry'],[''],['Outlet',outLbl],['Periode',perLbl],['Tanggal Export',TODAY_STR],[''],['KETERANGAN','JUMLAH (Rp)'],['Pendapatan',rev],['Pengeluaran',totalExp],['Profit Bersih',profit],[''],['Total Pesanan',filtered.length],['Pesanan Lunas',filtered.filter(o=>o.payStatus==='Lunas').length],['Pesanan Belum Bayar',filtered.filter(o=>o.payStatus==='Belum Bayar').length],['Jumlah Pelanggan',Object.keys(customers).length]];
  const wsSUM=XLSX.utils.aoa_to_sheet(sumAoa);wsSUM['!cols']=[{wch:28},{wch:20}];wsSUM['!merges']=[{s:{r:0,c:0},e:{r:0,c:1}}];XLSX.utils.book_append_sheet(wb,wsSUM,'Ringkasan');
  const txHeaders=['No','Tanggal','No. Pesanan','Pelanggan','Outlet','Layanan','Qty','Metode','Status Bayar','Debet (Masuk)','Kredit (Keluar)','Saldo'];
  const txRows=[];let saldo=0;filtered.forEach((o,i)=>{const masuk=o.payStatus==='Lunas'?o.total:0;saldo+=masuk;txRows.push([i+1,o.date,o.id,o.name,outlets.find(x=>x.id===o.outletId)?.name||'\u2014',o.svcType+' '+o.svcCat,o.qty+(getSvcUnit(o.svcType)),o.payMethod,o.payStatus,masuk||0,0,saldo]);});
  const txTots=['','','\u2014','JUMLAH','','','','','',filtered.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0),0,saldo];
  XLSX.utils.book_append_sheet(wb,makeSheet('LAPORAN TRANSAKSI \u2014 CleanPOS Laundry',info,txHeaders,txRows,txTots,[5,14,22,22,16,14,8,12,13,16,16,16]),'Transaksi');
  const kasHeaders=['No','Jam','Jenis','Keterangan','Catatan','Debet (Masuk)','Kredit (Keluar)','Saldo'];
  const kasRows=[];let kSaldo=0;const filtKas=rptOutlet==='all'?kasLog:kasLog.filter(l=>!l.outletId||l.outletId===rptOutlet);
  filtKas.forEach((l,i)=>{const d=(l.type==='modal'||l.type==='in')?l.amount:0;const k=l.type==='out'?l.amount:0;kSaldo+=d-k;kasRows.push([i+1,l.time||'\u2014',l.type,l.desc,l.note||'\u2014',d||0,k||0,kSaldo]);});
  const kasTots=['','','','JUMLAH','',filtKas.filter(l=>l.type!=='out').reduce((s,l)=>s+l.amount,0),filtKas.filter(l=>l.type==='out').reduce((s,l)=>s+l.amount,0),kSaldo];
  XLSX.utils.book_append_sheet(wb,makeSheet('LAPORAN KAS KASIR \u2014 CleanPOS Laundry',info,kasHeaders,kasRows,kasTots,[5,10,10,22,20,16,16,16]),'Kas Kasir');
  const expHeaders=['No','Tanggal','Keterangan','Kategori','Outlet','Sumber Dana','Kredit (Keluar)','Saldo'];
  const expRows=[];let eSaldo=0;baseExp.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach((e,i)=>{eSaldo-=e.nominal;expRows.push([i+1,e.date,e.label,CAT_LBL[e.cat]||e.cat,outlets.find(x=>x.id===e.outletId)?.name||'Semua',e.src==='cash'?'Cash (Kas)':'Transfer Bank',e.nominal,eSaldo]);});
  const expTots=['','','JUMLAH','','','',baseExp.reduce((s,e)=>s+e.nominal,0),eSaldo];
  XLSX.utils.book_append_sheet(wb,makeSheet('LAPORAN PENGELUARAN \u2014 CleanPOS Laundry',info,expHeaders,expRows,expTots,[5,14,26,16,16,16,16,16]),'Pengeluaran');
  XLSX.writeFile(wb,'CleanPOS_Laporan_'+TODAY_ISO+'.xlsx');
  toast('\u2713 Export Excel berhasil! (4 sheet: Ringkasan, Transaksi, Kas, Pengeluaran)');
  });}

// ===== SUPABASE SYNC PATCHES =====
// Hook all data-mutating functions to also sync to Supabase.
// Placed at end of file so all original functions are already defined.

// submitO: build order + sync to cloud
submitO = function(role) {
  const pre = role === 'o' ? 'no' : 'sno';
  const o = buildOrder(pre); if (!o) return;
  if (!o.tracking_token) o.tracking_token = genTrackingToken();
  syncOrder(o);
  syncCustomer(customers[o.phone] || { name: o.name, phone: o.phone, orders: 1, total: o.total, balance: 0, lastDate: o.date });
  if (membershipEnabled && o.payMethod === 'Dompet Member') {
    const deductTxn = memberTxns.find(t => t.orderId === o.id);
    if (deductTxn) syncMemberTxn(deductTxn);
  }
  if (o.payMethod === 'Tunai' && o.payStatus === 'Lunas') {
    const kasEntry = kasLog[kasLog.length - 1];
    if (kasEntry && String(kasEntry.note).includes(o.id)) syncKas(kasEntry);
  }
  renderOrders();
  showRcpt(o.id);
  if (role === 'o') refreshODash(); else refreshSDash();
};

// Status & pay updates
const _origSetStModal = setStModal;
setStModal = function(id, st, btn) { _origSetStModal(id, st, btn); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };
const _origSetPayModal = setPayModal;
setPayModal = function(id, ps, btn) { _origSetPayModal(id, ps, btn); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };
const _origSetPayStatus = setPayStatus;
setPayStatus = function(id, ps) { _origSetPayStatus(id, ps); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };
// changePayMethod now delegates to _doChangePayMethod (which calls syncOrder internally)
// No additional wrapping needed — syncOrder is called at the end of _doChangePayMethod
const _origUpdSt = updSt;
updSt = function(id, st, role) { _origUpdSt(id, st, role); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };

// Outlets
const _origSaveOutlet = saveOutlet;
saveOutlet = function() { _origSaveOutlet(); outlets.forEach(o => syncOutlet(o)); };
const _origDelOutlet = delOutlet;
delOutlet = function(id) { deleteOutlet(id); _origDelOutlet(id); };

// Employees — sync is now handled inside saveEmp and empAct directly; no wrapper needed.

// Kas
const _origSubmitKas = submitKas;
submitKas = function() { _origSubmitKas(); kasLog.slice(-1).forEach(l => syncKas(l)); };

// Expenses
const _origSubmitExpense = submitExpense;
submitExpense = function() { _origSubmitExpense(); expenses.slice(-1).forEach(e => syncExpense(e)); };

// Printers — saved to localStorage per-device, not cloud (see loadPrintersFromStorage)

// Settings
const _origSaveStoreInfo = saveStoreInfo;
saveStoreInfo = function() { _origSaveStoreInfo(); syncSettings(); };
const _origSaveTpl = saveTpl;
saveTpl = function() { _origSaveTpl(); syncSettings(); };
const _origSaveSvc = saveSvc;
saveSvc = function() { _origSaveSvc(); syncSettings(); };
const _origSaveAddon = saveAddon;
saveAddon = function() { _origSaveAddon(); syncSettings(); };
const _origSavePromo = savePromo;
savePromo = function() { _origSavePromo(); syncSettings(); };


// ===== INACTIVITY AUTO-LOGOUT (30 min) =====
const _IDLE_MS = 30 * 60 * 1000;
let _idleTimer = null;
function _resetIdleTimer() {
  clearTimeout(_idleTimer);
  if (!curRole) return;
  _idleTimer = setTimeout(() => {
    if (!curRole) return;
    curRole = null; curStaff = null;
    document.querySelectorAll('.app').forEach(a => a.classList.remove('on'));
    showScr('scr-login');
    toast('⏱️ Sesi berakhir — tidak aktif selama 30 menit');
  }, _IDLE_MS);
}
['click', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
  document.addEventListener(ev, _resetIdleTimer, { passive: true })
);

// ===== BOOTSTRAP =====
g('ex-date').value = TODAY_ISO;

// Capture recovery flag from URL immediately — before Supabase clears the hash
const _isRecovery = window.location.hash.includes('type=recovery')
  || window.location.search.includes('type=recovery');

function _showNewPasswordModal() {
  showScr('scr-google');
  openModal('m-new-account-pwd');
  setTimeout(() => g('nap-pwd')?.focus(), 100);
}

(async function() {
  if (window.location.protocol === 'file:') {
    const err = g('auth-err');
    if (err) {
      err.style.color='var(--am)'; err.style.background='var(--amb)';
      err.textContent='⚠️ Buka via HTTP, bukan file://. Gunakan Live Server atau upload ke Vercel.';
      err.style.display='block';
    }
    return;
  }

  const configured = typeof SUPA_URL !== 'undefined' && !!SUPA_URL
    && typeof SUPA_KEY !== 'undefined' && !!SUPA_KEY;

  if (!configured) {
    // Supabase not configured — run in offline/demo mode
    seed(); showScr('scr-login'); return;
  }

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    if (!initSupabase(createClient)) return;

    // ── Tracking page: intercept before auth, no login required ──
    const _trackToken = new URLSearchParams(location.search).get('track');
    if (_trackToken) {
      showScr('scr-track');
      renderTrackingPage(_trackToken);
      return; // skip all POS auth setup
    }

    supabase.auth.onAuthStateChange((event, session) => {
      // Only treat as logged-in if there is a real (non-anonymous) user
      const user = session?.user;
      const isRealUser = user && !user.is_anonymous;
      if (isRealUser) {
        currentUserId = user.id;
        currentUserEmail = user.email;
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && _isRecovery)) {
          _showNewPasswordModal();
        } else if (event === 'SIGNED_IN') {
          if (curRole) return; // token refresh while already in a session — ignore
          supaLoadAll().then(() => {
            initMemberCard();
            _cleanExpiredTokens();
            _backfillTrackingOrders();
            // If user already logged in before data finished loading, refresh dashboard instead of navigating
            if (curRole === 'owner') { refreshODash(); return; }
            if (curRole === 'staff') { refreshSDash(); return; }
            if (ownerPwd === 'owner123') showScr('scr-setup');
            else showScr('scr-login');
          }).catch(e => { console.error('[auth SIGNED_IN] supaLoadAll failed:', e); if (!curRole) showScr('scr-login'); });
        } else if (event === 'INITIAL_SESSION') {
          showReturningUser(user.email);
          supaLoadAll().then(() => {
            initMemberCard();
            _cleanExpiredTokens();
            _backfillTrackingOrders();
            // If user already logged in before data finished loading, refresh dashboard instead of navigating
            if (curRole === 'owner') { refreshODash(); return; }
            if (curRole === 'staff') { refreshSDash(); return; }
            if (ownerPwd === 'owner123') showScr('scr-setup');
            else showScr('scr-login'); // advance to login now that data is ready
          }).catch(e => { console.error('[auth INITIAL_SESSION] supaLoadAll failed:', e); if (!curRole) showScr('scr-login'); });
        }
      } else {
        currentUserId = null;
        currentUserEmail = null;
        resetAuthForm();
        showScr('scr-google');
      }
    });
  } catch(e) {
    _supaErr('Gagal memuat Supabase: ' + e.message);
  }
})();
