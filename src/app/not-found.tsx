"use client";

import Link from "next/link";
import { motion } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mx-auto mb-8 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
        >
          <AlertCircle className="h-12 w-12 text-primary" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-8xl font-bold gradient-text"
        >
          404
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 text-xl text-muted-foreground"
        >
          Oops! Halaman tidak ditemukan
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button asChild size="lg" className="rounded-xl h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Kembali ke Beranda
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
