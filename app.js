/* ===== 漢堡選單與側邊欄 ===== */
const hamburgerBtn = document.getElementById("hamburger-btn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// 開啟側邊欄
function openSidebar() {
  sidebar.classList.add("active");
  sidebarOverlay.classList.add("active");
  hamburgerBtn.classList.add("active");
  document.body.style.overflow = "hidden"; // 防止背景滾動
}

// 關閉側邊欄
function closeSidebar() {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
  hamburgerBtn.classList.remove("active");
  document.body.style.overflow = ""; // 恢復滾動
}

// 漢堡按鈕點擊事件（切換開關）
hamburgerBtn.addEventListener("click", () => {
  if (sidebar.classList.contains("active")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

// 遮罩點擊事件
sidebarOverlay.addEventListener("click", closeSidebar);

// 側邊欄連結點擊後自動關閉
document.querySelectorAll(".sidebar-link").forEach(link => {
  link.addEventListener("click", () => {
    closeSidebar();
  });
});

// 首頁連結點擊事件
document.getElementById("home-link").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeSidebar();
});

/* ===== 使用者認證系統 ===== */
let currentUser = null;

// 取得所有使用者帳號
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

// 儲存使用者帳號
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// 註冊新使用者
function registerUser(username, password) {
  const users = getAllUsers();
  
  if (users[username]) {
    return { success: false, message: "此帳號已存在" };
  }
  
  if (username.length < 4 || username.length > 20) {
    return { success: false, message: "帳號長度須為 4-20 字元" };
  }
  
  if (password.length < 6) {
    return { success: false, message: "密碼長度至少需 6 字元" };
  }
  
  users[username] = {
    password: password,
    createdAt: new Date().toISOString()
  };
  
  saveUsers(users);
  return { success: true, message: "註冊成功！" };
}

// 登入驗證
function loginUser(username, password) {
  const users = getAllUsers();
  
  if (!users[username]) {
    return { success: false, message: "帳號不存在" };
  }
  
  if (users[username].password !== password) {
    return { success: false, message: "密碼錯誤" };
  }
  
  currentUser = username;
  localStorage.setItem("currentUser", username);
  return { success: true, message: "登入成功！" };
}

// 登出
function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
}

// 檢查登入狀態
function checkLoginStatus() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    const users = getAllUsers();
    if (users[savedUser]) {
      currentUser = savedUser;
      return true;
    }
  }
  return false;
}

// 取得當前使用者的記錄
function getUserRecords() {
  if (!currentUser) return [];
  const userDataKey = `records_${currentUser}`;
  return JSON.parse(localStorage.getItem(userDataKey)) || [];
}

// 儲存當前使用者的記錄
function saveUserRecords(records) {
  if (!currentUser) return;
  const userDataKey = `records_${currentUser}`;
  localStorage.setItem(userDataKey, JSON.stringify(records));
}

// UI 更新
function updateAuthUI() {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");
  
  if (currentUser) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userInfo.style.display = "flex";
    usernameDisplay.textContent = currentUser;
  } else {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    userInfo.style.display = "none";
  }
}

// Modal 控制
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const closeLogin = document.getElementById("close-login");
const closeRegister = document.getElementById("close-register");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
  document.getElementById("login-message").textContent = "";
});

registerBtn.addEventListener("click", () => {
  registerModal.style.display = "block";
  document.getElementById("register-message").textContent = "";
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});

closeRegister.addEventListener("click", () => {
  registerModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
  if (e.target === registerModal) {
    registerModal.style.display = "none";
  }
});

// 登入表單
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const messageEl = document.getElementById("login-message");
  
  const result = loginUser(username, password);
  
  if (result.success) {
    messageEl.textContent = result.message;
    messageEl.className = "form-message success";
    setTimeout(() => {
      loginModal.style.display = "none";
      updateAuthUI();
      loadUserData();
    }, 1000);
  } else {
    messageEl.textContent = result.message;
    messageEl.className = "form-message error";
  }
});

