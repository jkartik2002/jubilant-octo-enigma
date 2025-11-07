const defaults = {
  cartModal: '.js-ajax-cart-modal',
  cartModalContent: '.js-ajax-cart-modal-content',
  cartModalClose: '.js-ajax-cart-modal-close',
  cartDrawer: '.js-ajax-cart-drawer',
  cartDrawerContent: '.js-ajax-cart-drawer-content',
  cartDrawerClose: '.js-ajax-cart-drawer-close',
  cartDrawerTrigger: '#drawer-opener',
  cartOverlay: '.js-ajax-cart-overlay',
  cartCounter: '#cart-counter',
  addToCart: '.js-ajax-add-to-cart',
  removeFromCart: '.js-ajax-remove-from-cart',

  plusFromCart: '.js-ajax-add-cart',
  minusFromCart: '.js-ajax-minus-cart',

  removeFromCartNoDot: 'js-ajax-remove-from-cart',
  checkoutButton: '.js-ajax-checkout-button',
};

const cartModal = document.querySelector(defaults.cartModal);
const cartModalContent = document.querySelector(defaults.cartModalContent);
const cartModalClose = document.querySelector(defaults.cartModalClose);
const cartDrawer = document.querySelector(defaults.cartDrawer);
const cartDrawerContent = document.querySelector(defaults.cartDrawerContent);
const cartDrawerClose = document.querySelector(defaults.cartDrawerClose);
const cartDrawerTrigger = document.querySelector(defaults.cartDrawerTrigger);
const cartOverlay = document.querySelector(defaults.cartOverlay);
const cartCounter = document.querySelector(defaults.cartCounter);
const addToCart = document.querySelectorAll(defaults.addToCart);
let removeFromCart = document.querySelectorAll(defaults.removeFromCart);
const checkoutButton = document.querySelector(defaults.checkoutButton);
const htmlSelector = document.documentElement;

for (let i = 0; i < addToCart.length; i++) {
  addToCart[i].addEventListener('click', function (event) {

    event.preventDefault();
    const formID = this.parentNode.getAttribute('id');

    addProductToCart(formID);
  });
}

function addProductToCart(formID) {
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    dataType: 'json',
    data: $('#' + formID)
      .serialize(),
    success: addToCartOk,
    error: addToCartFail,
  });
}

function fetchCart() {
  $.ajax({
    type: 'GET',
    url: '/cart.js',
    dataType: 'json',
    success: function (cart) {
      onCartUpdate(cart);

      if (cart.item_count === 0) {
        cartDrawerContent.innerHTML = '<span class="empty">Your Bag is Empty</span>';
        checkoutButton.classList.add('is-hidden');
        $('#cart-counter, #nav-item-count').text(0);
        $('.you-might-like-container, .message-bar, .ajax-cart-drawer__buttons, .note-area, .packaging_wrapper').hide();
        $('a.drawer-cta').show();
        $('.ajaxcart__inner').addClass('empty');
      } else {
        renderCart(cart);
        checkoutButton.classList.remove('is-hidden');
        $('.you-might-like-container, .message-bar, .ajax-cart-drawer__buttons, .note-area, .packaging_wrapper').show();
        $('.ajaxcart__inner').removeClass('empty');
        $('a.drawer-cta').hide();
        window.dispatchEvent(new Event('resize'));
      }
    },
  });
}

function updateItem(line, qty) {
  const quantity = qty;
  $.ajax({
    type: 'POST',
    url: '/cart/change.js',
    data: 'quantity=' + quantity + '&line=' + line,
    dataType: 'json',
    success: function (cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      } else {
        Shopify.getCart(function(cart){
          onCartUpdate(cart);
          fetchCart();
        });
      }
    },
  });
}

function changeItem(line, callback, title, id, price) {
  const quantity = 0;

  $.ajax({
    type: 'POST',
    url: '/cart/change.js',
    data: 'quantity=' + quantity + '&line=' + line,
    dataType: 'json',
    success: function (cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      } else {
        Shopify.getCart(function(cart){
          onCartUpdate(cart);
          fetchCart();
          removeProductFromCart();
        });
      }

      dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
      dataLayer.push({
        event: 'gtmEvent',
        eventCategory: 'enhanced ecommerce',
        eventAction: 'remove from cart',
        eventLabel: title, // name of product removed from cart
        eventValue: 0,
        interactionEvent: true,
        gtmUse: true, // gtmUse set to true
        ecommerce: {
          currencyCode: 'USD',
          remove: {
            products: [{
              name: title,
              id: id,
              price: price,
              brand: 'Jet Set Candy',
              category: '',
              variant: '',
              quantity: 0,
              dimension10: false, // upsell
              dimension11: false, // bundle
            }]
          }
        }
      });
    },
  });
}

function onCartUpdate(cart) {
  setTimeout(function (e) {
    if (cart.total_price != 0) {
      $('.class_total').html(theme.Shopify.formatMoney(cart.total_price, theme.money_format));
    } else {
      $('.class_total').html('');
    }
  }, 500)
}

function addToCartOk(product) {
  
  
  
  openCartOverlay();
  fetchCart();
  openCartDrawer()
}

function removeProductFromCart() {
  cartCounter.innerHTML = Number(cartCounter.innerHTML) - 1;
}

function addToCartFail() {
  cartModalContent.innerHTML = 'The product you are trying to add is out of stock.';
  openAddModal();
  openCartOverlay();
}

function has(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}

