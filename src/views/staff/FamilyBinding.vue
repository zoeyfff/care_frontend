<template>
  <div>
    <h1 class="staff-page-title">家属绑定管理</h1>
    <p class="sub">为每位长者绑定一位家属联系人，绑定后家属可查看长者账单及健康信息。一个长者最多绑定一位家属，一位家属可绑定多位长者。</p>

    <el-alert
      v-if="tipsMsg"
      :title="tipsMsg"
      :type="tipsType"
      show-icon
      closable
      class="mb-16"
      style="border-radius: 8px"
      @close="tipsMsg = ''"
    />

    <!-- 工具栏 -->
    <div class="staff-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索长者姓名 / 房间号"
        clearable
        style="width: 220px"
        @input="loadElders"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="bindStatus"
        placeholder="绑定状态"
        clearable
        style="width: 150px"
        @change="loadElders"
      >
        <el-option label="全部" :value="null" />
        <el-option label="已绑定" :value="1" />
        <el-option label="未绑定" :value="0" />
      </el-select>
      <el-button @click="loadElders">刷新</el-button>
    </div>

    <!-- 长者绑定列表 -->
    <el-table
      :data="elders"
      stripe
      border
      v-loading="loading"
      max-height="560"
    >
      <el-table-column prop="name" label="长者姓名" width="110" />
      <el-table-column prop="room_no" label="房间号" width="90" />
      <el-table-column prop="care_level" label="护理等级" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.care_level || "未评级" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.binded ? 'success' : 'warning'" size="small">
            {{ row.binded ? "已绑定" : "未绑定" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="家属信息" min-width="220">
        <template #default="{ row }">
          <template v-if="row.binding">
            <div class="family-info">
              <div class="family-name">
                <el-icon style="color: #7c3aed"><User /></el-icon>
                {{ row.binding.real_name || row.binding.username }}
                <el-tag size="small" type="info" style="margin-left: 6px">
                  {{ row.binding.relation || "家属" }}
                </el-tag>
              </div>
              <div class="family-contact">
                <span v-if="row.binding.phone">
                  <el-icon><Phone /></el-icon> {{ row.binding.phone }}
                </span>
                <span v-if="row.binding.email" style="margin-left: 12px">
                  <el-icon><Message /></el-icon> {{ row.binding.email }}
                </span>
              </div>
            </div>
          </template>
          <span v-else style="color: var(--staff-muted); font-size: 13px">—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.binded"
            type="primary"
            link
            size="small"
            @click="openChangeDlg(row)"
          >
            更换家属
          </el-button>
          <el-button
            v-if="row.binded"
            type="danger"
            link
            size="small"
            @click="confirmUnbind(row)"
          >
            解除绑定
          </el-button>
          <el-button
            v-if="!row.binded"
            type="primary"
            link
            size="small"
            @click="openBindDlg(row)"
          >
            绑定家属
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!elders.length && !loading" description="暂无长者数据" :image-size="60" />

    <!-- 绑定家属弹窗 -->
    <el-dialog
      v-model="bindDlg"
      :title="bindTarget ? `绑定家属 — ${bindTarget.name}` : '绑定家属'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="bindForm" label-width="90px" :rules="bindRules" ref="bindFormRef">
        <el-form-item label="长者姓名">
          <el-input :model-value="bindTarget?.name" disabled />
        </el-form-item>
        <el-form-item label="选择家属" prop="family_user_id">
          <el-select
            v-model="bindForm.family_user_id"
            placeholder="请选择家属账号"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="f in familyUsers"
              :key="f.id"
              :label="`${f.real_name || f.username}  (${f.email || '无邮箱'})`"
              :value="f.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ f.real_name || f.username }}</span>
                <span style="font-size: 12px; color: #999">{{ f.email || "无邮箱" }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="!familyUsers.length" style="font-size: 12px; color: #999; margin-top: 4px">
            暂无家属账号，请在「权限与用户」中添加角色为"家属"的用户
          </div>
        </el-form-item>
        <el-form-item label="关系" prop="relation">
          <el-select v-model="bindForm.relation" placeholder="请选择关系" style="width: 100%">
            <el-option label="子女" value="子女" />
            <el-option label="儿媳" value="儿媳" />
            <el-option label="女婿" value="女婿" />
            <el-option label="配偶" value="配偶" />
            <el-option label="孙辈" value="孙辈" />
            <el-option label="兄弟姐妹" value="兄弟姐妹" />
            <el-option label="其他亲属" value="其他亲属" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDlg = false">取消</el-button>
        <el-button type="primary" :loading="binding" @click="confirmBind">
          确认绑定
        </el-button>
      </template>
    </el-dialog>

    <!-- 更换家属弹窗（先解绑再绑定新家属） -->
    <el-dialog
      v-model="changeDlg"
      :title="`更换家属 — ${changeTarget?.name}`"
      width="500px"
      destroy-on-close
    >
      <el-alert
        :title="`当前已绑定：${changeTarget?.binding?.real_name || changeTarget?.binding?.username}（${changeTarget?.binding?.relation || '家属'}），确认后旧绑定将自动解除`"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px; border-radius: 6px"
      />
      <el-form :model="bindForm" label-width="90px" :rules="bindRules" ref="changeFormRef">
        <el-form-item label="长者姓名">
          <el-input :model-value="changeTarget?.name" disabled />
        </el-form-item>
        <el-form-item label="新选择家属" prop="family_user_id">
          <el-select
            v-model="bindForm.family_user_id"
            placeholder="请选择新家属"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="f in familyUsers"
              :key="f.id"
              :label="`${f.real_name || f.username}  (${f.email || '无邮箱'})`"
              :value="f.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ f.real_name || f.username }}</span>
                <span style="font-size: 12px; color: #999">{{ f.email || "无邮箱" }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关系" prop="relation">
          <el-select v-model="bindForm.relation" placeholder="请选择关系" style="width: 100%">
            <el-option label="子女" value="子女" />
            <el-option label="儿媳" value="儿媳" />
            <el-option label="女婿" value="女婿" />
            <el-option label="配偶" value="配偶" />
            <el-option label="孙辈" value="孙辈" />
            <el-option label="兄弟姐妹" value="兄弟姐妹" />
            <el-option label="其他亲属" value="其他亲属" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeDlg = false">取消</el-button>
        <el-button type="warning" :loading="binding" @click="confirmChange">
          确认更换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, User, Phone, Message } from "@element-plus/icons-vue";
import {
  getElderList,
  getFamilyUsers,
  getElderBinding,
  bindElderToFamily,
  unbindElder,
} from "@/api/staffApi";

const loading = ref(false);
const elders = ref([]);
const familyUsers = ref([]);
const keyword = ref("");
const bindStatus = ref(null);

// 提示信息
const tipsMsg = ref("");
const tipsType = ref("success");

// 绑定弹窗
const bindDlg = ref(false);
const changeDlg = ref(false);
const bindTarget = ref(null);
const changeTarget = ref(null);
const binding = ref(false);
const bindFormRef = ref(null);
const changeFormRef = ref(null);
const bindForm = reactive({
  family_user_id: null,
  relation: "子女",
});

const bindRules = {
  family_user_id: [{ required: true, message: "请选择家属", trigger: "change" }],
  relation: [{ required: true, message: "请选择关系", trigger: "change" }],
};

async function loadElders() {
  loading.value = true;
  try {
    const params = {};
    if (keyword.value) params.keyword = keyword.value;
    const res = await getElderList(params);
    const list = res?.list || res || [];

    // 并行查询每位长者的绑定状态
    const enriched = await Promise.all(
      list.map(async (elder) => {
        try {
          const binding = await getElderBinding(elder.id);
          return { ...elder, binding, binded: !!binding };
        } catch {
          return { ...elder, binding: null, binded: false };
        }
      })
    );

    if (bindStatus.value !== null) {
      elders.value = enriched.filter(
        (e) => (bindStatus.value === 1 && e.binded) || (bindStatus.value === 0 && !e.binded)
      );
    } else {
      elders.value = enriched;
    }
  } catch {
    elders.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadFamilyUsers() {
  try {
    const res = await getFamilyUsers();
    familyUsers.value = res?.list || res || [];
  } catch {
    familyUsers.value = [];
  }
}

function openBindDlg(row) {
  bindTarget.value = row;
  Object.assign(bindForm, { family_user_id: null, relation: "子女" });
  bindDlg.value = true;
}

function openChangeDlg(row) {
  changeTarget.value = row;
  Object.assign(bindForm, { family_user_id: null, relation: row.binding?.relation || "子女" });
  changeDlg.value = true;
}

async function confirmBind() {
  try {
    await bindFormRef.value.validate();
  } catch {
    return;
  }
  binding.value = true;
  try {
    await bindElderToFamily({
      elder_id: bindTarget.value.id,
      family_user_id: bindForm.family_user_id,
      relation: bindForm.relation,
    });
    ElMessage.success("绑定成功");
    bindDlg.value = false;
    loadElders();
  } catch (e) {
    ElMessage.error("绑定失败：" + (e?.message || "未知错误"));
  } finally {
    binding.value = false;
  }
}

async function confirmChange() {
  try {
    await changeFormRef.value.validate();
  } catch {
    return;
  }
  binding.value = true;
  try {
    // 先解绑旧的，再绑定新的
    if (changeTarget.value.binding) {
      await unbindElder(
        changeTarget.value.id,
        changeTarget.value.binding.user_id
      );
    }
    await bindElderToFamily({
      elder_id: changeTarget.value.id,
      family_user_id: bindForm.family_user_id,
      relation: bindForm.relation,
    });
    ElMessage.success("更换成功，旧绑定已解除");
    changeDlg.value = false;
    loadElders();
  } catch (e) {
    ElMessage.error("更换失败：" + (e?.message || "未知错误"));
  } finally {
    binding.value = false;
  }
}

async function confirmUnbind(row) {
  if (!row.binding) return;
  try {
    await ElMessageBox.confirm(
      `确定解除「${row.name}」与「${row.binding.real_name || row.binding.username}」的绑定关系吗？解除后该家属将无法查看该长者信息。`,
      "确认解除绑定",
      { confirmButtonText: "解除", cancelButtonText: "取消", type: "warning" }
    );
    await unbindElder(row.id, row.binding.user_id);
    ElMessage.success("已解除绑定");
    loadElders();
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("解除失败：" + (e?.message || "未知错误"));
    }
  }
}

onMounted(() => {
  loadElders();
  loadFamilyUsers();
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.mb-16 {
  margin-bottom: 16px;
}

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.family-info {
  line-height: 1.6;
}

.family-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--staff-text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.family-contact {
  font-size: 12px;
  color: var(--staff-muted);
  margin-top: 2px;
  display: flex;
  align-items: center;
}
</style>
