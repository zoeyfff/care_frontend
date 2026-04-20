<template>
  <div>
    <h1 class="staff-page-title">家属反馈</h1>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-button type="primary" @click="load">刷新</el-button>
      </div>
      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="family_name" label="家属" width="120" />
        <el-table-column
          prop="content"
          label="反馈内容"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="reply"
          label="院方回复"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? "已处理" : "未处理" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="提交时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openReply(row)"
              >回复</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dlg" title="回复家属" width="520px" destroy-on-close>
      <el-input
        v-model="replyText"
        type="textarea"
        :rows="5"
        placeholder="请输入回复内容"
      />
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getFeedbacks, replyFeedback } from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const dlg = ref(false);
const replyText = ref("");
const active = ref(null);

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getFeedbacks();
    list.value = rows.map((r) => ({
      ...r,
      family_name: r.family_name || `用户#${r.user_id}`,
    }));
  } finally {
    loading.value = false;
  }
}

function openReply(row) {
  active.value = row;
  replyText.value = row.reply || "";
  dlg.value = true;
}

async function submitReply() {
  if (!replyText.value.trim()) {
    ElMessage.warning("请输入回复");
    return;
  }
  await replyFeedback(active.value.id, replyText.value);
  const row = list.value.find((x) => x.id === active.value.id);
  if (row) {
    row.reply = replyText.value;
    row.status = 1;
  }
  ElMessage.success("已提交");
  dlg.value = false;
}

onMounted(load);
</script>

<style scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}
</style>
