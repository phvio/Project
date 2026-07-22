// process/preload.js — 预加载脚本
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getTransactions: (filters) => ipcRenderer.invoke('get-transactions', filters),
  addTransaction: (transaction) => ipcRenderer.invoke('add-transaction', transaction),
  updateTransaction: (id, transaction) => ipcRenderer.invoke('update-transaction', id, transaction),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  getCategories: (type) => ipcRenderer.invoke('get-categories', type),
  getAllCategories: () => ipcRenderer.invoke('get-all-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  toggleCategoryHidden: (id, hidden) => ipcRenderer.invoke('toggle-category-hidden', id, hidden),
  getMonthlyStats: (year, month) => ipcRenderer.invoke('get-monthly-stats', year, month),
  getTrendData: (months) => ipcRenderer.invoke('get-trend-data', months),
  exportCsv: () => ipcRenderer.invoke('export-csv'),
});
