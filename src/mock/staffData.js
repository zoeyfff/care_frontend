/** 与库表字段对齐的演示数据，对接后端后可删除或仅用于开发 */

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    real_name: "系统管理员",
    phone: "13800000001",
    status: 1,
    create_time: "2024-01-01 10:00:00",
    roles: ["管理员"],
  },
  {
    id: 2,
    username: "nurse_zhang",
    real_name: "张护理",
    phone: "13800000002",
    status: 1,
    create_time: "2024-03-15 09:00:00",
    roles: ["护理主管", "护理员"],
  },
  {
    id: 3,
    username: "nurse_li",
    real_name: "李护士",
    phone: "13800000003",
    status: 1,
    create_time: "2024-05-20 09:00:00",
    roles: ["护理员"],
  },
  {
    id: 4,
    username: "doctor_wang",
    real_name: "王医生",
    phone: "13800000004",
    status: 1,
    create_time: "2024-06-10 09:00:00",
    roles: ["医护人员"],
  },
];

export const mockRoles = [
  { id: 1, role_name: "管理员", role_code: "ADMIN", create_time: "2024-01-01" },
  {
    id: 2,
    role_name: "护理主管",
    role_code: "HEAD_NURSE",
    create_time: "2024-01-01",
  },
  { id: 3, role_name: "护理员", role_code: "NURSE", create_time: "2024-01-01" },
  {
    id: 4,
    role_name: "医护人员",
    role_code: "MEDICAL",
    create_time: "2024-01-01",
  },
];

export const mockPermissions = [
  {
    id: 1,
    permission_name: "长者查看",
    permission_code: "elder:view",
    path: "/staff/elders",
  },
  {
    id: 2,
    permission_name: "护理任务",
    permission_code: "care:task",
    path: "/staff/care-tasks",
  },
  {
    id: 3,
    permission_name: "账单管理",
    permission_code: "bill:manage",
    path: "/staff/checkin-bill",
  },
];