function renderCart(cart) {
  clearCartDrawer();

  var totalPrice = cart.total_price,
      totalCount = cart.item_count;

  $('#cart-counter, #nav-item-count').text(totalCount);

  

  cart.items.forEach((item, index) => {
    var title = item.title;

    var main_div = '<div class="ajaxcart__product_inner ">';
    main_div += '<div class="cart_product_image"><a href="' + item.url +  '"><img class="ajax-cart-item__image" src="' + item.image + '" ></a></div>';
    main_div += '  <div class="cart_product-info product">';
    main_div += '  <div class="ajaxcart__product-name-wrapper">'
    main_div += '   <div class="middle-col"><a href="' + item.url +  '"><h4 class="cart-title">' + title + '</h4></a>'

    if (!jQuery.isEmptyObject(item.properties)) {
      main_div += '<div class="line_properties">'

      $.each(item.properties, function (key, val) {
        if (val != '' && key.charAt(0) != '_') {
          main_div += `<div class="property"><span class="property_name" data-property-name="${ key }">${ key }:</span><span class="property_value" data-property-value="${ val }">${ val }</span></div>`
        }
      });

      main_div += '</div>'
    }

    main_div += '</div> '
    main_div += '   <h4 class="cart-price">' + theme.Shopify.formatMoney(item.line_price, theme.money_format) + '</h4>'
    main_div += '</div>'
    main_div += '<h4 class="cart-single-price">' +  item.quantity + ' @ ' + theme.Shopify.formatMoney(item.final_price, theme.money_format) + '</h4>'



    main_div += '</div>'
    main_div += '<div class="cart_product-info product quantity">'
    main_div += '</div>'
    main_div += '<div class="ajax-cart-item__quantity" data-item="' + item.quantity + '" data-line="' + Number(index + 1) + '"><span class="js-ajax-minus-cart">-</span>' + item.quantity + '<span class="js-ajax-add-cart">+</span></div><div class="ajax-cart-item__remove ' + defaults.removeFromCartNoDot + '" data-title="' + title + '" data-id="' + item.id + '" data-price="' + item.line_price / 100 + '">Remove</div>'
    
    main_div += '</div>'
    const concatProductInfo = '<div class="ajax-cart-item__single ajaxcart__product" data-line="' + Number(index + 1) + '">' + main_div + '</div>';

    cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + concatProductInfo;
  });

  removeFromCart = document.querySelectorAll(defaults.removeFromCart);

  for (let i = 0; i < removeFromCart.length; i++) {
    removeFromCart[i].addEventListener('click', function () {
      const line = this.previousElementSibling.getAttribute('data-line'),
            title = $(removeFromCart[i]).data('title'),
            id = $(removeFromCart[i]).data('id'),
            price = $(removeFromCart[i]).data('price');

      changeItem(line, '', title, id, price);
    });
  }

  plusFromCart = document.querySelectorAll(defaults.plusFromCart);
  for (let i = 0; i < plusFromCart.length; i++) {
    plusFromCart[i].addEventListener('click', function () {
      const line = this.parentNode.getAttribute('data-line');
      const item = parseInt(this.parentNode.getAttribute('data-item'));
      updateItem(line, item + 1);
    });
  }

  minusFromCart = document.querySelectorAll(defaults.minusFromCart);
  for (let i = 0; i < minusFromCart.length; i++) {
    minusFromCart[i].addEventListener('click', function () {
      const line = this.parentNode.getAttribute('data-line');
      const item = parseInt(this.parentNode.getAttribute('data-item'));

      updateItem(line, item - 1);
    });
  }
}

function openCartDrawer() {
  cartDrawer.classList.add('is-open');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('is-open');
}

function clearCartDrawer() {
  cartDrawerContent.innerHTML = '';
}

function openAddModal() {
  cartModal.classList.add('is-open');
}

function closeAddModal() {
  cartModal.classList.remove('is-open');
}

function openCartOverlay() {
  cartOverlay.classList.add('is-open');
  htmlSelector.classList.add('is-locked');
}

function closeCartOverlay() {
  cartOverlay.classList.remove('is-open');
  htmlSelector.classList.remove('is-locked');
}

cartModalClose.addEventListener('click', function () {
  closeAddModal();
  closeCartOverlay();
});

cartDrawerClose.addEventListener('click', function () {
  closeCartDrawer();
  closeCartOverlay();
});

// cart is empty stanje
cartOverlay.addEventListener('click', function () {
  closeAddModal();
  closeCartDrawer();
  closeCartOverlay();
});

$(document).on('click', '#drawer-opener', function(e) {
  if($(window).width() > 1099) {
    e.preventDefault();
    openCartOverlay();
    fetchCart();
    openCartDrawer();
  }
})

$(document).ready(() => {
  $('body').on('click','#mini-drawer-open', function(event) {
    event.preventDefault();

    $('#added-to-cart').removeClass('reveal').addClass('unreveal');
    fetchCart();
    openCartDrawer()
    openCartOverlay();
  })
})

$('a.site-header__landing-page').click(() => {
  openCartDrawer();
  openCartOverlay();
});

document.addEventListener('DOMContentLoaded', function () {
  fetchCart();
});

$('form.quick-add').on('submit', function (e) {
  e.preventDefault();
  var form = $(this);

  $.ajax({
    type: 'post',
    url: '/cart/add.js',
    data: form.serialize(),
    dataType: 'json',
    success: function () {
      fetchCart();
      setTimeout(function (e) {
        openCartDrawer();
        openCartOverlay();
      }, 800)
    },
    error: (err) => {
      console.log("Error:" + err);
    }
  });
  return false
});

function addOneTimeItemToCart(variant_id, quantity) {
  data = {
    "id": variant_id,
    "quantity": quantity
  }
  $.ajax({
    type: 'post',
    url: '/cart/add.js',
    data: data,
    dataType: 'json',
    success: function () {
      fetchCart();
      setTimeout(function (e) {
        openCartDrawer();
        openCartOverlay();
      }, 800)
    },
    error: (err) => {
      console.log("Error:" + JSON.stringify(err));
    }
  });
}