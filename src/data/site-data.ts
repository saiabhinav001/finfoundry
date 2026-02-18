export const siteConfig = {
  name: "CBIT FinFoundry",
  shortName: "FinFoundry",
  description:
    "CBIT FinFoundry is the premier financial literacy club at Chaitanya Bharathi Institute of Technology, Hyderabad. We build the next generation of financially literate engineers through stock market education, financial modeling, and wealth literacy programs.",
  url: "https://cbitfinfoundry.vercel.app",
  ogImage: "/og-image.png",
  links: {
    instagram: "https://instagram.com/cbitfinfoundry",
    linkedin: "https://linkedin.com/company/cbit-finfoundry",
    email: "finfoundry@cbit.ac.in",
  },
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export const stats = [
  { value: "500+", label: "Active Members" },
  { value: "50+", label: "Events Conducted" },
  { value: "20+", label: "Industry Speakers" },
  { value: "3+", label: "Years of Impact" },
];

export const programs = [
  {
    title: "Stock Market Fundamentals",
    description:
      "Master the basics of equity markets, technical analysis, and fundamental analysis through hands-on trading simulations and expert-led workshops.",
    icon: "TrendingUp",
  },
  {
    title: "Financial Modeling & Valuation",
    description:
      "Learn to build professional-grade financial models, perform DCF valuations, and analyze company financials like a Wall Street analyst.",
    icon: "BarChart3",
  },
  {
    title: "Wealth Management & Planning",
    description:
      "Understand personal finance, asset allocation, tax planning, and long-term wealth building strategies for early career professionals.",
    icon: "Wallet",
  },
  {
    title: "Cryptocurrency & Blockchain",
    description:
      "Explore decentralized finance, blockchain technology, and the evolving landscape of digital assets with a focus on risk management.",
    icon: "Bitcoin",
  },
  {
    title: "Derivatives & Options Trading",
    description:
      "Deep dive into futures, options, and derivatives markets. Learn hedging strategies, Greeks, and advanced trading techniques.",
    icon: "LineChart",
  },
  {
    title: "Investment Banking Workshop",
    description:
      "Industry-standard training on M&A analysis, pitch books, LBO modeling, and the recruitment process for investment banking roles.",
    icon: "Building2",
  },
];

export const events = [
  {
    title: "FinQuest 2025",
    date: "March 2025",
    type: "Competition",
    description:
      "An inter-college financial quiz and stock trading competition with prizes worth INR 50,000.",
    status: "upcoming" as const,
  },
  {
    title: "Market Pulse Series",
    date: "Monthly",
    type: "Workshop",
    description:
      "Monthly workshop series analyzing current market trends, earnings seasons, and macro-economic indicators.",
    status: "ongoing" as const,
  },
  {
    title: "Wall Street Decoded",
    date: "February 2025",
    type: "Guest Lecture",
    description:
      "Expert sessions with industry professionals from top financial institutions sharing real-world insights.",
    status: "upcoming" as const,
  },
  {
    title: "Portfolio Challenge",
    date: "January 2025",
    type: "Competition",
    description:
      "30-day paper trading challenge where participants build and manage virtual portfolios competing for the highest returns.",
    status: "completed" as const,
  },
  {
    title: "FinTech Innovation Summit",
    date: "April 2025",
    type: "Conference",
    description:
      "A full-day conference featuring panels on AI in finance, algorithmic trading, and the future of fintech.",
    status: "upcoming" as const,
  },
  {
    title: "Excel for Finance Bootcamp",
    date: "December 2024",
    type: "Workshop",
    description:
      "Intensive bootcamp covering advanced Excel functions, VBA macros, and dashboard creation for financial analysis.",
    status: "completed" as const,
  },
];

export const team2025 = [
  {
    name: "President",
    role: "President",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Vice President",
    role: "Vice President",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Secretary",
    role: "Secretary",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Treasurer",
    role: "Treasurer",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Technical Lead",
    role: "Technical Lead",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Events Head",
    role: "Events Head",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Marketing Head",
    role: "Marketing Head",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Content Head",
    role: "Content Head",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Design Head",
    role: "Design Head",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
  {
    name: "Outreach Head",
    role: "Outreach Head",
    image: "/team/placeholder.svg",
    linkedin: "",
  },
];

export const resources = [
  {
    category: "Books",
    items: [
      {
        title: "The Intelligent Investor",
        author: "Benjamin Graham",
        description:
          "The definitive book on value investing. A must-read for anyone serious about understanding market fundamentals.",
      },
      {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        description:
          "A personal finance classic that challenges conventional wisdom about money and investing.",
      },
      {
        title: "A Random Walk Down Wall Street",
        author: "Burton Malkiel",
        description:
          "A comprehensive guide to investing that covers everything from stocks and bonds to real estate.",
      },
    ],
  },
  {
    category: "Online Courses",
    items: [
      {
        title: "Financial Markets by Yale",
        author: "Robert Shiller",
        description:
          "A free Coursera course covering the fundamentals of financial markets and behavioral finance.",
      },
      {
        title: "Investment Management Specialization",
        author: "University of Geneva",
        description:
          "Comprehensive specialization on portfolio management and investment strategies.",
      },
      {
        title: "Technical Analysis Masterclass",
        author: "Zerodha Varsity",
        description:
          "Free, comprehensive modules on technical analysis, fundamental analysis, and options theory.",
      },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      {
        title: "Screener.in",
        author: "Stock Screening",
        description:
          "Powerful stock screening tool for Indian markets with fundamental data and financial statements.",
      },
      {
        title: "TradingView",
        author: "Charting Platform",
        description:
          "Industry-standard charting and technical analysis platform used by professional traders worldwide.",
      },
      {
        title: "Moneycontrol",
        author: "Market Data",
        description:
          "Comprehensive financial portal for market data, news, portfolio tracking, and mutual fund analysis.",
      },
    ],
  },
];
