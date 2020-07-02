import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getOAuth2Methods, getAdminUsers } from '@/services/config';

export interface ConfigStateType {
  authMethods: string[];
  adminUsers: string[];
  language: string;
}

export interface ConfigModelType {
  namespace: 'config';
  state: ConfigStateType;
  effects: {
    fetchAuthMethods: Effect;
    fetchAdminUsers: Effect;
    setLang: Effect;
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
      console.log('paytload', payload)
      yield put({
        type: 'saveLang',
        payload: {
          language: payload.language,
        }
      })
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
