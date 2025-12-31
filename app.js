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

//
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
  const { i, e } = totals();
  if (chart) chart.destroy();

  function renderChart() {
  if (!pieCanvas) return;                 // 保險：抓不到就不要畫
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

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

  const amount = Number(fd.get("amount"));
  if (!Number.isFinite(amount) || amount < 0) 
return;
  
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
