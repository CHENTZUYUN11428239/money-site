// ========== 漢堡選單展開/關閉機制 ==========
const hamburgerBtn = document.getElementById("hamburger");
const sideMenu = document.getElementById("side-menu");
const sideMenuClose = document.getElementById("side-close");
const menuOverlay = document.getElementById("menu-overlay");

function openMenu() {
  sideMenu.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
  hamburgerBtn.setAttribute("aria-expanded", "true");
  menuOverlay.style.display = "block";
}

function closeMenu() {
  sideMenu.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
  hamburgerBtn.setAttribute("aria-expanded", "false");
  menuOverlay.style.display = "none";
}

hamburgerBtn.addEventListener("click", openMenu);
sideMenuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

// 按 menu-link 自動關閉選單
document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', closeMenu, false);
});

// ========== 頁面切換（含月曆） ==========
const calendarSection = document.getElementById('calendar');
const summarySection = document.getElementById('summary');
const txFormSection = document.getElementById('tx-form').closest('section');
const txTableSection = document.getElementById('tx-tbody').closest('section');
const menuLinks = document.querySelectorAll('.menu-link');

function showSectionByHash(hash) {
  summarySection.style.display = "none";
  txFormSection.style.display = "none";
  txTableSection.style.display = "none";
  calendarSection.style.display = "none";
  if (hash === "#summary") summarySection.style.display = "";
  if (hash === "#tx-form") txFormSection.style.display = "";
  if (hash === "#tx-tbody") txTableSection.style.display = "";
  if (hash === "#calendar") {
    calendarSection.style.display = "";
    renderCalendar();
  }
}
// 預設顯示總覽
showSectionByHash('#summary');
menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith("#")) {
      e.preventDefault();
      showSectionByHash(href);
    }
  });
});

// ========== 記帳功能（localStorage 不變） ==========
function getAllRecords() {
  return JSON.parse(localStorage.getItem('txs') || "[]");
}

// --- 新增、刪除全部功能 ---
document.getElementById("tx-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const type = form.type.value;
  const amount = parseInt(form.amount.value) || 0;
  const category = form.category.value;
  const date =
    form.date.value || new Date().toISOString().slice(0, 10);
  const note = form.note.value;
  let records = getAllRecords();
  records.push({ type, amount, category, date, note });
  localStorage.setItem("txs", JSON.stringify(records));
  form.reset();
  updateSummary();
  renderTable();
  renderCalendar();
});

document.getElementById("clear-all-btn").addEventListener("click", function () {
  if (confirm("確定清空所有紀錄嗎？")) {
    localStorage.removeItem("txs");
    updateSummary();
    renderTable();
    renderCalendar();
  }
});
document.getElementById("menu-clear").addEventListener("click", function () {
  if (confirm("確定清空所有紀錄嗎？")) {
    localStorage.removeItem("txs");
    updateSummary();
    renderTable();
    renderCalendar();
  }
});

// --- 表格畫面 ---
function renderTable() {
  const tbody = document.getElementById("tx-tbody");
  const records = getAllRecords();
  tbody.innerHTML = "";
  records.reverse().forEach((rec, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${rec.date || ""}</td>
      <td>${rec.type || ""}</td>
      <td>${rec.amount || ""}</td>
      <td>${rec.category || ""}</td>
      <td>${rec.note || ""}</td>
      <td><button class="del-btn" data-index="${records.length - 1 - i}">刪除</button></td>`;
    tbody.appendChild(tr);
  });
}

// --- 刪除單筆 ---
document.getElementById("tx-tbody").addEventListener("click", function (e) {
  if (e.target.classList.contains("del-btn")) {
    const idx = parseInt(e.target.getAttribute("data-index"));
    let records = getAllRecords();
    records.splice(idx, 1);
    localStorage.setItem("txs", JSON.stringify(records));
    updateSummary();
    renderTable();
    renderCalendar();
  }
});

// --- 總覽統計 ---
function updateSummary() {
  const records = getAllRecords();
  let totalIncome = 0,
    totalExpense = 0;
  records.forEach((rec) => {
    if (rec.type === "支出") totalExpense += Number(rec.amount || 0);
    else totalIncome += Number(rec.amount || 0);
  });
  document.getElementById("total-income").textContent = totalIncome;
  document.getElementById("total-expense").textContent = totalExpense;
  document.getElementById("balance").textContent =
    totalIncome - totalExpense;
}

// 頁面載入初始化
updateSummary();
renderTable();
