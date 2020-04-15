import React, { useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Pagination } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from 'antd/lib/form';

import { ConnectProps, ConnectState } from '@/models/connect';
import { ColumnProps, TableEventListeners, TableProps } from 'antd/es/table';
import { IUsers } from '@/models/users';



const List: React.FC<FormComponentProps & ConnectProps & ConnectState> = (props) => {
  const { dispatch, users: { list, pageNo, pageSize, total } } = props;
  useEffect(() => {
    dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo: pageNo,
        pageSize: pageSize,
      }
    })
  }, [])
  const columns: ColumnProps<IUsers>[] = [
    {
      title: 'UserName',
      dataIndex: 'userName',
      key: 'userName',    
    },
    {
      title: 'NickName',
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: 'Action',
      render(): React.ReactNode {
        return (
          <span>123</span>
        )
      }
    },
  ];
  const onPageNationChange = (pageNo: number, pageSize: number) => {
    console.log(pageNo, pageSize)
    dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo,
        pageSize,
      }
    })
  }
  return (
    <PageHeaderWrapper>
      <Link to="/admin/user/add">
        <Button type="primary">Add User</Button>
      </Link>
      <Table
        style={{marginTop: '20px'}}
        dataSource={list}
        columns={columns}
        pagination={false}
      />
      <Pagination style={{marginTop: '20px'}} onChange={onPageNationChange} total={total} />
    </PageHeaderWrapper>
  )
};

export default connect(({ users }: ConnectState) => ({ users }))(Form.create<FormComponentProps & ConnectProps>()(List));
