declare namespace API {
  type deleteCategoryParams = {
    id: number;
  };

  type deletePurchaseItemParams = {
    itemId: number;
  };

  type deleteStoreParams = {
    id: number;
  };

  type getAllPurchasesWithItemsParams = {
    storeId: number;
  };

  type getByStoreParams = {
    storeId: number;
  };

  type getCategoryTreeParams = {
    storeId: number;
  };

  type getPurchaseItemsParams = {
    purchaseId: number;
  };

  type getPurchaseParams = {
    purchaseId: number;
  };

  type getStoresPageParams = {
    page?: number;
    size?: number;
    storeName?: string;
  };

  type importIngredientsExcelParams = {
    storeId: number;
  };

  type importIngredientsTxtParams = {
    storeId: number;
  };

  type IngredientCategory = {
    id?: number;
    storeId?: number;
    parentId?: number;
    categoryName?: string;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
    children?: IngredientCategory[];
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

  type IPageStore = {
    records?: Store[];
    current?: number;
    total?: number;
    pages?: number;
    size?: number;
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

  type ResultIPageStore = {
    code?: string;
    message?: string;
    data?: IPageStore;
  };

  type ResultListIngredientCategory = {
    code?: string;
    message?: string;
    data?: IngredientCategory[];
  };

  type ResultListIngredients = {
    code?: string;
    message?: string;
    data?: Ingredients[];
  };

  type ResultListPurchaseItems = {
    code?: string;
    message?: string;
    data?: PurchaseItems[];
  };

  type ResultListStore = {
    code?: string;
    message?: string;
    data?: Store[];
  };

  type ResultMapStringObject = {
    code?: string;
    message?: string;
    data?: Record;
  };

  type ResultPurchases = {
    code?: string;
    message?: string;
    data?: Purchases;
  };

  type ResultVoid = {
    code?: string;
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
