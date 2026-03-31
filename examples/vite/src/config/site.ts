export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "@abdokouta/react-di",
  description:
    "Dependency injection container for React with NestJS-style modules",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Basic Demo",
      href: "/container",
    },
    {
      label: "Advanced Patterns",
      href: "/advanced",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Basic Demo",
      href: "/container",
    },
    {
      label: "Advanced Patterns",
      href: "/advanced",
    },
  ],
  links: {
    github: "https://github.com/abdokouta/react-di",
    docs: "https://github.com/abdokouta/react-di#readme",
  },
};
