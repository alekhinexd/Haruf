// Load footer component
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        // Create footer HTML
        const footerHTML = `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>About Us</h3>
                        <p>Resell Depot - Your trusted source for digital products.</p>
                    </div>
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/pages/products.html">Products</a></li>
                            <li><a href="/pages/contact.html">Contact</a></li>
                            <li><a href="/pages/newsletter.html">Newsletter</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Contact</h3>
                        <p>Email: support@reselldepot.com</p>
                        <p>Need help? Contact our support team.</p>
                    </div>
                    <div class="footer-section">
                        <h3>Payment Methods</h3>
                        <div class="payment-methods">
                            <div class="payment-icon">
                                <i class="fab fa-cc-visa"></i>
                            </div>
                            <div class="payment-icon">
                                <i class="fab fa-cc-mastercard"></i>
                            </div>
                            <div class="payment-icon">
                                <i class="fab fa-cc-amex"></i>
                            </div>
                            <div class="payment-icon">
                                <i class="fab fa-cc-apple-pay"></i>
                            </div>
                            <div class="payment-icon">
                                <i class="fab fa-google-pay"></i>
                            </div>
                            <div class="payment-icon">
                                <i class="fab fa-klarna"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="footer-policies">
                        <a href="/pages/terms-of-service.html" class="policy-link">Terms of Service</a>
                        <span class="policy-separator">|</span>
                        <a href="/pages/privacy-policy.html" class="policy-link">Privacy Policy</a>
                        <span class="policy-separator">|</span>
                        <a href="/pages/refund-policy.html" class="policy-link">Refund Policy</a>
                        <span class="policy-separator">|</span>
                        <a href="/pages/legal-notice.html" class="policy-link">Legal Notice</a>
                    </div>
                    <p>&copy; ${new Date().getFullYear()} Resell Depot. All rights reserved.</p>
                </div>
            </footer>
        `;

        // Add footer styles
        const footerStyles = `
            <style>
                .footer {
                    background-color: #1a1a1a;
                    color: #ffffff;
                    padding: 40px 20px 20px;
                    margin-top: 60px;
                }

                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 40px;
                    margin-bottom: 40px;
                }

                .footer-section h3 {
                    color: #ffffff;
                    margin-bottom: 20px;
                    font-size: 1.2em;
                }

                .footer-section ul {
                    list-style: none;
                    padding: 0;
                }

                .footer-section ul li {
                    margin-bottom: 10px;
                }

                .footer-section a {
                    color: #ffffff;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-section a:hover {
                    color: #007bff;
                }

                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-top: 20px;
                    border-top: 1px solid #333;
                    text-align: center;
                    font-size: 0.9em;
                    color: #888;
                }

                .footer-policies {
                    margin-bottom: 15px;
                }

                .policy-link {
                    color: #888;
                    text-decoration: underline;
                    transition: color 0.3s ease;
                    font-size: 0.85em;
                }

                .policy-link:hover {
                    color: #ffffff;
                }

                .policy-separator {
                    margin: 0 10px;
                    color: #555;
                }

                @media (max-width: 768px) {
                    .footer-content {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }

                    .footer-section {
                        margin-bottom: 30px;
                    }

                    .footer-policies {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }

                    .policy-separator {
                        display: none;
                    }
                }
            </style>
        `;

        // Add footer to page
        document.head.insertAdjacentHTML('beforeend', footerStyles);
        footerContainer.innerHTML = footerHTML;
    }
});
