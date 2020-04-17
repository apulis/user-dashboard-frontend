import React, { useEffect } from 'react';
import { Button, Table, Input, Pagination } from 'antd';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';

import { ConnectState, ConnectProps } from '@/models/connect';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import styles from './index.less';
import { Link } from 'umi';
import { ColumnProps } from 'antd/es/table';

import { IRoleListItem } from '@/models/roles';

const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, roles }) => {
  const columns: ColumnProps<IRoleListItem>[] = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',   
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',   
    },
    {
      title: 'Type',
      render(): React.ReactNode {
        return (
          123
        )
      } 
    },
    {
      title: 'Action',
      render(): React.ReactNode {
        return (
          <>
            <a>Related To User</a>
            <a>Related To Group</a>
            <a>Delete</a>
          </>
        )
      }
    },
  ]
  const { list } = roles;
  const fetchUsers = () => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: 1,
        pageSize: 10,
        search: ''
      }
    })
  }
  const onPageNationChange = () => {
    //
  }
  useEffect(() => {
    fetchUsers()
  }, [])
  return (
    <>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/role/add">
            <Button style={{marginRight: '20px'}} type="primary">ADD ROLE</Button>
          </Link>
          <Button>DELETE CURRENT ROLE</Button>
        </div>
        <Search style={{width: '200px' }}/>
      </div>
      <Table style={{marginTop: '20px'}} columns={columns} dataSource={list}  />
      <Pagination
        style={{marginTop: '20px'}}
        onChange={onPageNationChange}
        // pageSize={pageSize}
        // total={total}
      />
    </>
  )
}


export default connect(({roles}: ConnectState) => ({roles}))(Form.create<FormComponentProps>()(List));