// ===== GLOBAL STATE =====
let ownerPwd = 'owner123';
const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

// ===== SUBSCRIPTION PLANS =====
const PLAN_LIMITS = { basic: 1, elite: 5, enterprise: 20 };
const PLANS = {
  basic:      { name:'Basic',      emoji:'🌱', outlets:1,  price:30000,  annual:270000,   blurb:'Rp 30.000/bln',    color:'#6B6B65' },
  elite:      { name:'Elite',      emoji:'⭐', outlets:5,  price:50000,  annual:450000,   blurb:'Rp 50.000/bln',    color:'#1976D2' },
  enterprise: { name:'Enterprise', emoji:'👑', outlets:20, price:90000,  annual:810000,   blurb:'Rp 90.000/bln',    color:'#7B1FA2' }
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
let waLog = [];
let waTplSelesai = `Halo {nama} \uD83D\uDC4B\n\nCucian Anda sudah *selesai* dan siap diambil! \uD83C\uDF89\n\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDC55 Layanan: {layanan}\n\uD83D\uDCB0 Total: *{total}*\n\nTerima kasih sudah menggunakan CleanPOS Laundry! \uD83D\uDE4F`;
let waTplNew = {
  konfirmasi:  `Halo {nama} \uD83D\uDC4B\n\nPesanan Anda sudah *diterima* di CleanPOS Laundry. \uD83E\uDDFA\n\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDC55 Layanan: {layanan}\n\uD83D\uDCB0 Total: *{total}*\n\nKami akan kabarkan saat cucian siap diambil! \uD83D\uDE4F`,
  tagih_dp:    `Halo {nama} \uD83D\uDC4B\n\nPesanan Anda sudah dicatat!\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDCB0 Total: *{total}*\n\nMohon transfer DP 50% ke:\n\uD83C\uDFE6 BCA 1234567890 a/n Laundry Kita\n\nKirim bukti transfer ya! \uD83D\uDE4F`,
  tagih_lunas: `Halo {nama} \uD83D\uDC4B\n\nKonfirmasi pembayaran:\n\uD83D\uDCCB No: *{id}*\n\uD83D\uDCB0 Total: *{total}*\n\nTransfer ke:\n\uD83C\uDFE6 BCA 1234567890 a/n Laundry Kita\nAtau bayar tunai saat pickup. \uD83D\uDE4F`
};
let curWaNewType = 'konfirmasi'; let curWaNewOrder = null; let curRcptOrderId = null;
let storeName = 'CleanPOS Laundry'; let storeAddr = ''; let storeWa = ''; let storeFooter = 'Terima kasih atas kepercayaan Anda! \uD83D\uDE4F';
let curWaTplTab = 'selesai';
let kasLog = []; let kasCtr = 1; let kasType = 'setor';
let expenses = []; let expCtr = 1;
let printers = [
  {id:'p1',name:'Epson TM-T82 Kasir',conn:'usb',ip:'',width:'80',role:'receipt',status:'online'},
  {id:'p2',name:'Zebra ZD220 Label',conn:'network',ip:'192.168.1.101',width:'58',role:'label',status:'online'}
];
let printerCtr = 3; let btDevice = null;
let rptFilter = 'today'; let empFilter = 'all';
let ordOutlet = 'all'; let trkOutlet = 'all'; let kasOutlet = 'all'; let expOutlet = 'all'; let rptOutlet = 'all';
let curRole = null; let curStaff = null; let curOutlet = null;
let pinEntry = ''; let selOutletColor = '#8DC440';
let editSvcId = null;

const SL_STATUS = {Diterima:'gy',Mencuci:'gbl',Mengeringkan:'gam',Menyetrika:'gam',Selesai:'gp',Diambil:'gg'};
const SL_PAY = {'Belum Bayar':'gr_',DP:'gam',Lunas:'gg'};
const STATUS_LIST = ['Diterima','Mencuci','Mengeringkan','Menyetrika','Selesai','Diambil'];
function getSvcLbl(key){if(key==='all')return 'Semua Layanan';const parts=key.split('-');if(parts[0]==='satuan'){const cl={regular:'Regular',sameday:'Same-day',express:'Express'};return 'Satuan '+(cl[parts[1]]||parts[1]||'');}const svc=getSvcById(parts[0]);const cat=parts[1];return svc?(svc.name+' '+(cat||'')).trim():key;}
const SVC_LBL = new Proxy({},{get:(t,k)=>getSvcLbl(k)});
const CAT_ICONS = {gaji:'\uD83D\uDC64',bonus:'\uD83C\uDF81',listrik:'\u26A1',air:'\uD83D\uDCA7',deterjen:'\uD83E\uDDF4',transport:'\uD83D\uDE97',makan:'\uD83C\uDF71',lain:'\uD83D\uDCE6'};
const CAT_LBL = {gaji:'Gaji Karyawan',bonus:'Bonus',listrik:'Listrik',air:'Air',deterjen:'Deterjen/Sabun',transport:'Transport',makan:'Uang Makan',lain:'Lain-Lain'};

// ===== HELPERS =====
function fmt(n){return 'Rp '+Math.round(Math.abs(n||0)).toLocaleString('id-ID');}
function g(id){return document.getElementById(id);}
function ini(n){return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();}
function go(id){return outlets.find(o=>o.id===id);}
function toast(m){const t=g('toast');t.textContent=m;t.style.display='block';clearTimeout(t._x);t._x=setTimeout(()=>t.style.display='none',2700);}
function cm(id){g(id).className='mbg';}
function showScr(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));g(id).classList.add('on');window.scrollTo(0,0);if(id==='scr-login'){const el=g('login-scr-email');if(el)el.textContent=currentUserEmail?'☁️ '+currentUserEmail:'';const lb=g('login-scr-logout');if(lb)lb.style.display=currentUserEmail?'':'none';}}
function showApp(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));document.querySelectorAll('.app').forEach(a=>a.classList.remove('on'));g(id).classList.add('on');window.scrollTo(0,0);}
function togglePwd(id,btn){const el=g(id);el.type=el.type==='password'?'text':'password';btn.textContent=el.type==='password'?'\uD83D\uDC41':'\uD83D\uDE48';}
function confirm_(title,msg,onOk){g('mc-title').textContent=title;g('mc-msg').textContent=msg;g('mc-ok').onclick=()=>{cm('m-confirm');onOk();};g('m-confirm').className='mbg on';}
function confirmBack(){confirm_('Kembali ke Menu Awal?','Sesi ini akan berakhir.',()=>{curRole=null;curStaff=null;showScr('scr-login');document.querySelectorAll('.app').forEach(a=>a.classList.remove('on'));});}
function showMore(){g('more-bg').className='more-bg on';}
function closeMore(){g('more-bg').className='more-bg';}
function mMore(pg){closeMore();oGo(pg,null);}
function buildOutletFilterChips(selId,fnName){
  const all=[{id:'all',name:'Semua Outlet',color:null},...outlets.map(o=>({id:o.id,name:o.name,color:o.color}))];
  return all.map(o=>`<span class="chip${selId===o.id?' on':''}" onclick="${fnName}('${o.id}')" style="${selId===o.id&&o.color?`background:${o.color}18;border-color:${o.color};color:${o.color}`:''}">` +
    `${o.color?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${o.color};margin-right:5px;vertical-align:middle"></span>`:''}${o.name}</span>`).join('');
}

// ===== LOGIN =====
function doFirstTimeSetup() {
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
  storeName = name; storeAddr = addr; storeWa = wa; ownerPwd = pwd;
  syncSettings();
  if (btn) { btn.disabled = false; btn.textContent = 'Mulai Gunakan CleanPOS →'; }
  ['setup-store-name','setup-store-addr','setup-store-wa','setup-pwd','setup-pwd-confirm'].forEach(id => { const el = g(id); if (el) el.value = ''; });
  showScr('scr-login');
  toast('✅ Setup selesai! Selamat menggunakan CleanPOS.');
}
function confirmLogout(){confirm_('Keluar dari Akun?','Kamu akan keluar dan perlu login kembali untuk mengakses data.',()=>authLogout());}
function goOwnerPwd(){showScr('scr-opwd');g('opwd-in').focus();}
function doOwnerLogin(){if(g('opwd-in').value===ownerPwd){g('opwd-err').style.display='none';g('opwd-in').value='';curRole='owner';showApp('owner-app');initOwner();}else g('opwd-err').style.display='block';}
function goOutletSelect(){
  showScr('scr-outlet');
  g('outlet-btns').innerHTML=outlets.map(o=>`<button class="ob${curOutlet&&curOutlet.id===o.id?' sel':''}" onclick="pickOutlet('${o.id}')"><div class="odot" style="background:${o.color}"></div><div style="flex:1;text-align:left"><div style="font-weight:700;font-size:15px">${o.name}</div><div style="font-size:12px;color:var(--t2);margin-top:2px">${o.addr}</div></div><span style="color:var(--t3);font-size:22px">\u203A</span></button>`).join('');
}
function pickOutlet(id){curOutlet=go(id);showScr('scr-staff');buildStaffBtns();}
function buildStaffBtns(){
  if(!curOutlet)return;
  g('staff-outlet-name').textContent=curOutlet.name;
  g('staff-outlet-sub').textContent='Pilih namamu untuk masuk';
  const list=employees.filter(e=>e.oid===curOutlet.id);
  g('staff-btns').innerHTML=list.length?list.map(e=>`<button class="sb" onclick="pickStaff(${e.id})"><div class="avatar">${ini(e.name)}</div><div style="flex:1;text-align:left"><div style="font-weight:700;font-size:15px">${e.name}</div><div style="font-size:12px;color:var(--t2)">${e.role}</div></div><span class="badge ${e.status==='in'?'gg':e.status==='cuti'?'gpu':'gy'}">${e.status==='in'?'Masuk':e.status==='cuti'?'Cuti':'Off'}</span></button>`).join(''):`<div style="text-align:center;padding:24px;color:var(--t2);font-size:14px">Belum ada karyawan di outlet ini</div>`;
}
function pickStaff(id){curStaff=employees.find(e=>e.id===id);pinEntry='';resetPinDots();g('pin-name').textContent='Halo, '+curStaff.name.split(' ')[0]+'!';g('pin-sub').textContent='Masukkan PIN 4 digit kamu';g('pin-err').textContent='';showScr('scr-pin');}
function kp(n){if(!curStaff||pinEntry.length>=4)return;pinEntry+=n;updPinDots();if(pinEntry.length===4)setTimeout(chkPin,150);}
function dp(){if(pinEntry.length>0){pinEntry=pinEntry.slice(0,-1);updPinDots();}}
function updPinDots(){for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd'+(i<pinEntry.length?' on':'');}}
function resetPinDots(){pinEntry='';for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd';}}
function chkPin(){if(pinEntry===curStaff.pin){curRole='staff';showApp('staff-app');initStaff();}else{g('pin-err').textContent='PIN salah. Coba lagi.';for(let i=0;i<4;i++){const d=g('pd'+i);if(d)d.className='pd er';}setTimeout(()=>{pinEntry='';updPinDots();g('pin-err').textContent='';},900);}}

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
  const pm={dashboard:refreshODash,orders:renderOrders,tracking:()=>renderKanban('o'),wa:renderWaCenter,kas:renderKas,expenses:renderExpenses,reports:renderReports,employees:renderEmployees,outlets:renderOutlets,customers:renderCusts,pricing:renderPricing,promo:renderPromo,settings:renderSettings};
  if(pm[pg])pm[pg]();
  if(pg==='new-order'){buildOrderForm('no');calcO();}
}
function oGoB(pg,el){document.querySelectorAll('#owner-app .bnav .bni').forEach(n=>n.classList.remove('on'));if(el)el.classList.add('on');oGo(pg,null);}
function sGo(pg,el){
  document.querySelectorAll('#s-mc .page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('#s-nav .ni').forEach(n=>n.classList.remove('on'));
  const p=g('s-p-'+pg);if(p)p.classList.add('on');if(el)el.classList.add('on');
  g('s-mc').scrollTop=0;
  const pm={dashboard:refreshSDash,orders:renderOrders,tracking:()=>renderKanban('s'),wa:renderSWa};
  if(pm[pg])pm[pg]();
  if(pg==='new-order'){buildOrderForm('sno');calcS();}
}
function sGoB(pg,el){document.querySelectorAll('#staff-app .bnav .bni').forEach(n=>n.classList.remove('on'));if(el)el.classList.add('on');sGo(pg,null);}

// ===== SEED DATA =====
function genId(){const d=new Date();return `LDRY-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(orderCtr).padStart(3,'0')}`;}
function addCust(name,phone,total,date){if(!customers[phone])customers[phone]={name,phone,orders:0,total:0,lastDate:date};customers[phone].orders++;customers[phone].total+=total;customers[phone].lastDate=date;}
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
    orders.push({id:genId(),name:d.name,phone:d.phone,svcType:d.svc,svcCat:d.cat,qty:bq,rawQty:d.qty,satuanLines:[],addOns:[],addOnAmt:0,base,discType:'none',discAmt:0,promoAmt:0,total:base,payMethod:'Tunai',payStatus:d.pay,status:d.st,notes:'',date:TODAY_STR,isoDate:TODAY_ISO,waSent:d.waSent,handledBy:'Owner',outletId:d.oid});
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
    orders.push({id:genId(),name:d.name,phone:d.phone,svcType:'satuan',svcCat:d.cat,qty,rawQty:qty,satuanLines,addOns:[],addOnAmt:0,base,discType:'none',discAmt:0,promoAmt:0,total:base,payMethod:'Tunai',payStatus:d.pay,status:d.st,notes:'',date:TODAY_STR,isoDate:TODAY_ISO,waSent:d.waSent,handledBy:'Owner',outletId:d.oid});
    addCust(d.name,d.phone,base,TODAY_STR);
  });
  if(orders[0].waSent)waLog.push({orderId:orders[0].id,name:orders[0].name,phone:orders[0].phone,time:NOW()+', '+TODAY_STR});
  orderCtr=6;
  kasLog=[{id:1,type:'modal',desc:'Setor Modal',note:'modal kembalian pagi',amount:200000,time:'08:00',outletId:'o1'},{id:2,type:'in',desc:'Penjualan Cash',note:'Budi Santoso',amount:21000,time:'09:14',outletId:'o1'},{id:3,type:'out',desc:'Tarik Kas',note:'beli deterjen',amount:50000,time:'11:30',outletId:'o1'}];
  kasCtr=4;
  expenses=[{id:1,cat:'listrik',label:'Listrik',nominal:150000,date:TODAY_ISO,note:'Tagihan PLN',src:'transfer',outletId:'o1'},{id:2,cat:'deterjen',label:'Deterjen/Sabun',nominal:75000,date:TODAY_ISO,note:'Attack 2kg',src:'cash',outletId:'o2'}];
  expCtr=3;
}

// ===== INIT =====
function initOwner(){
  g('today-lbl').textContent=DAYS_ID[TODAY_DAY]+', '+TODAY_STR;
  const ta=g('wa-tpl');if(ta)ta.value=waTplSelesai;
  prevTpl();renderPricing();renderPromo();renderSettings();
  renderPlanBadge();renderSubCard();checkPlanExpiry();
  if(isPlanExpired()){
    // Land directly on settings so user can pay
    oGo('settings', document.querySelector('#o-nav .ni[onclick*="settings"]'));
  } else {
    buildOrderForm('no');calcO();refreshODash();
  }
  _resetIdleTimer();
}
function initStaff(){g('staff-role-lbl').textContent='\uD83D\uDC64 '+curStaff.name;g('s-greet').textContent='Halo, '+curStaff.name+'!';updStaffClk();buildOrderForm('sno');calcS();refreshSDash();_resetIdleTimer();}
function renderSettings(){
  renderSubCard();
  renderPrinters();
  if(g('s-store'))g('s-store').value=storeName;
  if(g('s-addr'))g('s-addr').value=storeAddr;
  if(g('s-wa'))g('s-wa').value=storeWa;
  if(g('s-footer'))g('s-footer').value=storeFooter;
}
function saveStoreInfo(){
  storeName=(g('s-store')?.value||'').trim()||'CleanPOS Laundry';
  storeAddr=(g('s-addr')?.value||'').trim();
  storeWa=(g('s-wa')?.value||'').trim();
  storeFooter=(g('s-footer')?.value||'').trim();
  toast('\u2713 Info toko tersimpan!');
}

// ===== DASHBOARDS =====
function refreshODash(){
  const rev=orders.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0);
  const expToday=expenses.filter(e=>e.date===TODAY_ISO).reduce((s,e)=>s+e.nominal,0);
  const profit=rev-expToday;
  const wp=orders.filter(o=>o.status==='Selesai'&&!o.waSent);
  const unpaid=orders.filter(o=>o.payStatus!=='Lunas').length;
  const m=g('o-metrics');if(!m)return;
  m.innerHTML=`
    <div class="mc2 ${profit>=0?'cp':'cr'}"><div class="ml">\uD83D\uDCB0 Profit Hari Ini</div><div class="mv">${profit>=0?'+':''}${fmt(profit)}</div><div class="ms">Pend. - Pengeluaran</div></div>
    <div class="mc2 cg"><div class="ml">\uD83D\uDCC8 Pendapatan</div><div class="mv">${fmt(rev)}</div><div class="ms">${orders.length} pesanan</div></div>
    <div class="mc2 cam"><div class="ml">\uD83D\uDD04 Pesanan Aktif</div><div class="mv">${orders.filter(o=>!['Selesai','Diambil'].includes(o.status)).length}</div></div>
    <div class="mc2 ${unpaid>0?'cr':'cg'}"><div class="ml">\u26A0\uFE0F Belum Dibayar</div><div class="mv">${unpaid}</div></div>`;
  const wa=g('o-wa-alert');if(wa)wa.innerHTML=wp.length?`<div style="background:var(--pl);border:2px solid var(--p);border-radius:var(--r);padding:13px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:13px;color:#3d6b10">\uD83C\uDFDF\uFE0F ${wp.length} cucian selesai belum dinotif WA</div><button class="btn bp bsm bpill" onclick="oGo('wa',null)">Kirim</button></div>`:'';
  const last=orders.slice(-5).reverse();
  const rEl=g('o-recent');if(rEl)rEl.innerHTML=last.length?'<table><tbody>'+last.map(o=>`<tr><td style="font-size:11px;font-family:monospace;color:var(--t2)">${o.id}</td><td style="font-weight:600">${o.name}</td><td><span class="badge ${SL_STATUS[o.status]}">${o.status}</span></td><td style="font-weight:600">${fmt(o.total)}</td></tr>`).join('')+'</tbody></table>':'<div style="text-align:center;padding:20px;color:var(--t2)">Belum ada pesanan</div>';
  const thisMonth=TODAY_ISO.slice(0,7);
  const daysInMonth=new Date(TODAY_ISO).getDate();
  const monthOrders=orders.filter(o=>o.payStatus==='Lunas'&&o.isoDate&&o.isoDate.startsWith(thisMonth));
  const omsetBulanIni=monthOrders.reduce((s,o)=>s+o.total,0);
  const dailyRev=[];
  for(let d=1;d<=daysInMonth;d++){const ds=thisMonth+'-'+(d<10?'0'+d:String(d));dailyRev.push(monthOrders.filter(o=>o.isoDate===ds).reduce((s,o)=>s+o.total,0));}
  (()=>{
    const MN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
    const mi=parseInt(thisMonth.slice(5,7))-1;
    const N=daysInMonth,H=72,padT=12,n=dailyRev.length,maxVal=Math.max(...dailyRev,1);
    const xOf=i=>n<=1?N/2:(i/(n-1))*N;
    const yOf=v=>padT+(1-v/maxVal)*(H-padT);
    const pts=dailyRev.map((v,i)=>`${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
    const area=`0,${H} ${pts} ${N},${H}`;
    const origTotal=fmt(omsetBulanIni);
    const origStat=`${monthOrders.length} pesanan lunas \u00B7 hari ke-${daysInMonth}`;
    const ks=g('o-kas-saldo');if(!ks)return;
    ks.innerHTML=`<div id="omset-total" style="font-size:24px;font-weight:800;color:var(--p);letter-spacing:-.3px;margin-bottom:2px">${origTotal}</div><div id="omset-stat" style="font-size:11px;color:var(--t2);margin-bottom:6px">${origStat}</div><div style="margin:auto 0 0;border-radius:var(--rs);overflow:hidden"><svg id="omset-svg" viewBox="0 0 ${N} ${H}" style="width:100%;height:${H}px;display:block;cursor:crosshair" preserveAspectRatio="none"><defs><linearGradient id="omg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8DC440" stop-opacity=".3"/><stop offset="100%" stop-color="#8DC440" stop-opacity="0"/></linearGradient></defs><polygon points="${area}" fill="url(#omg)"/><polyline points="${pts}" fill="none" stroke="#8DC440" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><line id="omset-vl" x1="-99" y1="0" x2="-99" y2="${H}" stroke="#8DC440" stroke-width="1" stroke-dasharray="3,2" opacity=".7" vector-effect="non-scaling-stroke"/></svg></div>`;
    const svgEl=g('omset-svg'),totEl=g('omset-total'),statEl=g('omset-stat'),vl=document.getElementById('omset-vl');
    if(!svgEl)return;
    const onHover=cx=>{
      const r=svgEl.getBoundingClientRect();
      const frac=Math.max(0,Math.min(1,(cx-r.left)/r.width));
      const di=Math.round(frac*(n-1));
      const rev=dailyRev[di];const day=di+1;
      const ds=thisMonth+'-'+(day<10?'0'+day:String(day));
      const cnt=monthOrders.filter(o=>o.isoDate===ds).length;
      if(totEl){totEl.textContent=fmt(rev);totEl.style.color=rev>0?'var(--p)':'var(--t3)';}
      if(statEl)statEl.textContent=`${day} ${MN[mi]} \u00B7 ${cnt} pesanan \u00B7 ${rev>0?fmt(rev):'Rp 0'}`;
      const vx=(n<=1?N/2:(di/(n-1))*N).toFixed(1);
      if(vl){vl.setAttribute('x1',vx);vl.setAttribute('x2',vx);}
    };
    const onLeave=()=>{
      if(totEl){totEl.textContent=origTotal;totEl.style.color='var(--p)';}
      if(statEl)statEl.textContent=origStat;
      if(vl){vl.setAttribute('x1','-99');vl.setAttribute('x2','-99');}
    };
    svgEl.onmousemove=e=>onHover(e.clientX);
    svgEl.onmouseleave=onLeave;
    svgEl.addEventListener('touchmove',e=>{e.preventDefault();onHover(e.touches[0].clientX);},{passive:false});
    svgEl.addEventListener('touchend',onLeave,{passive:true});
  })();
  const sg=g('o-status-grid');if(sg)sg.innerHTML=STATUS_LIST.map(s=>`<div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:800">${orders.filter(o=>o.status===s).length}</div><div style="font-size:10px;color:var(--t2);margin-top:3px">${s}</div></div>`).join('');
}
function refreshSDash(){
  const wp=orders.filter(o=>o.status==='Selesai'&&!o.waSent);
  const sm=g('s-metrics');if(sm)sm.innerHTML=`<div class="mc2 cam"><div class="ml">Pesanan Aktif</div><div class="mv">${orders.filter(o=>!['Selesai','Diambil'].includes(o.status)).length}</div></div><div class="mc2 cg"><div class="ml">Selesai</div><div class="mv">${orders.filter(o=>o.status==='Selesai').length}</div></div><div class="mc2 cr"><div class="ml">Belum WA</div><div class="mv">${wp.length}</div></div>`;
  const sa=g('s-wa-alert');if(sa)sa.innerHTML=wp.length?`<div style="background:var(--pl);border:2px solid var(--p);border-radius:var(--r);padding:12px 15px;display:flex;align-items:center;justify-content:space-between"><div style="font-size:13px;color:#3d6b10">\uD83D\uDCAC ${wp.length} cucian belum dinotif</div><button class="btn bp bsm bpill" onclick="sGo('wa',null)">Kirim</button></div>`:'';
  const last=orders.slice(-5).reverse();
  const sr=g('s-recent');if(sr)sr.innerHTML=last.length?'<table><tbody>'+last.map(o=>`<tr><td style="font-size:11px;font-family:monospace;color:var(--t2)">${o.id}</td><td style="font-weight:600">${o.name}</td><td><span class="badge ${SL_STATUS[o.status]}">${o.status}</span></td><td><span class="badge ${SL_PAY[o.payStatus]}">${o.payStatus}</span></td></tr>`).join('')+'</tbody></table>':'<div style="text-align:center;padding:20px;color:var(--t2)">Belum ada pesanan</div>';
  updStaffClk();
}

