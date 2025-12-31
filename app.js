const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const dateInput = document.getElementById("date-input");
const clearBtn = document.getElementById("clear-all-btn");

const categorySelect = document.getElementById("category-select");
const customCategory = document.getElementById("custom-category");

const ctx = document.getElementById("pieChart").getContext("2d");
let chart;

dateInput.value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

function updateCustomInput() {
  if (categorySelect.value === "其他") {
    customCategory.style.display = "block";
  } else {
    customCategory.style.display = "none";
    customCategory.value = "";
  }
}
categorySelect.addEventListener("change", updateCustomInput);
updateCustomInput();

function totals() {
  let i = 0, e = 0;
  records.forEach(r => r.type === "收入" ? i += r.amount : e += r.amount);
  return { i, e, b: i - e };
}

function renderSummary() {
  const { i, e, b } = totals();
  incomeEl.textContent = i;
  expenseEl.textContent = e;
  balanceEl.textContent = b;
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

function renderChart() {
  const { i, e } = totals();
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["收入", "支出"],
      datasets: [{
        data: [i || 1, e || 1],
        backgroundColor: ["#8ee0b5", "#ff9a9a"]
      }]
    }
  });
}

function renderAll() {
  renderSummary();
  renderTable();
  renderChart();
}

form.addEventListener("submit", e => {
  e.preventDefault();

  let category = categorySelect.value;
  if (category === "其他") {
    if (!customCategory.value.trim()) {
      alert("請輸入其他分類");
      return;
    }
    category = customCategory.value.trim(); // ✅ 關鍵
  }

  const fd = new FormData(form);
  records.push({
    id: Date.now(),
    type: fd.get("type"),
    amount: Number(fd.get("amount")),
    category,
    date: fd.get("date"),
    note: fd.get("note") || ""
  });

  save();
  renderAll();
  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  updateCustomInput();
});

clearBtn.onclick = () => {
  if (confirm("確定清空？")) {
    records = [];
    save();
    renderAll();
  }
};

window.del = id => {
  records = records.filter(r => r.id !== id);
  save();
  renderAll();
};

renderAll();
