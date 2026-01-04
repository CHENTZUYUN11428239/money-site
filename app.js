/* ===== 頁面路由系統 ===== */
let currentPage = 'main'; // 'main' 或 'groups'
let currentGroup = null; // 當前選擇的群組

/* ===== 常數定義 ===== */
const GROUP_PREFIX = '[群組]'; // 群組同步到個人時的分類前綴

function showPage(pageName) {
  const mainPage = document.getElementById('main-page');
  const groupsPage = document.getElementById('groups-page');
  const addGroupBtn = document.getElementById('add-group-btn');
  const addMemberBtnFixed = document.getElementById('add-member-btn-fixed');
  const membersDisplayFixed = document.getElementById('members-display-fixed');
  
  if (pageName === 'main') {
    mainPage.style.display = 'block';
    groupsPage.style.display = 'none';
    currentPage = 'main';
    // 隱藏新增群組按鈕（個人頁面不顯示）
    if (addGroupBtn) {
      addGroupBtn.style.display = 'none';
    }
    // 隱藏新增組員按鈕（個人頁面不顯示）
    if (addMemberBtnFixed) {
      addMemberBtnFixed.style.display = 'none';
    }
    // 隱藏組員列表（個人頁面不顯示）
    if (membersDisplayFixed) {
      membersDisplayFixed.style.display = 'none';
    }
  } else if (pageName === 'groups') {
    mainPage.style.display = 'none';
    groupsPage.style.display = 'block';
    currentPage = 'groups';
    // 顯示新增群組按鈕（群組頁面才顯示）
    if (addGroupBtn && currentUser) {
      addGroupBtn.style.display = 'inline-block';
    }
    // 顯示新增組員按鈕（群組頁面且有選擇群組才顯示）
    if (addMemberBtnFixed && currentUser && currentGroup) {
      addMemberBtnFixed.style.display = 'inline-block';
    }
    // 顯示組員列表（群組頁面且有選擇群組才顯示）
    if (membersDisplayFixed && currentUser && currentGroup) {
      membersDisplayFixed.style.display = 'block';
      renderMembersDisplayFixed();
    }
    // 更新群組標題和說明
    updateGroupHeader();
    // 重新渲染側邊欄
    renderGroupsInSidebar();
  }
}

// 更新群組頁面的標題和說明
function updateGroupHeader() {
  const groupTitle = document.getElementById('group-title');
  const groupDescription = document.getElementById('group-description');
  
  if (!groupTitle || !groupDescription) return;
  
  if (currentGroup) {
    // 使用當前群組的名稱和說明
    groupTitle.textContent = currentGroup.name;
    groupDescription.textContent = currentGroup.description || '與好友一起記帳，共同管理群組支出 👥💰';
  } else {
    // 如果沒有當前群組，使用預設值
    groupTitle.textContent = '群組';
    groupDescription.textContent = '與好友一起記帳，共同管理群組支出 👥💰';
  }
}

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

// 首頁連結點擊事件
document.getElementById("home-link").addEventListener("click", (e) => {
  e.preventDefault();
  showPage('main');
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeSidebar();
});

// 新增組員按鈕點擊事件（固定在右側）
const addMemberBtnFixed = document.getElementById("add-member-btn-fixed");
if (addMemberBtnFixed) {
  addMemberBtnFixed.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentUser && currentGroup) {
      openAddMemberModal();
    } else if (!currentUser) {
      alert("請先登入");
    } else {
      alert("請先選擇一個群組");
    }
  });
}

// 群組標題點擊事件（展開/收起群組列表）
const groupsHeader = document.getElementById("groups-header");
const groupsList = document.getElementById("groups-list");

groupsHeader.addEventListener("click", () => {
  const isExpanded = groupsList.style.display === "block";
  groupsList.style.display = isExpanded ? "none" : "block";
  groupsHeader.classList.toggle("expanded", !isExpanded);
});

/* ===== 群組管理 ===== */
let userGroups = []; // Store user's groups

// Get a single group by ID from global storage
function getGroup(groupId) {
  const data = localStorage.getItem(`group_${groupId}`);
  return data ? JSON.parse(data) : null;
}

// Save a single group to global storage
function saveGroup(group) {
  localStorage.setItem(`group_${group.id}`, JSON.stringify(group));
}

// Get the list of group IDs that current user belongs to
function getUserGroupIds() {
  if (!currentUser) return [];
  const data = localStorage.getItem(`user_groups_${currentUser}`);
  return data ? JSON.parse(data) : [];
}

// Save the list of group IDs that current user belongs to
function saveUserGroupIds(groupIds) {
  if (!currentUser) return;
  localStorage.setItem(`user_groups_${currentUser}`, JSON.stringify(groupIds));
}

// Load groups that current user belongs to
function loadGroups() {
  if (!currentUser) return [];
  const groupIds = getUserGroupIds();
  const groups = [];
  for (const groupId of groupIds) {
    const group = getGroup(groupId);
    if (group) {
      groups.push(group);
    }
  }
  return groups;
}

// Add current user to a group
function addUserToGroup(groupId) {
  if (!currentUser) return;
  const groupIds = getUserGroupIds();
  if (!groupIds.includes(groupId)) {
    groupIds.push(groupId);
    saveUserGroupIds(groupIds);
  }
  
  // Also update the group's member list
  const group = getGroup(groupId);
  if (group) {
    if (!group.users) group.users = [];
    if (!group.users.includes(currentUser)) {
      group.users.push(currentUser);
      saveGroup(group);
    }
  }
}

// Render groups in sidebar
function renderGroupsInSidebar() {
  const groupsList = document.getElementById("groups-list");
  userGroups = loadGroups();
  
  groupsList.innerHTML = "";
  
  // Add "新增群組" link at the top
  const addGroupLink = document.createElement("a");
  addGroupLink.className = "sidebar-group-item add-group-link";
  addGroupLink.href = "#";
  addGroupLink.textContent = "+ 新增群組";
  addGroupLink.style.fontWeight = "bold";
  addGroupLink.style.color = "#3498db";
  addGroupLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (addGroupModal) {
      addGroupModal.classList.add("show");
    }
    closeSidebar();
  });
  groupsList.appendChild(addGroupLink);
  
  if (userGroups.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.padding = "12px 20px 12px 40px";
    emptyMsg.style.color = "#999";
    emptyMsg.style.fontSize = "13px";
    emptyMsg.textContent = "尚無群組";
    groupsList.appendChild(emptyMsg);
    return;
  }
  
  userGroups.forEach(group => {
    const groupItem = document.createElement("a");
    groupItem.className = "sidebar-group-item";
    groupItem.href = "#";
    groupItem.textContent = group.name;
    groupItem.dataset.groupId = group.id;
    
    // 左鍵點擊：選擇群組
    groupItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentGroup = group; // 設置當前群組
      loadRecordsGroups(); // 載入該群組的紀錄
      showPage('groups');
      updateGroupHeader(); // 更新群組標題和說明
      renderRecordsGroups(); // 重新渲染紀錄
      updateSummaryGroups(); // 更新統計
      renderChartGroups(); // 更新圓餅圖
      renderGroupsInSidebar(); // 重新渲染側邊欄
      
      // 顯示固定位置的按鈕和列表
      const addMemberBtnFixed = document.getElementById('add-member-btn-fixed');
      if (addMemberBtnFixed) {
        addMemberBtnFixed.style.display = 'inline-block';
      }
      renderMembersDisplayFixed(); // 顯示固定位置的組員列表
      
      closeSidebar();
    });
    
    // 右鍵點擊：顯示選單
    groupItem.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showGroupContextMenu(e, group);
    });
    
    groupsList.appendChild(groupItem);
  });
}

