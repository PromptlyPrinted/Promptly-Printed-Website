"use client"

import * as React from "react"
import {
  NavigationMenu as Nav,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/design-system/components/ui/navigation-menu"
import { cn } from "@repo/design-system/lib/utils"
import {
  Box,
  Star,
  BarChart3,
  Shield,
  User,
  UserCircle,
  Baby,
  Square,
  MousePointer as Sock,
  Key,
  ShoppingBag,
  Watch,
  Pill as Pillow,
  LayoutGrid,
  Triangle,
  Image as ImageIcon,
  Gamepad2,
  BookOpen,
  BookMarked,
  Sticker,
  Brush,
} from "lucide-react"

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    icon?: React.ComponentType<{ className?: string }>
    title: string
    children?: React.ReactNode
  }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {Icon && <Icon className="h-5 w-5" />}
            <span>{title}</span>
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function ProductsDropdown() {
  return (
    <Nav>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex w-[1200px] divide-x p-6">
              <div className="pr-8">
                <h3 className="text-lg font-semibold">Use your imagination</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                    <Box className="h-6 w-6" />
                  </div>
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Discover unique products that spark creativity and imagination.
                </p>
                <a
                  href="/products/all"
                  className="mt-4 inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Explore Products
                  <span className="ml-1">→</span>
                </a>
              </div>
              <div className="px-8">
                <h3 className="text-lg font-semibold">Apparel</h3>
                <ul className="mt-4 space-y-4">
                  <ListItem href="/products/all" icon={Box} title="All" />
                  <ListItem href="/products/mens" icon={User} title="Men" />
                  <ListItem href="/products/womens" icon={UserCircle} title="Women" />
                  <ListItem href="/products/kids+babies" icon={Baby} title="Kids & Babies" />
                </ul>
              </div>
              <div className="px-8">
                <h3 className="text-lg font-semibold">Accessories</h3>
                <ul className="mt-4 space-y-4">
                  <ListItem href="/products/mats-sleeves" icon={Square} title="Mats & Sleeves" />
                  <ListItem href="/products/socks-flipflops" icon={Sock} title="Socks & Flip-flops" />
                  <ListItem href="/products/pendants-keyrings" icon={Key} title="Pendants & Keyrings" />
                  <ListItem href="/products/bags" icon={ShoppingBag} title="Bags" />
                  <ListItem href="/products/watch-straps" icon={Watch} title="Apple Watch Straps" />
                </ul>
              </div>
              <div className="px-8">
                <h3 className="text-lg font-semibold">Home & Living</h3>
                <ul className="mt-4 space-y-4">
                  <ListItem href="/products/cushions" icon={Pillow} title="Cushions" />
                  <ListItem href="/products/gallery-boards" icon={LayoutGrid} title="Gallery Boards" />
                  <ListItem href="/products/acrylic-prisms" icon={Triangle} title="Acrylic Prisms" />
                  <ListItem href="/products/prints-posters" icon={ImageIcon} title="Prints and Posters" />
                </ul>
              </div>
              <div className="pl-8">
                <h3 className="text-lg font-semibold">Others</h3>
                <ul className="mt-4 space-y-4">
                  <ListItem href="/products/games" icon={Gamepad2} title="Games" />
                  <ListItem href="/products/books" icon={BookOpen} title="Books" />
                  <ListItem href="/products/notebooks" icon={BookMarked} title="Notebooks" />
                  <ListItem href="/products/stickers" icon={Sticker} title="Stickers" />
                  <ListItem href="/products/tattoos" icon={Brush} title="Tattoos" />
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </Nav>
  )
}