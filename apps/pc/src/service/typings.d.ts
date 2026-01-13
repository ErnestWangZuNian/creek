declare namespace API {
  type deletePurchaseItemParams = {
    itemId: number;
  };

  type getAllPurchasesWithItemsParams = {
    storeId: number;
  };

  type getByStoreParams = {
    storeId: number;
  };

  type getPurchaseItemsParams = {
    purchaseId: number;
  };

  type getPurchaseParams = {
    purchaseId: number;
  };

  type importIngredientsExcelParams = {
    storeId: number;
  };

  type importIngredientsTxtParams = {
    storeId: number;
  };

  type Ingredients = {
    id?: number;
    name?: string;
    categoryId?: number;
    storeId?: number;
    unit?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  type PurchaseItemDTO = {
    ingredientName?: string;
    quantity?: number;
    unit?: string;
    urgent?: boolean;
  };

  type PurchaseItems = {
    id?: number;
    purchasedId?: number;
    ingredientId?: number;
    ingredientName?: string;
    quantity?: number;
    unit?: string;
    urgent?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };

  type Purchases = {
    id?: number;
    storeId?: number;
    createdAt?: string;
    expiredAt?: string;
    status?: string;
  };

  type ResultListIngredients = {
    code?: number;
    message?: string;
    data?: Ingredients[];
  };

  type ResultListPurchaseItems = {
    code?: number;
    message?: string;
    data?: PurchaseItems[];
  };

  type ResultListStore = {
    code?: number;
    message?: string;
    data?: Store[];
  };

  type ResultMapStringObject = {
    code?: number;
    message?: string;
    data?: Record;
  };

  type ResultPurchases = {
    code?: number;
    message?: string;
    data?: Purchases;
  };

  type ResultVoid = {
    code?: number;
    message?: string;
    data?: Record;
  };

  type searchIngredientsParams = {
    storeId: number;
    name?: string;
  };

  type Store = {
    id?: number;
    storeName?: string;
    createTime?: string;
    updateTime?: string;
  };

  type submitParams = {
    storeId: number;
  };

  type updatePurchaseItemParams = {
    purchaseId: number;
  };
}
