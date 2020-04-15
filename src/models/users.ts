import { Reducer } from 'redux';
import { Effect } from 'dva';

import { removeUsers, fetchUsers } from '@/services/users';


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
  list: IUsers[];
  search: string;
}

export interface UsersModelType {
  namespace: 'users';
  state: UsersStateType;
  effects: {
    fetchUsers: Effect;
    createUsers: Effect;
    removeUsers: Effect;
    changePageSize: Effect;
  };
  reducers: {
    saveUsers: Reducer;
    changePageSize: Reducer;
  };
}

const UsersModel: UsersModelType = {
  namespace: 'users',
  state: {
    pageNo: 1,
    pageSize: 10,
    total: 10,
    list: [],
    search: ''
  },
  effects: {
    * fetchUsers({ payload }, { call, put, select }) {
      const state = yield select();
      if (!payload.search) {
        payload.search = state.search;
      }
      const res = yield call(fetchUsers, payload);
      if (res.success === true) {
        const { list } = res;
        yield put({
          type: 'saveUsers',
          payload: {
            list: list,
            pageNo: payload.pageNo,
            pageSize: payload.pageSize,
            total: res.total,
            search: payload.search,
          },
        });
      }
      console.log(res)
    },
    * createUsers({ payload }, { call, put }) {
      //
    },
    * changePageSize({ payload }, { call, put }) {
      yield put({
        type: 'saveUsers',
        payload,
      })
    },
    * removeUsers({ payload }, { call, put }) {
      const { selectRows } = payload;
      const removingUserNames = selectRows.map((val: IUsers) => val.userName)
      const res = yield call(removeUsers, removingUserNames);
      if (res.success) {
        //
      } else {
        //
      }
    }
  },
  
  reducers: {
    saveUsers(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    changePageSize(state = {}, { payload }) {
      return {
        ...state,
        pageSize: payload.pageSize,
      }
    }
  },
};
export default UsersModel;