// ===== EMPLOYEES =====
function renderEmployees(){
  buildEmpChips();
  const list=empFilter==='all'?employees:employees.filter(e=>e.oid===empFilter);
  const el=g('emp-list');if(!el)return;
  if(!list.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2)">Tidak ada karyawan.</div>';return;}
  let html='';
  if(empFilter==='all'){outlets.forEach(o=>{const grp=list.filter(e=>e.oid===o.id);if(!grp.length)return;html+=`<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--bg);border-radius:10px;margin-bottom:8px"><div style="width:10px;height:10px;border-radius:50%;background:${o.color}"></div><span style="font-weight:700;font-size:13px">${o.name}</span><span class="badge gy">${grp.length}x</span></div>`;grp.forEach(e=>{html+=empCard(e);});});}
  else list.forEach(e=>{html+=empCard(e);});
  el.innerHTML=html;
}
function empCard(e){
  const out=go(e.oid);const stB={in:'gg',off:'gy',cuti:'gpu',sakit:'gam'}[e.status]||'gy';
  const stL={in:'Masuk',off:'Off',cuti:'Cuti',sakit:'Sakit'}[e.status];
  const dots=Array.from({length:2},(_,i)=>`<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${i<e.cutiUsed?'var(--t3)':'var(--p)'};margin-right:3px"></span>`).join('');
  return `<div class="ecrd"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><div class="avatar">${ini(e.name)}</div><div style="flex:1"><div style="font-weight:700;font-size:14px">${e.name}</div><div style="display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap"><span class="badge gy">${e.role}</span><span class="badge ${stB}">${stL}</span>${out?`<span style="font-size:11px;color:var(--t2)">${out.name}</span>`:''}</div></div><div style="text-align:right;font-size:11px;color:var(--t2)"><div>Masuk: ${e.clockIn||'\u2014'}</div><div>Pulang: ${e.clockOut||'\u2014'}</div></div></div><div style="display:flex;align-items:center;gap:8px;margin-bottom:11px;font-size:12px;color:var(--t2)">Sisa cuti: ${dots} ${2-e.cutiUsed}x \u00B7 PIN: ${e.pin?'\u25CF\u25CF\u25CF\u25CF':'<span style="color:var(--re)">Belum diset</span>'}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${e.status==='in'?`<button class="btn bre bsm" onclick="empAct(${e.id},'clkout')">Clock Out</button>`:`<button class="btn bp bsm" onclick="empAct(${e.id},'clkin')">Clock In</button>`}${e.cutiUsed<2?`<button class="btn bam bsm" onclick="empAct(${e.id},'cuti')">Cuti</button>`:`<button class="btn bsm" disabled style="opacity:.4">Cuti Habis</button>`}<button class="btn bsm${e.status==='sakit'?' bam':''}" onclick="empAct(${e.id},'sakit')">Sakit</button><button class="btn bsm" onclick="resetEmpPin(${e.id})">Reset PIN</button><button class="btn bre bsm" onclick="delEmp(${e.id})">Hapus</button></div></div>`;
}
function buildEmpChips(){const tabs=[{id:'all',label:'Semua',color:null},...outlets.map(o=>({id:o.id,label:o.name,color:o.color}))];const el=g('emp-filter-chips');if(!el)return;el.innerHTML=tabs.map(t=>`<span class="chip${empFilter===t.id?' on':''}" onclick="setEmpFilter('${t.id}')">${t.color?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.color};margin-right:5px;vertical-align:middle"></span>`:''}${t.label}</span>`).join('');}
function setEmpFilter(id){empFilter=id;renderEmployees();}
function empAct(id,act){const e=employees.find(x=>x.id===id);if(!e)return;if(act==='clkin'){e.status='in';e.clockIn=NOW();e.clockOut=null;}else if(act==='clkout'){e.status='off';e.clockOut=NOW();}else if(act==='cuti'&&e.cutiUsed<2){e.status='cuti';e.cutiUsed++;e.clockIn=null;e.clockOut=null;}else if(act==='sakit'){e.status='sakit';e.clockIn=null;e.clockOut=null;}renderEmployees();toast(e.name+' \u2192 '+{clkin:'Clock In',clkout:'Clock Out',cuti:'Cuti ('+e.cutiUsed+'/2)',sakit:'Sakit'}[act]);if(curStaff&&curStaff.id===id){curStaff=e;updStaffClk();}}
function resetEmpPin(id){const e=employees.find(x=>x.id===id);if(!e)return;const p=prompt('PIN baru (4 digit) untuk '+e.name+':');if(p===null)return;if(!/^\d{4}$/.test(p)){toast('\u26A0\uFE0F PIN harus 4 digit angka');return;}e.pin=p;renderEmployees();toast('\u2713 PIN '+e.name+' diubah');}
function delEmp(id){confirm_('Hapus Karyawan?','Data ini akan dihapus permanen.',()=>{employees=employees.filter(x=>x.id!==id);renderEmployees();toast('Karyawan dihapus');});}
function openAddEmp(){g('me-n').value='';g('me-p').value='';g('me-o').innerHTML=outlets.map(o=>`<option value="${o.id}">${o.name}</option>`).join('');g('m-emp-title').textContent='Tambah Karyawan';g('m-emp').className='mbg on';}
function saveEmp(){const name=g('me-n').value.trim();if(!name){toast('\u26A0\uFE0F Nama wajib diisi');return;}const pin=g('me-p').value;if(!pin){toast('\u26A0\uFE0F PIN wajib diisi');return;}if(!/^\d{4}$/.test(pin)){toast('\u26A0\uFE0F PIN harus 4 digit angka');return;}employees.push({id:empCtr++,name,role:g('me-r').value,oid:g('me-o').value,pin,status:'off',cutiUsed:0,clockIn:null,clockOut:null});cm('m-emp');renderEmployees();buildStaffBtns();toast('\u2713 Karyawan '+name+' ditambahkan');}
function updStaffClk(){if(!curStaff)return;const e=employees.find(x=>x.id===curStaff.id);if(!e)return;const stM={in:'Sedang bekerja \u00B7 Masuk: '+e.clockIn,off:'Belum clock in hari ini',cuti:'Cuti hari ini',sakit:'Sakit hari ini'};const cs=g('s-clk-st');if(cs)cs.textContent=stM[e.status]||'';const cb=g('s-clk-btns');if(!cb)return;cb.innerHTML=e.status==='in'?`<button class="btn bre bsm bpill" onclick="staffClk('clkout')">Clock Out</button>`:e.status==='off'?`<button class="btn bp bsm bpill" onclick="staffClk('clkin')">Clock In</button>`:`<span class="badge ${e.status==='cuti'?'gpu':'gam'}">${e.status==='cuti'?'Cuti':'Sakit'}</span>`;}
function staffClk(act){if(!curStaff)return;empAct(curStaff.id,act);}

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
  if(emojiEl) emojiEl.textContent = p.emoji;
  const subEl = g('plan-badge-sub');
  if(subEl){
    const d = _daysLeft();
    const isTrial = currentPlanStatus === 'trial';
    if(d !== null && d <= 0){
      subEl.textContent = isTrial ? '⚠️ Trial Berakhir' : '⚠️ Expired';
      subEl.style.color = '#E53935';
    } else if(isTrial){
      subEl.textContent = d !== null ? `Trial: ${d} hari lagi` : 'Trial';
      subEl.style.color = d !== null && d <= 3 ? '#F57C00' : '#888';
    } else if(currentPlanStatus === 'active'){
      if(d === null){ subEl.textContent = ''; }
      else if(d <= 7){ subEl.textContent = `⚠️ ${d} hari lagi`; subEl.style.color = '#F57C00'; }
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
      ? `❌ Masa trial 14 hari kamu sudah berakhir. Silakan berlangganan untuk terus menggunakan CleanPOS. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showUpgradeModal()">Pilih Plan →</a>`
      : `❌ Plan <strong>${PLANS[currentPlan]?.name}</strong> kamu sudah expired. Outlet dibatasi ke 1. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showRenewModal('${currentPlan}')">Perpanjang sekarang →</a>`;
    if(outlets.length > 1) toast('⚠️ Langganan berakhir — hanya 1 outlet aktif.');
  } else if(d <= 7){
    el.style.display = 'block';
    el.style.background = 'var(--amb)'; el.style.border = '1px solid #FFE082'; el.style.color = 'var(--am)';
    el.innerHTML = isTrial
      ? `⚠️ Masa trial kamu berakhir dalam <strong>${d} hari</strong>. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showUpgradeModal()">Pilih Plan →</a>`
      : `⚠️ Plan <strong>${PLANS[currentPlan]?.name}</strong> berakhir dalam <strong>${d} hari</strong>. <a style="cursor:pointer;font-weight:700;text-decoration:underline" onclick="showRenewModal('${currentPlan}')">Perpanjang →</a>`;
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
      btnLabel = '🔄 Perpanjang'; btnAttr = `onclick="showRenewModal('${key}')"`;
    } else {
      btnLabel = isTrial ? 'Berlangganan →' : (isCurrent ? 'Berlangganan →' : 'Upgrade →');
      btnAttr = `onclick="showRenewModal('${key}')"`;
    }
    return `<div style="border:2px solid ${isCurrent?p.color:'var(--b1)'};border-radius:var(--r);padding:16px;display:flex;flex-direction:column;gap:10px;background:${isCurrent?p.color+'12':'var(--ca)'}">
      <div style="text-align:center">
        <div style="font-size:30px">${p.emoji}</div>
        <div style="font-weight:800;font-size:15px;color:${p.color};margin-top:4px">${p.name}</div>
        <div style="font-size:12px;color:var(--t2);margin-top:2px;font-weight:600">${p.blurb}</div>
        ${isTrial&&isCurrent?`<div style="font-size:10px;margin-top:4px;background:${p.color}22;color:${p.color};border-radius:6px;padding:2px 8px;display:inline-block;font-weight:700">Sedang Trial</div>`:''}
      </div>
      <div style="height:1px;background:var(--b1)"></div>
      <div style="font-size:12px;line-height:2;color:var(--t2)">
        <div style="font-weight:700;color:${p.color};font-size:13px;margin-bottom:4px">${p.outlets} Outlet</div>
        ${FEATS.map(f=>`<div>✅ ${f}</div>`).join('')}
      </div>
      <button class="btn bfull bpill" style="font-size:12px;background:${p.color};border-color:${p.color};color:#fff" ${btnAttr}>
        ${btnLabel}
      </button>
    </div>`;
  }).join('');
  g('m-upgrade').className = 'mbg on';
}

