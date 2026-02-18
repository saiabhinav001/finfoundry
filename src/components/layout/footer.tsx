"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { navLinks, siteConfig } from "@/data/site-data";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

interface SiteLinks {
  instagram: string;
  linkedin: string;
  email: string;
}

export function Footer() {
  const [links, setLinks] = useState<SiteLinks>(siteConfig.links);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setLinks({
            instagram: data.instagram || siteConfig.links.instagram,
            linkedin: data.linkedin || siteConfig.links.linkedin,
            email: data.email || siteConfig.links.email,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-white/[0.03] bg-[#030610]">
      <div className="container-max py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <Image
                src="/logo.png"
                alt="FinFoundry"
                width={120}
                height={150}
                className="rounded-[5px] w-11 h-auto"
                unoptimized
              />
              <span className="font-heading font-bold text-xl tracking-[-0.015em] text-foreground transition-colors duration-200">
                <span className="group-hover:text-teal-light transition-colors duration-200">Fin</span><span className="group-hover:text-gold transition-colors duration-200">Foundry</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Building the next generation of financially literate engineers at
              CBIT, Hyderabad.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-teal-light hover:bg-teal/[0.08] transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-teal-light hover:bg-teal/[0.08] transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${links.email}`}
                className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-teal-light hover:bg-teal/[0.08] transition-all duration-200"
                aria-label="Email"
              >
                <HiOutlineMail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-5">
              More
            </h4>
            <ul className="space-y-3">
              {navLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-5">
              Location
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chaitanya Bharathi Institute of Technology
              <br />
              Gandipet, Hyderabad
              <br />
              Telangana 500075
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {links.email}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 md:mt-16 md:pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/70">
            &copy; 2026 CBIT FinFoundry. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Built with precision by FinFoundry Tech Team
          </p>
        </div>
      </div>
    </footer>
  );
}