// ==================== 扩充长者数据 (从3人增加到15人) ====================
export const mockElders = [
  {
    id: 1,
    name: "王秀英",
    gender: "女",
    id_card: "110101194508120028",
    phone: "13900001111",
    family_contact: "王小明 13900002222",
    health_info: "高血压，需定时测压；行动略缓。",
    care_level: "二级护理",
    room_no: "A-201",
    bed_no: "1床",
    checkin_date: "2023-06-01",
    create_time: "2023-06-01 14:00:00",
  },
  {
    id: 2,
    name: "李建国",
    gender: "男",
    id_card: "110101195002030015",
    phone: "13900003333",
    family_contact: "李芳 13900004444",
    health_info: "糖尿病饮食控制；认知正常。",
    care_level: "一级护理",
    room_no: "B-105",
    bed_no: "2床",
    checkin_date: "2024-01-10",
    create_time: "2024-01-10 10:00:00",
  },
  {
    id: 3,
    name: "陈美玲",
    gender: "女",
    id_card: "310101194211200026",
    phone: "",
    family_contact: "陈强 13600005555",
    health_info: "术后康复，需协助行走。",
    care_level: "特级护理",
    room_no: "A-201",
    bed_no: "2床",
    checkin_date: "2024-11-01",
    create_time: "2024-11-01 09:00:00",
  },
  {
    id: 4,
    name: "张德福",
    gender: "男",
    id_card: "110101194803120036",
    phone: "13900006666",
    family_contact: "张明 13900007777",
    health_info: "冠心病史，需定期监测心电图。",
    care_level: "特级护理",
    room_no: "C-301",
    bed_no: "1床",
    checkin_date: "2024-02-15",
    create_time: "2024-02-15 11:00:00",
  },
  {
    id: 5,
    name: "刘桂兰",
    gender: "女",
    id_card: "110101195105200028",
    phone: "13900008888",
    family_contact: "刘强 13900009999",
    health_info: "阿尔茨海默症早期，需防走失。",
    care_level: "一级护理",
    room_no: "B-202",
    bed_no: "3床",
    checkin_date: "2024-03-20",
    create_time: "2024-03-20 09:30:00",
  },
  {
    id: 6,
    name: "赵德明",
    gender: "男",
    id_card: "110101194012100012",
    phone: "13900001112",
    family_contact: "赵丽 13900002223",
    health_info: "听力下降，需大声交流；生活自理。",
    care_level: "三级护理",
    room_no: "D-101",
    bed_no: "2床",
    checkin_date: "2024-04-05",
    create_time: "2024-04-05 14:00:00",
  },
  {
    id: 7,
    name: "孙玉珍",
    gender: "女",
    id_card: "110101195208150045",
    phone: "13900003334",
    family_contact: "孙浩 13900004445",
    health_info: "关节炎，需辅助行走；情绪稳定。",
    care_level: "二级护理",
    room_no: "A-103",
    bed_no: "1床",
    checkin_date: "2024-05-12",
    create_time: "2024-05-12 10:15:00",
  },
  {
    id: 8,
    name: "周永福",
    gender: "男",
    id_card: "110101194509080018",
    phone: "13900005556",
    family_contact: "周敏 13900006667",
    health_info: "慢性阻塞性肺病，需氧疗。",
    care_level: "一级护理",
    room_no: "C-205",
    bed_no: "2床",
    checkin_date: "2024-06-18",
    create_time: "2024-06-18 08:45:00",
  },
  {
    id: 9,
    name: "吴淑珍",
    gender: "女",
    id_card: "110101195310250029",
    phone: "13900007778",
    family_contact: "吴杰 13900008889",
    health_info: "骨质疏松，需防跌倒。",
    care_level: "二级护理",
    room_no: "B-308",
    bed_no: "1床",
    checkin_date: "2024-07-22",
    create_time: "2024-07-22 13:20:00",
  },
  {
    id: 10,
    name: "郑国华",
    gender: "男",
    id_card: "110101194612300017",
    phone: "13900009990",
    family_contact: "郑丽华 13900001113",
    health_info: "脑梗后遗症，右侧肢体活动不便。",
    care_level: "特级护理",
    room_no: "A-302",
    bed_no: "3床",
    checkin_date: "2024-08-30",
    create_time: "2024-08-30 15:00:00",
  },
  {
    id: 11,
    name: "沈桂英",
    gender: "女",
    id_card: "110101194403120042",
    phone: "",
    family_contact: "沈军 13900002224",
    health_info: "白内障术后，恢复良好。",
    care_level: "三级护理",
    room_no: "D-205",
    bed_no: "1床",
    checkin_date: "2024-09-14",
    create_time: "2024-09-14 10:30:00",
  },
  {
    id: 12,
    name: "韩德林",
    gender: "男",
    id_card: "110101194707150013",
    phone: "13900003335",
    family_contact: "韩雪 13900004446",
    health_info: "帕金森早期，需药物控制。",
    care_level: "一级护理",
    room_no: "C-102",
    bed_no: "2床",
    checkin_date: "2024-10-08",
    create_time: "2024-10-08 09:00:00",
  },
  {
    id: 13,
    name: "许秀兰",
    gender: "女",
    id_card: "110101195109200058",
    phone: "13900005557",
    family_contact: "许建国 13900006668",
    health_info: "糖尿病、高血压，需双重监控。",
    care_level: "二级护理",
    room_no: "B-107",
    bed_no: "3床",
    checkin_date: "2024-11-19",
    create_time: "2024-11-19 11:45:00",
  },
  {
    id: 14,
    name: "董建华",
    gender: "男",
    id_card: "110101194802280021",
    phone: "13900007779",
    family_contact: "董芳 13900008890",
    health_info: "轻度认知障碍，生活基本自理。",
    care_level: "三级护理",
    room_no: "A-108",
    bed_no: "1床",
    checkin_date: "2024-12-01",
    create_time: "2024-12-01 14:30:00",
  },
  {
    id: 15,
    name: "梁淑芳",
    gender: "女",
    id_card: "110101195304090036",
    phone: "13900009991",
    family_contact: "梁晨 13900001114",
    health_info: "骨折术后康复，需物理治疗。",
    care_level: "一级护理",
    room_no: "D-306",
    bed_no: "2床",
    checkin_date: "2025-01-05",
    create_time: "2025-01-05 10:00:00",
  },
];

