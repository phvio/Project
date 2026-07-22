// src/App.tsx — 主应用组件
// 侧边栏导航 + 内容区布局

import { useState, useEffect, useCallback } from 'react';
import type { Transaction, TransactionInput, Category } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Statistics from './components/Statistics';
import CategoryManager from './components/CategoryManager';

const NAV_ITEMS = [
  { id: 'add' as const,   label: '记账', icon: '✏️' },
  { id: 'list' as const,  label: '账单', icon: '📋' },
  { id: 'stats' as const, label: '统计', icon: '📊' },
];

type NavId = typeof NAV_ITEMS[number]['id'];

function App() {
  const [activeNav, setActiveNav] = useState<NavId>('add');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [filters, setFilters] = useState<{ year?: number; month?: number; type?: 'income' | 'expense' }>({});

  const loadTransactions = useCallback(async () => {
    setTransactions(await window.electronAPI.getTransactions(filters));
  }, [filters]);

  const loadCategories = useCallback(async () => {
    setCategories(await window.electronAPI.getCategories());
  }, []);

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [loadTransactions, loadCategories]);

  // ⌨️ 快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'n') { e.preventDefault(); setEditingTransaction(null); setActiveNav('add'); }
      if (mod && e.key === '1') { e.preventDefault(); setActiveNav('add'); }
      if (mod && e.key === '2') { e.preventDefault(); setActiveNav('list'); }
      if (mod && e.key === '3') { e.preventDefault(); setActiveNav('stats'); }
      if (e.key === 'Escape' && editingTransaction) setEditingTransaction(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingTransaction]);

  const handleSubmit = async (input: TransactionInput) => {
    if (editingTransaction) {
      await window.electronAPI.updateTransaction(editingTransaction.id, input);
      setEditingTransaction(null);
    } else {
      await window.electronAPI.addTransaction(input);
    }
    await loadTransactions();
    setActiveNav('list');
  };

  const handleDelete = async (id: number) => {
    await window.electronAPI.deleteTransaction(id);
    await loadTransactions();
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setActiveNav('add');
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* ── 左侧边栏 ── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo — 左侧留出 macOS 红绿灯空间，可拖拽窗口 */}
        <div className="title-bar-drag h-14 flex items-center gap-2.5 pl-20 pr-5 border-b border-slate-100">
          <span className="text-2xl">💰</span>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">生活财务</h1>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">小管家</h1>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.id !== 'add') setEditingTransaction(null); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${active
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
            );
          })}
        </nav>

        {/* 分类管理按钮 */}
        <div className="px-3 pb-1">
          <button
            onClick={() => setShowCategories(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <span className="text-lg">📂</span>
            管理分类
          </button>
        </div>

        {/* 底部快捷键提示 */}
        <div className="px-5 py-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
          <div><kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">⌘N</kbd> 新建交易</div>
          <div><kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">⌘1-3</kbd> 切换页面</div>
        </div>
      </aside>

      {/* ── 右侧内容 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="title-bar-drag h-14 flex-shrink-0 flex items-center px-6 bg-white border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-700">
            {NAV_ITEMS.find((n) => n.id === activeNav)?.icon}{' '}
            {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
          </h2>
          {editingTransaction && activeNav === 'add' && (
            <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              ✏️ 编辑中
            </span>
          )}
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-hidden p-6">
          {activeNav === 'add' && (
            <TransactionForm
              categories={categories}
              onSubmit={handleSubmit}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          )}

          {activeNav === 'list' && (
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              onEdit={handleEdit}
              filters={filters}
              onFiltersChange={setFilters}
              onAddNew={() => { setEditingTransaction(null); setActiveNav('add'); }}
            />
          )}

          {activeNav === 'stats' && (
            <Statistics />
          )}
        </main>
      </div>

      {/* 分类管理弹窗 */}
      {showCategories && (
        <CategoryManager onClose={() => { setShowCategories(false); loadCategories(); }} />
      )}
    </div>
  );
}

export default App;
