import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import index from './zh-CN/index';
import users from './zh-CN/users';
import groups from './zh-CN/groups';
import roles from './zh-CN/roles';
import account from './zh-CN/account';
import common from './zh-CN/common';
import request from './zh-CN/request';
import validates from './zh-CN/validates';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...index,
  ...users,
  ...groups,
  ...roles,
  ...account,
  ...common,
  ...request,
  ...validates,
};
