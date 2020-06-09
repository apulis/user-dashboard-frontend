import React, { useState, useEffect } from 'react';
import { Input, Table, Col, Button, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { useParams } from 'react-router-dom';
import { PageHeader } from 'antd';
import router from 'umi/router';

import { ColumnProps } from 'antd/es/table';

import { ConnectProps, ConnectState } from '@/models/connect';
import { FormComponentProps } from 'antd/lib/form';

import { getGroupDetail, getGroupRoles, getGroupUsers, editGroupDetail, removeGroupRole, removeGroupUser } from '@/services/groups';

const FormItem = Form.Item;

interface IGroupUserInfo {
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
  const { getFieldDecorator, validateFields } = form;
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
      message.success('Success delete role');
      fetchGroupRoles(Number(id));
    }
  }

  const removeUser = async (userId: number) => {
    const res = await removeGroupUser(Number(id), userId);
    if (res.success) {
      message.success('Success delete user');
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
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Role Type',
      render(_text, item) {
        return (
          <div>{item.isPreset ? 'Preset Role' : 'Custom Role'}</div>
        )
      }
    },
    {
      title: 'Action',
      dataIndex: '',
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeRole(item.id)}>Remove</a>
          </div>
        )
      }
    },
  ]



  const usersColumns: ColumnProps<any>[] = [
    {
      title: 'NickName',
      dataIndex: 'nickName',
      key: 'nickName'
    },
    {
      title: 'UserName',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: 'Action',
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeUser(item.id)}>Remove</a>
          </div>
        )
      }
    },
  ];
  const confirmEditing = async () => {
    validateFields(['name', 'note'], async (err, values) => {
      if (err) return
      const res = await editGroupDetail(Number(id), {
        name: values.name,
        note: values.note,
      })
      if (res.success) {
        message.success('Edit success');
        setIsGroupInfoEditing(false);
        fetchGroupDetail(Number(id));
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
            <FormItem label="Group Name">
              {
                getFieldDecorator('name', {
                  rules: [{
                    required: true,
                  }],
                  initialValue: groupInfo.name
                })(
                  <Input />
                )
              }
            </FormItem>
            
            <FormItem label="Description">
              {
                getFieldDecorator('note', {
                  rules: [{
                    required: true,
                  }],
                  initialValue: groupInfo.note
                })(
                  <Input />
                )
              }
            </FormItem>
          </>
          :
          <>
            <div><span>Group Name: </span>{groupInfo.name}</div>
            <div><span>Description: </span>{groupInfo.note}</div>
          </>
          
        }
        <div>
          {
            isGroupInfoEditing ? 
            <>
              <Button onClick={confirmEditing} type="primary">CONFIRM</Button>
              <Button onClick={toggleEditing}>CANCEL</Button>
            </>
            :
            <a onClick={toggleEditing}>Edit</a>
          }
        </div>
      </div>

      <Table columns={roleColumns} dataSource={groupRoleDataSource} title={() => <h2>Role:</h2>} />

      <Table columns={usersColumns} dataSource={groupUserDataSource} title={() => <h2>User:</h2>}/>

    </>
  )
}

export default connect(({ roles }: ConnectState) => ({roles}))(Form.create()(Detail));