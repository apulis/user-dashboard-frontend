import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Pagination, message, Modal } from 'antd';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';

import { ConnectState, ConnectProps } from '@/models/connect';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import styles from './index.less';
import { Link } from 'umi';
import { ColumnProps } from 'antd/es/table';

import SelectGroup from '@/components/Relate/SelectGroup';
import SelectUser from "@/components/Relate/SelectUser";

import { addRoleToGroups } from '@/services/roles';

import { removeRoles } from '@/services/roles';
import { IRoleListItem } from '@/models/roles';



const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, roles, groups }) => {
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [selectRows, setSelectRows] = useState<IRoleListItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pageNo, setPageNo] = useState<number>(1);
  const [currentHandleRoleName, setCurrentHandleRoleName] = useState<string>('');
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState<boolean>(false);
  const [selectedUserName, setSelectedUserName] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string[]>([]);
  const addRoleToUser = (roleName: string) => {
    setCurrentHandleRoleName(roleName);
    setAddUserModalVisible(true);
  }
  const addRoleToGroup = (roleName: string) => {
    setCurrentHandleRoleName(roleName);
    setAddGroupModalVisible(true);
  }
  const { list: groupList } = groups;
  console.log('groupList', groupList)
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
            <a onClick={() => addRoleToUser(item.name)}>Related To User</a>
            <a onClick={() => addRoleToGroup(item.name)}>Related To Group</a>
            {item.isPreset === 0 && <a onClick={() => removeCurrentSelectedRole(item.name)}>Delete</a>}
          </div>
        )
      }
    },
  ]
  const { list, total } = roles;
  const cancelRelate = () => {
    setCurrentHandleRoleName('');
    setAddUserModalVisible(false);
    setAddGroupModalVisible(false);
    setSelectedGroupName([]);
    setSelectedUserName([]);
  }
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
    setSelectRows([]);
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IRoleListItem[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const onSearchRoles = (search: string) => {
    setSearch(search);
    fetchUsers(search);
  }
  const confirmRelateGroup = async () => {
    const res = await addRoleToGroups([currentHandleRoleName], selectedGroupName);
    if (res.success === true) {
      message.success('Success');
      setAddGroupModalVisible(false);
    } else {
      res.duplicate.forEach((dpc: any) => {
        message.error(`role ${dpc.roleName} is already in group ${dpc.groupName}, please cancel selected`);
      });
    }
  }
  const confirmRelateUser = () => {

  }
  useEffect(() => {
    fetchUsers();
    dispatch({
      type: 'groups/fetchGroups'
    })
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
        pagination={false}
      />
      <Pagination
        style={{marginTop: '20px'}}
        onChange={onPageNationChange}
        // pageSize={pageSize}
        total={total}
      />
      {
        addGroupModalVisible && <Modal
        visible={addGroupModalVisible}
        onCancel={cancelRelate}
        onOk={confirmRelateGroup}
      >
        <SelectGroup
          groupList={groupList}
          onChange={(selectedGroupName) => setSelectedGroupName(selectedGroupName)}
        />
      </Modal>
      }
      {
        addUserModalVisible && <Modal
        visible={addUserModalVisible}
        onCancel={cancelRelate}
        onOk={confirmRelateUser}
      >
        <SelectUser
          onChange={(selectedUserName) => setSelectedUserName(selectedUserName)}
        />
      </Modal> 
      }
      
    </>
  )
}


export default connect(({ roles, groups }: ConnectState) => ({ roles, groups }))(Form.create<FormComponentProps>()(List));