document.addEventListener('DOMContentLoaded', async function() {
  const fetchURL = `https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json`;
  
  let items = JSON.parse(localStorage.getItem('items'));
 
  if (!items) {
    // Standard error handling
    fetch(fetchURL)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        items = data;
        localStorage.setItem('items', JSON.stringify(items));
        render(items)
      })
    .catch(error => console.log(`Error fetching item data: ${error}`));
  } else {
    const items = JSON.parse(localStorage.getItem('items'));
    render(items)
  }
 
  let cart = JSON.parse(localStorage.getItem('cart')) || []; // Initialize cart from localStorage if available or make new empty array
 
  // This functions should actually pre-render the entire page content, hiding everything except the home.
  function render(items) {
    const test = document.querySelector("#test");
    test.innerHTML = '';
    for(const item of items) {
      const div = document.createElement("div"); 
        
      div.textContent = `Item: ${item.name}, Gender: ${item.gender}, Category: ${item.category}`
      test.appendChild(div)

      const addButton = document.createElement("button");
      addButton.textContent = "Add to Cart";
      addButton.addEventListener('click', () => addToCart(item.sid)); 
      div.appendChild(addButton);
    
    }
  }
  


  // Function to add an item to the cart
  function addToCart(sid) {
    const existingItem = cart.find(item => item.sid === sid); 
    if (existingItem) {
      existingItem.qty += 1; 
    } 
    else {
      cart.push({ sid, qty: 1 }); 
    }
    updateCartCounter(); 
  }

  // Might actually have to count all cart items, less efficient, but less error prone.
  //function addToCart() {
    //const cartCounter = document.querySelector("#cart-counter");
    // might be able to just do this without parsing?
    //cartCounter.textContent = parseInt(cartCounter.textContent, 10) += 1;    
  //}

  function updateCartCounter() {
    const cartCounter = document.querySelector("#cart-counter");
    const totalItems = cart.reduce((total, item) => total + item.qty, 0);
    cartCounter.textContent = totalItems;
    localStorage.setItem('cart', JSON.stringify(cart));
  }




});