function showRenewModal(plan){
  _renewCycle = 'monthly';
  cm('m-upgrade');
  const p = PLANS[plan] || PLANS.elite;
  const titleEl = g('renew-plan-name');
  const isRenewal = currentPlanStatus === 'active' && currentPlan === plan;
  if(titleEl) titleEl.textContent = `${p.emoji} ${p.name} — ${isRenewal ? 'Perpanjang' : 'Berlangganan'}`;
  _renderRenewModal(plan);
  g('m-renew').className = 'mbg on';
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

// processSuccessfulPayment — dipanggil setelah pembayaran berhasil
async function processSuccessfulPayment(plan, cycle){
  const days = cycle === 'annual' ? 365 : 30;
  // Stack on top of existing expiry (never lose days)
  let newExpiry;
  if(currentPlanExpiry && new Date(currentPlanExpiry) > new Date()){
    const base = new Date(currentPlanExpiry);
    base.setDate(base.getDate() + days);
    newExpiry = base.toISOString();
  } else {
    const base = new Date();
    base.setDate(base.getDate() + days);
    newExpiry = base.toISOString();
  }
  currentPlan = plan;
  currentPlanStatus = 'active';
  currentPlanExpiry = newExpiry;
  await sbUpsert('subscriptions', {
    user_id: currentUserId,
    plan, status: 'active', expires_at: newExpiry
  }, 'user_id');
  renderPlanBadge();
  renderSubCard();
  checkPlanExpiry(); // also unlocks nav
  cm('m-renew'); cm('m-upgrade');
  // Return to dashboard now that plan is active
  oGo('dashboard', document.querySelector('#o-nav .ni[onclick*="dashboard"]'));
  toast(`✅ Plan ${PLANS[plan]?.name} aktif ${days} hari! Berakhir ${new Date(newExpiry).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}`);
}

function renderSubCard(){
  const el = g('settings-sub-card'); if(!el) return;
  const p = PLANS[currentPlan] || PLANS.basic;
  const d = _daysLeft();
  const isExpired = d !== null && d <= 0;
  const isWarn = d !== null && d > 0 && d <= 7;

  const isTrial = currentPlanStatus === 'trial';

  // Status pill
  let statusHtml;
  if(isTrial && isExpired){
    statusHtml = `<span style="background:var(--reb);color:var(--re);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">❌ Trial Berakhir</span>`;
  } else if(isTrial){
    statusHtml = `<span style="background:#FFF8E1;color:#F57C00;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">⏳ Trial Gratis</span>`;
  } else if(isExpired){
    statusHtml = `<span style="background:var(--reb);color:var(--re);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">❌ Expired</span>`;
  } else if(currentPlanStatus === 'active'){
    statusHtml = `<span style="background:#E8F5E9;color:#2E7D32;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">✅ Aktif</span>`;
  } else {
    statusHtml = `<span style="background:var(--amb);color:var(--am);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">⏳ ${currentPlanStatus}</span>`;
  }

  // Expiry line
  let expiryHtml = '';
  if(currentPlanExpiry){
    const expiryDate = new Date(currentPlanExpiry).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
    if(isExpired){
      expiryHtml = `<div style="font-size:12px;color:var(--re);margin-top:4px">${isTrial?'Trial berakhir':'Berakhir'}: ${expiryDate}</div>`;
    } else if(isWarn){
      expiryHtml = `<div style="font-size:12px;color:#F57C00;margin-top:4px">⚠️ ${isTrial?'Trial berakhir':'Berakhir'}: ${expiryDate} (${d} hari lagi)</div>`;
    } else {
      expiryHtml = `<div style="font-size:12px;color:var(--t2);margin-top:4px">${isTrial?'Trial berakhir':'Berakhir'}: ${expiryDate} · <strong style="color:var(--t1)">${d} hari lagi</strong></div>`;
    }
  }

  // Features for current plan
  const FEATS = ['Pesanan tak terbatas','Laporan keuangan','Multi-karyawan','Sync cloud real-time'];

  el.innerHTML = `<div class="card" style="border-left:4px solid ${p.color}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:22px">${p.emoji}</span>
          <div>
            <div style="font-weight:800;font-size:15px;color:${p.color}">${p.name}</div>
            <div style="font-size:12px;color:var(--t2)">${p.blurb} · ${p.outlets} outlet</div>
          </div>
          <div style="margin-left:4px">${statusHtml}</div>
        </div>
        ${expiryHtml}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
          ${FEATS.map(f=>`<span style="font-size:11px;background:var(--ca);border:1px solid var(--b1);border-radius:6px;padding:2px 8px;color:var(--t2)">✓ ${f}</span>`).join('')}
          <span style="font-size:11px;background:${p.color}18;border:1px solid ${p.color}44;border-radius:6px;padding:2px 8px;color:${p.color};font-weight:700">✓ ${p.outlets} Outlet</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:120px">
        ${isTrial || isExpired
          ? `<button class="btn bpill bsm" style="background:${p.color};border-color:${p.color};color:#fff;font-size:12px" onclick="showUpgradeModal()">⭐ Berlangganan</button>`
          : `<button class="btn bpill bsm" style="background:${p.color};border-color:${p.color};color:#fff;font-size:12px" onclick="showRenewModal('${currentPlan}')">🔄 Perpanjang</button>`}
        <button class="btn bpill bsm" style="font-size:12px" onclick="showUpgradeModal()">Lihat Semua Plan</button>
      </div>
    </div>
  </div>`;
}

// ===== MIDTRANS PAYMENT — uncomment setelah integrasi backend siap =====
function initMidtransPayment(plan, cycle){
  // ------------------------------------------------------------------
  // CARA INTEGRASI MIDTRANS SNAP:
  // 1. Tambahkan script Midtrans di index.html (sudah ada, tinggal uncomment):
  //    <script src="https://app.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
  //    (Gunakan https://app.sandbox.midtrans.com/snap/snap.js untuk testing)
  //
  // 2. Buat Supabase Edge Function `create-payment`:
  //    - Terima: { plan, cycle, user_id }
  //    - Hitung amount dari PLANS[plan][cycle === 'annual' ? 'annual' : 'price']
  //    - Panggil Midtrans Transactions API → kembalikan snap_token
  //
  // 3. Uncomment kode di bawah ini dan hapus baris toast() terakhir.
  // ------------------------------------------------------------------
  //
  // (async () => {
  //   const btn = g('renew-pay-btn');
  //   if(btn){ btn.disabled = true; btn.textContent = '⏳ Memproses...'; }
  //   try {
  //     const res = await fetch('/functions/v1/create-payment', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token },
  //       body: JSON.stringify({ plan, cycle, user_id: currentUserId })
  //     });
  //     const { snap_token, error } = await res.json();
  //     if(error) throw new Error(error);
  //     window.snap.pay(snap_token, {
  //       onSuccess: async (result) => {
  //         console.log('[midtrans] success', result);
  //         await processSuccessfulPayment(plan, cycle);
  //       },
  //       onPending: (result) => {
  //         console.log('[midtrans] pending', result);
  //         toast('⏳ Pembayaran pending. Cek email untuk instruksi.');
  //       },
  //       onError: (result) => {
  //         console.error('[midtrans] error', result);
  //         toast('❌ Pembayaran gagal. Coba lagi.');
  //       },
  //       onClose: () => {
  //         // User closed the Snap popup
  //       }
  //     });
  //   } catch(err) {
  //     console.error('[payment]', err);
  //     toast('❌ Error: ' + err.message);
  //   } finally {
  //     if(btn){ btn.disabled = false; btn.textContent = 'Bayar Sekarang'; }
  //   }
  // })();

  // TODO: hapus baris ini setelah Midtrans aktif
  toast('🔔 Pembayaran via Midtrans segera hadir! Hubungi admin untuk upgrade manual.');
}

// ===== OUTLETS =====
function renderOutlets(){const el=g('outlet-list-ui');if(!el)return;el.innerHTML=outlets.map(o=>{const cnt=employees.filter(e=>e.oid===o.id).length;return `<div class="card" style="border-left:5px solid ${o.color}"><div style="display:flex;align-items:center;gap:12px"><div style="width:44px;height:44px;border-radius:12px;background:${o.color}20;display:flex;align-items:center;justify-content:center;font-size:22px">\uD83C\uDFEA</div><div style="flex:1"><div style="font-weight:700;font-size:14px">${o.name}</div><div style="font-size:12px;color:var(--t2);margin-top:3px">${o.addr} \u00B7 ${cnt} karyawan</div></div><button class="btn bre bsm" onclick="delOutlet('${o.id}')">Hapus</button></div></div>`;}).join('');}
function openAddOutlet(){g('mo-n').value='';g('mo-a').value='';selOutletColor='#8DC440';const cols=['#8DC440','#1976D2','#E53935','#F57C00','#7B1FA2','#4CAF50'];g('mo-colors').innerHTML=cols.map((c,i)=>`<div onclick="selOutletColor='${c}';document.querySelectorAll('.oc').forEach(x=>x.style.outline='none');this.style.outline='3px solid ${c}';this.style.outlineOffset='3px'" class="oc" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;${i===0?`outline:3px solid ${c};outline-offset:3px`:''}"></div>`).join('');g('m-outlet').className='mbg on';}
function saveOutlet(){
  const max=PLAN_LIMITS[currentPlan]||1;
  if(outlets.length>=max){
    cm('m-outlet');
    toast(`\u26A0\uFE0F Plan ${PLANS[currentPlan]?.name||'Basic'} maksimal ${max} outlet`);
    showUpgradeModal();return;
  }
  const name=g('mo-n').value.trim();if(!name){toast('\u26A0\uFE0F Nama outlet wajib diisi');return;}
  outlets.push({id:'o'+outletCtr++,name,addr:g('mo-a').value.trim()||'\u2014',color:selOutletColor});
  cm('m-outlet');renderOutlets();buildEmpChips();goOutletSelect();toast('\u2713 Outlet "'+name+'" ditambahkan');
}
function delOutlet(id){confirm_('Hapus Outlet?','Outlet ini akan dihapus.',()=>{outlets=outlets.filter(x=>x.id!==id);renderOutlets();buildEmpChips();toast('Outlet dihapus');});}

// ===== CUSTOMERS =====
function renderCusts(){const q=(g('cust-srch')?.value||'').toLowerCase();const list=Object.values(customers).filter(c=>!q||c.name.toLowerCase().includes(q)||c.phone.includes(q));const tb=g('cust-tb');if(!tb)return;tb.innerHTML=list.length?list.map(c=>`<tr><td style="font-weight:600">${c.name}</td><td style="color:var(--p)">${c.phone}</td><td>${c.orders}x</td><td style="font-weight:700">${fmt(c.total)}</td><td style="font-size:12px;color:var(--t2)">${c.lastDate}</td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--t2)">Tidak ada pelanggan</td></tr>';}

// ===== PRICING & ADDONS =====
function renderPricing(){renderSvcTypeList();renderSatuanItemsList();renderAddonList();buildOrderTypeDropdowns();rebuildPromoSvcSelect();}
function renderSvcTypeList(){
  const el=g('svc-type-list');if(!el)return;
  if(!serviceTypes.length){el.innerHTML='<div style="text-align:center;padding:16px;color:var(--t2)">Belum ada layanan.</div>';return;}
  const hdr=`<div style="display:grid;grid-template-columns:1fr 88px 88px 88px 70px;gap:6px;align-items:center;padding:6px 10px;background:var(--bg);border-radius:8px;margin-bottom:6px;font-size:10px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.04em"><span>Layanan</span><span>Regular</span><span>Same-day</span><span>Express</span><span></span></div>`;
  let rows='';
  serviceTypes.forEach(s=>{
    const isKg=s.unit==='kg';const ma=s.minKgApply||{regular:false,sameday:false,express:false};const mk=s.minKg||0;
    rows+=`<div style="border:1px solid var(--b1);border-radius:10px;padding:10px;margin-bottom:8px">`;
    rows+=`<div style="display:grid;grid-template-columns:1fr 88px 88px 88px 70px;gap:6px;align-items:center;${isKg?'margin-bottom:10px':''}">`;
    rows+=`<div><div style="font-weight:600;font-size:13px">${s.name}</div><div style="font-size:10px;color:var(--t2)">per ${s.unit}</div></div>`;
    rows+=`<input type="number" value="${s.prices.regular}" min="0" onchange="updSvcPrice('${s.id}','regular',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<input type="number" value="${s.prices.sameday}" min="0" onchange="updSvcPrice('${s.id}','sameday',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<input type="number" value="${s.prices.express}" min="0" onchange="updSvcPrice('${s.id}','express',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<div style="display:flex;gap:4px"><button class="btn bsm" onclick="openEditSvc('${s.id}')">Edit</button>${serviceTypes.length>1?`<button class="btn bre bsm" onclick="delSvc('${s.id}')">\u2715</button>`:''}</div>`;
    rows+=`</div>`;
    if(isKg){
      rows+=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;background:var(--bg);border-radius:8px">`;
      rows+=`<span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.04em">Min. Berat:</span>`;
      rows+=`<input type="number" id="mkg-${s.id}" value="${mk}" min="0" max="20" step="0.5" style="width:64px;font-size:14px;font-weight:700;text-align:center">`;
      rows+=`<span style="font-size:13px;font-weight:600">kg &nbsp; Berlaku:</span>`;
      ['regular','sameday','express'].forEach(c=>{const lbl={regular:'Regular',sameday:'Same-day',express:'Express'}[c];rows+=`<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="mka-${s.id}-${c}" ${ma[c]?'checked':''} onchange="saveSvcMinKg('${s.id}')">&nbsp;${lbl}</label>`;});
      rows+=`<button class="btn bp bsm bpill" onclick="saveSvcMinKg('${s.id}')">Simpan</button>`;
      rows+=`</div>`;
    }
    rows+=`</div>`;
  });
  el.innerHTML=hdr+rows;
}
function saveSvcMinKg(id){const s=getSvcById(id);if(!s)return;const val=parseFloat(g('mkg-'+id)?.value)||0;s.minKg=val;s.minKgApply={regular:!!(g('mka-'+id+'-regular')?.checked),sameday:!!(g('mka-'+id+'-sameday')?.checked),express:!!(g('mka-'+id+'-express')?.checked)};calcO();calcS();syncSettings();toast('\u2713 Min. berat '+s.name+' diperbarui');}
function renderSatuanItemsList(){
  const el=g('satuan-items-list');if(!el)return;
  const hdr=`<div style="display:grid;grid-template-columns:1fr 88px 88px 88px 70px;gap:6px;align-items:center;padding:6px 10px;background:var(--bg);border-radius:8px;margin-bottom:6px;font-size:10px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.04em"><span>Item</span><span>Regular</span><span>Same-day</span><span>Express</span><span></span></div>`;
  if(!satuanItems.length){el.innerHTML=hdr+'<div style="text-align:center;padding:16px;color:var(--t2)">Belum ada item. Klik + Tambah Item.</div>';return;}
  let rows='';
  satuanItems.forEach(item=>{
    rows+=`<div style="display:grid;grid-template-columns:1fr 88px 88px 88px 70px;gap:6px;align-items:center;padding:6px 4px;border-bottom:1px solid var(--b1)">`;
    rows+=`<div style="font-weight:600;font-size:13px">${item.name}</div>`;
    rows+=`<input type="number" value="${item.prices.regular}" min="0" onchange="updSatuanItemPrice('${item.id}','regular',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<input type="number" value="${item.prices.sameday}" min="0" onchange="updSatuanItemPrice('${item.id}','sameday',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<input type="number" value="${item.prices.express}" min="0" onchange="updSatuanItemPrice('${item.id}','express',this.value)" style="width:88px;font-size:13px;padding:6px 8px">`;
    rows+=`<div style="display:flex;gap:4px"><button class="btn bsm" onclick="openEditSatuanItem('${item.id}')">Edit</button><button class="btn bre bsm" onclick="delSatuanItem('${item.id}')">\u2715</button></div>`;
    rows+=`</div>`;
  });
  el.innerHTML=hdr+rows;
}
function updSatuanItemPrice(id,cat,val){const item=satuanItems.find(x=>x.id===id);if(!item)return;item.prices[cat]=parseInt(val)||0;buildSatuanOrderItems('no');calcO();buildSatuanOrderItems('sno');calcS();syncSettings();}
function updSvcPrice(id,cat,val){const s=getSvcById(id);if(!s)return;s.prices[cat]=parseInt(val)||0;buildOrderForm('no');calcO();buildOrderForm('sno');calcS();syncSettings();}
function buildOrderTypeDropdowns(){['no-type','sno-type'].forEach(selId=>{const el=g(selId);if(!el)return;const curVal=el.value;el.innerHTML=serviceTypes.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')+`<option value="satuan">Satuan</option>`;if(serviceTypes.find(s=>s.id===curVal)||curVal==='satuan')el.value=curVal;});}
function rebuildPromoSvcSelect(){const el=g('mp-svc');if(!el)return;el.innerHTML='<option value="all">Semua Layanan</option>'+serviceTypes.map(s=>`<option value="${s.id}-regular">${s.name} Regular</option><option value="${s.id}-sameday">${s.name} Same-day</option><option value="${s.id}-express">${s.name} Express</option>`).join('')+'<option value="satuan-regular">Satuan Regular</option><option value="satuan-sameday">Satuan Same-day</option><option value="satuan-express">Satuan Express</option>';}
function openAddSvc(){editSvcId=null;g('m-svc-title').textContent='Tambah Jenis Layanan';['msvc-name','msvc-r','msvc-sd','msvc-e'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('msvc-unit'))g('msvc-unit').value='pcs';g('m-svc').className='mbg on';}
function openEditSvc(id){editSvcId=id;const s=getSvcById(id);if(!s)return;g('m-svc-title').textContent='Edit Layanan: '+s.name;if(g('msvc-name'))g('msvc-name').value=s.name;if(g('msvc-unit'))g('msvc-unit').value=s.unit;if(g('msvc-r'))g('msvc-r').value=s.prices.regular;if(g('msvc-sd'))g('msvc-sd').value=s.prices.sameday;if(g('msvc-e'))g('msvc-e').value=s.prices.express;g('m-svc').className='mbg on';}
function saveSvc(){const name=(g('msvc-name')?.value||'').trim();if(!name){toast('\u26A0\uFE0F Nama layanan wajib diisi');return;}const unit=g('msvc-unit')?.value||'pcs';const prices={regular:parseInt(g('msvc-r')?.value)||0,sameday:parseInt(g('msvc-sd')?.value)||0,express:parseInt(g('msvc-e')?.value)||0};if(editSvcId){const s=getSvcById(editSvcId);if(s){s.name=name;s.unit=unit;s.prices=prices;}}else{const id='svc'+svcCtr++;serviceTypes.push({id,name,unit,prices,minKg:0,minKgApply:{regular:false,sameday:false,express:false}});}cm('m-svc');renderPricing();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();toast(editSvcId?'\u2713 Layanan diperbarui: '+name:'\u2713 Layanan ditambahkan: '+name);editSvcId=null;}
function delSvc(id){if(serviceTypes.length<=1){toast('\u26A0\uFE0F Minimal harus ada 1 jenis layanan');return;}confirm_('Hapus Layanan?','Jenis layanan ini akan dihapus. Pesanan yang sudah ada tidak terpengaruh.',()=>{serviceTypes=serviceTypes.filter(s=>s.id!==id);renderPricing();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();toast('Layanan dihapus');});}
let editSatItemId=null;
function openAddSatuanItem(){editSatItemId=null;g('m-sat-title').textContent='Tambah Item Satuan';['msat-name','msat-r','msat-sd','msat-e'].forEach(id=>{const el=g(id);if(el)el.value='';});g('m-satuan-item').className='mbg on';}
function openEditSatuanItem(id){editSatItemId=id;const item=satuanItems.find(x=>x.id===id);if(!item)return;g('m-sat-title').textContent='Edit Item: '+item.name;if(g('msat-name'))g('msat-name').value=item.name;if(g('msat-r'))g('msat-r').value=item.prices.regular;if(g('msat-sd'))g('msat-sd').value=item.prices.sameday;if(g('msat-e'))g('msat-e').value=item.prices.express;g('m-satuan-item').className='mbg on';}
function saveSatuanItem(){const name=(g('msat-name')?.value||'').trim();if(!name){toast('\u26A0\uFE0F Nama item wajib diisi');return;}const prices={regular:parseInt(g('msat-r')?.value)||0,sameday:parseInt(g('msat-sd')?.value)||0,express:parseInt(g('msat-e')?.value)||0};if(editSatItemId){const item=satuanItems.find(x=>x.id===editSatItemId);if(item){item.name=name;item.prices=prices;}}else{satuanItems.push({id:'sat'+satItemCtr++,name,prices});}cm('m-satuan-item');renderPricing();buildSatuanOrderItems('no');buildSatuanOrderItems('sno');calcO();calcS();syncSettings();toast(editSatItemId?'\u2713 Item diperbarui: '+name:'\u2713 Item ditambahkan: '+name);editSatItemId=null;}
function delSatuanItem(id){confirm_('Hapus Item?','Item ini akan dihapus dari daftar Satuan.',()=>{satuanItems=satuanItems.filter(x=>x.id!==id);renderPricing();buildSatuanOrderItems('no');buildSatuanOrderItems('sno');calcO();calcS();syncSettings();toast('Item dihapus');});}
function renderAddonList(){const el=g('addon-list');if(!el)return;el.innerHTML=addons.length?addons.map(a=>`<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--b1);font-size:13px"><input value="${a.name}" onchange="updAddon('${a.id}','name',this.value)" style="flex:1;width:auto;font-size:13px;padding:6px 8px"><input type="number" value="${a.price}" onchange="updAddon('${a.id}','price',this.value)" style="width:90px;font-size:13px;padding:6px 8px"><select onchange="updAddon('${a.id}','unit',this.value)" style="width:110px;font-size:13px;padding:6px 8px"><option value="flat" ${a.unit==='flat'?'selected':''}>per pesanan</option><option value="per_qty" ${a.unit==='per_qty'?'selected':''}>per kg/pcs</option></select><button class="btn bre bsm" onclick="delAddon('${a.id}')">\u2715</button></div>`).join(''):'<div style="text-align:center;padding:18px;color:var(--t2);font-size:13px">Belum ada layanan tambahan.</div>';}
function updAddon(id,key,val){const a=addons.find(x=>x.id===id);if(!a)return;a[key]=key==='price'?parseInt(val)||0:val;buildOrderForm('no');calcO();buildOrderForm('sno');calcS();}
function delAddon(id){addons=addons.filter(x=>x.id!==id);renderAddonList();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();}
function openAddAddon(){g('mad-n').value='';g('mad-p').value='';g('mad-u').value='flat';g('m-addon').className='mbg on';}
function saveAddon(){const name=g('mad-n').value.trim();if(!name){toast('\u26A0\uFE0F Nama wajib diisi');return;}addons.push({id:'a'+addonCtr++,name,price:parseInt(g('mad-p').value)||0,unit:g('mad-u').value});cm('m-addon');renderAddonList();buildOrderForm('no');calcO();buildOrderForm('sno');calcS();toast('\u2713 Layanan tambahan ditambahkan');}

// ===== PROMO =====
function isPromoToday(p){if(!p.active)return false;const dm=p.days.length===0||p.days.includes(String(TODAY_DAY));return dm&&(!p.from||TODAY_ISO>=p.from)&&(!p.to||TODAY_ISO<=p.to);}
function promoDiscLbl(p){if(p.discType==='persen')return `-${p.discVal}%`;if(p.discType==='flat')return `-${fmt(p.discVal)}`;return `-${fmt(p.discVal)}/qty`;}
function renderPromo(){const el=g('promo-list');if(!el)return;if(!promos.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2)">Belum ada promo.</div>';return;}const today=promos.filter(p=>isPromoToday(p));const rest=promos.filter(p=>!isPromoToday(p));let html='';if(today.length){html+=`<div style="font-size:11px;font-weight:700;color:var(--am);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">\uD83D\uDD25 Berlaku Hari Ini</div>`;today.forEach(p=>{html+=promoCard(p,true);});}if(rest.length){if(today.length)html+='<div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin:14px 0 8px">Promo Lainnya</div>';rest.forEach(p=>{html+=promoCard(p,false);});}el.innerHTML=html;}
function promoCard(p,today){const dn=p.days.length?p.days.map(d=>DAYS_ID[parseInt(d)]).join(', '):'Setiap hari';return `<div class="pcrd${today?' pact':!p.active?' poff':''}"><div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1"><div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;flex-wrap:wrap"><span style="font-weight:700;font-size:14px">${p.name}</span>${today?'<span class="ptd">\uD83D\uDD25 Hari ini</span>':''}${!p.active?'<span class="badge gy">Nonaktif</span>':''}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px"><span class="badge gbl">${SVC_LBL[p.svc]||p.svc}</span><span class="badge gr_" style="font-weight:700">${promoDiscLbl(p)}</span><span class="badge gp">\uD83D\uDCC5 ${dn}</span>${p.from||p.to?`<span class="badge gy">${p.from||'\u2014'} s/d ${p.to||'\u2014'}</span>`:''} ${p.outlets&&p.outlets.length?p.outlets.map(oid=>{const out=go(oid);return out?`<span class="badge" style="background:${out.color}18;color:${out.color}">${out.name}</span>`:''}).join(''):'<span class="badge gy">Semua Outlet</span>'}</div>${p.note?`<div style="font-size:12px;color:var(--t2)">${p.note}</div>`:''}</div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:7px"><button class="toggle ${p.active?'on':'off'}" onclick="togglePromo('${p.id}')"></button><div style="display:flex;gap:4px"><button class="btn bsm" onclick="openEditPromo('${p.id}')">Edit</button><button class="btn bre bsm" onclick="delPromo('${p.id}')">Hapus</button></div></div></div></div>`;}
function togglePromo(id){const p=promos.find(x=>x.id===id);if(!p)return;p.active=!p.active;renderPromo();syncSettings();toast((p.active?'\u2713 Promo aktif':'Promo nonaktif')+': '+p.name);}
function delPromo(id){confirm_('Hapus Promo?','Promo ini akan dihapus.',()=>{promos=promos.filter(x=>x.id!==id);renderPromo();syncSettings();toast('Promo dihapus');});}
function promoDiscChange(){const dl=g('mp-dv-lbl');if(dl)dl.textContent={persen:'Nilai (%)',flat:'Nominal (Rp)',per_qty:'Per Kg/Pcs (Rp)'}[g('mp-dt').value]||'Nilai';}
function tDay(el,day){el.classList.toggle('sel');if(el.classList.contains('sel')){if(!selDays.includes(day))selDays.push(day);}else selDays=selDays.filter(d=>d!==day);}
function buildPromoOutletChips(sel){const el=g('mp-outlet-chips');if(!el)return;el.innerHTML=outlets.map(o=>{const s=sel.includes(o.id);return `<span class="chip${s?' on':''}" onclick="togglePromoOutlet('${o.id}',this)" style="${s?`background:${o.color}18;border-color:${o.color};color:${o.color}`:''}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${o.color};margin-right:5px;vertical-align:middle"></span>${o.name}</span>`;}).join('');}
function togglePromoOutlet(id){if(promoOutlets.includes(id))promoOutlets=promoOutlets.filter(x=>x!==id);else promoOutlets.push(id);buildPromoOutletChips(promoOutlets);}
function openAddPromo(){editPromoId=null;selDays=[];promoOutlets=[];g('m-promo-title').textContent='Tambah Promo';['mp-n','mp-dv','mp-from','mp-to','mp-note'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('mp-svc'))g('mp-svc').value='all';if(g('mp-dt'))g('mp-dt').value='persen';document.querySelectorAll('.day-pill').forEach(el=>el.classList.remove('sel'));buildPromoOutletChips([]);promoDiscChange();g('m-promo').className='mbg on';}
function openEditPromo(id){editPromoId=id;const p=promos.find(x=>x.id===id);if(!p)return;selDays=[...p.days];promoOutlets=[...(p.outlets||[])];g('m-promo-title').textContent='Edit Promo';if(g('mp-n'))g('mp-n').value=p.name;if(g('mp-svc'))g('mp-svc').value=p.svc;if(g('mp-dt'))g('mp-dt').value=p.discType;if(g('mp-dv'))g('mp-dv').value=p.discVal;if(g('mp-from'))g('mp-from').value=p.from;if(g('mp-to'))g('mp-to').value=p.to;if(g('mp-note'))g('mp-note').value=p.note;document.querySelectorAll('.day-pill').forEach(el=>{const m=el.getAttribute('onclick').match(/'(\d)'/);if(m)el.classList.toggle('sel',selDays.includes(m[1]));});buildPromoOutletChips(promoOutlets);promoDiscChange();g('m-promo').className='mbg on';}
function savePromo(){const name=g('mp-n').value.trim();if(!name){toast('\u26A0\uFE0F Nama promo wajib diisi');return;}const val=parseFloat(g('mp-dv').value)||0;if(!val){toast('\u26A0\uFE0F Nilai diskon wajib diisi');return;}const obj={id:editPromoId||'pr'+promoCtr++,name,svc:g('mp-svc').value,discType:g('mp-dt').value,discVal:val,days:[...selDays],from:g('mp-from').value,to:g('mp-to').value,note:g('mp-note').value,active:true,outlets:[...promoOutlets]};if(editPromoId){const i=promos.findIndex(x=>x.id===editPromoId);if(i>=0)promos[i]={...promos[i],...obj,id:editPromoId};}else promos.unshift(obj);cm('m-promo');renderPromo();toast(editPromoId?'\u2713 Promo diperbarui':'\u2713 Promo ditambahkan: '+name);}

// ===== KAS KASIR =====
function setKasOutlet(id){kasOutlet=id;renderKas();}
function renderKas(){
  const kc=g('kas-outlet-chips');
  if(kc){if(kasOutlet==='all'&&outlets.length>0)kasOutlet=outlets[0].id;kc.innerHTML=outlets.map(o=>`<span class="chip${kasOutlet===o.id?' on':''}" onclick="setKasOutlet('${o.id}')" style="${kasOutlet===o.id?`background:${o.color}18;border-color:${o.color};color:${o.color}`:''}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${o.color};margin-right:5px;vertical-align:middle"></span>${o.name}</span>`).join('');}
  const fl=kasLog.filter(l=>!l.outletId||l.outletId===kasOutlet);
  const modal=fl.filter(x=>x.type==='modal').reduce((s,x)=>s+x.amount,0);
  const cashIn=fl.filter(x=>x.type==='in').reduce((s,x)=>s+x.amount,0);
  const cashOut=fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);
  const saldo=modal+cashIn-cashOut;
  const km=g('kas-metrics');if(km)km.innerHTML=`<div class="mc2 cp" style="grid-column:span 2"><div class="ml">\uD83D\uDCB0 Saldo Kas Saat Ini</div><div class="mv" style="font-size:28px">${fmt(saldo)}</div></div><div class="mc2 cam"><div class="ml">Modal Awal</div><div class="mv" style="font-size:16px">${fmt(modal)}</div></div><div class="mc2 cg"><div class="ml">Penjualan Cash</div><div class="mv" style="font-size:16px">${fmt(cashIn)}</div></div>`;
  const filter=g('kas-filter')?.value||'all';
  const list=[...fl].reverse().filter(x=>filter==='all'||x.type===filter);
  const kl=g('kas-log');if(!kl)return;
  const icons={modal:'\uD83D\uDCB5',in:'\uD83D\uDFE2',out:'\uD83D\uDD34'};
  kl.innerHTML=list.length?list.map(l=>`<div class="li_"><div class="lic">${icons[l.type]||'\uD83D\uDCB5'}</div><div style="flex:1"><div style="font-weight:600">${l.desc}</div><div style="font-size:11px;color:var(--t2)">${l.note||'\u2014'}</div></div><div style="text-align:right"><div style="font-weight:700;color:${l.type==='out'?'var(--re)':'var(--p)'}">${l.type==='out'?'-':'+'}${fmt(l.amount)}</div><div style="font-size:10px;color:var(--t2)">${l.time}</div></div></div>`).join(''):'<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Belum ada riwayat</div>';
}
function openKas(type){kasType=type;g('m-kas-title').textContent=type==='setor'?'\u2795 Setor Modal':'\u2796 Tarik Kas';g('mk-nom').value='';g('mk-note').value='';g('mk-hint').textContent='';g('m-kas').className='mbg on';}
function kasNomHint(){const v=parseInt(g('mk-nom').value)||0;g('mk-hint').textContent=v>0?'= '+fmt(v):'';}
function submitKas(){const nom=parseInt(g('mk-nom').value)||0;if(!nom||nom<=0){toast('\u26A0\uFE0F Masukkan nominal yang valid');return;}if(kasType==='tarik'){const fl=kasLog.filter(l=>!l.outletId||l.outletId===kasOutlet);const s=fl.filter(x=>x.type!=='out').reduce((s,x)=>s+x.amount,0)-fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);if(nom>s){toast('\u26A0\uFE0F Nominal melebihi saldo ('+fmt(s)+')');return;}}kasLog.push({id:kasCtr++,type:kasType==='setor'?'modal':'out',desc:kasType==='setor'?'Setor Modal':'Tarik Kas',note:g('mk-note').value||'\u2014',amount:nom,time:NOW(),outletId:kasOutlet!=='all'?kasOutlet:(curStaff?.oid||null)});cm('m-kas');renderKas();toast(kasType==='setor'?'\u2713 Modal disetor: '+fmt(nom):'\u2713 Kas ditarik: '+fmt(nom));}

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
  const rev=filtOrd.filter(o=>o.payStatus==='Lunas'&&o.isoDate&&o.isoDate.startsWith(thisMonth)).reduce((s,o)=>s+o.total,0);
  const profit=rev-expMonth;
  const outLbl=expOutlet==='all'?'Semua Outlet':(outlets.find(o=>o.id===expOutlet)?.name||'');
  const em=g('exp-metrics');if(em)em.innerHTML=`<div class="mc2 cam"><div class="ml">Pengeluaran Hari Ini${outLbl?` \u00B7 ${outLbl}`:''}</div><div class="mv" style="font-size:16px">${fmt(expToday)}</div></div><div class="mc2 cr"><div class="ml">Pengeluaran Bulan Ini</div><div class="mv" style="font-size:16px">${fmt(expMonth)}</div></div><div class="mc2 ${profit>=0?'cg':'cr'}"><div class="ml">Estimasi Profit</div><div class="mv" style="font-size:16px">${profit>=0?'+':'-'}${fmt(Math.abs(profit))}</div></div>`;
  const filter=g('ex-filter')?.value||'all';
  const list=[...filtExp].reverse().filter(e=>{if(filter==='today')return e.date===today;if(filter==='month')return e.date.startsWith(thisMonth);return true;});
  const el=g('exp-log');if(!el)return;
  el.innerHTML=list.length?list.map(e=>`<div class="li_" style="align-items:flex-start;flex-wrap:wrap;gap:6px"><div class="lic" style="margin-top:2px">${CAT_ICONS[e.cat]||'\uD83D\uDCE6'}</div><div id="exp-view-${e.id}" style="flex:1;min-width:0"><div style="font-weight:600">${e.label}</div><div style="font-size:11px;color:var(--t2);margin-top:2px">${e.note||''} \u00B7 ${e.src==='cash'?'\uD83D\uDCB5 Cash':'\uD83C\uDFE6 Transfer'} \u00B7 ${e.date}${e.outletId?` \u00B7 <span style='color:${go(e.outletId)?.color||'var(--t2)'};font-weight:600'>${go(e.outletId)?.name||''}</span>`:''}</div></div><div id="exp-edit-${e.id}" style="flex:1;min-width:0;display:none"><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px"><input id="ee-nom-${e.id}" type="number" value="${e.nominal}" placeholder="Nominal" style="font-size:12px;padding:6px 8px"><input id="ee-date-${e.id}" type="date" value="${e.date}" style="font-size:12px;padding:6px 8px"></div><input id="ee-note-${e.id}" value="${e.note||''}" placeholder="Catatan..." style="font-size:12px;padding:6px 8px;width:100%;margin-bottom:5px"><div style="display:flex;gap:5px"><button class="btn bp bsm" onclick="saveExpEdit(${e.id})">Simpan</button><button class="btn bsm" onclick="cancelExpEdit(${e.id})">Batal</button></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0"><div style="font-weight:700;color:var(--re)">-${fmt(e.nominal)}</div><div style="display:flex;gap:4px"><button class="btn bsm" onclick="startExpEdit(${e.id})">Edit</button><button class="btn bre bsm" onclick="delExpense(${e.id})">Hapus</button></div></div></div>`).join(''):'<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Tidak ada data</div>';
}
function startExpEdit(id){document.getElementById('exp-view-'+id).style.display='none';document.getElementById('exp-edit-'+id).style.display='block';}
function cancelExpEdit(id){document.getElementById('exp-view-'+id).style.display='block';document.getElementById('exp-edit-'+id).style.display='none';}
function saveExpEdit(id){const e=expenses.find(x=>x.id===id);if(!e)return;const nom=parseInt(document.getElementById('ee-nom-'+id)?.value)||0;const date=document.getElementById('ee-date-'+id)?.value||e.date;const note=document.getElementById('ee-note-'+id)?.value||'';if(!nom){toast('\u26A0\uFE0F Nominal tidak valid');return;}e.nominal=nom;e.date=date;e.note=note;renderExpenses();toast('\u2713 Pengeluaran diperbarui');}
function delExpense(id){confirm_('Hapus Pengeluaran?','Data ini akan dihapus permanen.',()=>{expenses=expenses.filter(x=>x.id!==id);renderExpenses();toast('Pengeluaran dihapus');});}
function exCatChg(){g('ex-lain-w').style.display=g('ex-cat').value==='lain'?'block':'none';}
function exNomChg(){exSrcChg();}
function exSrcChg(){const src=g('ex-src').value,nom=parseInt(g('ex-nom').value)||0;const w=g('ex-kas-w');if(!w)return;if(src==='cash'){const oid=g('ex-outlet')?.value||kasOutlet;const fl=kasLog.filter(l=>!l.outletId||l.outletId===oid);const s=fl.filter(x=>x.type!=='out').reduce((s,x)=>s+x.amount,0)-fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);if(nom>s){w.style.display='block';w.style.background='var(--reb)';w.style.color='var(--re)';w.style.border='1px solid var(--re)';w.textContent='\u26A0\uFE0F Saldo kas tidak cukup. Saldo: '+fmt(s);}else if(nom>0){w.style.display='block';w.style.background='var(--pl)';w.style.color='#3d6b10';w.style.border='1px solid var(--p)';w.textContent='\u2713 Saldo mencukupi. Setelah: '+fmt(s-nom);}else w.style.display='none';}else w.style.display='none';}
function submitExpense(){const cat=g('ex-cat').value,nom=parseInt(g('ex-nom').value)||0,date=g('ex-date').value,src=g('ex-src').value,note=g('ex-note').value;if(!nom||nom<=0){toast('\u26A0\uFE0F Masukkan nominal yang valid');return;}if(!date){toast('\u26A0\uFE0F Pilih tanggal');return;}if(cat==='lain'&&!g('ex-lain-n').value.trim()){toast('\u26A0\uFE0F Isi nama pengeluaran');return;}const expOut=g('ex-outlet')?.value||outlets[0]?.id||'o1';if(src==='cash'){const fl=kasLog.filter(l=>!l.outletId||l.outletId===expOut);const s=fl.filter(x=>x.type!=='out').reduce((s,x)=>s+x.amount,0)-fl.filter(x=>x.type==='out').reduce((s,x)=>s+x.amount,0);if(nom>s){toast('\u26A0\uFE0F Saldo kas tidak cukup!');return;}kasLog.push({id:kasCtr++,type:'out',desc:'Pengeluaran: '+(CAT_LBL[cat]||cat),note:note||'\u2014',amount:nom,time:NOW(),outletId:expOut});}const label=cat==='lain'?g('ex-lain-n').value.trim():CAT_LBL[cat];expenses.push({id:expCtr++,cat,label,nominal:nom,date,note,src,outletId:expOut});['ex-nom','ex-note','ex-lain-n'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('ex-kas-w'))g('ex-kas-w').style.display='none';renderExpenses();renderKas();toast(src==='cash'?'\u2713 Pengeluaran dicatat \u00B7 Kas berkurang '+fmt(nom):'\u2713 Pengeluaran dicatat via Transfer');}

// ===== REPORTS =====
function setRptOutlet(id){rptOutlet=id;renderReports();}
function setRpt(f,el){rptFilter=f;document.querySelectorAll('#rpt-chips .chip').forEach(c=>c.classList.remove('on'));if(el)el.classList.add('on');const rc=g('rpt-custom');if(rc)rc.style.display=f==='custom'?'flex':'none';if(f!=='custom')renderReports();}
function filterOrdersByDate(){
  const today=TODAY_ISO,thisMonth=today.slice(0,7);
  const ld=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  let base=rptOutlet==='all'?orders:orders.filter(o=>o.outletId===rptOutlet);
  if(rptFilter==='today')return base.filter(o=>o.isoDate===today);
  if(rptFilter==='week'){const d=new Date(TODAY);d.setDate(d.getDate()-6);return base.filter(o=>o.isoDate&&o.isoDate>=ld(d));}
  if(rptFilter==='month')return base.filter(o=>o.isoDate&&o.isoDate.startsWith(thisMonth));
  if(rptFilter==='3month'){const d=new Date(TODAY);d.setMonth(d.getMonth()-3);return base.filter(o=>o.isoDate&&o.isoDate>=ld(d));}
  if(rptFilter==='year'){const d=new Date(TODAY);d.setFullYear(d.getFullYear()-1);return base.filter(o=>o.isoDate&&o.isoDate>=ld(d));}
  if(rptFilter==='custom'){const fr=g('rpt-from')?.value,to=g('rpt-to')?.value;if(!fr||!to)return base;return base.filter(o=>o.isoDate&&o.isoDate>=fr&&o.isoDate<=to);}
  return base;
}
function renderReports(){
  const rc=g('rpt-outlet-chips');if(rc)rc.innerHTML=buildOutletFilterChips(rptOutlet,'setRptOutlet');
  const filtered=filterOrdersByDate();
  const rev=filtered.filter(o=>o.payStatus==='Lunas').reduce((s,o)=>s+o.total,0);
  const fr=rptFilter==='custom'?g('rpt-from')?.value:'';const to_=rptFilter==='custom'?g('rpt-to')?.value:'';
  const ld=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
  const totalExp=filtExp.reduce((s,e)=>s+e.nominal,0);
  const profit=rev-totalExp;
  const outLbl=rptOutlet==='all'?'Semua Outlet':(outlets.find(o=>o.id===rptOutlet)?.name||'');
  const rm=g('rpt-metrics');
  if(rm)rm.innerHTML=`<div class="mc2 cp" style="grid-column:span 2"><div class="ml">\uD83D\uDCC8 Pendapatan${outLbl?' \u00B7 '+outLbl:''}</div><div class="mv">${fmt(rev)}</div><div class="ms">${filtered.length} pesanan</div></div><div class="mc2 cr"><div class="ml">\uD83D\uDCC9 Pengeluaran</div><div class="mv">${fmt(totalExp)}</div></div><div class="mc2 ${profit>=0?'cg':'cr'}"><div class="ml">\uD83D\uDCB0 Profit Bersih</div><div class="mv">${profit>=0?'+':'-'}${fmt(Math.abs(profit))}</div></div>`;
  const pm={Tunai:0,QRIS:0,Transfer:0};filtered.filter(o=>o.payStatus==='Lunas').forEach(o=>{if(pm[o.payMethod]!==undefined)pm[o.payMethod]+=o.total;});
  const rp=g('rpt-pay');if(rp)rp.innerHTML=Object.entries(pm).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1);font-size:13px"><span>${k}</span><span style="font-weight:700;color:var(--p)">${fmt(v)}</span></div>`).join('');
  const sv={...Object.fromEntries(serviceTypes.map(s=>[s.id,0])),satuan:0};filtered.forEach(o=>{if(sv[o.svcType]!==undefined)sv[o.svcType]++;});
  const rs=g('rpt-svc');if(rs)rs.innerHTML=Object.entries(sv).map(([k,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--b1);font-size:13px"><span style="text-transform:capitalize">${k}</span><div style="display:flex;align-items:center;gap:8px"><div style="width:${filtered.length?Math.max(4,v/filtered.length*80):0}px;height:8px;background:var(--pl);border-radius:4px"></div><span style="font-weight:700">${v}</span></div></div>`).join('');
  const rexp=g('rpt-exp');if(rexp)rexp.innerHTML=`<div style="background:var(--bg);border-radius:var(--r);padding:14px;margin-bottom:10px"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px"><div class="mc2 cg"><div class="ml">Pemasukan</div><div class="mv" style="font-size:16px">${fmt(rev)}</div></div><div class="mc2 cr"><div class="ml">Pengeluaran</div><div class="mv" style="font-size:16px">${fmt(totalExp)}</div></div><div class="mc2 ${profit>=0?'cp':'cr'}"><div class="ml">Profit Bersih</div><div class="mv" style="font-size:16px">${profit>=0?'+':''}${fmt(profit)}</div></div></div><div style="display:flex;height:10px;border-radius:20px;overflow:hidden;gap:2px"><div style="background:var(--p);flex:${rev||1}"></div><div style="background:var(--re);flex:${totalExp||0}"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-top:5px"><span>\uD83D\uDFE2 Pemasukan ${rev?Math.round(rev/(rev+totalExp||1)*100):0}%</span><span>\uD83D\uDD34 Pengeluaran ${totalExp?Math.round(totalExp/(rev+totalExp||1)*100):0}%</span></div></div>${filtExp.length?'<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Detail Pengeluaran</div>'+filtExp.map(e=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b1);font-size:12px"><span>${CAT_ICONS[e.cat]||'\uD83D\uDCE6'}</span><div style="flex:1"><span style="font-weight:600">${e.label}</span><span style="color:var(--t2);margin-left:6px">${e.note?'\u00B7 '+e.note:''}</span></div><span style="font-weight:700;color:var(--re)">-${fmt(e.nominal)}</span><span style="font-size:10px;color:var(--t2);margin-left:4px">${e.date.slice(5)}</span></div>`).join(''):'<div style="text-align:center;padding:16px;color:var(--t2);font-size:13px">Tidak ada pengeluaran</div>'}`;
  const rt=g('rpt-tb');if(!rt)return;
  rt.innerHTML=filtered.length?filtered.map(o=>`<tr><td style="font-size:11px;font-family:monospace;white-space:nowrap">${o.id}</td><td>${o.name}</td><td style="text-transform:capitalize;white-space:nowrap">${o.svcType}\u00B7${o.svcCat}</td><td style="font-weight:700;white-space:nowrap">${fmt(o.total)}</td><td><span class="badge ${SL_STATUS[o.status]}">${o.status}</span></td><td><span class="badge ${SL_PAY[o.payStatus]}">${o.payStatus}</span></td><td style="font-size:11px;color:var(--t2);white-space:nowrap">${o.date}</td></tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--t2)">Tidak ada data untuk periode ini</td></tr>';
}

