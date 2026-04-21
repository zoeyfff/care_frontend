<template>
  <div>
    <h1 class="staff-page-title">公告与活动</h1>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="公告通知" name="notice">
        <div class="staff-toolbar">
          <el-button type="primary" @click="openNoticeDialog">发布公告</el-button>
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
            <div class="card-item notice-clickable" @click="openNoticeDetail(n)">
              <div class="item-head">
                <span class="title">{{ n.title }}</span>
                <el-tag size="small" effect="plain">{{ n.type }}</el-tag>
              </div>
              <p class="content">{{ n.content }}</p>
              <div class="attach-count">
                附件：{{ noticeFileCount[n.id] || 0 }} 个（点击查看详情）
              </div>
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

    <el-dialog
      v-model="noticeDlg"
      title="发布公告"
      width="620px"
      destroy-on-close
    >
      <el-form :model="noticeForm" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="noticeForm.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="noticeForm.type" style="width: 100%">
            <el-option label="内部通知" value="内部通知" />
            <el-option label="家属通知" value="家属通知" />
            <el-option label="健康提示" value="健康提示" />
            <el-option label="安全公告" value="安全公告" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            :file-list="pendingFiles"
            :auto-upload="false"
            :on-change="onPendingFileChange"
            :on-remove="onPendingFileRemove"
            multiple
          >
            <el-button type="primary" plain>选择附件</el-button>
          </el-upload>
          <div class="upload-tip">可不上传附件；附件会绑定到该公告详情页。</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeDlg = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="submitNotice">
          发布
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="noticeDetailDlg"
      title="公告详情"
      width="760px"
      destroy-on-close
    >
      <template v-if="currentNotice">
        <div class="detail-head">
          <h3>{{ currentNotice.title }}</h3>
          <el-tag size="small" effect="plain">{{ currentNotice.type }}</el-tag>
        </div>
        <p class="detail-time">发布时间：{{ currentNotice.create_time }}</p>
        <p class="detail-content">{{ currentNotice.content }}</p>
        <div class="detail-section-title">附件下载</div>
        <el-table :data="noticeFiles[currentNotice.id] || []" border size="small">
          <el-table-column
            prop="file_name"
            label="文件名"
            min-width="260"
            show-overflow-tooltip
          />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
          </el-table-column>
          <el-table-column prop="uploader_name" label="上传人" width="110" />
          <el-table-column prop="create_time" label="上传时间" width="170" />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="downloadFile(currentNotice, row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <el-button @click="noticeDetailDlg = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Clock } from "@element-plus/icons-vue";
import {
  getNotices,
  getActivities,
  createNotice,
  getNoticeDetail,
  uploadNoticeFile,
  downloadNoticeFile,
} from "@/api/staffApi";

const tab = ref("notice");
const loadingN = ref(false);
const loadingA = ref(false);
const notices = ref([]);
const activities = ref([]);
const noticeFiles = ref({});
const noticeFileCount = ref({});
const noticeDlg = ref(false);
const noticeDetailDlg = ref(false);
const publishing = ref(false);
const pendingFiles = ref([]);
const currentNotice = ref(null);
const noticeForm = reactive({
  title: "",
  type: "内部通知",
  content: "",
});

function formatSize(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function loadNoticeFiles(noticeId) {
  const detail = await getNoticeDetail(noticeId);
  const list = detail?.files || [];
  noticeFiles.value[noticeId] = list || [];
  noticeFileCount.value[noticeId] = (list || []).length;
}

async function loadNotices() {
  loadingN.value = true;
  try {
    const { list } = await getNotices();
    notices.value = list;
    noticeFileCount.value = {};
    (list || []).forEach((n) => {
      noticeFileCount.value[n.id] = Number(n.file_count || 0);
    });
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
  ElMessage.info("请使用“发布公告”弹窗填写内容并可选上传附件。");
}

function actHint() {
  ElMessage.info(
    "活动含开始结束时间；报名可建 activity_signup(elder_id, activity_id) 扩展表。"
  );
}

function signupHint() {
  ElMessage.info("此处可弹出报名名单抽屉，数据来自后端分页接口。");
}

function openNoticeDialog() {
  noticeForm.title = "";
  noticeForm.type = "内部通知";
  noticeForm.content = "";
  pendingFiles.value = [];
  noticeDlg.value = true;
}

function onPendingFileChange(file, fileList) {
  pendingFiles.value = fileList;
}

function onPendingFileRemove(file, fileList) {
  pendingFiles.value = fileList;
}

async function submitNotice() {
  if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
    ElMessage.warning("请填写公告标题和内容");
    return;
  }
  publishing.value = true;
  try {
    const notice = await createNotice({
      title: noticeForm.title.trim(),
      type: noticeForm.type,
      content: noticeForm.content.trim(),
    });
    for (const item of pendingFiles.value) {
      const raw = item.raw || item;
      await uploadNoticeFile(notice.id, raw);
    }
    ElMessage.success("公告发布成功");
    noticeDlg.value = false;
    await loadNotices();
  } finally {
    publishing.value = false;
  }
}

async function openNoticeDetail(notice) {
  currentNotice.value = notice;
  if (!noticeFiles.value[notice.id]) {
    await loadNoticeFiles(notice.id);
  }
  noticeDetailDlg.value = true;
}

async function downloadFile(notice, row) {
  const { blob, filename } = await downloadNoticeFile(notice.id, row.id);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || row.file_name || "附件";
  a.click();
  window.URL.revokeObjectURL(url);
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

.notice-clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.notice-clickable:hover {
  border-color: #99f6e4;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.12);
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
  margin-bottom: 10px;
}

.attach-count {
  font-size: 13px;
  color: var(--staff-text);
}

.upload-tip {
  font-size: 12px;
  color: var(--staff-muted);
  margin-top: 6px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;

  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.detail-time {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--staff-muted);
}

.detail-content {
  margin: 0 0 16px;
  line-height: 1.65;
  color: var(--staff-text);
  white-space: pre-wrap;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
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
