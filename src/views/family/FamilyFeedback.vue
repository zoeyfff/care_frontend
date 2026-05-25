<template>
  <div class="feedback-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><ChatDotSquare /></el-icon>
        </div>
        <div>
          <h1 class="page-title">意见反馈</h1>
          <p class="page-desc">提交服务反馈、建议或预约探访，我们会及时处理并回复</p>
        </div>
      </div>
      <div class="header-right">
        <div class="stat-chip">
          <span class="chip-dot chip-warn" />
          <span>待处理 <strong>{{ pendingCount }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-success" />
          <span>已回复 <strong>{{ doneCount }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 提交反馈卡片 -->
    <div class="feedback-card submit-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-icon"><el-icon><EditPen /></el-icon></span>
          <span class="card-title">提交反馈</span>
        </div>
      </div>

      <!-- 反馈类型选择 -->
      <div class="type-selector">
        <div
          v-for="t in feedbackTypes"
          :key="t.value"
          class="type-option"
          :class="{ active: form.type === t.value }"
          @click="form.type = t.value"
        >
          <div class="type-icon" :style="{ background: t.bg, color: t.color }">
            <el-icon><component :is="t.icon" /></el-icon>
          </div>
          <div class="type-label">{{ t.label }}</div>
        </div>
      </div>

      <!-- 预约探访额外字段 -->
      <div v-if="form.type === '预约探访'" class="visit-fields">
        <el-form-item label="选择长者">
          <el-select v-model="form.elder_id" placeholder="请选择长者" size="large" style="width: 100%">
            <el-option v-for="e in linkedElders" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="探访日期">
          <el-date-picker
            v-model="form.visit_date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            size="large"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </div>

      <!-- 反馈内容 -->
      <el-form-item label="反馈内容" class="content-label">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="5"
          maxlength="500"
          show-word-limit
          placeholder="请详细描述您的反馈内容，我们会认真对待每一条意见..."
          class="content-textarea"
        />
      </el-form-item>

      <div class="submit-row">
        <el-button size="large" @click="resetForm">重置内容</el-button>
        <el-button type="primary" size="large" class="btn-submit" @click="submitFeedback" :loading="submitting">
          <el-icon style="margin-right: 6px"><Promotion /></el-icon>
          提交反馈
        </el-button>
      </div>
    </div>

    <!-- 历史反馈列表 -->
    <div class="feedback-card history-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-icon"><el-icon><List /></el-icon></span>
          <span class="card-title">我的反馈记录</span>
        </div>
        <span class="list-count">共 <strong>{{ feedbackList.length }}</strong> 条</span>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && feedbackList.length === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon><ChatLineSquare /></el-icon>
        </div>
        <div class="empty-title">暂无反馈记录</div>
        <div class="empty-desc">您还没有提交过任何反馈，如有需要请填写上方表单</div>
      </div>

      <!-- 反馈列表 -->
      <div v-else class="feedback-list">
        <div
          v-for="item in feedbackList"
          :key="item.id"
          class="feedback-item"
          :class="{ 'is-replied': item.status === 1 }"
          @click="viewReply(item)"
        >
          <div class="item-left">
            <div class="item-type-badge" :style="{ background: typeInfo(item.type).bg, color: typeInfo(item.type).color }">
              <el-icon><component :is="typeInfo(item.type).icon" /></el-icon>
            </div>
          </div>
          <div class="item-body">
            <div class="item-top">
              <span class="item-type-label">{{ item.type }}</span>
              <span class="item-time">{{ item.create_time }}</span>
            </div>
            <div class="item-content">{{ item.content }}</div>
            <div v-if="item.reply" class="item-reply">
              <div class="reply-label">
                <el-icon><ChatDotRound /></el-icon>
                院方回复
              </div>
              <div class="reply-text">{{ item.reply }}</div>
            </div>
          </div>
          <div class="item-right">
            <el-tag :type="item.status === 1 ? 'success' : 'warning'" effect="light" size="small" round>
              {{ item.status === 1 ? '已回复' : '待处理' }}
            </el-tag>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 回复详情弹窗 -->
    <el-dialog v-model="replyDlg" title="反馈详情" width="560px" destroy-on-close class="reply-dialog">
      <template v-if="currentFeedback">
        <div class="detail-header">
          <div class="detail-type-badge" :style="{ background: typeInfo(currentFeedback.type).bg, color: typeInfo(currentFeedback.type).color }">
            <el-icon style="margin-right: 6px"><component :is="typeInfo(currentFeedback.type).icon" /></el-icon>
            {{ currentFeedback.type }}
          </div>
          <el-tag :type="currentFeedback.status === 1 ? 'success' : 'warning'" effect="dark" size="small" round>
            {{ currentFeedback.status === 1 ? '已处理' : '待处理' }}
          </el-tag>
        </div>

        <div class="detail-meta">
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            {{ currentFeedback.create_time }}
          </div>
          <div v-if="currentFeedback.visit_date" class="meta-item">
            <el-icon><Calendar /></el-icon>
            预约探访日期：{{ currentFeedback.visit_date }}
          </div>
        </div>

        <div class="detail-section">
          <div class="section-label">反馈内容</div>
          <div class="section-content user-content">{{ currentFeedback.content }}</div>
        </div>

        <div v-if="currentFeedback.reply" class="detail-section">
          <div class="section-label reply-section-label">
            <el-icon style="margin-right: 4px"><ChatDotRound /></el-icon>
            院方回复
          </div>
          <div class="section-content reply-section-content">{{ currentFeedback.reply }}</div>
        </div>

        <div v-else class="detail-no-reply">
          <el-icon style="font-size: 32px; color: #d1d5db; margin-bottom: 8px"><ChatLineSquare /></el-icon>
          <div>院方正在处理中，请耐心等待</div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  ChatDotSquare, ChatLineSquare, EditPen, Promotion,
  List, ArrowRight, Clock, Calendar, ChatDotRound,
} from "@element-plus/icons-vue";
import {
  getMyLinkedElders,
  submitFamilyFeedback,
  getMyFeedbacks,
} from "@/api/staffApi";

const linkedElders = ref([]);
const feedbackList = ref([]);
const loading = ref(false);
const submitting = ref(false);
const replyDlg = ref(false);
const currentFeedback = ref(null);

const feedbackTypes = [
  { value: "服务反馈", label: "服务反馈", icon: "Service", bg: "rgba(13,148,136,0.1)", color: "#e11d48" },
  { value: "意见建议", label: "意见建议", icon: "Lightbulb", bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  { value: "预约探访", label: "预约探访", icon: "Calendar", bg: "rgba(14,116,144,0.1)", color: "#0e7490" },
  { value: "投诉", label: "投诉", icon: "Warning", bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
];

function typeInfo(type) {
  return feedbackTypes.find((t) => t.value === type) || feedbackTypes[0];
}

const pendingCount = computed(() => feedbackList.value.filter((r) => r.status === 0).length);
const doneCount = computed(() => feedbackList.value.filter((r) => r.status === 1).length);

const form = reactive({
  type: "服务反馈",
  content: "",
  elder_id: null,
  visit_date: "",
});

function disabledDate(date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0));
}

async function loadElders() {
  const res = await getMyLinkedElders();
  linkedElders.value = res.list || [];
}

async function loadFeedbacks() {
  loading.value = true;
  try {
    const res = await getMyFeedbacks();
    feedbackList.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

async function submitFeedback() {
  if (!form.content.trim()) {
    ElMessage.warning("请填写反馈内容");
    return;
  }
  if (form.type === "预约探访" && !form.elder_id) {
    ElMessage.warning("请选择要探访的长者");
    return;
  }
  if (form.type === "预约探访" && !form.visit_date) {
    ElMessage.warning("请选择探访日期");
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      type: form.type,
      content: form.content,
      create_time: new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace("/", "-").replace("/", "-"),
    };
    if (form.type === "预约探访" && form.elder_id) {
      payload.elder_id = form.elder_id;
      payload.visit_date = form.visit_date;
    }
    await submitFamilyFeedback(payload);
    ElMessage.success("反馈已提交，我们会尽快处理");
    resetForm();
    await loadFeedbacks();
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  Object.assign(form, {
    type: "服务反馈",
    content: "",
    elder_id: null,
    visit_date: "",
  });
}

function viewReply(row) {
  currentFeedback.value = row;
  replyDlg.value = true;
}

onMounted(async () => {
  await loadElders();
  loadFeedbacks();
});
</script>

<style lang="scss" scoped>
.feedback-page {
  padding-bottom: 32px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #be185d, #f43f5e);
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

// ========== 卡片通用 ==========
.feedback-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  margin-bottom: 16px;
}

.card-header {
  margin-bottom: 20px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.1);
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

// ========== 提交反馈卡片 ==========
.submit-card {
  .card-icon {
    background: rgba(14, 116, 144, 0.1);
    color: #0e7490;
  }
}

.type-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 14px;
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
  background: #f8fafc;

  &:hover {
    border-color: #e2e8f0;
    transform: translateY(-1px);
  }

  &.active {
    border-color: #f43f5e;
    background: #fff5f7;
    box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
  }
}

.type-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.type-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.visit-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.content-label {
  margin-bottom: 20px;
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #334155;
  }
}

.content-textarea {
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    &::placeholder { color: #cbd5e1; }
  }
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-submit {
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border: none;
  font-weight: 600;
  &:hover {
    background: linear-gradient(135deg, #9f1239, #be185d);
  }
}

// ========== 历史记录卡片 ==========
.history-card {
  .card-icon {
    background: rgba(244, 63, 94, 0.1);
    color: #e11d48;
  }
}

.list-count {
  font-size: 13px;
  color: var(--el-text-color-secondary, #64748b);
  strong { color: #be185d; font-weight: 700; }
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(244, 63, 94, 0.25);
    background: #f0fdf9;
    transform: translateX(2px);
  }

  &.is-replied {
    background: #fff;
    border-color: #e2e8f0;
  }
}

.item-left {
  flex-shrink: 0;
}

.item-type-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}

.item-type-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.item-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.item-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-reply {
  margin-top: 10px;
  background: #f0fdf9;
  border: 1px solid rgba(244, 63, 94, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
}

.reply-label {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #e11d48;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reply-text {
  font-size: 13px;
  color: #16a34a;
  line-height: 1.6;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.item-arrow {
  color: #cbd5e1;
  font-size: 14px;
  transition: color 0.2s;
}

.feedback-item:hover .item-arrow {
  color: #e11d48;
}

// ========== 详情弹窗 ==========
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.detail-type-badge {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
  .el-icon { color: #94a3b8; }
}

.detail-section {
  margin-bottom: 16px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.reply-section-label {
  color: #e11d48;
  display: flex;
  align-items: center;
}

.section-content {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
}

.user-content { }

.reply-section-content {
  background: #f0fdf9;
  border: 1px solid rgba(244, 63, 94, 0.12);
  color: #16a34a;
}

.detail-no-reply {
  text-align: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 13px;
}
</style>
