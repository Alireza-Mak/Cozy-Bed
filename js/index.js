// *********************
// -global
// *********************
// -global state of the app
const state = {};

const elements = {
  cartBtn: document.querySelector('.cart-btn'),
  closeCartBtn: document.querySelector('.close-cart'),
  clearCartBtn: document.querySelector('.clear-cart'),
  cartDOM: document.querySelector('.cart'),
  cartOverlay: document.querySelector('.cart-overlay'),
  cartItems: document.querySelector('.cart-items'),
  cartTotal: document.querySelector('.cart-total'),
  cartContent: document.querySelector('.cart-content'),
  productsDOM: document.querySelector('.products-center'),
};
const elementStrings = {
  loader: 'spinner',
  loaderContainer: 'spinner-container',
};
const renderLoader = (parentElement) => {
  const html = `<div class="${elementStrings.loaderContainer}">
  <div class="${elementStrings.loader}"></div></div>`;
  parentElement.insertAdjacentHTML('afterbegin', html);
};

const clearLoader = () => {
  const loader = document.querySelector(`.${elementStrings.loaderContainer}`);
  if (loader) loader.parentElement.removeChild(loader);
};
renderError = (parentElement) => {
  const html = `<div class="error">
      <div class="loader"></div>
      <div class="message">
		Something went wrong with our server. Please try again later.
	</div>
</div>`;
  parentElement.insertAdjacentHTML('afterbegin', html);
};

// *********************
//****** Model *********
// *********************
// Products object
class Products {
  pause(time) {
    return new Promise((result) => {
      setTimeout(result, time);
    });
  }
  async getProducts() {
    try {
      await fetch('https://alireza-mak.github.io/products/products.json')
        .then(await this.pause(100))
        .then((response) => response.json())
        .then((data) => {
          this.results = data.items;
        });
    } catch (error) {
      console.log(error);
      renderError(elements.productsDOM);
    }
  }
}

// Cart object
class CartItems {
  constructor() {
    this.cartItems = [];
  }
  // Add new ite to the cart items
  addItem(id, title, price, image) {
    const cartItem = {
      id,
      title,
      price,
      image,
      amount: 1,
    };
    this.cartItems.push(cartItem);
    // Add data in local storage
    this.addCartItemsToLocalStorage();
    return cartItem;
  }
  // Get number of cart items
  getNumCartItems() {
    return this.cartItems.length;
  }
  // Delete the Item
  deleteItem(id) {
    const index = this.cartItems.findIndex((cartItem) => cartItem.id === id);
    this.cartItems.splice(index, 1);
    // Add data in local storage
    this.addCartItemsToLocalStorage();
  }
  // Clear cart items array
  clearCartItems() {
    this.cartItems = [];
    // Add data in local storage
    this.addCartItemsToLocalStorage();
  }

  // Update Cart Item
  updateCartItem(id, type) {
    let item = this.cartItems.find((item) => item.id === id);
    if (item) {
      if (type === 'dec') {
        item.amount > 0 ? item.amount-- : '';
      } else {
        item.amount++;
      }
    }
    return item;
  }
  // set Total Value
  setTotalValue() {
    let value = 0;
    this.cartItems.forEach((cartItem) => {
      value += cartItem.price * cartItem.amount;
      value = parseFloat(value.toFixed(2));
    });
    return value;
  }
  // Show cart layout
  showCart() {
    elements.cartOverlay.classList.add('transparentBcg');
    elements.cartDOM.classList.add('showCart');
  }
  // Hide cart layout
  hideCart() {
    elements.cartOverlay.classList.remove('transparentBcg');
    elements.cartDOM.classList.remove('showCart');
  }
  // Set local storage for cart
  addCartItemsToLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  // read local storage
  readStorage() {
    const storage = JSON.parse(localStorage.getItem('cartItems'));
    if (storage) {
      this.cartItems = storage;
    }
  }
}

// *********************
//******* UI ***********
// *********************
// Products View
const renderProducts = (products) => {
  const renderEachProduct = (product) => {
    const { title, price, image } = product.fields;
    const { id } = product.sys;
    const itemId = state.cart.cartItems.map((item) => item.id);
    let btn = '';
    const selectedBtn = itemId.includes(id);
    selectedBtn
      ? (btn = 'In cart')
      : (btn = '<i class="fas fa-shopping-cart"></i>Add to Cart');

    const html = `<article class="product">
          <div class="img-container">
            <img
              src="${image.fields.file.url}"
              alt="${title}"
              class="product-img"
            />
            <button ${
              selectedBtn ? 'disabled' : ''
            } class="bag-btn" data-id=${id}>
              ${btn}
            </button>
          </div>
          <h3>${title}</h3>
          <h4>$ ${price}</h4>
        </article>`;
    elements.productsDOM.insertAdjacentHTML('beforeend', html);
  };
  products.forEach(renderEachProduct);
};

// Cart View
const cartItemsView = (newItem, totalValue) => {
  const renderCartItem = (newItem) => {
    const html = `<div class="cart-item">
        <img src="${newItem.image}" alt="product-1">
        <div>
         <h4>${newItem.title}</h4>
         <h5>$ ${newItem.price}</h5>
         <span class="remove-item" data-id=${newItem.id}>remove</span>
        </div>
        <div >
         <i class="fas fa-chevron-up" data-id=${newItem.id}></i>
         <p class="item-amount" id="item-${newItem.id}">${newItem.amount}</p>
         <i class="fas fa-chevron-down" data-id=${newItem.id}></i>
        </div>
       </div>`;
    elements.cartContent.insertAdjacentHTML('beforeend', html);
  };
  elements.cartTotal.innerText = totalValue;
  renderCartItem(newItem);
};
// show Cart Number
const showCartNumber = () => {
  const numberOfCard = state.cart.cartItems.length;
  elements.cartItems.innerText = numberOfCard;
};

