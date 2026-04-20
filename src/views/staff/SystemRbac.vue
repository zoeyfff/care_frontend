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
        <el-table :data="users" stripe border v-loading="loadingU">
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="real_name" label="姓名" width="100" />
          <el-table-column prop="phone" label="手机" width="130" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUsers, getRoles, getPermissions } from "@/api/staffApi";

const tab = ref("user");
const loadingU = ref(false);
const loadingR = ref(false);
const loadingP = ref(false);
const users = ref([]);
const roles = ref([]);
const perms = ref([]);

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
    users.value = u.list;
    roles.value = r.list;
    perms.value = p.list;
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
</style>
