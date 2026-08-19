export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface Order {
  id: number;
  userId: number;
  products: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface TestConfiguration {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface FormData {
  [key: string]: string | number | boolean | File[];
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  category: 'auth' | 'navigation' | 'forms' | 'interactions' | 'data' | 'errors' | 'admin';
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  timestamp: string;
  error?: string;
}