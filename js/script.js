// --- 0. PRODUCT DATABASE ---
// This acts as our backend data source. Every product lives here.
const productDatabase = [
    { 
        id: "croissant", 
        name: "Classic Butter Croissant", 
        price: 150, 
        image: "assets/croissant.jpg", 
        description: "Flaky, buttery, and baked fresh every morning. A true Parisian classic."
    },
    { 
        id: "tart", 
        name: "Raspberry Fruit Tart", 
        price: 220, 
        image: "assets/tart.jpg", 
        description: "A crisp vanilla pastry shell filled with rich custard and topped with fresh raspberries."
    },
    { 
        id: "truffle", 
        name: "Dark Chocolate Truffle", 
        price: 180, 
        image: "assets/cake.jpg", 
        description: "Decadent dark chocolate ganache dusted with premium cocoa powder."
    }
    // You can add as many products as you want here later!
];

// --- 1. MOBILE MENU ---
const hamburger = document.querySelector('.hamburger-menu');
const nav = document.querySelector('.nav-links');

if (hamburger && nav) {
    const spans = hamburger.querySelectorAll('span');
    if(spans.length === 3) {
        spans[0].classList.add('line1');
        spans[1].classList.add('line2');
        spans[2].classList.add('line3');
    }
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });
}
// --- 2. GLOBAL CART SETUP & AUTO-CLEANER ---
let cart = JSON.parse(localStorage.getItem('lumiereCart')) || [];

cart = cart.filter(item => item && item.name && typeof item.price === 'number' && !isNaN(item.price));

// Make sure every item has a quantity value
cart.forEach(item => {
    if (!item.quantity) item.quantity = 1;
});
localStorage.setItem('lumiereCart', JSON.stringify(cart));

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        // THE FIX: Add up the total quantity of items, not just the rows
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += item.quantity;
        });
        cartCountElement.innerText = totalItems;
    }
}
updateCartCount();

// --- 3. CUSTOM POP-UP FUNCTION (PROFESSIONAL MODAL) ---
function showCustomPopup(title, message, redirectUrl = null) {
    // Build the HTML for the pop-up using JavaScript
    const overlay = document.createElement('div');
    overlay.classList.add('custom-modal-overlay');

    const box = document.createElement('div');
    box.classList.add('custom-modal-box');

    box.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="btn-primary" id="close-modal-btn">Got it</button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Trigger the CSS fade-in animation
    setTimeout(() => overlay.classList.add('show'), 10);

    // Make the Close button work
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        overlay.classList.remove('show'); // Fade out
        setTimeout(() => {
            overlay.remove(); // Delete from HTML
            // If we provided a URL, send the user there after closing!
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300); // Wait for the animation to finish
    });
}
// --- 4. BUTTON LISTENERS (ADD TO CART & BUY NOW) ---
function attachCartListeners() {
    // 1. Add to Cart Logic
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        if (button.dataset.listenerAttached) return;
        button.dataset.listenerAttached = "true";

        button.addEventListener('click', (e) => {
            e.preventDefault(); // Stops the page from jumping
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            let quantity = 1; 
            
            const qtyInput = document.getElementById('product-quantity');
            if (qtyInput) quantity = parseInt(qtyInput.value);

            if (productName && !isNaN(productPrice)) {
                const existingItem = cart.find(item => item.name === productName);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ name: productName, price: productPrice, quantity: quantity });
                }
                
                localStorage.setItem('lumiereCart', JSON.stringify(cart));
                updateCartCount();

                // BULLETPROOF COLOR CHANGE (Using Exact Gold Hex Code)
                button.innerText = "ADDED!";
                button.style.backgroundColor = "#C49A45"; 
                button.style.color = "#ffffff";
                button.style.borderColor = "#C49A45";
                
                setTimeout(() => {
                    button.innerText = "ADD TO CART";
                    button.style.backgroundColor = "";
                    button.style.color = "";
                    button.style.borderColor = "";
                }, 1500);
            }
        }); 
    });

    // 2. Buy Now Logic
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    buyNowButtons.forEach(button => {
        if (button.dataset.listenerAttached) return;
        button.dataset.listenerAttached = "true";

        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            let quantity = 1;
            
            const qtyInput = document.getElementById('product-quantity');
            if (qtyInput) quantity = parseInt(qtyInput.value);

            if (productName && !isNaN(productPrice)) {
                const existingItem = cart.find(item => item.name === productName);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ name: productName, price: productPrice, quantity: quantity });
                }
                localStorage.setItem('lumiereCart', JSON.stringify(cart));
                updateCartCount();
                
                window.location.href = 'checkout.html';
            }
        }); 
    });
}
// --- 5. RENDER CART PAGE ---
const cartItemsContainer = document.getElementById('cart-items-container');

