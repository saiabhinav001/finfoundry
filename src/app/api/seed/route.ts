import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/firebase/auth-helpers";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST — Seed Firestore with the static site-data content.
 * Only super_admin can run this. Only seeds collections that are empty.
 */
export async function POST(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    if (role !== "super_admin") {
      return NextResponse.json(
        { error: "Only Super Admins can seed data." },
        { status: 403 }
      );
    }

    const seeded: string[] = [];

    // ── Events ──
    const eventsSnap = await adminDb.collection("events").limit(1).get();
    if (eventsSnap.empty) {
      const events = [
        {
          title: "FinQuest 2025",
          date: "March 2025",
          type: "Competition",
          description:
            "An inter-college financial quiz and stock trading competition with prizes worth INR 50,000.",
          status: "upcoming",
        },
        {
          title: "Market Pulse Series",
          date: "Monthly",
          type: "Workshop",
          description:
            "Monthly workshop series analyzing current market trends, earnings seasons, and macro-economic indicators.",
          status: "ongoing",
        },
        {
          title: "Wall Street Decoded",
          date: "February 2025",
          type: "Guest Lecture",
          description:
            "Expert sessions with industry professionals from top financial institutions sharing real-world insights.",
          status: "upcoming",
        },
        {
          title: "Portfolio Challenge",
          date: "January 2025",
          type: "Competition",
          description:
            "30-day paper trading challenge where participants build and manage virtual portfolios competing for the highest returns.",
          status: "completed",
        },
        {
          title: "FinTech Innovation Summit",
          date: "April 2025",
          type: "Conference",
          description:
            "A full-day conference featuring panels on AI in finance, algorithmic trading, and the future of fintech.",
          status: "upcoming",
        },
        {
          title: "Excel for Finance Bootcamp",
          date: "December 2024",
          type: "Workshop",
          description:
            "Intensive bootcamp covering advanced Excel functions, VBA macros, and dashboard creation for financial analysis.",
          status: "completed",
        },
      ];

      const batch = adminDb.batch();
      events.forEach((event) => {
        const ref = adminDb.collection("events").doc();
        batch.set(ref, {
          ...event,
          imageURL: "",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      seeded.push(`events (${events.length})`);
    }

    // ── Programs ──
    const programsSnap = await adminDb.collection("programs").limit(1).get();
    if (programsSnap.empty) {
      const programs = [
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

      const batch = adminDb.batch();
      programs.forEach((program, i) => {
        const ref = adminDb.collection("programs").doc();
        batch.set(ref, {
          ...program,
          order: i,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      seeded.push(`programs (${programs.length})`);
    }

    // ── Team ──
    const teamSnap = await adminDb.collection("team").limit(1).get();
    if (teamSnap.empty) {
      const team = [
        { name: "President", role: "President" },
        { name: "Vice President", role: "Vice President" },
        { name: "Secretary", role: "Secretary" },
        { name: "Treasurer", role: "Treasurer" },
        { name: "Technical Lead", role: "Technical Lead" },
        { name: "Events Head", role: "Events Head" },
        { name: "Marketing Head", role: "Marketing Head" },
        { name: "Content Head", role: "Content Head" },
        { name: "Design Head", role: "Design Head" },
        { name: "Outreach Head", role: "Outreach Head" },
      ];

      const batch = adminDb.batch();
      team.forEach((member, i) => {
        const ref = adminDb.collection("team").doc();
        batch.set(ref, {
          ...member,
          image: "",
          linkedin: "",
          batch: "2025",
          order: i,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      seeded.push(`team (${team.length})`);
    }

    // ── Resources ──
    const resourcesSnap = await adminDb.collection("resources").limit(1).get();
    if (resourcesSnap.empty) {
      const resources = [
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

      const batch = adminDb.batch();
      resources.forEach((cat, i) => {
        const ref = adminDb.collection("resources").doc();
        batch.set(ref, {
          ...cat,
          order: i,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      seeded.push(`resources (${resources.length})`);
    }

    if (seeded.length === 0) {
      return NextResponse.json({
        message: "All collections already have data. Nothing to seed.",
      });
    }

    return NextResponse.json({
      message: `Seeded: ${seeded.join(", ")}. You can now edit this content in the Admin Panel.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("Seed error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
