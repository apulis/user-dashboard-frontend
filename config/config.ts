import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import themePluginConfig from './themePluginConfig';
import { routes } from './router';
const { pwa } = defaultSettings; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const plugins: IPlugin[] = [
  ['umi-plugin-antd-icon-config', {}],
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        enable: true,
        default: 'zh-CN',
        baseNavigator: true,
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      pwa: pwa
        ? {
          workboxPluginMode: 'InjectManifest',
          workboxOptions: {
            importWorkboxFrom: 'local',
          },
        }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
];

if (isAntDesignProPreview) {
  // 针对 preview.pro.ant.design 的 GA 统计代码
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
  plugins.push(['umi-plugin-antd-theme', themePluginConfig]);
}

export default {
  plugins,
  hash: true,
  base: '/custom-user-dashboard',
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: [
    {
      path: '',
      component: '../layouts/CommonLayout',
      routes: [
        {
          path: '/user',
          component: '../layouts/UserLayout',
          routes: [
            {
              name: 'login',
              path: '/user/login',
              component: './user/login',
            },
            {
              name: 'register',
              path: '/user/register',
              component: './user/register',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/SecurityLayout',
          routes: [
            {
              path: '/',
              component: '../layouts/BasicLayout',
              authority: ['MANAGE_USER'],
              routes: [
                {
                  path: '/account/info',
                  component: './account/info',
                },
                {
                  path: '/',
                  name: 'index',
                  icon: 'dashboard',
                  authority: ['MANAGE_USER'],
                  component: './index'
                },
                {
                  path: '/admin',
                  name: 'admin',
                  icon: 'crown',
                  authority: ['MANAGE_USER'],
                  routes: [
                    {
                      name: 'user',
                      icon: 'UserOutlined',
                      path: '/admin/user',
                      authority: ['MANAGE_USER'],
                      routes: [
                        {
                          name: 'list',
                          path: '/admin/user/list',
                          component: './admin/User/List',
                          authority: ['MANAGE_USER'],
                        },
                        {
                          name: 'add',
                          path: '/admin/user/add',
                          component: './admin/User/Add',
                        },
                        {
                          path: '/admin/user/detail/:id',
                          component: './admin/User/Detail',
                        },
                      ]
                    },
                    {
                      name: 'groups',
                      icon: 'TeamOutlined',
                      path: '/admin/group',
                      authority: ['MANAGE_USER'],
                      routes: [
                        {
                          name: 'list',
                          // icon: 'TeamOutlined',
                          path: '/admin/group/list',
                          component: './admin/Groups/List',
                        },
                        {
                          name: 'add',
                          path: '/admin/group/add',
                          component: './admin/Groups/Add',
                        },
                        {
                          path: '/admin/group/detail/:id',
                          component: './admin/Groups/Detail',
                        },

                      ]
                    },
                    {
                      name: 'roles',
                      icon: 'ApartmentOutlined',
                      path: '/admin/role',
                      authority: ['MANAGE_USER'],
                      routes: [
                        {
                          name: 'list',
                          path: '/admin/role/list',
                          component: './admin/Roles/List',
                        },
                        {
                          name: 'add',
                          path: '/admin/role/add',
                          component: './admin/Roles/Add',
                        },
                        {
                          path: '/admin/role/detail/:id',
                          component: './admin/Roles/Detail',
                        }
                      ]
                    },
                  ]
                },
                {
                  component: './404',
                },
              ],
            },
            {
              component: './404',
            },
          ],
        },
      ]
    },

    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
  },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context: {
        resourcePath: string;
      },
      _: string,
      localName: string
    ) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  publicPath: '/custom-user-dashboard/',
  // chainWebpack: webpackPlugin,
  proxy: {
    '/custom-user-dashboard-backend': {
      target: 'http://localhost:5001/',
      // target: 'https://atlas02.sigsus.cn/custom-user-dashboard-backend',
      changeOrigin: true,
      pathRewrite: {
        '^/custom-user-dashboard-backend': '',
      }, // /server/api/login => /api/login
    },
    '/apis/': {
      target: 'https://atlas02.sigsus.cn/',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
} as IConfig;
