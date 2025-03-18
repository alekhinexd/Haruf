let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('handle');
    
    if (productHandle) {
        // Try to load from window.shopifyProducts first
        const products = window.shopifyProducts || [];
        const variants = products.filter(p => p.handle === productHandle);
        if (variants.length > 0) {
            // Use the first variant as the base product
            const baseProduct = variants[0];
            displayProduct(baseProduct);
        } else {
            // Fallback to API if not found in window
            loadProductFromAPI(productHandle);
        }
    } else {
        showErrorState('No product selected');
    }

    // Add to Cart Button
    const addToCartButton = document.getElementById('add-to-cart');
    const quantityInput = document.getElementById('quantity');
    const minusButton = document.querySelector('.quantity-btn.minus');
    const plusButton = document.querySelector('.quantity-btn.plus');

    if (addToCartButton) {
        // Clear any existing event listeners
        const newAddToCartButton = addToCartButton.cloneNode(true);
        addToCartButton.parentNode.replaceChild(newAddToCartButton, addToCartButton);
        
        newAddToCartButton.style.display = 'block';
        newAddToCartButton.style.border = '2px solid #000000';
        newAddToCartButton.style.color = '#000000';
        newAddToCartButton.style.backgroundColor = 'transparent';
        newAddToCartButton.style.transition = 'all 0.3s ease';
        
        newAddToCartButton.addEventListener('mouseover', () => {
            newAddToCartButton.style.backgroundColor = '#333333';
            newAddToCartButton.style.color = '#ffffff';
        });
        
        newAddToCartButton.addEventListener('mouseout', () => {
            newAddToCartButton.style.backgroundColor = 'transparent';
            newAddToCartButton.style.color = '#000000';
        });

        // Add to cart functionality
        newAddToCartButton.addEventListener('click', () => {
            if (currentProduct) {
                const quantity = parseInt(quantityInput.value) || 1;
                window.addToCart({
                    handle: currentProduct.handle,
                    title: currentProduct.title,
                    price: currentProduct.price,
                    image: currentProduct.image,
                    quantity
                });

                // Show notification menu
                const notificationMenu = document.querySelector('.cart-notification-menu');
                const productImage = notificationMenu.querySelector('.cart-notification-menu__product-image');
                const productTitle = notificationMenu.querySelector('.cart-notification-menu__product-title');
                const productPrice = notificationMenu.querySelector('.cart-notification-menu__product-price');
                const closeButton = notificationMenu.querySelector('.cart-notification-menu__close');

                productImage.src = currentProduct.image;
                productImage.alt = currentProduct.title;
                productTitle.textContent = currentProduct.title;
                productPrice.textContent = formatPrice(currentProduct.price);

                notificationMenu.classList.add('visible');

                // Close notification on X button click
                closeButton.addEventListener('click', () => {
                    notificationMenu.classList.remove('visible');
                });

                // Show feedback with black color scheme
                const originalText = newAddToCartButton.textContent;
                newAddToCartButton.textContent = 'Added to Cart!';
                newAddToCartButton.style.backgroundColor = '#000000';
                newAddToCartButton.style.color = '#ffffff';
                
                setTimeout(() => {
                    newAddToCartButton.textContent = originalText;
                    newAddToCartButton.style.backgroundColor = 'transparent';
                    newAddToCartButton.style.color = '#000000';
                }, 2000);
            }
        });
    }

    // Quantity Controls with black color scheme
    if (minusButton && plusButton && quantityInput) {
        minusButton.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusButton.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue < 99) {
                quantityInput.value = currentValue + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value) || 1;
            value = Math.max(1, Math.min(99, value));
            quantityInput.value = value;
        });

        // Style quantity controls
        [minusButton, plusButton].forEach(button => {
            button.style.border = '1px solid #000000';
            button.style.color = '#000000';
            button.style.backgroundColor = 'transparent';
            button.style.transition = 'all 0.3s ease';
            
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#f0f0f0';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'transparent';
            });
        });
        
        quantityInput.style.border = '1px solid #000000';
        quantityInput.style.color = '#000000';
    }

    // Collapsible Tabs with black color scheme
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const content = button.nextElementSibling;
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                button.style.backgroundColor = 'transparent';
            } else {
                content.classList.add('active');
                button.style.backgroundColor = '#f0f0f0';
            }
        });

        // Style collapsible buttons
        button.style.color = '#000000';
        button.style.borderColor = '#000000';
        button.style.transition = 'all 0.3s ease';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#f0f0f0';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'transparent';
        });
    });

    // Checkout button functionality for Product Detail Page
    const checkoutButton = document.getElementById('checkout-button');

    if (checkoutButton) {
        // Style checkout button with black theme
        checkoutButton.style.backgroundColor = '#000000';
        checkoutButton.style.color = '#ffffff';
        checkoutButton.style.border = 'none';
        checkoutButton.style.width = '100%';
        checkoutButton.style.padding = '15px';
        checkoutButton.style.fontSize = '16px';
        checkoutButton.style.fontWeight = 'bold';
        checkoutButton.style.cursor = 'pointer';
        checkoutButton.style.transition = 'all 0.3s ease';
        
        checkoutButton.addEventListener('mouseover', () => {
            checkoutButton.style.backgroundColor = '#333333';
        });
        
        checkoutButton.addEventListener('mouseout', () => {
            checkoutButton.style.backgroundColor = '#000000';
        });

        checkoutButton.addEventListener('click', () => {
            if (!currentProduct) {
                alert('Product not found');
                return;
            }

            // Add to cart first without showing notification
            const quantity = parseInt(document.getElementById('quantity')?.value || '1');
            
            // Add item directly to cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.handle === currentProduct.handle);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    handle: currentProduct.handle,
                    title: currentProduct.title,
                    price: currentProduct.price,
                    image: currentProduct.image,
                    quantity
                });
            }
            
            // Save cart and update UI
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count before redirecting
            const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count');
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElements.forEach(element => {
                element.textContent = totalItems.toString();
            });
            
            // Use setTimeout to ensure cart is saved before redirect
            setTimeout(() => {
                window.location.href = '/pages/checkout.html';
            }, 50);
        });
    }
});

