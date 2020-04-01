import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Col, Row, message, Breadcrumb, Checkbox, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import EditTable from './EditTable';
import styles from './index.less';

const FormItem = Form.Item;

export interface IUserMessage {
  nickName: string;
  userName: string;
  phone?: string;
  email?: string;
  note?: string; 
  createTime: number;
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

const userRoleOptions = [
  { label: 'User', value: 'User' },
  { label: 'Admin', value: 'Admin' },
]


const Add: React.FC<FormComponentProps> = props => {
  const { form: { getFieldDecorator, validateFields, getFieldsValue, setFieldsValue } } = props;
  const [userMessage, setUserMessage] = useState<IUserMessage[]>([newUser()]);
  const [selectedUserRole, setSelectedUserRole] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
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
  const submit = () => {
    validateFields((err, result) => {
      if (!err) {
        if (step === 1) {
          const { userMessage } = result;
          setUserMessage(userMessage);
          setStep(step + 1);
        } else if (step === 2) {
          const { role } = result;
          setSelectedUserRole(role);
          setStep(step + 1)
        } else if (step === 3) {
          console.log('userMessage', userMessage)
          console.log('userRole', selectedUserRole)
          setStep(step + 1)
        } 
        
      }
    })
  };
  const removeUser = (createTime: number) => {
    const currentFormUserMessage: IUserMessage[] = getFieldsValue().userMessage;
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
      message.warn('每次最多创建 10 个用户');
      return;
    }
    setUserMessage([...userMessage].concat(newUser()))
  }
  const validateUserName= async (i: number, _rule?: any, value?: any, callback?: any) => {
    const { userMessage } = getFieldsValue();
    if (value) {
      userMessage.forEach((user: IUserMessage, index: number) => {
        if (user.userName === value && i !== index) {
          callback('用户名需要唯一');
        } else {
          callback();
        }
      })
    }
    callback();
  }
  return (
    <PageHeaderWrapper>

    
    <div className={styles.add}>
      <Breadcrumb style={{marginBottom: '16px'}}>
        { step >= 1 && <Breadcrumb.Item>
          1. 填写用户信息
        </Breadcrumb.Item> }
        { step >= 2 && <Breadcrumb.Item>
          2. 指定角色
        </Breadcrumb.Item> }
        { step >= 3 && <Breadcrumb.Item>    
          3. 审阅
        </Breadcrumb.Item> }
      </Breadcrumb>
      { step === 1 && <div className="step-1">
        <Row>
          <Col span={4}>
            昵称 *
          </Col>
          <Col span={4}>
            用户名 *
          </Col>
          <Col span={4}>
            手机
          </Col>
          <Col span={4}>
            邮箱
          </Col>
          <Col span={4}>
            备注
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
                      rules: [{ required: true, message: '需要创建昵称'}],
                    })(<Input placeholder="请输入昵称" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].userName`, {
                      initialValue: userMessage[index].userName,
                      rules: [
                        { required: true, message: '需要创建用户名'},
                        { validator: (...args) => {
                            const newArgs = args.slice(0, 4);
                            validateUserName(index, ...newArgs)
                          }
                        }
                      ],
                    })(<Input placeholder="请输入用户名" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].phone`, {
                      initialValue: userMessage[index].phone,
                    })(<Input placeholder="请输入手机" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].email`, {
                      initialValue: userMessage[index].email,
                    })(<Input placeholder="请输入邮箱" />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem { ...formItemLayout }>
                    {getFieldDecorator(`userMessage[${index}].note`, {
                      initialValue: userMessage[index].note,
                    })(<Input placeholder="请输入备注" />)}
                  </FormItem>
                </Col>
                <Col style={{marginTop: '8px'}} span={2}><a onClick={() => removeUser(user.createTime) }>删除</a></Col>
              </Row>
            </div>
          ))
        }
        <Button onClick={addUser}>新增用户</Button><span style={{display: 'inline-block', marginLeft: '10px'}}>每次最多创建 10 个用户</span>
      </div> }
      {
        <div className="step-2">
          {
            getFieldDecorator('role', {
              initialValue: ['User'],
              rules: [
                { required: true, message: 'Need choose at least one role' }
              ]
            })(<Checkbox.Group
              options={userRoleOptions}
            />)
          }
        </div>
      }
      {
        <div className="step-3">
          <EditTable  dataSource={userMessage}/>
        </div>
      }
      <div style={{marginTop: '40px'}}>
        <Button onClick={submit} type="primary">下一步</Button>
      </div>
    </div>
    </PageHeaderWrapper>
  );
};

export default Form.create<FormComponentProps>()(Add)