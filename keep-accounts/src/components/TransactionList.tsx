// src/components/TransactionList.tsx — 交易列表（新版设计）
import { useState } from 'react';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  onEdit: (t: Transaction) => void;
  filters: { year?: number; month?: number; type?: 'income' | 'expense' };
  onFiltersChange: (f: { year?: number; month?: number; type?: 'income' | 'expense' }) => void;
  onAddNew: () => void;
}

const MONTHS = ['全部','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TransactionList({ transactions, onDelete, onEdit, filters, onFiltersChange, onAddNew }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  const totalIn = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 按日期分组
  const groups = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);
  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const doExport = async () => {
    const r = await window.electronAPI.exportCsv();
    if (!r.success && r.message !== '已取消') alert('导出失败');
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── 顶部统计卡片 ── */}
      <div className="flex-shrink-0 grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">本月支出</div>
          <div className="text-xl font-bold text-rose-500">¥{fmt(totalOut)}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">本月收入</div>
          <div className="text-xl font-bold text-emerald-500">¥{fmt(totalIn)}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">本月结余</div>
          <div className={`text-xl font-bold ${totalIn - totalOut >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
            ¥{fmt(totalIn - totalOut)}
          </div>
        </div>
      </div>

      {/* ── 筛选 + 操作栏 ── */}
      <div className="flex-shrink-0 flex items-center gap-2 mb-4 flex-wrap">
        {([undefined, 'expense', 'income'] as const).map((t) => (
          <button
            key={t ?? 'all'}
            onClick={() => onFiltersChange({ ...filters, type: t })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.type === t
                ? t === 'expense' ? 'bg-rose-100 text-rose-600'
                : t === 'income' ? 'bg-emerald-100 text-emerald-600'
                : 'bg-indigo-100 text-indigo-600'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'expense' ? '💸 支出' : t === 'income' ? '💰 收入' : '📋 全部'}
          </button>
        ))}

        <select
          value={filters.month || ''}
          onChange={(e) => onFiltersChange({ ...filters, month: e.target.value ? Number(e.target.value) : undefined, year: currentYear })}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-500 outline-none focus:border-indigo-300"
        >
          {MONTHS.map((m, i) => <option key={i} value={i || ''}>{m}</option>)}
        </select>

        {transactions.length > 0 && (
          <button onClick={doExport}
            className="ml-auto px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            📥 导出
          </button>
        )}
      </div>

      {/* ── 列表 ── */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {dates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg font-medium text-slate-500 mb-1">还没有交易记录</p>
            <p className="text-sm mb-5">开始记录你的第一笔收支吧</p>
            <button onClick={onAddNew}
              className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-md shadow-indigo-200 transition-all">
              ✏️ 记第一笔
            </button>
          </div>
        )}

        {dates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                📅 {date}
              </span>
              <span className="text-[11px] text-slate-300">{groups[date].length} 笔</span>
            </div>

            <div className="space-y-1.5">
              {groups[date].map((t) => (
                <div key={t.id}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow group">
                  {/* 图标 */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    t.type === 'expense' ? 'bg-rose-50' : 'bg-emerald-50'
                  }`}>
                    {t.category_icon || '📌'}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{t.category_name}</div>
                    {t.note && <div className="text-xs text-slate-400 truncate">{t.note}</div>}
                  </div>

                  {/* 金额 */}
                  <div className={`text-sm font-bold flex-shrink-0 ${
                    t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {t.type === 'expense' ? '-' : '+'}¥{fmt(t.amount)}
                  </div>

                  {/* 操作 — hover 显示 */}
                  <div className="flex-shrink-0 hidden group-hover:flex gap-1">
                    {deleteId === t.id ? (
                      <>
                        <button onClick={() => { onDelete(t.id); setDeleteId(null); }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                          确认
                        </button>
                        <button onClick={() => setDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => onEdit(t)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          编辑
                        </button>
                        <button onClick={() => setDeleteId(t.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
