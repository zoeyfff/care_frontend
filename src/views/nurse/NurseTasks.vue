<template>
  <div class="task-page">

    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><List /></el-icon>
        </div>
        <div>
          <h1 class="page-title">我的任务</h1>
          
        </div>
      </div>
      <div class="header-right">
        <div class="stat-chip">
          <span class="chip-dot chip-warn" />
          <span>待办 <strong>{{ todoCount }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-success" />
          <span>已完成 <strong>{{ doneCount }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="status"
          placeholder="全部状态"
          clearable
          size="large"
          class="status-select"
          @change="load"
        >
          <template #prefix>
            <el-icon><Filter /></el-icon>
          </template>
          <el-option label="全部" value="" />
          <el-option label="待办" :value="0">
            <div class="opt-item">
              <span class="opt-dot opt-warn" />待办
            </div>
          </el-option>
          <el-option label="已完成" :value="1">
            <div class="opt-item">
              <span class="opt-dot opt-success" />已完成
            </div>
          </el-option>
        </el-select>
        <el-button size="large" @click="load">
          <el-icon style="margin-right: 4px"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="list-count">共 <strong>{{ list.length }}</strong> 条任务</span>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="task-list" v-loading="loading">
      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <div class="empty-title">暂无任务</div>
        <div class="empty-desc">当前条件下没有找到护理任务</div>
      </div>

      <!-- 任务卡片 -->
      <div
        v-for="row in list"
        :key="row.id"
        class="task-card"
        :class="{ 'task-done': row.last_execute_time }"
      >
        <!-- 左侧状态指示条 -->
        <div class="card-bar" :class="row.status === 1 ? 'bar-done' : 'bar-todo'" />

        <!-- 任务信息 -->
        <div class="card-body">
          <div class="card-top">
            <div class="elder-badge">
              <div class="elder-avatar">{{ (row.elder_name || '?')[0] }}</div>
              <span class="elder-name">{{ row.elder_name }}</span>
            </div>
            <div class="time-badge">
              <el-icon><Clock /></el-icon>
              {{ row.execute_time || '—' }}
            </div>
          </div>

          <div class="task-name">{{ row.task_name }}</div>

          <div v-if="row.remark" class="task-remark">
            <el-icon><Comment /></el-icon>
            {{ row.remark }}
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="card-actions">
          <div class="status-tag">
            <el-tag
              :type="row.last_execute_time ? 'success' : 'warning'"
              effect="light"
              size="small"
            >
              <el-icon v-if="row.last_execute_time" style="margin-right: 3px"><CircleCheckFilled /></el-icon>
              <el-icon v-else style="margin-right: 3px"><Clock /></el-icon>
              {{ row.last_execute_time ? '已完成' : '待办' }}
            </el-tag>
          </div>
          <div class="action-btns">
            <el-button
              v-if="!row.last_execute_time"
              type="primary"
              size="small"
              class="btn-done"
              @click="openDone(row)"
            >
              <el-icon style="margin-right: 4px"><Check /></el-icon>
              完成并记录
            </el-button>
            <el-button
              size="small"
              class="btn-edit"
              @click="openEdit(row)"
            >
              <el-icon style="margin-right: 4px"><Edit /></el-icon>
              编辑备注
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成任务 / 编辑备注 弹窗 -->
    <el-dialog
      v-model="dlg"
      :title="mode === 'done' ? '完成任务' : '编辑备注'"
      width="520px"
      destroy-on-close
      :close-on-click-modal="false"
      class="task-dialog"
    >
      <div class="dialog-elder-info" v-if="form.elder_name">
        <div class="dialog-avatar">{{ form.elder_name[0] }}</div>
        <div class="dialog-info">
          <div class="dialog-elder-name">{{ form.elder_name }}</div>
          <div class="dialog-task-name">{{ form.task_name }}</div>
        </div>
      </div>

      <el-form label-position="top" class="dialog-form">
        <el-form-item label="备注说明">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="可记录体征摘要、异常情况等"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button size="large" @click="dlg = false">取消</el-button>
        <el-button type="primary" size="large" @click="submit">
          <el-icon style="margin-right: 4px">
            {{ mode === 'done' ? '<Check />' : '<Check />' }}
          </el-icon>
          {{ mode === 'done' ? '确认完成' : '保存备注' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import {
  List, Filter, Refresh, FolderOpened, Clock, Comment,
  Check, Edit, CircleCheckFilled,
} from "@element-plus/icons-vue";
import { getNurseTasks, markNurseTaskDone } from "@/api/staffApi";

const store = useStore();
const status = ref("");
const loading = ref(false);
const list = ref([]);

const todoCount = computed(() => list.value.filter((r) => r.status === 0).length);
const doneCount = computed(() => list.value.filter((r) => r.status === 1).length);

const dlg = ref(false);
const mode = ref("done");
const form = reactive({
  id: null,
  elder_id: null,
  elder_name: "",
  task_name: "",
  remark: "",
  status: 0,
  execute_time: "",
});

async function load() {
  loading.value = true;
  try {
    const nurseId = store.state.user?.id;
    const { list: rows } = await getNurseTasks({
      status: status.value,
      nurse_id: nurseId,
    });
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function openDone(row) {
  mode.value = "done";
  Object.assign(form, row);
  dlg.value = true;
}

function openEdit(row) {
  mode.value = "edit";
  Object.assign(form, row);
  dlg.value = true;
}

async function submit() {
  if (mode.value === "done") {
    await markNurseTaskDone(form.id, { remark: form.remark });
  } else {
    ElMessage.info("护理端仅允许补充备注，请在工作人员端编辑任务主体。");
    dlg.value = false;
    return;
  }
  ElMessage.success("已提交");
  dlg.value = false;
  load();
}

onMounted(load);
</script>

<style lang="scss" scoped>
.task-page {
  padding-bottom: 24px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  border-radius: 16px;
  padding: 22px 28px;
  color: #fff;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.page-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  strong { font-weight: 700; }
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.chip-warn { background: #fde68a; }
.chip-success { background: #6ee7b7; }

// ========== 工具栏 ==========
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-select {
  width: 180px;
}

.list-count {
  font-size: 13px;
  color: var(--el-text-color-secondary, #64748b);
  strong { color: #0d9488; font-weight: 700; }
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.opt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.opt-warn { background: #f59e0b; }
.opt-success { background: #22c55e; }

// ========== 任务卡片列表 ==========
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: #94a3b8;
}

.empty-icon {
  font-size: 56px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
}

.task-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
  }

  &.task-done {
    opacity: 0.68;
    .task-name { text-decoration: line-through; color: #94a3b8; }
  }
}

.card-bar {
  width: 5px;
  flex-shrink: 0;
}
.bar-todo { background: linear-gradient(180deg, #f97316, #fb923c); }
.bar-done { background: linear-gradient(180deg, #22c55e, #4ade80); }

.card-body {
  flex: 1;
  padding: 16px 20px;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.elder-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.elder-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.elder-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px 10px;
  flex-shrink: 0;
}

.task-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 8px;
}

.task-remark {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  line-height: 1.5;

  .el-icon {
    color: #94a3b8;
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 10px;
  border-left: 1px dashed var(--el-border-color-lighter, #f1f5f9);
  min-width: 160px;
}

.status-tag {
  align-self: flex-end;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.btn-done {
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  border: none;
  color: #fff;
  font-weight: 600;
  &:hover {
    background: linear-gradient(135deg, #0d6b5f, #0d9488);
  }
}

.btn-edit {
  color: #64748b;
  &:hover { color: #0d9488; background: rgba(13, 148, 136, 0.06); }
}

// ========== 弹窗 ==========
.dialog-elder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf9;
  border: 1px solid rgba(13, 148, 136, 0.12);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.dialog-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-elder-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 3px;
}

.dialog-task-name {
  font-size: 12px;
  color: #64748b;
}

.dialog-form {
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #334155;
  }
  :deep(.el-textarea__inner) {
    border-radius: 10px;
    &::placeholder { color: #cbd5e1; }
  }
}
</style>
