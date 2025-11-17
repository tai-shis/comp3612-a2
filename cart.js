function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCounter = document.querySelector("#cart-counter");
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  cartCounter.textContent = totalItems;
}

function Cart(sid, qty) {
  this.sid = sid;
  this.qty = qty;
}

// Function to add an item to the cart
export function addToCart(sid) { 
  let cart = JSON.parse(localStorage.getItem('cart')) || []; // Initialize cart from localStorage if available or make new empty array
  
  const existingItem = cart.find(item => item.sid == sid); 
  if (existingItem) {
    existingItem.qty += 1; 
  } 
  else {
    cart.push(new Cart(sid, 1)); 
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

export function removeFromCart(e) {
  if (e.target.classList.contains("remove-item")) {
    // visually remove
    // e.target.parentNode.remove();

    // whoo this is a block of code
    // go through the cart in localStorage, find object with the matching sid
    const cart = JSON.parse(localStorage.getItem('cart'))
    const removedItem = cart.find(item => item.sid == e.target.parentNode.dataset.sid);
    // then we remove the item from the cart using filter; from localstorage
    localStorage.setItem('cart', JSON.stringify(cart.filter(item => item !== removedItem)));
    renderCart();
  }
}

// might as well return the sum of prices here.
function renderCartItems(cart, items) {
  const cartContainer = document.querySelector('#cart-items');
  cartContainer.innerHTML = '';

  const itemTemplate = document.querySelector('#cart-item-template');

  let subtotal = 0;
  cart.forEach((item) => {
    const clone = itemTemplate.content.cloneNode(true);
    const product = items.find(prod => prod.id == item.sid);
    clone.querySelector('.cart-item').setAttribute('data-sid', item.sid);
    clone.querySelector('.item-name').textContent = product.name;
    clone.querySelector('.item-color').classList.add(`bg-[${product.color[0].hex}]`) //product for now
    // clone.querySelector('.item-size').textContent = item.size; // should be from cart
    clone.querySelector('.item-price').textContent = product.price;
    clone.querySelector('.item-quantity').textContent = item.qty;

    let itemSubtotal = product.price * item.qty;
    subtotal += itemSubtotal;
    clone.querySelector(`.item-subtotal`).textContent = `${itemSubtotal.toFixed(2)}`;
    cartContainer.appendChild(clone);
  })

  return subtotal;
}

function getShippingCost(shippingInfo) {
  const shippingRates = {
    standard: { CA: 10, US: 15, INT: 20 },
    express: { CA: 25, US: 25, INT: 30 },
    priority: { CA: 35, US: 50, INT: 50 }
  };

  return shippingRates[shippingInfo.type][shippingInfo.dest];
}

// Will calculate and render shipping info, given the subtotal and shipping form data
function renderCartSummary(subtotal, shippingInfo) {
  const summary = document.querySelector('#cart-summary'); // reduce scope of query search
  const shipping = subtotal > 500 ? 0 : getShippingCost(shippingInfo);
  const taxes = shippingInfo.dest == 'CA' ? subtotal * 0.05 : 0;
  const total = subtotal + shipping + taxes;

  summary.querySelector('#cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  summary.querySelector('#cart-shipping').textContent = `$${shipping.toFixed(2)}`;
  summary.querySelector('#cart-taxes').textContent = `$${taxes.toFixed(2)}`;
  summary.querySelector('#cart-total').textContent = `$${total.toFixed(2)}`;
}


export function updateCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const items = JSON.parse(localStorage.getItem('items'));
  const shippingInfo = JSON.parse(localStorage.getItem('shipping')) || { type: 'standard', dest: 'CA' };
  

  // change styling to a custom css class for disabled and just toggle.
  if (cart.length === 0) {
    const checkoutButton = document.querySelector('#checkout-button');
    checkoutButton.setAttribute('disabled', 'true');
    checkoutButton.classList.add('hover:cursor-not-allowed');
    checkoutButton.classList.add('bg-gray-200')
    checkoutButton.classList.remove('hover:cursor-pointer');
    checkoutButton.classList.remove('hover:bg-gray-200')
  } else {
    const checkoutButton = document.querySelector('#checkout-button');
    checkoutButton.removeAttribute('disabled');
    checkoutButton.classList.remove('hover:cursor-not-allowed');
    checkoutButton.classList.remove('bg-gray-200')
    checkoutButton.classList.add('hover:cursor-pointer');
    checkoutButton.classList.add('hover:bg-gray-200')
  }

  updateCartCounter();
  // get subtotal when rendering so we dont have to loop more than once
  const subtotal = renderCartItems(cart, items);
  renderCartSummary(subtotal, shippingInfo);
}

export function renderCart() {
  // Add Event handlers
  const cart = document.querySelector('#cart');
  cart.querySelector('#shipping-type').addEventListener("change", (e) => {
    let shipping = JSON.parse(localStorage.getItem('shipping')) || { type: 'standard', dest: 'CA' };
    shipping.type = e.target.value;
    localStorage.setItem('shipping', JSON.stringify(shipping));
    updateCart();
  });
  
  cart.querySelector('#shipping-dest').addEventListener("change", (e) => {
    let shipping = JSON.parse(localStorage.getItem('shipping')) || { type: 'standard', dest: 'CA' };
    shipping.dest = e.target.value;
    localStorage.setItem('shipping', JSON.stringify(shipping));
    updateCart();
  });

  cart.querySelector('#checkout-button').addEventListener("click", (e) => {
    e.preventDefault();
    alert("Checkout is not implemented in this demo.");
  });

  updateCart()
}