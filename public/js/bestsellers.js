// Function to display bestsellers
function displayBestsellers(products) {
    const container = document.querySelector('#bestsellers-container');
    if (!container) return;

    const productsContainer = container.querySelector('.products-container');
    if (!productsContainer) return;

    productsContainer.innerHTML = products.map(product => {
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

    // Add touch event listeners for mobile scrolling
    let startX;
    let startScrollLeft;
    let isDragging = false;

    function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches[0].pageX;
        startScrollLeft = productsContainer.scrollLeft;
        productsContainer.style.scrollBehavior = 'auto';
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        const x = e.touches[0].pageX;
        const walk = startX - x;
        productsContainer.scrollLeft = startScrollLeft + walk;
    }

    function handleTouchEnd() {
        isDragging = false;
        productsContainer.style.scrollBehavior = 'smooth';
    }

    productsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    productsContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    productsContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    productsContainer.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Handle desktop arrow navigation
    const prevButton = container.querySelector('.prev');
    const nextButton = container.querySelector('.next');
    
    if (prevButton && nextButton) {
        const scrollAmount = 300;

        prevButton.addEventListener('click', () => {
            productsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextButton.addEventListener('click', () => {
            productsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Show/hide arrows based on screen size
        const updateArrowVisibility = () => {
            const isMobile = window.innerWidth <= 768;
            prevButton.style.display = isMobile ? 'none' : 'flex';
            nextButton.style.display = isMobile ? 'none' : 'flex';
        };

        // Update on load and resize
        updateArrowVisibility();
        window.addEventListener('resize', updateArrowVisibility);
    }

    // Add hover effects
    const cards = productsContainer.querySelectorAll('.bestseller-card');
    cards.forEach(card => {
        const viewDetails = card.querySelector('.view-details');
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            if (viewDetails) {
                viewDetails.style.color = '#333333';
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
            if (viewDetails) {
                viewDetails.style.color = '#666';
            }
        });
    });
}

// Load bestsellers on page load
async function loadBestsellers() {
    try {
        const products = window.shopifyProducts || [];
        const bestsellers = products
            .filter(product => !product.title.toLowerCase().includes('bundle'))
            .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
            .slice(0, 12);
        displayBestsellers(bestsellers);
    } catch (error) {
        console.error('Error loading bestsellers:', error);
    }
}

// Format price to currency
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price).replace('€', '') + '€';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', loadBestsellers);
