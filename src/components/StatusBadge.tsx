"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Printer, CheckCircle, XCircle, Home } from "lucide-react";

type Props = {
  status?: string | null;
  className?: string;
};

export default function StatusBadge({ status, className }: Props) {
  const s = (status || "").toLowerCase();

  switch (s) {
    case "pending":
      return (
        <Badge className={`bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 ${className || ""}`}>
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "printing":
      return (
        <Badge className={`bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 ${className || ""}`}>
          <Printer className="mr-1 h-3 w-3" />
          Printing
        </Badge>
      );
    case "completed":
      return (
        <Badge className={`bg-green-500/10 text-green-600 hover:bg-green-500/20 ${className || ""}`}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Selesai
        </Badge>
      );
    case "delivered":
      return (
        <Badge className={`bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 ${className || ""}`}>
          <Home className="mr-1 h-3 w-3" />
          Diambil
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className={`bg-red-500/10 text-red-600 hover:bg-red-500/20 ${className || ""}`}>
          <XCircle className="mr-1 h-3 w-3" />
          Dibatalkan
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
