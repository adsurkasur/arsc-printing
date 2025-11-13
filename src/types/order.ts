export type OrderStatus = "pending" | "printing" | "completed";

export interface Order {
  id: string;
  customerName: string;
  contact: string;
  fileName: string;
  fileUrl?: string;
  colorMode: "bw" | "color";
  copies: number;
  paperSize: "A4" | "A3";
  status: OrderStatus;
  createdAt: Date;
  estimatedTime: number; // in minutes
}