// ===== PRINTER =====
function renderPrinters(){
  const el=g('printer-list');if(!el)return;
  if(!printers.length){el.innerHTML='<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Belum ada printer. Klik + Tambah.</div>';return;}
  el.innerHTML=printers.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px"><div style="width:40px;height:40px;border-radius:10px;background:var(--pl);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">\uD83D\uDDA8\uFE0F</div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${p.name}</div><div style="font-size:11px;color:var(--t2);margin-top:2px">${{usb:'\uD83D\uDD0C USB',bluetooth:'\uD83D\uDCF6 Bluetooth',network:'\uD83C\uDF10 LAN/WiFi'}[p.conn]} \u00B7 ${p.width}mm \u00B7 ${p.role==='receipt'?'\uD83E\uDDFE Struk':p.role==='label'?'\uD83C\uDFF7\uFE0F Label':'\u2014'}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px"><div style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:${p.status==='online'?'var(--p)':'var(--re)'};display:inline-block"></span><span style="font-size:11px;color:var(--t2)">${p.status==='online'?'Online':'Offline'}</span></div><div style="display:flex;gap:5px">${p.conn==='bluetooth'?`<button class="btn bsm" onclick="testBtPrinter('${p.id}')">Test</button>`:''}<button class="btn bre bsm" onclick="delPrinter('${p.id}')">Hapus</button></div></div></div>`).join('');
}
function openAddPrinter(){btDevice=null;['mpr-n'].forEach(id=>{const el=g(id);if(el)el.value='';});if(g('mpr-c'))g('mpr-c').value='usb';if(g('mpr-w'))g('mpr-w').value='80';if(g('mpr-ip'))g('mpr-ip').value='';if(g('mpr-ip-w'))g('mpr-ip-w').style.display='none';if(g('mpr-r'))g('mpr-r').value='none';if(g('mpr-bt-section'))g('mpr-bt-section').style.display='none';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';if(g('bt-found-wrap'))g('bt-found-wrap').style.display='none';if(g('bt-scan-status'))g('bt-scan-status').textContent='';const warn=g('bt-support-warn');if(warn)warn.style.display='none';g('m-printer').className='mbg on';}
function prConnChg(){const conn=g('mpr-c').value;if(g('mpr-ip-w'))g('mpr-ip-w').style.display=conn==='network'?'block':'none';const btSec=g('mpr-bt-section');const manSec=g('mpr-manual-section');if(conn==='bluetooth'){if(btSec)btSec.style.display='block';if(manSec)manSec.style.display='none';btDevice=null;if(g('bt-found-wrap'))g('bt-found-wrap').style.display='none';if(g('bt-scan-status'))g('bt-scan-status').textContent='';const warn=g('bt-support-warn');if(!navigator.bluetooth){if(warn){warn.style.display='block';warn.textContent='\u26A0\uFE0F Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome di Android/Desktop. iOS Safari tidak didukung.';}}else if(warn)warn.style.display='none';}else{if(btSec)btSec.style.display='none';if(manSec)manSec.style.display='block';}}
async function scanBluetooth(){const btn=g('bt-scan-btn');const status=g('bt-scan-status');if(!navigator.bluetooth){status.textContent='\u274C Browser tidak mendukung Bluetooth.';status.style.color='var(--re)';return;}btn.disabled=true;btn.textContent='\uD83D\uDD0D Mencari...';status.textContent='Membuka dialog pemilihan perangkat...';status.style.color='var(--t2)';try{const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['000018f0-0000-1000-8000-00805f9b34fb','0000ff00-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb','battery_service','generic_access']});btDevice=device;status.textContent='\u2713 Perangkat dipilih!';status.style.color='var(--p)';const fw=g('bt-found-wrap');const dn=g('bt-device-name');if(fw)fw.style.display='block';if(dn)dn.textContent=device.name||'Printer Bluetooth';if(g('mpr-n'))g('mpr-n').value=device.name||'Printer Bluetooth';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';toast('\u2713 Printer "'+(device.name||'Bluetooth')+'" ditemukan!');}catch(e){status.textContent=e.name==='NotFoundError'?'Pencarian dibatalkan.':'\u274C Gagal: '+e.message;status.style.color=e.name==='NotFoundError'?'var(--t2)':'var(--re)';}finally{btn.disabled=false;btn.textContent='\uD83D\uDD0D Cari Printer Bluetooth';}}
function selectBtDevice(){if(!btDevice)return;if(g('mpr-n'))g('mpr-n').value=btDevice.name||'Printer Bluetooth';if(g('mpr-manual-section'))g('mpr-manual-section').style.display='block';toast('\u2713 Printer dipilih: '+(btDevice.name||'BT Printer'));}
async function testBtPrinter(id){const p=printers.find(x=>x.id===id);if(!p)return;if(!navigator.bluetooth){toast('\u26A0\uFE0F Browser tidak mendukung Web Bluetooth');return;}toast('\uD83D\uDCF6 Menghubungi printer '+p.name+'...');try{const device=await navigator.bluetooth.requestDevice({filters:[{name:p.name}],optionalServices:['000018f0-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb']});const server=await device.gatt.connect();p.status='online';renderPrinters();toast('\u2713 '+p.name+' terhubung!');server.disconnect();}catch(e){p.status='offline';renderPrinters();toast('\u274C Gagal terhubung ke '+p.name);}}
function savePrinter(){const name=g('mpr-n')?.value.trim();if(!name){toast('\u26A0\uFE0F Nama printer wajib diisi');return;}const conn=g('mpr-c').value;const role=g('mpr-r').value;if(role!=='none')printers.forEach(p=>{if(p.role===role)p.role='none';});printers.push({id:'p'+printerCtr++,name,conn,ip:g('mpr-ip')?.value||'',width:g('mpr-w').value,role,status:'online',btId:btDevice?.id||null});cm('m-printer');renderPrinters();toast('\u2713 Printer "'+name+'" ditambahkan!');btDevice=null;}
function delPrinter(id){confirm_('Hapus Printer?','Printer ini akan dihapus dari daftar.',()=>{printers=printers.filter(x=>x.id!==id);renderPrinters();toast('Printer dihapus');});}

// ===== BLUETOOTH PRINT ENGINE =====
const BT_SERVICES=['000018f0-0000-1000-8000-00805f9b34fb','0000ff00-0000-1000-8000-00805f9b34fb','0000ffe0-0000-1000-8000-00805f9b34fb'];
const BT_CHARS=['00002af1-0000-1000-8000-00805f9b34fb','0000ff02-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb'];
let _btConnectedDevice=null;
function escCmd(...bytes){return new Uint8Array(bytes);}
function escText(str){return new TextEncoder().encode(str);}
function concat(...arrays){const total=arrays.reduce((s,a)=>s+a.length,0);const out=new Uint8Array(total);let offset=0;arrays.forEach(a=>{out.set(a,offset);offset+=a.length;});return out;}
function buildEscReceipt(o){
  const ESC=0x1B,GS=0x1D,LF=0x0A;
  const INIT=escCmd(ESC,0x40),ALIGN_C=escCmd(ESC,0x61,0x01),ALIGN_L=escCmd(ESC,0x61,0x00);
  const BOLD_ON=escCmd(ESC,0x45,0x01),BOLD_OFF=escCmd(ESC,0x45,0x00);
  const FONT_LARGE=escCmd(GS,0x21,0x11),FONT_NORM=escCmd(GS,0x21,0x00);
  const CUT=escCmd(GS,0x56,0x42,0x00),NL=escCmd(LF);
  const activePrinter=printers.find(p=>p.conn==='bluetooth'&&p.role==='receipt')||printers.find(p=>p.conn==='bluetooth')||null;
  const W=activePrinter?.width==='58'?32:48;
  const dash=escText('-'.repeat(W)+'\n');
  const outlet=outlets.find(x=>x.id===o.outletId);
  const pad=(l,r)=>{const gap=W-l.length-r.length;return gap>0?l+' '.repeat(gap)+r+'\n':l+'\n'+' '.repeat(W-r.length)+r+'\n';};
  const svcLines=(o.svcType==='satuan'&&o.satuanLines?.length)?o.satuanLines.map(l=>escText(pad(l.name+' x'+l.qty,'Rp '+l.lineTotal.toLocaleString('id-ID')))):[escText(pad((getSvcById(o.svcType)?.name||o.svcType)+' '+o.svcCat+' x'+o.qty+(getSvcUnit(o.svcType)||''),'Rp '+o.base.toLocaleString('id-ID')))];
  let parts=[INIT,ALIGN_C,FONT_LARGE,BOLD_ON,escText(storeName+'\n'),BOLD_OFF,FONT_NORM,escText((outlet?.name||'')+'\n'),escText((outlet?.addr||storeAddr||'')+'\n'),NL,ALIGN_L,dash,escText(pad('No Nota:',o.id)),escText(pad('Pelanggan:',o.name)),escText(pad('Kasir:',o.handledBy||'\u2014')),escText(pad('Tanggal:',o.date)),dash,...svcLines];
  o.addOns.forEach(a=>{const ad=addons.find(x=>x.id===a.id);if(ad){const v=ad.unit==='per_qty'?ad.price*o.qty:ad.price;parts.push(escText(pad(a.name,'Rp '+v.toLocaleString('id-ID'))));}});
  if(o.promoAmt>0)parts.push(escText(pad('Diskon Promo:','-Rp '+o.promoAmt.toLocaleString('id-ID'))));
  if(o.discAmt>0)parts.push(escText(pad('Diskon Manual:','-Rp '+o.discAmt.toLocaleString('id-ID'))));
  parts.push(dash,BOLD_ON,escText(pad('TOTAL:','Rp '+o.total.toLocaleString('id-ID'))),BOLD_OFF,escText(pad('Metode:',o.payMethod)),escText(pad('Status:',o.payStatus)),dash,ALIGN_C);
  if(storeFooter){storeFooter.split('\n').forEach(line=>{if(line.trim())parts.push(escText(line+'\n'));});}else{parts.push(escText('Terima kasih telah mempercayakan\n'),escText('cucian Anda kepada kami!\n'));}
  parts.push(NL,NL,NL,CUT);
  return concat(...parts);
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
  return concat(INIT,ALIGN_C,BOLD_ON,FONT_LARGE,escText(o.name+'\n'),FONT_NORM,BOLD_OFF,dash,ALIGN_L,escText('No: '+o.id+'\n'),escText('Outlet: '+(outlet?.name||'')+'\n'),escText('Layanan: '+o.svcType.toUpperCase()+' '+o.svcCat+' | '+o.qty+(getSvcUnit(o.svcType)||'')+'\n'),escText('Masuk: '+o.date+'\n'),dash,ALIGN_C,escText(storeName+'\n'),NL,NL,CUT);
}
async function getOrPickBtDevice(){
  if(_btConnectedDevice){try{if(!_btConnectedDevice.gatt.connected)await _btConnectedDevice.gatt.connect();return _btConnectedDevice;}catch(e){_btConnectedDevice=null;}}
  const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:BT_SERVICES});
  _btConnectedDevice=device;
  device.addEventListener('gattserverdisconnected',()=>{_btConnectedDevice=null;});
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
    const CHUNK=512;const useWithout=characteristic.properties.writeWithoutResponse;
    for(let i=0;i<data.length;i+=CHUNK){const chunk=data.slice(i,i+CHUNK);if(useWithout)await characteristic.writeValueWithoutResponse(chunk);else await characteristic.writeValue(chunk);await new Promise(r=>setTimeout(r,30));}
    toast('\u2705 Berhasil dicetak!');return true;
  }catch(e){
    if(e.name==='NotFoundError'||e.name==='NotAllowedError'){toast('\u26A0\uFE0F Pemilihan printer dibatalkan.');_btConnectedDevice=null;}
    else if(e.name==='NetworkError'){toast('\u274C Printer terputus. Coba cetak lagi.');_btConnectedDevice=null;}
    else{toast('\u274C Gagal cetak: '+e.message);_btConnectedDevice=null;}
    return false;
  }
}
async function printCurrentReceipt(){const o=orders.find(x=>x.id===curRcptOrderId);if(!o){toast('\u26A0\uFE0F Data pesanan tidak ditemukan.');return;}await sendToBtPrinter(buildEscReceipt(o));}
async function printCurrentLabel(){const o=orders.find(x=>x.id===curRcptOrderId);if(!o){toast('\u26A0\uFE0F Data pesanan tidak ditemukan.');return;}await sendToBtPrinter(buildEscLabel(o));}

