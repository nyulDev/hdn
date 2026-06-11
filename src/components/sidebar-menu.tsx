"use client";

import * as React from "react";
import {
  Home,
  FileText,
  Layers,
  Scale,
  Settings,
  DollarSign,
  TrendingUp,
  FileBarChart,
  Users,
  Truck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Customer",
    url: "/customer",
    icon: Users,
  },
  {
    title: "Cost Shipping",
    url: "/cost-shipping",
    icon: Truck,
  },
];

const transaksiItems = [
  {
    title: "Data Penawaran",
    url: "/penawaran",
    icon: FileText,
  },
  {
    title: "Modal",
    url: "/modal",
    icon: Layers,
  },
  {
    title: "Modal Aktual",
    url: "/modal-aktual",
    icon: Layers,
  },

  {
    title: "QUO PPN",
    url: "/quo-ppn",
    icon: Scale,
  },
  {
    title: "Profit",
    url: "/profit",
    icon: TrendingUp,
  },
];

const reportItems = [
  {
    title: "Modal",
    url: "/report/modal",
    icon: FileBarChart,
    target: "_blank",
  },
  {
    title: "Modal Aktual",
    url: "/report/modal-aktual",
    icon: FileBarChart,
    target: "_blank",
  },
  {
    title: "QUO",
    url: "/report/quo",
    icon: FileBarChart,
    target: "_blank",
  },
  {
    title: "INV",
    url: "/report/inv",
    icon: FileBarChart,
    target: "_blank",
  },
  {
    title: "TTB",
    url: "/report/ttb",
    icon: FileBarChart,
    target: "_blank",
  },
];

const SOAItems = [
  {
    title: "Penjualan",
    url: "/penjualan",
    icon: DollarSign,
  },
  {
    title: "SOA Satuan",
    url: "/soa-satuan",
    icon: TrendingUp,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center px-2 py-4 bg-background rounded-lg mx-2 mt-2 shadow-sm border">
          <img
            src="/haluandayaniga.png"
            alt="HALUAN DAYA NIAGA"
            className="h-auto w-full max-w-56 object-contain"
            style={{ display: "block" }}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Transaksi</SidebarGroupLabel>
          <SidebarMenu>
            {transaksiItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Report</SidebarGroupLabel>
          <SidebarMenu>
            {reportItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link
                    href={item.url}
                    target={item.target}
                    rel={
                      item.target === "_blank"
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>SOA</SidebarGroupLabel>
          <SidebarMenu>
            {SOAItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/user-management"}>
              <Link href="/user-management">
                <UserCog />
                <span>User Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