// 顯示群組右鍵選單
let contextMenuTargetGroup = null;

function showGroupContextMenu(e, group) {
  const contextMenu = document.getElementById('group-context-menu');
  if (!contextMenu) return;
  
  contextMenuTargetGroup = group;
  
  // 設置選單位置
  contextMenu.style.display = 'block';
  contextMenu.style.left = e.pageX + 'px';
  contextMenu.style.top = e.pageY + 'px';
}

// 隱藏群組右鍵選單
function hideGroupContextMenu() {
  const contextMenu = document.getElementById('group-context-menu');
  if (contextMenu) {
    contextMenu.style.display = 'none';
  }
  contextMenuTargetGroup = null;
}

// 點擊其他地方隱藏選單
document.addEventListener('click', (e) => {
  const contextMenu = document.getElementById('group-context-menu');
  if (contextMenu && !contextMenu.contains(e.target)) {
    hideGroupContextMenu();
  }
});

// 編輯群組說明
const editGroupModal = document.getElementById('edit-group-modal');
const editGroupModalClose = document.getElementById('edit-group-modal-close');
const editGroupModalCancel = document.getElementById('edit-group-modal-cancel');
const editGroupForm = document.getElementById('edit-group-form');

if (editGroupModalClose) {
  editGroupModalClose.addEventListener('click', () => {
    editGroupModal.classList.remove('show');
  });
}

if (editGroupModalCancel) {
  editGroupModalCancel.addEventListener('click', () => {
    editGroupModal.classList.remove('show');
  });
}

if (editGroupModal) {
  editGroupModal.addEventListener('click', (e) => {
    if (e.target === editGroupModal) {
      editGroupModal.classList.remove('show');
    }
  });
}

if (editGroupForm) {
  editGroupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!contextMenuTargetGroup) return;
    
    const descInput = document.getElementById('edit-group-desc-input');
    const newDescription = descInput.value.trim();
    
    // 更新群組說明
    contextMenuTargetGroup.description = newDescription;
    saveGroup(contextMenuTargetGroup);
    
    // 如果是當前群組，更新顯示
    if (currentGroup && currentGroup.id === contextMenuTargetGroup.id) {
      currentGroup.description = newDescription;
      updateGroupHeader();
    }
    
    // 關閉 modal
    editGroupModal.classList.remove('show');
    hideGroupContextMenu();
    
    alert('群組說明已更新！');
  });
}

// 編輯群組名稱 modal
const editGroupNameModal = document.getElementById('edit-group-name-modal');
const editGroupNameModalClose = document.getElementById('edit-group-name-modal-close');
const editGroupNameModalCancel = document.getElementById('edit-group-name-modal-cancel');
const editGroupNameForm = document.getElementById('edit-group-name-form');

if (editGroupNameModalClose) {
  editGroupNameModalClose.addEventListener('click', () => {
    if (editGroupNameModal) {
      editGroupNameModal.classList.remove('show');
    }
  });
}

if (editGroupNameModalCancel) {
  editGroupNameModalCancel.addEventListener('click', () => {
    if (editGroupNameModal) {
      editGroupNameModal.classList.remove('show');
    }
  });
}

if (editGroupNameModal) {
  editGroupNameModal.addEventListener('click', (e) => {
    if (e.target === editGroupNameModal) {
      editGroupNameModal.classList.remove('show');
    }
  });
}

if (editGroupNameForm) {
  editGroupNameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Debug log
    
    const nameInput = document.getElementById('edit-group-name-input');
    const newName = nameInput.value.trim();
    const groupId = parseInt(nameInput.getAttribute('data-group-id'), 10);
    
    if (isNaN(groupId) || groupId <= 0) {
      console.log('No group ID found'); // Debug log
      alert('無法找到群組資料！');
      return;
    }
    
    if (!newName) {
      alert('請輸入群組名稱！');
      return;
    }
    
    // 從 storage 載入群組以確保資料最新
    const groupToEdit = getGroup(groupId);
    if (!groupToEdit) {
      alert('群組不存在！');
      return;
    }
    
    // 更新群組名稱
    const oldName = groupToEdit.name;
    groupToEdit.name = newName;
    saveGroup(groupToEdit);
    
    // 如果是當前群組，更新顯示
    if (currentGroup && currentGroup.id === groupId) {
      currentGroup.name = newName;
      updateGroupHeader();
    }
    
    // 重新渲染側邊欄以顯示新名稱
    renderGroupsInSidebar();
    
    // 關閉 modal
    if (editGroupNameModal) {
      editGroupNameModal.classList.remove('show');
    }
    
    alert(`群組名稱已從「${oldName}」更新為「${newName}」！`);
  });
} else {
  console.log('Edit group name form not found'); // Debug log
}

// 右鍵選單項目點擊事件
const contextEditGroupName = document.getElementById('context-edit-group-name');
const contextEditGroup = document.getElementById('context-edit-group');
const contextDeleteGroup = document.getElementById('context-delete-group');

if (contextEditGroupName) {
  contextEditGroupName.addEventListener('click', () => {
    if (!contextMenuTargetGroup) return;
    
    // 保存群組引用以供 form submit 使用
    // 因為 hideGroupContextMenu() 會將 contextMenuTargetGroup 設為 null
    const groupToEdit = contextMenuTargetGroup;
    
    // 填入當前群組名稱
    document.getElementById('edit-group-name-input').value = groupToEdit.name;
    document.getElementById('edit-group-name-input').setAttribute('data-group-id', groupToEdit.id);
    
    // 顯示 modal
    if (editGroupNameModal) {
      editGroupNameModal.classList.add('show');
    }
    hideGroupContextMenu();
  });
}

if (contextEditGroup) {
  contextEditGroup.addEventListener('click', () => {
    if (!contextMenuTargetGroup) return;
    
    // 填入群組資料
    document.getElementById('edit-group-name').value = contextMenuTargetGroup.name;
    document.getElementById('edit-group-desc-input').value = contextMenuTargetGroup.description || '';
    
    // 顯示 modal
    editGroupModal.classList.add('show');
    hideGroupContextMenu();
  });
}

