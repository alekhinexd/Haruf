# Hero Banner Images

## 📸 Upload Your Hero Banner Here

Place your hero banner image in this folder with the name:
- `banner.jpg` (recommended)
- Or `banner.png` / `banner.webp`

## 📐 Recommended Image Specifications:

- **Dimensions:** 1920x800px (or larger)
- **Format:** JPG or WebP (best performance)
- **File Size:** Keep under 500KB for fast loading
- **Content:** Make sure text remains readable when dark overlay is applied

## 🎨 Current Setup:

The hero section has:
- Dark blue overlay (85% opacity)
- Parallax scroll effect (fixed background)
- Centered content over the image
- Responsive on all devices

## 🔄 To Change Image:

Simply replace `banner.jpg` in this folder, or update the path in:
`public/styles/clonify.css` (line 7)

```css
background: linear-gradient(...),
            url('/images/hero/banner.jpg');
```
