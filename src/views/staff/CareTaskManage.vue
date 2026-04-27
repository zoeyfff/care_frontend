<template>
  <div class="care-task-container">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="staff-page-title">护理任务</h1>
        <p class="sub-title">今日任务跟踪 · 照护执行记录</p>
      </div>
      <!-- 今日任务统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card today">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-label">今日任务</span>
            <span class="stat-value">{{ todayTasks.length }}</span>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <span class="stat-label">待完成</span>
            <span class="stat-value">{{ pendingTasksCount }}</span>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-label">已完成</span>
            <span class="stat-value">{{ completedTasksCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="staff-card main-content">
      <!-- 工具栏 -->
      <div class="staff-toolbar enhanced-toolbar">
        <div class="toolbar-left">
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            style="width: 140px"
            @change="load"
            class="filter-select"
          >
            <el-option label="全部任务" :value="null" />
            <el-option label="⏰ 未完成" :value="0" />
            <el-option label="✅ 已完成" :value="1" />
          </el-select>
          <el-select
            v-model="filterFrequency"
            placeholder="频率"
            clearable
            style="width: 120px"
            @change="load"
          >
            <el-option label="单次" value="ONCE" />
            <el-option label="每天" value="DAILY" />
            <el-option label="每周" value="WEEKLY" />
            <el-option label="每月" value="MONTHLY" />
          </el-select>
          <el-select
            v-model="filterAssignedTo"
            placeholder="执行人"
            clearable
            style="width: 150px"
            @change="load"
          >
            <el-option
              v-for="u in nurseOptions"
              :key="u.id"
              :label="u.real_name || u.username"
              :value="u.id"
            />
          </el-select>
          <el-switch
            v-model="todayOnly"
            inline-prompt
            active-text="今日任务"
            inactive-text="全部任务"
            @change="load"
          />
          <el-button @click="load" class="refresh-btn">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button
            type="warning"
            plain
            :disabled="!selectedTaskIds.length"
            @click="openBatchAssign"
          >
            批量分配
          </el-button>
          <el-button type="primary" @click="openTask()" class="create-btn">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
        </div>
      </div>

      <!-- 任务表格 -->
      <el-table
        :data="list"
        stripe
        v-loading="loading"
        class="task-table"
        :row-class-name="tableRowClassName"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="elder_name" label="长者" width="110">
          <template #default="{ row }">
            <div class="elder-cell">
              <span class="elder-avatar">{{
                row.elder_name?.charAt(0) || "长"
              }}</span>
              <span class="elder-name">{{ row.elder_name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="task_name" label="服务内容" min-width="220">
          <template #default="{ row }">
            <div class="task-name-cell">
              <span :class="['task-priority', getPriorityClass(row)]"></span>
              <span class="task-name">{{ row.task_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="频率" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{
              frequencyLabel(row.frequency_type)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行人" width="120">
          <template #default="{ row }">
            {{ row.assigned_to_name || "未分配" }}
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" size="small">
              {{ priorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="execute_time" label="计划执行时间" width="180">
          <template #default="{ row }">
            <div
              class="time-cell"
              :class="{ 'is-today': isToday(row.execute_time) }"
            >
              <el-icon v-if="isToday(row.execute_time)" class="today-icon"
                ><Calendar
              /></el-icon>
              {{ formatDateTime(row.execute_time) }}
              <el-tag
                v-if="isToday(row.execute_time)"
                type="danger"
                size="small"
                class="today-tag"
              >
                今日
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'warning'"
              effect="light"
              size="large"
              class="status-tag"
            >
              <span
                class="status-dot"
                :class="row.status === 1 ? 'completed' : 'pending'"
              ></span>
              {{ row.status === 1 ? "已完成" : "未完成" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="remark"
          label="备注"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="remark-text" :class="{ 'has-remark': row.remark }">
              {{ row.remark || "暂无备注" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 0"
                link
                type="primary"
                @click="complete(row)"
                class="complete-btn"
              >
                <el-icon><CircleCheck /></el-icon>
                完成
              </el-button>
              <el-button
                link
                type="primary"
                @click="openTask(row)"
                class="edit-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="warning" @click="openAssign(row)">
                分配
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <el-empty description="暂无护理任务，点击「新建任务」开始添加">
          <el-button type="primary" @click="openTask()">新建任务</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 对话框保持不变 -->
    <el-dialog
      v-model="dlg"
      :title="taskForm.id ? '编辑任务' : '新建任务'"
      width="520px"
      destroy-on-close
      class="task-dialog"
    >
      <el-form label-width="100px">
        <el-form-item label="选择长者" required>
          <el-select
            v-model="taskForm.elder_id"
            placeholder="请选择长者"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="e in elderOptions"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称" required>
          <el-input
            v-model="taskForm.task_name"
            placeholder="如：晨间血压测量、康复训练"
          />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="taskForm.execute_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务频率">
          <el-select v-model="taskForm.frequency_type" style="width: 100%">
            <el-option label="单次" value="ONCE" />
            <el-option label="每天" value="DAILY" />
            <el-option label="每周" value="WEEKLY" />
            <el-option label="每月" value="MONTHLY" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务周期">
          <el-row :gutter="8" style="width: 100%">
            <el-col :span="12">
              <el-date-picker
                v-model="taskForm.start_date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-date-picker
                v-model="taskForm.end_date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="建议时段">
          <el-time-picker
            v-model="taskForm.preferred_time"
            value-format="HH:mm:ss"
            placeholder="建议执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="taskForm.priority">
            <el-radio :value="1">普通</el-radio>
            <el-radio :value="2">重要</el-radio>
            <el-radio :value="3">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行人员">
          <el-select
            v-model="taskForm.assigned_to"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="u in nurseOptions"
              :key="u.id"
              :label="u.real_name || u.username"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作说明">
          <el-input v-model="taskForm.instruction" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="taskForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可填写体征数据、注意事项等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="assignDlg"
      title="任务分配"
      width="420px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="任务名称">
          <el-input :model-value="assignForm.task_name" disabled />
        </el-form-item>
        <el-form-item label="执行人" required>
          <el-select
            v-model="assignForm.assigned_to"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="u in nurseOptions"
              :key="u.id"
              :label="u.real_name || u.username"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDlg = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchAssignDlg"
      title="批量分配任务"
      width="420px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="已选任务">
          <el-input :model-value="`${selectedTaskIds.length} 条`" disabled />
        </el-form-item>
        <el-form-item label="执行人" required>
          <el-select v-model="batchAssignTo" filterable style="width: 100%">
            <el-option
              v-for="u in nurseOptions"
              :key="u.id"
              :label="u.real_name || u.username"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAssignDlg = false">取消</el-button>
        <el-button type="primary" @click="submitBatchAssign"
          >确认分配</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Refresh,
  Plus,
  CircleCheck,
  Edit,
  Calendar,
} from "@element-plus/icons-vue";
import {
  getCareTasks,
  saveCareTask,
  getElderList,
  getUsers,
  assignCareTask,
  executeCareTask,
  getTodayCareTasks,
  batchAssignCareTasks,
} from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const filterStatus = ref(null);
const filterFrequency = ref("");
const filterAssignedTo = ref(null);
const todayOnly = ref(false);
const elderOptions = ref([]);
const nurseOptions = ref([]);
const dlg = ref(false);
const assignDlg = ref(false);
const batchAssignDlg = ref(false);
const selectedTaskIds = ref([]);
const batchAssignTo = ref(null);
const taskForm = reactive({
  id: null,
  elder_id: null,
  task_name: "",
  execute_time: "",
  frequency_type: "ONCE",
  assigned_to: null,
  assigned_to_name: "",
  start_date: "",
  end_date: "",
  preferred_time: "",
  priority: 1,
  instruction: "",
  remark: "",
  status: 0,
});
const assignForm = reactive({
  id: null,
  task_name: "",
  assigned_to: null,
});

// 计算属性
const todayTasks = computed(() => {
  const today = new Date().toDateString();
  return list.value.filter((task) => {
    if (!task.execute_time) return false;
    return new Date(task.execute_time).toDateString() === today;
  });
});

const pendingTasksCount = computed(() => {
  return list.value.filter((task) => task.status === 0).length;
});

const completedTasksCount = computed(() => {
  return list.value.filter((task) => task.status === 1).length;
});

// 判断是否为今日任务
function isToday(dateStr) {
  if (!dateStr) return false;
  const taskDate = new Date(dateStr);
  const today = new Date();
  return taskDate.toDateString() === today.toDateString();
}

// 格式化日期时间
function formatDateTime(dateStr) {
  if (!dateStr) return "未设置";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

// 获取优先级样式
function getPriorityClass(row) {
  if (!row.execute_time) return "priority-normal";
  const taskTime = new Date(row.execute_time);
  const now = new Date();
  const diffHours = (taskTime - now) / (1000 * 60 * 60);

  if (row.status === 1) return "priority-completed";
  if (diffHours < 0) return "priority-overdue";
  if (diffHours < 2) return "priority-urgent";
  if (diffHours < 6) return "priority-soon";
  return "priority-normal";
}

function frequencyLabel(v) {
  return (
    {
      ONCE: "单次",
      DAILY: "每天",
      WEEKLY: "每周",
      MONTHLY: "每月",
    }[v] || "单次"
  );
}

function priorityLabel(v) {
  return { 1: "普通", 2: "重要", 3: "紧急" }[Number(v)] || "普通";
}

function priorityTagType(v) {
  return { 1: "info", 2: "warning", 3: "danger" }[Number(v)] || "info";
}

// 表格行样式
function tableRowClassName({ row }) {
  if (row.status === 1) return "completed-row";
  if (!row.execute_time) return "";
  const taskTime = new Date(row.execute_time);
  const now = new Date();
  if (taskTime < now && row.status === 0) return "overdue-row";
  if (isToday(row.execute_time)) return "today-row";
  return "";
}

async function load() {
  loading.value = true;
  try {
    const params = {};
    if (filterStatus.value !== "" && filterStatus.value !== null) {
      params.status = filterStatus.value;
    }
    if (filterFrequency.value) params.frequency_type = filterFrequency.value;
    if (filterAssignedTo.value) params.assigned_to = filterAssignedTo.value;
    const { list: rows } = todayOnly.value
      ? await getTodayCareTasks(params)
      : await getCareTasks(params);
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

async function loadElders() {
  const { list: rows } = await getElderList({});
  elderOptions.value = rows;
}

async function loadNurses() {
  const { list } = await getUsers();
  nurseOptions.value = (list || []).filter((u) => {
    const roles = Array.isArray(u.roles) ? u.roles : [];
    return roles.includes("护理员") || roles.includes("护理主管");
  });
}

function openTask(row) {
  if (row) {
    Object.assign(taskForm, {
      id: row.id,
      elder_id: row.elder_id,
      task_name: row.task_name,
      execute_time: row.execute_time,
      frequency_type: row.frequency_type || "ONCE",
      assigned_to: row.assigned_to || null,
      assigned_to_name: row.assigned_to_name || "",
      start_date: row.start_date || "",
      end_date: row.end_date || "",
      preferred_time: row.preferred_time || "",
      priority: Number(row.priority || 1),
      instruction: row.instruction || "",
      remark: row.remark,
      status: row.status,
    });
  } else {
    Object.assign(taskForm, {
      id: null,
      elder_id: null,
      task_name: "",
      execute_time: "",
      frequency_type: "ONCE",
      assigned_to: null,
      assigned_to_name: "",
      start_date: "",
      end_date: "",
      preferred_time: "",
      priority: 1,
      instruction: "",
      remark: "",
      status: 0,
    });
  }
  dlg.value = true;
}

async function saveTask() {
  if (!taskForm.elder_id || !taskForm.task_name) {
    ElMessage.warning("请填写长者与任务名称");
    return;
  }
  const name =
    elderOptions.value.find((e) => e.id === taskForm.elder_id)?.name || "";
  const assignee =
    nurseOptions.value.find((u) => u.id === taskForm.assigned_to)?.real_name ||
    "";
  const saved = await saveCareTask({
    ...taskForm,
    elder_name: name,
    assigned_to_name: assignee,
  });
  if (taskForm.id) {
    const i = list.value.findIndex((x) => x.id === taskForm.id);
    if (i >= 0)
      list.value[i] = { ...list.value[i], ...saved, elder_name: name };
  } else {
    list.value.unshift({ ...saved, elder_name: name });
  }
  ElMessage.success("已保存");
  dlg.value = false;
}

async function complete(row) {
  const remark = row.remark || "已完成";
  await executeCareTask(row.id, { remark });
  row.status = 1;
  ElMessage.success("已标记完成");
}

function openAssign(row) {
  assignForm.id = row.id;
  assignForm.task_name = row.task_name;
  assignForm.assigned_to = row.assigned_to || null;
  assignDlg.value = true;
}

function onSelectionChange(rows) {
  selectedTaskIds.value = rows.map((r) => r.id);
}

function openBatchAssign() {
  batchAssignTo.value = null;
  batchAssignDlg.value = true;
}

async function submitAssign() {
  if (!assignForm.assigned_to) {
    ElMessage.warning("请选择执行人");
    return;
  }
  const assignee = nurseOptions.value.find(
    (u) => u.id === assignForm.assigned_to
  );
  await assignCareTask(assignForm.id, {
    assigned_to: assignForm.assigned_to,
    assigned_to_name: assignee?.real_name || assignee?.username || "",
  });
  ElMessage.success("任务已分配");
  assignDlg.value = false;
  load();
}

async function submitBatchAssign() {
  if (!batchAssignTo.value) {
    ElMessage.warning("请选择执行人");
    return;
  }
  const assignee = nurseOptions.value.find((u) => u.id === batchAssignTo.value);
  await batchAssignCareTasks({
    task_ids: selectedTaskIds.value,
    assigned_to: batchAssignTo.value,
    assigned_to_name: assignee?.real_name || assignee?.username || "",
  });
  ElMessage.success(`已批量分配 ${selectedTaskIds.value.length} 条任务`);
  batchAssignDlg.value = false;
  selectedTaskIds.value = [];
  load();
}

onMounted(async () => {
  await loadElders();
  await loadNurses();
  load();
});
</script>

<style lang="scss" scoped>
.care-task-container {
  padding: 20px 0;
}

// 页面头部
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  .staff-page-title {
    margin: 0 0 4px 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--staff-text);
  }

  .sub-title {
    margin: 0;
    font-size: 14px;
    color: var(--staff-muted);
  }
}

// 统计卡片
.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  min-width: 140px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &.today {
    border-left: 4px solid #0d9488;
  }

  &.pending {
    border-left: 4px solid #f59e0b;
  }

  &.completed {
    border-left: 4px solid #10b981;
  }
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: var(--staff-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--staff-text);
  line-height: 1;
}

// 主内容卡片
.main-content {
  padding: 24px;
  border-radius: 20px;
}

// 增强工具栏
.enhanced-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 160px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  font-weight: 500;
}

// 任务表格
.task-table {
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-table__header) {
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }
  }

  :deep(.el-table__body) {
    tr {
      transition: background 0.2s ease;
    }

    tr.today-row {
      background: linear-gradient(90deg, #fef3c7 0%, #fffbeb 100%);

      &:hover > td {
        background: #fef3c7 !important;
      }
    }

    tr.overdue-row {
      background: #fef2f2;

      &:hover > td {
        background: #fee2e2 !important;
      }
    }

    tr.completed-row {
      opacity: 0.75;

      td {
        color: #94a3b8;
      }
    }
  }
}

// 长者单元格
.elder-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.elder-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.elder-name {
  font-weight: 500;
  color: var(--staff-text);
}

// 任务名称单元格
.task-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.priority-overdue {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  }

  &.priority-urgent {
    background: #f59e0b;
    animation: pulse 1.5s infinite;
  }

  &.priority-soon {
    background: #eab308;
  }

  &.priority-normal {
    background: #3b82f6;
  }

  &.priority-completed {
    background: #94a3b8;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.task-name {
  font-weight: 500;
}

// 时间单元格
.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  &.is-today {
    color: #ef4444;
    font-weight: 500;
  }
}

.today-icon {
  font-size: 16px;
}

.today-tag {
  margin-left: 8px;
  font-size: 11px;
  padding: 2px 6px;
}

// 状态标签
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  border: none;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.pending {
    background: #f59e0b;
    animation: pulse 1.5s infinite;
  }

  &.completed {
    background: #10b981;
  }
}

// 备注文本
.remark-text {
  color: var(--staff-muted);

  &.has-remark {
    color: var(--staff-text);
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.complete-btn,
.edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.complete-btn {
  color: #10b981 !important;

  &:hover {
    background: #ecfdf5 !important;
  }
}

.edit-btn {
  color: #3b82f6 !important;

  &:hover {
    background: #eff6ff !important;
  }
}

// 空状态
.empty-state {
  padding: 60px 0;
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-cards {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1;
    min-width: 100px;
    padding: 12px 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .enhanced-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }
}
</style>
