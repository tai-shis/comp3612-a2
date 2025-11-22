// browse.js
import { addToCart } from "./cart.js";

export const browseState = {
  genders: new Set(),
  categories: new Set(),
  sizes: new Set(),
  colors: new Set(),
  sortBy: "name",
};

let allItems = [];

function renderBrowseList(items) {
  const list = document.querySelector("#browse-list");
  const count = document.querySelector("#browse-results-count");
  list.innerHTML = "";

  count.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "col-span-3 text-sm text-gray-500";
    empty.textContent = "No products match your filters.";
    list.appendChild(empty);
    return;
  }

  const placeholder = "https://via.placeholder.com/200x250?text=placeholder";

  for (const p of items) {
    const li = document.createElement("li");
    li.className =
      "border border-gray-400 bg-white p-3 flex flex-col text-sm gap-2";
    li.dataset.sid = p.id;

    const linkButton = document.createElement("button");
    linkButton.className = "product-link flex flex-col text-left gap-2";

    const thumb = document.createElement("div");
    thumb.className =
      "border border-gray-400 h-48 flex items-center justify-center bg-gray-100 text-xs text-gray-400";

    const img = document.createElement("img");
    img.src = p.image || placeholder;
    img.alt = p.name;
    img.className = "max-h-full max-w-full";

    thumb.appendChild(img);
    linkButton.appendChild(thumb);

    const row = document.createElement("div");
    row.className = "flex items-center justify-between";

    const copy = document.createElement("div");
    copy.className = "flex flex-col leading-tight";

    const name = document.createElement("div");
    name.className = "font-semibold text-sm";
    name.textContent = p.name;

    const price = document.createElement("div");
    price.className = "text-gray-800 text-sm";
    price.textContent = `$${Number(p.price).toFixed(2)}`;

    const addButton = document.createElement("button");
    addButton.className =
      "add-item text-xs border border-gray-500 px-2 py-1 hover:bg-gray-200";
    addButton.textContent = "+";

    copy.appendChild(name);
    copy.appendChild(price);
    row.appendChild(copy);
    row.appendChild(addButton);

    li.appendChild(linkButton);
    li.appendChild(row);
    list.appendChild(li);
  }
}

