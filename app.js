const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const clearBtn = document.getElementById("clear-all-btn");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

const calendar = document.getElementById("calendar");

document.getElementById("date-input").value =
  new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
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
      <td><button onclick="del(${r.id})">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSummary() {
  let income = 0, expense = 0;
  records.forEach(r => {
    r.type === "收入" ? income += r.amount : expense += r.amount;
  });
  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  balanceEl.textContent = income - expense;
}

function renderCalendar() {
  calendar.innerHTML = "";
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  const map = {};
  records.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      const day = d.getDate();
      map[day] = (map[day] || 0) + (r.type === "收入" ? r.amount : -r.amount);
    }
  });

  for (let i = 0; i < first; i++) {
    calendar.innerHTML += `<div class="calendar-day empty"></div>`;
  }

  for (let d = 1; d <= days; d++) {
    let cls = "calendar-day";
    let text = d;
    if (map[d] > 0) { cls += " income"; text += ` +${map[d]}`; }
    if (map[d] < 0) { cls += " expense"; text += ` ${map[d]}`; }
    calendar.innerHTML += `<div class="${cls}">${text}</div>`;
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(form);
  records.push({
    id: Date.now(),
    type: fd.get("type"),
    amount: Number(fd.get("amount")),
    category: fd.get("category"),
    date: fd.get("date"),
    note: fd.get("note")
  });
  save();
  renderAll();
  form.reset();
});

function del(id) {
  records = records.filter(r => r.id !== id);
  save();
  renderAll();
}
window.del = del;

clearBtn.onclick = () => {
  if (confirm("確定清空？")) {
    records = [];
    save();
    renderAll();
  }
};

function renderAll() {
  renderTable();
  renderSummary();
  renderCalendar();
}

renderAll();