// ==================== 扩充护理任务数据 ====================
export const mockCareTasks = [
  {
    id: 1,
    elder_id: 1,
    elder_name: "王秀英",
    task_name: "晨间起居协助 + 血压测量",
    status: 0,
    execute_time: "2026-04-11 08:00:00",
    remark: "",
    create_time: "2026-04-10 18:00:00",
  },
  {
    id: 2,
    elder_id: 2,
    elder_name: "李建国",
    task_name: "胰岛素注射提醒",
    status: 1,
    execute_time: "2026-04-11 07:30:00",
    remark: "已执行，血糖稳定",
    create_time: "2026-04-10 18:00:00",
  },
  {
    id: 3,
    elder_id: 3,
    elder_name: "陈美玲",
    task_name: "康复训练 30 分钟",
    status: 0,
    execute_time: "2026-04-11 15:00:00",
    remark: "",
    create_time: "2026-04-10 18:00:00",
  },
  {
    id: 4,
    elder_id: 4,
    elder_name: "张德福",
    task_name: "心电图监测",
    status: 0,
    execute_time: "2026-04-11 09:00:00",
    remark: "",
    create_time: "2026-04-10 19:00:00",
  },
  {
    id: 5,
    elder_id: 5,
    elder_name: "刘桂兰",
    task_name: "防走失定位检查",
    status: 1,
    execute_time: "2026-04-11 06:30:00",
    remark: "手环正常，位置无异常",
    create_time: "2026-04-10 20:00:00",
  },
  {
    id: 6,
    elder_id: 6,
    elder_name: "赵德明",
    task_name: "助听器检查与清洁",
    status: 0,
    execute_time: "2026-04-11 10:30:00",
    remark: "",
    create_time: "2026-04-11 08:00:00",
  },
  {
    id: 7,
    elder_id: 7,
    elder_name: "孙玉珍",
    task_name: "膝关节理疗",
    status: 0,
    execute_time: "2026-04-11 14:00:00",
    remark: "",
    create_time: "2026-04-11 08:30:00",
  },
  {
    id: 8,
    elder_id: 8,
    elder_name: "周永福",
    task_name: "氧疗设备检查",
    status: 1,
    execute_time: "2026-04-11 08:15:00",
    remark: "设备运行正常，血氧96%",
    create_time: "2026-04-10 21:00:00",
  },
  {
    id: 9,
    elder_id: 9,
    elder_name: "吴淑珍",
    task_name: "钙剂补充提醒",
    status: 0,
    execute_time: "2026-04-11 20:00:00",
    remark: "",
    create_time: "2026-04-11 09:00:00",
  },
  {
    id: 10,
    elder_id: 10,
    elder_name: "郑国华",
    task_name: "右侧肢体康复训练",
    status: 0,
    execute_time: "2026-04-11 16:00:00",
    remark: "",
    create_time: "2026-04-11 10:00:00",
  },
  {
    id: 11,
    elder_id: 11,
    elder_name: "沈桂英",
    task_name: "滴眼药水",
    status: 0,
    execute_time: "2026-04-11 09:30:00",
    remark: "",
    create_time: "2026-04-11 07:30:00",
  },
  {
    id: 12,
    elder_id: 12,
    elder_name: "韩德林",
    task_name: "帕金森用药提醒",
    status: 1,
    execute_time: "2026-04-11 07:45:00",
    remark: "已服药，状态稳定",
    create_time: "2026-04-10 22:00:00",
  },
];

// ==================== 扩充健康记录数据 ====================
export const mockHealthRecords = [
  {
    id: 1,
    elder_id: 1,
    elder_name: "王秀英",
    temperature: 36.5,
    blood_pressure: "128/82",
    heart_rate: 72,
    record_time: "2026-04-11 07:00:00",
    create_time: "2026-04-11 07:05:00",
  },
  {
    id: 2,
    elder_id: 2,
    elder_name: "李建国",
    temperature: 36.8,
    blood_pressure: "135/88",
    heart_rate: 78,
    record_time: "2026-04-11 07:10:00",
    create_time: "2026-04-11 07:12:00",
  },
  {
    id: 3,
    elder_id: 4,
    elder_name: "张德福",
    temperature: 36.3,
    blood_pressure: "118/75",
    heart_rate: 68,
    record_time: "2026-04-11 07:20:00",
    create_time: "2026-04-11 07:25:00",
  },
  {
    id: 4,
    elder_id: 5,
    elder_name: "刘桂兰",
    temperature: 36.6,
    blood_pressure: "130/85",
    heart_rate: 75,
    record_time: "2026-04-11 07:30:00",
    create_time: "2026-04-11 07:35:00",
  },
  {
    id: 5,
    elder_id: 8,
    elder_name: "周永福",
    temperature: 36.7,
    blood_pressure: "125/80",
    heart_rate: 82,
    record_time: "2026-04-11 07:40:00",
    create_time: "2026-04-11 07:45:00",
  },
  {
    id: 6,
    elder_id: 10,
    elder_name: "郑国华",
    temperature: 36.4,
    blood_pressure: "140/90",
    heart_rate: 76,
    record_time: "2026-04-11 07:50:00",
    create_time: "2026-04-11 07:55:00",
  },
];

