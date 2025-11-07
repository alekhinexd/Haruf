# 🔄 How to Switch Between Homepage Styles

Your original homepage has been backed up. You can now easily switch between designs:

## 📁 Files Created:
- `index-clonify.html` - New Clonify-style homepage
- `styles/clonify.css` - Clonify styling
- `js/clonify-home.js` - Clonify homepage logic
- `index-backup.html` - Your original homepage (backup)

## 🔀 Switch to Clonify Style:

### Option 1: Manual Rename (Windows)
```bash
# Backup current index.html
ren public\index.html index-original.html

# Use Clonify version
ren public\index-clonify.html index.html
```

### Option 2: Copy Command
```bash
# Switch to Clonify style
Copy-Item public\index-clonify.html public\index.html -Force
```

## 🔙 Switch Back to Original:

```bash
# Restore original
Copy-Item public\index-backup.html public\index.html -Force
```

## 🧪 Test Locally:

```bash
npm start
# Visit http://localhost:3000
```

## 🚀 Deploy:

Once you've switched to the version you want:

```bash
git add .
git commit -m "Switch to Clonify-style homepage"
git push origin master
```

## ✨ What's Different in Clonify Style:

✅ Clean hero: "We provide you with 1:1 Clones"
✅ Horizontal scrolling product sections
✅ "Profitable Reselling Made Easy" features
✅ Trust badges section
✅ FAQ section
✅ All "Shop Now" buttons → /pages/products.html
✅ Product cards → Individual product pages
✅ Same header, footer, cart system

Your backend (Stripe, cart, checkout) stays exactly the same!
