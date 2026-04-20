# 养老院工作人员端 · 后端 API 对接说明

本文档与前端工程 `src/api/staffApi.js`、`src/utils/request.js` 及 Mock 数据结构对齐，供 Spring Boot 实现 REST 接口时参照。字段名采用 **snake_case**（与当前前端 Mock、SQL 表字段一致），可减少联调改动。

---

## 1. 全局约定

### 1.1 服务前缀与代理

| 项目 | 说明 |
|------|------|
| 前端 `baseURL` | 环境变量 `VUE_APP_API_BASE`，开发环境默认为 `/api` |
| Vue CLI 代理 | `vue.config.js` 将 `/api` 转发至 `http://localhost:8080`（可按实际后端端口修改） |
| 建议后端上下文 | 若后端带 `context-path`（如 `/api`），需与代理目标组合后路径一致；或后端根路径为 `/`，由网关统一加 `/api` |

下文路径均指 **去掉 baseURL 后的相对路径**（即 axios 请求的 path），例如 `GET /elders` 实际请求 `http://host:port/api/elders`（取决于你如何配置）。

### 1.2 认证

| 项 | 说明 |
|----|------|
| Header | `Authorization: Bearer <access_token>` |
| Token 来源 | 登录接口返回；前端存 `localStorage.staff_token` |
| 未登录 | 返回 HTTP `401`，`code` 非 0；前端会跳转登录（需实现登录页对接后） |

除登录、验证码等公开接口外，建议其余接口均校验 Token。

### 1.3 统一响应体（必须）

前端响应拦截器（`request.js`）逻辑：

- 响应体为 JSON，且存在 **`code` 为数字** 时：若 `code !== 0`，视为业务失败，`ElMessage` 展示 `message`，并 `reject`。
- 成功时：`staffApi.js` 中使用 `const { data } = await request.xxx()`，即从响应根对象上解构 **`data` 字段**。  
  因此后端**必须**采用外层包装，且业务数据放在 **`data`** 里。

**成功示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

**业务失败示例：**