// ==================== 扩充用药记录数据 ====================
export const mockMedicationRecords = [
  {
    id: 1,
    elder_id: 1,
    elder_name: "王秀英",
    medicine_name: "苯磺酸氨氯地平片",
    dosage: "5mg 每日一次",
    take_time: "2026-04-11 08:00:00",
    remark: "餐后",
    status: 1,
    execute_user: 2,
    execute_user_name: "张护理",
    execute_time: "2026-04-11 08:05:00",
    create_time: "2026-04-11 08:02:00",
  },
  {
    id: 2,
    elder_id: 2,
    elder_name: "李建国",
    medicine_name: "二甲双胍",
    dosage: "0.5g 每日两次",
    take_time: "2026-04-11 08:00:00",
    remark: "",
    status: 0,
    execute_user: null,
    execute_user_name: "",
    execute_time: null,
    create_time: "2026-04-11 08:01:00",
  },
  {
    id: 3,
    elder_id: 4,
    elder_name: "张德福",
    medicine_name: "阿司匹林",
    dosage: "100mg 每日一次",
    take_time: "2026-04-11 08:00:00",
    remark: "餐前",
    status: 0,
    execute_user: null,
    execute_user_name: "",
    execute_time: null,
    create_time: "2026-04-11 08:05:00",
  },
  {
    id: 4,
    elder_id: 5,
    elder_name: "刘桂兰",
    medicine_name: "多奈哌齐",
    dosage: "5mg 每日一次",
    take_time: "2026-04-11 08:00:00",
    remark: "",
    status: 1,
    execute_user: 3,
    execute_user_name: "李护士",
    execute_time: "2026-04-11 08:12:00",
    create_time: "2026-04-11 08:10:00",
  },
  {
    id: 5,
    elder_id: 8,
    elder_name: "周永福",
    medicine_name: "沙美特罗替卡松粉吸入剂",
    dosage: "每次1吸，每日两次",
    take_time: "2026-04-11 08:00:00",
    remark: "",
    create_time: "2026-04-11 08:15:00",
  },
  {
    id: 6,
    elder_id: 12,
    elder_name: "韩德林",
    medicine_name: "左旋多巴",
    dosage: "250mg 每日三次",
    take_time: "2026-04-11 08:00:00",
    remark: "餐前",
    create_time: "2026-04-11 08:20:00",
  },
];

// ==================== 护理端：交接班与事件上报(测试数据) ====================
export const mockHandovers = [
  {
    id: 1,
    shift_date: "2026-04-11",
    shift: "早班",
    from_id: 3,
    from_name: "李护士",
    to_id: 2,
    to_name: "张护理",
    content:
      "A-201 2床术后康复需重点协助行走；B-202 3床夜间血压偏高已提醒复测；特护床位翻身拍背按 2 小时执行。",
    create_time: "2026-04-11 07:20:00",
    read_status: 0,
  },
  {
    id: 2,
    shift_date: "2026-04-10",
    shift: "晚班",
    from_id: 2,
    from_name: "张护理",
    to_id: 3,
    to_name: "李护士",
    content: "C-301 1床晨起测温偏高（37.4），建议早班复测并关注。",
    create_time: "2026-04-10 21:10:00",
    read_status: 1,
  },
];

export const mockIncidents = [
  {
    id: 1,
    elder_id: 5,
    elder_name: "刘桂兰",
    type: "走失风险",
    level: "一般",
    event_time: "2026-04-11 10:15:00",
    content: "在楼道徘徊欲外出，已陪同返回并通知家属；建议加强巡查。",
    status: 0,
    reporter_id: 2,
    reporter_name: "张护理",
    create_time: "2026-04-11 10:20:00",
  },
  {
    id: 2,
    elder_id: 4,
    elder_name: "张德福",
    type: "突发不适",
    level: "严重",
    event_time: "2026-04-10 16:30:00",
    content: "出现胸闷不适，已测血压心率并通知医生评估，家属同步告知。",
    status: 1,
    reporter_id: 3,
    reporter_name: "李护士",
    create_time: "2026-04-10 16:45:00",
  },
];

