import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Pagination, Select, Dropdown, Menu, Modal, message, Input } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { DownOutlined, UsergroupAddOutlined, UserDeleteOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import { ColumnProps } from 'antd/es/table';
import { ClickParam } from 'antd/lib/menu';

import { ConnectProps, ConnectState } from '@/models/connect';
import { IUsers } from '@/models/users';

import SelectRole from '@/components/Relate/SelectRole'

import { removeUsers, addUsersToGroups, getUserRolesById } from '@/services/users';
import { addRoleToUsers, editRoleToUsers } from '@/services/roles';
import SelectGroup from '../../../../components/Relate/SelectGroup';

import styles from './index.less'

interface IFetchUserParam {
  pageNo: number;
  pageSize?: number;
  search?: string;
}

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const List: React.FC<FormComponentProps & ConnectProps & ConnectState> = (props) => {
  const { dispatch, users, form, groups } = props;
  const { list, pageNo, pageSize, total } = users || {};
  const { list: groupList } = groups;
  const [selectRows, setSelectRows] = useState<IUsers[]>([]);
  const [addRoleForUserModalVisible, setAddRoleForUserModalVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number[]>([]);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [currentHandleUserId, setCurrentHandleUserId] = useState<number>(0);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<number[]>([]);
  const fetchUsers = async (params: IFetchUserParam) => {
    setTableLoading(true);
    await dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        search: params.search || search,
      }
    })
    setTableLoading(false);
  }
  useEffect(() => {
    fetchUsers({pageNo: pageNo || 1, pageSize: pageSize || 10});
    fetchUserGroups();
  }, [])
  const starRemoveUsers = (currentHandleUserId?: string) => {
    let userNames: string[];
    if (currentHandleUserId) {
      userNames = [currentHandleUserId];
    } else {
      userNames = selectRows.map((val: IUsers) => val.userName);
    }
    removeUsers(userNames)
      .then(res => {
        let tag = false;
        if (list.length === userNames.length) {
          // 最后一页的数据全部删除的情况
          tag = true;
        }
        if (res.success) {
          message.success('Success Delete User: ' + userNames.join(', '))
          fetchUsers({
            pageSize,
            pageNo: tag ? pageNo - 1 : pageNo,
          })
          clearRowSelection();
          setCurrentHandleUserId(0);
        }
      })
  }
  const addRolesForUser = (userId: number) => {
    setCurrentHandleUserId(userId);
    const cancel = message.loading('loading...');
    getUserRolesById(userId)
      .then(res => {
        if (res.success) {
          cancel();
          const currentUserRoles = res.list.map(r => r.roleId);
          setCurrentUserRoles(currentUserRoles);
          setAddRoleForUserModalVisible(true);
        }
      })
      .catch(error => {
        cancel();
        message.error('loading roles error');
      })
  }
  const columns: ColumnProps<IUsers>[] = [
    {
      title: 'Username',
      dataIndex: 'userName',
      render(_text, item) {
        return (
          <Link to={"/admin/user/detail/" + item.id}>{item.userName}</Link>
        )
      }
    },
    {
      title: 'Nickname',
      dataIndex: 'nickName',
      render(_text, item) {
        return (
          <Link to={"/admin/user/detail/" + item.id}>{item.nickName}</Link>
        )
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    {
      title: 'Action',
      width: '250px',
      align: 'center',
      render(_text, item): React.ReactNode {
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            {
              item.id !== 1 && 
              <a onClick={() => addRolesForUser(item.id)}>Edit Role</a>
            }
            <Dropdown
              overlay={<Menu>
              <Menu.Item onClick={() => {addToGroup();setCurrentHandleUserId(item.id)}} key="1">Add To User Group</Menu.Item>
              <Menu.Item disabled={item.id === 1} onClick={() => {setCurrentHandleUserId(item.id);removeUser(item.userName)}} key="2">Delete</Menu.Item>
            </Menu>}
            >
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                More <DownOutlined />
              </a>
            </Dropdown>
          </div>
        )
      }
    },
  ];
  
  const onPageNationChange: (page: number, pageSize?: number) => void = (pageNo, pageSize) => {
    fetchUsers({ pageSize, pageNo });
    setSelectRows([]);
    setSelectRowKeys([]);
  }
  const onPageSizeChange = (pageSize: number) => {
    dispatch({
      type: 'users/changePageSize',
      payload: {
        pageSize,
      }
    })
    fetchUsers({
      pageNo,
      pageSize,
    })
  }
  const clearRowSelection = () => {
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IUsers[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const handleMenuClick: ((param: ClickParam) => void) = (e) => {
    //
  }
  const fetchUserGroups = (search?: string) => {
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: search || '',
      }
    })
  }
  const addToGroup = () => {
    setAddGroupModalVisible(true);
  }
  const removeUser = (userName?: string) => {
    
    confirm({
      title: 'Are you sure you want to delete selected item(s)?',
      icon: <ExclamationCircleOutlined />,
      content: 'Selected users will be disabled',
      okText: 'OK',
      cancelText: 'CANCEL',
      onOk() {
        starRemoveUsers(userName);
      },
      onCancel() {
        //
        setCurrentHandleUserId(0);
      },
    })

  }
  const onSearch = (s: string) => {
    setSearch(s);
    fetchUsers({
      pageNo: 1,
      pageSize,
      search: s,
    })
  }
  const onSelectedGroupChange = (selectedGroupId: number[]) => {
    setSelectedGroupId(selectedGroupId);
  }
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1" onClick={addToGroup}>
        <UsergroupAddOutlined />
        Add To Group
      </Menu.Item>
      <Menu.Item key="2" disabled={!!selectRows.find(val => val.id === 1)} onClick={() => removeUser()}>
        <UserDeleteOutlined />
        Delete Current User
      </Menu.Item>
    </Menu>
  )
  const onConfirmAddGroup = async () => {
    let selectedUserIds: number[];
    if (currentHandleUserId) {
      selectedUserIds = [currentHandleUserId]
    } else {
      selectedUserIds = selectRows.map(val => val.id);
    }
    const cancel = message.loading('Submitting');
    const res = await addUsersToGroups(selectedUserIds, selectedGroupId);
    cancel();
    if (res.success === true) {
      message.success('Success!')
      setAddGroupModalVisible(false);
    }
  };
  const confirmAddRoleToUser = async () => {
    const res = await editRoleToUsers(currentHandleUserId, selectedRoleIds);
    if (res.success) {
      message.success('Success edit role');
      setCurrentHandleUserId(0);
      setCurrentUserRoles([]);
      setAddRoleForUserModalVisible(false);
    }
  }
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/user/add">
            <Button type="primary">Create User</Button>
          </Link>
          <Dropdown disabled={selectRows.length === 0} overlay={menu}>
            <Button style={{marginLeft: '15px'}}>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        
        <Search
          placeholder="input search text"
          onSearch={onSearch}
          style={{ width: 200 }}
        />
      </div>
      
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys
        }}
        dataSource={list}
        columns={columns}
        pagination={false}
        loading={tableLoading}
      />
      <div className={styles.bottom}>
        <div style={{ height: '24px', marginRight: '10px' }}>Items per page:</div>
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
          defaultCurrent={pageNo || 1}
          pageSize={pageSize}
          total={total}
        />
      </div>
      <Modal
        visible={addGroupModalVisible}
        onCancel={() => setAddGroupModalVisible(false)}
        onOk={onConfirmAddGroup}
        title="Add to group"
        width="65%"
      >
        {
          addGroupModalVisible && <SelectGroup
            groupList={groupList}
            onChange={(selectedGroupId) => onSelectedGroupChange(selectedGroupId)}
          />
        }
        
      </Modal>

      <Modal
        visible={addRoleForUserModalVisible}
        onOk={confirmAddRoleToUser}
        onCancel={() => {setAddRoleForUserModalVisible(false);setCurrentHandleUserId(0)}}
      >
        {
          addRoleForUserModalVisible && <SelectRole
            currentUserId={currentHandleUserId}
            onChange={(selectedRoleIds) => setSelectedRoleIds(selectedRoleIds)}
            currentUserRoles={currentUserRoles}
          />
        }

      </Modal>
      
    </PageHeaderWrapper>
  )
};

export default connect(({ users, groups }: ConnectState) => ({ users, groups }))(Form.create<FormComponentProps & ConnectProps>()(List));
