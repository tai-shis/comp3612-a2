import { addToCart, removeFromCart, renderCart } from "./cart.js";
import { setupBrowse } from "./browse.js";

window.showToast = function(message) {
    const container = document.querySelector('#toast-container'); 
    const toast = document.createElement('div');
    toast.className = "bg-gray-800 text-white px-6 py-4 rounded shadow-lg transition-all duration-500 transform translate-y-10 opacity-0 flex gap-2";
    
    // Safe DOM creation (No innerHTML)
    const icon = document.createElement('span');
    icon.textContent = "✓";
    icon.className = "text-green-400 font-bold";
    
    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, 500); 
    }, 3000);
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
    // setupSingleProduct(items);  <-- DELETE THIS LINE
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

