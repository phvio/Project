// src/types/index.ts — 数据类型定义

/** 交易记录 */
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  date: string;                    // YYYY-MM-DD
  note: string;
  created_at: string;
  updated_at: string;
  category_name?: string;          // 从 JOIN 获取的分类中文名
  category_icon?: string;          // 从 JOIN 获取的分类图标
}

/** 新建/编辑交易时的表单数据 */
export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  date: string;
  note?: string;
}

/** 交易分类 */
export interface Category {
  id: string;                      // 英文ID
  name_zh: string;                 // 中文名
  type: 'income' | 'expense';
  icon: string;                    // emoji 图标
  is_builtin: number;             // 1=内置, 0=用户自建
  is_hidden: number;              // 1=隐藏, 0=显示
  sort_order: number;
}

/** 月度统计数据 */
export interface MonthlyStats {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: CategoryStat[];
}

/** 分类统计 */
export interface CategoryStat {
  name_zh: string;
  icon: string;
  total: number;
}

/** 趋势数据点 */
export interface TrendPoint {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
}

/** Electron API 接口声明（window.electronAPI） */
export interface ElectronAPI {
  getTransactions: (filters?: TransactionFilters) => Promise<Transaction[]>;
  addTransaction: (transaction: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: number, transaction: TransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<{ success: boolean }>;
  getCategories: (type?: 'income' | 'expense') => Promise<Category[]>;
  getAllCategories: () => Promise<Category[]>;
  addCategory: (category: Omit<Category, 'is_builtin' | 'is_hidden' | 'sort_order'>) => Promise<Category>;
  toggleCategoryHidden: (id: string, hidden: boolean) => Promise<{ success: boolean }>;
  getMonthlyStats: (year: number, month: number) => Promise<MonthlyStats>;
  getTrendData: (months: number) => Promise<TrendPoint[]>;
  exportCsv: () => Promise<{ success: boolean; filePath?: string; message?: string }>;
}

/** 交易筛选条件 */
export interface TransactionFilters {
  type?: 'income' | 'expense';
  category_id?: string;
  year?: number;
  month?: number;
  limit?: number;
}

// 扩展 Window 类型，让 TypeScript 认识 electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
