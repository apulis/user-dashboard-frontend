import { Reducer } from 'redux';
import { Effect } from 'dva';

import { createUsers, fetchUsers } from '@/services/users';


export interface IUsers {
  userName: string;
  nickName: string;
  phone?: string;
  email?: string;
}

export interface UsersStateType {
  pageNo: number;
  pageSize: number;
  total: number;
  users: IUsers[];
  conflictedUserName: string[];
}

export interface UsersModelType {
  namespace: 'users';
  state: UsersStateType;
  effects: {
    fetchUsers: Effect;
    createUsers: Effect;
    removeUsers: Effect;
  };
  reducers: {
    saveUsers: Reducer;
  };
}

const UsersModel: UsersModelType = {
  namespace: 'users',
  state: {
    pageNo: 0,
    pageSize: 10,
    total: 10,
    users: [],
    conflictedUserName: []
  },
  effects: {
    * fetchUsers({ payload }, { call, put }) {
      const res = yield call(fetchUsers, payload);
      if (res.success === true) {
        const { list } = res;
        yield put({
          type: 'saveUsers',
          payload: {
            users: list,
            pageNo: payload.pageNo,
            pageSize: payload.pageSize,
            total: res.total,
          },
        });
      }
      console.log(res)
    },
    * createUsers({ payload }, { call, put }) {
      console.log('payload', payload)
      const res = yield call(createUsers, payload);
      if (res.success === true) {

      } else if (res.success === false) {
        const { conflictedUserName } = res;

      }
      console.log('res', res)
    },
    * removeUsers({ payload }, { call, put }) {

    }
  },
  
  reducers: {
    saveUsers(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
export default UsersModel;
