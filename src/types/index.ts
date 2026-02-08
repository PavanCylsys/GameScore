
export interface User {
  id: string;
  email: string;
  createdAt?: Date;
}

export interface Score {
  id: string;
  userId: string;
  value?: number;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}
