<template>
  <div>
    <h1 class="staff-page-title">权限与用户（RBAC）</h1>
    <p class="sub">
      模型：User、Role、Permission，多对多通过
      user_role、role_permission。前端菜单与按钮可根据权限码动态渲染；此处为数据维护界面示意。
    </p>

    <el-alert
      title="与数据库表 user、role、permission、user_role、role_permission 对齐"
      type="success"
      :closable="false"
      show-icon
      class="mb"
    />

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="用户" name="user">
        <div class="staff-toolbar">
          <span class="toolbar-title">用户列表</span>
          <el-button type="primary" @click="openAddUserDlg">新增用户</el-button>
        </div>
        <el-table :data="users" stripe border v-loading="loadingU">
          <el-table-column prop="username" label="用户名" width="140" />
          <el-table-column prop="real_name" label="姓名" width="110" />
          <el-table-column prop="phone" label="手机" width="130" />
          <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? "正常" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="角色" min-width="160">
            <template #default="{ row }">
              <el-tag
                v-for="r in row.roles"
                :key="r"
                size="small"
                class="tag-gap"
                >{{ r }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="170" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="角色" name="role">
        <el-table :data="roles" stripe border v-loading="loadingR">
          <el-table-column prop="role_name" label="角色名称" width="140" />
          <el-table-column prop="role_code" label="角色编码" width="140" />
          <el-table-column prop="create_time" label="创建时间" width="170" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="权限" name="perm">
        <el-table :data="perms" stripe border v-loading="loadingP">
          <el-table-column
            prop="permission_name"
            label="权限名称"
            width="160"
          />
          <el-table-column prop="permission_code" label="权限码" width="140" />
          <el-table-column prop="path" label="前端路由/资源" min-width="200" />
          <el-table-column prop="create_time" label="创建时间" width="170" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="addUserDlg" title="新增用户" width="460px" destroy-on-close>
      <el-form :model="addForm" label-width="80px" :rules="addRules" ref="addFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="登录账号（唯一）" maxlength="50" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="初始登录密码" show-password maxlength="50" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="addForm.real_name" placeholder="真实姓名" maxlength="50" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="addForm.phone" placeholder="联系电话" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="家属邮箱（用于发送账单邮件通知）" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addUserDlg = false">取消</el-button>
        <el-button type="primary" :loading="addingUser" @click="confirmAddUser">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUsers, getRoles, getPermissions } from "@/api/staffApi";
import { saveUser } from "@/api/staffApi";

const tab = ref("user");
const loadingU = ref(false);
const loadingR = ref(false);
const loadingP = ref(false);
const users = ref([]);
const roles = ref([]);
const perms = ref([]);

const addUserDlg = ref(false);
const addingUser = ref(false);
const addFormRef = ref(null);
const addForm = ref({ username: "", password: "", real_name: "", phone: "", email: "" });
const addRules = {
  username: [{ required: true, message: "用户名必填", trigger: "blur" }],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 4, message: "密码至少4位", trigger: "blur" },
  ],
};

function openAddUserDlg() {
  addForm.value = { username: "", password: "", real_name: "", phone: "", email: "" };
  addUserDlg.value = true;
}

async function confirmAddUser() {
  try {
    await addFormRef.value.validate();
  } catch {
    return;
  }
  addingUser.value = true;
  try {
    await saveUser({
      username: addForm.value.username,
      password: addForm.value.password,
      real_name: addForm.value.real_name,
      phone: addForm.value.phone,
      email: addForm.value.email,
    });
    ElMessage.success("用户添加成功");
    addUserDlg.value = false;
    loadUsers();
  } catch (e) {
    ElMessage.error("添加失败：" + (e?.message || "未知错误"));
  } finally {
    addingUser.value = false;
  }
}

async function loadUsers() {
  loadingU.value = true;
  try {
    const u = await getUsers();
    users.value = u?.list || [];
  } finally {
    loadingU.value = false;
  }
}

onMounted(async () => {
  loadingU.value = true;
  loadingR.value = true;
  loadingP.value = true;
  try {
    const [u, r, p] = await Promise.all([
      getUsers(),
      getRoles(),
      getPermissions(),
    ]);
    users.value = u?.list || [];
    roles.value = r?.list || [];
    perms.value = p?.list || [];
  } finally {
    loadingU.value = false;
    loadingR.value = false;
    loadingP.value = false;
  }
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.mb {
  margin-bottom: 16px;
}

.tabs-wrap {
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
}

.tag-gap {
  margin-right: 6px;
}

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.toolbar-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
  margin-right: auto;
}
</style>
