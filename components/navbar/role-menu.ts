// components/navbar/role-menus.ts

export const adminMenu = [
    { labelKey: "nav.dashboard", href: "/admin" },
    { labelKey: "nav.companies", href: "/admin/companies" },
    { labelKey: "nav.users", href: "/admin/users" },
    { labelKey: "nav.referrals", href: "/admin/referrals" },
    { labelKey: "nav.bhReferrals", href: "/admin/bhreferrals" },
    { labelKey: "nav.settings", href: "/admin/settings" },
] as const;

export const userMenu = [
    { labelKey: "nav.dashboard", href: "/user" },
    { labelKey: "nav.referrals", href: "/user/referrals" },
    { labelKey: "nav.bhReferrals", href: "/user/bhreferrals" },
] as const;
