<template>
  <div class="family-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="page-title">公告与活动</h1>
          <p class="page-desc">查看养老院发布的公告、活动通知与最新动态</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="content-card">
      <div class="tab-nav">
        <div
          v-for="t in tabs"
          :key="t.value"
          class="tab-item"
          :class="{ active: tab === t.value }"
          @click="switchTab(t.value)"
        >
          <el-icon><component :is="t.icon" /></el-icon>
          {{ t.label }}
          <span v-if="t.value === 'notice' && unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </div>
      </div>

      <!-- 公告通知 -->
      <div v-if="tab === 'notice'" class="tab-content">
        <div class="tab-toolbar">
          <el-button @click="loadNotices">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
          <el-input
            v-model="keyword"
            placeholder="搜索公告标题"
            clearable
            size="large"
            style="width: 220px"
            @change="loadNotices"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <div v-if="!notices.length && !loading" class="empty-state">
          <div class="empty-icon"><el-icon><ChatLineSquare /></el-icon></div>
          <div class="empty-title">暂无公告</div>
          <div class="empty-desc">当前没有发布的公告信息</div>
        </div>

        <div class="notice-list" v-else>
          <div
            v-for="item in notices"
            :key="item.id"
            class="notice-card"
            :class="{ 'notice-unread': !item.read }"
            @click="openNotice(item)"
          >
            <div class="notice-card-body">
              <div class="notice-top">
                <div class="notice-title">{{ item.title }}</div>
                <span v-if="!item.read" class="unread-badge">未读</span>
                <span v-if="item.file_count > 0" class="file-count-badge">
                  <el-icon><Paperclip /></el-icon>
                  {{ item.file_count }}
                </span>
              </div>
              <div class="notice-meta">
                <el-tag size="small" type="info" effect="plain">{{ item.type || '通知' }}</el-tag>
                <span class="notice-time">{{ item.create_time }}</span>
              </div>
              <div class="notice-content-preview">
                {{ item.content?.slice(0, 100) }}{{ item.content?.length > 100 ? '…' : '' }}
              </div>
            </div>
            <div class="notice-card-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 活动安排 -->
      <div v-if="tab === 'activity'" class="tab-content">
        <div class="tab-toolbar">
          <el-button @click="loadActivities">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <div v-if="!activities.length && !loading" class="empty-state">
          <div class="empty-icon"><el-icon><Calendar /></el-icon></div>
          <div class="empty-title">暂无活动安排</div>
          <div class="empty-desc">敬请期待后续活动通知</div>
        </div>

        <el-row :gutter="16" v-else>
          <el-col
            v-for="act in activities"
            :key="act.id"
            :xs="24"
            :sm="12"
            :lg="8"
          >
            <div class="activity-card" :class="{ 'activity-passed': !isUpcoming(act.start_time) }">
              <div class="activity-header">
                <div class="activity-title">{{ act.title }}</div>
                <el-tag
                  :type="isUpcoming(act.start_time) ? 'success' : 'info'"
                  effect="light"
                  size="small"
                  round
                >
                  {{ isUpcoming(act.start_time) ? '即将开始' : '已结束' }}
                </el-tag>
              </div>

              <div class="activity-time">
                <el-icon><Clock /></el-icon>
                {{ act.start_time?.slice(0, 16) }}
                <span v-if="act.end_time">
                  ~ {{ act.end_time?.slice(11, 16) }}
                </span>
              </div>

              <div class="activity-content">{{ act.content }}</div>

              <div class="activity-footer">
                <el-tag v-if="act.location" size="small" type="info" effect="plain">
                  <el-icon style="margin-right: 3px"><Location /></el-icon>
                  {{ act.location }}
                </el-tag>
                <el-button
                  v-if="isUpcoming(act.start_time)"
                  type="primary"
                  size="small"
                  class="btn-join"
                  @click.stop="joinActivity(act)"
                >
                  报名参加
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog v-model="noticeDlg" title="公告详情" width="560px" destroy-on-close class="notice-dlg">
      <template v-if="currentNotice">
        <div class="dlg-header">
          <div class="dlg-title">{{ currentNotice.title }}</div>
          <div class="dlg-meta">
            <el-icon><Clock /></el-icon>
            {{ currentNotice.create_time }}
            <el-tag size="small" type="info" effect="light" style="margin-left: 8px">{{ currentNotice.type || '通知' }}</el-tag>
          </div>
        </div>
        <div class="dlg-content">{{ currentNotice.content }}</div>

        <!-- 附件列表 -->
        <div v-if="currentNoticeFiles.length" class="file-list-section">
          <div class="file-list-title">
            <el-icon><Paperclip /></el-icon>
            附件 ({{ currentNoticeFiles.length }})
          </div>
          <div
            v-for="f in currentNoticeFiles"
            :key="f.id"
            class="file-item"
            @click="downloadFile(f)"
          >
            <div class="file-info">
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-name">{{ f.file_name }}</div>
            </div>
            <el-tag size="small" type="info" effect="plain">{{ formatFileSize(f.file_size) }}</el-tag>
            <el-button link type="primary" size="small">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button size="large" @click="noticeDlg = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  ArrowRight, Calendar, ChatLineSquare, Clock, Document, Download,
  Location, Paperclip, Refresh, Search,
} from "@element-plus/icons-vue";
import { getActivities, getNoticeFiles, getPublicNotices } from "@/api/staffApi";

