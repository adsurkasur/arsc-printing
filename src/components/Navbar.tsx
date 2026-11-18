"use client";

import { Printer, Menu, FileText, Search, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/order", label: "Pesan Cetak" },
  { href: "/track", label: "Lacak Pesanan" },
  { href: "/queue", label: "Status Antrean" },
  { href: "/admin", label: "Portal Admin", matchPrefix: true },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string, matchPrefix?: boolean) => {
    if (matchPrefix) return pathname.startsWith(href);
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1">
            <div className="rounded-lg bg-primary text-primary-foreground p-2 shadow-sm">
              <Printer className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-none">
                ARSC Printing
              </span>
              <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">
                FTAB Universitas Brawijaya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href, link.matchPrefix);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? "bg-secondary text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9 px-4">
              <Link href="/order">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Buat Pesanan
              </Link>
            </Button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-border" aria-label="Buka menu navigasi">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-6">
                <SheetTitle className="text-left text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-primary" />
                  ARSC Printing
                </SheetTitle>
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const active = isActive(link.href, link.matchPrefix);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                          active
                            ? "bg-secondary text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t border-border mt-2">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                      <Link href="/order">
                        <FileText className="mr-2 h-4 w-4" />
                        Pesan Sekarang
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
