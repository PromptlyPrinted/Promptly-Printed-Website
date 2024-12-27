"use client";

import { OrganizationSwitcher, UserButton } from "@repo/auth/client";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/design-system/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import {
  AnchorIcon,
  ShoppingCartIcon,
  PackageIcon,
  CreditCardIcon,
  ListChecksIcon,
  LogOutIcon, // Just an example icon for logs
  UsersIcon,
  LayoutDashboardIcon,
  BoxIcon,
  ZapIcon,
  MoreHorizontalIcon,
  FolderIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react"; // Swap icons to your liking
import type { ReactNode } from "react";

type GlobalSidebarProperties = {
  readonly children: ReactNode;
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // 1) MAIN NAV for E-commerce Admin
  navMain: [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboardIcon,
      isActive: true,
      items: [],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UsersIcon,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
        {
          title: "Admins",
          url: "/admin/users?role=ADMIN",
        },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: PackageIcon,
      items: [],
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: BoxIcon,
      items: [],
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCartIcon,
      items: [],
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: CreditCardIcon,
      items: [],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: ListChecksIcon,
      items: [],
    },
    {
      title: "Logs",
      url: "/admin/logs",
      icon: LogOutIcon,
      items: [],
    },
  ],
  // 2) SECONDARY NAV
  // Might include webhooks, other advanced dev tools, or support links
  navSecondary: [
    {
      title: "Webhooks",
      url: "/admin/webhooks",
      icon: AnchorIcon,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: ZapIcon,
    },
  ],
  // 3) PROJECTS (optional): If you don’t need it, remove or keep as “extra”
  projects: [],
};

export const GlobalSidebar = ({ children }: GlobalSidebarProperties) => {
  const sidebar = useSidebar();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={cn(
                  "h-[36px] overflow-hidden transition-all [&>div]:w-full",
                  sidebar.open ? "" : "-mx-1"
                )}
              >
                <OrganizationSwitcher
                  hidePersonal
                  afterSelectOrganizationUrl="/"
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* MAIN NAV */}
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  // If you want to open/close automatically if it's the current route
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <MoreHorizontalIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* SECONDARY NAV (Webhooks, Settings, etc.) */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: "flex overflow-hidden w-full",
                    userButtonBox: "flex-row-reverse",
                    userButtonOuterIdentifier: "truncate pl-0",
                  },
                }}
              />
              <ModeToggle />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