// ===== SETTINGS =====
function changePwd(){const cur=g('s-cur').value,nw=g('s-new').value,cfm=g('s-cfm').value;const msg=g('s-pwd-msg');if(cur!==ownerPwd){msg.style.color='var(--re)';msg.textContent='Password saat ini salah.';return;}if(nw.length<4){msg.style.color='var(--re)';msg.textContent='Password baru minimal 4 karakter.';return;}if(nw!==cfm){msg.style.color='var(--re)';msg.textContent='Konfirmasi password tidak cocok.';return;}ownerPwd=nw;['s-cur','s-new','s-cfm'].forEach(id=>{g(id).value='';});msg.style.color='var(--p)';msg.textContent='\u2713 Password berhasil diubah!';setTimeout(()=>{msg.textContent='';},3000);toast('\u2713 Password owner berhasil diubah!');}

// ===== EXCEL EXPORT (SheetJS) =====
function makeSheet(title,infoLine,headers,rows,totalsRow,colWidths){
  const aoa=[];aoa.push([title]);if(infoLine)aoa.push([infoLine]);aoa.push([]);aoa.push(headers);rows.forEach(r=>aoa.push(r));if(totalsRow)aoa.push(totalsRow);
  const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=colWidths.map(w=>({wch:w}));
  const merges=[{s:{r:0,c:0},e:{r:0,c:headers.length-1}}];if(infoLine)merges.push({s:{r:1,c:0},e:{r:1,c:headers.length-1}});ws['!merges']=merges;
  ws['!rows']=[{hpt:18},{hpt:14}];return ws;
}
function exportCustomers(){
  if(typeof XLSX==='undefined'){toast('\u26A0\uFE0F Library belum siap, coba lagi');return;}
  const wb=XLSX.utils.book_new();const cl=Object.values(customers);
  const info='Tanggal Export: '+TODAY_STR+'  |  Total Pelanggan: '+cl.length+' orang';
  const headers=['No','Nama Pelanggan','No. WhatsApp','Total Pesanan','Total Transaksi (Rp)','Order Terakhir'];
  const rows=cl.map((cu,i)=>[i+1,cu.name,cu.phone,cu.orders,cu.total,cu.lastDate]);
  const tots=['','JUMLAH','',cl.reduce((s,cu)=>s+cu.orders,0),cl.reduce((s,cu)=>s+cu.total,0),''];
  const ws=makeSheet('DATA PELANGGAN \u2014 CleanPOS Laundry',info,headers,rows,tots,[5,26,18,14,22,16]);
  XLSX.utils.book_append_sheet(wb,ws,'Pelanggan');XLSX.writeFile(wb,'CleanPOS_Pelanggan_'+TODAY_ISO+'.xlsx');
  toast('\u2713 Export Excel pelanggan berhasil!');
}
function exportReport(){
  if(typeof XLSX==='undefined'){toast('\u26A0\uFE0F Library belum siap, coba lagi');return;}
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
}

