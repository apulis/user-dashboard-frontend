import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { router } from 'umi';

import { logInWithAccount, userLogout } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

export interface StateType {
  status?: 'ok' | 'error' | 401;
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
      // Login successfully
      if (response.success) {
        yield put({
          type: 'changeLoginStatus',
          payload:  {...response, status: 'ok' },
        });
        localStorage.token = response.token;
        setAuthority(response.permissionList);
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        const routerBase = window.routerBase;
        let { redirect } = params as { redirect: string };
        console.log('params', params)
        if (redirect) {
          console.log('redirect', redirect, routerBase)
          if (new RegExp(routerBase).test(redirect)) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = '/';
              return;
            }
          } else {
            window.location.href = redirect + '?token=' + response.token;
            return;
          }
          
        }
        window.location.href = redirect || routerBase || '/'
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        if (response.status === 401) {
          message.error(formatMessage({id: 'user-login.message.incorrent.userName.or.password'}));
        }
      }
    },

    * logout({payload}, {call, put}) {
      const { redirect } = getPageQuery();
      if (localStorage.token) delete localStorage.token;
      if (localStorage.authority) delete localStorage.authority;
      yield call(userLogout);
      if (window.location.pathname !== '/user/login' && !redirect) {
        router.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
    oauthLogin({ payload }) {
      const { loginType, userId } = payload;
      let { redirect } = getPageQuery();
      if (loginType === 'saml') {
        window.location.href = '/ai_arts/saml_login';
        return
      }
      if (redirect) {
        if (/login/.test(redirect as string) || /register/.test(redirect as string)) {
          redirect = `${window.location.protocol  }//${  window.location.host  }${window.routerBase}`;
        }
      } else if (/login/.test(window.location.href) || /resigter/.test(window.location.href)) {
        redirect = `${window.location.protocol  }//${  window.location.host  }${window.routerBase}`;
      } else {
        redirect = window.location.href;
      }
      let redirectURI = `/custom-user-dashboard-backend/auth/${  loginType  }?to=${  redirect}`
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