// 註冊表單
document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-password-confirm").value;
  const messageEl = document.getElementById("register-message");
  
  if (password !== confirmPassword) {
    messageEl.textContent = "兩次密碼輸入不一致";
    messageEl.className = "form-message error";
    return;
  }
  
  const result = registerUser(username, password);
  
  if (result.success) {
    messageEl.textContent = result.message;
    messageEl.className = "form-message success";
    document.getElementById("register-form").reset();
    setTimeout(() => {
      registerModal.style.display = "none";
    }, 1500);
  } else {
    messageEl.textContent = result.message;
    messageEl.className = "form-message error";
  }
});

// 載入使用者資料
function loadUserData() {
  records = getUserRecords();
  renderAll();
}

// 初始化認證狀態
checkLoginStatus();
updateAuthUI();

/* ===== 原有程式碼 ===== */
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

let records = [];

function save() {
  if (currentUser) {
    saveUserRecords(records);
  }
  // 如果未登入，不儲存資料（避免資料混淆）
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
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded, skipping chart render');
    return;
  }
  
  if (!pieCanvas) return;
  const ctx = pieCanvas.getContext("2d");
  if (!ctx) return;

  try {
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
  } catch (error) {
    console.error('Error rendering chart:', error);
  }
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
  
  // 檢查是否已登入
  if (!currentUser) {
    alert("請先登入才能新增紀錄");
    loginModal.style.display = "block";
    return;
  }
  
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
  if (!currentUser) {
    alert("請先登入");
    return;
  }
  if (!confirm("確定清空所有紀錄？")) return;
  records = [];
  save();
  renderAll();
});

/* ===== 篩選功能 ===== */
let currentFilters = {
  year: null,
  month: null,
  day: null,
  category: null
};

// 更新類別篩選選項
function updateCategoryFilter() {
  const categorySelect = document.getElementById("filter-category");
  const categories = new Set();
  
  // 收集所有出現過的類別
  records.forEach(r => {
    if (r.category) {
      categories.add(r.category);
    }
  });
  
  // 清空並重建選項
  categorySelect.innerHTML = '<option value="">全部類別</option>';
  Array.from(categories).sort().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// 套用篩選
function applyFilters() {
  const year = document.getElementById("filter-year").value;
  const month = document.getElementById("filter-month").value;
  const day = document.getElementById("filter-day").value;
  const category = document.getElementById("filter-category").value;
  
  currentFilters = {
    year: year ? parseInt(year) : null,
    month: month ? parseInt(month) : null,
    day: day ? parseInt(day) : null,
    category: category || null
  };
  
  renderFilteredTable();
}

// 清除篩選
function clearFilters() {
  document.getElementById("filter-year").value = "";
  document.getElementById("filter-month").value = "";
  document.getElementById("filter-day").value = "";
  document.getElementById("filter-category").value = "";
  
  currentFilters = {
    year: null,
    month: null,
    day: null,
    category: null
  };
  
  renderTable();
}

// 渲染篩選後的表格
function renderFilteredTable() {
  tbody.innerHTML = "";
  
  // 篩選記錄
  let filtered = [...records];
  
  // 日期篩選
  if (currentFilters.year || currentFilters.month || currentFilters.day) {
    filtered = filtered.filter(r => {
      const dateParts = r.date.split("-");
      const recordYear = parseInt(dateParts[0]);
      const recordMonth = parseInt(dateParts[1]);
      const recordDay = parseInt(dateParts[2]);
      
      if (currentFilters.year && recordYear !== currentFilters.year) return false;
      if (currentFilters.month && recordMonth !== currentFilters.month) return false;
      if (currentFilters.day && recordDay !== currentFilters.day) return false;
      
      return true;
    });
  }
  
  // 類別篩選
  if (currentFilters.category) {
    filtered = filtered.filter(r => r.category === currentFilters.category);
  }
  
  // 依日期新到舊（同日用 id 排）
  const sorted = filtered.sort((a, b) => {
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

// 篩選按鈕事件
document.getElementById("apply-filter-btn").addEventListener("click", applyFilters);
document.getElementById("clear-filter-btn").addEventListener("click", clearFilters);

function renderAll() {
  renderSummary();
  renderTable();
  renderChart();
  updateCategoryFilter(); // 更新類別篩選選項
}

// 初始化：載入使用者資料
if (currentUser) {
  loadUserData();
} else {
  renderAll();
}

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
