<template>
  <div>
    <h1 class="staff-page-title">公告与活动</h1>
    <p class="sub">查看养老院发布的公告、活动通知与最新动态</p>

    <!-- 公告列表 -->
    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="公告通知" name="notice">
        <div class="staff-toolbar">
          <el-button @click="loadNotices">刷新</el-button>
          <el-input
            v-model="keyword"
            placeholder="搜索公告标题"
            clearable
            style="width: 200px; margin-left: auto"
            @change="loadNotices"
          />
        </div>
        <div class="notice-list">
          <div
            v-for="item in notices"
            :key="item.id"
            class="notice-card"
            :class="{ 'notice-unread': !item.read }"
            @click="openNotice(item)"
          >
            <div class="notice-card-header">
              <span class="notice-card-title">{{ item.title }}</span>
              <span v-if="!item.read" class="unread-badge">未读</span>
            </div>
            <div class="notice-card-meta">
              <el-tag size="small" type="info">{{
                item.type || "通知"
              }}</el-tag>
              <span class="notice-time">{{ item.create_time }}</span>
            </div>
            <div class="notice-card-content">
              {{ item.content?.slice(0, 120)
              }}{{ item.content?.length > 120 ? "…" : "" }}
            </div>
          </div>
          <el-empty
            v-if="!notices.length && !loading"
            description="暂无公告"
            :image-size="60"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="活动安排" name="activity">
        <div class="staff-toolbar">
          <el-button @click="loadActivities">刷新</el-button>
        </div>
        <el-row :gutter="16">
          <el-col
            v-for="act in activities"
            :key="act.id"
            :xs="24"
            :sm="12"
            :lg="8"
          >
            <div class="activity-card">
              <div class="activity-header">
                <div class="activity-title">{{ act.title }}</div>
                <el-tag
                  :type="isUpcoming(act.start_time) ? 'primary' : 'info'"
                  size="small"
                >
                  {{ isUpcoming(act.start_time) ? "即将开始" : "已结束" }}
                </el-tag>
              </div>
              <div class="activity-info">
                <div class="activity-row">
                  <el-icon><Calendar /></el-icon>
                  {{ act.start_time?.slice(0, 16) }}
                  {{ act.end_time ? `~ ${act.end_time?.slice(11, 16)}` : "" }}
                </div>
              </div>
              <div class="activity-content">{{ act.content }}</div>
              <el-button
                v-if="isUpcoming(act.start_time)"
                type="primary"
                plain
                size="small"
                style="width: 100%; margin-top: 10px"
                @click.stop="joinActivity(act)"
              >
                报名参加
              </el-button>
            </div>
          </el-col>
        </el-row>
        <el-empty
          v-if="!activities.length && !loading"
          description="暂无活动安排"
          :image-size="60"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 公告详情弹窗 -->
    <el-dialog
      v-model="noticeDlg"
      title="公告详情"
      width="560px"
      destroy-on-close
    >
      <template v-if="currentNotice">
        <div class="notice-detail-title">{{ currentNotice.title }}</div>
        <div class="notice-detail-meta">
          <el-icon><Clock /></el-icon>
          {{ currentNotice.create_time }}
          <el-tag size="small" type="info" style="margin-left: 8px">
            {{ currentNotice.type || "通知" }}
          </el-tag>
        </div>
        <el-divider />
        <div class="notice-detail-content">{{ currentNotice.content }}</div>
      </template>
      <template #footer>
        <el-button @click="noticeDlg = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Calendar, Clock } from "@element-plus/icons-vue";
import { getPublicNotices, getActivities } from "@/api/staffApi";

const tab = ref("notice");
const keyword = ref("");
const notices = ref([]);
const activities = ref([]);
const loading = ref(false);
const noticeDlg = ref(false);
const currentNotice = ref(null);

async function loadNotices() {
  loading.value = true;
  try {
    const res = await getPublicNotices({ keyword: keyword.value });
    notices.value = (res.list || []).map((n) => ({ ...n, read: false }));
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
  item.read = true;
  noticeDlg.value = true;
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
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.tabs-wrap {
  padding: 0;
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
}

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-color: #c4b5fd;
  }
}

.notice-unread {
  border-left: 3px solid #7c3aed;
  background: #faf5ff;
}

.notice-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.notice-card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
}

.unread-badge {
  background: #7c3aed;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.notice-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.notice-time {
  font-size: 12px;
  color: var(--staff-muted);
}

.notice-card-content {
  font-size: 13px;
  color: var(--staff-muted);
  line-height: 1.6;
}

.activity-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.activity-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
}

.activity-info {
  margin-bottom: 8px;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--staff-muted);
}

.activity-content {
  font-size: 13px;
  color: var(--staff-muted);
  line-height: 1.6;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 8px 10px;
}

.notice-detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--staff-text);
  margin-bottom: 8px;
}

.notice-detail-meta {
  font-size: 13px;
  color: var(--staff-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-detail-content {
  font-size: 14px;
  color: var(--staff-text);
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
