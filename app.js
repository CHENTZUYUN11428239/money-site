// ==============================
// DOM 物件取得
// ==============================
const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const clearBtn = document.getElementById("clear-all-btn");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

// 設定今日日期
document.getElementById("date-input").value =
  new Date().toISOString().split("T")[0];

// ==============================
// 初始化資料（localStorage）
// ==============================
let records = JSON.parse(localStorage.getItem("records")) || [];

// ==============================
// 儲存資料到 localStorage
// ==============================
function saveRecords() {
  localStorage.setItem("records", JSON.stringify(records));
}

// ==============================
// 渲染表格
// ==============================
function renderTable() {
  tbody.innerHTML = "";

  records.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td class="tag ${r.type === "收入" ? "income" : "expense"}">${r.type}</td>
      <td>${r.amount}</td>
      <td>${r.category}</td>
      <td class="note-cell">${r.note}</td>
      <td>
        <button 
          class="btn danger" 
          style="padding:4px 10px;" 
          onclick="deleteRecord(${r.id})">
          刪除
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==============================
// 渲染 KPI（收入 / 支出 / 結餘）
// ==============================
function renderSummary() {
  let income = 0;
  let expense = 0;

  records.forEach((r) => {
    if (r.type === "收入") income += r.amount;
    else expense += r.amount;
  });

  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  balanceEl.textContent = income - expense;
}

// ==============================
// 新增紀錄
// ==============================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fd = new FormData(form);

  const record = {
    id: Date.now(),
    type: fd.get("type"),
    amount: Number(fd.get("amount")),
    category: fd.get("category"),
    date: fd.get("date") || new Date().toISOString().split("T")[0],
    note: fd.get("note") || ""
  };

  records.push(record);
  saveRecords();

  renderTable();
  renderSummary();

  form.reset();
});

// ==============================
// 刪除紀錄（給 HTML 按鈕用）
// ==============================
function deleteRecord(id) {
  records = records.filter((r) => r.id !== id);
  saveRecords();
  renderTable();
  renderSummary();
}
window.deleteRecord = deleteRecord; // 讓 HTML onclick 找得到

// ==============================
// 清空所有紀錄
// ==============================
clearBtn.addEventListener("click", () => {
  if (confirm("確定要清空所有紀錄嗎？此動作無法復原！")) {
    records = [];
    saveRecords();
    renderTable();
    renderSummary();
  }
});

// ==============================
// 新增：左上漢堡選單行為（不改動既有功能的情況下附加）
// ==============================
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const sideMenu = document.getElementById('side-menu');
  const overlay = document.getElementById('menu-overlay');
  const sideClose = document.getElementById('side-close');
  const menuClearBtn = document.getElementById('menu-clear');

  if (!hamburger || !sideMenu || !overlay) return;

  function openMenu() {
    sideMenu.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    sideMenu.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    const firstLink = sideMenu.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    sideMenu.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.focus();
  }

  hamburger.addEventListener('click', function () {
    const opened = sideMenu.classList.contains('open');
    if (opened) closeMenu();
    else openMenu();
  });

  if (sideClose) {
    sideClose.addEventListener('click', function () {
      closeMenu();
    });
  }

  overlay.addEventListener('click', function () {
    closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  if (menuClearBtn) {
    menuClearBtn.addEventListener('click', function () {
      const clearAllBtn = document.getElementById('clear-all-btn');
      if (clearAllBtn) {
        clearAllBtn.click();
      }
      closeMenu();
    });
  }
});
