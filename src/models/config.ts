import { Reducer } from 'redux';
import { Effect } from 'dva';

import { setCookieLang } from '@/utils/utils';
import { getOAuth2Methods, getAdminUsers, getPlatformConfig } from '@/services/config';

export interface ConfigStateType {
  authMethods: string[];
  adminUsers: string[];
  language: string;
  platformName: string;
  enableVC: boolean;
  i8n: string | boolean;
}

export interface ConfigModelType {
  namespace: 'config';
  state: ConfigStateType;
  effects: {
    fetchAuthMethods: Effect;
    fetchAdminUsers: Effect;
    setLang: Effect;
    fetchPlatformConfig: Effect;
  };
  reducers: {
    save: Reducer;
    saveLang: Reducer;
  };
}

const ConfigModel: ConfigModelType = {
  namespace: 'config',
  state: {
    authMethods: [],
    adminUsers: [],
    language: '',
    platformName: '',
    enableVC: true,
    i8n: true,
  },
  effects: {
    * fetchAuthMethods({ payload }, { call, put }) {
      const res = yield call(getOAuth2Methods);
      if (res.success) {
        yield put({
          type: 'save',
          payload: {
            authMethods: res.methods
          }
        })
      }
    },
    * fetchAdminUsers({ payload }, { call, put }) {
      const res = yield call(getAdminUsers);
      if (res.success) {
        yield put({
          type: 'save',
          payload: {
            adminUsers: res.list,
          }
        })
      }
    },
    * setLang({ payload }, { call, put }) {
      yield call(setCookieLang, payload.language);
      yield put({
        type: 'saveLang',
        payload: {
          language: payload.language,
        }
      })
    },
    * fetchPlatformConfig({ payload }, { call, put }) {
      const res = yield call(getPlatformConfig);
      if (res.success) {
        yield put({
          type: 'save',
          payload: {
            platformName: res.platformName,
            i18n: res.i18n,
            enableVC: res.enableVC,
          }
        })
      }
    }
  },

  reducers: {
    save(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    saveLang(state, { payload }) {
      return {
        ...state,
        language: payload.language
      }
    }
  },
};
export default ConfigModel;
