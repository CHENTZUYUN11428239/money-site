const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const dateInput = document.getElementById("date-input");
const clearAllBtn = document.getElementById("clear-all-btn");

const pieCanvas = document.getElementById("pieChart");
let pieChart = null;

// ✅ 分類：下拉 + 其他輸入框
const categorySelect = document.getElementById("category-select");
const customCategoryInput = document.getElementById("custom-category");

// 日期預設今天
dateInput.value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

const fmt = (n) => Number(n || 0).toLocaleString("zh-TW");

// ✅ 控制：選「其他」才顯示輸入框
function updateCustomCategoryVisibility() {
  if (!categorySelect || !customCategoryInput) return;

  if (categorySelect.value === "其他") {
    customCategoryInput.style.display = "block";
    customCategoryInput.required = true;
  } else {
    customCategoryInput.style.display = "none";
    customCategoryInput.required = false;
    customCategoryInput.value = "";
  }
}

if (categorySelect) {
  categorySelect.addEventListener("change", updateCustomCategoryVisibility);
  updateCustomCategoryVisibility(); // 初始化
}

function computeTotals() {
  let income = 0, expense = 0;
  for (const r of records) {
    if (r.type === "收入") income += r.amount;
    else expense += r.amount;
  }
  return { income, expense, balance: income - expense };
}

function renderSummary() {
  const { income, expense, balance } = computeTotals();
  totalIncomeEl.textContent = fmt(income);
  totalExpenseEl.textContent = fmt(expense);
  balanceEl.textContent = fmt(balance);
}

function renderTable() {
  tbody.innerHTML = "";

  // 依日期新到舊（同日用 id 排）
  const sorted = [...records].sort((a, b) => {
    if (a.date === b.date) return b.id - a.id;
    return (a.date > b.date) ? -1 : 1;
  });

  for (const r of sorted) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.type}</td>
      <td class="num">${fmt(r.amount)}</td>
      <td>${r.category || ""}</td>
      <td>${r.note || ""}</td>
      <td><button class="btn-del" data-id="${r.id}" type="button">刪除</button></td>
    `;
    tbody.appendChild(tr);
  }
}

// 表格刪除：事件委派（更穩）
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-del");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  records = records.filter(r => r.id !== id);
  save();
  renderAll();
});

function renderChart() {
  if (!pieCanvas) return;
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded, skipping chart initialization");
    return;
  }

  const { income, expense } = computeTotals();
  const hasData = (income + expense) > 0;

  const labels = hasData ? ["收入", "支出"] : ["尚無資料", "尚無資料"];
  const data = hasData ? [income, expense] : [1, 1];
  const colors = hasData ? ["#77ddaa", "#ff7b7b"] : ["#eee", "#eee"];

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
    return;
  }

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (c) => `${c.label}: ${Number(c.raw || 0).toLocaleString("zh-TW")}`
          }
        }
      }
    }
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const amount = Number(fd.get("amount"));
  if (!Number.isFinite(amount) || amount < 0) return;

  // ✅ 分類：若選「其他」就用輸入框，否則用下拉
  let category = fd.get("category") || "";
  if (category === "其他") {
    category = (customCategoryInput?.value || "").trim();
    if (!category) {
      alert("請輸入其他分類名稱");
      customCategoryInput?.focus();
      return;
    }
  }

  records.push({
    id: Date.now(),
    type: fd.get("type"),
    amount,
    category,
    date: fd.get("date"),
    note: fd.get("note") || ""
  });

  save();
  renderAll();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  updateCustomCategoryVisibility(); // reset 後重設顯示狀態
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("確定清空所有紀錄？")) return;
  records = [];
  save();
  renderAll();
});

function renderAll() {
  renderSummary();
  renderTable();
  renderChart();
}

renderAll();

/* ===== 顏色選擇器功能（active / selected + bgColor） ===== */
(function() {
  const colorPickerBtn = document.getElementById('color-picker-btn');
  const colorPickerPanel = document.getElementById('color-picker-panel');
  const colorOptions = document.querySelectorAll('.color-option');

  if (!colorPickerBtn || !colorPickerPanel || colorOptions.length === 0) return;

  const allowedColors = Array.from(colorOptions).map(opt => opt.getAttribute('data-color'));

  const savedColor = localStorage.getItem('bgColor');
  if (savedColor && allowedColors.includes(savedColor)) {
    document.body.style.background = savedColor;
    updateSelectedOption(savedColor);
  }

  colorPickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    colorPickerPanel.classList.toggle('active');
  });

  colorOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = option.getAttribute('data-color');

      document.body.style.background = color;
      localStorage.setItem('bgColor', color);

      updateSelectedOption(color);
      colorPickerPanel.classList.remove('active');
    });
  });

  document.addEventListener('click', () => {
    colorPickerPanel.classList.remove('active');
  });

  function updateSelectedOption(color) {
    colorOptions.forEach(opt => {
      if (opt.getAttribute('data-color') === color) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  }
})();
