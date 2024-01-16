# TinySpot  (前端代码)

## 项目简介

`TinySpot` 是基于SpringBoot + Vue开发的 AI聊天博客权限管理系统，前后端分离，后端采用了 SpringBoot  、MyBatis-plus、MySQL、Redis、WebSocket、OAuth2.0 等技术，前端采用 Vue、element-ui 等。



源代码：

|                           Github                           |
| :--------------------------------------------------------: |
|   前端代码：https://github.com/OnlyAPI/tiny-spot-vue.git   |
| 后端代码：https://github.com/OnlyAPI/tiny-spot-service.git |

!!! 提示：前后端代码毫无保留，全部开源。



## 项目功能

- 首页数据统计 + 日历 （监控数据折线图数据展示 + 日历待办事项添加）
- **AI 聊天** （已接入国内多家AI模型供应商，可以方便的进行AI聊天）
- **AI 生图** （提供了文生图接口（百度）和扩展接口，使大家可以更方便的扩展接入多家服务）
- 系统权限管理 (这个就不多说了)
  - 用户管理
  - 角色管理
  - 菜单管理
- 博客管理
  - 文章管理 （提供markdown编辑器来编写、修改文章）
  - 标签管理 （对于博客标签的管理）
  - 分类管理 （对于博客分类的管理）
- 其他功能管理
  - 系统全局文件管理 （全局上传的文件提供管理页面）
  - 系统音乐管理 （播放音乐）

- OAuth2.0 授权登录 （[QQ](https://wiki.connect.qq.com/%E6%8E%88%E6%9D%83%E7%99%BB%E5%BD%95) + [Gitee](https://gitee.com/api/v5/oauth_doc#/) + [Github](https://docs.github.com/zh/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow)）
- 文件上传 （可选择上传本地或者minio服务，并且预留存储扩展接口，在yml文件中修改配置即可）
  - 本地上传
  - [minio](https://github.com/minio/minio)



## 快速启动

### 前端服务

#### 构建

```
# 1.克隆完整项目
git clone https://github.com/OnlyAPI/tiny-spot-vue.git

# 2.进入项目目录
cd tiny-spot-vue

# 3.安装依赖
npm install

# 4.启动服务
npm run dev

浏览器访问 http://localhost:9528
!!! 默认用户名密码：root/123456
```

#### 发布

```
# 构建生产环境
npm run build:prod
```





## 项目演示

登录页：

![1705386597917](README.assets/1705386597917.png)

首页：

![](README.assets/72e9b9fda6498a622a5be8f749634a2.png)

![](README.assets/3fb842540d2a602ce4f56c9db02299e.png)





AI 聊天：

<img src="README.assets/dc56b8e55620367342cd18348051e99.png"/>

![](README.assets/aff4e244f1b1636512689130b4c21ef.png)





系统管理：

![](README.assets/3bcd44bb36da99b07ed95e792fa54d5.png)

![](README.assets/1c795e38cb7fa75212cbafe9ac7a9b7.png)

![](README.assets/16c862cfdb18e4ece24a0b0f5c22774.png)

![](README.assets/8f8fd92ad1cce85527544664d509942.png)



博客管理：

![](README.assets/599d1279f85c74ee6883e7faa0ae333.png)

![](README.assets/9f05b77496352638188408e04623bf8.png)

![](README.assets/8947008865956f58800564a9f153901.png)

![](README.assets/16c862cfdb18e4ece24a0b0f5c22776.png)



功能管理：

![](README.assets/d9310a990d1d2436f4caaad4c81a5b9.png)

![](README.assets/7f261ecdcdb899f8b25268bb8939645.png)



个人中心：

![](README.assets/03ef4c1a523e0c3a5f4c56149c3ed07.png)





## 鸣谢

- 本人主要侧重Java开发，对于前端知识知之甚少，在项目开发中前端主要基于[vue-element-admin](https://github.com/PanJiaChen/Vue-element-admin) 和[RuoYi](https://github.com/yangzongzhuan/RuoYi)前端模板进行开发，感谢 @PanJiaChen 和 @yangzongzhuan 大佬提供的前端模板



## 说明

- 此项目为本人闲暇之余开发完成，所有代码全部开源，前后大概历经1年时间，跨度较久以及对前端代码不熟悉，避免不了有部分代码实现逻辑啰嗦，如发现不合理的地方可提出 Issues，大家一块学习成长。如果本项目对你有帮助的话，希望大家点个⭐ star ，感谢支持。