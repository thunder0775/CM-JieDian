# 🚀 CM-JieDian

基于 [cmliu/edgetunnel](https://github.com/cmliu/edgetunnel) 维护的个人版本。

本仓库以同步上游为主，唯一需要保留本地定制功能的业务代码文件是 `_worker.js`；此外，`.github/workflows/` 目录按本地配置保留，不随上游更新。

## 项目说明

- **上游项目：** [cmliu/edgetunnel](https://github.com/cmliu/edgetunnel)
- **同步方向：** 上游 `main` → 本仓库 `main`
- **自动同步：** GitHub Actions 定时运行，也支持手动触发
- **部署教程：** [edgetunnel 官方部署指南](https://cmliussss.com/p/edt2/)

## 自动同步规则

1. **除 `_worker.js` 和 `.github/workflows/` 外，其他文件强制同步上游。** 文件内容以最新上游版本为准，本地对这些文件的修改不会保留。
2. **保留本地工作流配置。** 同步时备份并恢复整个 `.github/workflows/` 目录；上游对该目录内文件的新增、修改和删除均不会同步到本仓库。
3. **`_worker.js` 单独合并。** 同步上游更新时，尝试保留本地定制功能。
4. **严格检查本地定制。** 检查合并冲突、关键定制代码及标记是否完整，并验证 JavaScript 语法。
5. **检查失败立即停止。** 不推送存在冲突、定制功能缺失或验证失败的结果。
6. **输出详细错误。** 出错时报告失败阶段、涉及文件和可定位的冲突信息，便于排查。
7. **全部检查通过后才推送。** 无实际变更时不创建空提交。

> 注意：`.github/workflows/` 是本地保留目录，不属于上游强制同步范围。即使上游新增或更新工作流（例如 `sync.yml`），本仓库也不会自动采用这些变化；请手动维护本地工作流，避免同步逻辑被上游工作流覆盖或重复触发。

## 本地定制功能

本仓库在 `_worker.js` 中保留以下功能：

- `proxyip` 查询参数支持以逗号分隔多个 IP，并随机选择一个。
- 路径反代参数支持以逗号分隔多个 IP，并随机选择一个。

这些功能通过 `LOCAL-CUSTOM: random-proxyip` 标记识别。自动同步时必须确认标记和关键实现仍然存在；如果无法安全保留，应停止推送并输出详细错误，不得静默覆盖。

## GitHub Actions

| 工作流 | 用途 |
| --- | --- |
| `.github/workflows/upstream-sync.yml` | 定时或手动同步上游，并检查 `_worker.js` 本地定制 |
| `.github/workflows/Auto-close-empty-PRs.yml` | 自动处理说明为空或过短的 Pull Request |

以上工作流文件均由本仓库本地维护，不会随上游自动更新。

## 部署与使用

部署方式、环境变量、客户端适配及高级参数以 [上游项目说明](https://github.com/cmliu/edgetunnel) 和 [官方部署教程](https://cmliussss.com/p/edt2/) 为准。

部署前请确认已正确配置 Cloudflare Workers 或 Pages 所需的环境变量和 KV 绑定。

## 免责声明

本项目仅供学习、研究和个人测试使用。使用者应遵守所在地法律法规，并自行承担部署和使用本项目所产生的风险。