function renderActiveFilterChips() {
  const container = document.querySelector("#browse-active-filters");
  container.innerHTML = "";

  const formatLabel = (type, value) => {
    if (type === "gender") {
      return value === "womens" ? "Female" : value === "mens" ? "Male" : value;
    }
    // Title-case single words
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const add = (set, type) => {
    for (const value of set) {
      const chip = document.createElement("button");
      chip.className =
        "px-3 py-1 bg-gray-200 border border-gray-300 rounded-full flex items-center gap-1 text-sm";
      chip.dataset.filterType = type;
      chip.dataset.filterValue = value;

      chip.appendChild(document.createTextNode(formatLabel(type, value)));
      const close = document.createElement("span");
      close.className = "text-gray-500";
      close.textContent = "x";
      chip.appendChild(close);

      container.appendChild(chip);
    }
  };

  add(browseState.genders, "gender");
  add(browseState.categories, "category");
  add(browseState.sizes, "size");
  add(browseState.colors, "color");
}

export function applyBrowseFilters() {
  let result = allItems.slice();

  if (browseState.genders.size) {
    result = result.filter((p) => browseState.genders.has(p.gender));
  }
  if (browseState.categories.size) {
    result = result.filter((p) => browseState.categories.has(p.category));
  }
  if (browseState.sizes.size) {
    result = result.filter((p) =>
      p.sizes?.some((size) => browseState.sizes.has(size))
    );
  }
  if (browseState.colors.size) {
    result = result.filter((p) => {
      const colors = Array.isArray(p.color) ? p.color : [p.color];
      return colors.some((c) =>
        [...browseState.colors].some((filter) =>
          c.name.toLowerCase().includes(filter.toLowerCase())
        )
      );
    });
  }

  result.sort((a, b) => {
    switch (browseState.sortBy) {
      case "price":
        return a.price - b.price;
      case "category":
        return a.category.localeCompare(b.category);
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  renderBrowseList(result);
}

export function setupBrowse(items) {
  if (!items?.length) return;
  allItems = items.slice();

  const filters = document.querySelector("#browse-filters");
  const chips = document.querySelector("#browse-active-filters");
  const sortSel = document.querySelector("#browse-sort");
  const clearAll = document.querySelector("#browse-clear-all");
  const list = document.querySelector("#browse-list");

  const getSet = (type) => {
    switch (type) {
      case "gender":
        return browseState.genders;
      case "category":
        return browseState.categories;
      case "size":
        return browseState.sizes;
      case "color":
        return browseState.colors;
      default:
        return browseState[type + "s"];
    }
  };

  const setButtonState = (btn, isActive) => {
    btn.classList.toggle("font-semibold", isActive);
    btn.classList.toggle("text-gray-900", isActive);
    btn.classList.toggle("text-gray-600", !isActive);
  };

  filters.addEventListener("change", (e) => {
    if (!e.target.matches('input[type="checkbox"][data-filter-type]')) return;

    const type = e.target.dataset.filterType;
    const value = e.target.value;
    const set = getSet(type);

    if (e.target.checked) set.add(value);
    else set.delete(value);

    const label = e.target.parentElement;
    label.classList.toggle("font-semibold", e.target.checked);
    label.classList.toggle("bg-gray-200", e.target.checked);

    renderActiveFilterChips();
    applyBrowseFilters();
  });

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter-type]");
    if (!btn) return;

    const type = btn.dataset.filterType;
    const value = btn.dataset.filterValue;
    const set = getSet(type);

    if (set.has(value)) {
      set.delete(value);
      setButtonState(btn, false);
    } else {
      set.add(value);
      setButtonState(btn, true);
    }

    renderActiveFilterChips();
    applyBrowseFilters();
  });

  chips.addEventListener("click", (e) => {
    const chip = e.target.closest("button[data-filter-type]");
    if (!chip) return;

    const { filterType, filterValue } = chip.dataset;
    const set = getSet(filterType);

    set.delete(filterValue);

    const checkbox = filters.querySelector(
      `input[data-filter-type="${filterType}"][value="${filterValue}"]`
    );
    if (checkbox) {
      checkbox.checked = false;
      const label = checkbox.parentElement;
      label.classList.remove("font-semibold", "bg-gray-200");
    }

    const btn = filters.querySelector(
      `button[data-filter-type="${filterType}"][data-filter-value="${filterValue}"]`
    );
    if (btn) {
      setButtonState(btn, false);
    }

    renderActiveFilterChips();
    applyBrowseFilters();
  });

  clearAll.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Reseting the filters in browseState
    browseState.genders.clear();
    browseState.categories.clear();
    browseState.sizes.clear();
    browseState.colors.clear();

    filters
      .querySelectorAll('input[type="checkbox"][data-filter-type]')
      .forEach((cb) => {
        cb.checked = false;
        cb.parentElement.classList.remove("font-semibold", "bg-gray-200");
      });
    filters
      .querySelectorAll('button[data-filter-type]')
      .forEach((btn) => setButtonState(btn, false));

    renderActiveFilterChips();
    applyBrowseFilters();
  });

  sortSel.addEventListener("change", (e) => {
    browseState.sortBy = e.target.value;
    applyBrowseFilters();
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-sid]");
    if (!li) return;
    const sid = li.dataset.sid;

    if (e.target.classList.contains("add-item")) {
      addToCart(sid);
    } else if (e.target.closest(".product-link")) {
      // TODO: showSingleProduct(sid) and route to #singleproduct
    }
  });

  renderActiveFilterChips();
  applyBrowseFilters();
}