```json
{
  "code": 40001,
  "message": "身份证号已存在",
  "data": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | `0` 表示成功；非 0 为失败 |
| `message` | string | 提示文案 |
| `data` | object / array / null | 业务载荷；列表类接口见下文 |

**HTTP 状态码建议：**

| HTTP | 场景 |
|------|------|
| 200 | 请求被正常处理（含业务失败时也可返回 200 + `code != 0`，二选一团队内统一即可） |
| 401 | 未认证或 Token 失效 |
| 403 | 无权限（RBAC） |
| 404 | 资源不存在 |
| 500 | 服务器异常 |

若采用「业务失败也返回 HTTP 200 + `code`」的方式，前端当前拦截器同样适用。

### 1.4 时间与数字格式

| 类型 | 建议格式 | 说明 |
|------|----------|------|
| 日期时间 | `yyyy-MM-dd HH:mm:ss` | 字符串，时区建议明确为服务器时区或统一 UTC+8 |
| 仅日期 | `yyyy-MM-dd` | 如 `checkin_date`、`start_date` |
| 金额 | number | JSON 中为数字，如 `6850.00`；数据库 `DECIMAL` 序列化避免精度丢失 |
| 体温等 | number | 如 `36.5` |

### 1.5 列表与分页（建议扩展）

当前 Mock 返回 `{ list, total }` **无分页参数**。后端建议统一支持：

**请求 Query（可选，兼容旧前端）：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | int | 从 1 开始，默认 1 |
| `size` | int | 每页条数，默认 10 或 20 |
| `keyword` | string | 各模块自定义（如长者姓名/房间/身份证） |

**响应 `data` 推荐结构：**

```json
{
  "list": [ ],
  "total": 100,
  "page": 1,
  "size": 20
}
```

若暂不分页，可只返回 `list` + `total`，与现前端一致。

### 1.6 扩展字段与联表展示

前端表格中常出现 **`elder_name`**、**`uploader_name`**、**`family_name`** 等，数据库可能仅存 ID。建议：

- 列表接口由后端 **JOIN 或二次组装** 返回展示字段；或  
- 返回 ID，前端再批量查（不推荐，请求次数多）。

---

## 2. 数据模型与数据库对照

以下为 JSON 字段与已有 SQL 表对应关系；**加粗**为表外扩展（需加列或关联表）。

### 2.0 `room` 房间资源（新增）

当前数据库尚未包含房间资源表，但前端已新增「房间资源管理」模块。建议新增表 `room`（或 `room_info`）作为床位/房态基础数据。

**建议建表（MySQL 示例）：**

```sql
CREATE TABLE room (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  building VARCHAR(20) NOT NULL COMMENT '楼栋/区域，如 A/B/C',
  floor INT NOT NULL COMMENT '楼层',
  room_no VARCHAR(20) NOT NULL UNIQUE COMMENT '房间号，如 A-201',
  room_type VARCHAR(50) COMMENT '房型：单人间/双人间/四人间等',
  bed_total INT DEFAULT 0 COMMENT '总床位数',
  bed_occupied INT DEFAULT 0 COMMENT '已占用床位数(可由 checkin 推导，也可缓存)',
  status TINYINT DEFAULT 1 COMMENT '1可用 0维修/停用',
  remark VARCHAR(255),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Room JSON：**

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `room.id` |
| `building` | `room.building` |
| `floor` | `room.floor` |
| `room_no` | `room.room_no` |
| `room_type` | `room.room_type` |
| `bed_total` | `room.bed_total` |
| `bed_occupied` | `room.bed_occupied` |
| `status` | `room.status`（1 可用，0 维修/停用） |
| `remark` | `room.remark` |
| `create_time` | `room.create_time` |

### 2.1 `elder` 长者

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `elder.id` |
| `name` | `elder.name` |
| `gender` | `elder.gender` |
| `id_card` | `elder.id_card` |
| `phone` | `elder.phone` |
| `family_contact` | `elder.family_contact` |
| `health_info` | `elder.health_info` |
| `care_level` | `elder.care_level` |
| `room_no` | `elder.room_no` |
| `bed_no` | `elder.bed_no` |
| `checkin_date` | `elder.checkin_date` |
| `create_time` | `elder.create_time` |
| **`care_plan`** | **建议新增列 `care_plan` TEXT，或独立 `elder_care_plan` 表**（前端表单已预留） |

### 2.2 `care_task` 护理任务

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `care_task.id` |
| `elder_id` | `care_task.elder_id` |
| `task_name` | `care_task.task_name` |
| `status` | `care_task.status`（0 未完成，1 已完成） |
| `execute_time` | `care_task.execute_time` |
| `remark` | `care_task.remark` |
| `create_time` | `care_task.create_time` |
| **`elder_name`** | **联表 `elder.name`** |

### 2.3 `health_record` 体征

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `health_record.id` |
| `elder_id` | `health_record.elder_id` |
| `temperature` | `health_record.temperature` |
| `blood_pressure` | `health_record.blood_pressure` |
| `heart_rate` | `health_record.heart_rate` |
| `record_time` | `health_record.record_time` |
| `create_time` | `health_record.create_time` |
| **`elder_name`** | **联表** |

### 2.4 `medication_record` 用药

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `medication_record.id` |
| `elder_id` | `medication_record.elder_id` |
| `medicine_name` | `medication_record.medicine_name` |
| `dosage` | `medication_record.dosage` |
| `take_time` | `medication_record.take_time` |
| `remark` | `medication_record.remark` |
| `create_time` | `medication_record.create_time` |
| **`elder_name`** | **联表** |

### 2.5 `checkin` 入住

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `checkin.id` |
| `elder_id` | `checkin.elder_id` |
| `start_date` | `checkin.start_date` |
| `end_date` | `checkin.end_date`（在住可为 `null`） |
| `status` | `checkin.status`（1 在住，0 已离院） |
| `create_time` | `checkin.create_time` |
| **`elder_name`** | **联表** |

### 2.6 `bill` + `bill_item` 账单

列表/详情 `data` 中单条账单结构：

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `bill.id` |
| `elder_id` | `bill.elder_id` |
| `total_amount` | `bill.total_amount` |
| `status` | `bill.status`（0 未支付，1 已支付） |
| `create_time` | `bill.create_time` |
| **`elder_name`** | **联表** |
| **`items`** | **子数组，来自 `bill_item`**：每项含 `item_name`、`amount`；若需明细 id 可增加 `id`（`bill_item.id`） |

`bill_item` 单行：

| JSON | SQL |
|------|-----|
| `id`（可选） | `bill_item.id` |
| `item_name` | `bill_item.item_name` |
| `amount` | `bill_item.amount` |

### 2.7 `feedback` 家属反馈

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `feedback.id` |
| `user_id` | `feedback.user_id`（家属用户） |
| `content` | `feedback.content` |
| `reply` | `feedback.reply` |
| `status` | `feedback.status`（0 未处理，1 已处理） |
| `create_time` | `feedback.create_time` |
| **`family_name`** | **联表 `user.real_name` 或家属档案表** |

### 2.8 `notice` 公告

| JSON 字段 | SQL |
|-----------|-----|
| `id` | `notice.id` |
| `title` | `notice.title` |
| `content` | `notice.content` |
| `type` | `notice.type` |
| `create_time` | `notice.create_time` |

### 2.9 `activity` 活动

| JSON 字段 | SQL |
|-----------|-----|
| `id` | `activity.id` |
| `title` | `activity.title` |
| `content` | `activity.content` |
| `start_time` | `activity.start_time` |
| `end_time` | `activity.end_time` |
| `create_time` | `activity.create_time` |

### 2.10 `file_info` 文件

| JSON 字段 | SQL / 说明 |
|-----------|------------|
| `id` | `file_info.id` |
| `file_name` | `file_info.file_name` |
| `file_url` | `file_info.file_url`（下载地址或对象存储 key） |
| `file_size` | `file_info.file_size`（字节） |
| `upload_user` | `file_info.upload_user` |
| `create_time` | `file_info.create_time` |
| **`uploader_name`** | **联表 `user.real_name`** |

### 2.11 RBAC：`user` / `role` / `permission`

**用户列表展示（扩展）：**

| JSON | 说明 |
|------|------|
| `id` | `user.id` |
| `username` | `user.username` |
| `real_name` | `user.real_name` |
| `phone` | `user.phone` |
| `status` | `user.status`（1 正常，0 禁用） |
| `create_time` | `user.create_time` |
| **`roles`** | **字符串数组，如 `["护理主管","护理员"]`，来自 `user_role` + `role`** |

**角色：**

| JSON | SQL |
|------|-----|
| `id` | `role.id` |
| `role_name` | `role.role_name` |
| `role_code` | `role.role_code` |
| `create_time` | `role.create_time` |

**权限：**

| JSON | SQL |
|------|-----|
| `id` | `permission.id` |
| `permission_name` | `permission.permission_name` |
| `permission_code` | `permission.permission_code` |
| `path` | `permission.path` |
| `create_time` | `permission.create_time` |

---

## 3. 已实现前端调用的接口（与 `staffApi.js` 一致）

以下路径为 **axios 的 path**（不含域名与可选的 `/api` 前缀，取决于你的 `baseURL` 配置）。

### 3.1 工作台统计

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/staff/dashboard/stats` |
| Query | 无 |

**响应 `data` 类型：**

```typescript
{
  elderTotal: number;           // 在院长者人数
  genderDist: Array<{           // 新增：男女比例（饼图）
    name: string;               // 男/女
    value: number;              // 人数
  }>;
  ageDist: Array<{              // 新增：年龄层分布（柱状图）
    name: string;               // <60 / 60-69 / 70-79 / 80-89 / 90+ / 未知
    value: number;              // 人数
  }>;
  careLevelDist: Array<{        // 护理等级分布（饼图）
    name: string;               // 如 "一级护理"
    value: number;              // 人数
  }>;
  bedTotal: number;             // 新增：床位总数（来自 room.bed_total 汇总，或其他口径）
  bedOccupied: number;          // 新增：床位已占用（来自 room.bed_occupied 汇总，或由 checkin 推导）
  bedRate: number;              // 床位入住率，如 92.5 表示 92.5%
  roomAvailable: number;        // 新增：可用且有空床的房间数
  unpaidBills: number;          // 未结清账单户数或笔数（与产品定义一致即可）
  taskPending: number;          // 待完成护理任务数
  trendLabels: string[];        // 横轴，如 ["1月","2月",...]
  trendInpatient: number[];     // 住院人数趋势（与 labels 对齐）
}
```

---

### 3.2 长者 `elder`

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/elders` |
| Query | `keyword`（可选）：匹配姓名、房间号、身份证号（后端实现模糊规则） |

**响应 `data`：**

```json
{
  "list": [ /* Elder 对象数组 */ ],
  "total": 3
}
```

#### 新增

| 项 | 值 |
|----|-----|
| 方法 | `POST` |
| 路径 | `/elders` |
| Body | Elder 对象，**无 `id`** 或 `id` 为空；可含 `care_plan` |

**响应 `data`：** 持久化后的完整 Elder（含 `id`、`create_time` 等）。

#### 更新

| 项 | 值 |
|----|-----|
| 方法 | `PUT` |
| 路径 | `/elders/{id}` |
| Body | 完整或部分字段（团队约定：建议全量 PUT 或 PATCH 二选一） |

**响应 `data`：** 更新后的 Elder。

#### 删除

| 项 | 值 |
|----|-----|
| 方法 | `DELETE` |
| 路径 | `/elders/{id}` |

**响应 `data`：** 可为 `null` 或 `{ "ok": true }`（前端当前只判断请求成功）。

---

### 3.3 护理任务 `care_task`

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/care-tasks` |
| Query | `status`（可选）：`0` | `1`，与库中 TINYINT 一致 |

**响应 `data`：**

```json
{
  "list": [ /* 含 elder_id, elder_name, task_name, status, execute_time, remark, create_time */ ],
  "total": 10
}
```

#### 新增 / 更新

| 项 | 值 |
|----|-----|
| 新增 | `POST /care-tasks` |
| 更新 | `PUT /care-tasks/{id}` |

**Body 字段：** `elder_id`（必填）、`task_name`（必填）、`execute_time`、`remark`、`status`；`elder_name` 可由后端忽略并根据 `elder_id` 填充。

**响应 `data`：** 保存后的完整任务对象。

---

### 3.4 体征 `health_record`

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/health-records` |
| Query | 建议扩展：`elder_id`、`startTime`、`endTime`（前端当前未传） |

**响应 `data`：** `{ "list": [], "total": n }`

#### 新增

| 项 | 值 |
|----|-----|
| 方法 | `POST` |
| 路径 | `/health-records` |

**Body 示例：**

```json
{
  "elder_id": 1,
  "temperature": 36.5,
  "blood_pressure": "128/82",
  "heart_rate": 72,
  "record_time": "2026-04-11 07:00:00"
}
```

**响应 `data`：** 含 `id`、`create_time`、**`elder_name`**（建议后端填充）。

---

### 3.5 用药 `medication_record`

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/medication-records` |

**响应 `data`：** `{ "list": [], "total": n }`

#### 新增

| 项 | 值 |
|----|-----|
| 方法 | `POST` |
| 路径 | `/medication-records` |

**Body 示例：**

```json
{
  "elder_id": 1,
  "medicine_name": "苯磺酸氨氯地平片",
  "dosage": "5mg 每日一次",
  "take_time": "2026-04-11 08:00:00",
  "remark": "餐后"
}
```

**响应 `data`：** 含 `id`、`create_time`、`elder_name`。

---

### 3.6 入住 `checkin`

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/checkins` |

**响应 `data`：** `{ "list": [], "total": n }`  
列表项含 `elder_name`、`end_date` 可空。

> 前端当前仅有查询。新增续约/退住等见 **第 4 节建议接口**。

---

### 3.7 账单 `bill`

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/bills` |

**响应 `data`：** `{ "list": [], "total": n }`  
每条含 `items` 数组（来自 `bill_item`）。

> 明细抽屉仅用列表数据；若数据量大可提供 `GET /bills/{id}` 返回单条含明细。

---

### 3.8 家属反馈 `feedback`

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/feedbacks` |

**响应 `data`：** `{ "list": [], "total": n }`  
项含 `family_name`（或前端用 `user_id` 兜底展示）。

#### 回复（院方）

| 项 | 值 |
|----|-----|
| 方法 | `PATCH` |
| 路径 | `/feedbacks/{id}/reply` |
| Body | `{ "reply": "回复内容" }` |

**响应 `data`：** 至少包含更新后的 `id`、`reply`、`status`（建议自动置 `1` 已处理）。

---

### 3.9 公告 `notice`

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/notices` |

**响应 `data`：** `{ "list": [], "total": n }`

---

### 3.10 活动 `activity`

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/activities` |

**响应 `data`：** `{ "list": [], "total": n }`

---

### 3.11 文件 `file_info`

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/files` |

**响应 `data`：** `{ "list": [], "total": n }`  
项含 `uploader_name` 为佳。

---

### 3.12 RBAC 查询

| 模块 | 方法 | 路径 | `data` |
|------|------|------|--------|
| 用户列表 | GET | `/users` | `{ list, total }`，用户含 `roles[]` |
| 角色列表 | GET | `/roles` | `{ list, total }` |
| 权限列表 | GET | `/permissions` | `{ list, total }` |

> 管理端增删改用户/角色/授权接口见第 4 节。

---

### 3.13 房间资源 `room`（新增）

对应前端页面「房间资源管理」，用于维护床位基础数据并支撑床位统计。

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/rooms` |
| Query | `keyword`（可选：匹配 room_no/building）、`status`（可选：0/1）、分页参数 `page/size`（可选） |

**响应 `data`：**

```json
{
  "list": [
    {
      "id": 1,
      "building": "A",
      "floor": 2,
      "room_no": "A-201",
      "room_type": "双人间",
      "bed_total": 2,
      "bed_occupied": 2,
      "status": 1,
      "remark": "",
      "create_time": "2024-01-01 10:00:00"
    }
  ],
  "total": 1
}
```

#### 新增

| 项 | 值 |
|----|-----|
| 方法 | `POST` |
| 路径 | `/rooms` |

**Body：** Room 对象（不含 `id`）。`bed_occupied` 建议由后端校验：\(0 \\le bed\\_occupied \\le bed\\_total\)。

#### 更新

| 项 | 值 |
|----|-----|
| 方法 | `PUT` |
| 路径 | `/rooms/{id}` |

#### 删除

| 项 | 值 |
|----|-----|
| 方法 | `DELETE` |
| 路径 | `/rooms/{id}` |

> 若房间已被入住记录引用，建议返回业务错误码（如 40901），避免硬删除；或改为逻辑删除/停用 `status=0`。

---

## 3.14 护理人员端（新增模块，登录共用）

护理端与工作人员端 **共用登录**、共用 Token。区别在于菜单与业务接口更聚焦一线护理工作。建议后端按 RBAC（角色/权限码）控制能否访问 `/nurse/*` 路径。

### 3.14.1 护理端工作台统计

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/nurse/dashboard/stats` |
| Query | 可选：`date`（默认当天），用于按日期统计 |

**响应 `data`：**

```json
{
  "taskTodo": 12,
  "medDue": 5,
  "vitalAbnormal": 2,
  "handoverUnread": 1
}
```

### 3.14.2 我的任务（护理任务视图）

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/nurse/tasks` |
| Query | `status`（可选 0/1），建议扩展 `nurse_id`（默认当前用户）、`room_no`、分页参数 |

**响应 `data`：** 与 `care_task` 列表一致，建议返回 `elder_name`。

> 当前前端完成任务仍复用 `PUT /care-tasks/{id}`。你也可以提供护理端专用接口 `PATCH /nurse/tasks/{id}/done`（见建议接口）。

### 3.14.3 用药执行（建议：执行态）

> 现数据库 `medication_record` 仅记录“用药计划/记录”，缺少执行状态。护理端需要“执行”闭环，建议两种实现：
>
> - 方案 A：在 `medication_record` 增加字段 `status/execute_user/execute_time`（前端已按此扩展字段展示）
> - 方案 B：新增 `medication_execute` 表（计划表 + 执行表分离，更规范）

#### 列表

| 项 | 值 |
|----|-----|
| 方法 | `GET` |
| 路径 | `/nurse/medications` |
| Query | `status`（可选 0/1），建议扩展 `nurse_id`、时间范围 |

**响应 `data`（单条示例）：**

```json
{
  "id": 2,
  "elder_id": 2,
  "elder_name": "李建国",
  "medicine_name": "二甲双胍",
  "dosage": "0.5g 每日两次",
  "take_time": "2026-04-11 08:00:00",
  "remark": "",
  "status": 0,
  "execute_user": null,
  "execute_user_name": "",
  "execute_time": null,
  "create_time": "2026-04-11 08:01:00"
}
```

#### 标记已执行

| 项 | 值 |
|----|-----|
| 方法 | `PATCH` |
| 路径 | `/nurse/medications/{id}/done` |

**响应 `data`：** 可返回更新后的记录或 `{ ok: true }`。

### 3.14.4 交接班（新增建议表）

建议新增表 `handover`（或 `nurse_handover`）：

```sql
CREATE TABLE handover (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shift_date DATE NOT NULL,
  shift VARCHAR(20) NOT NULL COMMENT '早班/中班/晚班',
  from_id BIGINT,
  to_id BIGINT,
  content TEXT,
  read_status TINYINT DEFAULT 0 COMMENT '0未读 1已读',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 列表

| 方法 | 路径 |
|------|------|
| GET | `/nurse/handovers` |

**响应 `data`：** `{ list, total }`，列表项建议带 `from_name/to_name`（联表 user）。

#### 新增 / 更新 / 删除

| 方法 | 路径 |
|------|------|
| POST | `/nurse/handovers` |
| PUT | `/nurse/handovers/{id}` |
| DELETE | `/nurse/handovers/{id}` |

### 3.14.5 事件上报（新增建议表）

建议新增表 `incident`（或 `nurse_incident`）：

```sql
CREATE TABLE incident (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  elder_id BIGINT,
  type VARCHAR(50),
  level VARCHAR(20) COMMENT '提示/一般/严重',
  event_time DATETIME,
  content TEXT,
  status TINYINT DEFAULT 0 COMMENT '0待处理 1已处理',
  reporter_id BIGINT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 列表

| 方法 | 路径 |
|------|------|
| GET | `/nurse/incidents` |

#### 新增

| 方法 | 路径 |
|------|------|
| POST | `/nurse/incidents` |

#### 标记已处理

| 方法 | 路径 |
|------|------|
| PATCH | `/nurse/incidents/{id}/done` |

#### 删除

| 方法 | 路径 |
|------|------|
| DELETE | `/nurse/incidents/{id}` |

## 4. 建议补充的接口（页面已预留能力，前端尚未绑定）

实现后可逐步在 `staffApi.js` 中关闭 Mock 并增加方法。

### 4.1 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | Body: `{ "username", "password" }`；返回 `data: { token, user: { id, username, real_name, ... } }` |
| POST | `/auth/logout` | 可选 |
| GET | `/auth/me` | 可选，返回当前用户及权限码列表，供动态菜单 |

### 4.2 公告 / 活动 写操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/notices` | 发布公告 |
| PUT | `/notices/{id}` | 更新 |
| DELETE | `/notices/{id}` | 删除 |
| POST | `/activities` | 新建活动 |
| PUT / DELETE | `/activities/{id}` | 同上 |

### 4.3 入住写操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/checkins` | 新签入住 |
| PUT | `/checkins/{id}` | 续约、退住（更新 `end_date`、`status`） |

### 4.4 账单写操作与支付

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/bills/generate` | 按月生成账单（Body：`yearMonth`、`elderId` 可选） |
| PATCH | `/bills/{id}/pay` | 标记已支付；或对接支付回调 |
| GET | `/bills/{id}` | 单条含 `items` |

### 4.5 文件上传 / 下载

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/files/upload` | `multipart/form-data`；返回 `file_info` 或 `file_url` |
| GET | `/files/{id}/download` | 鉴权后流式下载或 302 到 OSS 签名 URL |

大文件：可增加分片上传、合并、秒传（hash）等接口，与前端「文件中心」说明一致。

### 4.6 Excel

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/elders/import` | `multipart` 上传 xlsx；返回 `{ successCount, errors: [{ row, message }] }` |
| GET | `/elders/export` | 流式导出；Query 支持筛选条件 |

账单、统计类导出同理。

### 4.7 RBAC 维护

| 方法 | 路径 | 说明 |
|------|------|------|
| POST/PUT/DELETE | `/users` 等 | 用户 CRUD；密码单独 `PUT /users/{id}/password` |
| POST/PUT/DELETE | `/roles` | 角色 CRUD |
| POST/PUT/DELETE | `/permissions` | 权限 CRUD（或由迁移脚本初始化） |
| PUT | `/users/{id}/roles` | Body: `{ "role_ids": [1,2] }` |
| PUT | `/roles/{id}/permissions` | Body: `{ "permission_ids": [1,2,3] }` |

---

## 5. 前端联调步骤

1. 后端实现统一响应包装 `{ code, message, data }`，`code === 0` 表示成功。  
2. 将 `staffApi.js` 中 `USE_MOCK` 设为 `false`。  
3. 保证路径与本文档一致，或批量改 `staffApi.js` 中的 path 与后端对齐。  
4. 登录成功后颁发 JWT，前端已在请求头携带 `Bearer`。  
5. CORS：开发环境可用代理；生产环境配置网关或 Spring CORS。

---

## 6. 错误码示例（可选规范）

| code | 含义 |
|------|------|
| 0 | 成功 |
| 40001 | 参数校验失败 |
| 40101 | 未登录 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 40901 | 冲突（如重复身份证） |
| 50000 | 系统异常 |

---

## 7. 文档版本

| 版本 | 说明 |
|------|------|
| 1.0 | 与 `care_front` 工作人员端 Mock、`staffApi.js`（`USE_MOCK`）对齐整理 |

如需与 **家属端** 或 **管理端** 共用部分接口，建议通过 `type` 查询参数或路径前缀区分（如 `/family/...`），并在权限表中体现 `permission_code`。