// ==================== 扩充入住记录数据 ====================
export const mockCheckins = [
  {
    id: 1,
    elder_id: 1,
    elder_name: "王秀英",
    start_date: "2023-06-01",
    end_date: null,
    status: 1,
    create_time: "2023-06-01 14:00:00",
  },
  {
    id: 2,
    elder_id: 2,
    elder_name: "李建国",
    start_date: "2024-01-10",
    end_date: null,
    status: 1,
    create_time: "2024-01-10 10:00:00",
  },
  {
    id: 3,
    elder_id: 3,
    elder_name: "陈美玲",
    start_date: "2024-11-01",
    end_date: null,
    status: 1,
    create_time: "2024-11-01 09:00:00",
  },
  {
    id: 4,
    elder_id: 4,
    elder_name: "张德福",
    start_date: "2024-02-15",
    end_date: null,
    status: 1,
    create_time: "2024-02-15 11:00:00",
  },
  {
    id: 5,
    elder_id: 5,
    elder_name: "刘桂兰",
    start_date: "2024-03-20",
    end_date: null,
    status: 1,
    create_time: "2024-03-20 09:30:00",
  },
  {
    id: 6,
    elder_id: 6,
    elder_name: "赵德明",
    start_date: "2024-04-05",
    end_date: null,
    status: 1,
    create_time: "2024-04-05 14:00:00",
  },
  {
    id: 7,
    elder_id: 7,
    elder_name: "孙玉珍",
    start_date: "2024-05-12",
    end_date: null,
    status: 1,
    create_time: "2024-05-12 10:15:00",
  },
  {
    id: 8,
    elder_id: 8,
    elder_name: "周永福",
    start_date: "2024-06-18",
    end_date: null,
    status: 1,
    create_time: "2024-06-18 08:45:00",
  },
  {
    id: 9,
    elder_id: 9,
    elder_name: "吴淑珍",
    start_date: "2024-07-22",
    end_date: null,
    status: 1,
    create_time: "2024-07-22 13:20:00",
  },
  {
    id: 10,
    elder_id: 10,
    elder_name: "郑国华",
    start_date: "2024-08-30",
    end_date: null,
    status: 1,
    create_time: "2024-08-30 15:00:00",
  },
  {
    id: 11,
    elder_id: 11,
    elder_name: "沈桂英",
    start_date: "2024-09-14",
    end_date: null,
    status: 1,
    create_time: "2024-09-14 10:30:00",
  },
  {
    id: 12,
    elder_id: 12,
    elder_name: "韩德林",
    start_date: "2024-10-08",
    end_date: null,
    status: 1,
    create_time: "2024-10-08 09:00:00",
  },
  {
    id: 13,
    elder_id: 13,
    elder_name: "许秀兰",
    start_date: "2024-11-19",
    end_date: null,
    status: 1,
    create_time: "2024-11-19 11:45:00",
  },
  {
    id: 14,
    elder_id: 14,
    elder_name: "董建华",
    start_date: "2024-12-01",
    end_date: null,
    status: 1,
    create_time: "2024-12-01 14:30:00",
  },
  {
    id: 15,
    elder_id: 15,
    elder_name: "梁淑芳",
    start_date: "2025-01-05",
    end_date: null,
    status: 1,
    create_time: "2025-01-05 10:00:00",
  },
];

