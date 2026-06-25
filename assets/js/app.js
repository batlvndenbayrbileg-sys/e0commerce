/* =========================================================
   NITEC — App interactions
   ========================================================= */

/* ---------- Product catalog ---------- */
const PRODUCTS = [
  { id: "p1", name: "Sequoia Pro",      cat: "Over-ear",   price: 349, was: 399, badge: "Sale",   colors:["blue","black","red"], svg: headphone("#2E5BFF") },
  { id: "p2", name: "Sequoia Lite",     cat: "Over-ear",   price: 229,             badge: null,    colors:["black","green"],      svg: headphone("#1A1A1F") },
  { id: "p3", name: "X-Bud Mini",       cat: "Earbuds",    price: 149, was: 179, badge: "New",   colors:["white","black"],      svg: earbuds("#F4F4EE") },
  { id: "p4", name: "X-Bud Studio",     cat: "Earbuds",    price: 219,             badge: null,    colors:["black"],              svg: earbuds("#1A1A1F") },
  { id: "p5", name: "Lumen Speaker",    cat: "Speaker",    price: 189,             badge: null,    colors:["lime","black"],       svg: speaker("#D7F26B") },
  { id: "p6", name: "Bloc Bookshelf",   cat: "Speaker",    price: 459, was: 499, badge: "Sale",  colors:["walnut","black"],     svg: speaker("#9B6B3B") },
  { id: "p7", name: "Vista MR Headset", cat: "Mixed Reality", price: 1299,         badge: "New",   colors:["light","dark"],       svg: vrset("#E8E8E0") },
  { id: "p8", name: "Vista Lite",       cat: "Mixed Reality", price: 899,           badge: null,   colors:["dark"],               svg: vrset("#2C2D33") },
  { id: "p9", name: "Tono Turntable",   cat: "Accessory",  price: 499,              badge: null,   colors:["black","cream"],      svg: turntable() },
];

