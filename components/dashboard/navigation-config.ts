import {
  Home,
  Trophy,
  Shield,
  Users,
  Calendar,
  CreditCard,
  User,
  UserCog,
  Sliders,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type UserDashboardRole =
  | "super_admin"
  | "league_admin"
  | "referee"
  | "team_staff"
  | "viewer";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface RoleNavigationConfig {
  primary: DashboardNavItem[]; // For BottomNav (up to 4 items + "Más")
  drawer: DashboardNavItem[];  // For Drawer / secondary items
  all: DashboardNavItem[];     // All items for desktop sidebar
}

export function getNavigationForRole(role: UserDashboardRole): RoleNavigationConfig {
  switch (role) {
    case "super_admin":
      return {
        primary: [
          { label: "Panel", href: "/dashboard", icon: Home, exact: true },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Auditoría", href: "/dashboard/audit", icon: Shield },
        ],
        drawer: [
          { label: "Usuarios", href: "/dashboard/users", icon: UserCog },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Suscripciones", href: "/dashboard/subscriptions", icon: CreditCard },
          { label: "Tipos", href: "/dashboard/types", icon: Sliders },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
        all: [
          { label: "Panel de control", href: "/dashboard", icon: Home, exact: true },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Auditoría", href: "/dashboard/audit", icon: Shield },
          { label: "Usuarios", href: "/dashboard/users", icon: UserCog },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Suscripciones", href: "/dashboard/subscriptions", icon: CreditCard },
          { label: "Tipos", href: "/dashboard/types", icon: Sliders },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
      };

    case "league_admin":
      return {
        primary: [
          { label: "Panel", href: "/dashboard", icon: Home, exact: true },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
        ],
        drawer: [
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Auditoría", href: "/dashboard/audit", icon: Shield },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
        all: [
          { label: "Panel de control", href: "/dashboard", icon: Home, exact: true },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Auditoría", href: "/dashboard/audit", icon: Shield },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
      };

    case "referee":
      return {
        primary: [
          { label: "Panel", href: "/dashboard", icon: Home, exact: true },
          { label: "Mis partidos", href: "/dashboard/matches?myMatches=1", icon: Calendar },
          { label: "Partidos", href: "/dashboard/matches", icon: Activity },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
        drawer: [
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
        ],
        all: [
          { label: "Panel de control", href: "/dashboard", icon: Home, exact: true },
          { label: "Mis partidos", href: "/dashboard/matches?myMatches=1", icon: Calendar },
          { label: "Todos los partidos", href: "/dashboard/matches", icon: Activity },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
      };

    case "team_staff":
      return {
        primary: [
          { label: "Panel", href: "/dashboard", icon: Home, exact: true },
          { label: "Mi equipo", href: "/dashboard/teams", icon: Users },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
        ],
        drawer: [
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
        all: [
          { label: "Panel de control", href: "/dashboard", icon: Home, exact: true },
          { label: "Mi equipo", href: "/dashboard/teams", icon: Users },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
      };

    default: // viewer
      return {
        primary: [
          { label: "Panel", href: "/dashboard", icon: Home, exact: true },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
        ],
        drawer: [
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
        all: [
          { label: "Panel de control", href: "/dashboard", icon: Home, exact: true },
          { label: "Ligas", href: "/dashboard/leagues", icon: Trophy },
          { label: "Partidos", href: "/dashboard/matches", icon: Calendar },
          { label: "Equipos", href: "/dashboard/teams", icon: Users },
          { label: "Jugadores", href: "/dashboard/players", icon: Users },
          { label: "Mi perfil", href: "/dashboard/profile", icon: User },
        ],
      };
  }
}

export function getRoleDisplayName(role: UserDashboardRole): string {
  switch (role) {
    case "super_admin":
      return "Super Administrador";
    case "league_admin":
      return "Administrador de Liga";
    case "referee":
      return "Árbitro Oficial";
    case "team_staff":
      return "Cuerpo Técnico";
    default:
      return "Usuario / Consulta";
  }
}
