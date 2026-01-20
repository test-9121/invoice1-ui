// Product types for line items
export type ProductType = 'GOODS' | 'SERVICE';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  hsnOrSac: string;
  gstRate: number;
  uom: string;
  salePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    content: Product[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  timestamp: string;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  search?: string;
  type?: ProductType;
  isActive?: boolean;
}