function headphone(color){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g${color.replace('#','')}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${darken(color)}"/></linearGradient></defs>
    <path d="M40 110 C40 40 160 40 160 110" stroke="url(#g${color.replace('#','')})" stroke-width="14" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="125" rx="28" ry="38" fill="url(#g${color.replace('#','')})"/>
    <ellipse cx="158" cy="125" rx="28" ry="38" fill="url(#g${color.replace('#','')})"/>
    <ellipse cx="42" cy="125" rx="18" ry="26" fill="rgba(0,0,0,.35)"/>
    <ellipse cx="158" cy="125" rx="18" ry="26" fill="rgba(0,0,0,.35)"/>
  </svg>`;
}
function earbuds(color){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="70" width="120" height="80" rx="22" fill="${color}" stroke="rgba(0,0,0,.08)"/>
    <ellipse cx="78" cy="110" rx="14" ry="22" fill="${invertCol(color)}"/>
    <ellipse cx="122" cy="110" rx="14" ry="22" fill="${invertCol(color)}"/>
  </svg>`;
}
function speaker(color){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="62" y="30" width="76" height="140" rx="18" fill="${color}"/>
    <circle cx="100" cy="70" r="16" fill="#0A0A0B"/>
    <circle cx="100" cy="125" r="26" fill="#0A0A0B"/>
    <circle cx="100" cy="125" r="14" fill="#222"/>
  </svg>`;
}
function vrset(color){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="105" rx="90" ry="50" fill="${color}"/>
    <rect x="40" y="86" width="120" height="44" rx="16" fill="#1A1A1F"/>
    <ellipse cx="75" cy="108" rx="12" ry="8" fill="#2E5BFF" opacity=".7"/>
    <ellipse cx="125" cy="108" rx="12" ry="8" fill="#2E5BFF" opacity=".7"/>
  </svg>`;
}
function turntable(){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="60" width="160" height="100" rx="10" fill="#1A1A1F"/>
    <circle cx="100" cy="110" r="44" fill="#0A0A0B"/>
    <circle cx="100" cy="110" r="10" fill="#D7F26B"/>
    <rect x="140" y="68" width="6" height="60" rx="3" fill="#aaa"/>
  </svg>`;
}
function darken(hex){
  if(!hex.startsWith('#')) return hex;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  const f=v=>Math.max(0,Math.floor(v*.6)).toString(16).padStart(2,'0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
function invertCol(c){ return c.toLowerCase()==='#1a1a1f' ? '#fff' : '#1A1A1F'; }

/* ---------- State ---------- */
const Cart = {
  items: JSON.parse(localStorage.getItem('nitec.cart') || '[]'),
  save(){ localStorage.setItem('nitec.cart', JSON.stringify(this.items)); this.updateBadge(); },
  add(id, qty=1){
    const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
    const found = this.items.find(x=>x.id===id);
    if(found) found.qty += qty; else this.items.push({ id, qty, name:p.name, price:p.price, cat:p.cat });
    this.save();
    showToast(`${p.name} added to cart`);
  },
  remove(id){ this.items = this.items.filter(x=>x.id!==id); this.save(); },
  setQty(id, qty){ const it = this.items.find(x=>x.id===id); if(it){ it.qty = Math.max(1, qty); this.save(); } },
  count(){ return this.items.reduce((a,b)=>a+b.qty,0); },
  subtotal(){ return this.items.reduce((a,b)=>a+b.price*b.qty,0); },
  updateBadge(){
    const dots = document.querySelectorAll('.icon-btn .dot');
    dots.forEach(d => d.style.display = this.count()>0 ? 'block' : 'none');
  }
};

const Wishlist = {
  ids: new Set(JSON.parse(localStorage.getItem('nitec.wish') || '[]')),
  toggle(id){
    if(this.ids.has(id)) this.ids.delete(id); else this.ids.add(id);
    localStorage.setItem('nitec.wish', JSON.stringify([...this.ids]));
  }
};

/* ---------- Helpers ---------- */
function money(n){ return `$${n.toFixed(0)}`; }
function el(html){ const t=document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

function productCard(p){
  const wished = Wishlist.ids.has(p.id) ? 'on' : '';
  return `<a class="product-card" href="product.html?id=${p.id}">
    ${p.badge ? `<span class="badge ${p.badge==='New'?'new':''}">${p.badge}</span>` : ''}
    <button class="wish ${wished}" data-wish="${p.id}" aria-label="Wishlist">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${wished?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
    </button>
    <div class="imgbox">${p.svg}</div>
    <div class="info">
      <div>
        <div class="name">${p.name}</div>
        <div class="cat">${p.cat}</div>
      </div>
      <div class="price">${p.was?`<span class="old">${money(p.was)}</span>`:''}${money(p.price)}</div>
    </div>
    <div class="quick" data-add="${p.id}">+ Quick add</div>
  </a>`;
}

function renderProducts(target, list){
  const c = document.querySelector(target); if(!c) return;
  c.innerHTML = list.map(productCard).join('');
}

/* ---------- Toast ---------- */
function showToast(msg){
  const t = document.getElementById('toast'); if(!t) return;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Reveal on scroll ---------- */
function setupReveal(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, { threshold: .12 });
  els.forEach(e=>io.observe(e));
}

/* ---------- Global click delegation ---------- */
document.addEventListener('click', (e)=>{
  const wish = e.target.closest('[data-wish]');
  if(wish){ e.preventDefault(); Wishlist.toggle(wish.dataset.wish); wish.classList.toggle('on'); return; }
  const add = e.target.closest('[data-add]');
  if(add){ e.preventDefault(); Cart.add(add.dataset.add); return; }
});

/* ---------- Search (⌘K) ---------- */
document.addEventListener('keydown', (e)=>{
  if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    const s = document.querySelector('.nav-search input'); if(s) s.focus();
  }
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  Cart.updateBadge();
  renderProducts('#best-sellers', PRODUCTS.slice(0,6));
  renderProducts('#shop-grid', PRODUCTS);
  renderProducts('#related', PRODUCTS.filter(p=>p.id!=='p1').slice(0,3));
  setupReveal();

  /* swatches active */
  document.querySelectorAll('.swatches').forEach(group=>{
    group.addEventListener('click', e=>{
      const b = e.target.closest('.swatch-dot'); if(!b) return;
      group.querySelectorAll('.swatch-dot').forEach(s=>s.classList.remove('active'));
      b.classList.add('active');
    });
  });

  /* PDP option groups */
  document.querySelectorAll('.opt-group .options').forEach(g=>{
    g.addEventListener('click', e=>{
      const o = e.target.closest('.opt'); if(!o) return;
      g.querySelectorAll('.opt').forEach(x=>x.classList.remove('active'));
      o.classList.add('active');
    });
  });

  /* PDP qty */
  document.querySelectorAll('.qty').forEach(q=>{
    const val = q.querySelector('.val');
    q.addEventListener('click', e=>{
      const dec = e.target.closest('[data-q="-"]');
      const inc = e.target.closest('[data-q="+"]');
      let n = parseInt(val.textContent,10);
      if(dec) n = Math.max(1,n-1);
      if(inc) n = n+1;
      val.textContent = n;
    });
  });

  /* Tabs */
  document.querySelectorAll('.tabs').forEach(tabs=>{
    tabs.addEventListener('click', e=>{
      const t = e.target.closest('.tab'); if(!t) return;
      tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      const panel = t.dataset.panel;
      document.querySelectorAll('[data-tab-panel]').forEach(p=>{
        p.style.display = p.dataset.tabPanel === panel ? '' : 'none';
      });
    });
  });

  /* PDP add to cart */
  const pdpAdd = document.getElementById('pdp-add');
  if(pdpAdd){
    pdpAdd.addEventListener('click', ()=>{
      const id = pdpAdd.dataset.id;
      const qty = parseInt(document.querySelector('.qty .val').textContent,10);
      Cart.add(id, qty);
    });
  }

  /* Cart render */
  renderCart();
  renderCheckoutSummary();

  /* Auth tabs */
  document.querySelectorAll('[data-auth-tab]').forEach(t=>{
    t.addEventListener('click', ()=>{
      document.querySelectorAll('[data-auth-tab]').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      const mode = t.dataset.authTab;
      document.querySelectorAll('[data-auth-form]').forEach(f=>{
        f.style.display = f.dataset.authForm === mode ? '' : 'none';
      });
    });
  });
});

/* ---------- Cart page ---------- */
function renderCart(){
  const list = document.getElementById('cart-list'); if(!list) return;
  if(Cart.items.length === 0){
    list.innerHTML = `<div style="padding:60px 24px;text-align:center;color:var(--text-secondary)">
      <h3 class="h3" style="color:var(--text-primary);margin-bottom:8px">Your cart is empty</h3>
      <p>Looks quiet in here — let's find you something.</p>
      <a href="shop.html" class="btn btn-dark" style="margin-top:18px">Browse shop <span class="arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
    </div>`;
  } else {
    list.innerHTML = Cart.items.map(it=>{
      const p = PRODUCTS.find(x=>x.id===it.id);
      return `<div class="cart-row" data-row="${it.id}">
        <div class="ci">${p ? p.svg : ''}</div>
        <div class="info-col">
          <div style="font-weight:600">${it.name}</div>
          <div class="tiny">${it.cat}</div>
        </div>
        <div class="qty">
          <button data-cart-dec="${it.id}" aria-label="Decrease">−</button>
          <span class="val">${it.qty}</span>
          <button data-cart-inc="${it.id}" aria-label="Increase">+</button>
        </div>
        <div class="price-col" style="font-weight:600">${money(it.price*it.qty)}</div>
        <button class="icon-btn del" data-cart-del="${it.id}" aria-label="Remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>`;
    }).join('');
  }
  renderCartSummary();
}
function renderCartSummary(){
  const sum = document.getElementById('cart-summary'); if(!sum) return;
  const subtotal = Cart.subtotal();
  const ship = subtotal>0 ? (subtotal>300 ? 0 : 12) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + ship + tax;
  sum.querySelector('[data-sub]').textContent = money(subtotal);
  sum.querySelector('[data-ship]').textContent = ship===0?'Free':money(ship);
  sum.querySelector('[data-tax]').textContent = money(tax);
  sum.querySelector('[data-total]').textContent = money(total);
}
document.addEventListener('click', e=>{
  const inc = e.target.closest('[data-cart-inc]');
  const dec = e.target.closest('[data-cart-dec]');
  const del = e.target.closest('[data-cart-del]');
  if(inc){ const it = Cart.items.find(x=>x.id===inc.dataset.cartInc); Cart.setQty(it.id, it.qty+1); renderCart(); }
  if(dec){ const it = Cart.items.find(x=>x.id===dec.dataset.cartDec); Cart.setQty(it.id, it.qty-1); renderCart(); }
  if(del){ Cart.remove(del.dataset.cartDel); renderCart(); }
});

