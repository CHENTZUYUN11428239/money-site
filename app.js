const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const dateInput = document.getElementById("date-input");
const clearAllBtn = document.getElementById("clear-all-btn");

const pieCanvas = document.getElementById("pieChart");
let pieChart = null;
let currentChartType = "total"; // 預設為總收支圓餅圖

dateInput.value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

const fmt = (n) => Number(n || 0).toLocaleString("zh-TW");

function computeTotals(filterFn = null) {
  let income = 0, expense = 0;
  const filteredRecords = filterFn ? records.filter(filterFn) : records;
  for (const r of filteredRecords) {
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
  if (!pieCanvas) return;                 // 保險：抓不到就不要畫
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

   // 根據圖表類型選擇過濾條件
  let filterFn = null;
  let chartTitle = "總收支圓餅圖";
  
  if (currentChartType === "month") {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-11 -> 1-12
    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    filterFn = (r) => r.date && r.date.startsWith(monthStr);
    chartTitle = `月收支圓餅圖 (${currentYear}/${currentMonth})`;
  } else if (currentChartType === "year") {
    const currentYear = new Date().getFullYear();
    const yearStr = String(currentYear);
    
    filterFn = (r) => r.date && r.date.startsWith(yearStr);
    chartTitle = `年收支圓餅圖 (${currentYear})`;
  }

  const { income, expense } = computeTotals(filterFn);
  const hasData = (income + expense) > 0;

  const labels = hasData ? ["收入", "支出"] : ["尚無資料", "尚無資料"];
  const data = hasData ? [income, expense] : [1, 1];
  const colors = hasData ? ["#77ddaa", "#ff7b7b"] : ["#eee", "#eee"]; // ✅ 顏色加深，避免看不到

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.options.plugins.title.text = chartTitle;
    pieChart.update();
    return;
  }

  pieChart = new Chart(ctx, {             // ✅ 用 ctx 建圖更穩
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
      maintainAspectRatio: false,         // ✅ 會吃父層高度（剛剛 CSS 已固定）
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: { size: 16, weight: 'bold' },
          padding: { bottom: 10 }
        },
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

  records.push({
    id: Date.now(),
    type: fd.get("type"),
    amount,
    category: fd.get("category") || "",
    date: fd.get("date"),
    note: fd.get("note") || ""
  });

  save();
  renderAll();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
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

/* ===== 圖表類型切換功能 ===== */
const chartTabs = document.querySelectorAll(".chart-tab");

chartTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // 更新活動狀態
    chartTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    // 更新圖表類型並重新渲染
    currentChartType = tab.dataset.type;
    renderChart();
  });
});

/* ===== 背景顏色切換功能 ===== */
const colorBtn = document.getElementById("color-picker-btn");
const colorPanel = document.getElementById("color-picker-panel");
const colorOptions = document.querySelectorAll(".color-option");

// 開關面板
colorBtn.addEventListener("click", () => {
  colorPanel.classList.toggle("active");
});

// 點顏色
colorOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    const color = opt.dataset.color;
    document.body.style.background = color;

    // 記住顏色
    localStorage.setItem("bgColor", color);

    // 樣式選中
    colorOptions.forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");

    colorPanel.classList.remove("active");
  });
});

// 讀取已儲存顏色
const savedColor = localStorage.getItem("bgColor");
if (savedColor) {
  document.body.style.background = savedColor;
  colorOptions.forEach(opt => {
    if (opt.dataset.color === savedColor) {
      opt.classList.add("selected");
    }
  });
}

