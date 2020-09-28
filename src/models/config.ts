import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getOAuth2Methods, getAdminUsers, getPlatformConfig } from '@/services/config';

export interface ConfigStateType {
  authMethods: string[];
  adminUsers: string[];
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
    fetchPlatformConfig: Effect;
  };
  reducers: {
    save: Reducer;
  };
}

const ConfigModel: ConfigModelType = {
  namespace: 'config',
  state: {
    authMethods: [],
    adminUsers: [],
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
    * fetchPlatformConfig({ payload }, { call, put }) {
      const res = yield call(getPlatformConfig);
      if (res.success) {
        console.log(123123, res)
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
  },
};
export default ConfigModel;
