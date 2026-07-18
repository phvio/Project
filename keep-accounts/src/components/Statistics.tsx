// src/components/Statistics.tsx — 统计报表（新版设计）
import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { MonthlyStats, TrendPoint } from '../types';

const COLORS = [
  '#f43f5e', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Statistics() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => { window.electronAPI.getMonthlyStats(year, month).then(setStats); }, [year, month]);
  useEffect(() => { window.electronAPI.getTrendData(6).then(setTrend); }, []);

  const prev = () => { if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1); };
  const next = () => { if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1); };

  const pieData = (stats?.expenseByCategory || []).map((c) => ({ name: c.name_zh, value: c.total, icon: c.icon }));

  return (
    <div className="h-full overflow-y-auto space-y-5">
      {/* ── 月份选择 ── */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={prev} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow transition-all">◀</button>
        <h2 className="text-lg font-bold text-slate-700 min-w-[100px] text-center">
          {year} 年 {month} 月
        </h2>
        <button onClick={next} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow transition-all">▶</button>
      </div>

      {/* ── 汇总卡片 ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg mx-auto mb-3">💰</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">收入</div>
          <div className="text-xl font-bold text-emerald-500">¥{fmt(stats?.totalIncome || 0)}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-lg mx-auto mb-3">💸</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">支出</div>
          <div className="text-xl font-bold text-rose-500">¥{fmt(stats?.totalExpense || 0)}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg mx-auto mb-3">📊</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">结余</div>
          <div className={`text-xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
            ¥{fmt(stats?.balance || 0)}
          </div>
        </div>
      </div>

      {/* ── 饼图 + 分类排行 ── */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">📊 支出分类分布</h3>
        {pieData.length > 0 ? (
          <div className="flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`¥${fmt(Number(v))}`, '金额']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 max-h-[240px] overflow-y-auto">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 truncate flex-1">{d.icon} {d.name}</span>
                  <span className="text-slate-400 text-xs">¥{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">暂无支出数据</div>
        )}
      </div>

      {/* ── 趋势柱状图 ── */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">📈 近 6 个月趋势</h3>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60}
                tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`¥${fmt(Number(v))}`, '']} />
              <Bar dataKey="income" name="收入" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">暂无趋势数据</div>
        )}
      </div>
    </div>
  );
}
