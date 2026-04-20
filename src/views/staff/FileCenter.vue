<template>
  <div>
    <h1 class="staff-page-title">文件中心</h1>

    <div class="staff-card">
      <el-upload
        class="upload-block"
        drag
        action="#"
        :auto-upload="false"
        :on-change="onFileChange"
        :show-file-list="false"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
        <template #tip>
          <div class="el-upload__tip">
            演示环境未实际上传。生产环境：配置 <code>multipart</code> 接口；大于
            20MB 启用分片（如 2MB/片）与合并，携带文件哈希支持断点续传。
          </div>
        </template>
      </el-upload>

      <el-table :data="files" stripe border class="mt" v-loading="loading">
        <el-table-column
          prop="file_name"
          label="文件名"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{
            formatSize(row.file_size)
          }}</template>
        </el-table-column>
        <el-table-column prop="uploader_name" label="上传人" width="100" />
        <el-table-column prop="create_time" label="上传时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="download(row)"
              >下载</el-button
            >
            <el-button link type="danger" @click="delHint">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { getFiles } from "@/api/staffApi";

const loading = ref(false);
const files = ref([]);

function formatSize(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function load() {
  loading.value = true;
  try {
    const { list } = await getFiles();
    files.value = list;
  } finally {
    loading.value = false;
  }
}

function onFileChange(file) {
  ElMessage.success(`已选择：${file.name}（演示未上传，请对接后端）`);
}

function download(row) {
  ElMessage.info(`权限校验通过后：GET /files/${row.id}/download 或预签名 URL`);
}

function delHint() {
  ElMessage.warning("删除需二次确认，并同步清理对象存储。");
}

onMounted(load);
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.upload-block {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border-radius: var(--staff-radius);
  border-color: #99f6e4;
  background: #f0fdfa;
}

.upload-icon {
  font-size: 48px;
  color: var(--staff-primary);
}

.mt {
  margin-top: 20px;
}
</style>
