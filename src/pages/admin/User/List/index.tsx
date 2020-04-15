import React, { useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Pagination, Select } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from 'antd/lib/form';

import { ConnectProps, ConnectState } from '@/models/connect';
import { ColumnProps } from 'antd/es/table';
import { IUsers } from '@/models/users';

import styles from './index.less'

const { Option } = Select;

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
  const onPageNationChange: (page: number, pageSize?: number) => void = (pageNo, pageSize) => {
    dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo,
        pageSize,
      }
    })
  }
  const onPageSizeChange = (pageSize: number) => {
    console.log('pageSize', pageSize)
    dispatch({
      type: 'users/changePageSize',
      payload: {
        pageSize,
      }
    })
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
      <div className={styles.bottom}>
        <div style={{ height: '24px', marginRight: '10px' }}>Count per page:</div>
        <Select
          style={{ width: 100, marginRight: '20px' }}
          onChange={onPageSizeChange}
          defaultValue={10}
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
        </Select>
        <Pagination
          style={{marginTop: '20px'}}
          onChange={onPageNationChange}
          pageSize={pageSize}
          total={total}
        />
      </div>
    </PageHeaderWrapper>
  )
};

export default connect(({ users }: ConnectState) => ({ users }))(Form.create<FormComponentProps & ConnectProps>()(List));
