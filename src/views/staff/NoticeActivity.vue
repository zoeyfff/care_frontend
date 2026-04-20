<template>
  <div>
    <h1 class="staff-page-title">公告与活动</h1>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="公告通知" name="notice">
        <div class="staff-toolbar">
          <el-button type="primary" @click="noticeHint">发布公告</el-button>
          <el-button @click="loadNotices">刷新</el-button>
        </div>
        <el-timeline v-loading="loadingN">
          <el-timeline-item
            v-for="n in notices"
            :key="n.id"
            :timestamp="n.create_time"
            placement="top"
            type="primary"
          >
            <div class="card-item">
              <div class="item-head">
                <span class="title">{{ n.title }}</span>
                <el-tag size="small" effect="plain">{{ n.type }}</el-tag>
              </div>
              <p class="content">{{ n.content }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane label="文娱活动" name="activity">
        <div class="staff-toolbar">
          <el-button type="success" @click="actHint">新建活动</el-button>
          <el-button @click="loadActs">刷新</el-button>
        </div>
        <el-row :gutter="16" v-loading="loadingA">
          <el-col v-for="a in activities" :key="a.id" :xs="24" :sm="12" :lg="8">
            <el-card shadow="hover" class="act-card">
              <template #header>
                <span class="act-title">{{ a.title }}</span>
              </template>
              <p class="act-desc">{{ a.content }}</p>
              <div class="act-time">
                <el-icon><Clock /></el-icon>
                {{ a.start_time }} — {{ a.end_time }}
              </div>
              <el-button type="primary" link class="signup" @click="signupHint"
                >报名管理</el-button
              >
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Clock } from "@element-plus/icons-vue";
import { getNotices, getActivities } from "@/api/staffApi";

const tab = ref("notice");
const loadingN = ref(false);
const loadingA = ref(false);
const notices = ref([]);
const activities = ref([]);

async function loadNotices() {
  loadingN.value = true;
  try {
    const { list } = await getNotices();
    notices.value = list;
  } finally {
    loadingN.value = false;
  }
}

async function loadActs() {
  loadingA.value = true;
  try {
    const { list } = await getActivities();
    activities.value = list;
  } finally {
    loadingA.value = false;
  }
}

function noticeHint() {
  ElMessage.info(
    "表单字段：标题、内容、类型（内部/家属）、发布时间；写入 notice 表。"
  );
}

function actHint() {
  ElMessage.info(
    "活动含开始结束时间；报名可建 activity_signup(elder_id, activity_id) 扩展表。"
  );
}

function signupHint() {
  ElMessage.info("此处可弹出报名名单抽屉，数据来自后端分页接口。");
}

onMounted(() => {
  loadNotices();
  loadActs();
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.tabs-wrap {
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
}

.card-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
}

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

  .title {
    font-weight: 600;
    font-size: 15px;
  }
}

.content {
  margin: 0;
  color: var(--staff-muted);
  font-size: 14px;
  line-height: 1.55;
}

.act-card {
  margin-bottom: 16px;
  border-radius: var(--staff-radius);
}

.act-title {
  font-weight: 600;
}

.act-desc {
  min-height: 48px;
  color: var(--staff-muted);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px;
}

.act-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--staff-text);
}

.signup {
  margin-top: 10px;
}
</style>
