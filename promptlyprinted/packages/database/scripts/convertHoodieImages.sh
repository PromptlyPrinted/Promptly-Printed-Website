#!/bin/bash

# Convert men's hoodie jpegs to pngs
MENS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/Blanks"
mkdir -p "$MENS_DIR/png"

cd "$MENS_DIR/jpeg"
for jpg in *.jpg; do
  png_name="${jpg%.jpg}.png"
  magick "$jpg" "../png/$png_name"
done

echo "✓ Converted men's hoodie images"
ls "$MENS_DIR/png" | head -5
