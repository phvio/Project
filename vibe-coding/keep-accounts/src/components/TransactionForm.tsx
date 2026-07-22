// src/components/TransactionForm.tsx — 记账表单（新版设计）
import { useState, useEffect } from 'react';
import type { Transaction, TransactionInput, Category } from '../types';

interface Props {
  categories: Category[];
  onSubmit: (input: TransactionInput) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit: () => void;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TransactionForm({ categories, onSubmit, editingTransaction, onCancelEdit }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});
  const isEdit = !!editingTransaction;

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setErrors({});
    }
  }, [editingTransaction]);

  useEffect(() => { setCategoryId(''); setErrors({}); }, [type]);

  const visibleCategories = categories.filter((c) => c.type === type && !c.is_hidden);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const n = parseFloat(amount);
    if (!n || n <= 0) errs.amount = '请输入有效金额';
    if (!categoryId) errs.category = '请选择分类';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ type, amount: n, category_id: categoryId, date: date || today(), note: note.trim() });
    if (!isEdit) { setAmount(''); setCategoryId(''); setDate(today()); setNote(''); }
  };

  const isExpense = type === 'expense';

  return (
    <div className="h-full overflow-y-auto flex justify-center">
      <form onSubmit={submit} className="w-[70%] max-w-4xl space-y-6">
        {/* 类型切换 */}
        <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
              isExpense ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            💸 支出
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
              !isExpense ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            💰 收入
          </button>
        </div>

        {/* 金额输入 */}
        <div className="bg-white rounded-2xl shadow-sm px-8 py-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
            金额
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light text-slate-300">¥</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })); }}
              placeholder="0.00"
              className={`flex-1 text-4xl font-bold bg-transparent outline-none placeholder:text-slate-200 transition-colors ${errors.amount ? 'text-rose-400' : 'text-slate-800'}`}
              autoFocus
            />
          </div>
          {errors.amount && <p className="text-sm text-rose-500 mt-2">{errors.amount}</p>}
        </div>

        {/* 分类选择 */}
        <div className="bg-white rounded-2xl shadow-sm px-7 py-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">
            分类
          </label>
          <div className="grid grid-cols-4 gap-3">
            {visibleCategories.map((cat) => {
              const selected = categoryId === cat.id;
              const selClass = isExpense
                ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-400'
                : 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-400';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategoryId(cat.id); setErrors((p) => ({ ...p, category: undefined })); }}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    selected ? selClass : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  {cat.name_zh}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-sm text-rose-500 mt-2">{errors.category}</p>}
        </div>

        {/* 日期 + 备注（并排） */}
        <div className="bg-white rounded-2xl shadow-sm px-7 py-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                备注 <span className="font-normal text-slate-300">· 可选</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="午餐外卖、地铁通勤…"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{note.length}/200</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {isEdit && (
            <button type="button" onClick={onCancelEdit}
              className="flex-1 py-4 rounded-2xl text-base font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              取消
            </button>
          )}
          <button type="submit"
            className={`flex-1 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-200 shadow-md ${
              isExpense
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
            }`}>
            {isEdit ? '💾 保存修改' : '✓ 记录'}
          </button>
        </div>
      </form>
    </div>
  );
}
