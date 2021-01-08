import React, { useEffect, useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Descriptions, Pagination, Select, Dropdown, Menu, Modal, message, Input } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { DownOutlined, UsergroupAddOutlined, UserDeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/es/table';
import { ClickParam } from 'antd/lib/menu';
import { ConnectProps, ConnectState } from '@/models/connect';
import { formatMessage } from 'umi-plugin-react/locale';
import { IUsers } from '@/models/users';
import SelectRole from '@/components/Relate/SelectRole'
import { removeUsers, addUsersToGroups, getUserRolesById, getUserGroups, editVC } from '@/services/users';
import { editRoleToUsers } from '@/services/roles';
import SelectGroup from '../../../../components/Relate/SelectGroup';
import styles from './index.less';
import VCTable from '../components/VCTable';

interface IFetchUserParam {
  pageNo: number;
  pageSize?: number;
  search?: string;
}

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const List: React.FC<FormComponentProps & ConnectProps & ConnectState> = (props) => {
  const { dispatch, users, groups, config } = props;
  const { adminUsers } = config;
  const { list, pageNo, pageSize, total } = users || {};
  const { list: groupList } = groups;
  if (list.length > 50) {
    list.splice(50, list.length);
  }
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
  const [userGroupId, setUserGroupId] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [vcModal, setVcModal] = useState(false);
  const vcTableRef = useRef();

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
    fetchUsers({ pageNo: 1, pageSize: 10 });
    fetchGroups();
  }, [])
  const fetchUserGroups = async (userId: number) => {
    const res = await getUserGroups(userId);
    if (res.success) {
      await setUserGroupId(res.list.map((val: any) => val.id));
    }
  }
  const starRemoveUsers = (currentHandleUserId?: number) => {
    let userIds: number[];
    if (currentHandleUserId) {
      userIds = [currentHandleUserId];
    } else {
      userIds = selectRows.map((val: IUsers) => val.id);
    }
    removeUsers(userIds)
      .then(res => {
        let tag = false;
        if (list.length === userIds.length) {
          // 最后一页的数据全部删除的情况
          tag = true;
        }
        if (res.success) {
          message.success(formatMessage({
            id: 'users.message.success.delete.user'
          }))
          let page = tag ? pageNo - 1 : pageNo;
          if (page <= 0) page = 1;
          fetchUsers({
            pageSize,
            pageNo: page,
          })
          clearRowSelection();
          setCurrentHandleUserId(0);
        } else if (res.success === false && res.activeJobUserName) {
          const activeJobUserName: string[] = res.activeJobUserName;
          message.warn(activeJobUserName.join(', ') + formatMessage({ id: 'users.has.active.job' }));
        }
      })
  }
  const addRolesForUser = (userId: number) => {
    setCurrentHandleUserId(userId);
    const cancel = message.loading(formatMessage({ id: 'users.message.submitting' }));
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
        message.error(formatMessage({ id: 'users.message.loading.error' }));
      })
  }

  const addVCForUser = (userId: number) => {
    setCurrentHandleUserId(userId);
    setVcModal(true);
  }

  const addToGroup = async (userId?: number) => {
    if (userId) {
      await fetchUserGroups(userId);
    }
    setAddGroupModalVisible(true);
  }

  const columns: ColumnProps<IUsers>[] = [
    {
      title: formatMessage({ id: 'users.userName' }),
      dataIndex: 'userName',
      render(_text, item) {
        return (
          <Link to={`/admin/user/detail/${item.id}`}>{item.userName}</Link>
        )
      }
    },
    {
      title: formatMessage({ id: 'users.nickName' }),
      dataIndex: 'nickName',
      render(_text, item) {
        return (
          <Link to={`/admin/user/detail/${item.id}`}>{item.nickName}</Link>
        )
      }
    },
    {
      title: formatMessage({ id: 'users.phone' }),
      dataIndex: 'phone',
      key: 'phone',
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    {
      title: formatMessage({ id: 'users.email' }),
      dataIndex: 'email',
      key: 'email',
      align: 'center',  
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    
    {
      title: formatMessage({ id: 'users.jobMaxTimeSecond' }),
      dataIndex: 'jobMaxTimeSecond',
      key: 'jobMaxTimeSecond',
      render(text) {
        if (text) {
          return Math.floor(text || 0) / 3600;
        }
        return '-'
      }
    },
    {
      title: formatMessage({ id: 'users.action' }),
      width: '250px',
      align: 'center',
      render(_text, item): React.ReactNode {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {!adminUsers.includes(item.userName) ? <Dropdown
              overlay={
                <Menu>
                  {!adminUsers.includes(item.userName) && <Menu.Item onClick={() => addRolesForUser(item.id)} key="0">
                    {formatMessage({ id: 'users.role.edit' })}</Menu.Item>}
                  <Menu.Item onClick={async () => { await addToGroup(item.id); setCurrentHandleUserId(item.id) }} key="1">
                    {formatMessage({ id: 'users.add.to.group' })}
                  </Menu.Item>
                  {!adminUsers.includes(item.userName) && config.enableVC && <Menu.Item onClick={() => addVCForUser(item.id)} key="0">{formatMessage({ id: 'user.items.related.to.vc' })}</Menu.Item>}
                  {!adminUsers.includes(item.userName) && <Menu.Item onClick={() => { setCurrentHandleUserId(item.id); removeUser(item.id) }} key="2">
                    {formatMessage({ id: 'users.delete' })}</Menu.Item>}
                </Menu>}
            >
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                {formatMessage({ id: 'users.more' })} <DownOutlined />
              </a>
            </Dropdown> : <div>-</div>}
          </div>
        )
      }
    },
  ];

  const onPageNationChange: (page: number, pageSize?: number) => void = (pageNo, pageSize) => {
    fetchUsers({ pageSize, pageNo });
    setSelectRows([]);
    setCurrentPage(pageNo);
    setSelectRowKeys([]);
  }
  const onPageSizeChange = (pageSize: number) => {
    dispatch({
      type: 'users/changePageSize',
      payload: {
        pageSize,
      }
    });
    setCurrentPage(1);
    fetchUsers({
      pageNo: 1,
      pageSize,
    });
  }
  const clearRowSelection = () => {
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IUsers[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys);
    setSelectRows(selectedRows);
  }
  const handleMenuClick: ((param: ClickParam) => void) = (e) => {
    //
  }
  const fetchGroups = (search?: string) => {
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: search || '',
      }
    })
  }

  const removeUser = (userId?: number) => {

    confirm({
      title: formatMessage({ id: 'users.confirm.delete.title' }),
      icon: <ExclamationCircleOutlined />,
      content: formatMessage({ id: 'users.confirm.delete.content' }),
      okText: formatMessage({ id: 'users.confirm.delete.ok' }),
      cancelText: formatMessage({ id: 'users.confirm.delete.cancel' }),
      onOk() {
        starRemoveUsers(userId);
      },
      onCancel() {
        setCurrentHandleUserId(0);
      },
    })

  }
  const onSearch = (s: string) => {
    setCurrentPage(1)
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
  const onConfirmAddGroup = async () => {
    let selectedUserIds: number[];
    if (currentHandleUserId) {
      selectedUserIds = [currentHandleUserId]
    } else {
      selectedUserIds = selectRows.map(val => val.id);
    }
    const cancel = message.loading(formatMessage({ id: 'users.message.submitting' }));
    const res = await addUsersToGroups(selectedUserIds, selectedGroupId);
    cancel();
    if (res.success === true) {
      message.success(formatMessage({ id: 'users.message.success' }))
      setAddGroupModalVisible(false);
    }
  };
  const confirmAddRoleToUser = async () => {
    const res = await editRoleToUsers(currentHandleUserId, selectedRoleIds);
    if (res.success) {
      message.success(formatMessage({ id: 'users.message.edit.role.success' }));
      setCurrentHandleUserId(0);
      setCurrentUserRoles([]);
      setAddRoleForUserModalVisible(false);
    }
  }

  const confirmAddVCToUser = async () => {
    const { selectVcList } = vcTableRef.current!;
    const res = await editVC({ userId: currentHandleUserId, vcList: selectVcList });
    if (res.success) {
      message.success(formatMessage({ id: 'user.vc.modify.message.success' }))
      setCurrentHandleUserId(0);
      setVcModal(false);
    } else if (res.success === false) {
      Modal.confirm({
        title: formatMessage({ id: 'users.vc.modify.confirm.title' }),
        width: '500px',
        content: (<Descriptions column={2} title={formatMessage({ id: 'users.vc.modify.desc.title' })}>
          {
            res.activeJobs.map(job => {
              return (
                <>
                  <Descriptions.Item label={formatMessage({ id: 'users.vc.modify.confirm.content.jobName' })}>{job.jobName}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'users.vc.modify.confirm.content.jobId' })}>{job.jobId}</Descriptions.Item>
                </>
              )
            })
          }
        </Descriptions>),
        async onOk() {
          const res = await editVC({ userId: currentHandleUserId, vcList: selectVcList }, true);
          if (res.success) {
            message.success(formatMessage({ id: 'user.vc.modify.message.success' }))
            setCurrentHandleUserId(0);
            setVcModal(false);
          }
        },
        onCancel() {

        }
      })
    }
  }

  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/user/add">
            <Button type="primary">{formatMessage({ id: 'users.create.user' })}</Button>
          </Link>
          <Button type="primary" disabled={selectRows.length === 0} onClick={() => addToGroup()} style={{ margin: '0 20px' }}>{formatMessage({ id: 'users.add.to.group' })}</Button>
          <Button disabled={!!selectRows.find(val => adminUsers.includes(val.userName)) || selectRowKeys.length === 0} onClick={() => removeUser()}>{formatMessage({ id: 'users.delete.current.user' })}</Button>
          {/* <Dropdown disabled={selectRows.length === 0} overlay={menu}>
            <Button style={{marginLeft: '15px'}}>
              Actions <DownOutlined />
            </Button>
          </Dropdown> */}
        </div>

        <Search
          placeholder={formatMessage({ id: 'user.placeholder.search.users' })}
          onSearch={onSearch}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      <Table
        style={{ marginTop: '20px' }}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys,
          getCheckboxProps: (record) => {
            return {
              disabled: adminUsers.includes(record.userName),
            }
          }
        }}
        rowKey="id"
        dataSource={list}
        columns={columns}
        pagination={false}
        loading={tableLoading}
      />
      <div className={styles.bottom}>
        <div style={{ height: '24px', marginRight: '10px' }}>{formatMessage({ id: 'user.items.per.page' })}</div>
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
          style={{ marginTop: '20px' }}
          onChange={onPageNationChange}
          defaultCurrent={1}
          pageSize={pageSize}
          total={total}
          current={currentPage}
        />
      </div>
      <Modal
        visible={addGroupModalVisible}
        onCancel={() => setAddGroupModalVisible(false)}
        onOk={onConfirmAddGroup}
        title={formatMessage({ id: 'user.items.add.to.group' })}
        width="65%"
      >
        {
          addGroupModalVisible && <SelectGroup
            groupList={groupList}
            defaultSelected={userGroupId}
            onChange={(selectedGroupId) => onSelectedGroupChange(selectedGroupId)}
          />
        }

      </Modal>

      <Modal
        visible={addRoleForUserModalVisible}
        onOk={confirmAddRoleToUser}
        onCancel={() => { setAddRoleForUserModalVisible(false); setCurrentHandleUserId(0) }}
      >
        {
          addRoleForUserModalVisible && <SelectRole
            currentUserId={currentHandleUserId}
            onChange={(selectedRoleIds) => setSelectedRoleIds(selectedRoleIds)}
            currentUserRoles={currentUserRoles}
          />
        }

      </Modal>

      {vcModal && <Modal
        title={formatMessage({ id: 'user.items.related.to.vc' })}
        visible={vcModal}
        onOk={confirmAddVCToUser}
        onCancel={() => setVcModal(false)}
        destroyOnClose
        width="60%"
      >
        <VCTable currentHandleUserId={currentHandleUserId} ref={vcTableRef} />
      </Modal>}

    </PageHeaderWrapper>
  )
};

export default connect(({ users, groups, config, user }: ConnectState) => ({ users, groups, config, user }))(Form.create<FormComponentProps & ConnectProps>()(List));