if (contextDeleteGroup) {
  contextDeleteGroup.addEventListener('click', () => {
    if (!contextMenuTargetGroup) return;
    
    const groupName = contextMenuTargetGroup.name;
    const groupId = contextMenuTargetGroup.id;
    
    if (!confirm(`確定要刪除群組「${groupName}」嗎？\n\n刪除後，該群組的所有資料將永久移除。`)) {
      hideGroupContextMenu();
      return;
    }
    
    // 刪除群組資料
    // 1. 從使用者的群組列表中移除
    const userGroupIds = getUserGroupIds();
    const updatedGroupIds = userGroupIds.filter(id => id !== groupId);
    saveUserGroupIds(updatedGroupIds);
    
    // 2. 刪除群組本身
    localStorage.removeItem(`group_${groupId}`);
    
    // 3. 刪除群組相關資料
    localStorage.removeItem(`records_group_${groupId}`);
    localStorage.removeItem(`members_group_${groupId}`);
    
    // 4. 如果是當前群組，清空當前群組
    if (currentGroup && currentGroup.id === groupId) {
      currentGroup = null;
      showPage('main');
    }
    
    // 5. 重新渲染側邊欄
    renderGroupsInSidebar();
    hideGroupContextMenu();
    
    alert(`群組「${groupName}」已刪除！`);
  });
}

// Add Group Modal
const addGroupModal = document.getElementById("add-group-modal");
const addGroupModalClose = document.getElementById("add-group-modal-close");
const addGroupModalCancel = document.getElementById("add-group-modal-cancel");
const addGroupForm = document.getElementById("add-group-form");

// Get addGroupBtn reference (will be used later after it's declared)
let addGroupBtn;

// Initialize modal after DOM is ready
function initializeAddGroupModal() {
  addGroupBtn = document.getElementById("add-group-btn");
  
  if (!addGroupBtn) {
    console.warn("addGroupBtn not found, will initialize later");
    return;
  }
  
  // Open modal
  addGroupBtn.addEventListener("click", () => {
    if (addGroupModal) {
      addGroupModal.classList.add("show");
    }
  });
}

// Close modal
function closeAddGroupModal() {
  if (addGroupModal) {
    addGroupModal.classList.remove("show");
  }
  if (addGroupForm) {
    addGroupForm.reset();
  }
}

if (addGroupModalClose) {
  addGroupModalClose.addEventListener("click", closeAddGroupModal);
}

if (addGroupModalCancel) {
  addGroupModalCancel.addEventListener("click", closeAddGroupModal);
}

// Close modal when clicking outside
if (addGroupModal) {
  addGroupModal.addEventListener("click", (e) => {
    if (e.target === addGroupModal) {
      closeAddGroupModal();
    }
  });
}

// Handle form submission
if (addGroupForm) {
  addGroupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const groupNameInput = document.getElementById("group-name-input");
    const groupDescInput = document.getElementById("group-desc-input");
    
    if (!groupNameInput || !groupDescInput) {
      console.error("Form input elements not found");
      return;
    }
    
    const groupName = groupNameInput.value.trim();
    const groupDesc = groupDescInput.value.trim();
    
    if (!groupName) {
      alert("請輸入群組名稱");
      return;
    }
    
    // Check if group name already exists
    const existingGroups = loadGroups();
    if (existingGroups.some(g => g.name === groupName)) {
      alert("群組名稱已存在，請使用其他名稱");
      return;
    }
    
    // Create new group
    const newGroup = {
      id: Date.now(),
      name: groupName,
      description: groupDesc,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      users: [currentUser] // Add creator to the group
    };
    
    // Save group to global storage
    saveGroup(newGroup);
    
    // Add group to current user's group list
    addUserToGroup(newGroup.id);
    
    // 設置為當前群組
    currentGroup = newGroup;
    
    // 載入該群組的紀錄（新群組一開始是空的）
    loadRecordsGroups();
    
    // Update UI
    renderGroupsInSidebar();
    closeAddGroupModal();
    
    alert(`群組「${groupName}」已成功建立！`);
    
    // Switch to groups page
    showPage('groups');
    updateGroupHeader(); // 更新群組標題和說明
    renderRecordsGroups(); // 重新渲染紀錄
    updateSummaryGroups(); // 更新統計
    renderChartGroups(); // 更新圓餅圖
  });
}

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
  currentGroup = null; // 清除當前群組
  localStorage.removeItem("currentUser");
  
  // 重置所有資料為初始狀態
  records = [];
  recordsGroups = [];
  userGroups = [];
  categories = ["飲食", "交通", "娛樂", "購物", "其他"];
  categoriesGroups = ["飲食", "交通", "娛樂", "購物", "其他"];
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
  const addGroupBtn = document.getElementById("add-group-btn");
  
  if (currentUser) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userInfo.style.display = "flex";
    usernameDisplay.textContent = currentUser;
    // 只在群組頁面顯示新增群組按鈕
    if (addGroupBtn && currentPage === 'groups') {
      addGroupBtn.style.display = "block";
    } else if (addGroupBtn) {
      addGroupBtn.style.display = "none";
    }
    // Render groups in sidebar
    renderGroupsInSidebar();
  } else {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    userInfo.style.display = "none";
    // 未登入時隱藏新增群組按鈕
    if (addGroupBtn) {
      addGroupBtn.style.display = "none";
    }
  }
}

// Modal 控制
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const closeLogin = document.getElementById("close-login");
const closeRegister = document.getElementById("close-register");
const logoutBtn = document.getElementById("logout-btn");

// 登出按鈕事件
logoutBtn.addEventListener("click", () => {
  if (confirm("確定要登出嗎？")) {
    logoutUser();
    updateAuthUI();
    
    // 重置個人頁面顯示
    renderRecords();
    renderSummary();
    renderChart();
    
    // 重置群組頁面顯示
    renderRecordsGroups();
    updateSummaryGroups();
    renderChartGroups();
    updateGroupHeader();
    
    alert("已成功登出");
  }
});


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

// Initialize add group modal
initializeAddGroupModal();

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

