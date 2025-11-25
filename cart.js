import { getProductImage } from "./index.js";
// Update Cart counter
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCounter = document.querySelector("#cart-counter");
  if (cartCounter) {
      const totalItems = cart.reduce((total, item) => total + item.qty, 0);
      cartCounter.textContent = totalItems;
  }
}

// Adds items to LocalStorage
export function addToCart(sid, qty = 1, size = null, color = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];


    if (size == null || color == null) {
      let items = JSON.parse(localStorage.getItem('items')) || [];
      const product = items.find(item => item.id == sid);
      if (!product) {
          console.error("Product not found for sid:", sid);
          return;
      }

      // just default to first available size/color
      if (size == null) {
        size = product.sizes[0]
      }
      if (color == null) {
        color = product.color[0].hex
      }
    }

    // We now check if ID *AND* Size *AND* Color match
    const existingItem = cart.find(item => 
        item.sid == sid && 
        item.size == size && 
        item.color == color
    );

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        // Push the new details into the object
        cart.push({ 
            sid: sid, 
            qty: qty, 
            size: size, 
            color: color 
        });
    }

    // Save back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof renderCart === 'function') renderCart(); 
    window.dispatchEvent(new Event('storage'));
}

// Removes item from LocalStorage and re-renders
export function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Remove exactly one item at that specific index
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// --- RENDERING & CALCULATIONS ---

function renderCartItems(cart, allItems) {
  const cartContainer = document.querySelector('#cart-items');
  
  // Clear safely
  while(cartContainer.firstChild) {
      cartContainer.removeChild(cartContainer.firstChild);
  }

  if (cart.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = "p-10 text-center text-gray-500 text-xl";
      emptyMsg.textContent = "Your shopping cart is empty.";
      cartContainer.appendChild(emptyMsg);
      return 0;
  }

  let subtotal = 0;
  const template = document.querySelector('#cart-item-template');

  cart.forEach((cartItem, index) => {
    const product = allItems.find(prod => prod.id == cartItem.sid);
    if (!product) return;

    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.cart-item');
    
    // Text Data
    clone.querySelector('.item-name').textContent = product.name;
    clone.querySelector('.item-price').textContent = `$${product.price.toFixed(2)}`;
    clone.querySelector('.item-quantity').textContent = cartItem.qty;

    // Image Handling
    const img = document.createElement('img');
    img.src = getProductImage(product);
    
    img.className = "w-20 h-24 object-cover border p-1 bg-white";   
    img.className = "w-20 h-24 object-contain border p-1 bg-white";
    const nameDiv = clone.querySelector('.item-name');
    nameDiv.parentNode.insertBefore(img, nameDiv);

    //Color Box
    const colorBox = clone.querySelector('.item-color');
    const pColor = Array.isArray(product.color) ? product.color[0] : product.color;
    const hex = pColor ? (pColor.hex || '#333') : '#333';
    colorBox.style.backgroundColor = hex;

    // Size
    const sizeBox = clone.querySelector('.item-size');
    sizeBox.textContent = cartItem.size || "N/A";

    // Calculations
    const itemTotal = product.price * cartItem.qty;
    subtotal += itemTotal;
    clone.querySelector('.item-subtotal').textContent = `$${itemTotal.toFixed(2)}`;

    // Remove 
    clone.querySelector('.remove-item').addEventListener('click', () => {
        removeItem(index); 
    });

    cartContainer.appendChild(clone);
  });

  return subtotal;
}

function getShippingCost(subtotal, type, dest) {
    if (subtotal > 500) return 0; 

    const rates = {
        standard: { CA: 10, US: 15, INT: 20 },
        express: { CA: 25, US: 25, INT: 30 },
        priority: { CA: 35, US: 50, INT: 50 }
    };

    if (!rates[type] || rates[type][dest] === undefined) return 0;
    return rates[type][dest];
}

function renderSummary(subtotal) {
    const shippingType = document.querySelector('#shipping-type').value;
    const shippingDest = document.querySelector('#shipping-dest').value;

    // Calculate Shipping
    const shippingCost = getShippingCost(subtotal, shippingType, shippingDest);
    
    // Calculate Tax (5% only if Canada)
    const taxRate = shippingDest === 'CA' ? 0.05 : 0;
    const taxCost = subtotal * taxRate;

    const total = subtotal + shippingCost + taxCost;

    // Update DOM
    document.querySelector('#cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('#cart-shipping-cost').textContent = `$${shippingCost.toFixed(2)}`;
    document.querySelector('#cart-taxes').textContent = `$${taxCost.toFixed(2)}`;
    document.querySelector('#cart-total').textContent = `$${total.toFixed(2)}`;
    
    // Handle Checkout Button State
    const checkoutBtn = document.querySelector('#checkout-button');
    if(!checkoutBtn) return;

    // Clone button to remove old listeners
    const newBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);

    if (subtotal === 0) {
        newBtn.disabled = true;
        newBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        newBtn.disabled = false;
        newBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Attach Checkout Event
        newBtn.addEventListener('click', () => {
            localStorage.removeItem('cart');
            // Use global toast if available
            if(window.showToast) window.showToast("Order placed successfully!");
            else alert("Order placed!");
            
            renderCart(); // Clear UI
            
            // Optional: Redirect to home
            setTimeout(() => {
                 const homeBtn = document.querySelector('button[data-route="home"]');
                 if(homeBtn) homeBtn.click();
            }, 1500);
        });
    }
}

// --- MAIN EXPORT ---
export function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const items = JSON.parse(localStorage.getItem('items')) || [];
    
    updateCartCounter();

    // Only try to render if we are actually on the cart page
    if (!document.querySelector('#cart-items')) return;

    const subtotal = renderCartItems(cart, items);
    renderSummary(subtotal);
    const sType = document.querySelector('#shipping-type');
    const sDest = document.querySelector('#shipping-dest');

    if(sType) sType.onchange = () => renderSummary(subtotal);
    if(sDest) sDest.onchange = () => renderSummary(subtotal);
}