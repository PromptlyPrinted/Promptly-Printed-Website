#!/bin/bash

echo "Making hoodie images transparent..."

# Function to make images transparent
make_transparent() {
    local dir=$1
    local name=$2

    echo "Processing $name..."

    cd "$dir"
    local count=0

    for img in *.png; do
        # Skip symlinks
        if [ -L "$img" ]; then
            continue
        fi

        # Create backup
        cp "$img" "${img}.backup"

        # Make transparent - remove white background
        magick "$img" -fuzz 10% -transparent white "$img"

        count=$((count + 1))
    done

    echo "  ✓ Processed $count images"
}

# Women's Hoodie
WOMENS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/Blanks/png"
make_transparent "$WOMENS_DIR" "Women's Hoodie"

# Men's Hoodie
MENS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/Blanks/png"
make_transparent "$MENS_DIR" "Men's Hoodie"

# Kids Hoodie
KIDS_DIR="/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/Blanks/png"
make_transparent "$KIDS_DIR" "Kids Hoodie"

echo ""
echo "✓ All hoodie images are now transparent!"
echo ""
echo "Note: Backups saved as *.png.backup in case you need to revert"
