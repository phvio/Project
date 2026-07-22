// src/components/CategoryManager.tsx — 分类管理弹窗
import { useState, useEffect } from 'react';
import type { Category } from '../types';

interface Props {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newIcon, setNewIcon] = useState('📌');

  useEffect(() => {
    window.electronAPI.getAllCategories().then(setCategories);
  }, []);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const toggleHidden = async (cat: Category) => {
    await window.electronAPI.toggleCategoryHidden(cat.id, !cat.is_hidden);
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_hidden: c.is_hidden ? 0 : 1 } : c))
    );
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    const id = 'custom_' + Date.now();
    await window.electronAPI.addCategory({ id, name_zh: newName.trim(), type: newType, icon: newIcon });
    const updated = await window.electronAPI.getAllCategories();
    setCategories(updated);
    setNewName('');
    setShowAdd(false);
  };

  const renderList = (list: Category[], title: string, color: string) => (
    <div className="mb-5">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>{title}</h3>
      <div className="space-y-1">
        {list.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              cat.is_hidden ? 'opacity-40 bg-slate-50' : 'bg-white'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{cat.name_zh}</span>
            {cat.is_builtin ? (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">内置</span>
            ) : (
              <span className="text-[10px] text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">自定义</span>
            )}
            {cat.is_builtin ? (
              <button
                onClick={() => toggleHidden(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  cat.is_hidden
                    ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.is_hidden ? '显示' : '隐藏'}
              </button>
            ) : (
              <span className="text-[10px] text-slate-300">
                {cat.is_hidden ? '已隐藏' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-700">📂 分类管理</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderList(expenseCategories, '💸 支出分类', 'text-rose-400')}
          {renderList(incomeCategories, '💰 收入分类', 'text-emerald-400')}

          {/* 添加自定义分类 */}
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              ＋ 添加自定义分类
            </button>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setNewType('expense')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    newType === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400'
                  }`}
                >
                  💸 支出
                </button>
                <button
                  onClick={() => setNewType('income')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    newType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400'
                  }`}
                >
                  💰 收入
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-12 text-center text-xl py-2 bg-white rounded-lg border border-slate-200"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="分类名称"
                  maxLength={10}
                  className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-300"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-white text-slate-400 hover:bg-slate-100 transition-colors">
                  取消
                </button>
                <button onClick={addCategory}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                  添加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
