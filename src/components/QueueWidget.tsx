import { Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOrders } from "@/contexts/OrderContext";

export function QueueWidget() {
  const { getQueueInfo } = useOrders();
  const { count, estimatedTime } = getQueueInfo();

  return (
    <Card className="bg-card border-border shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-full bg-secondary/10 p-2">
            <FileText className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Status Antrian
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Dokumen dalam antrian
            </span>
            <span className="text-2xl font-bold text-primary">{count}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Estimasi waktu
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-lg font-semibold text-secondary">
                {estimatedTime} menit
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs text-muted-foreground">
              Real-time update
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
