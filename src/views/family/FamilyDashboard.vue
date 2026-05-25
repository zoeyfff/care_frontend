<template>
  <div class="family-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><HomeFilled /></el-icon>
        </div>
        <div>
          <h1 class="page-title">首页概览</h1>
          <p class="page-desc">关注长者动态，传递温暖关怀</p>
        </div>
      </div>
      <div class="header-right">
        <div class="stat-chip">
          <span class="chip-dot chip-rose" />
          <span>关联长者 <strong>{{ linkedElders.length }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-green" />
          <span>健康正常 <strong>{{ healthOkCount }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-amber" />
          <span>体征异常 <strong>{{ healthAlertCount }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 长者卡片 + 最新公告 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <!-- 我的长者 -->
      <el-col :xs="24" :lg="14">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon"><el-icon><User /></el-icon></span>
              <span class="card-title">我的长者</span>
            </div>
            <span class="card-count">{{ linkedElders.length }} 位</span>
          </div>

          <div v-if="!linkedElders.length" class="empty-state">
            <div class="empty-icon"><el-icon><User /></el-icon></div>
            <div class="empty-title">暂未关联长者</div>
            <div class="empty-desc">请联系养老院前台完成绑定</div>
          </div>

          <el-row :gutter="12" v-else>
            <el-col
              v-for="elder in linkedElders"
              :key="elder.id"
              :xs="24"
              :sm="12"
            >
              <div class="elder-card" @click="viewDetail(elder)">
                <div class="elder-card-left">
                  <div class="elder-avatar">{{ elder.name?.[0] || '?' }}</div>
                  <div class="elder-info">
                    <div class="elder-name">{{ elder.name }}</div>
                    <div class="elder-room">
                      <el-icon><Location /></el-icon>
                      {{ elder.room_no || '未分配' }}
                    </div>
                  </div>
                </div>
                <div class="elder-card-right">
                  <el-tag
                    :type="elder.checkinStatus === 1 ? 'success' : 'info'"
                    effect="light"
                    size="small"
                    round
                  >
                    {{ elder.checkinStatus === 1 ? '在住' : '离院' }}
                  </el-tag>
                  <div class="elder-tags">
                    <el-tag size="small" type="info" effect="plain">{{ elder.care_level || '未评级' }}</el-tag>
                    <el-tag size="small" type="info" effect="plain">{{ elder.gender }}</el-tag>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- 最新公告 -->
      <el-col :xs="24" :lg="10">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon"><el-icon><Bell /></el-icon></span>
              <span class="card-title">最新公告</span>
            </div>
            <span class="unread-total" v-if="unreadCount > 0">{{ unreadCount }} 未读</span>
            <el-button link type="primary" size="small" @click="$router.push('/family/activity')">更多</el-button>
          </div>

          <div v-if="!recentNotices.length" class="empty-state">
            <div class="empty-icon"><el-icon><ChatLineSquare /></el-icon></div>
            <div class="empty-title">暂无公告</div>
          </div>

          <div class="notice-list" v-else>
            <div
              v-for="item in recentNotices"
              :key="item.id"
              class="notice-item"
              :class="{ 'is-unread': !item.read }"
              @click="viewNotice(item)"
            >
              <div class="notice-top">
                <span class="notice-title">{{ item.title }}</span>
                <span v-if="!item.read" class="unread-dot" />
                <span v-if="item.file_count > 0" class="file-count-badge">
                  <el-icon><Paperclip /></el-icon>
                  {{ item.file_count }}
                </span>
              </div>
              <div class="notice-meta">
                <el-tag size="small" type="info" effect="plain">{{ item.type || '通知' }}</el-tag>
                <span class="notice-time">{{ item.create_time }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最新体征 -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-icon"><el-icon><TrendCharts /></el-icon></span>
          <span class="card-title">最新体征</span>
        </div>
      </div>

      <div v-if="!linkedElders.length" class="empty-state">
        <div class="empty-icon"><el-icon><TrendCharts /></el-icon></div>
        <div class="empty-title">暂无体征数据</div>
      </div>

      <el-row :gutter="12" v-else>
        <el-col
          v-for="elder in linkedElders"
          :key="elder.id"
          :xs="24"
          :sm="12"
          :lg="8"
        >
          <div class="vital-card">
            <div class="vital-card-header">
              <div class="vital-avatar">{{ elder.name?.[0] || '?' }}</div>
              <div>
                <div class="vital-name">{{ elder.name }}</div>
                <div class="vital-room">{{ elder.room_no || '—' }}</div>
              </div>
              <el-tag
                v-if="latestVitals[elder.id]"
                :type="latestVitals[elder.id].abnormal_flag ? 'danger' : 'success'"
                effect="light"
                size="small"
                round
                style="margin-left: auto"
              >
                {{ latestVitals[elder.id].abnormal_flag ? '异常' : '正常' }}
              </el-tag>
            </div>

            <template v-if="latestVitals[elder.id]">
              <div class="vital-grid">
                <div class="vital-item">
                  <div class="vital-item-label">体温</div>
                  <div
                    class="vital-item-val"
                    :class="latestVitals[elder.id].temperature > 37.3 ? 'val-danger' : 'val-ok'"
                  >
                    {{ latestVitals[elder.id].temperature }}℃
                  </div>
                </div>
                <div class="vital-item">
                  <div class="vital-item-label">血压</div>
                  <div class="vital-item-val">{{ latestVitals[elder.id].blood_pressure || '—' }}</div>
                </div>
                <div class="vital-item">
                  <div class="vital-item-label">心率</div>
                  <div class="vital-item-val">{{ latestVitals[elder.id].heart_rate || '—' }}</div>
                </div>
              </div>
              <div class="vital-time">{{ latestVitals[elder.id].record_time }}</div>
            </template>

            <div v-else class="vital-empty">暂无记录</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 公告详情 -->
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Bell, ChatLineSquare, Clock, Document, Download, HomeFilled, Location, Paperclip, TrendCharts, User,
} from "@element-plus/icons-vue";
import {
  getMyLinkedElders,
  getNoticeFiles,
  getRecentNotices,
  getLatestVitals,
} from "@/api/staffApi";

const router = useRouter();
const linkedElders = ref([]);
const recentNotices = ref([]);
const latestVitals = reactive({});
const unreadCount = ref(0);
const noticeDlg = ref(false);
const currentNotice = ref(null);
const currentNoticeFiles = ref([]);

const healthOkCount = computed(() =>
  Object.values(latestVitals).filter((v) => v && v.temperature && v.temperature <= 37.3).length
);
const healthAlertCount = computed(() =>
  Object.values(latestVitals).filter((v) => v && v.temperature && v.temperature > 37.3).length
);

async function loadDashboard() {
  try {
    const [elderRes, noticeRes] = await Promise.all([
      getMyLinkedElders(),
      getRecentNotices(),
    ]);
    linkedElders.value = elderRes.list || [];
    recentNotices.value = (noticeRes.list || []).slice(0, 6);
    unreadCount.value = (noticeRes.list || []).filter((n) => !n.read).length;
    for (const elder of linkedElders.value) {
      try {
        const vitals = await getLatestVitals({ elder_id: elder.id });
        if ((vitals.list || []).length > 0) {
          latestVitals[elder.id] = vitals.list[0];
        }
      } catch { /* ignore */ }
    }
  } catch (e) {
    console.error("加载首页数据失败", e);
  }
}

function viewDetail(elder) {
  router.push({ path: "/family/elder-info", query: { elder_id: elder.id } });
}

function viewNotice(item) {
  currentNotice.value = item;
  if (!item.read) {
    item.read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
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

onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.family-page {
  padding-bottom: 24px;
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
  gap: 10px;
  flex-wrap: wrap;
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
.chip-rose { background: #fda4af; }
.chip-green { background: #6ee7b7; }
.chip-amber { background: #fde68a; }

// ========== 内容卡片 ==========
.content-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.card-count {
  font-size: 13px;
  color: #64748b;
}

// ========== 附件样式（与 FamilyActivity 共用）==========
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

// ========== 长者卡片 ==========
.elder-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(244, 63, 94, 0.25);
    box-shadow: 0 4px 16px rgba(244, 63, 94, 0.08);
    transform: translateY(-1px);
  }
}

.elder-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.elder-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #be185d, #f43f5e);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.elder-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.elder-room {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
}

.elder-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.elder-tags {
  display: flex;
  gap: 4px;
}

// ========== 公告列表 ==========
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-item {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;

  &:hover {
    background: #fff5f7;
    border-color: rgba(244, 63, 94, 0.12);
  }

  &.is-unread {
    background: #fff5f7;
    border-left: 3px solid #f43f5e;
  }
}

.notice-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f43f5e;
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

.notice-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-time {
  font-size: 12px;
  color: #94a3b8;
}

.unread-total {
  font-size: 12px;
  color: #f43f5e;
  font-weight: 600;
  background: #fff5f7;
  padding: 3px 10px;
  border-radius: 20px;
}

// ========== 体征卡片 ==========
.vital-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }
}

.vital-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.vital-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #be185d, #f43f5e);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vital-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.vital-room {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.vital-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.vital-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
}

.vital-item-label {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.vital-item-val {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.val-ok { color: #16a34a; }
.val-danger { color: #dc2626; }

.vital-time {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
}

.vital-empty {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  padding: 12px 0;
}

// ========== 空状态 ==========
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.empty-icon {
  font-size: 40px;
  color: #d1d5db;
  margin-bottom: 10px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 12px;
  color: #9ca3af;
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
</style>
