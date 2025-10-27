#!/bin/bash

# Fix Women's Hoodie color names
WOMENS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/Blanks/png"
cd "$WOMENS_DIR"
ln -sf "jet-black.png" "black.png"
ln -sf "new-french-navy.png" "navy.png"

# Fix Men's Hoodie color names
MENS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/Blanks/png"
cd "$MENS_DIR"
ln -sf "jet-black.png" "black.png"
ln -sf "oxford-navy.png" "navy.png"

# Fix Kids Hoodie color names
KIDS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/Blanks/png"
cd "$KIDS_DIR"
ln -sf "arctic-white.png" "white.png"
ln -sf "jet-black.png" "black.png"
ln -sf "oxford-navy.png" "navy.png"
ln -sf "royal.png" "royal-blue.png"

echo "✓ Created symlinks for hoodie color name mismatches"