// 初始化選擇器顯示狀態 - 預設顯示總收支，隱藏月/年選擇器
monthSelector.style.display = "none";
yearSelector.style.display = "none";

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
  
  // Apply dynamic color to balance: green if positive, red if negative, default if zero
  if (balance > 0) {
    balanceEl.className = "kpi income";
  } else if (balance < 0) {
    balanceEl.className = "kpi expense";
  } else {
    balanceEl.className = "kpi balance";
  }
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
    } else if (currentChartType === "category") {
      chartTitle = "類別圓餅圖";
    }

    // Category chart logic
    if (currentChartType === "category") {
      const filteredRecords = filterFn ? records.filter(filterFn) : records;
      const categoryData = {};
      
      filteredRecords.forEach(r => {
        const key = `${r.type}-${r.category}`;
        if (!categoryData[key]) {
          categoryData[key] = { type: r.type, category: r.category, amount: 0 };
        }
        categoryData[key].amount += r.amount;
      });
      
      const labels = [];
      const data = [];
      const colors = [];
      
      // Generate colors for categories
      const greenShades = ['#2ecc71', '#27ae60', '#16a085', '#1abc9c', '#00b894', '#00cec9'];
      const redShades = ['#e74c3c', '#c0392b', '#e17055', '#d63031', '#ff7675', '#fd79a8'];
      
      // Sort by type first (收入 first, then 支出) to group same colors together
      const sortedData = Object.values(categoryData).sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === '收入' ? -1 : 1;
      });
      
      let greenIndex = 0;
      let redIndex = 0;
      
      sortedData.forEach(item => {
        labels.push(`${item.category}(${item.type})`);
        data.push(item.amount);
        if (item.type === '收入') {
          colors.push(greenShades[greenIndex % greenShades.length]);
          greenIndex++;
        } else {
          colors.push(redShades[redIndex % redShades.length]);
          redIndex++;
        }
      });
      
      const hasData = data.length > 0 && data.some(d => d > 0);
      
      if (pieChart) {
        pieChart.data.labels = hasData ? labels : ["尚無資料"];
        pieChart.data.datasets[0].data = hasData ? data : [1];
        pieChart.data.datasets[0].backgroundColor = hasData ? colors : ["#eee"];
        pieChart.options.plugins.title.text = chartTitle;
        pieChart.update();
        return;
      }

      pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: hasData ? labels : ["尚無資料"],
          datasets: [{
            data: hasData ? data : [1],
            backgroundColor: hasData ? colors : ["#eee"],
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
      return;
    }

    // Original total/income/expense chart logic
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

if (chartTabs && chartTabs.length > 0) {
  chartTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // 更新活動狀態
      chartTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // 更新圖表類型並重新渲染
      currentChartType = tab.dataset.type;
      
      // 控制選擇器顯示/隱藏
      if (currentChartType === "month") {
        if (monthSelector) monthSelector.style.display = "inline-block";
        if (yearSelector) yearSelector.style.display = "none";
      } else if (currentChartType === "year") {
        if (monthSelector) monthSelector.style.display = "none";
        if (yearSelector) yearSelector.style.display = "inline-block";
      } else {
        if (monthSelector) monthSelector.style.display = "none";
        if (yearSelector) yearSelector.style.display = "none";
      }
      
      renderChart();
    });
  });
}

// 月份和年份選擇器事件監聽
if (monthSelector) {
  monthSelector.addEventListener("change", () => {
    if (currentChartType === "month") {
      renderChart();
    }
  });
}

if (yearSelector) {
  yearSelector.addEventListener("change", () => {
    if (currentChartType === "year") {
      renderChart();
    }
  });
}

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

/* ===== 群組頁面功能（複製個人頁面） ===== */
// Note: This is a complete duplicate of the personal page functionality for groups page
// In the future, this could be refactored to share code between pages

// 群組頁面的顏色選擇器
const colorPickerBtnGroups = document.getElementById("color-picker-btn-groups");
const colorPickerPanelGroups = document.getElementById("color-picker-panel-groups");
const colorOptionsGroups = document.querySelectorAll("#color-picker-panel-groups .color-option");

colorPickerBtnGroups.addEventListener("click", (e) => {
  e.stopPropagation();
  colorPickerPanelGroups.classList.toggle("active");
});

colorOptionsGroups.forEach(option => {
  option.addEventListener("click", () => {
    const color = option.dataset.color;
    document.body.style.background = color;
    localStorage.setItem("bgColor", color);
    
    colorOptionsGroups.forEach(opt => opt.classList.remove("selected"));
    option.classList.add("selected");
    
    colorPickerPanelGroups.classList.remove("active");
  });
});

// 群組頁面的表單和資料管理
const formGroups = document.getElementById("tx-form-groups");
const tbodyGroups = document.getElementById("tx-tbody-groups");
const totalIncomeElGroups = document.getElementById("total-income-groups");
const totalExpenseElGroups = document.getElementById("total-expense-groups");
const balanceElGroups = document.getElementById("balance-groups");
const dateInputGroups = document.getElementById("date-input-groups");
const clearAllBtnGroups = document.getElementById("clear-all-btn-groups");

const pieCanvasGroups = document.getElementById("pieChart-groups");
const chartTabsGroups = document.querySelectorAll("#chart-section-groups .chart-tab");
const monthSelectorGroups = document.getElementById("month-selector-groups");
const yearSelectorGroups = document.getElementById("year-selector-groups");

const categorySelectGroups = document.getElementById("category-select-groups");
const customCategoryInputGroups = document.getElementById("custom-category-groups");

// 成員管理相關
const memberSelectGroups = document.getElementById("member-select-groups");
const customMemberInputGroups = document.getElementById("custom-member-groups");
const manageMembersBtn = document.getElementById("manage-members-btn");
const manageMembersModal = document.getElementById("manage-members-modal");
const closeMembersModal = document.getElementById("close-manage-members");
const membersList = document.getElementById("members-list");

let recordsGroups = [];
let pieChartGroups = null;
let chartTypeGroups = "total";
let selectedMonthGroups = "";
let selectedYearGroups = "";

// 取得當前群組的紀錄 key（共用儲存，不依賴使用者）
function getGroupsRecordsKey() {
  if (!currentGroup || !currentGroup.id) {
    // 如果沒有當前群組，嘗試載入第一個群組
    const groups = loadGroups();
    if (groups.length > 0) {
      currentGroup = groups[0];
    } else {
      return null;
    }
  }
  // 使用共用的群組紀錄鍵（不包含使用者名稱）
  return `records_group_${currentGroup.id}`;
}

// 載入群組紀錄（當前群組）
function loadRecordsGroups() {
  const key = getGroupsRecordsKey();
  if (!key) {
    recordsGroups = [];
    return;
  }
  const data = localStorage.getItem(key);
  recordsGroups = data ? JSON.parse(data) : [];
}

// 儲存群組紀錄（當前群組）
function saveRecordsGroups() {
  const key = getGroupsRecordsKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(recordsGroups));
}

// 設定今天日期（群組頁面）
dateInputGroups.valueAsDate = new Date();

// 初始化月份和年份選擇器（群組頁面）
for (let year = startYear; year <= endYear; year++) {
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    const monthStr = String(month).padStart(2, '0');
    option.value = `${year}-${monthStr}`;
    option.textContent = `${year}年${month}月`;

    // 預設選擇當前年月
    if (option.value === currentYearMonth) {
      option.selected = true;
      selectedMonthGroups = option.value;
    }

    monthSelectorGroups.appendChild(option);
  }
}

// 動態生成年份選項（從 2020 年到當前年份+1年）- 群組頁面
for (let year = startYear; year <= endYear; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = `${year}年`;
  if (year === currentYear) {
    option.selected = true;
    selectedYearGroups = year;
  }
  yearSelectorGroups.appendChild(option);
}

// 初始化選擇器顯示狀態（群組頁面）- 預設顯示總收支，隱藏月/年選擇器
monthSelectorGroups.style.display = "none";
yearSelectorGroups.style.display = "none";

