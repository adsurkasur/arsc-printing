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

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Printer className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">
              ARSC Printing
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium text-foreground transition-colors hover:text-primary",
                pathname === "/" && "text-primary"
              )}
            >
              Beranda
            </Link>
            <Link
              href="/order"
              className={cn(
                "text-sm font-medium text-foreground transition-colors hover:text-primary",
                pathname === "/order" && "text-primary"
              )}
            >
              Pesan Sekarang
            </Link>
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium text-foreground transition-colors hover:text-primary",
                pathname === "/admin" && "text-primary"
              )}
            >
              Dashboard Admin
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className={cn(
                    "text-lg font-medium text-foreground transition-colors hover:text-primary",
                    pathname === "/" && "text-primary"
                  )}
                >
                  Beranda
                </Link>
                <Link
                  href="/order"
                  className={cn(
                    "text-lg font-medium text-foreground transition-colors hover:text-primary",
                    pathname === "/order" && "text-primary"
                  )}
                >
                  Pesan Sekarang
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    "text-lg font-medium text-foreground transition-colors hover:text-primary",
                    pathname === "/admin" && "text-primary"
                  )}
                >
                  Dashboard Admin
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
