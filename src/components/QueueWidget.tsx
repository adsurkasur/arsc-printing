"use client";

import { FileText, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/contexts/OrderContext";
import { motion } from "@/components/animations";
import { useRouter } from "next/navigation";

export function QueueWidget() {
  const { getQueueInfo } = useOrders();
  const { count, estimatedTime } = getQueueInfo();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-card border-border shadow-smooth">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 sm:p-3"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                Status Antrean
              </h3>
              <p className="text-xs text-muted-foreground">Update real-time</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Queue Count */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Dalam Antrean</span>
              </div>
              <motion.div 
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-primary"
              >
                {count}
              </motion.div>
              <span className="text-xs text-muted-foreground">dokumen</span>
            </motion.div>

            {/* View Queue Button (replaces Estimasi) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Button
                size="default"
                variant="ghost"
                onClick={() => router.push('/queue')}
                className="w-full h-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/10 text-secondary font-semibold text-xs sm:text-sm"
              >
                Lihat Status Antrean
              </Button>
            </motion.div>
          </div>

          {/* Live Indicator */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Data diperbarui secara real-time
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
