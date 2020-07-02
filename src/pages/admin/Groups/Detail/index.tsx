import React, { useState, useEffect } from 'react';
import { Input, Table, Button, message } from 'antd';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { useParams } from 'react-router-dom';
import { PageHeader } from 'antd';
import router from 'umi/router';
import { ColumnProps } from 'antd/es/table';
import { ConnectState } from '@/models/connect';
import { FormComponentProps } from 'antd/lib/form';
import { getGroupDetail, getGroupRoles, getGroupUsers, editGroupDetail, removeGroupRole, removeGroupUser } from '@/services/groups';
import { textPattern } from '@/utils/validates';
import { formatMessage } from 'umi-plugin-react/locale';
import { formatNumber } from 'umi-types/locale';

const FormItem = Form.Item;

export interface IGroupUserInfo {
  userName: string;
  password: string;
  nickName: string;
  phone: string;
  email: string;
  id: number;
  note: string;
}

interface IGroupRoleInfo {
  name: string;
  note: string;
  isPreset: number;
}

const Detail: React.FC<FormComponentProps> = ({ form }) => {
  const { id } = useParams();
  const { getFieldDecorator, validateFields, getFieldValue } = form;
  const [isGroupInfoEditing, setIsGroupInfoEditing] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{name?: string; note?: string}>({});
  const [groupUserDataSource, setGroupUserDataSorce] = useState<IGroupUserInfo[]>([]);
  const [groupRoleDataSource, setGroupRoleDataSouce] = useState<IGroupRoleInfo[]>([]);
  useEffect(() => {
    if (isNaN(Number(id))) {
      router.push('/admin/group/list')
    }
  }, [id])
  const fetchGroupDetail = async (groupId: number) => {
    const res = await getGroupDetail(groupId);
    if (res.success) {
      setGroupInfo(res.data);
    }
  }

  const fetchGroupUsers = async (groupId: number) => {
    const res = await getGroupUsers(groupId);
    if (res.success) {
      const data = res.list;
      data.forEach((val: IGroupUserInfo) => {
        for (const key in val) {
          if (!val[key]) {
            val[key] = '-';
          }
        }
      })
      setGroupUserDataSorce(res.list);
    }
  }

  const fetchGroupRoles = async (groupId: number) => {
    const res = await getGroupRoles(groupId);
    if (res.success) {
      setGroupRoleDataSouce(res.list);
    }
  }

  const removeRole = async (roleId: number) => {
    const res = await removeGroupRole(Number(id), roleId);
    if (res.success) {
      message.success(formatMessage({id: 'groups.detail.message.success.delete.role'}));
      fetchGroupRoles(Number(id));
    }
  }

  const removeUser = async (userId: number) => {
    const res = await removeGroupUser(Number(id), userId);
    if (res.success) {
      message.success(formatMessage({id: 'groups.detail.message.success.delete.user'}));
      fetchGroupUsers(Number(id));
    }
  }
  useEffect(() => {
    if (id) {
      const groupId = Number(id);
      fetchGroupDetail(groupId);
      fetchGroupUsers(groupId);
      fetchGroupRoles(groupId);
    }
  }, [])


  const roleColumns: ColumnProps<any>[] = [
    {
      title: formatMessage({id: 'groups.detail.role.role'}),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({id: 'groups.detail.role.description'}),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: formatMessage({id: 'groups.detail.role.description'}),
      render(_text, item) {
        return (
          <div>{item.isPreset ? formatMessage({id: 'groups.detail.role.type.preset'}) : formatMessage({id: 'groups.detail.role.type.custom'})}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'groups.detail.role.action'}),
      dataIndex: '',
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeRole(item.id)}>
              {formatMessage({id: 'groups.detail.role.remove'})}
            </a>
          </div>
        )
      }
    },
  ]



  const usersColumns: ColumnProps<any>[] = [
    {
      title: formatMessage({id: 'users.nickName'}),
      dataIndex: 'nickName',
      key: 'nickName'
    },
    {
      title: formatMessage({id: 'users.userName'}),
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: formatMessage({id: 'users.phone'}),
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: formatMessage({id: 'users.email'}),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: formatMessage({id: 'users.description'}),
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: formatMessage({id: 'groups.detail.role.action'}),
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeUser(item.id)}>
              {formatMessage({id: 'groups.detail.role.remove'})}
            </a>
          </div>
        )
      }
    },
  ];
  const confirmEditing = async () => {
    if (getFieldValue('name') === groupInfo.name && getFieldValue('note') === groupInfo.note) {
      setIsGroupInfoEditing(false);
      return;
    }
    validateFields(['name', 'note'], async (err, values) => {
      if (err) return
      const res = await editGroupDetail(Number(id), {
        name: values.name,
        note: values.note,
      })
      if (res.success) {
        message.success(formatMessage({id: 'groups.detail.role.message.edit.success'}));
        setIsGroupInfoEditing(false);
        fetchGroupDetail(Number(id));
      } else if (res.success === false) {
        message.error(formatMessage({id: 'groups.detail.role.message.edit.dup'}))
      }
    });
    
  }
  const toggleEditing = () => {
    setIsGroupInfoEditing(!isGroupInfoEditing);
  }
  
  return (
    <>
      <div className="group-info">
      <PageHeader
        className="site-page-header"
        onBack={() => router.push('/admin/group/list')}
        title="User Groups"
        subTitle=""
      />
        <h2>Group Info</h2>
        {
          isGroupInfoEditing ?
          <>
            <FormItem label={formatMessage({id: 'groups.add.groupName'})}>
              {
                getFieldDecorator('name', {
                  rules: [
                    { required: true},
                    textPattern,
                    { max: 20 },
                  ],
                  initialValue: groupInfo.name
                })(
                  <Input />
                )
              }
            </FormItem>
            
            <FormItem label={formatMessage({id: 'groups.add.note'})}>
              {
                getFieldDecorator('note', { 
                  rules: [{ required: true, message: formatMessage({id: 'groups.add.form.group.note.required'}) }, textPattern, { max: 50, message: formatMessage({id: 'groups.add.form.group.note.max'})}],
                  initialValue: groupInfo.note
                })(
                  <Input />
                )
              }
            </FormItem>
          </>
          :
          <>
            <div><span>{formatMessage({id: 'groups.detail.groupName'})} </span>{groupInfo.name}</div>
            <div><span>{formatMessage({id: 'groups.detail.Description'})} </span>{groupInfo.note}</div>
          </>
          
        }
        <div>
          {
            isGroupInfoEditing ? 
            <>
              <Button style={{marginRight: '20px'}} onClick={confirmEditing} type="primary">
                {
                  formatMessage({id: 'groups.detail.save'})
                }
              </Button>
              <Button onClick={toggleEditing}>
                {
                  formatMessage({id: 'groups.detail.cancel'})
                }
              </Button>
            </>
            :
            <a onClick={toggleEditing}>
              {formatMessage({id: 'groups.detail.edit'})}
            </a>
          }
        </div>
      </div>

        <Table columns={roleColumns} dataSource={groupRoleDataSource} title={() => <h2>{formatMessage({id: 'groups.detail.table.role'})}</h2>} />

        <Table columns={usersColumns} dataSource={groupUserDataSource} title={() => <h2>{formatMessage({id: 'groups.detail.table.user'})}</h2>}/>
    </>
  )
}

export default connect(({ roles }: ConnectState) => ({roles}))(Form.create()(Detail));