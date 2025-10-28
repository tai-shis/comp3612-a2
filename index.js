document.addEventListener('DOMContentLoaded', async function() {
  const fetchURL = `https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json`;
  
  let items = JSON.parse(localStorage.getItem('items'));
  if (!items) {
    // Standard error handling
    fetch(fetchURL)
      .then(response => response.json())
      .then(data => {
        items = data;
        localStorage.setItem('items', JSON.stringify(items));
        // render
      })
    .catch(error => console.log(`Error fetching item data: ${error}`));
  } else {
    const items = JSON.parse(localStorage.getItem('items'));
    // render
  }
    


});