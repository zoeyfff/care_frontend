<template>
  <div>
    <h1 class="staff-page-title">事件上报</h1>
    <p class="sub">
      用于记录跌倒、擦伤、走失风险、突发不适等事件，支持后续追踪与闭环处理。
    </p>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-button type="danger" @click="open()">新增上报</el-button>
        <el-button @click="load">刷新</el-button>
      </div>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="event_time" label="时间" width="170" />
        <el-table-column prop="elder_name" label="长者" width="110" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="level" label="等级" width="90">
          <template #default="{ row }">
            <el-tag
              :type="
                row.level === '严重'
                  ? 'danger'
                  : row.level === '一般'
                  ? 'warning'
                  : 'info'
              "
            >
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="描述"
          min-width="260"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? "已处理" : "待处理" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 1"
              link
              type="primary"
              @click="mark(row)"
            >
              标记已处理
            </el-button>
            <el-popconfirm title="确定删除该上报？" @confirm="remove(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dlg"
      title="新增事件上报"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="长者" required>
          <el-select v-model="form.elder_id" filterable style="width: 100%">
            <el-option
              v-for="e in elders"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="类型" required>
              <el-select
                v-model="form.type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="跌倒/摔伤" value="跌倒/摔伤" />
                <el-option label="突发不适" value="突发不适" />
                <el-option label="走失风险" value="走失风险" />
                <el-option label="皮肤/压疮" value="皮肤/压疮" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级" required>
              <el-select
                v-model="form.level"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="提示" value="提示" />
                <el-option label="一般" value="一般" />
                <el-option label="严重" value="严重" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发生时间" required>
          <el-date-picker
            v-model="form.event_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="事件描述" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="事件经过、处置措施、需协助事项等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="save">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  deleteIncident,
  getElderList,
  getIncidents,
  saveIncident,
  markIncidentDone,
} from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const elders = ref([]);
const dlg = ref(false);
const form = reactive({
  elder_id: null,
  type: "跌倒/摔伤",
  level: "一般",
  event_time: "",
  content: "",
});

function reset() {
  Object.assign(form, {
    elder_id: elders.value[0]?.id || null,
    type: "跌倒/摔伤",
    level: "一般",
    event_time: "",
    content: "",
  });
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getIncidents();
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function open() {
  reset();
  dlg.value = true;
}

async function save() {
  if (
    !form.elder_id ||
    !form.type ||
    !form.level ||
    !form.event_time ||
    !form.content
  ) {
    ElMessage.warning("请完善必填项");
    return;
  }
  const elder_name = elders.value.find((e) => e.id === form.elder_id)?.name;
  await saveIncident({ ...form, elder_name });
  ElMessage.success("已提交");
  dlg.value = false;
  load();
}

async function mark(row) {
  await markIncidentDone(row.id);
  ElMessage.success("已标记");
  load();
}

async function remove(row) {
  await deleteIncident(row.id);
  ElMessage.success("已删除");
  load();
}

onMounted(async () => {
  const { list: rows } = await getElderList();
  elders.value = rows;
  load();
});
</script>

<style scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}
</style>
