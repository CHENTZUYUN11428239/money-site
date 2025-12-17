const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const calendarEl = document.getElementById("calendar");

document.getElementById("date-input").value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() { localStorage.setItem("records", JSON.stringify(records)); }

function renderSummary() {
  let i = 0, e = 0;
  records.forEach(r => r.type === '收入' ? i += r.amount : e += r.amount);
  totalIncomeEl.textContent = i;
  totalExpenseEl.textContent = e;
  balanceEl.textContent = i - e;
}

function renderTable() {
  tbody.innerHTML = "";
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>${r.amount}</td><td>${r.category}</td><td>${r.note}</td><td><button onclick="del(${r.id})">删</button></td>`;
    tbody.appendChild(tr);
  });
}

function renderCalendar() {
  calendarEl.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 生成空白前置格
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarEl.appendChild(empty);
  }

  // 生成日子格
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayDiv = document.createElement("div");
    dayDiv.className = "cal-day";
    dayDiv.textContent = d;

    const record = records.find(r => r.date === dateStr);
    if (record) {
      dayDiv.classList.add(record.type === '收入' ? 'cal-income' : 'cal-expense');
    }

    calendarEl.appendChild(dayDiv);
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(form);
  records.push({
    id: Date.now(),
    type: fd.get("type"),
    amount: +fd.get("amount"),
    category: fd.get("category"),
    date: fd.get("date"),
    note: fd.get("note")
  });
  save(); renderAll(); form.reset();
});

window.del = id => {
  records = records.filter(r => r.id !== id);
  save(); renderAll();
};

function renderAll() { renderSummary(); renderTable(); renderCalendar(); }
renderAll();

/* 漢堡選單：展開 / 收起（更穩定的切換與關閉邏輯） */
const ham = document.getElementById("hamburger");
const menu = document.getElementById("side-menu");
const overlay = document.getElementById("menu-overlay");
const menuClear = document.getElementById("menu-clear");

// 無障礙屬性（非必需，但有助於狀態同步）
ham.setAttribute("aria-controls", "side-menu");
ham.setAttribute("aria-expanded", "false");

function openMenu() {
  menu.classList.add("open");
  overlay.classList.add("open");
  ham.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  menu.classList.remove("open");
  overlay.classList.remove("open");
  ham.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (menu.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
}

// 點擊漢堡按鈕：切換
ham.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleMenu();
});

// 點擊黑色遮罩：關閉
overlay.addEventListener("click", (e) => {
  e.preventDefault();
  closeMenu();
});

// 按下 ESC：關閉
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// 點擊頁面非選單區域：關閉（避免某些情況無法收起）
document.addEventListener("click", (e) => {
  if (!menu.classList.contains("open")) return;
  const clickedInsideMenu = menu.contains(e.target);
  const clickedHamburger = ham.contains(e.target);
  if (!clickedInsideMenu && !clickedHamburger) {
    closeMenu();
  }
});

// 清空按鈕：執行後關閉選單
menuClear.onclick = () => {
  if (confirm("确定清空？")) {
    records = [];
    save();
    renderAll();
    closeMenu();
  }
};