// ==================== 扩充账单数据 ====================
export const mockBills = [
  {
    id: 1,
    elder_id: 1,
    elder_name: "王秀英",
    total_amount: 6850.0,
    status: 1,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 2800 },
      { item_name: "护理费", amount: 3200 },
      { item_name: "餐饮费", amount: 850 },
    ],
  },
  {
    id: 2,
    elder_id: 2,
    elder_name: "李建国",
    total_amount: 5200.0,
    status: 0,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 2200 },
      { item_name: "护理费", amount: 2400 },
      { item_name: "餐饮费", amount: 600 },
    ],
  },
  {
    id: 3,
    elder_id: 4,
    elder_name: "张德福",
    total_amount: 8900.0,
    status: 1,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 3500 },
      { item_name: "护理费", amount: 4200 },
      { item_name: "医疗费", amount: 1200 },
    ],
  },
  {
    id: 4,
    elder_id: 5,
    elder_name: "刘桂兰",
    total_amount: 6200.0,
    status: 0,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 2600 },
      { item_name: "护理费", amount: 3000 },
      { item_name: "餐饮费", amount: 600 },
    ],
  },
  {
    id: 5,
    elder_id: 8,
    elder_name: "周永福",
    total_amount: 7800.0,
    status: 1,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 3000 },
      { item_name: "护理费", amount: 3600 },
      { item_name: "医疗费", amount: 1200 },
    ],
  },
  {
    id: 6,
    elder_id: 10,
    elder_name: "郑国华",
    total_amount: 9500.0,
    status: 0,
    create_time: "2026-04-01 10:00:00",
    items: [
      { item_name: "床位费", amount: 3500 },
      { item_name: "护理费", amount: 4500 },
      { item_name: "康复费", amount: 1500 },
    ],
  },
];

// ==================== 扩充反馈数据 ====================
export const mockFeedbacks = [
  {
    id: 1,
    user_id: 101,
    family_name: "王小明（家属）",
    content: "希望周末探视时段能延长半小时。",
    reply: "已记录，下周例会讨论后回复您。",
    status: 1,
    create_time: "2026-04-08 16:20:00",
  },
  {
    id: 2,
    user_id: 102,
    family_name: "李芳（家属）",
    content: "老人反映晚餐偏咸，请关注。",
    reply: "",
    status: 0,
    create_time: "2026-04-10 11:05:00",
  },
  {
    id: 3,
    user_id: 103,
    family_name: "张明（家属）",
    content: "父亲最近情绪不太好，希望能多安排些社交活动。",
    reply: "已安排心理咨询师明天上午探访。",
    status: 1,
    create_time: "2026-04-09 14:30:00",
  },
];

// ==================== 扩充通知数据 ====================
export const mockNotices = [
  {
    id: 1,
    title: "五一劳动节值班安排",
    content: "各班组请于本周五前提交值班表。",
    type: "内部通知",
    create_time: "2026-04-09 09:00:00",
  },
  {
    id: 2,
    title: "院内消防演练预告",
    content: "定于4月15日下午15:00进行消防疏散演练。",
    type: "安全公告",
    create_time: "2026-04-10 14:00:00",
  },
  {
    id: 3,
    title: "春季流感预防提示",
    content: "春季流感高发，请家属探视时注意佩戴口罩。",
    type: "健康提示",
    create_time: "2026-04-08 10:00:00",
  },
];

// ==================== 扩充活动数据 ====================
export const mockActivities = [
  {
    id: 1,
    title: "春季茶话会",
    content: "一楼多功能厅，欢迎长者及家属参与。",
    start_time: "2026-04-20 14:00:00",
    end_time: "2026-04-20 16:00:00",
    create_time: "2026-04-01 10:00:00",
  },
  {
    id: 2,
    title: "手工剪纸兴趣班",
    content: "每周三下午，限20人，请提前报名。",
    start_time: "2026-04-16 15:00:00",
    end_time: "2026-04-16 16:30:00",
    create_time: "2026-04-05 11:00:00",
  },
  {
    id: 3,
    title: "健康讲座：春季养生",
    content: "邀请中医专家讲解春季养生知识。",
    start_time: "2026-04-18 09:30:00",
    end_time: "2026-04-18 11:00:00",
    create_time: "2026-04-10 09:00:00",
  },
];

// ==================== 扩充文件数据 ====================
export const mockFiles = [
  {
    id: 1,
    file_name: "王秀英-入院评估表.pdf",
    file_url: "/files/mock/1.pdf",
    file_size: 245760,
    upload_user: 2,
    uploader_name: "张护理",
    create_time: "2026-03-01 11:00:00",
  },
  {
    id: 2,
    file_name: "李建国-体检报告.pdf",
    file_url: "/files/mock/2.pdf",
    file_size: 512000,
    upload_user: 3,
    uploader_name: "李护士",
    create_time: "2026-03-15 14:30:00",
  },
];

