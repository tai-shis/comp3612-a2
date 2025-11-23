import { addToCart, removeFromCart, renderCart } from "./cart.js";
import { setupBrowse } from "./browse.js";

// Displays a temporary notification at the bottom right
window.showToast = function(message) {
    const container = document.querySelector('#toast-container'); 
    const toast = document.createElement('div');

    //shadow 
    toast.className = "bg-gray-800 text-white px-6 py-4 rounded shadow-lg transition-all duration-500 transform translate-y-10 opacity-0 flex gap-2";
  
    const icon = document.createElement('span');
    icon.textContent = "✓"; // yippie
    icon.className = "text-green-400 font-bold";
    
    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);
  // Trigger slide animation
    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, 500); 
    }, 3000);
};

// Populates and displays the Single Product View
window.displayProduct = function(sid) {
    // Get data from local storage
    const items = JSON.parse(localStorage.getItem('items'));
    const product = items.find(i => i.id == sid);
    
    if(!product) {
        console.error("Product not found:", sid);
        return;
    }

    // Populate text elements
    document.querySelector('#sp-name').textContent = product.name;
    document.querySelector('#sp-price').textContent = `$${Number(product.price).toFixed(2)}`;
    document.querySelector('#sp-desc').textContent = product.description;
    
    // Set image (I hope eventually)
  
    // const imgElement = document.querySelector('#sp-image');
    // imgElement.src = product.image; 
    // imgElement.alt = product.name;

    // Update Breadcrumbs 
    document.querySelector('#crumb-gender').textContent = product.gender;
    document.querySelector('#crumb-category').textContent = product.category;
    document.querySelector('#crumb-product').textContent = product.name;

    // Reset inputs
    const qtyInput = document.querySelector('#sp-qty');
    if(qtyInput) qtyInput.value = 1;

    // Setup "Add to Cart" button 
    const btn = document.querySelector('#sp-add-btn');
    const newBtn = btn.cloneNode(true); // remove old event listeners
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        // To be done 
        // Connect to real addToCart() logic next
        window.showToast(`Added ${product.name} to cart!`);
    });

    // Switch View manually
    // Hide all other pages
    document.querySelectorAll("main > article").forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('block');
    });
    // Show this page
    const spView = document.querySelector('#singleproduct');
    spView.classList.remove('hidden');
    spView.classList.add('block');
    
    // Scroll to top
    window.scrollTo(0,0);
};

document.addEventListener('DOMContentLoaded', () => {
  const fetchURL = `https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json`;
  
  const cached = localStorage.getItem('items');

  // Lets initialize the routing buttons
  document
    .querySelectorAll("#site-header button[data-route]")
    .forEach((b) => b.addEventListener("click", route));

  const initialize = (items) => {
    localStorage.setItem('items', JSON.stringify(items));
    render(items);
    setupBrowse(items);
    // setupSingleProduct(items);  
    renderCart();
};

  if (cached) {
    initialize(JSON.parse(cached));
  } else {
    fetch(fetchURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error occured while fetching item data');
        } else {
          return response.json();
        }
      })
      .then(data => initialize(data))
      .catch(error => console.log(`Error fetching item data: ${error}`));
  }
 
});

function route(e) {
  const pages = document.querySelectorAll("main > *");
  for(const page of pages) {
      if(page.id != e.target.dataset.route) {
          page.classList.remove("block");
          page.classList.add("hidden");
      } else {
          page.classList.remove("hidden");
          page.classList.add("block");
      }
  } 
}

// This functions should actually pre-render the entire page content, hiding everything except the home.
function render(items) {
  const test = document.querySelector("#test");
  test.innerHTML = '';
  for(const item of items) {
    const div = document.createElement("div"); 
      
    // this entire div section should be a template btw.
    div.textContent = `Item: ${item.name}, Gender: ${item.gender}, Category: ${item.category} `
    div.setAttribute("data-sid", item.id); // this is how we should properly get our item info for each item
    
    const addButton = document.createElement("button");
    addButton.textContent = "Add to Cart";
    addButton.classList.add("add-item");
    addButton.classList.add("hover:cursor-pointer")
    div.appendChild(addButton);
    test.appendChild(div)
  }

  test.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-item")) {
      addToCart(e.target.parentNode.dataset.sid); // cool passthrough!!
    }
  })

  // Add event listener to cart pages
  document.querySelector("#cart-items")
  .addEventListener("click", removeFromCart);
  
}