// 自訂類別處理（群組頁面）
categorySelectGroups.addEventListener("change", () => {
  if (categorySelectGroups.value === "其他") {
    customCategoryInputGroups.style.display = "block";
    customCategoryInputGroups.required = true;
  } else {
    customCategoryInputGroups.style.display = "none";
    customCategoryInputGroups.required = false;
    customCategoryInputGroups.value = "";
  }
});

// 成員管理功能
// 取得成員清單的 localStorage key（共用儲存，不依賴使用者）
function getMembersKey() {
  if (!currentGroup) return null;
  return `members_group_${currentGroup.id}`;
}

// 載入成員清單
function loadMembers() {
  const key = getMembersKey();
  if (!key) return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// 儲存成員清單
function saveMembers(members) {
  const key = getMembersKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(members));
}

// 更新成員下拉選單
function updateMemberSelect() {
  const members = loadMembers();
  const currentValue = memberSelectGroups.value;
  
  // 清空選項（保留「無」和「其他」）
  memberSelectGroups.innerHTML = '<option value="">無</option>';
  
  // 新增自訂成員選項
  members.forEach(member => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    memberSelectGroups.appendChild(option);
  });
  
  // 新增「其他」選項在最後
  const otherOption = document.createElement("option");
  otherOption.value = "其他";
  otherOption.textContent = "其他";
  memberSelectGroups.appendChild(otherOption);
  
  // 恢復選擇
  if (currentValue && (currentValue === "" || currentValue === "其他" || members.includes(currentValue))) {
    memberSelectGroups.value = currentValue;
  }
  
  // 同時更新批次同步的成員選擇器
  updateBatchSyncMemberSelect();
}

// 渲染側邊欄組員顯示
function renderMembersDisplay() {
  const membersDisplay = document.getElementById('members-display');
  const membersDisplayList = document.getElementById('members-display-list');
  
  if (!membersDisplay || !membersDisplayList) return;
  
  const members = loadMembers();
  
  if (members.length === 0) {
    membersDisplay.style.display = 'none';
    return;
  }
  
  membersDisplay.style.display = 'block';
  membersDisplayList.innerHTML = '';
  
  members.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.style.padding = '8px 0';
    memberItem.style.color = '#333';
    memberItem.style.fontSize = '14px';
    memberItem.textContent = '• ' + member;
    membersDisplayList.appendChild(memberItem);
  });
}

// 渲染固定位置的組員列表（左側）
function renderMembersDisplayFixed() {
  const membersDisplayFixed = document.getElementById('members-display-fixed');
  const membersListFixed = document.getElementById('members-list-fixed');
  
  if (!membersDisplayFixed || !membersListFixed) return;
  
  const members = loadMembers();
  
  if (members.length === 0) {
    membersDisplayFixed.style.display = 'none';
    return;
  }
  
  membersDisplayFixed.style.display = 'block';
  membersListFixed.innerHTML = '';
  
  members.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item-fixed';
    memberItem.dataset.member = member;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'member-name';
    nameSpan.textContent = member;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'member-delete-btn';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMemberFixed(member);
    });
    
    memberItem.appendChild(nameSpan);
    memberItem.appendChild(deleteBtn);
    
    // 點擊顯示/隱藏刪除按鈕
    memberItem.addEventListener('click', () => {
      // 先移除其他項目的 show-delete 類
      document.querySelectorAll('.member-item-fixed').forEach(item => {
        if (item !== memberItem) {
          item.classList.remove('show-delete');
        }
      });
      // 切換當前項目的狀態
      memberItem.classList.toggle('show-delete');
    });
    
    membersListFixed.appendChild(memberItem);
  });
}

// 刪除固定列表中的成員
function deleteMemberFixed(memberName) {
  if (!confirm(`確定要刪除組員「${memberName}」嗎？`)) return;
  
  let members = loadMembers();
  members = members.filter(m => m !== memberName);
  saveMembers(members);
  
  updateMemberSelect();
  renderMembersList();
  renderMembersDisplayFixed(); // 更新固定列表顯示
  updateFilterMemberOptionsGroups();
  
  alert(`組員「${memberName}」已成功刪除！`);
}

// 新增組員 Modal 相關函數
const addMemberModal = document.getElementById("add-member-modal");
const addMemberModalClose = document.getElementById("add-member-modal-close");
const addMemberModalCancel = document.getElementById("add-member-modal-cancel");
const addMemberForm = document.getElementById("add-member-form");

// 開啟新增組員 Modal
function openAddMemberModal() {
  if (!currentGroup) {
    alert("請先選擇一個群組");
    return;
  }
  if (addMemberModal) {
    addMemberModal.classList.add("show");
    const memberNameInput = document.getElementById("member-name-input");
    if (memberNameInput) {
      memberNameInput.value = "";
      memberNameInput.focus();
    }
  }
}

// 關閉新增組員 Modal
function closeAddMemberModal() {
  if (addMemberModal) {
    addMemberModal.classList.remove("show");
  }
  if (addMemberForm) {
    addMemberForm.reset();
  }
}

// Modal 關閉按鈕事件
if (addMemberModalClose) {
  addMemberModalClose.addEventListener("click", closeAddMemberModal);
}

if (addMemberModalCancel) {
  addMemberModalCancel.addEventListener("click", closeAddMemberModal);
}

// 點擊 Modal 外部關閉
if (addMemberModal) {
  addMemberModal.addEventListener("click", (e) => {
    if (e.target === addMemberModal) {
      closeAddMemberModal();
    }
  });
}

// 新增組員表單提交事件
if (addMemberForm) {
  addMemberForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const memberNameInput = document.getElementById("member-name-input");
    if (!memberNameInput) return;
    
    const memberName = memberNameInput.value.trim();
    
    if (!memberName) {
      alert("請輸入成員名稱");
      return;
    }
    
    // 檢查成員是否已存在 (不區分大小寫)
    let members = loadMembers();
    if (members.some(member => member.toLowerCase() === memberName.toLowerCase())) {
      alert("該成員已存在！");
      return;
    }
    
    // 新增成員
    members.push(memberName);
    saveMembers(members);
    
    // 更新下拉選單
    updateMemberSelect();
    updateFilterMemberOptionsGroups();
    
    // 更新側邊欄組員顯示
    renderMembersDisplay();
    
    // 更新固定位置的組員列表
    renderMembersDisplayFixed();
    
    // 關閉 Modal
    closeAddMemberModal();
    
    alert(`成員「${memberName}」已成功新增！`);
  });
}

// 更新批次同步成員選擇器
function updateBatchSyncMemberSelect() {
  const batchSyncMemberSelect = document.getElementById("batch-sync-member-select");
  if (!batchSyncMemberSelect) return;
  
  const members = loadMembers();
  batchSyncMemberSelect.innerHTML = '<option value="">選擇成員</option>';
  
  members.forEach(member => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    batchSyncMemberSelect.appendChild(option);
  });
}

// 成員下拉選單變更處理
memberSelectGroups.addEventListener("change", () => {
  if (memberSelectGroups.value === "其他") {
    customMemberInputGroups.style.display = "block";
    customMemberInputGroups.focus();
  } else {
    customMemberInputGroups.style.display = "none";
    customMemberInputGroups.value = "";
  }
});