let selectedOptions = {};

function getProductOptions(product) {
    const products = window.shopifyProducts || [];
    const variants = products.filter(p => p.handle === product.handle);
    const options = [];
    
    // Get all possible option names from variants
    for (let i = 1; i <= 3; i++) {
        const nameKey = `Option${i} Name`;
        const valueKey = `Option${i} Value`;
        const name = variants[0][nameKey];
        if (name) {
            const values = [...new Set(variants.map(v => v[valueKey]))];
            if (values.length > 0) {
                options.push({ name, values });
            }
        }
    }
    return options;
}

function renderProductOptions(product) {
    const optionsContainer = document.getElementById('product-options');
    if (!optionsContainer) return;

    const options = getProductOptions(product);
    if (options.length === 0) {
        optionsContainer.style.display = 'none';
        return;
    }

    optionsContainer.innerHTML = options.map(option => `
        <div class="option-group" data-option="${option.name.toLowerCase()}">
            <label class="option-group__label">${option.name}</label>
            <div class="option-group__values">
                ${option.values.map(value => {
                    const isColor = option.name.toLowerCase().includes('color');
                    if (isColor) {
                        const variantWithImage = findVariantWithColorImage(product.handle, value);
                        const style = variantWithImage ? 
                            `background-image: url('${variantWithImage['Variant Image']}')` :
                            `background-color: ${value.toLowerCase()}`;
                        return `
                            <div class="option-value option-value--color" 
                                data-value="${value}"
                                style="${style}"
                                title="${value}">
                            </div>`;
                    }
                    return `
                        <div class="option-value" data-value="${value}">
                            ${value}
                        </div>`;
                }).join('')}
            </div>
        </div>
    `).join('');

    // Set initial selected options
    options.forEach(option => {
        const firstValue = option.values[0];
        selectedOptions[option.name] = firstValue;
        const firstOption = optionsContainer.querySelector(
            `.option-group[data-option="${option.name.toLowerCase()}"] .option-value[data-value="${firstValue}"]`
        );
        if (firstOption) {
            firstOption.classList.add('selected');
        }
    });

    // Add click handlers
    optionsContainer.addEventListener('click', (e) => {
        const optionValue = e.target.closest('.option-value');
        if (!optionValue) return;

        const optionGroup = optionValue.closest('.option-group');
        const optionName = optionGroup.dataset.option;

        // Update selection
        optionGroup.querySelectorAll('.option-value').forEach(el => {
            el.classList.remove('selected');
        });
        optionValue.classList.add('selected');
        selectedOptions[optionName] = optionValue.dataset.value;

        // Update product image if it's a color option
        if (optionName.toLowerCase().includes('color')) {
            const variantWithImage = findVariantWithColorImage(product.handle, optionValue.dataset.value);
            if (variantWithImage && variantWithImage['Variant Image']) {
                document.getElementById('main-image').src = variantWithImage['Variant Image'];
            }
        }
    });
}

function findVariantWithColorImage(handle, colorValue) {
    const products = window.shopifyProducts || [];
    return products.find(p => 
        p.handle === handle && 
        (p['Option1 Value'] === colorValue || p['Option2 Value'] === colorValue || p['Option3 Value'] === colorValue)
    );
}

