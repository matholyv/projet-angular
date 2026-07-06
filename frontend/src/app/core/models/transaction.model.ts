export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: number;
  price: number;
  fee: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  product?: any;
  buyer?: any;
  seller?: any;
  buyerReviewed?: boolean;
  sellerReviewed?: boolean;
}
