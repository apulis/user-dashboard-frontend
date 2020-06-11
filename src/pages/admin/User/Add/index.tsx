import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Col, Row, message, Breadcrumb, Checkbox, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { connect } from 'dva';
import router from 'umi/router';
import { ConnectProps, ConnectState } from '@/models/connect';
import { validateUniqueUserName, emailReg, mobilePattern, textPattern } from '@/utils/validates';
import EditTable from './EditTable';
import styles from './index.less';
import { createUsers } from '@/services/users';
import { IRoleListItem } from '@/models/roles';
import { ColumnProps } from 'antd/lib/table';

const FormItem = Form.Item;

export interface IUserMessage {
  nickName: string;
  userName: string;
  phone?: string;
  email?: string;
  password?: string;
  note?: string;
  createTime: number;
}

export const generatePassword: () => string = () => {
  return Math.random().toString(36).slice(-8);
}

const newUser: () => IUserMessage = () => {
  return {
    nickName: '',
    userName: '',
    phone: '',
    email: '',
    note: '',
    createTime: new Date().getTime(),
  }
}

const Add: React.FC<FormComponentProps & ConnectProps & ConnectState> = props => {
  const { form: { getFieldDecorator, validateFields, getFieldsValue, setFieldsValue }, roles, dispatch } = props;
  const [userMessage, setUserMessage] = useState<IUserMessage[]>([newUser()]);
  const [selectedUserRole, setSelectedUserRole] = useState<number[]>([]);
  const [step, setStep] = useState<number>(1);
  const [isEditingTableEditing, setIsEditingTableEditing] = useState<boolean>(false);
  const formItemLayout = {
    labelCol: {
      xs: { span: 21 },
      sm: { span: 21 },
    },
    wrapperCol: {
      xs: { span: 21 },
      sm: { span: 21 },
    },
  };
  const fetchRoles = (pageSize?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: 1,
        pageSize: pageSize || 20,
      }
    })
  }
  useEffect(() => {
    fetchRoles();
  }, [])

  const { total: roleTotal } = roles;
  const rolesList: IRoleListItem[] = roles.list;
  const userRoleOptions = rolesList.map((r) => {
    return {
      label: r.name,
      value: r.id,
    }
  })
  useEffect(() => {
    if (roleTotal > 20) {
      fetchRoles(roleTotal)
    }
  }, [roleTotal])


  const submitUser = async (userMessage: IUserMessage[], userRole: number[]) => {
    const hide = message.loading('Submiting...');
    const res = await createUsers({
      userMessage,
      userRole,
    });
    if (res.success === true) {
      hide();
      message.success('Success create users');
      router.push('/admin/user/list');
      return;
    } else if (res.success === false) {
      if (res.conflictedUserName && res.conflictedUserName.length > 0) {
        res.conflictedUserName.forEach((dpc: any) => {
          message.error(`User ${dpc.userName} is already existed!`);
        })
      }
    }
    hide();
  }

  const submit = () => {
    validateFields((err, result) => {
      if (!err) {
        if (step === 1) {
          const userMessage: IUserMessage[] = result.userMessage;
          userMessage.forEach(val => {
            val.password = generatePassword();
          })
          setUserMessage(userMessage);
          setStep(step + 1);
        } else if (step === 2) {
          const { role } = result;
          setSelectedUserRole(role);
          setStep(step + 1)
        } else if (step === 3) {
          submitUser(userMessage, selectedUserRole)
        } 
        
      }
    })
  };
  const removeUser = (createTime: number) => {
    const currentFormUserMessage: IUserMessage[] = getFieldsValue().userMessage;
    if (currentFormUserMessage.length === 1) {
      message.warn('Should keep at least one user')
      return;
    }
    currentFormUserMessage.forEach((item, index) => {
      item.createTime = userMessage[index].createTime;
    })
    const restUserMessage = currentFormUserMessage.filter((user, i) => user.createTime !== createTime);
    setUserMessage(restUserMessage);
    setFieldsValue({
      userMessage: restUserMessage,
    });
  }
  const addUser = () => {
    if (userMessage.length >= 10) {
      message.warn('maximum user is 10');
      return;
    }
    setUserMessage([...userMessage].concat(newUser()))
  }
  const onEditTableDataChange = (data: IUserMessage[]) => {
    setUserMessage([...data]);
  }
  const onEditTableStatusChange = (isEditing: boolean) => {
    setIsEditingTableEditing(isEditing);
  }
  const removeSelectRole = (id: number) => {
    const s = selectedUserRole.filter(s => s !== id)
    setSelectedUserRole(s); 
  }
  const userRoleColumn: ColumnProps<IRoleListItem>[] = [
    {
      title: 'Role',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Description',
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: 'Type',
      render(_text, item) {
        return (
          item.isPreset ? 'Preset': 'Custom'
        )
      }
    },
    {
      title: 'Action',
      render(_text, item) {
        return (
          <a onClick={() => removeSelectRole(item.id)}>Remove</a>
        )
      }
    },
  ];
  const userRoleDataSource = selectedUserRole.map(s => {
    let result;
    rolesList.forEach(r => {
      if (s === r.id) {
        result = r;
      }
    })
    return result;
  })
  const toPrevious = () => {
    if (step === 2) {
      const role = getFieldsValue().role || [];
      setSelectedUserRole(role);
    }
    setStep(step - 1);
  }
  return (
    <PageHeaderWrapper>
    <div className={styles.add}>
      <Breadcrumb style={{marginBottom: '16px'}}>
        { step >= 1 && <Breadcrumb.Item>
          1. User Info
        </Breadcrumb.Item> }
        { step >= 2 && <Breadcrumb.Item>
          2. Role
        </Breadcrumb.Item> }
        { step >= 3 && <Breadcrumb.Item>
          3. Preview
        </Breadcrumb.Item> }
      </Breadcrumb>
      { step === 1 && <div className="step-1">
        <Row>
          <Col span={4}>
            Nickname *
          </Col>
          <Col span={4}>
            Username *
          </Col>
          <Col span={4}>
            Phone
          </Col>
          <Col span={4}>
            Email
          </Col>
          <Col span={4}>
            Notes
          </Col>
        </Row>
        {
          userMessage.map((user, index) => (
            <div key={user.createTime}>
              <Row>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].nickName`, {
                      initialValue: userMessage[index].nickName,
                      rules: [
                        { required: true, message: 'Nickname is required'},
                        { min: 4, message: 'Nickname need at least 4 characters' },
                        { max: 20, message: 'Nickname cannot be longer than 20 characters' },
                        textPattern
                      ],
                    })(<Input placeholder="nickName" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].userName`, {
                      initialValue: userMessage[index].userName,
                      rules: [
                        { required: true, message: 'Username is required'},
                        { min: 4, message: 'Username need at least 4 characters' },
                        { max: 20, message: 'Username cannot be longer than 20 characters' },
                        textPattern,
                        { validator: (...args) => {
                            const newArgs = args.slice(0, 4);
                            validateUniqueUserName(index, getFieldsValue().userMessage, ...newArgs)
                          }
                        }
                      ],
                    })(<Input placeholder="userName" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].phone`, {
                      initialValue: userMessage[index].phone,
                      rules: [mobilePattern]
                    })(<Input placeholder="phone" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].email`, {
                      initialValue: userMessage[index].email,
                      rules: [
                        { pattern: emailReg, message: 'please check email format' }
                      ]
                    })(<Input placeholder="email" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].note`, {
                      initialValue: userMessage[index].note,
                      rules: [textPattern]
                    })(<Input placeholder="note" />)}
                  </FormItem>
                </Col>
                <Col style={{marginTop: '8px'}} span={2}><a onClick={() => removeUser(user.createTime) }>Remove</a></Col>
              </Row>
            </div>
          ))
        }
        <Button onClick={addUser}>ADD USER</Button><span style={{display: 'inline-block', marginLeft: '10px', marginTop: '20px'}}>maximum is 10</span>
      </div> }
      { step === 2 &&
        <div className="step-2">
          <FormItem>
          {
              getFieldDecorator('role', {
                initialValue: selectedUserRole,
                rules: [
                  { required: true, message: 'Need choose at least one role' }
                ]
              })(<Checkbox.Group style={{ width: '100%'}}>
              <Row>
                {
                  userRoleOptions.map(r => (
                    <Col span={8}>
                      <Checkbox style={{marginTop: '4px', marginBottom: '4px'}} value={r.value}>{r.label}</Checkbox>
                    </Col>
                  ))
                }
              </Row>
            </Checkbox.Group>)
            }
          </FormItem>
        </div>
      }
      {
        step === 3 &&
        <div className="step-3">
          <EditTable 
            dataSource={userMessage}
            onChange={onEditTableDataChange}
            onStatusChange={onEditTableStatusChange}
          />
          <Table
            columns={userRoleColumn}
            dataSource={userRoleDataSource}
          />
        </div>
      }
      <div style={{marginTop: '40px'}}>
        {
          step !== 1 &&
          <Button disabled={isEditingTableEditing} onClick={toPrevious} style={{ marginRight: '20px' }}>Previous</Button>
        }
        <Button disabled={isEditingTableEditing} onClick={submit} type="primary">{step === 3 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Form.create<FormComponentProps & ConnectProps>()(Add))