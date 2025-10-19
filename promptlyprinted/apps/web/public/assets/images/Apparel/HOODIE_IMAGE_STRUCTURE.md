# Hoodie Image Folder Structure

This document outlines the complete folder structure for all hoodie product images.

## Overview

All hoodie images are organized by gender/category, product SKU, and image type. The structure mirrors the T-shirt image organization.

## Complete Folder Structure

```
/public/assets/images/Apparel/
├── Mens/Hoodies/
│   └── A-MH-JH001/                    # Men's Premium Organic Cotton Hoodie
│       ├── Blanks/
│       │   ├── png/                    # PNG images of blank hoodies
│       │   │   ├── black.png
│       │   │   ├── white.png
│       │   │   ├── navy.png
│       │   │   └── heather-grey.png
│       │   └── jpeg/                   # JPEG versions (optional)
│       ├── People/                     # Lifestyle photos with people
│       ├── ProductImage/
│       │   └── image.png              # Main product thumbnail
│       └── README.md                   # Documentation
│
├── Womens/Hoodies/
│   └── A-WH-JH001F/                   # Women's Premium Organic Cotton Hoodie
│       ├── Blanks/
│       │   ├── png/                    # PNG images of blank hoodies
│       │   │   ├── black.png
│       │   │   ├── white.png
│       │   │   ├── navy.png
│       │   │   └── heather-grey.png
│       │   └── jpeg/                   # JPEG versions (optional)
│       ├── People/                     # Lifestyle photos with people
│       ├── ProductImage/
│       │   └── image.png              # Main product thumbnail
│       └── README.md                   # Documentation
│
└── Kids+Babies/Kids/Hoodies/
    └── HOOD-AWD-JH001B/               # Kids Premium Hoodie
        ├── Blanks/
        │   ├── png/                    # PNG images of blank hoodies
        │   │   ├── arctic-white.png
        │   │   ├── jet-black.png
        │   │   ├── charcoal.png
        │   │   ├── heather-grey.png
        │   │   ├── oxford-navy.png
        │   │   └── royal-blue.png
        │   └── jpeg/                   # JPEG versions (optional)
        ├── People/                     # Lifestyle photos with kids
        ├── ProductImage/
        │   └── image.png              # Main product thumbnail
        └── README.md                   # Documentation
```

## Image Requirements by Folder

### `/Blanks/png/` and `/Blanks/jpeg/`
- **Purpose**: Display blank hoodie in all available colors
- **Naming**: Use lowercase with hyphens (e.g., `heather-grey.png`)
- **Background**: Transparent or white
- **Angle**: Front view, centered
- **Size**: Minimum 1000x1000px
- **Format**: PNG with transparency preferred, JPEG as fallback

### `/People/`
- **Purpose**: Lifestyle and modeling photos showing the hoodie on people
- **Content**: Real people wearing the hoodie in various settings
- **Format**: JPEG or PNG
- **Quality**: Professional photography
- **Variety**: Different poses, angles, and demographics

### `/ProductImage/`
- **Purpose**: Main product thumbnail for listings
- **File**: `image.png` (always this exact name)
- **Content**: Most representative color (typically white or black)
- **Size**: Minimum 1000x1000px
- **Background**: White or transparent
- **Use**: Displayed on product listing pages, search results, etc.

## Color Naming Convention

Colors should match the `colorOptions` defined in `/apps/web/data/products.ts`:

### Men's Hoodie (A-MH-JH001)
- Black → `black.png`
- White → `white.png`
- Navy → `navy.png`
- Heather Grey → `heather-grey.png`

### Women's Hoodie (A-WH-JH001F)
- Black → `black.png`
- White → `white.png`
- Navy → `navy.png`
- Heather Grey → `heather-grey.png`

### Kids Hoodie (HOOD-AWD-JH001B)
- Arctic White → `arctic-white.png`
- Jet Black → `jet-black.png`
- Charcoal → `charcoal.png`
- Heather Grey → `heather-grey.png`
- Oxford Navy → `oxford-navy.png`
- Royal Blue → `royal-blue.png`

## Quick Reference: Where Each Image Goes

| Image Type | Location | Purpose |
|------------|----------|---------|
| Blank hoodie (PNG) | `/Blanks/png/` | Product color variations |
| Blank hoodie (JPEG) | `/Blanks/jpeg/` | Alternative format for performance |
| Lifestyle photos | `/People/` | Show hoodie on people |
| Main thumbnail | `/ProductImage/image.png` | Default product listing image |

## Next Steps

1. Source or create product images for each color
2. Place images in the appropriate folders
3. Ensure all filenames match exactly (case-sensitive)
4. Test that images display correctly on the website
5. Optimize images for web (compress without losing quality)

## Notes

- All folders have been created and are ready for images
- Each product folder contains a README.md with specific requirements
- The structure matches the existing T-shirt organization for consistency
- Images will be automatically loaded by the frontend when properly named and placed
