import { addToCart, removeFromCart, renderCart } from "./cart.js";

document.addEventListener('DOMContentLoaded', () => {
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
    renderCart();
  }
 
});

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
