export type OrderStatus = "pending" | "printing" | "completed" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  contact: string;
  file_name: string;
  file_url: string | null;
  file_path?: string | null;
  file_expires_at?: string | null;
  file_deleted?: boolean;
  // Payment proof lifecycle
  payment_proof_url?: string | null;
  payment_proof_path?: string | null;
  payment_proof_expires_at?: string | null;
  payment_proof_deleted?: boolean;
  color_mode: "bw" | "color";
  copies: number;
  pages: number;
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
  file_path?: string | null;
  payment_proof_url?: string | null;
  payment_proof_path?: string | null;
  color_mode: "bw" | "color";
  copies: number;
  pages?: number;
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
          file_path?: string | null;
        };
        Update: Partial<Omit<Order, "id" | "created_at">> & {
          file_expires_at?: string | null;
          file_deleted?: boolean;
          file_path?: string | null;
        };
      };
    };
  };
};
