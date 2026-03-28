/* script.js 

/* The tax rate */
const TAX_RATE = 0.15;

function money(value){
  return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(value);
}

/* The Products */ 

const PRODUCTS = [
  { id: 'p1', title: 'Premium Dog Food', price: 3500, img: 'dogfood.png'},
  { id: 'p2', title: 'Organic Cat Food', price: 2500, img: 'catfood.png' },
  { id: 'p3', title: 'Bird Cage', price: 7210, img: 'birdCage.jpg' },
  { id: 'p4', title: 'Fish Food', price: 1602, img: 'fishfood.jpg' },
  { id: 'p5', title: 'Durable Dog Leash', price: 2500, img: 'dogleash.jpg' },
  { id: 'p6', title: 'Pet Toys', price: 1015, img: 'petToys.jpg' },
  { id: 'p7', title: 'Aquarium Starter Kit', price: 10995, img: 'aquarium.jpg' },
  { id: 'p8', title: 'Pet Bed', price: 3000, img: 'petbed.jpg' },
  { id: 'p9', title: 'Grooming Kit', price: 4987, img: 'groomingKit.jpg' },
  { id: 'p10', title: 'Collar with Name Tag', price: 1200, img: 'collar.jpeg' },
  { id: 'p11', title: 'Pet Carrier', price: 8000, img: 'petCarrier.jpg' },
  { id: 'p12', title: 'Hamster Cage', price: 1800, img: 'hamstercage.jpg' },
  { id: 'p13', title: 'Reptile Heat Lamp', price: 3503, img: 'heatlamp.jpg' },
  { id: 'p14', title: 'Pet Vitamins', price: 900, img: 'petvitamins.png' },
  { id: 'p15', title: 'Cozy Cat Bed', price: 5500, img: 'catBed.jpg' },
  { id: 'p16', title: 'Durable Dog Leash and Collar Set', price: 4000, img: 'collarSet.jpg' },
  { id: 'p17', title: 'Pet First Aid Kit', price: 3000, img: 'firstAid.jpg'},
  { id: 'p18', title: 'Rabbit Food', price: 2300, img: 'rabbitfood.png'},
  { id: 'p19', title: 'Fish Tank and Decorations', price: 15000, img: 'fishtankDecorations.jpg'},
];

/* Cart information is saved in (sessionStorage) */
function getCart(){
  return JSON.parse(sessionStorage.getItem('cart') || '{}');
}
function saveCart(cart){
  sessionStorage.setItem('cart', JSON.stringify(cart));
}
function addToCart(productId){
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
  alert('Added to cart');
  renderCartMini();
}

/* User information */
function getUsers(){
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users){
  localStorage.setItem('users', JSON.stringify(users));
}

// products grid render for index.html

function renderProducts(){
  const grid = document.querySelector('.products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" class="product-img">
      <h3>${p.title}</h3>
      <p class="small text-muted">In stock</p>
      <p class="price">${money(p.price)}</p>
      <button data-id="${p.id}" class="addBtn">Add to cart</button>
    `;
    grid.appendChild(card);
  });

    // add to cart buttons
  document.querySelectorAll('.addBtn').forEach(b => {
    b.addEventListener('click', () => addToCart(b.dataset.id));
  });
}

// mini cart render for nav

function renderCartMini(){
  const el = document.getElementById('cartCount');
  if(!el) return;
  const cart = getCart();
  const qty = Object.values(cart).reduce((s,v) => s + v, 0);
  el.textContent = qty;
}

/* page: cart.html */

function renderCartPage(){
  const tbody = document.getElementById('cartItems');
  if(!tbody) return;
  const cart = getCart();
  tbody.innerHTML = '';
  let subtotal = 0;

  if(Object.keys(cart).length === 0){
    tbody.innerHTML = `<tr><td colspan="4" class="text-center small">Your cart is empty</td></tr>`;
  } else {
    for(const [id, qty] of Object.entries(cart)){
      const prod = PRODUCTS.find(p => p.id === id) || { title: 'Item', price:0};
      const lineTotal = prod.price * qty;
      subtotal += lineTotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${prod.title}</td>
        <td>${money(prod.price)}</td>
        <td>
          <button class="qtyBtn" data-id="${id}" data-op="-">-</button>
          <span style="margin:0 .6rem">${qty}</span>
          <button class="qtyBtn" data-id="${id}" data-op="+">+</button>
        </td>
        <td>${money(lineTotal)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  const discount = 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal - discount + tax;

  document.getElementById('discount').textContent = money(discount);
  document.getElementById('tax').textContent = money(tax);
  document.getElementById('total').textContent = money(total);

    // quantity buttons
  document.querySelectorAll('.qtyBtn').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const op = b.dataset.op;
      const cart = getCart();
      if(op === '+') cart[id] = (cart[id] || 0) + 1;
      else {
        cart[id] = (cart[id] || 0) - 1;
        if(cart[id] <= 0) delete cart[id];
      }
      saveCart(cart);
      renderCartPage();
      renderCartMini();
    });
  });

  // clear button
  const clear = document.getElementById('clearCart');
  if(clear){
    clear.onclick = () => {
      if(confirm('Clear all items from cart?')){
        localStorage.removeItem('cart');
        renderCartPage();
        renderCartMini();
      }
    };
  }
}

/* page: checkout.html */

function renderCheckoutPage(){
  const sumItems = document.getElementById('sumItems');
  const sumDiscount = document.getElementById('sumDiscount');
  const sumTax = document.getElementById('sumTax');
  const sumTotal = document.getElementById('sumTotal');

  if(!sumItems) return;
  const cart = getCart();
  let subtotal = 0;
  for(const [id, qty] of Object.entries(cart)){
    const prod = PRODUCTS.find(p => p.id === id) || { price:0 };
    subtotal += prod.price * qty;
  }
  const discount = 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal - discount + tax;

  sumItems.textContent = money(subtotal);
  sumDiscount.textContent = money(discount);
  sumTax.textContent = money(tax);
  sumTotal.textContent = money(total);

  const form = document.getElementById('checkoutForm');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Order placed! Thank you for shopping with PetPaws.');
      localStorage.removeItem('cart');
      renderCartMini();
      window.location.href = 'index.html';
    });
  }
}

/* login.html page */

function setupLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', (e)=> {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if(found){
      localStorage.setItem('currentUser', JSON.stringify({ username }));
      alert('Welcome back, ' + username + '!');
      window.location.href = 'index.html';
    } else {
      alert('Incorrect username or password. If you do not have an account, please register.');
    }
  });
}

// register.html

function setupRegister(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;

    if(!username || !password){ alert('Please enter username and password'); return; }

    const users = getUsers();
    if(users.some(u => u.username === username)){
      if(confirm('An account with that username already exists. Would you like to go to Login?')){
        window.location.href = 'login.html';
        return;
      } else return;
    }

    users.push({ username, password, name, dob, email });
    saveUsers(users);
    alert('Account created. Please login.');
    window.location.href = 'login.html';
  });
}

// index.html page setup 
function setupIndex(){
  const heroTitle = document.querySelector('.hero h2');
  if(heroTitle) heroTitle.textContent = 'Welcome to PetPaws';
  renderCartMini();
}

// DOM loaded

document.addEventListener('DOMContentLoaded', ()=>{
  renderCartMini();
  renderProducts();
  renderCartPage();
  renderCheckoutPage();
  setupLogin();
  setupRegister();
  setupIndex();

});
