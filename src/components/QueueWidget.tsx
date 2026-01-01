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

            {/* View Queue Button (replaces Estimasi) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Button
                size="default"
                variant="ghost"
                onClick={() => router.push('/queue')}
                className="w-full h-full p-4 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/10 text-secondary font-semibold"
              >
                Lihat Status Antrian
              </Button>
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
