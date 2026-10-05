const BASE = "http://127.0.0.1:8000";

async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? null : res.json();
}

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const withMonth = (path, month) => (month ? `${path}?month=${month}` : path);

export const getSummary = (month) => request(withMonth("/analytics/summary", month));
export const getByCategory = (month) => request(withMonth("/analytics/by-category", month));
export const getMonthly = (months = 6) => request(`/analytics/monthly?months=${months}`);

export const getTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/transactions${query ? `?${query}` : ""}`);
};
export const createTransaction = (data) => request("/transactions", json("POST", data));
export const updateTransaction = (id, data) => request(`/transactions/${id}`, json("PUT", data));
export const deleteTransaction = (id) => request(`/transactions/${id}`, { method: "DELETE" });
export const getBudgets = (month) => request(withMonth("/budgets", month));
export const setBudget = (data) => request("/budgets", json("PUT", data));
export const deleteBudget = (id) => request(`/budgets/${id}`, { method: "DELETE" });
export const bulkCreate = (items) => request("/transactions/bulk", json("POST", items));