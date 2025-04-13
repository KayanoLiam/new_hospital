# 医院管理系统前端 (Vue 3 版本)

这是医院管理系统的前端项目，使用 Vue 3、Element Plus 和 Pinia 构建。

## 功能特性

- 患者管理：添加、编辑、查询和删除患者信息
- 医生管理：添加、编辑、查询和删除医生信息
- 预约管理：创建、确认、完成和取消预约
- 响应式设计：适配不同屏幕尺寸

## 技术栈

- Vue 3：核心框架
- Vue Router 4：路由管理
- Pinia：状态管理
- Element Plus：UI 组件库
- Axios：HTTP 请求

## 项目结构

```
new_frontend/
├── public/              # 静态资源
├── src/
│   ├── api/             # API 接口
│   ├── assets/          # 资源文件
│   ├── components/      # 公共组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── views/           # 页面组件
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── package.json         # 项目依赖
└── vue.config.js        # Vue 配置
```

## 开发指南

### 安装依赖

```bash
cd new_frontend
npm install
```

### 启动开发服务器

```bash
npm run serve
```

### 构建生产版本

```bash
npm run build
```

## 后端 API

项目使用以下 API 与后端通信：

- 患者相关：`/api/patients`
- 医生相关：`/api/doctors`
- 预约相关：`/api/appointments`

## 浏览器兼容性

- Chrome
- Firefox
- Safari
- Edge
