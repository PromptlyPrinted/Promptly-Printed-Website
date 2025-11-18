'use client';

import { OrganizationSwitcher, UserButton } from '@repo/auth/client';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/design-system/components/ui/collapsible';
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
} from '@repo/design-system/components/ui/sidebar';
import { cn } from '@repo/design-system/lib/utils';
import {
  AnchorIcon,
  BookOpenIcon,
  BoxIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PercentIcon,
  ShoppingCartIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { create } from 'zustand';

type Role = 'ALL' | 'ADMIN' | 'CUSTOMER';

interface UserFilterStore {
  roleFilter: Role;
  setRoleFilter: (role: Role) => void;
}

type GlobalSidebarProperties = {
  readonly children: ReactNode;
};

export const useUserFilterStore = create<UserFilterStore>()((set) => ({
  roleFilter: 'ALL',
  setRoleFilter: (role: Role) => set(() => ({ roleFilter: role })),
}));

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  // 1) MAIN NAV for E-commerce Admin
  navMain: [
    {
      title: 'Overview',
      url: '/admin',
      icon: LayoutDashboardIcon,
      isActive: true,
      items: [],
    },
    {
      title: 'CMS',
      url: '/admin/cms',
      icon: BookOpenIcon,
      items: [
        {
          title: 'Pages',
          url: '/admin/cms/pages',
        },
      ],
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: UsersIcon,
      items: [
        {
          title: 'All Users',
          url: '/admin/users',
        },
        {
          title: 'Admins',
          url: '/admin/users',
        },
        {
          title: 'Customers',
          url: '/admin/users',
        },
      ],
    },
    {
      title: 'Products',
      url: '/admin/products',
      icon: PackageIcon,
      items: [],
    },
    {
      title: 'Categories',
      url: '/admin/categories',
      icon: BoxIcon,
      items: [],
    },
    {
      title: 'Orders',
      url: '/admin/orders',
      icon: ShoppingCartIcon,
      items: [],
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: CreditCardIcon,
      items: [],
    },
    {
      title: 'Discount Codes',
      url: '/admin/discount-codes',
      icon: PercentIcon,
      items: [],
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: ListChecksIcon,
      items: [],
    },
    {
      title: 'Logs',
      url: '/admin/logs',
      icon: LogOutIcon,
      items: [],
    },
  ],
  // 2) SECONDARY NAV
  // Might include webhooks, other advanced dev tools, or support links
  navSecondary: [
    {
      title: 'Webhooks',
      url: '/admin/webhooks',
      icon: AnchorIcon,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: ZapIcon,
    },
  ],
  // 3) PROJECTS (optional): If you don’t need it, remove or keep as “extra”
  projects: [],
};

export const GlobalSidebar = ({ children }: GlobalSidebarProperties) => {
  const sidebar = useSidebar();
  const pathname = usePathname();
  const { roleFilter, setRoleFilter } = useUserFilterStore();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const isActive = (url: string, role?: Role) => {
    if (role) {
      return pathname === url && roleFilter === role;
    }
    return pathname === url && (!role || roleFilter === 'ALL');
  };

  const handleUserFilterClick = (role: Role) => {
    setRoleFilter(role);
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={cn(
                  'h-[36px] overflow-hidden transition-all [&>div]:w-full',
                  sidebar.open ? '' : '-mx-1'
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
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  open={
                    openItems[item.title] ||
                    isActive(item.url) ||
                    item.items?.some((subItem) => isActive(subItem.url))
                  }
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(isActive(item.url) && 'bg-accent')}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
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
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn(
                                    item.title === 'Users'
                                      ? isActive(
                                          subItem.url,
                                          subItem.title === 'All Users'
                                            ? 'ALL'
                                            : subItem.title === 'Admins'
                                              ? 'ADMIN'
                                              : 'CUSTOMER'
                                        )
                                      : isActive(subItem.url),
                                    'bg-accent'
                                  )}
                                  onClick={() => {
                                    if (item.title === 'Users') {
                                      handleUserFilterClick(
                                        subItem.title === 'All Users'
                                          ? 'ALL'
                                          : subItem.title === 'Admins'
                                            ? 'ADMIN'
                                            : 'CUSTOMER'
                                      );
                                    }
                                  }}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
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

          {/* SECONDARY NAV */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(isActive(item.url) && 'bg-accent')}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
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
                    rootBox: 'flex overflow-hidden w-full',
                    userButtonBox: 'flex-row-reverse',
                    userButtonOuterIdentifier: 'truncate pl-0',
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
