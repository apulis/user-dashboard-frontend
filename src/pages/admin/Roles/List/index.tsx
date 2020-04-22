import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Pagination, message, Modal } from 'antd';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';

import { ConnectState, ConnectProps } from '@/models/connect';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import styles from './index.less';
import { Link } from 'umi';
import { ColumnProps } from 'antd/es/table';

import { removeRoles } from '@/services/roles';
import { IRoleListItem } from '@/models/roles';



const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, roles }) => {
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [selectRows, setSelectRows] = useState<IRoleListItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pageNo, setPageNo] = useState<number>(1);
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
      dataIndex: 'type',
      align: 'center',
      render(_text, item) {
        return (
          <div>{item.isPreset ? 'Preset Role' : 'Custom Role'}</div>
        )
      } 
    },
    {
      title: 'Action',
      align: 'center',
      width: '320px',
      render(_text, item) {
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <a>Related To User</a>
            <a>Related To Group</a>
            {item.isPreset === 0 && <a onClick={() => removeCurrentSelectedRole(item.name)}>Delete</a>}
          </div>
        )
      }
    },
  ]
  const { list, total } = roles;
  const removeCurrentSelectedRole = async (currentRole?: string) => {
    let res;
    if (typeof currentRole === 'string') {
      res = await  removeRoles([currentRole])
    } else {
      const currentRemoveUserRoleNames = selectRows.map(r => r.name);
      res = await removeRoles(currentRemoveUserRoleNames)
    }
    if (res.success === true) {
      message.success(`Success`);
      fetchUsers()
    }
  }
  const fetchUsers = (s?: string, page?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: page || pageNo,
        pageSize: 10,
        search: typeof s !== 'undefined' ? s : search
      }
    })
  }
  const onPageNationChange = (pageNo: number) => {
    setPageNo(pageNo);
    fetchUsers(search, pageNo);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IRoleListItem[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const onSearchRoles = (search: string) => {
    setSearch(search);
    fetchUsers(search);
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
          <Button onClick={() => removeCurrentSelectedRole()} disabled={selectRows.length === 0}>DELETE CURRENT ROLE</Button>
        </div>
        <Search onSearch={onSearchRoles} style={{width: '200px' }}/>
      </div>
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys
        }}
        columns={columns}
        dataSource={list}
      />
      <Pagination
        style={{marginTop: '20px'}}
        onChange={onPageNationChange}
        // pageSize={pageSize}
        total={total}
      />
    </>
  )
}


export default connect(({roles}: ConnectState) => ({roles}))(Form.create<FormComponentProps>()(List));