function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is currently empty. Head to the menu to add some pastries!</p>';
        document.getElementById('cart-subtotal').innerText = `₹0.00`;
        document.getElementById('cart-taxes').innerText = `₹0.00`;
        document.getElementById('cart-total').innerText = `₹0.00`;
        return;
    } 
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        
        // UPGRADED HTML: Added professional + and - buttons
        itemDiv.innerHTML = `
            <div class="cart-item-details" style="flex: 1;">
                <h4 style="margin-bottom: 8px;">${item.name}</h4>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                        <button class="qty-btn minus-btn" data-index="${index}" style="background: #f9f9f9; border: none; padding: 5px 12px; cursor: pointer; font-size: 1.2rem; color: #333;">-</button>
                        <span style="padding: 0 12px; font-weight: bold; color: #C49A45;">${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-index="${index}" style="background: #f9f9f9; border: none; padding: 5px 12px; cursor: pointer; font-size: 1.2rem; color: #333;">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}" style="background: none; border: none; color: #888; text-decoration: underline; cursor: pointer; font-size: 0.85rem;">Remove All</button>
                </div>
            </div>
            <div class="cart-item-price" style="font-weight: bold; font-size: 1.1rem;">₹${itemTotal.toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    const taxes = subtotal * 0.05;
    const total = subtotal + taxes;

    document.getElementById('cart-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-taxes').innerText = `₹${taxes.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `₹${total.toFixed(2)}`;

    // EVENT LISTENER: Plus Button (Increases quantity)
    const plusButtons = document.querySelectorAll('.plus-btn');
    plusButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemIndex = parseInt(event.target.getAttribute('data-index'));
            cart[itemIndex].quantity += 1;
            localStorage.setItem('lumiereCart', JSON.stringify(cart));
            updateCartCount();
            renderCart(); // Instantly redraws the screen with the new math!
        });
    });

    // EVENT LISTENER: Minus Button (Decreases quantity)
    const minusButtons = document.querySelectorAll('.minus-btn');
    minusButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemIndex = parseInt(event.target.getAttribute('data-index'));
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1; // Subtract 1
            } else {
                cart.splice(itemIndex, 1); // If they subtract past 1, delete it completely
            }
            localStorage.setItem('lumiereCart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        });
    });

    // EVENT LISTENER: Remove All Button (Deletes the whole row)
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemIndex = parseInt(event.target.getAttribute('data-index'));
            cart.splice(itemIndex, 1);
            localStorage.setItem('lumiereCart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        });
    });
}

// --- 6. PAGE INITIALIZERS & UPDATED CHECKOUT LOGIC ---
if (cartItemsContainer) {
    renderCart();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                // USING THE NEW CUSTOM POP-UP!
                showCustomPopup("Wait a minute!", "Your cart is empty. Please add some premium pastries before proceeding to checkout.");
            }
        });
    }
}

const checkoutForm = document.getElementById('final-checkout-form');
const checkoutItemsList = document.getElementById('checkout-items-list');

if (checkoutForm && checkoutItemsList) {
    function renderCheckoutSummary() {
        checkoutItemsList.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            window.location.href = 'menu.html';
            return;
        }

        cart.forEach(item => {
            subtotal += item.price;
            checkoutItemsList.innerHTML += `
                <div class="checkout-mini-item">
                    <span>${item.name}</span>
                    <span style="color: var(--clr-gold); font-weight: bold;">₹${item.price.toFixed(2)}</span>
                </div>
            `;
        });

        const total = subtotal * 1.05;
        document.getElementById('checkout-final-total').innerText = `₹${total.toFixed(2)}`;
    }

    renderCheckoutSummary();

    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const customerName = document.getElementById('fname').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Empty the cart
        cart = [];
        localStorage.setItem('lumiereCart', JSON.stringify(cart));
        updateCartCount();
        
        // USING THE NEW CUSTOM POP-UP! (It redirects to index.html after they click OK)
        showCustomPopup(
            "Order Successful!", 
            `Thank you, ${customerName}. Your order is being prepared. You have selected ${paymentMethod.toUpperCase()} as your payment method.`, 
            "index.html"
        );
    });
}
// --- 8. DYNAMIC MENU & SEARCH BAR ---

const dynamicMenuGrid = document.getElementById('dynamic-menu-grid') || document.querySelector('.featured-grid');
const searchInput = document.getElementById('search-input');

