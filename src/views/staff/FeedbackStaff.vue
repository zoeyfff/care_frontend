<template>
  <div class="feedback-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><ChatDotSquare /></el-icon>
        </div>
        <div>
          <h1 class="page-title">家属反馈</h1>
          <p class="page-desc">查看并回复家属提交的服务反馈与投诉建议</p>
        </div>
      </div>
      <div class="header-right">
        <div class="stat-chip">
          <span class="chip-dot chip-warn" />
          <span>待处理 <strong>{{ pendingCount }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-success" />
          <span>已处理 <strong>{{ doneCount }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="filterStatus"
          placeholder="全部状态"
          clearable
          size="large"
          class="status-select"
          @change="applyFilter"
        >
          <template #prefix>
            <el-icon><Filter /></el-icon>
          </template>
          <el-option label="全部" value="" />
          <el-option label="待处理" :value="0">
            <div class="opt-item"><span class="opt-dot opt-warn" />待处理</div>
          </el-option>
          <el-option label="已处理" :value="1">
            <div class="opt-item"><span class="opt-dot opt-success" />已处理</div>
          </el-option>
        </el-select>
        <el-select
          v-model="filterType"
          placeholder="全部类型"
          clearable
          size="large"
          class="type-select"
          @change="applyFilter"
        >
          <template #prefix>
            <el-icon><Tickets /></el-icon>
          </template>
          <el-option label="全部类型" value="" />
          <el-option label="服务反馈" value="服务反馈" />
          <el-option label="意见建议" value="意见建议" />
          <el-option label="预约探访" value="预约探访" />
          <el-option label="投诉" value="投诉" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <span class="list-count">共 <strong>{{ filteredList.length }}</strong> 条反馈</span>
        <el-button size="large" type="primary" plain @click="load">
          <el-icon style="margin-right: 4px"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 反馈列表 -->
    <div class="feedback-list" v-loading="loading">
      <!-- 空状态 -->
      <div v-if="!loading && filteredList.length === 0" class="empty-state">
        <div class="empty-icon"><el-icon><ChatLineSquare /></el-icon></div>
        <div class="empty-title">暂无反馈</div>
        <div class="empty-desc">当前筛选条件下没有家属反馈记录</div>
      </div>

      <!-- 反馈卡片 -->
      <div
        v-for="row in filteredList"
        :key="row.id"
        class="feedback-card"
        :class="{ 'is-done': row.status === 1 }"
      >
        <div class="card-bar" :class="row.status === 1 ? 'bar-done' : 'bar-pending'" />

        <div class="card-body">
          <!-- 卡片顶部 -->
          <div class="card-top">
            <div class="family-info">
              <div class="family-avatar">{{ avatarText(row.family_name) }}</div>
              <div class="family-meta">
                <div class="family-name">{{ row.family_name }}</div>
                <div class="feedback-time">{{ row.create_time }}</div>
              </div>
            </div>
            <div class="card-top-right">
              <el-tag
                :type="typeTag(row.type)"
                effect="light"
                size="small"
                round
              >{{ row.type }}</el-tag>
              <el-tag
                :type="row.status === 1 ? 'success' : 'warning'"
                effect="light"
                size="small"
                round
              >
                <el-icon v-if="row.status === 1" style="margin-right: 3px"><CircleCheckFilled /></el-icon>
                <el-icon v-else style="margin-right: 3px"><Clock /></el-icon>
                {{ row.status === 1 ? '已处理' : '待处理' }}
              </el-tag>
            </div>
          </div>

          <!-- 反馈内容 -->
          <div class="feedback-content">
            <div class="content-label">
              <el-icon><ChatLineSquare /></el-icon>
              反馈内容
            </div>
            <div class="content-text">{{ row.content }}</div>
          </div>

          <!-- 院方回复 -->
          <div v-if="row.reply" class="reply-block">
            <div class="reply-label">
              <el-icon><ChatDotRound /></el-icon>
              院方回复
            </div>
            <div class="reply-text">{{ row.reply }}</div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <el-button
              v-if="row.status === 0"
              type="primary"
              size="small"
              class="btn-reply"
              @click="openReply(row)"
            >
              <el-icon style="margin-right: 4px"><Position /></el-icon>
              回复反馈
            </el-button>
            <el-button
              v-else
              size="small"
              class="btn-view"
              @click="openReply(row)"
            >
              <el-icon style="margin-right: 4px"><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回复弹窗 -->
    <el-dialog
      v-model="dlg"
      :title="active?.status === 1 ? '查看回复' : '回复家属'"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
      class="reply-dialog"
    >
      <template v-if="active">
        <!-- 反馈信息摘要 -->
        <div class="dialog-summary">
          <div class="summary-avatar">{{ avatarText(active.family_name) }}</div>
          <div class="summary-info">
            <div class="summary-name">{{ active.family_name }}</div>
            <div class="summary-time">{{ active.create_time }}</div>
          </div>
          <el-tag :type="typeTag(active.type)" effect="light" size="small" round>
            {{ active.type }}
          </el-tag>
        </div>

        <!-- 反馈内容 -->
        <div class="dialog-section">
          <div class="dialog-section-label">
            <el-icon><ChatLineSquare /></el-icon>
            反馈内容
          </div>
          <div class="dialog-content">{{ active.content }}</div>
        </div>

        <!-- 回复编辑 / 查看 -->
        <div class="dialog-section">
          <div class="dialog-section-label">
            <el-icon><ChatDotRound /></el-icon>
            回复内容
          </div>
          <el-input
            v-if="active.status === 0"
            v-model="replyText"
            type="textarea"
            :rows="5"
            maxlength="300"
            show-word-limit
            placeholder="请输入回复内容，真诚的回复能让家属更放心..."
            class="reply-textarea"
          />
          <div v-else class="dialog-reply-view">{{ active.reply }}</div>
        </div>
      </template>

      <template #footer>
        <el-button size="large" @click="dlg = false">关闭</el-button>
        <el-button
          v-if="active?.status === 0"
          type="primary"
          size="large"
          class="btn-submit"
          @click="submitReply"
        >
          <el-icon style="margin-right: 4px"><Check /></el-icon>
          提交回复
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  ChatDotSquare, ChatLineSquare, Filter, Tickets,
  Refresh, CircleCheckFilled, Clock, ChatDotRound,
  Position, View, Check,
} from "@element-plus/icons-vue";
import { getFeedbacks, replyFeedback } from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const dlg = ref(false);
const replyText = ref("");
const active = ref(null);
const filterStatus = ref("");
const filterType = ref("");

const filteredList = computed(() => {
  return list.value.filter((r) => {
    if (filterStatus.value !== "" && r.status !== filterStatus.value) return false;
    if (filterType.value && r.type !== filterType.value) return false;
    return true;
  });
});

const pendingCount = computed(() => list.value.filter((r) => r.status === 0).length);
const doneCount = computed(() => list.value.filter((r) => r.status === 1).length);

function avatarText(name) {
  return (name || "?")[0].toUpperCase();
}

function typeTag(type) {
  const map = {
    "服务反馈": "",
    "意见建议": "info",
    "预约探访": "primary",
    "投诉": "danger",
  };
  return map[type] || "info";
}

function applyFilter() {
  // computed 自动响应
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getFeedbacks();
    list.value = rows.map((r) => ({
      ...r,
      family_name: r.family_name || `用户#${r.user_id}`,
    }));
  } finally {
    loading.value = false;
  }
}

