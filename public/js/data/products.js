// Product data from your successful Shopify store - maintaining exact functionality
const products = new Map();

// Function to fetch products - maintaining exact Shopify functionality
async function fetchProducts() {
    try {
        const response = await fetch('/products.csv');
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            if (!row.Handle || !row.Title) continue;
            
            const variant = {
                option1_name: row['Option1 Name'] || null,
                option1_value: row['Option1 Value'] || null,
                option2_name: row['Option2 Name'] || null,
                option2_value: row['Option2 Value'] || null,
                price: parseFloat(row['Variant Price']) || 0,
                compare_at_price: parseFloat(row['Variant Compare At Price']) || 0,
                inventory_quantity: parseInt(row['Variant Inventory Qty']) || 0,
                requires_shipping: row['Variant Requires Shipping'] === 'true',
                taxable: row['Variant Taxable'] === 'true',
                image: row['Image Src'] || null
            };
            
            if (products.has(row.Handle)) {
                // Add variant to existing product
                const product = products.get(row.Handle);
                product.variants.push(variant);
                
                // Update product's option names if not set
                if (variant.option1_name && !product.option1_name) {
                    product.option1_name = variant.option1_name;
                }
                if (variant.option2_name && !product.option2_name) {
                    product.option2_name = variant.option2_name;
                }
                
                // Update product image if not set
                if (!product.image.src && variant.image) {
                    product.image.src = variant.image;
                }
            } else {
                // Create new product
                products.set(row.Handle, {
                    handle: row.Handle,
                    title: row.Title,
                    body_html: row['Body (HTML)'],
                    vendor: row.Vendor,
                    product_category: row['Product Category'],
                    published: row.Published === 'true',
                    option1_name: variant.option1_name,
                    option2_name: variant.option2_name,
                    variants: [variant],
                    image: {
                        src: variant.image || ''
                    }
                });
            }
        }
        
        // Convert Map to Array
        window.shopifyProducts = Array.from(products.values());
        
        // Separate bundles and regular products
        const bundles = window.shopifyProducts.filter(product => {
            const title = product.title.toLowerCase();
            return (
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        const regularProducts = window.shopifyProducts.filter(product => {
            const title = product.title.toLowerCase();
            return !(
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        
        // Display regular products first, then bundles
        displayProducts([...regularProducts, ...bundles]);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const isOnSale = compareAtPrice && variant.compare_at_price > variant.price;

        return `
            <div class="product-card" style="width: 280px; background: white; margin: 10px; transition: transform 0.2s, box-shadow 0.2s;">
                <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image-container" style="position: relative; padding: 20px;">
                        <img src="${product.image.src}" alt="${product.title}" loading="lazy" style="width: 100%; height: auto; display: block;">
                        ${isOnSale ? '<span class="sale-badge" style="position: absolute; top: 10px; right: 10px; background: #ff0000; color: white; padding: 5px 10px; border-radius: 3px;">Sale</span>' : ''}
                    </div>
                    <div class="product-info" style="padding: 15px;">
                        <h3 style="margin: 0 0 10px; font-size: 1rem; color: #333;">${product.title}</h3>
                        <div class="price-container" style="display: flex; align-items: center; gap: 10px;">
                            <span class="current-price" style="font-weight: bold; color: ${isOnSale ? '#ff0000' : '#333'};">${price}</span>
                            ${compareAtPrice ? `<span class="compare-price" style="text-decoration: line-through; color: #999;">${compareAtPrice}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Add hover effect
    const cards = container.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

function formatPrice(price) {
    return '€' + parseFloat(price).toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

// Make products available in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products };
} else {
    window.shopifyProducts = products;
}
