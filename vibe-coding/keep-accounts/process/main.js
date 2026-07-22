// process/main.js — Electron 主进程
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const { initDatabase, getDb } = require('./database.js');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 720,
    minWidth: 800, minHeight: 600,
    title: '生活财务小管家',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  console.log('✅ Electron 主进程已就绪');
  initDatabase();
  createWindow();
  registerIpcHandlers();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpcHandlers() {
  const db = getDb();

  ipcMain.handle('get-transactions', (_event, filters = {}) => {
    let sql = 'SELECT t.*, c.name_zh as category_name, c.icon as category_icon FROM transactions t JOIN categories c ON t.category_id = c.id WHERE 1=1';
    const params = [];
    if (filters.type) { sql += ' AND t.type = ?'; params.push(filters.type); }
    if (filters.category_id) { sql += ' AND t.category_id = ?'; params.push(filters.category_id); }
    if (filters.year && filters.month) { const p = `${filters.year}-${String(filters.month).padStart(2,'0')}`; sql += ' AND t.date LIKE ?'; params.push(p+'%'); }
    if (filters.year && !filters.month) { sql += ' AND t.date LIKE ?'; params.push(filters.year+'%'); }
    sql += ' ORDER BY t.date DESC, t.created_at DESC';
    if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
    return db.prepare(sql).all(...params);
  });

  ipcMain.handle('add-transaction', (_event, t) => {
    const now = new Date().toISOString().replace('T',' ').substring(0,19);
    const r = db.prepare('INSERT INTO transactions (type,amount,category_id,date,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(t.type,t.amount,t.category_id,t.date,t.note||'',now,now);
    return { id: r.lastInsertRowid, ...t, created_at: now, updated_at: now };
  });

  ipcMain.handle('update-transaction', (_event, id, t) => {
    const now = new Date().toISOString().replace('T',' ').substring(0,19);
    db.prepare('UPDATE transactions SET type=?,amount=?,category_id=?,date=?,note=?,updated_at=? WHERE id=?').run(t.type,t.amount,t.category_id,t.date,t.note||'',now,id);
    return { id, ...t, updated_at: now };
  });

  ipcMain.handle('delete-transaction', (_event, id) => {
    db.prepare('DELETE FROM transactions WHERE id=?').run(id);
    return { success: true };
  });

  ipcMain.handle('get-categories', (_event, type) => {
    let sql = 'SELECT * FROM categories WHERE is_hidden=0'; const params = [];
    if (type) { sql += ' AND type=?'; params.push(type); }
    sql += ' ORDER BY sort_order ASC';
    return db.prepare(sql).all(...params);
  });

  ipcMain.handle('get-all-categories', () => db.prepare('SELECT * FROM categories ORDER BY type, sort_order ASC').all());

  ipcMain.handle('add-category', (_event, cat) => {
    const m = db.prepare('SELECT MAX(sort_order) as m FROM categories WHERE type=?').get(cat.type);
    db.prepare('INSERT INTO categories (id,name_zh,type,icon,is_builtin,is_hidden,sort_order) VALUES (?,?,?,?,0,0,?)').run(cat.id,cat.name_zh,cat.type,cat.icon||'📌',(m.m||0)+1);
    return { ...cat, is_builtin: 0, is_hidden: 0 };
  });

  ipcMain.handle('toggle-category-hidden', (_event, id, hidden) => {
    db.prepare('UPDATE categories SET is_hidden=? WHERE id=? AND is_builtin=1').run(hidden?1:0,id);
    return { success: true };
  });

  ipcMain.handle('get-monthly-stats', (_event, year, month) => {
    const prefix = `${year}-${String(month).padStart(2,'0')}`;
    const s = db.prepare('SELECT type, SUM(amount) as total FROM transactions WHERE date LIKE ? GROUP BY type').all(prefix+'%');
    let ti=0,te=0;
    for (const r of s) { if (r.type==='income') ti=r.total; if (r.type==='expense') te=r.total; }
    const ec = db.prepare("SELECT c.name_zh, c.icon, SUM(t.amount) as total FROM transactions t JOIN categories c ON t.category_id=c.id WHERE t.date LIKE ? AND t.type='expense' GROUP BY t.category_id ORDER BY total DESC").all(prefix+'%');
    return { year, month, totalIncome: ti, totalExpense: te, balance: ti-te, expenseByCategory: ec };
  });

  ipcMain.handle('get-trend-data', (_event, months=6) => {
    const r=[]; const now=new Date();
    for (let i=months-1;i>=0;i--) {
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const y=d.getFullYear(),m=d.getMonth()+1;
      const prefix=`${y}-${String(m).padStart(2,'0')}`;
      const s=db.prepare('SELECT type,SUM(amount) as total FROM transactions WHERE date LIKE ? GROUP BY type').all(prefix+'%');
      let inc=0,exp=0;
      for (const row of s) { if(row.type==='income')inc=row.total; if(row.type==='expense')exp=row.total; }
      r.push({year:y,month:m,label:`${m}月`,income:inc,expense:exp});
    }
    return r;
  });

  // ===== CSV 导出 =====
  ipcMain.handle('export-csv', async () => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '导出账单数据',
      defaultPath: `账单_${new Date().toISOString().substring(0, 10)}.csv`,
      filters: [{ name: 'CSV 文件', extensions: ['csv'] }],
    });

    if (!filePath) return { success: false, message: '已取消' };

    // 获取所有交易数据（含分类信息）
    const rows = db.prepare(`
      SELECT t.date, t.type, c.name_zh, c.icon, t.amount, t.note
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.created_at DESC
    `).all();

    // 生成 CSV 内容（BOM 确保 Excel 正确识别中文）
    let csv = '﻿日期,类型,分类,金额,备注\n';
    for (const r of rows) {
      const typeLabel = r.type === 'expense' ? '支出' : '收入';
      const amount = r.type === 'expense' ? -r.amount : r.amount;
      const note = (r.note || '').replace(/"/g, '""'); // 转义双引号
      csv += `${r.date},${typeLabel},${r.icon}${r.name_zh},${amount},"${note}"\n`;
    }

    fs.writeFileSync(filePath, csv, 'utf-8');
    return { success: true, filePath };
  });
}
