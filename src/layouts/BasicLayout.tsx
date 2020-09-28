/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  PageLoading
} from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Link, Route } from 'umi';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Result } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { getRouteAuthority } from '@/utils/utils';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import logo from '../assets/logo.svg';
import { ConfigStateType } from '@/models/config';

const noMatch = (
  <Result
    status="403"
    title=""
    subTitle={<><p>Sorry, you are not authorized to access this page.</p><p>Please contact the administrator to add permissions</p></>}
    // extra={
    //   <Button type="primary">
    //     <Link to="/user/login">Go Login</Link>
    //   </Button>
    // }
  />
);

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
  config: ConfigStateType;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const footerRender = (platformName: string) => {

  return (
    <>
      <div
        style={{
          marginTop: '100px',
          paddingBottom: 40,
          textAlign: 'center',
          position: 'absolute',
          bottom: 0,
          width: '100%'
        }}
      >
        {platformName}
      </div>
    </>
  );
};

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, location = { pathname: '/' } } = props;

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };
  // get children authority
  const authorized = getRouteAuthority(location.pathname || '/', props.route.routes as Route[]) || '';

  return (
    <ProLayout
      logo={logo}
      menuHeaderRender={() => (
        <Link to="/">
          {/* {logoDom} */}
          {/* {titleDom} */}
        </Link>
      )}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={() => footerRender(props.config.platformName)}
      menuDataRender={menuDataRender}
      formatMessage={formatMessage}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized} noMatch={noMatch}>
        {children}
      </Authorized>
    <div style={{height: '100px'}}></div>
    </ProLayout>
  );
};

export default connect(({ global, settings, config }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  config
}))(BasicLayout);
