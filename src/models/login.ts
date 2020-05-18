import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { router } from 'umi';

import { logInWithAccount } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: string[];
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
    oauthLogin: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(logInWithAccount, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.success) {
        localStorage.token = response.token;
        console.log('response', response)
        setAuthority(response.permissionList);
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            const routerBase = window.routerBase;
            if (routerBase && routerBase !== '/') {
              if (redirect.includes(routerBase)) {
                redirect = redirect.split(routerBase).join('');
              } else {
                window.location.href = redirect;
                return;
              }
            }
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        window.location.href = redirect || '/'
      } else {
        message.error(response.message)
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        router.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
    oauthLogin({payload}, {call, put}) {
      const { loginType, userId } = payload;
      let { redirect } = getPageQuery();
      redirect = redirect || window.location.href
      let redirectURI = '/custom-user-dashboard-backend/auth/' + loginType + '?to=' + redirect
      if (userId) {
        redirectURI += `&userId=${userId}`
      }
      if (process.env.NODE_ENV === 'development') {
        redirectURI += `&env=development`;
      }
      window.location.href = redirectURI;
    }
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};

export default Model;
