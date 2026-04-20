<template>
  <div>
    <h1 class="staff-page-title">数据导入导出（Excel）</h1>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <div class="staff-card">
          <h3 class="block-title">导入长者档案</h3>
          <p class="hint">
            前端可用 el-upload 选表；解析可由后端完成，或浏览器侧 js-xlsx
            预检列名。
          </p>
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            accept=".xlsx,.xls"
            :on-change="onImport"
            :limit="1"
          >
            <el-icon class="upload-icon"><Document /></el-icon>
            <div class="el-upload__text">选择 Excel 模板文件</div>
          </el-upload>
          <el-alert
            v-if="importLog"
            class="mt"
            :title="importLog"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="staff-card">
          <h3 class="block-title">导出报表</h3>
          <p class="hint">
            演示：模拟多页导出进度。真实环境由后端生成文件流或返回下载链接。
          </p>
          <el-space wrap>
            <el-button type="primary" :loading="exporting" @click="runExport"
              >导出在院长者清单</el-button
            >
            <el-button :loading="exporting" @click="runExport"
              >导出月度账单汇总</el-button
            >
          </el-space>
          <div v-if="exporting || progress > 0" class="progress-wrap">
            <span class="prog-label">导出进度</span>
            <el-progress
              :percentage="progress"
              :status="progress >= 100 ? 'success' : undefined"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Document } from "@element-plus/icons-vue";

const importLog = ref("");
const exporting = ref(false);
const progress = ref(0);

function onImport(file) {
  importLog.value = `已选择「${file.name}」：建议后端返回 { success, errors[] }，前端用表格展示失败行号与原因。`;
  ElMessage.success("文件已选择（演示）");
}

function runExport() {
  if (exporting.value) return;
  exporting.value = true;
  progress.value = 0;
  const timer = setInterval(() => {
    progress.value += 12;
    if (progress.value >= 100) {
      clearInterval(timer);
      exporting.value = false;
      ElMessage.success("导出完成（演示）：实际应触发浏览器下载或通知中心");
    }
  }, 280);
}
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 20px;
  color: var(--staff-muted);
  font-size: 14px;
}

.block-title {
  margin: 0 0 10px;
  font-size: 16px;
}

.hint {
  font-size: 13px;
  color: var(--staff-muted);
  margin: 0 0 16px;
  line-height: 1.5;
}

.upload-icon {
  font-size: 42px;
  color: var(--staff-primary);
}

.mt {
  margin-top: 16px;
}

.progress-wrap {
  margin-top: 20px;
  max-width: 360px;
}

.prog-label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--staff-muted);
}
</style>
