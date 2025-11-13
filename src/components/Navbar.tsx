import { Printer, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Printer className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">
              ARSC Printing
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/"
              end
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Beranda
            </NavLink>
            <NavLink
              to="/order"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Pesan Sekarang
            </NavLink>
            <NavLink
              to="/admin"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Dashboard Admin
            </NavLink>
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
                <NavLink
                  to="/"
                  end
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  activeClassName="text-primary"
                >
                  Beranda
                </NavLink>
                <NavLink
                  to="/order"
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  activeClassName="text-primary"
                >
                  Pesan Sekarang
                </NavLink>
                <NavLink
                  to="/admin"
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  activeClassName="text-primary"
                >
                  Dashboard Admin
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
