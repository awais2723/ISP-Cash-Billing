import {
  Home,
  Users,
  UserCog,
  Map,
  FileText,
  CheckSquare,
  BarChart3,
} from "lucide-react";

// Define the type for a navigation link
export interface NavLink {
  href: string;
  label: string;
  iconName: keyof typeof icons;
}

// Create the icon map
export const icons = { Home, Users, UserCog, Map, FileText, CheckSquare, BarChart3 };

// Define the navigation links for each role
export const adminNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", iconName: "Home" },
  { href: "/reconciliation", label: "Reconciliation", iconName: "CheckSquare" },
  { href: "/customers", label: "Customers", iconName: "Users" },
  { href: "/users", label: "Users", iconName: "UserCog" },
  { href: "/regions", label: "Regions", iconName: "Map" },
  { href: "/plans", label: "Plans", iconName: "FileText" },
  { href: "/reports", label: "Reports", iconName: "BarChart3" },
];

export const managerNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", iconName: "Home" },
  { href: "/customers", label: "Customers", iconName: "Users" },
  { href: "/regions", label: "Regions", iconName: "Map" },
  { href: "/plans", label: "Plans", iconName: "FileText" },
];
