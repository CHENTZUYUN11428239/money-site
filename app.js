const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const calendarEl = document.getElementById("calendar");

document.getElementById("date-input").value =
  new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

function renderSummary() {
  let i = 0, e = 0;
  records.forEach(r => r.type === "收入" ? i += r.amount : e += r.amount);
  totalIncomeEl.textContent = i;
  totalExpenseEl.textContent = e;
  balanceEl.textContent = i - e;
}

function renderTable() {
  tbody.innerHTML = "";
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.type}</td>
      <td>${r.amount}</td>
      <td>${r.category}</td>
      <td>${r.note}</td>
      <td><button onclick="del(${r.id})">刪</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCalendar() {
  calendarEl.innerHTML = "";
  const map = {};
  records.forEach(r => {
    map[r.date] = map[r.date] || {收入:0,支出:0};
    map[r.date][r.type] += r.amount;
  });

  Object.keys(map).forEach(d => {
    const div = document.createElement("div");
    div.className = "cal-day " + (map[d].收入 ? "cal-income" : "cal-expense");
    div.textContent = d.split("-")[2];
    calendarEl.appendChild(div);
  });
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
  save();
  renderAll();
  form.reset();
});

window.del = id => {
  records = records.filter(r => r.id !== id);
  save();
  renderAll();
};

function renderAll() {
  renderSummary();
  renderTable();
  renderCalendar();
}

renderAll();

/* 漢堡選單 */
const ham = document.getElementById("hamburger");
const menu = document.getElementById("side-menu");
const overlay = document.getElementById("menu-overlay");

ham.onclick = () => {
  if (menu.classList.contains("open")) {
    menu.classList.remove("open");
    overlay.classList.remove("open");
  } else {
    menu.classList.add("open");
    overlay.classList.add("open");
  }
};

overlay.onclick = () => {
  menu.classList.remove("open");
  overlay.classList.remove("open");
};