if (dynamicMenuGrid) {
    // Function to draw products to the screen
    function renderProducts(productsToDisplay) {
        dynamicMenuGrid.innerHTML = ''; // Clear the grid first

        if (productsToDisplay.length === 0) {
            dynamicMenuGrid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1;">No pastries found matching your search.</p>';
            return;
        }

        // Loop through our database and create the HTML cards
        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('menu-card');
            
            // This is the updated HTML that fixes the buttons and makes the image clickable!
            card.innerHTML = `
                <a href="product.html?id=${product.id}" style="text-decoration: none; display: block; width: 100%;">
                    <div class="card-image" style="background-image: url('${product.image}'); cursor: pointer;"></div>
                </a>
                
                <div class="card-content">
                    <a href="product.html?id=${product.id}" style="text-decoration: none;">
                        <h3>${product.name}</h3>
                        <p class="price">₹${product.price}</p>
                    </a>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button class="btn-secondary add-to-cart-btn" data-name="${product.name}" data-price="${product.price}">ADD TO CART</button>
                        <button class="btn-primary buy-now-btn" data-name="${product.name}" data-price="${product.price}">BUY NOW</button>
                    </div>
                </div>
            `;
            dynamicMenuGrid.appendChild(card);
        });

        // Re-attach the event listeners for the new "Add to Cart" and "Buy Now" buttons
        attachCartListeners(); 
    }

    // 1. Render all products when the page first loads
    renderProducts(productDatabase);

    // 2. The Search Engine Logic
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            const searchString = event.target.value.toLowerCase();
            
            // Filter the database based on what the user typed
            const filteredProducts = productDatabase.filter(product => {
                return product.name.toLowerCase().includes(searchString) || 
                       product.description.toLowerCase().includes(searchString);
            });
            
            // Re-draw the screen with only the filtered items!
            renderProducts(filteredProducts);
        });
    }
}

// --- 9. DYNAMIC PRODUCT DETAILS PAGE ---
// This checks the URL for something like "?id=croissant"
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// If we are on the product page and there is an ID in the URL
if (document.getElementById('detail-name') && productId) {
    // Search our database for the matching product
    const product = productDatabase.find(p => p.id === productId);

    if (product) {
        // Inject the data into the HTML!
        document.getElementById('detail-image').src = product.image;
        document.getElementById('detail-name').innerText = product.name;
        document.getElementById('detail-price').innerText = `₹${product.price}`;
        document.getElementById('detail-description').innerText = product.description;

        // Update the hidden data attributes on our buttons so they add the right item
        const addBtn = document.getElementById('detail-add-btn');
        const buyBtn = document.getElementById('detail-buy-btn');
        
        addBtn.setAttribute('data-name', product.name);
        addBtn.setAttribute('data-price', product.price);
        buyBtn.setAttribute('data-name', product.name);
        buyBtn.setAttribute('data-price', product.price);

        // Turn the buttons on!
        attachCartListeners();
    } else {
        // Fallback if the URL id doesn't exist
        document.getElementById('detail-name').innerText = "Product Not Found";
        document.getElementById('detail-description').innerText = "Sorry, we couldn't find this pastry.";
        document.querySelector('.product-actions').style.display = 'none';
        document.querySelector('.quantity-selector').style.display = 'none';
    }
}
// --- 10. INTERACTIVE REVIEWS LOGIC ---

const reviewForm = document.getElementById('review-submit-form');
const reviewsList = document.getElementById('dynamic-reviews-list');

// FIXED TYPO: Changed pId to productId here
if (reviewForm && productId) {
    // 1. Load existing reviews for THIS specific product
    let allReviews = JSON.parse(localStorage.getItem('lumiereReviews')) || {};
    
    // FIXED TYPO: Changed pId to productId here too
    let currentProductReviews = allReviews[productId] || [];

    function renderReviews() {
        reviewsList.innerHTML = '';
        if (currentProductReviews.length === 0) {
            reviewsList.innerHTML = '<p style="text-align:center; opacity:0.6;">No reviews yet. Be the first to try it!</p>';
            return;
        }

        currentProductReviews.forEach(rev => {
            const div = document.createElement('div');
            div.classList.add('review-card');
            div.innerHTML = `
                <div class="stars">${"★".repeat(rev.rating)}${"☆".repeat(5 - rev.rating)}</div>
                <p>"${rev.text}"</p>
                <span class="reviewer-name">- ${rev.name}</span>
            `;
            reviewsList.prepend(div); // Newest reviews at the top
        });
    }

    renderReviews();

    // 2. Handle new review submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newReview = {
            name: document.getElementById('review-name').value,
            rating: parseInt(document.getElementById('review-rating').value),
            text: document.getElementById('review-text').value,
            date: new Date().toLocaleDateString()
        };

        // Add to the local list and global storage
        currentProductReviews.push(newReview);
        
        // FIXED TYPO: Changed pId to productId here too
        allReviews[productId] = currentProductReviews;
        localStorage.setItem('lumiereReviews', JSON.stringify(allReviews));

        // Refresh UI and clear form
        renderReviews();
        reviewForm.reset();
        showCustomPopup("Review Posted!", "Thank you for sharing your experience with us.");
    });
}

// --- 11. CONTACT FORM ENHANCEMENT ---
const finalContactForm = document.getElementById('contact-us-form');
if (finalContactForm) {
    finalContactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = document.getElementById('con-name').value;
        
        // Use our premium pop-up instead of a basic alert
        showCustomPopup(
            "Message Sent!", 
            `Thank you, ${userName}. We have received your inquiry and our team will get back to you within 24 hours.`, 
            "index.html"
        );
        
        finalContactForm.reset();
    });
}
// ACTIVATE BUTTONS ON HARDCODED PAGES (LIKE THE HOME PAGE)
attachCartListeners();
