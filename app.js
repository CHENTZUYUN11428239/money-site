const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const dateInput = document.getElementById("date-input");
const clearAllBtn = document.getElementById("clear-all-btn");

const pieCanvas = document.getElementById("pieChart");
let pieChart = null;

// ===== 類別自訂：抓元素（你 HTML 已經有） =====
const categorySelect = document.getElementById("category-select");
const newCategoryInput = document.getElementById("new-category");
const addCategoryBtn = document.getElementById("add-category-btn");
const removeCategoryBtn = document.getElementById("remove-category-btn");

// 日期預設今天
dateInput.value = new Date().toISOString().split("T")[0];

// ===== records =====
let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
  localStorage.setItem("records", JSON.stringify(records));
}

const fmt = (n) => Number(n || 0).toLocaleString("zh-TW");

// ===== 類別自訂：localStorage =====
const DEFAULT_CATEGORIES = ["飲食", "交通", "娛樂", "其他"];
let categories = JSON.parse(localStorage.getItem("categories")) || DEFAULT_CATEGORIES;

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function normalizeCategory(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function renderCategories(selectedValue) {
  // 若 HTML 沒放這些元素就不做（保險）
  if (!categorySelect) return;

  categorySelect.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  if (selectedValue && categories.includes(selectedValue)) {
    categorySelect.value = selectedValue;
  } else {
    categorySelect.value = categories[0] || "其他";
  }
}

// 將「舊紀錄裡的類別」同步進 categories（避免同學之前亂加分類資料）
function syncCategoriesFromRecords() {
  let changed = false;

  for (const r of records) {
    const cat = normalizeCategory(r.category);
    if (cat && !categories.includes(cat)) {
      categories.push(cat);
      changed = true;
    }
  }

  if (changed) saveCategories();
}

// 新增類別
if (addCategoryBtn && newCategoryInput) {
  addCategoryBtn.addEventListener("click", () => {
    const cat = normalizeCategory(newCategoryInput.value);
    if (!cat) return;

    if (categories.includes(cat)) {
      alert("這個類別已經存在了！");
      renderCategories(cat);
      newCategoryInput.value = "";
      return;
    }

    categories.push(cat);
    saveCategories();
    renderCategories(cat); // 新增後直接選到它
    newCategoryInput.value = "";
  });
}

// 刪除目前類別（只允許刪自訂類別；若已有紀錄使用就不讓刪，避免資料亂）
if (removeCategoryBtn) {
  removeCategoryBtn.addEventListener("click", () => {
    const current = categorySelect?.value;
    if (!current) return;

    if (DEFAULT_CATEGORIES.includes(current)) {
      alert("內建類別不能刪除喔！");
      return;
    }

    const used = records.some((r) => r.category === current);
    if (used) {
      alert("已有紀錄使用此類別，建議不要刪除（或先把那些紀錄改成其他類別）。");
      return;
    }

    if (!confirm(`確定刪除類別「${current}」？`)) return;

    categories = categories.filter((c) => c !== current);
    saveCategories();
    renderCategories();
  });
}

// ===== 計算、渲染 =====
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
  records = records.filter((r) => r.id !== id);
  save();
  renderAll();
});

function renderChart() {
  if (!pieCanvas) return;
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

  // Check if Chart.js is available
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded, skipping chart initialization");
    return;
  }

  const { income, expense } = computeTotals();
  const hasData = income + expense > 0;

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
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (c) =>
              `${c.label}: ${Number(c.raw || 0).toLocaleString("zh-TW")}`,
          },
        },
      },
    },
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
    // ✅ 用下拉目前值（更穩）
    category: categorySelect ? categorySelect.value : (fd.get("category") || ""),
    date: fd.get("date"),
    note: fd.get("note") || "",
  });

  save();
  renderAll();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];

  // reset 會讓下拉回第一個：重新渲染確保一致
  renderCategories(categorySelect?.value);
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

// ✅ 初始化：先同步類別，再渲染下拉，再渲染頁面
syncCategoriesFromRecords();
renderCategories();
renderAll();

// ===== 顏色選擇器功能（保留你同學版本：active / selected） =====
(function () {
  const colorPickerBtn = document.getElementById("color-picker-btn");
  const colorPickerPanel = document.getElementById("color-picker-panel");
  const colorOptions = document.querySelectorAll(".color-option");

  // 如果元素不存在，提早返回
  if (!colorPickerBtn || !colorPickerPanel || colorOptions.length === 0) {
    return;
  }

  // 定義允許的顏色列表
  const allowedColors = Array.from(colorOptions).map((opt) =>
    opt.getAttribute("data-color")
  );

  // 從 localStorage 讀取儲存的背景顏色
  const savedColor = localStorage.getItem("bgColor");
  if (savedColor && allowedColors.includes(savedColor)) {
    document.body.style.background = savedColor;
    updateSelectedOption(savedColor);
  }

  // 切換顏色面板顯示/隱藏
  colorPickerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    colorPickerPanel.classList.toggle("active");
  });

  // 點擊顏色選項
  colorOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const color = option.getAttribute("data-color");

      // 更改背景顏色
      document.body.style.background = color;

      // 儲存到 localStorage
      localStorage.setItem("bgColor", color);

      // 更新選中狀態
      updateSelectedOption(color);

      // 關閉面板
      colorPickerPanel.classList.remove("active");
    });
  });

  // 點擊其他地方關閉面板
  document.addEventListener("click", () => {
    colorPickerPanel.classList.remove("active");
  });

  // 更新選中的顏色選項
  function updateSelectedOption(color) {
    colorOptions.forEach((opt) => {
      if (opt.getAttribute("data-color") === color) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }
})();
