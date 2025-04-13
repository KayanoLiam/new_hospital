# 医院管理系统

一个现代化的医院信息管理系统，用于管理患者、医生和预约信息。该系统采用前后端分离架构，后端使用Spring Boot开发，前端使用Vue.js实现。

## 功能特性

- **用户友好的界面**：现代化的UI设计，提供直观的用户体验
- **患者管理**：添加、查询、更新和删除患者信息
- **医生管理**：管理医生信息，包括姓名、专业、科室等
- **预约管理**：在线预约系统，可查看、创建、更新和取消预约
- **灵活的搜索功能**：支持按姓名、科室等条件搜索医生和患者
- **响应式设计**：适配不同设备屏幕大小，提供最佳用户体验

## 技术栈

### 后端

- **框架**：Spring Boot 3.4.4
- **数据库**：MySQL
- **ORM**：MyBatis
- **API文档**：Swagger/OpenAPI
- **构建工具**：Maven
- **Java版本**：Java 21

### 前端

- **框架**：Vue.js 3.3.13
- **UI组件库**：Element Plus 2.5.6
- **状态管理**：Pinia 2.1.7
- **路由**：Vue Router 4.2.5
- **HTTP客户端**：Axios 1.6.8
- **构建工具**：Vue CLI 5.0.8

## 快速开始

### 后端部署

1. 确保已安装Java 21和MySQL 5.7+
2. 克隆代码仓库
3. 配置数据库连接（修改`backend/src/main/resources/application.properties`）
4. 在backend目录下运行：
   ```
   ./mvnw spring-boot:run
   ```
5. 后端服务将在`http://localhost:8080/hospital`上运行

### 前端部署

1. 确保已安装Node.js 14+和npm 6+
2. 克隆代码仓库
3. 在new_frontend目录下运行：
   ```
   npm install
   npm run serve
   ```
4. 前端应用将在`http://localhost:9090`上运行（如果9090端口被占用，可能会使用其他端口，如9092）

## API文档

后端API遵循RESTful设计原则，主要包括以下几个部分：

### 患者API

- `GET /patients` - 获取所有患者列表
- `GET /patients/{id}` - 根据ID获取患者详情
- `POST /patients` - 创建新患者
- `PUT /patients/{id}` - 更新患者信息
- `DELETE /patients/{id}` - 删除患者
- `GET /patients/search?name={name}` - 按姓名搜索患者

### 医生API

- `GET /doctors` - 获取所有医生列表
- `GET /doctors/{id}` - 根据ID获取医生详情
- `POST /doctors` - 添加新医生
- `PUT /doctors/{id}` - 更新医生信息
- `DELETE /doctors/{id}` - 删除医生
- `GET /doctors/search?name={name}` - 按姓名搜索医生
- `GET /doctors/department/{department}` - 按科室查询医生

### 预约API

- `GET /appointments` - 获取所有预约
- `GET /appointments/{id}` - 获取预约详情
- `POST /appointments` - 创建新预约
- `PUT /appointments/{id}` - 更新预约信息
- `DELETE /appointments/{id}` - 删除预约
- `PATCH /appointments/{id}/status` - 更新预约状态
- `PATCH /appointments/{id}/cancel` - 取消预约
- `GET /appointments/doctor/{doctorId}` - 获取医生的所有预约
- `GET /appointments/patient/{patientId}` - 获取患者的所有预约

## 项目结构

```
/
├── backend/                    # 后端Spring Boot项目
│   ├── src/                    # 源代码
│   │   ├── main/
│   │   │   ├── java/com/kayano/hospital_demo/
│   │   │   │   ├── controller/ # 控制器
│   │   │   │   ├── entity/     # 实体类
│   │   │   │   ├── mapper/     # MyBatis映射器
│   │   │   │   ├── service/    # 服务层
│   │   │   ├── resources/      # 配置文件
│   │   │   │   ├── application.properties
│   │   │   │   ├── schema.sql  # 数据库表结构
│   │   │   │   └── data.sql    # 初始数据
│   │   └── test/               # 测试代码
│   └── pom.xml                 # Maven配置
│   
└── new_frontend/              # 前端Vue.js项目
    ├── public/                # 静态资源
    ├── src/                   # 源代码
    │   ├── api/               # API调用
    │   ├── assets/            # 图片等资源
    │   ├── components/        # 公共组件
    │   ├── router/            # 路由配置
    │   ├── stores/            # 状态管理
    │   ├── views/             # 页面组件
    │   ├── App.vue            # 根组件
    │   └── main.js            # 入口文件
    ├── package.json           # npm配置
    └── vue.config.js          # Vue项目配置
```

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参见[LICENSE](LICENSE)文件

## 联系方式

如有任何问题或建议，请通过GitHub Issues与我们联系。

---

Made with ❤️ by [KayanoLiam](https://github.com/KayanoLiam) 