// 管理成員按鈕點擊
manageMembersBtn.addEventListener("click", () => {
  renderMembersList();
  manageMembersModal.style.display = "block";
});

// 批次同步按鈕
const batchSyncBtn = document.getElementById("batch-sync-btn");
if (batchSyncBtn) {
  batchSyncBtn.addEventListener("click", () => {
    const batchSyncMemberSelect = document.getElementById("batch-sync-member-select");
    if (!batchSyncMemberSelect) return;
    
    const selectedMember = batchSyncMemberSelect.value;
    if (!selectedMember) {
      alert("請先選擇要同步的成員！");
      return;
    }
    
    batchSyncMemberToPersonal(selectedMember);
  });
}

// 批次同步成員的所有紀錄到個人
function batchSyncMemberToPersonal(memberName) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("請先登入才能同步紀錄！");
    return;
  }
  
  // 先載入當前使用者的個人紀錄，確保不會覆蓋現有紀錄
  records = getUserRecords();
  
  // 篩選出該成員的所有紀錄
  const memberRecords = recordsGroups.filter(r => r.member === memberName);
  
  if (memberRecords.length === 0) {
    alert(`沒有找到成員「${memberName}」的紀錄！`);
    return;
  }
  
  // 取得群組名稱
  let groupName = "群組";
  if (currentGroup) {
    groupName = currentGroup.name;
  } else {
    const groups = loadGroups();
    if (groups.length > 0) {
      groupName = groups[0].name;
    }
  }
  
  // 找出最大的現有 ID，確保新 ID 不會重複
  let maxId = records.length > 0 ? Math.max(...records.map(r => r.id)) : Date.now();
  
  // 批次建立個人紀錄
  let syncCount = 0;
  memberRecords.forEach(groupRecord => {
    const personalRecord = {
      id: maxId + syncCount + 1, // 從最大 ID 遞增，確保唯一性
      type: groupRecord.type,
      amount: groupRecord.amount,
      category: `[${groupName}] ${groupRecord.category}`,
      date: groupRecord.date,
      note: groupRecord.note || ""
    };
    
    records.push(personalRecord);
    syncCount++;
  });
  
  // 儲存個人紀錄
  saveUserRecords(records);
  
  // 如果目前在個人頁面，立即更新顯示
  if (currentPage === 'main') {
    renderAll();
  }
  
  alert(`已成功將成員「${memberName}」的 ${syncCount} 筆紀錄同步到個人！`);
}

// 關閉管理成員 Modal
if (closeMembersModal) {
  closeMembersModal.addEventListener("click", () => {
    if (manageMembersModal) {
      manageMembersModal.style.display = "none";
    }
  });
}

// 點擊 Modal 外部關閉
window.addEventListener("click", (e) => {
  if (e.target === manageMembersModal) {
    manageMembersModal.style.display = "none";
  }
});

// 渲染成員清單
function renderMembersList() {
  const members = loadMembers();
  
  membersList.innerHTML = "";
  
  if (members.length === 0) {
    membersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">尚無成員</p>';
    return;
  }
  
  members.forEach(member => {
    const item = document.createElement("div");
    item.className = "member-item";
    
    const nameSpan = document.createElement("span");
    nameSpan.className = "member-name";
    nameSpan.textContent = member;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete-member";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => deleteMember(member));
    
    item.appendChild(nameSpan);
    item.appendChild(deleteBtn);
    membersList.appendChild(item);
  });
}

// 刪除成員
function deleteMember(memberName) {
  if (!confirm(`確定要刪除成員「${memberName}」嗎？`)) return;
  
  let members = loadMembers();
  members = members.filter(m => m !== memberName);
  saveMembers(members);
  
  updateMemberSelect();
  renderMembersList();
  renderMembersDisplay(); // 同時更新側邊欄顯示
  updateFilterMemberOptionsGroups();
}

// 初始化成員下拉選單
updateMemberSelect();

// 新增紀錄（群組頁面）
formGroups.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("請先登入才能新增紀錄！");
    return;
  }
  
  const fd = new FormData(formGroups);
  let category = fd.get("category");
  let member = fd.get("member");
  
  if (category === "其他" && customCategoryInputGroups.value.trim()) {
    category = customCategoryInputGroups.value.trim();
  }
  
  // 處理成員欄位
  if (member === "其他") {
    const customMember = customMemberInputGroups.value.trim();
    if (!customMember) {
      alert("請輸入成員名稱");
      return;
    }
    member = customMember;
    
    // 將新成員加入清單
    let members = loadMembers();
    if (!members.includes(customMember)) {
      members.push(customMember);
      saveMembers(members);
      updateMemberSelect();
      updateFilterMemberOptionsGroups();
    }
  }
  
  const record = {
    id: Date.now(),
    type: fd.get("type"),
    amount: parseFloat(fd.get("amount")),
    category: category,
    date: fd.get("date"),
    member: member || "",
    note: fd.get("note") || ""
  };
  
  recordsGroups.push(record);
  saveRecordsGroups();
  formGroups.reset();
  dateInputGroups.valueAsDate = new Date();
  customCategoryInputGroups.style.display = "none";
  customMemberInputGroups.style.display = "none";
  
  renderRecordsGroups();
  updateSummaryGroups();
  renderChartGroups();
  updateFilterCategoryOptionsGroups();
  updateFilterMemberOptionsGroups();
});

// 刪除紀錄（群組頁面）
function deleteRecordGroups(id) {
  if (!confirm("確定要刪除此筆紀錄嗎？")) return;
  recordsGroups = recordsGroups.filter(r => r.id !== id);
  saveRecordsGroups();
  renderRecordsGroups();
  updateSummaryGroups();
  renderChartGroups();
  updateFilterCategoryOptionsGroups();
}