// ===== SUPABASE SYNC PATCHES =====
// Hook all data-mutating functions to also sync to Supabase.
// Placed at end of file so all original functions are already defined.

// submitO: build order + sync to cloud
submitO = function(role) {
  const pre = role === 'o' ? 'no' : 'sno';
  const o = buildOrder(pre); if (!o) return;
  syncOrder(o);
  syncCustomer(customers[o.phone] || { name: o.name, phone: o.phone, orders: 1, total: o.total, lastDate: o.date });
  showRcpt(o.id); curWaNewOrder = o;
  setTimeout(() => { setWaNewType('konfirmasi', g('wa-new-chips').querySelector('.chip')); g('m-wa-new').className = 'mbg on'; }, 600);
  if (role === 'o') refreshODash(); else refreshSDash();
};

// Status & pay updates
const _origSetStModal = setStModal;
setStModal = function(id, st, btn) { _origSetStModal(id, st, btn); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };
const _origSetPayModal = setPayModal;
setPayModal = function(id, ps, btn) { _origSetPayModal(id, ps, btn); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };
const _origUpdSt = updSt;
updSt = function(id, st, role) { _origUpdSt(id, st, role); const o = orders.find(x => x.id === id); if (o) syncOrder(o); };

// Outlets
const _origSaveOutlet = saveOutlet;
saveOutlet = function() { _origSaveOutlet(); outlets.forEach(o => syncOutlet(o)); };
const _origDelOutlet = delOutlet;
delOutlet = function(id) { deleteOutlet(id); _origDelOutlet(id); };

