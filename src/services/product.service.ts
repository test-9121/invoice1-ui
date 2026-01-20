// Product Service - Fetch products for line items
import { apiClient } from '@/lib/api-client';
import type { ProductsResponse, ProductListParams, Product } from '@/types/product';

class ProductService {
  private basePath = '/api/v1/products';

  /**
   * Fetch products list with pagination
   */
  async getProducts(params: ProductListParams = {}): Promise<ProductsResponse> {
    try {
      const {
        page = 0,
        size = 200,
        search,
        type,
        isActive = true,
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (search) {
        queryParams.append('search', search);
      }

      if (type) {
        queryParams.append('type', type);
      }

      if (isActive !== undefined) {
        queryParams.append('isActive', isActive.toString());
      }

      const url = `${this.basePath}?${queryParams.toString()}`;
      const response = await apiClient.get<ProductsResponse>(url, true);

      return response;
    } catch (error) {
      console.error('[ProductService] Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product }>(
        `${this.basePath}/${id}`,
        true
      );
      return response;
    } catch (error) {
      console.error('[ProductService] Error fetching product:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default ProductService;
