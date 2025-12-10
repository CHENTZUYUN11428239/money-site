// app.js - 取代現有檔案
// 功能：儲存/讀取 localStorage，新增/刪除紀錄，渲染表格與 KPI

const STORAGE_KEY = 'money_site_transactions';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tx-form');
  const tbody = document.getElementById('tx-tbody');
  const totalIncomeEl = document.getElementById('total-income');
  const totalExpenseEl = document.getElementById('total-expense');
  const balanceEl = document.getElementById('balance');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const dateInput = document.getElementById('date-input');

  // 取今天日期為預設（若沒有填）
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
  }

  let transactions = loadTransactions();
  renderTransactions();

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const type = formData.get('type') || '支出';
    const amountRaw = formData.get('amount') || '0';
    const amount = Number(amountRaw);
    if (Number.isNaN(amount) || amount <= 0) {
      alert('請輸入正確的金額（大於 0）');
      return;
    }
    const category = formData.get('category') || '';
    const date = formData.get('date') || new Date().toISOString().slice(0, 10);
    const note = formData.get('note') || '';

    const tx = {
      id: Date.now().toString(), // 簡單唯一 id
      type,
      amount,
      category,
      date,
      note,
    };

    transactions.push(tx);
    saveTransactions(transactions);
    renderTransactions();

    form.reset();
    // 重設日期為今天（讓使用者不用每次填）
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
  });

  clearAllBtn && clearAllBtn.addEventListener('click', () => {
    if (!confirm('確定要清空本機所有紀錄嗎？此動作無法復原。')) return;
    transactions = [];
    saveTransactions(transactions);
    renderTransactions();
  });

  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.error('讀取 localStorage 失敗', err);
      return [];
    }
  }

  function saveTransactions(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (err) {
      console.error('寫入 localStorage 失敗', err);
    }
  }

  function formatCurrency(n) {
    // 簡單千分號格式（整數）
    return n.toLocaleString();
  }

  function renderTransactions() {
    if (!tbody) return;
    tbody.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;

    // 反向顯示（最新在上面）
    const list = [...transactions].reverse();

    for (const tx of list) {
      const tr = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.textContent = tx.date || '';
      tr.appendChild(tdDate);

      const tdType = document.createElement('td');
      tdType.textContent = tx.type || '';
      tr.appendChild(tdType);

      const tdAmount = document.createElement('td');
      tdAmount.textContent = formatCurrency(tx.amount);
      tdAmount.className = tx.type === '收入' ? 'income' : 'expense';
      tr.appendChild(tdAmount);

      const tdCategory = document.createElement('td');
      tdCategory.textContent = tx.category || '';
      tr.appendChild(tdCategory);

      const tdNote = document.createElement('td');
      tdNote.textContent = tx.note || '';
      tr.appendChild(tdNote);

      const tdAction = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.textContent = '刪除';
      delBtn.className = 'btn danger';
      delBtn.addEventListener('click', () => {
        if (!confirm('確定要刪除這筆紀錄嗎？')) return;
        transactions = transactions.filter(t => t.id !== tx.id);
        saveTransactions(transactions);
        renderTransactions();
      });
      tdAction.appendChild(delBtn);
      tr.appendChild(tdAction);

      tbody.appendChild(tr);

      if (tx.type === '收入') totalIncome += Number(tx.amount) || 0;
      else totalExpense += Number(tx.amount) || 0;
    }

    // 更新 KPI
    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(totalExpense);
    if (balanceEl) balanceEl.textContent = formatCurrency(totalIncome - totalExpense);
  }
});
