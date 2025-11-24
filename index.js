import { addToCart, renderCart } from "./cart.js";
import { setupBrowse } from "./browse.js";

// Displays a temporary notification at the bottom right
window.showToast = function(message) {
    const container = document.querySelector('#toast-container'); 
    const toast = document.createElement('div');

    //shadow 
    toast.className = "bg-gray-800 text-white px-6 py-4 rounded shadow-lg transition-all duration-500 transform translate-y-10 opacity-0 flex gap-2";
  
    const icon = document.createElement('span');
    icon.textContent = '\u2728'; // sparkle icon for emphasis
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
    let selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    
    // Handle complex color objects or simple strings
    let firstColor = null;
    if (product.color) {
        const c = Array.isArray(product.color) ? product.color[0] : product.color;
        firstColor = typeof c === 'object' ? c.name : c;
    }
    let selectedColor = firstColor;


    // Populate text elements
    document.querySelector('#sp-name').textContent = product.name;
    document.querySelector('#sp-price').textContent = `$${Number(product.price).toFixed(2)}`;
    document.querySelector('#sp-desc').textContent = product.description;
    document.querySelector('#sp-features').textContent = product.features || "N/A";

    // Set Image
    const imgElement = document.querySelector('#sp-image');
    if (product.image) {
        imgElement.src = product.image; 
        imgElement.alt = product.name;
        imgElement.classList.remove('hidden');
    } else {
        imgElement.classList.add('hidden');
    }

    // Update Breadcrumbs 
    document.querySelector('#crumb-gender').textContent = product.gender;
    document.querySelector('#crumb-category').textContent = product.category;
    document.querySelector('#crumb-product').textContent = product.name;

    // Reset Quantity Input
    const qtyInput = document.querySelector('#sp-qty');
    if(qtyInput) qtyInput.value = 1;


    // DYNAMIC SIZES (Selectable & Tracked)
    const sizeContainer = document.querySelector('#sp-sizes');
    const sizeWrapper = document.querySelector('#sp-sizes-container');
    
    if (sizeContainer) sizeContainer.innerHTML = ''; 

    if (sizeContainer && sizeWrapper) {
        if (product.sizes && product.sizes.length > 0) {
            sizeWrapper.classList.remove('hidden'); 
            
            product.sizes.forEach(size => {
                const btn = document.createElement('button');
                
                // Base Classes
                const baseClass = 'h-10 min-w-[3rem] px-3 border text-sm font-medium transition-all cursor-pointer';
                const inactiveClass = 'border-gray-300 bg-white text-gray-900 hover:border-black';
                const activeClass = 'border-2 border-black bg-gray-50 text-black font-bold shadow-sm transform scale-105';

                // Set initial style (Active if it matches default)
                btn.className = (size === selectedSize) ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
                btn.textContent = size;

                // Click Selection Logic
                btn.onclick = () => {
                    selectedSize = size; // <--- UPDATE STATE
                    
                    // Reset visuals
                    Array.from(sizeContainer.children).forEach(b => {
                        b.className = `${baseClass} ${inactiveClass}`;
                    });
                    // Highlight active
                    btn.className = `${baseClass} ${activeClass}`;
                };
                sizeContainer.appendChild(btn);
            });
        } else {
            sizeWrapper.classList.add('hidden'); 
        }
    }

    // DYNAMIC COLORS 
    const colorContainer = document.querySelector('#sp-colors');
    const colorWrapper = document.querySelector('#sp-colors-container');
    
    if (colorContainer) colorContainer.innerHTML = '';

    if (colorContainer && colorWrapper) {
        let colors = [];
        if (product.color) {
            colors = Array.isArray(product.color) ? product.color : [product.color];
        }

        if (colors.length > 0) {
            colorWrapper.classList.remove('hidden');

            colors.forEach(c => {
                const colorName = typeof c === 'object' ? c.name : c;
                
                const btn = document.createElement('button');
                btn.className = 'w-10 h-10 border border-gray-300 hover:opacity-80 transition-all cursor-pointer shadow-sm';
                btn.style.backgroundColor = colorName.toLowerCase(); 
                btn.title = colorName; 

                // Initial Active State
                if (colorName === selectedColor) {
                    btn.classList.remove('border-gray-300');
                    btn.classList.add('ring-2', 'ring-offset-2', 'ring-black', 'scale-110');
                }

                // Click Selection Logic
                btn.onclick = () => {
                    selectedColor = colorName; // <--- UPDATE STATE

                    // Reset siblings
                    Array.from(colorContainer.children).forEach(b => {
                        b.classList.remove('ring-2', 'ring-offset-2', 'ring-black', 'scale-110');
                        b.classList.add('border-gray-300');
                    });

                    // Activate clicked
                    btn.classList.remove('border-gray-300');
                    btn.classList.add('ring-2', 'ring-offset-2', 'ring-black', 'scale-110');
                };
                colorContainer.appendChild(btn);
            });
        } else {
            colorWrapper.classList.add('hidden');
        }
    }


    // Add to Cart button 
    const btn = document.querySelector('#sp-add-btn');
    const newBtn = btn.cloneNode(true); 
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        const quantity = parseInt(document.querySelector('#sp-qty').value) || 1;
        
        addToCart(product.id, quantity, selectedSize, selectedColor); 
        
        const detailString = selectedSize ? `(${selectedSize})` : '';
        window.showToast(`Added ${quantity} x ${product.name} ${detailString} to cart!`);
    });

    // Switch View
    document.querySelectorAll("main > article").forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('block');
    });
    const spView = document.querySelector('#singleproduct');
    spView.classList.remove('hidden');
    spView.classList.add('block');
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

function render(items) {
  const container = document.querySelector("#home"); 
  // Clear safely
  while(container.firstChild) container.removeChild(container.firstChild);

  // Create Hero
  const hero = document.createElement('div');
  hero.className = "bg-blue-600 text-white p-12 text-center mb-8 shadow-md";
  const h1 = document.createElement('h1');
  h1.className = "text-5xl font-bold mb-4";
  h1.textContent = "Computer Science Collection 2025";
  hero.appendChild(h1);
  container.appendChild(hero);

  // Create Grid
  const grid = document.createElement('div');
  grid.className = "grid grid-cols-1 md:grid-cols-3 gap-8 p-4 max-w-6xl mx-auto";

  // Show only 3 items
  items.slice(0, 3).forEach(item => {
    const card = document.createElement("div"); 
    card.className = "border p-4 rounded hover:shadow-xl transition bg-white cursor-pointer flex flex-col items-center text-center";
    
    const img = document.createElement("img");
    img.src = item.image ? item.image : "https://via.placeholder.com/400x400?text=No+Image";
    img.className = "w-full h-64 object-contain mb-4";
    
    const h3 = document.createElement("h3");
    h3.textContent = item.name;
    h3.className = "font-bold text-lg";

    const price = document.createElement("p");
    price.textContent = `$${Number(item.price).toFixed(2)}`;
    
    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(price);
    
    card.addEventListener('click', () => window.displayProduct(item.id));

    grid.appendChild(card);
  });

  container.appendChild(grid);
}
