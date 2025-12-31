"use client";

import { Clock, FileText, Users, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOrders } from "@/contexts/OrderContext";
import { motion } from "@/components/animations";

export function QueueWidget() {
  const { getQueueInfo } = useOrders();
  const { count, estimatedTime } = getQueueInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-card border-border shadow-smooth">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3"
            >
              <FileText className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Status Antrian
              </h3>
              <p className="text-xs text-muted-foreground">Update real-time</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Queue Count */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Dalam Antrian</span>
              </div>
              <motion.div 
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-primary"
              >
                {count}
              </motion.div>
              <span className="text-xs text-muted-foreground">dokumen</span>
            </motion.div>

            {/* Estimated Time */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">Estimasi</span>
              </div>
              <motion.div 
                key={estimatedTime}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-secondary"
              >
                {estimatedTime}
              </motion.div>
              <span className="text-xs text-muted-foreground">menit</span>
            </motion.div>
          </div>

          {/* Live Indicator */}
          <div className="mt-5 pt-4 border-t border-border">
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
