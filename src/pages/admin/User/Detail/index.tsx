import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { PageHeader, Table, Input, message, Modal, InputNumber } from 'antd';
import { router } from 'umi';
import { useParams } from 'react-router-dom';
import { FormComponentProps } from 'antd/lib/form';
import { formatMessage } from 'umi-plugin-react/locale';
import { ColumnProps } from 'antd/es/table';
import {
  getUserById, resetPassword as apiResetPassword, editUserInfo, removeUserRole, getUserRoleInfo, getUserGroups,
  getUserVc
} from '@/services/users';
import { removeGroupUser } from '@/services/groups';
import { ConnectState, ConnectProps } from '@/models/connect';
import { IRoleListItem } from '@/models/roles';
import { IUsers } from '@/models/users';
import { emailReg, mobilePattern, textPattern, userNamePattern } from '@/utils/validates';
import { IGroup } from '../../Groups/List';
import styles from './index.less';

const FormItem = Form.Item;

const UserDetail: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, config, user }) => {
  const { id } = useParams();
  const { currentUser } = user;
  const { adminUsers } = config;
  const { getFieldDecorator, validateFields } = form;
  const userId = Number(id);
  const [userInfo, setUserInfo] = useState<IUsers>({ userName: '', nickName: '', id: 0 });
  const [roleInfo, setRoleInfo] = useState<IRoleListItem[]>([]);
  const [groupInfo, setGroupInfo] = useState<IGroup[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pageParmas, setPageParmas] = useState({ pageNum: 1, pageSize: 10 });
  const [userVcList, setUserVcList] = useState([]);
  const [vcTotal, setVcTotal] = useState(0);
  const fetchUserById = async () => {
    if (isNaN(userId)) return;
    const res = await getUserById(userId);
    if (res.success) {
      setUserInfo(res.user);
    }
  }
  const fetchUserRoles = async () => {
    if (isNaN(userId)) return;
    const res = await getUserRoleInfo(userId);
    if (res.success) {
      setRoleInfo(res.list)
    }
  }
  const fetchUserGroups = async () => {
    if (isNaN(userId)) return;
    const res = await getUserGroups(userId);
    if (res.success) {
      setGroupInfo(res.list)
    }
  }
  const editCurrentUser = () => {
    setIsEditing(true);
  }
  const saveEditing = () => {
    validateFields(async (err, values) => {
      if (err) return;
      const cancel = message.loading(formatMessage({id: 'users.message.submitting'}));
      for (const key in values) {
        if (!values[key]) {
          values[key] = '';
        }
      }
      values.jobMaxTimeSecond = values.jobMaxTimeSecond * 3600;
      const res = await editUserInfo(userId, values);
      cancel();
      if (res.success) {
        message.success(formatMessage({id: 'users.message.edit.user.success'}));
        fetchUserById();
      }
      setIsEditing(false);
    })
  }
  const removeRoleForUser = (roleId: number, roleName: string) => {
    Modal.confirm({
      title: `${formatMessage({id: 'users.detail.remove.title1'})} ${roleName} ${formatMessage({id: 'users.detail.remove.title2'})}`,
      async onOk() {
        const res = await removeUserRole(userId, roleId);
        if (res.success) {
          fetchUserById();
          fetchUserRoles();
          message.success(`${formatMessage({id: 'users.detail.message.success.delete'})} ${roleName} `)
        }
      }
    })
  }
  const removeGroupForUser = (groupId: number, groupName: string) => {
    Modal.confirm({
      title: `${formatMessage({id: 'users.detail.remove.title1'})} ${groupName} ${formatMessage({id: 'users.detail.remove.title2'})}`,
      async onOk() {
        const res = await removeGroupUser(groupId, userId);
        if (res.success) {
          fetchUserById();
          fetchUserGroups();
          message.success(`${formatMessage({id: 'users.detail.message.success.delete'})} ${groupName} `)
        }
      }
    })
  }
  const fetchUserVcList = async () => {
    const res = await getUserVc(userId, pageParmas);
    const { success, list, total } = res;
    if (success) {
      setUserVcList(list);
      setVcTotal(total);
    }
  }

  useEffect(() => {
    if (isNaN(Number(id))) {
      router.push('/admin/user/list')
    }
  }, [id]);

  useEffect(() => {
    fetchUserById();
    fetchUserRoles();
    fetchUserGroups();
  }, [])

  useEffect(() => {
    fetchUserVcList();
  }, [pageParmas])

  const resetPassword = () => {
    setModalVisible(true);
  }

  const confirmEditPassword = () => {
    validateFields(['newPassword', 'confirmNewPassword'], async (err, result) => {
      if (err) return;
      const { newPassword } = result;
      const res = await apiResetPassword(id, newPassword);
      if (res.success) {
        message.success(formatMessage({id: 'users.detail.message.success.reset.password'}));
        setModalVisible(false);
      }
    });
  }

  const userInfoColumns: ColumnProps<IUsers>[] = [
    {
      title: formatMessage({id: 'users.nickName'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('nickName', {
                  initialValue: item.nickName,
                  rules: [
                    { required: true, message: formatMessage({id: 'users.add.form.nickName.required'}) },
                    { max: 20, message: formatMessage({id: 'users.add.form.nickName.max'}) },
                    textPattern
                  ]
                })(
                  <Input />
                )
              }
            </FormItem>

          )
        }
        return (
          <div>{item.nickName || '-'}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.userName'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('userName', {
                  initialValue: item.userName,
                  rules: [userNamePattern, { min: 4, message: formatMessage({id: 'users.add.form.userName.min'}) },
                  { max: 20, message: formatMessage({id: 'users.add.form.userName.max'}) }]
                })(
                  <Input disabled />
                )
              }
            </FormItem>
          )
        }
        return (
          <div>{item.userName}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.phone'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('phone', {
                  initialValue: item.phone || '',
                  rules: [mobilePattern]
                })(
                  <Input />
                )
              }
            </FormItem>

          )
        }
        return (
          <div>{item.phone || '-'}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.jobMaxTimeSecond'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('jobMaxTimeSecond', {
                  initialValue: (item.jobMaxTimeSecond || 0) / 3600 || undefined,
                })(
                  <InputNumber precision={0} />
                )
              }
            </FormItem>

          )
        }
        return (
          <div>{item.jobMaxTimeSecond || '-'}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.email'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('email', {
                  initialValue: item.email || '',
                  rules: [
                    { pattern: emailReg, message: formatMessage({id: 'users.add.form.email.pattern'})}
                  ]
                })(
                  <Input />
                )
              }
            </FormItem>

          )
        }
        return (
          <div>{item.email || '-'}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.description'}),
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {getFieldDecorator('note', {
                initialValue: item.note || '',
                rules: [textPattern]
              })(<Input />)}
            </FormItem>

          )
        }
        return (
          <div>{item.note || '-'}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.detail.user.action'}),
      align: 'center',
      render() {
        if (isEditing) {
          return (
            <>
              <a onClick={saveEditing} style={{ marginRight: 10 }}>
                {formatMessage({id: 'users.detail.save'})}
              </a>
              <a onClick={() => setIsEditing(false)}>
                {formatMessage({id: 'users.detail.cancel'})}
              </a>
            </>
          )
        }
        const currentRole = currentUser?.currentRole;
        return (
          <div>
            <a style={{marginRight: '15px'}} onClick={editCurrentUser}>
              {formatMessage({id: 'users.detail.edit'})}
            </a>
            <a onClick={resetPassword}>
              {formatMessage({id: 'users.detail.reset.password'})}
            </a>
          </div>
        )
      }
    }
  ]

  const userRoleColumns: ColumnProps<IRoleListItem>[] = [
    {
      title: formatMessage({id: 'users.detail.role.name'}),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({id: 'users.detail.role.description'}),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: formatMessage({id: 'users.detail.role.type'}),
      render(_text, item) {
        return (
        <div>{item.isPreset ? formatMessage({id: 'users.detail.role.preset'}) : formatMessage({id: 'users.detail.role.custom'})}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'users.detail.role.action'}),
      render(_text, item) {
        if (adminUsers.includes(userInfo.userName)) {
          return <div>-</div>;
        }
        return (
          <a onClick={() => removeRoleForUser(item.id, item.name)}>
            {formatMessage({id: 'users.detail.role.remove'})}
          </a>
        )
      }
    },
  ]

  const userGroupColumns: ColumnProps<IGroup>[] = [
    {
      title: formatMessage({id: 'users.detail.group.name'}),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({id: 'users.detail.group.note'}),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: formatMessage({id: 'users.detail.group.action'}),
      render(_text, item) {
        return (
          <a onClick={() => removeGroupForUser(item.id, item.name)}>
            {formatMessage({id: 'users.detail.group.remove'})}
          </a>
        )
      }
    }
  ]

  const getDeviceTypeContent = (v: string, isNum?: boolean, isMetadata?: boolean) => {
    const val = JSON.parse(v);
    const keys = Object.keys(val);
    let content = null;
    if (keys.length) {
      isNum ? content = keys.map(i => <p>{isMetadata ? val[i].user_quota : val[i]}</p>) : content = keys.map(i => <p>{i}</p>)
    }
    return content;
  }

  const vcListColumns = [
    {
      title: formatMessage({id: 'user.vc.VCName'}),
      dataIndex: 'vcName',
    },
    {
      title: formatMessage({id: 'user.vc.DeviceType'}),
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i)
    },
    {
      title: formatMessage({id: 'user.vc.DeviceCount'}),
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i, true)
    },
    {
      title: formatMessage({id: 'user.vc.MaxAvailable'}),
      dataIndex: 'metadata',
      render: (i: string) => getDeviceTypeContent(i, true, true)
    }
  ]

  

  const pageParmasChange = (page: any, count: any) => {
    setPageParmas({ pageNum: page, pageSize: count });
  };

  return (
    <div className={styles.detailWrap}>
      <PageHeader
        className="site-page-header"
        onBack={() => router.push('/admin/user/list')}
        title={formatMessage({id: 'users.detail.title'})}
        subTitle=""
      />

      <Table
        columns={userInfoColumns}
        title={() => (<h1>{formatMessage({id: 'users.detail.title.userInfo'})}</h1>)}
        dataSource={[userInfo]}
        pagination={false}
      />

      <Table
        columns={vcListColumns}
        title={() => <h1>{formatMessage({id: 'user.vc.detail.title'})}</h1>}
        dataSource={userVcList}
        pagination={{
          total: vcTotal,
          onChange: pageParmasChange,
          current: pageParmas.pageNum,
          pageSize: pageParmas.pageSize
        }}
      />

      <Table
        columns={userRoleColumns}
        title={() => <h1>{formatMessage({id: 'users.detail.title.role'})}</h1>}
        dataSource={roleInfo}
      />

      <Table
        columns={userGroupColumns}
        title={() => <h1>{formatMessage({id: 'users.detail.title.group'})}</h1>}
        dataSource={groupInfo}
      />

      {
        modalVisible && <Modal
          visible={modalVisible}
          onCancel={() => { setModalVisible(false) }}
          onOk={confirmEditPassword}

        >
          <FormItem label={formatMessage({id: 'users.detail.form.newPassword'})}>
            {
              getFieldDecorator('newPassword', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({id: 'users.detail.form.newPassword.required'}),
                  },
                  {
                    min: 6,
                    message: formatMessage({id: 'users.detail.form.newPassword.min'}),
                  },
                  {
                    max: 20,
                    message: formatMessage({id: 'users.detail.form.newPassword.max'}),
                  }
                ]
              })(
                <Input type = 'password'/>
              )
            }
          </FormItem>
          <FormItem label={formatMessage({id: 'users.detail.form.confirm.password'})} hasFeedback>
            {
              getFieldDecorator('confirmNewPassword', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({id: 'users.detail.form.confirm.password.required'}),
                  },
                  {
                    validator: async (rule, value, callback) => {
                      if (value && value !== form.getFieldValue('newPassword')) {
                        callback(formatMessage({id: 'users.detail.form.confirm.password.error'}));
                      } else {
                        callback();
                      }
                    }
                  }
                ]
              })(
                <Input  type = 'password'/>
              )
            }
          </FormItem>

        </Modal>
      }

    </div>
  )
}



export default connect(({ users, groups, roles, config, user }: ConnectState) => ({ users, groups, roles, config, user }))(Form.create<FormComponentProps & ConnectProps>()(UserDetail))
