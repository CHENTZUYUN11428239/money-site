const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const dateInput = document.getElementById("date-input");
const clearAllBtn = document.getElementById("clear-all-btn");

const pieCanvas = document.getElementById("pieChart");
let pieChart = null;

dateInput.value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

const fmt = (n) => Number(n || 0).toLocaleString("zh-TW");

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
  if (!pieCanvas) return;                 // 保險：抓不到就不要畫
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded, skipping chart initialization');
    return;
  }

  const { income, expense } = computeTotals();
  const hasData = (income + expense) > 0;

  const labels = hasData ? ["收入", "支出"] : ["尚無資料", "尚無資料"];
  const data = hasData ? [income, expense] : [1, 1];
  const colors = hasData ? ["#77ddaa", "#ff7b7b"] : ["#eee", "#eee"]; // ✅ 顏色加深，避免看不到

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
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

// ===== 顏色選擇器功能 =====
(function() {
  const colorPickerBtn = document.getElementById('color-picker-btn');
  const colorPickerPanel = document.getElementById('color-picker-panel');
  const colorOptions = document.querySelectorAll('.color-option');
  
  // 如果元素不存在，提早返回
  if (!colorPickerBtn || !colorPickerPanel || colorOptions.length === 0) {
    return;
  }
  
  // 定義允許的顏色列表
  const allowedColors = Array.from(colorOptions).map(opt => opt.getAttribute('data-color'));
  
  // 從 localStorage 讀取儲存的背景顏色
  const savedColor = localStorage.getItem('bgColor');
  if (savedColor && allowedColors.includes(savedColor)) {
    document.body.style.background = savedColor;
    updateSelectedOption(savedColor);
  }
  
  // 切換顏色面板顯示/隱藏
  colorPickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    colorPickerPanel.classList.toggle('active');
  });
  
  // 點擊顏色選項
  colorOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = option.getAttribute('data-color');
      
      // 更改背景顏色
      document.body.style.background = color;
      
      // 儲存到 localStorage
      localStorage.setItem('bgColor', color);
      
      // 更新選中狀態
      updateSelectedOption(color);
      
      // 關閉面板
      colorPickerPanel.classList.remove('active');
    });
  });
  
  // 點擊其他地方關閉面板
  document.addEventListener('click', () => {
    colorPickerPanel.classList.remove('active');
  });
  
  // 更新選中的顏色選項
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
