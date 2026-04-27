<template>
  <div>
    <h1 class="staff-page-title">首页概览</h1>
    <p class="sub">关注长者动态，传递温暖关怀</p>

    <!-- 长者卡片概览 -->
    <el-row :gutter="16" class="summary-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="summary-card">
          <div class="summary-icon" style="background: #ede9fe">
            <el-icon style="color: #7c3aed"><User /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-value">{{ linkedElders.length }}</div>
            <div class="summary-label">关联长者</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="summary-card">
          <div class="summary-icon" style="background: #dcfce7">
            <el-icon style="color: #16a34a"><CircleCheck /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-value">{{ healthOkCount }}</div>
            <div class="summary-label">健康正常</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="summary-card">
          <div class="summary-icon" style="background: #fef9c3">
            <el-icon style="color: #ca8a04"><Warning /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-value">{{ healthAlertCount }}</div>
            <div class="summary-label">体征异常提醒</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="summary-card">
          <div class="summary-icon" style="background: #fce7f3">
            <el-icon style="color: #be185d"><Bell /></el-icon>
          </div>
          <div class="summary-info">
            <div class="summary-value">{{ unreadCount }}</div>
            <div class="summary-label">未读公告</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 关联长者 -->
      <el-col :xs="24" :lg="14">
        <div class="staff-card">
          <div class="card-title">我的长者</div>
          <el-row :gutter="12">
            <el-col
              v-for="elder in linkedElders"
              :key="elder.id"
              :xs="24"
              :sm="12"
            >
              <div class="elder-card">
                <div class="elder-header">
                  <el-avatar :size="44" style="background: #7c3aed">
                    {{ elder.name?.slice(0, 1) }}
                  </el-avatar>
                  <div class="elder-meta">
                    <div class="elder-name">{{ elder.name }}</div>
                    <div class="elder-room">
                      <el-icon><HomeFilled /></el-icon>
                      {{ elder.room_no || "未分配" }}
                    </div>
                  </div>
                  <el-tag
                    :type="elder.checkinStatus === 1 ? 'success' : 'info'"
                    size="small"
                  >
                    {{ elder.checkinStatus === 1 ? "在住" : "离院" }}
                  </el-tag>
                </div>
                <div class="elder-tags">
                  <el-tag size="small" type="info">{{
                    elder.care_level || "未评级"
                  }}</el-tag>
                  <el-tag size="small" type="info">{{ elder.gender }}</el-tag>
                </div>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  style="width: 100%; margin-top: 8px"
                  @click="viewDetail(elder)"
                >
                  查看详情
                </el-button>
              </div>
            </el-col>
          </el-row>
          <el-empty
            v-if="!linkedElders.length"
            description="暂未关联长者信息"
            :image-size="60"
          />
        </div>
      </el-col>

      <!-- 最新公告 -->
      <el-col :xs="24" :lg="10">
        <div class="staff-card">
          <div class="card-title">
            最新公告
            <el-button
              link
              type="primary"
              @click="$router.push('/family/activity')"
            >
              更多
            </el-button>
          </div>
          <div class="notice-list">
            <div
              v-for="item in recentNotices"
              :key="item.id"
              class="notice-item"
              @click="viewNotice(item)"
            >
              <div class="notice-title">
                <span v-if="!item.read" class="unread-dot" />
                {{ item.title }}
              </div>
              <div class="notice-time">{{ item.create_time }}</div>
            </div>
            <el-empty
              v-if="!recentNotices.length"
              description="暂无公告"
              :image-size="50"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最新体征简览 -->
    <div class="staff-card" style="margin-top: 16px">
      <div class="card-title">最新体征记录</div>
      <el-row :gutter="12">
        <el-col
          v-for="elder in linkedElders"
          :key="elder.id"
          :xs="24"
          :sm="12"
          :lg="8"
        >
          <div class="vital-mini-card">
            <div class="vital-mini-title">{{ elder.name }}</div>
            <template v-if="latestVitals[elder.id]">
              <div class="vital-mini-row">
                <span class="vital-label">体温</span>
                <span
                  :class="[
                    'vital-val',
                    latestVitals[elder.id].temperature > 37.3
                      ? 'val-danger'
                      : 'val-ok',
                  ]"
                >
                  {{ latestVitals[elder.id].temperature }}℃
                </span>
              </div>
              <div class="vital-mini-row">
                <span class="vital-label">血压</span>
                <span class="vital-val">{{
                  latestVitals[elder.id].blood_pressure || "-"
                }}</span>
              </div>
              <div class="vital-mini-row">
                <span class="vital-label">心率</span>
                <span class="vital-val">{{
                  latestVitals[elder.id].heart_rate || "-"
                }}</span>
              </div>
              <div class="vital-mini-time">
                {{ latestVitals[elder.id].record_time }}
              </div>
            </template>
            <el-empty v-else description="暂无记录" :image-size="40" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog
      v-model="noticeDlg"
      title="公告详情"
      width="520px"
      destroy-on-close
    >
      <template v-if="currentNotice">
        <div class="notice-detail-title">{{ currentNotice.title }}</div>
        <div class="notice-detail-meta">
          <el-icon><Clock /></el-icon>
          {{ currentNotice.create_time }}
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Bell,
  CircleCheck,
  Clock,
  HomeFilled,
  User,
  Warning,
} from "@element-plus/icons-vue";
import {
  getMyLinkedElders,
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

const healthOkCount = computed(() => {
  return Object.values(latestVitals).filter(
    (v) => v && v.temperature && v.temperature <= 37.3
  ).length;
});

const healthAlertCount = computed(() => {
  return Object.values(latestVitals).filter(
    (v) => v && v.temperature && v.temperature > 37.3
  ).length;
});

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
      } catch {
        // ignore
      }
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
  item.read = true;
  unreadCount.value = Math.max(0, unreadCount.value - 1);
  noticeDlg.value = true;
}

onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--staff-text);
  line-height: 1.2;
}

.summary-label {
  font-size: 13px;
  color: var(--staff-muted);
  margin-top: 2px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.elder-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.elder-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.elder-meta {
  flex: 1;
  min-width: 0;
}

.elder-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
}

.elder-room {
  font-size: 12px;
  color: var(--staff-muted);
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}

.elder-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notice-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f5f5f5;
  }
}

.notice-title {
  font-size: 14px;
  color: var(--staff-text);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7c3aed;
  flex-shrink: 0;
}

.notice-time {
  font-size: 12px;
  color: var(--staff-muted);
  margin-top: 2px;
}

.vital-mini-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.vital-mini-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
  margin-bottom: 10px;
}

.vital-mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.vital-label {
  font-size: 13px;
  color: var(--staff-muted);
}

.vital-val {
  font-size: 14px;
  font-weight: 500;
}

.val-ok {
  color: #16a34a;
}

.val-danger {
  color: #dc2626;
}

.vital-mini-time {
  font-size: 11px;
  color: var(--staff-muted);
  margin-top: 6px;
  text-align: right;
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
