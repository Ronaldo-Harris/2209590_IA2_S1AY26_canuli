
/* Ronaldo Harris - 2209590
 - DOM, events, localStorage, functions, validation, navigation/state
*/
/*Array to store all shoes being sold and their details*/
const PRODUCTS = [
  {id:1,title:'Nike Nebula Ridge',price:89.99, genre:'Football', desc:'Durable boot for firm ground. Excellent traction and comfort.', img:'boot1.png'},
  {id:2,title:'Puma Circuit Strike',price:79.99, genre:'Football', desc:'High-performance boot with aggressive grip for soft pitches.', img:'boot2.avif'},
  {id:3,title:'SUDO Ether',price:49.99, genre:'Football', desc:'A playmakers dream. Traction below laces for the perfect firs touch.', img:'boot3.webp'},
  {id:4,title:'Addidas Pixel',price:99.99, genre:'Football', desc:'', img:'boot4.jpeg'},
  {id:5,title:'Nike Predator',price:76.99, genre:'Football', desc:'Discover the difference between aiming to score and knowing you will with nike Predator boots that are crafted for goals.', img:'boot5.webp'},
  {id:6,title:'Puma Galactic',price:90.99, genre:'Football', desc:'Find your fast to truly express yourself on the field. Feel the rush in puma Galactic boots engineered for speed.', img:'boot6.webp'}
];
/*Functions used to save and load data in local storage. Allows cart to stay saved even after resfreshing website */
function $(s, root=document) { return root.querySelector(s); }
function $all(s, root=document){ return Array.from(root.querySelectorAll(s)); }
function getCart(){ return JSON.parse(localStorage.getItem('vg_cart') || '[]'); }/*Returns current shopping cart from local storage, if cart is empty, returns empty array*/
function saveCart(cart){ localStorage.setItem('vg_cart', JSON.stringify(cart)); renderCartCount(); }
function addToCart(productId, qty=1){
  let cart = getCart();
  const p = PRODUCTS.find(x=>x.id===productId);
  const existing = cart.find(i=>i.id===productId);
  if(existing){ existing.qty += qty; } else { cart.push({id:productId, title:p.title, price:p.price, qty:qty}); }
  saveCart(cart);
  alert(`${p.title} added to cart`);
}

