<template>
  <div>
    <h1 class="staff-page-title">公告通知</h1>

    <div class="staff-card">
      <!-- 工具栏 -->
      <div class="notice-toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索公告标题"
          clearable
          style="width: 220px"
          @keyup.enter="loadNotices"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="typeFilter"
          placeholder="公告类型"
          clearable
          style="width: 140px"
        >
          <el-option label="全部类型" value="" />
          <el-option label="内部通知" value="内部通知" />
          <el-option label="家属通知" value="家属通知" />
          <el-option label="健康提示" value="健康提示" />
          <el-option label="安全公告" value="安全公告" />
        </el-select>
        <el-button type="primary" @click="openPublishDialog">
          <el-icon style="margin-right: 4px"><EditPen /></el-icon>发布公告
        </el-button>
        <el-button @click="loadNotices">
          <el-icon style="margin-right: 4px"><Refresh /></el-icon>刷新
        </el-button>
      </div>

      <!-- 统计条 -->
      <div class="stats-bar">
        <div
          v-for="item in typeStats"
          :key="item.type"
          class="stat-chip"
          :class="`chip-${item.key}`"
          @click="typeFilter = item.value"
        >
          <span class="stat-count">{{ item.count }}</span>
          <span class="stat-label">{{ item.type }}</span>
        </div>
      </div>

      <!-- 列表 -->
      <div v-if="filteredNotices.length === 0 && !loading" class="empty-wrap">
        <el-empty description="暂无公告，点击上方「发布公告」创建" :image-size="80" />
      </div>

      <div v-else class="notice-list" v-loading="loading">
        <div
          v-for="n in filteredNotices"
          :key="n.id"
          class="notice-card"
          :class="`notice-card--${noticeColorKey(n.type)}`"
          @click="openDetail(n)"
        >
          <div class="notice-card__left">
            <div class="notice-type-bar" :class="`type-bar--${noticeColorKey(n.type)}`" />
          </div>
          <div class="notice-card__body">
            <div class="notice-card__head">
              <span class="notice-card__title">{{ n.title }}</span>
              <el-tag size="small" effect="plain" :type="noticeTagType(n.type)">
                {{ n.type }}
              </el-tag>
            </div>
            <p class="notice-card__content">{{ n.content }}</p>
            <div class="notice-card__meta">
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ n.create_time }}
              </span>
              <span class="meta-item" v-if="noticeFileCount[n.id] > 0">
                <el-icon><Paperclip /></el-icon>
                {{ noticeFileCount[n.id] }} 个附件
              </span>
              <span class="meta-arrow">
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredNotices.length > 0" class="list-footer">
        共 {{ filteredNotices.length }} 条公告
      </div>
    </div>

    <!-- 发布公告弹窗 -->
    <el-dialog
      v-model="publishDlg"
      title="发布公告"
      width="660px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入公告标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="内部通知" value="内部通知" />
            <el-option label="家属通知" value="家属通知" />
            <el-option label="健康提示" value="健康提示" />
            <el-option label="安全公告" value="安全公告" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告正文内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- 拖拽上传 -->
        <el-form-item label="附件">
          <div class="upload-wrap">
            <el-upload
              ref="uploadRef"
              v-model:file-list="pendingFiles"
              action="#"
              :auto-upload="false"
              :accept="acceptTypes"
              :limit="10"
              :on-exceed="onExceed"
              :on-change="onFileChange"
              :on-remove="onFileRemove"
              :on-preview="onFilePreview"
              drag
              multiple
            >
              <div class="drag-inner">
                <el-icon class="drag-icon"><UploadFilled /></el-icon>
                <div class="drag-text">
                  <span>将文件拖到此处，或 <em>点击上传</em></span>
                  <span class="drag-tip">支持 jpg、png、pdf、docx、xlsx，最多 10 个文件</span>
                </div>
              </div>
            </el-upload>

            <!-- 上传队列 -->
            <div v-if="uploadQueue.length > 0" class="upload-queue">
              <div class="queue-title">
                <span>待上传文件</span>
                <span v-if="isUploading" class="upload-status">
                  上传中 {{ uploadProgress }}%
                </span>
              </div>
              <div v-for="item in uploadQueue" :key="item.uid" class="queue-item">
                <div class="queue-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="queue-info">
                  <div class="queue-name">{{ item.name }}</div>
                  <div class="queue-size">{{ formatSize(item.size) }}</div>
                  <el-progress
                    v-if="item.progress < 100"
                    :percentage="item.progress"
                    :stroke-width="3"
                    :show-text="false"
                  />
                  <div v-else class="queue-done">
                    <el-icon style="color: #16a34a"><CircleCheck /></el-icon> 已上传
                  </div>
                </div>
                <el-button
                  v-if="item.progress < 100"
                  type="danger" text size="small"
                  @click="removeFromQueue(item.uid)"
                >
                  移除
                </el-button>
                <el-button
                  v-else
                  type="primary" text size="small"
                  @click="onFilePreview(item)"
                >
                  预览
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="publishDlg = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="submitPublish">
          <el-icon style="margin-right: 4px" v-if="!publishing"><Promotion /></el-icon>
          发布公告
        </el-button>
      </template>
    </el-dialog>

    <!-- 公告详情 -->
    <el-dialog
      v-model="detailDlg"
      title="公告详情"
      width="720px"
      destroy-on-close
    >
      <template v-if="currentNotice">
        <div class="detail-header">
          <div class="detail-title-row">
            <h2 class="detail-title">{{ currentNotice.title }}</h2>
            <el-tag size="default" effect="plain" :type="noticeTagType(currentNotice.type)">
              {{ currentNotice.type }}
            </el-tag>
          </div>
          <div class="detail-meta">
            <span>
              <el-icon><Clock /></el-icon>
              {{ currentNotice.create_time }}
            </span>
            <span>
              <el-icon><User /></el-icon>
              发布人：{{ currentNotice.publisher_name || "管理员" }}
            </span>
          </div>
        </div>

        <el-divider />

        <div class="detail-body">{{ currentNotice.content }}</div>

        <template v-if="noticeFiles[currentNotice.id]?.length">
          <el-divider content-position="left">
            <el-icon><Paperclip /></el-icon> 附件列表
          </el-divider>
          <el-table
            :data="noticeFiles[currentNotice.id]"
            border
            size="small"
            max-height="260"
          >
            <el-table-column prop="file_name" label="文件名" min-width="240" show-overflow-tooltip />
            <el-table-column label="大小" width="90">
              <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
            </el-table-column>
            <el-table-column prop="uploader_name" label="上传人" width="100" />
            <el-table-column prop="create_time" label="上传时间" width="150" />
            <el-table-column label="操作" width="110" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleDownload(currentNotice, row)">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteFile(currentNotice, row)">
                  <template #reference>
                    <el-button link type="danger" size="small">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <el-empty
          v-else
          description="暂无附件"
          :image-size="60"
          style="margin: 12px 0"
        />
      </template>

      <template #footer>
        <el-button type="primary" @click="detailDlg = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 文件预览 -->
    <el-dialog v-model="previewDlg" title="文件预览" width="780px" destroy-on-close>
      <div v-if="previewFile" class="preview-wrap">
        <div v-if="isImage(previewFile.name)" class="preview-image">
          <img :src="previewFile.url" :alt="previewFile.name" />
        </div>
        <div v-else class="preview-unsupported">
          <el-icon :size="48" style="color: #9ca3af"><Document /></el-icon>
          <p>此文件类型暂不支持预览</p>
          <el-button type="primary" @click="handleDownload(previewFile.notice, previewFile)">
            <el-icon style="margin-right: 4px"><Download /></el-icon>下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Search, Refresh, EditPen, UploadFilled, Clock, Paperclip,
  ArrowRight, Document, Promotion, CircleCheck, Download,
  Delete, User,
} from "@element-plus/icons-vue";
import {
  getNotices,
  createNotice,
  getNoticeDetail,
  uploadNoticeFile,
  downloadNoticeFile,
  deleteNoticeFile,
} from "@/api/staffApi";

