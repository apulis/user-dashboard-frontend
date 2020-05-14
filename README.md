
# 用户组权限管理组件管理前端

## 1. 部署流程

1. 安装依赖，运行 `yarn`

2. 编译， 运行 `yarn build`

3. 部署，这个项目自带一个静态文件的服务端，运行 `yarn run static` ，即可在默认的 3083 端口开启服务

   也可以添加参数，指定程序的运行端口，例如：`yarn run static 4000`，即可指定 4000 端口

4. 当前项目的路径为 `/custom-user-dashboard`， 在 nginx 上需要将该路径转发到当前运行的端口
   
5. 当前项目的接口路径为 `/custom-user-dashboard/api`