// ==================== 房间资源管理(测试数据) ====================
export const mockRooms = [
  {
    id: 1,
    building: "A",
    floor: 2,
    room_no: "A-201",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 2,
    status: 1,
    remark: "近护理站，适合高频护理",
    create_time: "2024-01-01 10:00:00",
  },
  {
    id: 2,
    building: "A",
    floor: 2,
    room_no: "A-202",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 1,
    status: 1,
    remark: "",
    create_time: "2024-01-01 10:00:00",
  },
  {
    id: 3,
    building: "C",
    floor: 3,
    room_no: "C-301",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 1,
    status: 1,
    remark: "带阳台",
    create_time: "2024-01-01 10:00:00",
  },
  {
    id: 4,
    building: "B",
    floor: 2,
    room_no: "B-202",
    room_type: "四人间",
    bed_total: 4,
    bed_occupied: 2,
    status: 1,
    remark: "",
    create_time: "2024-01-01 10:00:00",
  },
  {
    id: 5,
    building: "D",
    floor: 1,
    room_no: "D-101",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 1,
    status: 1,
    remark: "无障碍通道",
    create_time: "2024-01-01 10:00:00",
  },
  {
    id: 6,
    building: "B",
    floor: 1,
    room_no: "B-110",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 0,
    status: 0,
    remark: "维修中（空调检修）",
    create_time: "2024-01-01 10:00:00",
  },
];

function delay(data, ms = 280) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function parseBirthFromIdCard(idCard) {
  // 简单解析 18 位身份证中的出生日期：yyyyMMdd
  if (!idCard || idCard.length < 14) return null;
  const raw = idCard.slice(6, 14);
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  if (!/^\d{4}$/.test(y) || !/^\d{2}$/.test(m) || !/^\d{2}$/.test(d))
    return null;
  return `${y}-${m}-${d}`;
}

function calcAge(birthDate, now = new Date()) {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  let age = now.getFullYear() - y;
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  if (mm < m || (mm === m && dd < d)) age -= 1;
  return age;
}

function ageBucket(age) {
  if (age === null || age === undefined) return "未知";
  if (age < 60) return "<60";
  if (age <= 69) return "60-69";
  if (age <= 79) return "70-79";
  if (age <= 89) return "80-89";
  return "90+";
}

export const staffMockApi = {
  async getDashboardStats() {
    return delay({
      elderTotal: mockElders.length,
      // 新增：男女比例
      genderDist: [
        {
          name: "男",
          value: mockElders.filter((e) => e.gender === "男").length,
        },
        {
          name: "女",
          value: mockElders.filter((e) => e.gender === "女").length,
        },
      ],
      // 新增：年龄层分布（由身份证出生日期计算）
      ageDist: ["<60", "60-69", "70-79", "80-89", "90+", "未知"].map((k) => {
        const now = new Date("2026-04-11T00:00:00");
        const count = mockElders.filter((e) => {
          const birth = parseBirthFromIdCard(e.id_card);
          const age = calcAge(birth, now);
          return ageBucket(age) === k;
        }).length;
        return { name: k, value: count };
      }),
      careLevelDist: [
        {
          name: "特级护理",
          value: mockElders.filter((e) => e.care_level === "特级护理").length,
        },
        {
          name: "一级护理",
          value: mockElders.filter((e) => e.care_level === "一级护理").length,
        },
        {
          name: "二级护理",
          value: mockElders.filter((e) => e.care_level === "二级护理").length,
        },
        {
          name: "三级护理",
          value: mockElders.filter((e) => e.care_level === "三级护理").length,
        },
      ],
      // 新增：床位与可用房间（演示使用 mockRooms 统计）
      bedTotal: mockRooms.reduce((s, r) => s + (r.bed_total || 0), 0),
      bedOccupied: mockRooms.reduce((s, r) => s + (r.bed_occupied || 0), 0),
      bedRate: (() => {
        const total = mockRooms.reduce((s, r) => s + (r.bed_total || 0), 0);
        const occ = mockRooms.reduce((s, r) => s + (r.bed_occupied || 0), 0);
        return total > 0 ? Number(((occ / total) * 100).toFixed(1)) : 0;
      })(),
      roomAvailable: mockRooms.filter(
        (r) => r.status === 1 && (r.bed_total || 0) - (r.bed_occupied || 0) > 0
      ).length,
      unpaidBills: 4,
      taskPending: mockCareTasks.filter((t) => t.status === 0).length,
      trendLabels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      trendInpatient: [10, 11, 12, 13, 14, mockElders.length],
    });
  },
};
