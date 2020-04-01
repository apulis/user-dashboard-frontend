import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Col, Row } from 'antd';
import { FormComponentProps, ValidationRule } from '@ant-design/compatible/es/form';

import styles from './index.less';

const FormItem = Form.Item;

interface UserMessage {
  nickName: string;
  userName: string;
  phone?: string;
  email?: string;
  note?: string; 
}


const Add: React.FC<FormComponentProps> = props => {
  const { form: { getFieldDecorator, validateFields, getFieldsValue } } = props;
  const [userMessage, setUserMessage] = useState<UserMessage[]>([{
    nickName: '',
    userName: '',
    phone: '',
    email: '',
    note: '',
  }]);
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
        console.log('result', result);
      }
    })
  };
  const removeUser = (index: number) => {
    //
  }
  const addUser = () => {
    setUserMessage([...userMessage].concat({
      nickName: '',
      userName: '',
      phone: '',
      email: '',
      note: '',
    }))
  }
  const validateUserName= async (i: number, _rule?: any, value?: any, _callback?: any) => {
    const { userMessage } = getFieldsValue();
    if (value) {
      userMessage.forEach((user: UserMessage, index: number) => {
        if (user.userName === value && i !== index) {
          throw new Error('用户名需要唯一');
        }
      })
    }
  }
  return (
    <div className={styles.add}>
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
        userMessage.map((_user, index) => (
          <div>
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
              <Col style={{marginTop: '8px'}} span={2}><a onClick={() => removeUser(index) }>删除</a></Col>
            </Row>
          </div>
        ))
      }
      
      
      <Button onClick={addUser}>新增用户</Button><span>每次最多创建 10 个用户</span>
      <div style={{marginTop: '40px'}}>
        <Button onClick={submit} type="primary">下一步</Button>
      </div>
    </div>
    
  );
};

export default Form.create<FormComponentProps>()(Add)