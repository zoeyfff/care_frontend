<template>
  <div>
    <h1 class="staff-page-title">意见反馈</h1>
    <p class="sub">提交服务反馈、建议或预约探访，我们会及时处理并回复</p>

    <!-- 提交反馈 -->
    <div class="staff-card" style="margin-bottom: 16px">
      <div class="card-title">提交反馈</div>
      <el-form :model="form" label-width="90px" style="max-width: 600px">
        <el-form-item label="反馈类型" required>
          <el-radio-group v-model="form.type">
            <el-radio label="服务反馈">服务反馈</el-radio>
            <el-radio label="意见建议">意见建议</el-radio>
            <el-radio label="预约探访">预约探访</el-radio>
            <el-radio label="投诉">投诉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联长者" v-if="form.type === '预约探访'">
          <el-select
            v-model="form.elder_id"
            placeholder="请选择长者"
            style="width: 100%"
          >
            <el-option
              v-for="e in linkedElders"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="探访日期" v-if="form.type === '预约探访'">
          <el-date-picker
            v-model="form.visit_date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="反馈内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请详细描述您的反馈内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史反馈 -->
    <div class="staff-card">
      <div class="card-title">我的反馈记录</div>
      <el-table :data="feedbackList" stripe border v-loading="loading">
        <el-table-column prop="create_time" label="提交时间" width="170" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small">{{
              row.type
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="反馈内容"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="处理状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'warning'" size="small">
              {{ row.status ? "已处理" : "待处理" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewReply(row)">
              {{ row.reply ? "查看回复" : "详情" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!feedbackList.length && !loading"
        description="暂无反馈记录"
        :image-size="60"
      />
    </div>

    <!-- 回复详情弹窗 -->
    <el-dialog
      v-model="replyDlg"
      title="反馈详情"
      width="520px"
      destroy-on-close
    >
      <template v-if="currentFeedback">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="提交时间">{{
            currentFeedback.create_time
          }}</el-descriptions-item>
          <el-descriptions-item label="反馈类型">
            <el-tag size="small">{{ currentFeedback.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="currentFeedback.status ? 'success' : 'warning'"
              size="small"
            >
              {{ currentFeedback.status ? "已处理" : "待处理" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容">{{
            currentFeedback.content
          }}</el-descriptions-item>
          <el-descriptions-item v-if="currentFeedback.reply" label="院方回复">
            <div style="color: #16a34a; white-space: pre-wrap">
              {{ currentFeedback.reply }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="replyDlg = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  getMyLinkedElders,
  submitFamilyFeedback,
  getMyFeedbacks,
} from "@/api/staffApi";

const linkedElders = ref([]);
const feedbackList = ref([]);
const loading = ref(false);
const replyDlg = ref(false);
const currentFeedback = ref(null);

const form = reactive({
  type: "服务反馈",
  content: "",
  elder_id: null,
  visit_date: "",
});

function typeTag(type) {
  const map = {
    服务反馈: "",
    意见建议: "info",
    预约探访: "primary",
    投诉: "danger",
  };
  return map[type] || "info";
}

async function loadElders() {
  const res = await getMyLinkedElders();
  linkedElders.value = res.list || [];
}

async function loadFeedbacks() {
  loading.value = true;
  try {
    const res = await getMyFeedbacks();
    feedbackList.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

async function submitFeedback() {
  if (!form.content.trim()) {
    ElMessage.warning("请填写反馈内容");
    return;
  }
  const payload = {
    type: form.type,
    content: form.content,
  };
  if (form.type === "预约探访" && form.elder_id) {
    payload.elder_id = form.elder_id;
    payload.visit_date = form.visit_date;
  }
  await submitFamilyFeedback(payload);
  ElMessage.success("反馈已提交，我们会尽快处理");
  resetForm();
  loadFeedbacks();
}

function resetForm() {
  Object.assign(form, {
    type: "服务反馈",
    content: "",
    elder_id: null,
    visit_date: "",
  });
}

function viewReply(row) {
  currentFeedback.value = row;
  replyDlg.value = true;
}

onMounted(async () => {
  await loadElders();
  loadFeedbacks();
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
  margin-bottom: 16px;
}
</style>