function openReply(row) {
  active.value = row;
  replyText.value = row.reply || "";
  dlg.value = true;
}

async function submitReply() {
  if (!replyText.value.trim()) {
    ElMessage.warning("请输入回复内容");
    return;
  }
  await replyFeedback(active.value.id, replyText.value);
  const row = list.value.find((x) => x.id === active.value.id);
  if (row) {
    row.reply = replyText.value;
    row.status = 1;
  }
  ElMessage.success("回复已提交");
  dlg.value = false;
}

onMounted(load);
</script>

<style lang="scss" scoped>
.feedback-page {
  padding-bottom: 24px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
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

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-select,
.type-select {
  width: 150px;
}

.list-count {
  font-size: 13px;
  color: var(--el-text-color-secondary, #64748b);
  strong { color: #4f46e5; font-weight: 700; }
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

// ========== 反馈卡片列表 ==========
.feedback-list {
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

.feedback-card {
  display: flex;
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
  }

  &.is-done {
    opacity: 0.75;
  }
}

.card-bar {
  width: 5px;
  flex-shrink: 0;
}
.bar-pending { background: linear-gradient(180deg, #f97316, #fb923c); }
.bar-done { background: linear-gradient(180deg, #22c55e, #4ade80); }

.card-body {
  flex: 1;
  padding: 18px 22px;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.family-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.family-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.family-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.feedback-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.card-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.feedback-content {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.content-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  .el-icon { color: #94a3b8; }
}

.content-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
}

.reply-block {
  background: #f0fdf9;
  border: 1px solid rgba(13, 148, 136, 0.12);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.reply-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.reply-text {
  font-size: 13px;
  color: #16a34a;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px dashed #f1f5f9;
}

.btn-reply {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  color: #fff;
  font-weight: 600;
  &:hover { background: linear-gradient(135deg, #4338ca, #6d28d9); }
}

.btn-view {
  color: #64748b;
  &:hover { color: #4f46e5; background: rgba(79, 70, 229, 0.06); }
}

// ========== 回复弹窗 ==========
.dialog-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
}

.summary-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.summary-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 3px;
}

.dialog-section {
  margin-bottom: 16px;
}

.dialog-section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  .el-icon { color: #94a3b8; }
}

.dialog-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 16px;
}

.reply-textarea {
  :deep(.el-textarea__inner) {
    border-radius: 10px;
    &::placeholder { color: #cbd5e1; }
  }
}

.dialog-reply-view {
  font-size: 14px;
  color: #16a34a;
  line-height: 1.7;
  background: #f0fdf9;
  border: 1px solid rgba(13, 148, 136, 0.12);
  border-radius: 10px;
  padding: 14px 16px;
}

.btn-submit {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  font-weight: 600;
  &:hover { background: linear-gradient(135deg, #4338ca, #6d28d9); }
}
</style>
