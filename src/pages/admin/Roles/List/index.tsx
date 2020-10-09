import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal, Pagination, Table } from 'antd';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { ColumnProps } from 'antd/es/table';
import { formatMessage } from 'umi-plugin-react/locale';

import { addRoleToGroups, addRoleToUsers, getRoleGroup, removeRoles, fetchUsersForRole  } from '@/services/roles';
import { IRoleListItem } from '@/models/roles';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import styles from './index.less';
import { Link } from 'umi';
import SelectGroup from '@/components/Relate/SelectGroup';
import SelectUser from '@/components/Relate/SelectUser';

const { Search } = Input;  

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, roles, groups }) => {
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [selectRows, setSelectRows] = useState<IRoleListItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pageNo, setPageNo] = useState<number>(1);
  const [currentHandleRoleId, setCurrentHandleRoleId] = useState<number>(0);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number[]>([]);
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<number[]>([]);
  const [pageCurrent, setPageCurrent] = useState<number>(1);
  const [selectedRoleUser, setSelectedRoleUser] = useState<number[]>([]);

  const addRoleToUser = async (roleId: number) => {
    const res = await fetchUsersForRole(roleId);
    if (res.success === true) {
      setSelectedRoleUser(res.list);
    }
    setCurrentHandleRoleId(roleId);
    setAddUserModalVisible(true);
  }

  const fetchRoleGroups = async (roleId: number) => {
    const res = await getRoleGroup(roleId);
    if (res.success) {
      const { list } = res;
      await setSelectedRoleGroup(list);
    }
  }

  const addRoleToGroup = async (roleId: number) => {
    setSelectedRoleGroup([]);
    await fetchRoleGroups(roleId);
    setCurrentHandleRoleId(roleId);
    setAddGroupModalVisible(true);
  }

  const clearSelect = () => {
    setSelectRowKeys([]);
    setSelectRows([]);
  }

  const { list: groupList } = groups;
  const columns: ColumnProps<IRoleListItem>[] = [
    {
      title: formatMessage({id: 'roles.list.name'}),
      dataIndex: 'name',
      key: 'name',   
    },
    {
      title: formatMessage({id: 'roles.list.description'}),
      dataIndex: 'note',
      key: 'note',   
    },
    {
      title: formatMessage({id: 'roles.list.type'}),
      dataIndex: 'type',
      align: 'center',
      render(_text, item) {
        return (
          <div>{item.isPreset ? formatMessage({id: 'roles.list.type.preset'}) : formatMessage({id: 'roles.list.type.custom'})}</div>
        )
      } 
    },
    {
      title: formatMessage({id: 'roles.list.action'}),
      align: 'center',
      width: '320px',
      render(_text, item) {
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <a onClick={() => addRoleToUser(item.id)}>
              {formatMessage({id: 'roles.list.relate.to.user'})}
            </a>
            <a onClick={() => addRoleToGroup(item.id)}>
              {formatMessage({id: 'roles.list.relate.to.group'})}
            </a>
            {item.isPreset === 0 && <a style={{ color: 'red' }} onClick={() => removeCurrentSelectedRole(item.id)}>
                {formatMessage({id: 'roles.list.delete'})}
              </a>}
          </div>
        )
      }
    },
  ]

  const { list, total } = roles;
  const cancelRelate = () => {
    setCurrentHandleRoleId(0);
    setAddUserModalVisible(false);
    setAddGroupModalVisible(false);
    setSelectedGroupId([]);
    setSelectedUserId([]);
  }
  
  const removeCurrentSelectedRole = async (currentRole?: number) => {
    let tempRoleList;
    Modal.confirm({
      title: formatMessage({id: 'roles.list.modal.confim.delete.role'}),
      async onOk() {
        let res;
        if (typeof currentRole === 'number') {
          tempRoleList = [currentRole]
          res = await removeRoles([currentRole])
        } else {
          const currentRemoveUserRoleNames = selectRows.map(r => r.id);
          tempRoleList = currentRemoveUserRoleNames;
          res = await removeRoles(currentRemoveUserRoleNames)
        }
        if (res.success === true) {
          message.success(formatMessage({id: 'roles.list.message.success'}));
          clearSelect();
          if (tempRoleList.length === list.length) {
            // 删掉最后一页的全部内容
            const currentPage = pageNo - 1;
            fetchRoles(undefined, currentPage);
            setPageCurrent(currentPage)
            setPageNo(currentPage);
          } else {
            fetchRoles()
          }
        }
      }
    })
    
  }
  const fetchRoles = (s?: string, page?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: page || pageCurrent,
        pageSize: 10,
        search: typeof s !== 'undefined' ? s : search
      }
    })
  }
  const onPageNationChange = (pageNo: number) => {
    setPageNo(pageNo);
    fetchRoles(search, pageNo);
    setPageCurrent(pageNo);
    setSelectRows([]);
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IRoleListItem[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const onSearchRoles = (search: string) => {
    setPageCurrent(1);
    setSearch(search);
    fetchRoles(search, 1);
  }
  const confirmRelateGroup = async () => {
    if (selectedGroupId.length === 0) {
      setAddGroupModalVisible(false);
      return;
    }
    const res = await addRoleToGroups([currentHandleRoleId], selectedGroupId);
    if (res.success === true) {
      message.success(formatMessage({id: 'roles.list.message.success'}));
      setAddGroupModalVisible(false);
    }
  }
  const confirmRelateUser = async () => {
    const res = await addRoleToUsers(selectedUserId, [currentHandleRoleId]);
    if (res.success === true) {
      message.success(formatMessage({id: 'roles.list.message.success'}));
      setAddUserModalVisible(false);
    }
  }
  useEffect(() => {
    fetchRoles();
    dispatch({
      type: 'groups/fetchGroups'
    })
  }, [])
  const buttonDisabled = !!(selectRows.find(val => val.isPreset === 1) || selectRows.length === 0);
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/role/add">
            <Button style={{marginRight: '20px'}} type="primary">
              {formatMessage({id: 'roles.list.create.role'})}
            </Button>
          </Link>
          <Button onClick={() => removeCurrentSelectedRole()} disabled={buttonDisabled}>
            { formatMessage({id: 'roles.list.delete.current.role'}) }
          </Button>
        </div>
        <Search onSearch={onSearchRoles} placeholder={formatMessage({id: 'roles.list.search.role'})} style={{width: '200px' }}/>
      </div>
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys,
          getCheckboxProps: record => ({
              disabled: record.isPreset === 1,
            })
        }}
        rowKey="id"
        columns={columns}
        dataSource={list}
        pagination={false}
      />
      <Pagination
        style={{marginTop: '20px', float: 'right'}}
        onChange={onPageNationChange}
        // pageSize={pageSize}
        current={pageCurrent}
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
          defaultSelected={selectedRoleGroup}
          onChange={selectedGroupId => setSelectedGroupId(selectedGroupId)}
        />
      </Modal>
      }
      {
        addUserModalVisible && <Modal
        visible={addUserModalVisible}
        onCancel={cancelRelate}
        onOk={confirmRelateUser}
        width="65%"
      >
        <SelectUser
          defaultSelected={selectedRoleUser}
          onChange={selectedUserId => setSelectedUserId(selectedUserId)}
        />
      </Modal> 
      }
      
    </PageHeaderWrapper>
  )
}


export default connect(({ roles, groups }: ConnectState) => ({ roles, groups }))(Form.create<FormComponentProps>()(List));