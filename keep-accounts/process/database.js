// process/database.js — 数据库初始化和管理
const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

let db = null;
let dbPath = null;

function initDatabase() {
  dbPath = path.join(app.getPath('userData'), 'data.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables();
  seedCategories();
  console.log('✅ 数据库初始化完成:', dbPath);
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name_zh    TEXT NOT NULL,
      type       TEXT NOT NULL,
      icon       TEXT,
      is_builtin INTEGER DEFAULT 0,
      is_hidden  INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      category_id TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      note        TEXT,
      created_at  TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);
}

function seedCategories() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM categories').get();
  if (count.cnt > 0) return;
  const categories = [
    { id: 'food_dining',    name_zh: '餐饮',     type: 'expense', icon: '🍽️', is_builtin: 1, sort_order: 1 },
    { id: 'transport',      name_zh: '交通',     type: 'expense', icon: '🚗', is_builtin: 1, sort_order: 2 },
    { id: 'shopping',       name_zh: '购物',     type: 'expense', icon: '🛒', is_builtin: 1, sort_order: 3 },
    { id: 'housing',        name_zh: '居住',     type: 'expense', icon: '🏠', is_builtin: 1, sort_order: 4 },
    { id: 'entertainment',  name_zh: '娱乐',     type: 'expense', icon: '🎮', is_builtin: 1, sort_order: 5 },
    { id: 'healthcare',     name_zh: '医疗健康', type: 'expense', icon: '💊', is_builtin: 1, sort_order: 6 },
    { id: 'education',      name_zh: '教育学习', type: 'expense', icon: '📚', is_builtin: 1, sort_order: 7 },
    { id: 'communication',  name_zh: '通讯网络', type: 'expense', icon: '📱', is_builtin: 1, sort_order: 8 },
    { id: 'clothing_beauty',name_zh: '服饰美容', type: 'expense', icon: '👗', is_builtin: 1, sort_order: 9 },
    { id: 'social',         name_zh: '人情往来', type: 'expense', icon: '🎁', is_builtin: 1, sort_order: 10 },
    { id: 'pets',           name_zh: '宠物',     type: 'expense', icon: '🐾', is_builtin: 1, sort_order: 11 },
    { id: 'other_expense',  name_zh: '其他支出', type: 'expense', icon: '📦', is_builtin: 1, sort_order: 12 },
    { id: 'salary',         name_zh: '工资',     type: 'income', icon: '💰', is_builtin: 1, sort_order: 1 },
    { id: 'bonus',          name_zh: '奖金',     type: 'income', icon: '🏆', is_builtin: 1, sort_order: 2 },
    { id: 'part_time',      name_zh: '兼职',     type: 'income', icon: '💼', is_builtin: 1, sort_order: 3 },
    { id: 'investment',     name_zh: '投资理财', type: 'income', icon: '📈', is_builtin: 1, sort_order: 4 },
    { id: 'reimbursement',  name_zh: '报销',     type: 'income', icon: '🧾', is_builtin: 1, sort_order: 5 },
    { id: 'other_income',   name_zh: '其他收入', type: 'income', icon: '💵', is_builtin: 1, sort_order: 6 },
  ];
  const insert = db.prepare(
    'INSERT INTO categories (id, name_zh, type, icon, is_builtin, sort_order) VALUES (@id, @name_zh, @type, @icon, @is_builtin, @sort_order)'
  );
  db.transaction((cats) => { for (const cat of cats) insert.run(cat); })(categories);
  console.log('✅ 已插入 18 个预设分类');
}

function getDb() {
  if (!db) throw new Error('数据库尚未初始化');
  return db;
}

module.exports = { initDatabase, getDb };
