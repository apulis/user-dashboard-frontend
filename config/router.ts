export const routes = [
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
  {
    component: './404',
  },
]