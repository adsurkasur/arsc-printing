export type OrderStatus = "pending" | "printing" | "completed" | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  contact: string;
  file_name: string;
  file_url: string | null;
  color_mode: "bw" | "color";
  copies: number;
  paper_size: "A4";
  status: OrderStatus;
  created_at: string;
  estimated_time: number; // in minutes
  notes?: string;
}

// For creating a new order (without auto-generated fields)
export interface CreateOrderInput {
  customer_name: string;
  contact: string;
  file_name: string;
  file_url?: string | null;
  color_mode: "bw" | "color";
  copies: number;
  paper_size: "A4";
  notes?: string;
}

// Database type for Supabase
export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "estimated_time" | "status"> & {
          status?: OrderStatus;
        };
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
    };
  };
};
