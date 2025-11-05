function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCounter = document.querySelector("#cart-counter");
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  cartCounter.textContent = totalItems;
}

// Function to add an item to the cart
export function addToCart(sid) { 
  let cart = JSON.parse(localStorage.getItem('cart')) || []; // Initialize cart from localStorage if available or make new empty array
  
  const existingItem = cart.find(item => item.sid == sid); 
  if (existingItem) {
    existingItem.qty += 1; 
  } 
  else {
    cart.push({ sid: sid, qty: 1 }); 
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

export function removeFromCart(e) {
  if (e.target.classList.contains("remove-item")) {
    // visually remove
    e.target.parentNode.remove();

    // whoo this is a block of code
    // go through the cart in localStorage, find object with the matching sid
    const cart = JSON.parse(localStorage.getItem('cart'))
    const removedItem = cart.find(item => item.sid == e.target.parentNode.dataset.sid);
    // then we remove the item from the cart using filter; from localstorage
    localStorage.setItem('cart', JSON.stringify(cart.filter(item => item !== removedItem)));
    updateCartCounter();
  }
}

export function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContainer = document.querySelector('#cart-items');
  cartContainer.innerHTML = '';
  const itemTemplate = document.querySelector('#cart-item-template');
  cart.forEach((item) => {
    const clone = itemTemplate.content.cloneNode(true);
    clone.querySelector('.cart-item').setAttribute('data-sid', item.sid);
    cartContainer.appendChild(clone);
  })
  updateCartCounter();
}