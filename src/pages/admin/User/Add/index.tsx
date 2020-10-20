import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Col, Row, message, Breadcrumb, Checkbox, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import router from 'umi/router';
import { ConnectProps, ConnectState } from '@/models/connect';
import { validateUniqueUserName, emailReg, mobilePattern, textPattern, userNamePattern } from '@/utils/validates';
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

// const warn = throttle(message.warn, 3000, { trailing: false });

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
    const hide = message.loading(formatMessage({id: 'users.message.submitting'}));
    const res = await createUsers({
      userMessage,
      userRole,
    });
    if (res.success === true) {
      hide();
      message.success(formatMessage({id: 'users.add.message.success.create.user'}));
      router.push('/admin/user/list');
      return;
    } else if (res.success === false) {
      if (res.conflictedUserName && res.conflictedUserName.length > 0) {
        res.conflictedUserName.forEach((dpc: any) => {
          message.error(`${formatMessage({id: 'users.add.message.user'})} ${dpc.userName} ${formatMessage({id: 'users.add.message.already.existed'})}`);
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
      message.warn(formatMessage({id: 'users.add.message.keep.one.user'}));
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
      message.warn(formatMessage({id: 'users.add.message.maximum'}));
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
    if (selectedUserRole.length <= 1) {
      message.warn(formatMessage({id: 'users.add.message.need.one.role'}));
      return;
    }
    const s = selectedUserRole.filter(s => s !== id);
    setSelectedUserRole(s); 
  }
  const userRoleColumn: ColumnProps<IRoleListItem>[] = [
    {
      title: formatMessage({id: 'users.add.userRole.role'}),
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: formatMessage({id: 'users.add.userRole.description'}),
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: formatMessage({id: 'users.add.userRole.type'}),
      render(_text, item) {
        return (
          item.isPreset ? formatMessage({id: 'users.add.userRole.type.preset'}): formatMessage({id: 'users.add.userRole.type.custom'})
        )
      }
    },
    {
      title: formatMessage({id: 'users.add.userRole.action'}),
      render(_text, item) {
        return (
          <a onClick={() => removeSelectRole(item.id)}>{formatMessage({id: 'users.add.userRole.remove'})}</a>
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
          1. {formatMessage({id: 'users.add.steps.userInfo'})}
        </Breadcrumb.Item> }
        { step >= 2 && <Breadcrumb.Item>
          2. {formatMessage({id: 'users.add.steps.role'})}
        </Breadcrumb.Item> }
        { step >= 3 && <Breadcrumb.Item>
          3. {formatMessage({id: 'users.add.steps.preview'})}
        </Breadcrumb.Item> }
      </Breadcrumb>
      { step === 1 && <div className="step-1">
        <Row>
          <Col span={4}>
            {formatMessage({id: 'users.nickName'})} *
          </Col>
          <Col span={4}>
            {formatMessage({id: 'users.userName'})} *
          </Col>
          <Col span={4}>
            {formatMessage({id: 'users.phone'})}
          </Col>
          <Col span={4}>
            {formatMessage({id: 'users.email'})}
          </Col>
          <Col span={4}>
            {formatMessage({id: 'users.description'})}
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
                        { required: true, message: formatMessage({id: 'users.add.form.nickName.required'})},
                        { max: 20, message: formatMessage({id: 'users.add.form.nickName.max'}) },
                        textPattern
                      ],
                    })(<Input placeholder={formatMessage({id: 'users.nickName'})} />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].userName`, {
                      initialValue: userMessage[index].userName,
                      rules: [
                        { required: true, message: formatMessage({id: 'users.add.form.userName.required'})},
                        { min: 4, message: formatMessage({id: 'users.add.form.userName.min'}) },
                        { max: 20, message: formatMessage({id: 'users.add.form.userName.max'}) },
                        userNamePattern,
                        { validator: (...args) => {
                            const newArgs = args.slice(0, 4);
                            validateUniqueUserName(index, getFieldsValue().userMessage, ...newArgs)
                          }
                        }
                      ],
                    })(<Input placeholder={formatMessage({id: 'users.userName'})} />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].phone`, {
                      initialValue: userMessage[index].phone,
                      rules: [mobilePattern]
                    })(<Input placeholder={formatMessage({id: 'users.phone'})} />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].email`, {
                      initialValue: userMessage[index].email,
                      rules: [
                        { pattern: emailReg, message: formatMessage({id: 'users.add.form.email.pattern'}) },
                        { max: 50, message: formatMessage({id: 'users.add.form.email.max'}) }
                      ]
                    })(<Input placeholder={formatMessage({id: 'users.email'})} />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].note`, {
                      initialValue: userMessage[index].note,
                      rules: [textPattern, {
                        max: 50,
                        message: formatMessage({id: 'users.add.form.note.max'})
                      }]
                    })(<Input placeholder={formatMessage({id: 'users.description'})} />)}
                  </FormItem>
                </Col>
                  <Col style={{marginTop: '8px'}} span={2}><a onClick={() => removeUser(user.createTime) }>{formatMessage({id: 'users.add.form.removeUser'})}</a></Col>
              </Row>
            </div>
          ))
        }
        <Button onClick={addUser}>{formatMessage({id: 'users.add.addUser'})}</Button><span style={{display: 'inline-block', marginLeft: '10px', marginTop: '20px'}}>{formatMessage({id: 'users.add.maximum'})}</span>
      </div> }
      { step === 2 &&
        <div className="step-2">
          <FormItem>
          {
              getFieldDecorator('role', {
                initialValue: selectedUserRole,
                rules: [
                  { required: true, message: formatMessage({id: 'users.add.role.form.required'}) }
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
          <h2>{formatMessage({id: 'users.add.step3.title1'})}</h2>
          <EditTable 
            dataSource={userMessage}
            onChange={onEditTableDataChange}
            onStatusChange={onEditTableStatusChange}
          />
          <h2 style={{marginTop: '50px'}}>{formatMessage({id: 'users.add.step3.title2'})}</h2>
          <Table
            style={{marginTop: '20px'}}
            columns={userRoleColumn}
            dataSource={userRoleDataSource}
            pagination={false}
          />
        </div>
      }
      <div style={{marginTop: '40px'}}>
        {
          step !== 1 &&
          <Button disabled={isEditingTableEditing} onClick={toPrevious} style={{ marginRight: '20px' }}>{formatMessage({id: 'users.add.previous'})}</Button>
        }
        <Button disabled={isEditingTableEditing} onClick={submit} type="primary">
          {step === 3 ? formatMessage({id: 'users.add.button.submit'}) : formatMessage({id: 'users.add.button.next'})}
          </Button>
      </div>
    </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Form.create<FormComponentProps & ConnectProps>()(Add))