// 渲染紀錄列表（群組頁面）
function renderRecordsGroups(filteredRecords = null) {
  const dataToRender = filteredRecords || recordsGroups;
  // Sort by date descending (newest first), then by ID descending (newest first) for same dates
  const sorted = dataToRender.slice().sort((a, b) => {
    if (a.date === b.date) return b.id - a.id;
    return (a.date > b.date) ? -1 : 1;
  });
  
  tbodyGroups.innerHTML = "";
  sorted.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.type}</td>
      <td class="num ${r.type === '支出' ? 'expense' : 'income'}">
        ${r.type === '支出' ? '-' : '+'}${r.amount}
      </td>
      <td>${r.category}</td>
      <td>${r.member || ""}</td>
      <td>${r.note}</td>
      <td>
        <button class="btn primary small" onclick="syncToPersonal(${r.id})" style="margin-right: 5px;">同步到個人</button>
        <button class="btn danger small" onclick="deleteRecordGroups(${r.id})">刪除</button>
      </td>
    `;
    tbodyGroups.appendChild(tr);
  });
}

// 更新總覽（群組頁面）
function updateSummaryGroups() {
  const income = recordsGroups.filter(r => r.type === "收入").reduce((sum, r) => sum + r.amount, 0);
  const expense = recordsGroups.filter(r => r.type === "支出").reduce((sum, r) => sum + r.amount, 0);
  const balance = income - expense;
  
  // Explicitly set income to green and expense to red
  totalIncomeElGroups.textContent = income.toLocaleString();
  totalIncomeElGroups.className = "kpi income";
  
  totalExpenseElGroups.textContent = expense.toLocaleString();
  totalExpenseElGroups.className = "kpi expense";
  
  balanceElGroups.textContent = balance.toLocaleString();
  
  // Apply dynamic color to balance: green if positive, red if negative, default if zero
  if (balance > 0) {
    balanceElGroups.className = "kpi income";
  } else if (balance < 0) {
    balanceElGroups.className = "kpi expense";
  } else {
    balanceElGroups.className = "kpi balance";
  }
}

// 清空所有紀錄（群組頁面）
clearAllBtnGroups.addEventListener("click", () => {
  if (!confirm("確定要清空所有群組紀錄嗎？此操作無法復原！")) return;
  recordsGroups = [];
  saveRecordsGroups();
  renderRecordsGroups();
  updateSummaryGroups();
  renderChartGroups();
  updateFilterCategoryOptionsGroups();
});

// 渲染圖表（群組頁面）
function renderChartGroups() {
  if (!window.Chart) {
    console.warn("Chart.js not loaded");
    return;
  }
  
  try {
    let dataToChart = recordsGroups;
    let chartTitle = "總收支圓餅圖";
    
    if (chartTypeGroups === "month" && selectedMonthGroups) {
      dataToChart = recordsGroups.filter(r => r.date.startsWith(selectedMonthGroups));
      const [year, month] = selectedMonthGroups.split('-');
      chartTitle = `月收支圓餅圖 (${year}年${parseInt(month)}月)`;
    } else if (chartTypeGroups === "year" && selectedYearGroups) {
      dataToChart = recordsGroups.filter(r => r.date.startsWith(selectedYearGroups));
      chartTitle = `年收支圓餅圖 (${selectedYearGroups})`;
    } else if (chartTypeGroups === "category") {
      chartTitle = "類別圓餅圖";
    } else if (chartTypeGroups === "member") {
      chartTitle = "成員收支圓餅圖";
    }
    
    // Category chart logic
    if (chartTypeGroups === "category") {
      const categoryData = {};
      
      dataToChart.forEach(r => {
        const key = `${r.type}-${r.category}`;
        if (!categoryData[key]) {
          categoryData[key] = { type: r.type, category: r.category, amount: 0 };
        }
        categoryData[key].amount += r.amount;
      });
      
      const labels = [];
      const data = [];
      const colors = [];
      
      // Generate colors for categories
      const greenShades = ['#2ecc71', '#27ae60', '#16a085', '#1abc9c', '#00b894', '#00cec9'];
      const redShades = ['#e74c3c', '#c0392b', '#e17055', '#d63031', '#ff7675', '#fd79a8'];
      
      // Sort by type first (收入 first, then 支出) to group same colors together
      const sortedData = Object.values(categoryData).sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === '收入' ? -1 : 1;
      });
      
      let greenIndex = 0;
      let redIndex = 0;
      
      sortedData.forEach(item => {
        labels.push(`${item.category}(${item.type})`);
        data.push(item.amount);
        if (item.type === '收入') {
          colors.push(greenShades[greenIndex % greenShades.length]);
          greenIndex++;
        } else {
          colors.push(redShades[redIndex % redShades.length]);
          redIndex++;
        }
      });
      
      const hasData = data.length > 0 && data.some(d => d > 0);
      
      if (pieChartGroups) {
        pieChartGroups.destroy();
      }
      
      const ctx = pieCanvasGroups.getContext("2d");
      pieChartGroups = new Chart(ctx, {
        type: "pie",
        data: {
          labels: hasData ? labels : ["尚無資料"],
          datasets: [{
            data: hasData ? data : [1],
            backgroundColor: hasData ? colors : ["#eee"],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            title: {
              display: true,
              text: chartTitle,
              font: { size: 16, weight: 'bold' },
              padding: { bottom: 10 }
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.label}: ${Number(c.raw || 0).toLocaleString("zh-TW")}`
              }
            }
          }
        }
      });
      return;
    }
    
    // Member chart logic
    if (chartTypeGroups === "member") {
      const memberData = {};
      
      // Get unique members and assign consistent colors (including empty member as "無")
      const allMembersSet = new Set(dataToChart.map(r => r.member || '無'));
      const allMembers = Array.from(allMembersSet).sort((a, b) => {
        // Sort "無" last
        if (a === '無') return 1;
        if (b === '無') return -1;
        return a.localeCompare(b, 'zh-TW');
      });
      
      const memberColors = {};
      // Use more contrasting colors with variations for income/expense
      const baseColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', 
        '#1abc9c', '#e67e22', '#34495e', '#16a085', '#d35400',
        '#2980b9', '#c0392b', '#27ae60', '#d68910', '#8e44ad'
      ];
      
      allMembers.forEach((member, index) => {
        memberColors[member] = baseColors[index % baseColors.length];
      });
      
      dataToChart.forEach(r => {
        const memberName = r.member || '無';
        
        const incomeKey = `${memberName}-收入`;
        const expenseKey = `${memberName}-支出`;
        
        if (r.type === '收入') {
          if (!memberData[incomeKey]) {
            memberData[incomeKey] = { member: memberName, type: '收入', amount: 0 };
          }
          memberData[incomeKey].amount += r.amount;
        } else if (r.type === '支出') {
          if (!memberData[expenseKey]) {
            memberData[expenseKey] = { member: memberName, type: '支出', amount: 0 };
          }
          memberData[expenseKey].amount += r.amount;
        }
      });
      
      const labels = [];
      const data = [];
      const colors = [];
      
      // Sort by member name, then by type (收入 first, then 支出) to group same members together
      const sortedData = Object.values(memberData).sort((a, b) => {
        // Sort "無" last
        if (a.member === '無' && b.member !== '無') return 1;
        if (a.member !== '無' && b.member === '無') return -1;
        
        if (a.member === b.member) {
          return a.type === '收入' ? -1 : 1;
        }
        return a.member.localeCompare(b.member, 'zh-TW');
      });
      
      // Helper function to adjust color brightness for better distinction
      const adjustColorBrightness = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
      };
      
      sortedData.forEach(item => {
        labels.push(`${item.member}(${item.type})`);
        data.push(item.amount);
        
        // Use base color for income, darker version for expense to create distinction
        const baseColor = memberColors[item.member];
        if (item.type === '收入') {
          // Lighter for income
          colors.push(adjustColorBrightness(baseColor, 15));
        } else {
          // Darker for expense
          colors.push(adjustColorBrightness(baseColor, -35));
        }
      });
      
      const hasData = data.length > 0 && data.some(d => d > 0);
      
      if (pieChartGroups) {
        pieChartGroups.destroy();
      }
      
      const ctx = pieCanvasGroups.getContext("2d");
      pieChartGroups = new Chart(ctx, {
        type: "pie",
        data: {
          labels: hasData ? labels : ["尚無資料"],
          datasets: [{
            data: hasData ? data : [1],
            backgroundColor: hasData ? colors : ["#eee"],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            title: {
              display: true,
              text: chartTitle,
              font: { size: 16, weight: 'bold' },
              padding: { bottom: 10 }
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.label}: ${Number(c.raw || 0).toLocaleString("zh-TW")}`
              }
            }
          }
        }
      });
      return;
    }
    
    // Original total income/expense chart logic
    // Calculate income and expense totals
    let income = 0;
    let expense = 0;
    
    dataToChart.forEach(r => {
      if (r.type === "收入") {
        income += r.amount;
      } else if (r.type === "支出") {
        expense += r.amount;
      }
    });
    
    const hasData = (income + expense) > 0;
    const labels = hasData ? ["收入", "支出"] : ["尚無資料", "尚無資料"];
    const data = hasData ? [income, expense] : [1, 1];
    const colors = hasData ? ["#77ddaa", "#ff7b7b"] : ["#eee", "#eee"];
    
    if (pieChartGroups) {
      pieChartGroups.destroy();
    }
    
    const ctx = pieCanvasGroups.getContext("2d");
    pieChartGroups = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: chartTitle,
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 10 }
          },
          tooltip: {
            callbacks: {
              label: (c) => `${c.label}: ${Number(c.raw || 0).toLocaleString("zh-TW")}`
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error rendering groups chart:", error);
  }
}

// 圖表切換（群組頁面）
if (chartTabsGroups && chartTabsGroups.length > 0) {
  chartTabsGroups.forEach(tab => {
    tab.addEventListener("click", () => {
      chartTabsGroups.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const type = tab.dataset.type;
      chartTypeGroups = type;
      
      if (type === "month") {
        if (monthSelectorGroups) monthSelectorGroups.style.display = "inline-block";
        if (yearSelectorGroups) yearSelectorGroups.style.display = "none";
      } else if (type === "year") {
        if (monthSelectorGroups) monthSelectorGroups.style.display = "none";
        if (yearSelectorGroups) yearSelectorGroups.style.display = "inline-block";
      } else {
        if (monthSelectorGroups) monthSelectorGroups.style.display = "none";
        if (yearSelectorGroups) yearSelectorGroups.style.display = "none";
      }
      
      renderChartGroups();
    });
  });
}

// 月份選擇器變更事件（群組頁面）
if (monthSelectorGroups) {
  monthSelectorGroups.addEventListener("change", () => {
    selectedMonthGroups = monthSelectorGroups.value;
    if (chartTypeGroups === "month") {
      renderChartGroups();
    }
  });
}

// 年份選擇器變更事件（群組頁面）
if (yearSelectorGroups) {
  yearSelectorGroups.addEventListener("change", () => {
    selectedYearGroups = yearSelectorGroups.value;
    if (chartTypeGroups === "year") {
      renderChartGroups();
    }
  });
}

// 篩選功能（群組頁面）
function updateFilterCategoryOptionsGroups() {
  const categorySelect = document.getElementById("filter-category-groups");
  const categories = new Set();
  
  recordsGroups.forEach(r => {
    categories.add(r.category);
  });
  
  categorySelect.innerHTML = '<option value="">全部類別</option>';
  
  Array.from(categories).sort().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function updateFilterMemberOptionsGroups() {
  const memberSelect = document.getElementById("filter-member-groups");
  const members = new Set();
  
  recordsGroups.forEach(r => {
    if (r.member) {
      members.add(r.member);
    }
  });
  
  memberSelect.innerHTML = '<option value="">全部成員</option>';
  
  Array.from(members).sort().forEach(member => {
    const opt = document.createElement("option");
    opt.value = member;
    opt.textContent = member;
    memberSelect.appendChild(opt);
  });
}

document.getElementById("apply-filter-btn-groups").addEventListener("click", () => {
  const year = document.getElementById("filter-year-groups").value;
  const month = document.getElementById("filter-month-groups").value;
  const day = document.getElementById("filter-day-groups").value;
  const category = document.getElementById("filter-category-groups").value;
  const member = document.getElementById("filter-member-groups").value;
  
  let filtered = recordsGroups;
  
  if (year) filtered = filtered.filter(r => r.date.substring(0, 4) === year);
  if (month) filtered = filtered.filter(r => r.date.substring(5, 7) === month.padStart(2, '0'));
  if (day) filtered = filtered.filter(r => r.date.substring(8, 10) === day.padStart(2, '0'));
  if (category) filtered = filtered.filter(r => r.category === category);
  if (member) filtered = filtered.filter(r => r.member === member);
  
  renderRecordsGroups(filtered);
});

document.getElementById("clear-filter-btn-groups").addEventListener("click", () => {
  document.getElementById("filter-year-groups").value = "";
  document.getElementById("filter-month-groups").value = "";
  document.getElementById("filter-day-groups").value = "";
  document.getElementById("filter-category-groups").value = "";
  document.getElementById("filter-member-groups").value = "";
  renderRecordsGroups();
});

// 同步群組收支到個人
function syncToPersonal(recordId) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("請先登入才能同步紀錄！");
    return;
  }
  
  // 先載入當前使用者的個人紀錄，確保不會覆蓋現有紀錄
  records = getUserRecords();
  
  // 找到對應的群組紀錄
  const groupRecord = recordsGroups.find(r => r.id === recordId);
  if (!groupRecord) {
    alert("找不到該紀錄！");
    return;
  }
  
  // 取得當前群組名稱（如果沒有，使用第一個群組的名稱）
  let groupName = "群組";
  if (currentGroup) {
    groupName = currentGroup.name;
  } else {
    const groups = loadGroups();
    if (groups.length > 0) {
      groupName = groups[0].name;
    }
  }
  
  // 建立新的個人紀錄，category 加上群組名稱前綴
  const personalRecord = {
    id: Date.now(),
    type: groupRecord.type,
    amount: groupRecord.amount,
    category: `[${groupName}] ${groupRecord.category}`,
    date: groupRecord.date,
    note: groupRecord.note || ""
  };
  
  // 加入到個人紀錄中
  records.push(personalRecord);
  saveUserRecords(records);
  
  // 如果目前在個人頁面，立即更新顯示
  if (currentPage === 'main') {
    renderAll();
  }
  
  alert("已成功同步到個人收支紀錄！");
}

// 初始化群組頁面
function initGroupsPage() {
  loadRecordsGroups();
  updateMemberSelect();
  renderRecordsGroups();
  updateSummaryGroups();
  renderChartGroups();
  updateFilterCategoryOptionsGroups();
  updateFilterMemberOptionsGroups();
}

// 當切換到群組頁面時初始化
const originalShowPage = showPage;
showPage = function(pageName) {
  originalShowPage(pageName);
  if (pageName === 'groups') {
    initGroupsPage();
  }
};
