import { addToCart, renderCart } from "./cart.js";
import { setupBrowse, loadCategory } from "./browse.js";

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
    // const imgElement = document.querySelector('#sp-image');
    // if (product.image) {
    //     imgElement.src = product.image; 
    //     imgElement.alt = product.name;
    //     imgElement.classList.remove('hidden');
    // } else {
    //     imgElement.classList.add('hidden');
    // }
    const imgElement = document.querySelector('#sp-image');

    // Update Breadcrumbs 
    document.querySelector('#crumb-gender').textContent = product.gender;
    document.querySelector('#crumb-category').textContent = product.category;
    document.querySelector('#crumb-product').textContent = product.name;

    setupBreadcrumbs(product);

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
    const relatedContainer = document.querySelector('.border-t .grid'); 
        if(relatedContainer) {
            // Clear static placeholders
            while(relatedContainer.firstChild) relatedContainer.removeChild(relatedContainer.firstChild);

            // Find related items
            const related = items
                .filter(i => i.category === product.category && i.id !== product.id)
                .slice(0, 4); // Take up to 4

            related.forEach(relItem => {
                const card = document.createElement('div');
                card.className = "flex flex-col gap-2 cursor-pointer group";
                
                // Image
                const imgDiv = document.createElement('div');
                imgDiv.className = "aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden";
                const img = document.createElement('img');
                img.src = getProductImage(item);
                img.className = "w-full h-full object-contain group-hover:scale-110 transition duration-300";
                imgDiv.appendChild(img);

                // Info
                const infoDiv = document.createElement('div');
                infoDiv.className = "flex justify-between text-sm font-medium";
                
                const titleSpan = document.createElement('span');
                titleSpan.textContent = relItem.name;
                const priceSpan = document.createElement('span');
                priceSpan.textContent = `$${relItem.price}`;

                infoDiv.appendChild(titleSpan);
                infoDiv.appendChild(priceSpan);

                // Add Btn 
                const addBtn = document.createElement('button');
                addBtn.className = "text-xs text-gray-500 underline text-left hover:text-blue-600";
                addBtn.textContent = "+ View Details";

                card.appendChild(imgDiv);
                card.appendChild(infoDiv);
                card.appendChild(addBtn);

                // Click logic load this product
                card.addEventListener('click', () => {
                    window.displayProduct(relItem.id);
                });

                relatedContainer.appendChild(card);
            });
        }
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

  // Initialize Routing Buttons

  document
    .querySelectorAll("#site-header button[data-route]")
    .forEach((b) => b.addEventListener("click", route));

  // Initialize About Pop-up 
  const aboutBtn = document.querySelector("#nav-about");
  const aboutDialog = document.querySelector("#about");
  
  if (aboutBtn && aboutDialog) {
      aboutBtn.addEventListener("click", () => {
          aboutDialog.showModal(); // Opens as a modal overlay
      });
  }
  const initialize = (items) => {
    localStorage.setItem('items', JSON.stringify(items));
    render(items);
    renderGenderView(items, 'mens');
    renderGenderView(items, 'womens');
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
    const targetBtn = e.target.closest('button');
    if (!targetBtn) return;

    // Get the route ID 
    const routeId = targetBtn.dataset.route;

    // Debugging
    console.log("Routing to:", routeId);

    // Switch Views
    const pages = document.querySelectorAll("main > article");

    for (const page of pages) {
        if (page.id === routeId) {
            // Show the matching page
            page.classList.remove("hidden");
            page.classList.add("block");
        } else {
            // Hide all others
            page.classList.remove("block");
            page.classList.add("hidden");
        }
    }

    window.scrollTo(0, 0);
    }

    function render(items) {
    const container = document.querySelector("#home"); 

    // Clear safely
    while(container.firstChild) container.removeChild(container.firstChild);

    // HERO SECTION 
    const hero = document.createElement('div');
    // Relative positioning to stack text over image
    hero.className = "relative h-[500px] bg-gray-900 flex items-center justify-center text-center px-4 mb-12 overflow-hidden shadow-xl";

    // Background Image
    const heroImg = document.createElement('img');
    // High-quality tech/fashion placeholder
    heroImg.src = "images/hero-bg.jpg";
    heroImg.className = "absolute inset-0 w-full h-full object-cover opacity-40"; // Opacity makes text readable

    // Content Wrapper
    const heroContent = document.createElement('div');
    heroContent.className = "relative z-10 max-w-3xl mx-auto space-y-6";

    const h1 = document.createElement('h1');
    h1.className = "text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg";
    h1.textContent = "Computer Science Collection 2025";

    const p = document.createElement('p');
    p.className = "text-lg md:text-2xl text-gray-200 font-light tracking-wide";
    p.textContent = "Upgrade your wardrobe with our latest arrivals designed for the modern developer.";

    // Call to Action Button
    const ctaBtn = document.createElement('button');
    ctaBtn.className = "mt-6 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-lg hover:bg-blue-500 hover:text-white hover:scale-105 transition duration-300 ease-in-out transform cursor-pointer";
    ctaBtn.textContent = "Shop Now";

    // Link CTA to Browse Page 
    ctaBtn.addEventListener('click', () => {
        const browseBtn = document.querySelector('button[data-route="browse"]');
        if(browseBtn) browseBtn.click();
    });

    heroContent.appendChild(h1);
    heroContent.appendChild(p);
    heroContent.appendChild(ctaBtn);
    hero.appendChild(heroImg);
    hero.appendChild(heroContent);

    container.appendChild(hero);

    // FEATURED SECTION HEADER
    const featuredHeader = document.createElement('div');
    featuredHeader.className = "text-center mb-10";
    const h2 = document.createElement('h2');
    h2.className = "text-3xl font-bold text-gray-900 uppercase tracking-widest inline-block border-b-4 border-blue-500 pb-2";
    h2.textContent = "Featured Products";
    featuredHeader.appendChild(h2);
    container.appendChild(featuredHeader);

    // FEATURED GRID 
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-1 md:grid-cols-3 gap-8 p-4 max-w-6xl mx-auto mb-16";

    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const featuredItems = shuffled.slice(0, 3);
    featuredItems.forEach(item => {
    const card = document.createElement("div"); 
    card.className = "group relative bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100";

    // Image Container
    const imgContainer = document.createElement("div");
    imgContainer.className = "aspect-[4/5] w-full overflow-hidden bg-gray-50 flex items-center justify-center";

    const img = document.createElement("img");
    img.src = getProductImage(item);
    // Zoom effect on hover
    img.className = "w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-500";

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    // Card Details
    const details = document.createElement("div");
    details.className = "p-6 text-center";

    const h3 = document.createElement("h3");
    h3.textContent = item.name;
    h3.className = "font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors";

    const price = document.createElement("p");
    price.textContent = `$${Number(item.price).toFixed(2)}`;
    price.className = "text-gray-500 font-medium";

    details.appendChild(h3);
    details.appendChild(price);
    card.appendChild(details);

    // Link to Single Product
    card.addEventListener('click', () => window.displayProduct(item.id));
    grid.appendChild(card);
    });

    container.appendChild(grid);
}

