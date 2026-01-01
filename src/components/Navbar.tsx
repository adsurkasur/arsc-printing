"use client";

import { Printer, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion } from "@/components/animations";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/order", label: "Pesan Sekarang" },
  { href: "/track", label: "Lacak Pesanan" },
  { href: "/queue", label: "Status Antrian" },
  { href: "/admin", label: "Admin", matchPrefix: true },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string, matchPrefix?: boolean) => {
    if (matchPrefix) return pathname.startsWith(href);
    return pathname === href;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-br from-primary to-secondary p-2 shadow-lg shadow-primary/25"
            >
              <Printer className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ARSC Printing
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 group"
              >
                <span className={cn(
                  "relative z-10 text-sm font-medium transition-colors",
                  isActive(link.href, link.matchPrefix)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                  {link.label}
                </span>
                {isActive(link.href, link.matchPrefix) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all",
                        isActive(link.href, link.matchPrefix)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