/* ---------- Checkout ---------- */
function renderCheckoutSummary(){
  const sum = document.getElementById('check-summary'); if(!sum) return;
  const list = sum.querySelector('[data-items]');
  list.innerHTML = Cart.items.map(it=>`
    <div class="sum-row">
      <span>${it.name} × ${it.qty}</span>
      <span>${money(it.price*it.qty)}</span>
    </div>`).join('');
  const subtotal = Cart.subtotal();
  const ship = subtotal>300 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + ship + tax;
  sum.querySelector('[data-sub]').textContent = money(subtotal);
  sum.querySelector('[data-ship]').textContent = ship===0?'Free':money(ship);
  sum.querySelector('[data-tax]').textContent = money(tax);
  sum.querySelector('[data-total]').textContent = money(total);
}

/* ---------- PDP from query ---------- */
function loadPDP(){
  const id = new URLSearchParams(location.search).get('id') || 'p1';
  const p = PRODUCTS.find(x=>x.id===id) || PRODUCTS[0];
  const el = document.getElementById('pdp');
  if(!el) return;
  el.querySelector('[data-pdp-name]').textContent = p.name;
  el.querySelector('[data-pdp-cat]').textContent = p.cat;
  el.querySelector('[data-pdp-price]').textContent = money(p.price);
  const was = el.querySelector('[data-pdp-was]');
  was.textContent = p.was ? money(p.was) : '';
  was.style.display = p.was ? '' : 'none';
  el.querySelector('[data-pdp-img]').innerHTML = p.svg;
  el.querySelectorAll('[data-pdp-thumb]').forEach(t => t.innerHTML = p.svg);
  document.getElementById('pdp-add').dataset.id = p.id;
  document.title = `${p.name} — Nitec`;
}
document.addEventListener('DOMContentLoaded', loadPDP);
