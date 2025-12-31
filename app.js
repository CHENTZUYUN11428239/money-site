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

const monthSelector = document.getElementById("month-selector");
const yearSelector = document.getElementById("year-selector");

// ✅ 新增：分類下拉 + 自訂分類輸入框
const categorySelect = document.getElementById("category-select");
const customCategoryInput = document.getElementById("custom-category");

// 取得台灣時區的當天日期 (YYYY-MM-DD 格式)
function getTaiwanDate() {
  const date = new Date();
  // 使用 toLocaleString 取得台灣時區的日期時間
  const taiwanTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const year = taiwanTime.getFullYear();
  const month = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const day = String(taiwanTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 更新日期輸入框為台灣時區的當天日期
function updateDateInput() {
  dateInput.value = getTaiwanDate();
}

// 初始化日期
updateDateInput();

// 計算距離台灣時區下一個午夜的毫秒數
function getMillisecondsUntilTaiwanMidnight() {
  const now = new Date();
  const taiwanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const tomorrow = new Date(taiwanTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // 計算時間差
  const nowInTaiwan = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  return tomorrow - nowInTaiwan;
}

// 設定在台灣時區午夜時自動更新日期
function scheduleNextMidnightUpdate() {
  const msUntilMidnight = getMillisecondsUntilTaiwanMidnight();
  
  setTimeout(() => {
    updateDateInput();
    // 更新後，設定下一次午夜更新
    scheduleNextMidnightUpdate();
  }, msUntilMidnight);
}

// 啟動午夜自動更新機制
scheduleNextMidnightUpdate();

// 初始化月份和年份選擇器
const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

// 動態生成年月選項（從 2020 年 1 月到當前年份+1年 12 月）
const startYear = 2020;
const endYear = currentYear + 1;
const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

for (let year = startYear; year <= endYear; year++) {
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    const monthStr = String(month).padStart(2, '0');
    option.value = `${year}-${monthStr}`;
    option.textContent = `${year}年${month}月`;

    // 預設選擇當前年月
    if (option.value === currentYearMonth) {
      option.selected = true;
    }

    monthSelector.appendChild(option);
  }
}

// 動態生成年份選項（從 2020 年到當前年份+1年）
for (let year = startYear; year <= endYear; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = `${year}年`;
  if (year === currentYear) {
    option.selected = true;
  }
  yearSelector.appendChild(option);
}

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
  if (!pieCanvas) return;
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

  // 根據圖表類型選擇過濾條件
  let filterFn = null;
  let chartTitle = "總收支圓餅圖";

  if (currentChartType === "month") {
    const selectedYearMonth = monthSelector.value; // 格式：YYYY-MM
    const [year, month] = selectedYearMonth.split('-');

    filterFn = (r) => r.date && r.date.startsWith(selectedYearMonth);
    chartTitle = `月收支圓餅圖 (${year}年${parseInt(month)}月)`;
  } else if (currentChartType === "year") {
    const selectedYear = yearSelector.value;
    const yearStr = String(selectedYear);

    filterFn = (r) => r.date && r.date.startsWith(yearStr);
    chartTitle = `年收支圓餅圖 (${selectedYear})`;
  }

  const { income, expense } = computeTotals(filterFn);
  const hasData = (income + expense) > 0;

  const labels = hasData ? ["收入", "支出"] : ["尚無資料", "尚無資料"];
  const data = hasData ? [income, expense] : [1, 1];
  const colors = hasData ? ["#77ddaa", "#ff7b7b"] : ["#eee", "#eee"];

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.options.plugins.title.text = chartTitle;
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

// ✅ 新增：分類選到「其他」才顯示自訂輸入框
function syncCustomCategoryUI() {
  const isOther = categorySelect && categorySelect.value === "其他";
  if (!customCategoryInput) return;

  customCategoryInput.classList.toggle("show", !!isOther);

  if (isOther) {
    customCategoryInput.required = true;
  } else {
    customCategoryInput.required = false;
    customCategoryInput.value = "";
  }
}

if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    syncCustomCategoryUI();
    if (categorySelect.value === "其他" && customCategoryInput) {
      customCategoryInput.focus();
    }
  });
}

// 初始化一次（避免一進來 UI 狀態不一致）
syncCustomCategoryUI();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const amount = Number(fd.get("amount"));
  if (!Number.isFinite(amount) || amount < 0) return;

  // ✅ 新增：category 決策（其他→用自訂）
  let category = fd.get("category") || "";
  if (category === "其他") {
    const custom = (customCategoryInput?.value || "").trim();
    if (!custom) return; // 沒填就不新增（避免存空類別）
    category = custom;
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
  updateDateInput();

  // ✅ 新增：reset 後 UI 回到正常（隱藏自訂類別）
  syncCustomCategoryUI();
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

// 月份和年份選擇器事件監聽
monthSelector.addEventListener("change", () => {
  if (currentChartType === "month") {
    renderChart();
  }
});

yearSelector.addEventListener("change", () => {
  if (currentChartType === "year") {
    renderChart();
  }
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
