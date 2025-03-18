let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('handle');
    
    if (productHandle) {
        // Try to load from window.shopifyProducts first
        const product = window.shopifyProducts?.find(p => p.handle === productHandle);
        if (product) {
            displayProduct(product);
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
                    price: currentProduct.variants[0].price,
                    image: currentProduct.image.src,
                    quantity
                });

                // Show notification menu
                const notificationMenu = document.querySelector('.cart-notification-menu');
                const productImage = notificationMenu.querySelector('.cart-notification-menu__product-image');
                const productTitle = notificationMenu.querySelector('.cart-notification-menu__product-title');
                const productPrice = notificationMenu.querySelector('.cart-notification-menu__product-price');
                const closeButton = notificationMenu.querySelector('.cart-notification-menu__close');

                productImage.src = currentProduct.image.src;
                productImage.alt = currentProduct.title;
                productTitle.textContent = currentProduct.title;
                productPrice.textContent = formatPrice(currentProduct.variants[0].price);

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
                    price: currentProduct.variants[0].price,
                    image: currentProduct.image.src,
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

function displayProduct(product) {
    if (!product) {
        showErrorState();
        return;
    }

    currentProduct = product;
    document.title = `${product.title} - Resell Depot`;

    // Update main elements
    const mainImage = document.getElementById('main-image');
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-description');
    const ratingContainer = document.getElementById('product-rating');
    
    if (mainImage && product.image?.src) mainImage.src = product.image.src;
    if (titleElement) titleElement.textContent = product.title;
    if (descriptionElement) descriptionElement.innerHTML = product.body_html || '';

    // Update price
    if (priceElement && product.variants?.[0]) {
        const variant = product.variants[0];
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            priceElement.innerHTML = `
                <span class="price-item price-item--sale">€${variant.price.toFixed(2)}</span>
                <s class="price-item price-item--regular">€${variant.compare_at_price.toFixed(2)}</s>
            `;
        } else {
            priceElement.innerHTML = `<span class="price-item">€${variant.price.toFixed(2)}</span>`;
        }
    }

    // Update rating
    if (ratingContainer) {
        const starRating = ratingContainer.querySelector('.star-rating');
        const ratingCount = ratingContainer.querySelector('.product__rating-count');
        if (starRating) starRating.innerHTML = '★★★★★';
        if (ratingCount) ratingCount.textContent = '(5.0)';
    }

    // Handle variants
    selectedOptions = {};
    const optionsContainer = document.getElementById('product-options');
    
    if (optionsContainer && product.variants && product.variants.length > 1) {
        let optionsHtml = '';
        
        // Handle Option 1
        if (product.option1_name) {
            const option1Values = [...new Set(product.variants.map(v => v.option1_value).filter(Boolean))];
            if (option1Values.length > 0) {
                optionsHtml += `
                    <div class="option-group">
                        <label>${product.option1_name}</label>
                        <div class="option-values">
                            ${option1Values.map(value => `
                                <button class="option-value" data-option="1" data-value="${value}">
                                    ${value}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
                selectedOptions[product.option1_name] = option1Values[0];
            }
        }
        
        // Handle Option 2
        if (product.option2_name) {
            const option2Values = [...new Set(product.variants.map(v => v.option2_value).filter(Boolean))];
            if (option2Values.length > 0) {
                optionsHtml += `
                    <div class="option-group">
                        <label>${product.option2_name}</label>
                        <div class="option-values">
                            ${option2Values.map(value => `
                                <button class="option-value" data-option="2" data-value="${value}">
                                    ${value}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
                selectedOptions[product.option2_name] = option2Values[0];
            }
        }

        if (optionsHtml) {
            optionsContainer.innerHTML = optionsHtml;
            optionsContainer.style.display = 'block';

            // Add click handlers
            const optionButtons = optionsContainer.querySelectorAll('.option-value');
            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const optionNumber = button.dataset.option;
                    const value = button.dataset.value;
                    const optionName = optionNumber === '1' ? product.option1_name : product.option2_name;

                    // Update selection
                    const optionGroup = button.closest('.option-group');
                    optionGroup.querySelectorAll('.option-value').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    button.classList.add('selected');
                    selectedOptions[optionName] = value;

                    // Find matching variant
                    const variant = product.variants.find(v => 
                        (!product.option1_name || v.option1_value === selectedOptions[product.option1_name]) &&
                        (!product.option2_name || v.option2_value === selectedOptions[product.option2_name])
                    );

                    if (variant) {
                        // Update price
                        if (priceElement) {
                            if (variant.compare_at_price && variant.compare_at_price > variant.price) {
                                priceElement.innerHTML = `
                                    <span class="price-item price-item--sale">€${variant.price.toFixed(2)}</span>
                                    <s class="price-item price-item--regular">€${variant.compare_at_price.toFixed(2)}</s>
                                `;
                            } else {
                                priceElement.innerHTML = `<span class="price-item">€${variant.price.toFixed(2)}</span>`;
                            }
                        }

                        // Update image if variant has one
                        if (variant.image && mainImage) {
                            mainImage.src = variant.image;
                        }
                    }
                });
            });

            // Select first options by default
            optionsContainer.querySelectorAll('.option-group').forEach(group => {
                const firstOption = group.querySelector('.option-value');
                if (firstOption) {
                    firstOption.classList.add('selected');
                }
            });
        } else {
            optionsContainer.style.display = 'none';
        }
    } else if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }

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
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
        const rating = product.rating_count ? product.rating_count : 0;
        const ratingStars = Math.round(rating / 5 * 5);
        
        return `
            <div class="bestseller-card">
                <div class="bestseller-card__content">
                    <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" class="bestseller-card__link">
                        <div class="bestseller-card__image">
                            ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
                            <img src="${product.image.src}" alt="${product.title}" loading="lazy">
                        </div>
                        <div class="bestseller-card__info">
                            <h3 class="bestseller-card__title">${product.title}</h3>
                            <div class="bestseller-card__rating">
                                <div class="star-rating">
                                    ${Array(5).fill().map((_, i) => `<span class="star ${i < ratingStars ? 'filled' : ''}">${i < ratingStars ? '★' : '☆'}</span>`).join('')}
                                </div>
                                <span class="bestseller-card__rating-count">(${rating})</span>
                            </div>
                            <div class="bestseller-card__price">
                                ${compareAtPrice ? `<span class="compare-at-price">${compareAtPrice}</span>` : ''}
                                <span class="price">${price}</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Handle card clicks with animation
    const cards = container.getElementsByClassName('bestseller-card');
    Array.from(cards).forEach(card => {
        const link = card.querySelector('.bestseller-card__link');
        if (!link) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.href;
            
            // Add tapped class for animation
            card.classList.add('tapped');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });

    // Handle desktop arrow navigation
    const section = container.closest('.bestsellers');
    const prevButton = section.querySelector('.carousel-control.prev');
    const nextButton = section.querySelector('.carousel-control.next');

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        });

        nextButton.addEventListener('click', () => {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
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
