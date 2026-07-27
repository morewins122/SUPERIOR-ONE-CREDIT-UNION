export type HomepageActionItem = {
  label: string;
  iconClass: string;
};

export type HomepageServiceMenu = {
  accountType: string;
  title: string;
  subtitle: string;
  accent: string;
  actions: HomepageActionItem[];
};

export const homepageContent = {
  hero: {
    badge: "Premium Digital Banking",
    heading: "Grow your savings with smarter everyday banking.",
    description:
      "Discover a member-first banking experience with savings accounts, checking accounts, transfers, loans, investments, and secure digital banking tools designed for everyday life.",
    blendedImages: [
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1400&q=80"
    ],
    primaryCtaLabel: "Open an Account",
    primaryCtaHref: "/register?accountType=savings",
    secondaryCtaLabel: "Learn More"
  },
  services: {
    sectionId: "banking-services",
    sectionLabel: "Banking Services",
    menus: [
      {
        accountType: "Superior One Rewards",
        title: "Superior One Rewards",
        subtitle: "Everyday savings tools with balance tracking, statements, and interest insights.",
        accent: "from-[#0f5f57] to-[#163c3a]",
        actions: [
          { label: "View Savings Balance", iconClass: "fa-solid fa-wallet" },
          { label: "Savings Account Details", iconClass: "fa-solid fa-circle-info" },
          { label: "Interest Earned", iconClass: "fa-solid fa-percent" },
          { label: "Deposit Funds", iconClass: "fa-solid fa-money-bill-trend-up" },
          { label: "Withdrawal History", iconClass: "fa-solid fa-clock-rotate-left" },
          { label: "Download Savings Statement", iconClass: "fa-solid fa-file-arrow-down" }
        ]
      },
      {
        accountType: "Superior One Travel",
        title: "Superior One Travel",
        subtitle: "Manage travel savings, foreign currency, transfers, and vacation goals.",
        accent: "from-[#203040] to-[#526070]",
        actions: [
          { label: "Travel Savings Account", iconClass: "fa-solid fa-passport" },
          { label: "Vacation Savings Goals", iconClass: "fa-solid fa-umbrella-beach" },
          { label: "International Savings", iconClass: "fa-solid fa-earth-americas" },
          { label: "Currency Savings", iconClass: "fa-solid fa-money-bill-transfer" },
          { label: "Automatic Savings Plans", iconClass: "fa-solid fa-rotate" },
          { label: "Transfer to Travel Wallet", iconClass: "fa-solid fa-right-left" }
        ]
      },
      {
        accountType: "Superior One Platinum",
        title: "Superior One Platinum",
        subtitle: "High-yield savings, premium banking services, and financial growth tools.",
        accent: "from-[#7b5d21] to-[#d6aa4f]",
        actions: [
          { label: "Premium Savings Account", iconClass: "fa-solid fa-gem" },
          { label: "High-Yield Savings", iconClass: "fa-solid fa-piggy-bank" },
          { label: "Interest Calculator", iconClass: "fa-solid fa-calculator" },
          { label: "Fixed Deposit Details", iconClass: "fa-solid fa-lock" },
          { label: "Savings Growth Report", iconClass: "fa-solid fa-chart-line" },
          { label: "Account Benefits", iconClass: "fa-solid fa-medal" }
        ]
      },
      {
        accountType: "Superior One Access",
        title: "Superior One Access",
        subtitle: "Digital banking, transfers, account security, and mobile banking services.",
        accent: "from-[#1f4e4a] to-[#97c7bc]",
        actions: [
          { label: "Savings Dashboard", iconClass: "fa-solid fa-gauge-high" },
          { label: "Transfer Between Accounts", iconClass: "fa-solid fa-right-left" },
          { label: "Deposit History", iconClass: "fa-solid fa-building-columns" },
          { label: "Scheduled Transfers", iconClass: "fa-solid fa-calendar-check" },
          { label: "Beneficiaries", iconClass: "fa-solid fa-users" },
          { label: "Account Security", iconClass: "fa-solid fa-shield-halved" },
          { label: "Download Account Statement", iconClass: "fa-solid fa-file-arrow-down" }
        ]
      }
    ] as HomepageServiceMenu[]
  },
  highlights: {
    security: {
      title: "Security",
      items: ["Secure online banking", "Multi-factor authentication", "Encrypted account access"]
    },
    insights: {
      title: "Insights",
      items: ["View balances", "Monitor spending", "Manage your finances"]
    }
  }
};
