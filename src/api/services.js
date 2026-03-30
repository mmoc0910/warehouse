import api from "./client";

export const authService = {
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const warehouseService = {
  list: (params) => api.get("/warehouses", { params }),
  create: (payload) => api.post("/warehouses", payload),
  update: (id, payload) => api.put(`/warehouses/${id}`, payload),
  remove: (id) => api.delete(`/warehouses/${id}`),
  detail: (id) => api.get(`/warehouses/${id}`),
};

export const productGroupService = {
  list: (params) => api.get("/product-groups", { params }),
  create: (payload) => api.post("/product-groups", payload),
  update: (id, payload) => api.put(`/product-groups/${id}`, payload),
  remove: (id) => api.delete(`/product-groups/${id}`),
  detail: (id) => api.get(`/product-groups/${id}`),
};

export const productService = {
  list: (params) => api.get("/products", { params }),
  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  detail: (id) => api.get(`/products/${id}`),
};

export const userService = {
  list: (params) => api.get("/users", { params }),
  create: (payload) => api.post("/users", payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
  detail: (id) => api.get(`/users/${id}`),
};

export const stockReceiptService = {
  list: (params) => api.get("/stock-receipts", { params }),
  create: (payload) => api.post("/stock-receipts", payload),
  detail: (id) => api.get(`/stock-receipts/${id}`),
};

export const stockIssueService = {
  list: (params) => api.get("/stock-issues", { params }),
  create: (payload) => api.post("/stock-issues", payload),
  update: (id, payload) => api.put(`/stock-issues/${id}`, payload),
  remove: (id) => api.delete(`/stock-issues/${id}`),
  detail: (id) => api.get(`/stock-issues/${id}`),
};

export const stockTransferService = {
  list: (params) => api.get("/stock-transfers", { params }),
  create: (payload) => api.post("/stock-transfers", payload),
  detail: (id) => api.get(`/stock-transfers/${id}`),
};

export const stocktakeService = {
  list: (params) => api.get("/stocktakes", { params }),
  create: (payload) => api.post("/stocktakes", payload),
  detail: (id) => api.get(`/stocktakes/${id}`),
};

export const reportService = {
  inventoryByWarehouse: (params) =>
    api.get("/reports/inventory-by-warehouse", { params }),
  inOutByPeriod: (params) => api.get("/reports/in-out-by-period", { params }),
  lowStock: (params) => api.get("/reports/low-stock", { params }),
  slowMoving: (params) => api.get("/reports/slow-moving", { params }),
};