function removeFromCart(productId){ let cart = getCart(); cart = cart.filter(i=>i.id!==productId); saveCart(cart); }
function updateQty(productId, qty){
  let cart = getCart();
  const item = cart.find(i=>i.id===productId);
  if(!item) return;
  item.qty = qty;
  if(item.qty<=0) removeFromCart(productId);
  saveCart(cart);
}
function computeTotals(cart){
  let subtotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const discount = subtotal >= 100 ? subtotal * 0.05 : 0;
  const tax = subtotal * 0.07;
  const total = subtotal - discount + tax;
  return {subtotal,discount,tax,total};
}
function renderProductGrid(containerSelector='.grid'){
  const container = $(containerSelector);
  if(!container) return;
  container.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title} cover">
      <h3>${p.title}</h3>
      <p>${p.genre} · $${p.price.toFixed(2)}</p>
      <div style="margin-top:auto;display:flex;gap:.5rem;justify-content:space-between;align-items:center">
        <button class="btn add-btn" data-id="${p.id}">Add to Cart</button>
        <button class="btn secondary view-btn" data-id="${p.id}">View</button>
      </div>`;
    container.appendChild(el);
  });
  $all('.add-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id,1);
    });
  });
  // view buttons
  $all('.view-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = Number(e.currentTarget.dataset.id);
      const p = PRODUCTS.find(x=>x.id===id);
      openModal(p);
    });
  });
}
function renderCartPage(){
  const cart = getCart();
  const tbody = $('#cart-items');
  const totalsEl = $('#cart-totals');
  if(!tbody) return;
  tbody.innerHTML = '';
  cart.forEach(item=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input class="qty-input" data-id="${item.id}" type="number" min="1" value="${item.qty}" style="width:60px"></td>
      <td>$${(item.price*item.qty).toFixed(2)}</td>
      <td><button class="btn secondary remove" data-id="${item.id}">Remove</button></td>`;
    tbody.appendChild(tr);
  });
  $all('.remove').forEach(b=> b.addEventListener('click', e=>{ removeFromCart(Number(e.currentTarget.dataset.id)); renderCartPage(); }));
  $all('.qty-input').forEach(inp=> inp.addEventListener('change', e=>{ updateQty(Number(e.currentTarget.dataset.id), Number(e.currentTarget.value)); renderCartPage(); }));
  const totals = computeTotals(cart);
  totalsEl.innerHTML = `
    <p>Subtotal: $${totals.subtotal.toFixed(2)}</p>
    <p>Discount: $${totals.discount.toFixed(2)}</p>
    <p>Tax (7%): $${totals.tax.toFixed(2)}</p>
    <h3>Total: $${totals.total.toFixed(2)}</h3>
    <div style="display:flex;gap:.5rem;margin-top:.5rem">
      <button id="clear-cart" class="btn secondary">Clear All</button>
      <button id="checkout" class="btn">Checkout</button>
    </div>`;
  $('#clear-cart')?.addEventListener('click', ()=>{ saveCart([]); renderCartPage(); });
  $('#checkout')?.addEventListener('click', ()=>{ if(window.location.pathname.includes('checkout.html')) { } else { window.location.href = 'checkout.html'; } });
}
function checkoutInit(){
  const form = $('#checkout-form');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = form.querySelector('[name="fullname"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    if(!name){ alert('Full name is required'); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Enter a valid email'); return; }
    const cart = getCart();
    if(cart.length===0){ alert('Cart is empty'); return; }
    const totals = computeTotals(cart);
    const order = { id: 'ORD' + Date.now(), date: new Date().toISOString(), name, email, items: cart, totals };
    localStorage.setItem('last_order', JSON.stringify(order));
    saveCart([]);
    window.location.href = 'receipt.html';
  });
}
function renderReceipt(){
  const raw = localStorage.getItem('last_order');
  if(!raw) { document.body.innerHTML = '<div class="container"><h2>No recent order found</h2></div>'; return; }
  const order = JSON.parse(raw);
  const el = $('#receipt');
  if(!el) return;
  el.innerHTML = `
    <h2>Receipt - ${order.id}</h2>
    <p><strong>Name:</strong> ${order.name} · <strong>Email:</strong> ${order.email}</p>
    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
    <table class="table" style="margin-top:.5rem">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Sub</th></tr></thead>
      <tbody>${ order.items.map(i=>`<tr><td>${i.title}</td><td>${i.qty}</td><td>$${i.price.toFixed(2)}</td><td>$${(i.price*i.qty).toFixed(2)}</td></tr>`).join('') }</tbody>
    </table>
    <div style="margin-top:.75rem">
      <p>Subtotal: $${order.totals.subtotal.toFixed(2)}</p>
      <p>Discount: $${order.totals.discount.toFixed(2)}</p>
      <p>Tax: $${order.totals.tax.toFixed(2)}</p>
      <h3>Total Paid: $${order.totals.total.toFixed(2)}</h3>
    </div>
    <div style="margin-top:1rem">
      <button id="print" class="btn">Print Receipt</button>
      <button id="done" class="btn secondary">Done</button>
    </div>`;
  document.getElementById('print')?.addEventListener('click', ()=>window.print());
  document.getElementById('done')?.addEventListener('click', ()=>window.location.href='index.html');
}
function renderCartCount(){ const cart = getCart(); const el = $('#cart-count'); if(el) el.textContent = cart.reduce((s,i)=>s+i.qty,0) || 0; }
document.addEventListener('DOMContentLoaded', ()=>{
  renderCartCount();
  renderProductGrid('.grid');
  if(document.getElementById('cart-items')) renderCartPage();
  if(document.getElementById('checkout-form')) checkoutInit();
  if(document.getElementById('receipt')) renderReceipt();
});


/* ===== Product View Modal ===== */
function openModal(product){
  const m = document.getElementById('product-modal');
  const b = document.getElementById('modal-body');
  if(!m || !b) return;
  b.innerHTML = `
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-start">
      <img src="${product.img}" alt="${product.title} cover" style="width:320px;max-width:100%;border-radius:10px"/>
      <div style="min-width:260px">
        <h2 style="margin:.2rem 0">${product.title}</h2>
        <p style="color:var(--muted);margin:.2rem 0">${product.genre} &middot; $${product.price.toFixed(2)}</p>
        <p style="margin-top:.5rem">${product.desc}</p>
        <div style="display:flex;gap:.5rem;margin-top:.75rem">
          <button class="btn" id="modal-add">Add to Cart</button>
          <button class="btn secondary" id="modal-close-2">Close</button>
        </div>
      </div>
    </div>`;
  m.style.display = 'block';
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-close-2')?.addEventListener('click', closeModal);
  document.getElementById('modal-add')?.addEventListener('click', ()=>{
    addToCart(product.id,1);
    closeModal();
  });
  // close on backdrop click
  m.addEventListener('click', (e)=>{ if(e.target === m) closeModal(); }, { once:true });
}
function closeModal(){
  const m = document.getElementById('product-modal');
  if(m) m.style.display = 'none';
}