// Update the item in shopping Cart
const updateTotalValue = (id, totalValue, type) => {
  elements.cartTotal.innerText = totalValue;
  const item = document.querySelector(`#item-${id}`);
  const currentValue = parseInt(item.innerText);
  if (type === 'dec') {
    item.innerText > 0 ? (item.innerText = currentValue - 1) : '';
  } else {
    item.innerText = currentValue + 1;
  }
};

// Delete the item from shopping List

const deleteItem = (item, totalValue, itemId) => {
  const newItem = item.parentElement.parentElement;
  if (newItem) newItem.parentElement.removeChild(newItem);
  elements.cartTotal.innerText = totalValue;
  showCartNumber();
  const bagBtns = [...document.querySelectorAll('.bag-btn')];
  const button = bagBtns.find((btn) => btn.dataset.id === itemId);
  button.disabled = false;
  button.innerHTML = '<i class="fas fa-shopping-cart"></i>Add to Cart';
};
// Clear all cart items
const removeItems = () => {
  elements.cartContent.innerHTML = '';
  elements.cartTotal.innerText = 0;
  elements.cartItems.innerText = 0;
  state.cart.hideCart();
  const bagBtns = [...document.querySelectorAll('.bag-btn')];
  bagBtns.forEach((btn) => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i>Add to Cart';
  });
};

// *********************
//*** Controller ******
// *********************
// Products Controll
const controlProudcts = async () => {
  state.products = new Products();
  renderLoader(elements.productsDOM);
  await state.products.getProducts();
  clearLoader();
  renderProducts(state.products.results);
};

// Cart Controll
const controlCart = (btnId) => {
  if (!state.cart) state.cart = new CartItems();
  if (btnId) {
    // find the item from all products based on id
    const itemInfo = state.products.results.filter((el) => el.sys.id === btnId);
    const { title, price, image } = itemInfo[0].fields;
    const { id } = itemInfo[0].sys;
    // Add item to the cart
    const newItem = state.cart.addItem(id, title, price, image.fields.file.url);
    // Add cart items to the UI cart
    cartItemsView(newItem, state.cart.setTotalValue());
  }
};
// *********************
// EVENT LISTENERS
// *********************

// ******LOADING EVENT LISTENER*****
document.addEventListener('DOMContentLoaded', () => {
  // Define cart items in the State
  controlCart();

  // Restore Likes
  state.cart.readStorage();

  // Render the existing cart
  showCartNumber();
  state.cart.cartItems.forEach((item) => {
    if (item) {
      cartItemsView(item, state.cart.setTotalValue());
    }
  });

  // Define products in the State
  controlProudcts();
});

// ******PRODUCTS EVENT LISTENER*****
window.addEventListener('click', (event) => {
  // A Bag button in the UI Clicked
  if (event.target.matches('.bag-btn')) {
    event.target.innerText = 'In Cart';
    event.target.disabled = true;
    state.cart.showCart();
    const id = event.target.dataset.id;
    controlCart(id);
    showCartNumber();

    // Cart icon in the UI Clicked
  } else if (event.target.matches('.cart-btn, .cart-btn *')) {
    state.cart.showCart();

    // (SHOP NOW) button in the UI Clicked
  } else if (event.target.matches('.shop-btn')) {
    window.scrollTo({
      top: elements.productsDOM.offsetTop,
      behavior: 'smooth',
    });
  }
});

// ******CART EVENT LISTENER*****
elements.cartOverlay.addEventListener('click', (event) => {
  const id = event.target.dataset.id;

  // Outside of cart layout in the UI Clicked
  if (event.target.matches('.cart-overlay')) {
    state.cart.hideCart();

    // Outside of cart layout in the UI Clicked
  } else if (event.target.matches('.cart-overlay')) {
    state.cart.hideCart();
    // A Bag button in the UI Clicked
  }

  // Close Icon was Clicked in the UI
  else if (event.target.matches('.close-cart, .close-cart *')) {
    state.cart.hideCart();
    // Decrease number of item's Button was Clicked in the UI
  } else if (event.target.matches('.fa-chevron-down')) {
    if (parseInt(event.target.previousElementSibling.innerHTML) - 1 === 0) {
      state.cart.deleteItem(id);
      deleteItem(event.target, state.cart.setTotalValue(), id);
    } else {
      state.cart.updateCartItem(id, 'dec');
      updateTotalValue(id, state.cart.setTotalValue(), 'dec');
    }
    // Increase number of item's Button was Clicked in the UI
  } else if (event.target.matches('.fa-chevron-up')) {
    state.cart.updateCartItem(id, 'inc');
    updateTotalValue(id, state.cart.setTotalValue(), 'inc');
    // Remove button was Clicked in the UI
  } else if (event.target.matches('.remove-item')) {
    state.cart.deleteItem(id);
    deleteItem(event.target, state.cart.setTotalValue(), id);
    showCartNumber();
    // Clear button was Clicked in the UI
  } else if (event.target.matches('.clear-cart')) {
    state.cart.clearCartItems();
    removeItems();
  }
});