const loading = ref(false);
const notices = ref([]);
const noticeFiles = ref({});
const noticeFileCount = ref({});
const keyword = ref("");
const typeFilter = ref("");
const publishDlg = ref(false);
const detailDlg = ref(false);
const previewDlg = ref(false);
const publishing = ref(false);
const pendingFiles = ref([]);
const currentNotice = ref(null);
const previewFile = ref(null);
const formRef = ref();
const uploadRef = ref();
const uploadQueue = ref([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const acceptTypes = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar";

const form = reactive({ title: "", type: "内部通知", content: "" });
const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
};

const filteredNotices = computed(() => {
  let list = notices.value;
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase();
    list = list.filter((n) => n.title.toLowerCase().includes(k));
  }
  if (typeFilter.value) {
    list = list.filter((n) => n.type === typeFilter.value);
  }
  return list;
});

const typeStats = computed(() => {
  const types = ["内部通知", "家属通知", "健康提示", "安全公告"];
  return types.map((t) => ({
    type: t,
    value: t,
    key: { "内部通知": "info", "家属通知": "success", "健康提示": "warning", "安全公告": "danger" }[t],
    count: notices.value.filter((n) => n.type === t).length,
  }));
});

function noticeTagType(type) {
  return { "内部通知": "primary", "家属通知": "success", "健康提示": "warning", "安全公告": "danger" }[type] || "info";
}