// Employees
const _origSaveEmp = saveEmp;
saveEmp = function() { _origSaveEmp(); employees.forEach(e => syncEmployee(e)); };
const _origDelEmp = delEmp;
delEmp = function(id) { deleteEmployee(id); _origDelEmp(id); };
const _origEmpAct = empAct;
empAct = function(id, act) { _origEmpAct(id, act); const e = employees.find(x => x.id === id); if (e) syncEmployee(e); };

// Kas
const _origSubmitKas = submitKas;
submitKas = function() { _origSubmitKas(); kasLog.slice(-1).forEach(l => syncKas(l)); };

// Expenses
const _origSubmitExpense = submitExpense;
submitExpense = function() { _origSubmitExpense(); expenses.slice(-1).forEach(e => syncExpense(e)); };

// Printers
const _origSavePrinter = savePrinter;
savePrinter = function() { _origSavePrinter(); printers.slice(-1).forEach(p => syncPrinter(p)); };
const _origDelPrinter = delPrinter;
delPrinter = function(id) { deletePrinter_sb(id); _origDelPrinter(id); };

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
  g('m-new-account-pwd').className = 'mbg on';
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
            if (ownerPwd === 'owner123') showScr('scr-setup');
            else showScr('scr-login');
          });
        } else if (event === 'INITIAL_SESSION') {
          showReturningUser(user.email);
          supaLoadAll().then(() => {
            if (ownerPwd === 'owner123') showScr('scr-setup');
          });
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