// Update addToCart to include selected options
function addToCart(product) {
    const quantity = parseInt(document.getElementById('quantity')?.value || '1');
    const options = Object.entries(selectedOptions).map(([name, value]) => ({
        name,
        value
    }));

    // Find the specific variant that matches all selected options
    const products = window.shopifyProducts || [];
    const matchingVariant = products.find(p => 
        p.handle === product.handle &&
        Object.entries(selectedOptions).every(([name, value]) => {
            return ['Option1', 'Option2', 'Option3'].some(prefix => 
                p[`${prefix} Name`] === name && p[`${prefix} Value`] === value
            );
        })
    );

    window.addToCart({
        handle: product.handle,
        title: product.title,
        price: matchingVariant ? matchingVariant.price : product.price,
        image: matchingVariant && matchingVariant.image ? matchingVariant.image : product.image,
        quantity: quantity,
        options: options
    });
}

function displayProduct(product) {
    currentProduct = product;
    document.title = `${product.title} - Resell Depot`;
    
    // Update main elements
    const mainImage = document.getElementById('main-image');
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-description');
    
    if (mainImage) mainImage.src = product.image;
    if (titleElement) titleElement.textContent = product.title;
    if (priceElement) priceElement.textContent = formatPrice(product.price);
    if (descriptionElement) descriptionElement.innerHTML = product.body_html;

    // Add rating if product has reviews
    if (product.rating_count) {
        const ratingElement = document.getElementById('product-rating');
        if (ratingElement) {
            const starRating = ratingElement.querySelector('.star-rating');
            const ratingCount = ratingElement.querySelector('.product__rating-count');
            
            // Generate 5 filled stars for all products with reviews
            starRating.innerHTML = Array(5).fill('★').join('');
            ratingCount.textContent = `${product.rating_count} reviews`;
            
            // Make rating clickable to scroll to reviews
            ratingElement.style.display = 'flex';
            ratingElement.style.cursor = 'pointer';
            ratingElement.onclick = () => {
                const reviewsSection = document.getElementById('reviews-container');
                if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }
    }

    // Initialize quantity controls
    initializeQuantityControls();

    // Render product options
    renderProductOptions(product);

    // Load and display related products
    loadRelatedProducts();
}

async function loadRelatedProducts() {
    try {
        const products = window.shopifyProducts || [];
        const bestsellers = products
            .filter(product => !product.title.toLowerCase().includes('bundle'))
            .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
            .slice(0, 12);
        displayRelatedProducts(bestsellers);
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('related-products-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product;
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
        const discountPercent = hasDiscount ? Math.round((1 - variant.price / variant.compare_at_price) * 100) : 0;

        return `
            <div class="bestseller-card">
                <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" class="bestseller-card__link">
                    <div class="bestseller-card__image">
                        ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="bestseller-card__info">
                        <h3 class="bestseller-card__title">${product.title}</h3>
                        <div class="bestseller-card__price">
                            ${hasDiscount ? `
                                <span class="price-item price-item--sale">${price}</span>
                                <s class="price-item price-item--regular">${compareAtPrice}</s>
                                <span class="price-item__badge">-${discountPercent}%</span>
                            ` : `
                                <span class="price-item">${price}</span>
                            `}
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Add click handlers for product cards
    const productCards = container.querySelectorAll('.bestseller-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Add tap animation
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

async function loadProductFromAPI(handle) {
    try {
        const response = await fetch(`/api/products/${handle}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showErrorState('Product not found');
    }
}

function showErrorState(message = 'Product not found') {
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-description');
    const mainImage = document.getElementById('main-image');
    const addToCartBtn = document.getElementById('add-to-cart');

    if (titleElement) {
        titleElement.textContent = message;
        titleElement.style.color = '#000000';
    }

    if (priceElement) {
        priceElement.textContent = '';
    }

    if (descriptionElement) {
        descriptionElement.innerHTML = 'Sorry, we couldn\'t find the product you\'re looking for.';
        descriptionElement.style.color = '#000000';
    }

    if (mainImage) {
        mainImage.src = '';
        mainImage.alt = message;
    }

    if (addToCartBtn) {
        addToCartBtn.style.display = 'none';
    }
}

function initializeQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue < 99) {
                quantityInput.value = currentValue + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value) || 1;
            value = Math.max(1, Math.min(99, value));
            quantityInput.value = value;
        });
    }
}

function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price).replace('€', '') + '€';
}

function fetchProducts() {
    // Implement logic to fetch products from API or database
    // For demonstration purposes, return a sample array of products
    return Promise.resolve([
        {
            id: 1,
            title: 'Product 1',
            image: 'https://example.com/product1.jpg',
            price: 19.99,
            compareAtPrice: 24.99,
            rating: 4.5,
            reviewCount: 100
        },
        {
            id: 2,
            title: 'Product 2',
            image: 'https://example.com/product2.jpg',
            price: 9.99,
            compareAtPrice: null,
            rating: 4.2,
            reviewCount: 50
        },
        // Add more products to the array...
    ]);
}

function generateStarRating(rating) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars.push('<span class="star">★</span>');
        } else {
            stars.push('<span class="star">☆</span>');
        }
    }
    return stars.join('');
}