function noticeColorKey(type) {
  return { "内部通知": "primary", "家属通知": "success", "健康提示": "warning", "安全公告": "danger" }[type] || "info";
}

function formatSize(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function isImage(name) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
}

// ========== 数据加载 ==========
async function loadNotices() {
  loading.value = true;
  try {
    const { list } = await getNotices();
    notices.value = list || [];
    noticeFileCount.value = {};
    (list || []).forEach((n) => {
      noticeFileCount.value[n.id] = Number(n.file_count || 0);
    });
  } finally {
    loading.value = false;
  }
}

async function loadFiles(noticeId) {
  const detail = await getNoticeDetail(noticeId);
  const list = detail?.files || [];
  noticeFiles.value[noticeId] = list;
  noticeFileCount.value[noticeId] = list.length;
}

// ========== 发布 ==========
function openPublishDialog() {
  form.title = "";
  form.type = "内部通知";
  form.content = "";
  pendingFiles.value = [];
  uploadQueue.value = [];
  isUploading.value = false;
  uploadProgress.value = 0;
  publishDlg.value = true;
}

function onFileChange(file, fileList) {
  pendingFiles.value = fileList;
  if (!uploadQueue.value.find((q) => q.uid === file.uid)) {
    uploadQueue.value.push({ ...file, progress: 0 });
  }
}

function onFileRemove(file, fileList) {
  pendingFiles.value = fileList;
  uploadQueue.value = uploadQueue.value.filter((q) => q.uid !== file.uid);
}

function onFilePreview(file) {
  if (!file.url && file.raw) {
    file.url = URL.createObjectURL(file.raw);
  }
  previewFile.value = { ...file, notice: currentNotice.value };
  previewDlg.value = true;
}

function removeFromQueue(uid) {
  pendingFiles.value = pendingFiles.value.filter((f) => f.uid !== uid);
  uploadQueue.value = uploadQueue.value.filter((q) => q.uid !== uid);
}

function onExceed() {
  ElMessage.warning("最多上传 10 个文件");
}

async function submitPublish() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  publishing.value = true;
  try {
    const notice = await createNotice({
      title: form.title.trim(),
      type: form.type,
      content: form.content.trim(),
    });

    if (uploadQueue.value.length > 0) {
      isUploading.value = true;
      const total = uploadQueue.value.length;
      let done = 0;
      for (const item of uploadQueue.value) {
        const raw = item.raw || item;
        try {
          const result = await uploadNoticeFile(notice.id, raw, (pct) => {
            const q = uploadQueue.value.find((x) => x.uid === item.uid);
            if (q) q.progress = pct;
          });
          item.progress = 100;
          item.uploadedId = result.id;
        } catch {
          item.progress = -1;
        }
        done++;
        uploadProgress.value = Math.round((done / total) * 100);
      }
      isUploading.value = false;
    }

    ElMessage.success("公告发布成功");
    publishDlg.value = false;
    await loadNotices();
  } catch (e) {
    ElMessage.error("发布失败：" + (e?.message || "未知错误"));
  } finally {
    publishing.value = false;
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}

