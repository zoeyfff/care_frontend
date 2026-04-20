<template>
  <div>
    <h1 class="staff-page-title">交接班</h1>
    <p class="sub">
      交接班记录建议后端落库（含班次、交班人/接班人、重点关注长者、待办事项等）。
    </p>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-button type="primary" @click="open()">新增交接</el-button>
        <el-button @click="load">刷新</el-button>
      </div>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="shift_date" label="日期" width="120" />
        <el-table-column prop="shift" label="班次" width="100" />
        <el-table-column prop="from_name" label="交班人" width="100" />
        <el-table-column prop="to_name" label="接班人" width="100" />
        <el-table-column
          prop="content"
          label="重点内容"
          min-width="260"
          show-overflow-tooltip
        />
        <el-table-column prop="create_time" label="记录时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">编辑</el-button>
            <el-popconfirm title="确定删除该记录？" @confirm="remove(row)">
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
      :title="form.id ? '编辑交接' : '新增交接'"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="日期" required>
              <el-date-picker
                v-model="form.shift_date"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班次" required>
              <el-select
                v-model="form.shift"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="早班" value="早班" />
                <el-option label="中班" value="中班" />
                <el-option label="晚班" value="晚班" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="交班人" required>
              <el-input v-model="form.from_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接班人" required>
              <el-input v-model="form.to_name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="交接内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="重点长者、风险提示、待办事项等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { deleteHandover, getHandovers, saveHandover } from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const dlg = ref(false);
const form = reactive({
  id: null,
  shift_date: "",
  shift: "早班",
  from_name: "",
  to_name: "",
  content: "",
});

function reset() {
  Object.assign(form, {
    id: null,
    shift_date: "",
    shift: "早班",
    from_name: "",
    to_name: "",
    content: "",
  });
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getHandovers();
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function open(row) {
  reset();
  if (row) Object.assign(form, row);
  dlg.value = true;
}

async function save() {
  if (
    !form.shift_date ||
    !form.shift ||
    !form.from_name ||
    !form.to_name ||
    !form.content
  ) {
    ElMessage.warning("请完善必填项");
    return;
  }
  await saveHandover({ ...form });
  ElMessage.success("已保存");
  dlg.value = false;
  load();
}

async function remove(row) {
  await deleteHandover(row.id);
  ElMessage.success("已删除");
  load();
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