const tab = ref("notice");
const keyword = ref("");
const notices = ref([]);
const activities = ref([]);
const loading = ref(false);
const noticeDlg = ref(false);
const currentNotice = ref(null);
const currentNoticeFiles = ref([]);

const tabs = [
  { value: "notice", label: "公告通知", icon: "ChatLineSquare" },
  { value: "activity", label: "活动安排", icon: "Calendar" },
];

const unreadCount = computed(() => notices.value.filter((n) => !n.read).length);

function switchTab(t) {
  tab.value = t;
}

async function loadNotices() {
  loading.value = true;
  try {
    const res = await getPublicNotices({ keyword: keyword.value });
    notices.value = (res.list || []).map((n) => ({ ...n, read: n.read ?? false }));
  } finally {
    loading.value = false;
  }
}

async function loadActivities() {
  loading.value = true;
  try {
    const res = await getActivities();
    activities.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

function openNotice(item) {
  currentNotice.value = item;
  if (!item.read) {
    item.read = true;
  }
  // 加载附件列表
  currentNoticeFiles.value = [];
  getNoticeFiles(item.id)
    .then((res) => {
      currentNoticeFiles.value = res.files || res.list || [];
    })
    .catch(() => {});
  noticeDlg.value = true;
}

function downloadFile(f) {
  window.open(`/api/notices/${f.notice_id || currentNotice.value?.id}/files/${f.id}/download`, "_blank");
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isUpcoming(startTime) {
  if (!startTime) return false;
  return new Date(startTime) > new Date();
}

function joinActivity(act) {
  ElMessage.success(`已报名参加「${act.title}」，请准时参加！`);
}

onMounted(() => {
  loadNotices();
  loadActivities();
});
</script>

<style lang="scss" scoped>
.family-page {
  padding-bottom: 24px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
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

// ========== 内容卡片 ==========
.content-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  overflow: hidden;
}

// ========== Tab 导航 ==========
.tab-nav {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  padding: 0 24px;
  gap: 4px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: -1px;

  &:hover { color: #be185d; }

  &.active {
    color: #be185d;
    border-bottom-color: #f43f5e;
  }
}

.tab-badge {
  background: #f43f5e;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 20px;
  font-weight: 700;
}

// ========== Tab 内容 ==========
.tab-content {
  padding: 20px 24px;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

// ========== 公告列表 ==========
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-card {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 12px;

  &:hover {
    border-color: rgba(244, 63, 94, 0.2);
    box-shadow: 0 4px 16px rgba(244, 63, 94, 0.06);
    transform: translateX(2px);
  }

  &.notice-unread {
    background: #fff5f7;
    border-left: 3px solid #f43f5e;
  }
}

.notice-card-body {
  flex: 1;
  min-width: 0;
}

.notice-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.notice-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background: #f43f5e;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.file-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #fff5f7;
  color: #e11d48;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(244, 63, 94, 0.2);
  flex-shrink: 0;
  font-weight: 600;
}

.file-list-section {
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.file-list-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  .el-icon { color: #94a3b8; }
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(244, 63, 94, 0.2);
    background: #fff5f7;
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  color: #94a3b8;
  font-size: 18px;
  flex-shrink: 0;
}

.file-name {
  font-size: 13px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #fff5f7;
  color: #e11d48;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(244, 63, 94, 0.2);
  flex-shrink: 0;
  font-weight: 600;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.notice-time {
  font-size: 12px;
  color: #94a3b8;
}

.notice-content-preview {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notice-card-arrow {
  color: #cbd5e1;
  font-size: 16px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.notice-card:hover .notice-card-arrow {
  color: #f43f5e;
}

// ========== 活动卡片 ==========
.activity-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border-color: rgba(244, 63, 94, 0.15);
  }

  &.activity-passed {
    opacity: 0.6;
  }
}

.activity-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.activity-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
  .el-icon { color: #94a3b8; }
}

.activity-content {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.activity-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.btn-join {
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border: none;
  color: #fff;
  font-weight: 600;
  &:hover { background: linear-gradient(135deg, #9f1239, #be185d); }
}

// ========== 弹窗 ==========
.notice-dlg {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #f1f5f9;
    margin-right: 0;
    padding-bottom: 14px;
  }
}

.dlg-header {
  margin-bottom: 16px;
}

.dlg-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.dlg-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #94a3b8;
  .el-icon { color: #94a3b8; }
}

.dlg-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.8;
  white-space: pre-wrap;
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px 16px;
}

// ========== 空状态 ==========
.empty-state {
  text-align: center;
  padding: 64px 0;
}

.empty-icon {
  font-size: 52px;
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
</style>
