import { createContext, useContext, useState, ReactNode } from "react";
import { Order } from "@/types/order";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "estimatedTime">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  getQueueInfo: () => { count: number; estimatedTime: number };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "Ahmad Fauzi",
    contact: "081234567890",
    fileName: "Laporan_Akhir.pdf",
    colorMode: "bw",
    copies: 2,
    paperSize: "A4",
    status: "printing",
    createdAt: new Date(Date.now() - 5 * 60000),
    estimatedTime: 5,
  },
  {
    id: "2",
    customerName: "Siti Nurhaliza",
    contact: "082345678901",
    fileName: "Presentasi_Tugas.pdf",
    colorMode: "color",
    copies: 1,
    paperSize: "A4",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 60000),
    estimatedTime: 8,
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "estimatedTime">) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      estimatedTime: orderData.copies * (orderData.colorMode === "color" ? 3 : 2),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const getQueueInfo = () => {
    const pendingOrders = orders.filter(
      (order) => order.status === "pending" || order.status === "printing"
    );
    const totalTime = pendingOrders.reduce(
      (sum, order) => sum + order.estimatedTime,
      0
    );
    return { count: pendingOrders.length, estimatedTime: totalTime };
  };

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, updateOrderStatus, getQueueInfo }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