// ========== 详情 ==========
async function openDetail(notice) {
  currentNotice.value = notice;
  if (!noticeFiles.value[notice.id]) {
    await loadFiles(notice.id);
  }
  detailDlg.value = true;
}

async function deleteFile(notice, row) {
  await deleteNoticeFile(notice.id, row.id);
  noticeFiles.value[notice.id] = noticeFiles.value[notice.id].filter((f) => f.id !== row.id);
  noticeFileCount.value[notice.id] = noticeFiles.value[notice.id].length;
  ElMessage.success("附件已删除");
}

async function handleDownload(notice, row) {
  try {
    const { blob, filename } = await downloadNoticeFile(notice.id, row.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || row.file_name || "附件";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("下载失败");
  }
}

onMounted(loadNotices);
</script>

<style lang="scss" scoped>
.notice-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

// 统计条
.stats-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--el-border-color-lighter);
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.chip-info { border-color: #bfdbfe; background: #eff6ff; }
  &.chip-success { border-color: #bbf7d0; background: #f0fdf4; }
  &.chip-warning { border-color: #fde68a; background: #fffbeb; }
  &.chip-danger { border-color: #fecaca; background: #fef2f2; }
}

.stat-count {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--staff-muted);
}

// 空状态
.empty-wrap {
  padding: 50px 0;
}

// 列表
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    border-color: var(--staff-primary);
    box-shadow: 0 3px 12px rgba(13, 148, 136, 0.1);
    transform: translateY(-1px);
  }

  &--primary .notice-type-bar { background: #3b82f6; }
  &--success .notice-type-bar { background: #22c55e; }
  &--warning .notice-type-bar { background: #f59e0b; }
  &--danger .notice-type-bar { background: #ef4444; }
}

.notice-card__left {
  flex-shrink: 0;
  width: 4px;
}

.notice-type-bar {
  height: 100%;
  min-height: 90px;
}

.notice-card__body {
  flex: 1;
  padding: 14px 16px;
  min-width: 0;
}

.notice-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.notice-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--staff-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-card__content {
  font-size: 13px;
  color: var(--staff-muted);
  line-height: 1.6;
  margin: 0 0 10px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notice-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--staff-muted);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-arrow {
  margin-left: auto;
  color: var(--staff-primary);
  opacity: 0;
  transition: opacity 0.15s;
}

.notice-card:hover .meta-arrow {
  opacity: 1;
}

.list-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--staff-muted);
}

// 详情弹窗
.detail-header {
  margin-bottom: 4px;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--staff-text);
}

.detail-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--staff-muted);

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.detail-body {
  font-size: 14px;
  line-height: 1.8;
  color: var(--staff-text);
  white-space: pre-wrap;
  padding: 4px 0;
}

// 上传
.upload-wrap {
  width: 100%;
}

.drag-inner {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drag-icon {
  font-size: 42px;
  color: var(--staff-primary);
}

.drag-text {
  text-align: center;
  font-size: 14px;
  color: var(--staff-text);

  em {
    color: var(--staff-primary);
    font-style: normal;
  }
}

.drag-tip {
  display: block;
  font-size: 12px;
  color: var(--staff-muted);
  margin-top: 4px;
}

.upload-queue {
  margin-top: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.queue-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #f8fafc;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  font-weight: 500;
}

.upload-status {
  font-size: 12px;
  color: var(--staff-primary);
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child { border-bottom: none; }
}

.queue-icon {
  font-size: 24px;
  color: var(--staff-primary);
  flex-shrink: 0;
}

.queue-info {
  flex: 1;
  min-width: 0;
}

.queue-name {
  font-size: 13px;
  color: var(--staff-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-size {
  font-size: 11px;
  color: var(--staff-muted);
  margin-top: 2px;
}

.queue-done {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #16a34a;
  margin-top: 2px;
}

// 预览
.preview-wrap {
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 6px;
  }
}

.preview-unsupported {
  text-align: center;
  padding: 40px;
  color: var(--staff-muted);

  p { margin: 12px 0 16px; font-size: 14px; }
}
</style>