function renderGenderView(items, gender) {
    const containerId = gender === 'mens' ? '#men' : '#women';
    const container = document.querySelector(containerId);
    if (!container) return;

    // Clear existing
    while (container.firstChild) container.removeChild(container.firstChild);

    // Hero Section
    const hero = document.createElement('div');
    hero.className = "relative bg-gray-800 text-white mb-8 h-64 flex items-center justify-center overflow-hidden";
    
    // Hero Background 
    const heroImg = document.createElement('img');
    
    // Switch image based on gender
    if (gender === 'mens') {
        heroImg.src = "images/men-hero.webp";
    } else {
        heroImg.src = "images/women-hero.jpg";
    }
    heroImg.className = "absolute inset-0 w-full h-full object-cover opacity-50";
    
    const heroTitle = document.createElement('h1');
    heroTitle.className = "relative z-10 text-5xl font-bold uppercase tracking-widest drop-shadow-md";
    heroTitle.textContent = gender === 'mens' ? "Men's Collection" : "Women's Collection";
    
    hero.appendChild(heroImg);
    hero.appendChild(heroTitle);
    container.appendChild(hero);

    // Category Grid
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto p-4";

    // Categories found in data
    const genderItems = items.filter(i => i.gender === gender);
    const categories = [...new Set(genderItems.map(i => i.category))].sort();

    categories.forEach(cat => {
        // We try to find an item just to ensure this category actually exists for this gender
        const catItem = items.find(i => i.gender === gender && i.category === cat);
        
        // If no items exist (e.g. Men's Dresses), skip rendering 
        if (!catItem) return; 

        const card = document.createElement('div');
        card.className = "group relative h-80 bg-white border border-gray-200 cursor-pointer overflow-hidden hover:shadow-xl transition rounded-sm";
        
        const img = document.createElement('img');
        // If real image exists, use it.
        img.src = getProductImage(catItem);
        img.className = "w-full h-full object-cover group-hover:scale-105 transition duration-500";
        
        const label = document.createElement('div');
        label.className = "absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 text-center font-bold uppercase tracking-wide shadow-sm text-sm whitespace-nowrap";
        label.textContent = cat;

        card.appendChild(img);
        card.appendChild(label);

        // Go to Browse page with filters set
        card.addEventListener('click', () => {
            loadCategory(gender, cat);
        });

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function setupBreadcrumbs(product) {
    // Select elements
    const oldHome = document.querySelector('#crumb-home');
    const oldGender = document.querySelector('#crumb-gender');
    const oldCategory = document.querySelector('#crumb-category');

    // Helper to replace an element with a clone
    const replaceWithClone = (el) => {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        return newEl;
    };

    // Create fresh elements
    const breadHome = replaceWithClone(oldHome);
    const breadGender = replaceWithClone(oldGender);
    const breadCategory = replaceWithClone(oldCategory);

    // 4. Add Event Listeners
    breadHome.addEventListener('click', (e) => {
        e.preventDefault(); // As taught in Lab 9a [cite: 5749]
        document.querySelector('button[data-route="home"]').click();
    });

    breadGender.addEventListener('click', (e) => {
        e.preventDefault();
        // Ensure lowercase to match HTML ID 
        let routeId = product.gender.toLowerCase(); 
        if (routeId === 'mens') routeId = 'men';
        if (routeId === 'womens') routeId = 'women';
        const navBtn = document.querySelector(`button[data-route="${routeId}"]`);
        if (navBtn) navBtn.click();
        else {
            console.error(`Navigation button not found for route: ${routeId}`);
        }
    });

    breadCategory.addEventListener('click', (e) => {
        e.preventDefault();
        import('./browse.js').then(module => {
            module.loadCategory(product.gender, product.category);
        });
    });
}

export function getProductImage(product) {
    if (product.image) return product.image;
    // Generates a grey box with the product name written inside until images work
    return `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(product.name)}`;
}