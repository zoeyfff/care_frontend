<template>
  <div>
    <h1 class="staff-page-title">长者管理</h1>
    <div class="staff-card">
      <div class="staff-toolbar">
        <el-input
          v-model="keyword"
          placeholder="姓名 / 房间 / 身份证"
          clearable
          style="width: 240px"
          @keyup.enter="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openEdit()">新增长者</el-button>
        <el-button @click="exportHint">导出 Excel（对接后端）</el-button>
      </div>
      <el-table
        :data="tableData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="姓名" width="90" fixed />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column
          prop="id_card"
          label="身份证号"
          min-width="170"
          show-overflow-tooltip
        />
        <el-table-column prop="phone" label="本人电话" width="120" />
        <el-table-column
          prop="family_contact"
          label="家属联系方式"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="care_level" label="护理等级" width="100" />
        <el-table-column label="房间床位" width="120">
          <template #default="{ row }"
            >{{ row.room_no }} / {{ row.bed_no }}</template
          >
        </el-table-column>
        <el-table-column prop="checkin_date" label="入住日期" width="110" />
        <el-table-column
          prop="health_info"
          label="健康概况"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)"
              >编辑</el-button
            >
            <el-popconfirm title="确定删除该档案？" @confirm="remove(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="visible"
      :title="form.id ? '编辑长者' : '新增长者'"
      width="640px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="form.gender"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号" prop="id_card">
          <el-input v-model="form.id_card" />
        </el-form-item>
        <el-form-item label="本人电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="家属联系方式" prop="family_contact">
          <el-input v-model="form.family_contact" placeholder="姓名 + 电话" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="护理等级" prop="care_level">
              <el-select
                v-model="form.care_level"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="特级护理" value="特级护理" />
                <el-option label="一级护理" value="一级护理" />
                <el-option label="二级护理" value="二级护理" />
                <el-option label="三级护理" value="三级护理" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住日期" prop="checkin_date">
              <el-date-picker
                v-model="form.checkin_date"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="房间号" prop="room_no">
              <el-input v-model="form.room_no" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床位号" prop="bed_no">
              <el-input v-model="form.bed_no" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="健康概况">
          <el-input v-model="form.health_info" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="个性化护理计划">
          <el-input
            v-model="form.care_plan"
            type="textarea"
            :rows="4"
            placeholder="起居、饮食、康复、用药协助等个性化要点（可映射扩展字段或独立表）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getElderList, saveElder, deleteElder } from "@/api/staffApi";

const keyword = ref("");
const loading = ref(false);
const tableData = ref([]);
const visible = ref(false);
const formRef = ref();
const form = reactive({
  id: null,
  name: "",
  gender: "",
  id_card: "",
  phone: "",
  family_contact: "",
  health_info: "",
  care_level: "",
  room_no: "",
  bed_no: "",
  checkin_date: "",
  care_plan: "",
});

const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  family_contact: [
    { required: true, message: "请填写家属联系方式", trigger: "blur" },
  ],
  care_level: [
    { required: true, message: "请选择护理等级", trigger: "change" },
  ],
};

function resetForm() {
  Object.assign(form, {
    id: null,
    name: "",
    gender: "",
    id_card: "",
    phone: "",
    family_contact: "",
    health_info: "",
    care_level: "",
    room_no: "",
    bed_no: "",
    checkin_date: "",
    care_plan: "",
  });
}

async function load() {
  loading.value = true;
  try {
    const { list } = await getElderList({ keyword: keyword.value });
    tableData.value = list;
  } finally {
    loading.value = false;
  }
}

function openEdit(row) {
  resetForm();
  if (row) {
    Object.assign(form, { ...row, care_plan: row.care_plan || "" });
  }
  visible.value = true;
}

async function save() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  const row = await saveElder({ ...form });
  if (form.id) {
    const i = tableData.value.findIndex((x) => x.id === form.id);
    if (i >= 0) tableData.value[i] = { ...tableData.value[i], ...row };
  } else {
    tableData.value.unshift({
      ...row,
      create_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
  }
  ElMessage.success("已保存");
  visible.value = false;
}

async function remove(row) {
  await deleteElder(row.id);
  tableData.value = tableData.value.filter((x) => x.id !== row.id);
  ElMessage.success("已删除");
}

function exportHint() {
  ElMessage.info(
    "对接后端后：调用分页导出接口，前端可展示进度条（见「数据导入导出」页）"
  );
}

onMounted(load);
</script>
