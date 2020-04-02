import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Breadcrumb, Checkbox, Row, Col, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';

interface IUserGroup {
  groupName: string;
  note: string;
  role: string[];
}

const FormItem = Form.Item;
const { TextArea } = Input;



const Group: React.FC<FormComponentProps> = ({ form }) => {
  const { getFieldDecorator, validateFields } = form;
  const [step, setStep] = useState<number>(1);
  const [submitData, setSubmitData] = useState<IUserGroup>();
  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 12 },
  };  
  const next = () => {
    if (step === 1) {
      validateFields((err, values) => {
        if (!err) {
          setSubmitData({...values});
          setStep(step + 1);
        }
      })
    } else if (step === 2) {
      validateFields((err, values) => {
        if (!err) {
          setSubmitData({
            ...submitData,
            ...values,
          });
          setStep(step + 1);
        }
      })
    } else if (step === 3) {
      console.log('submitData', submitData)
    }
  }
  const removeRole = (index: number) => {
    const newRoleList = [...submitData!.role].splice(index, 1);
    setSubmitData({
      ...submitData,
      role: newRoleList,
    } as IUserGroup)
  }
  const columns = [
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'RoleDescription',
      dataIndex: 'roleDesc',
      key: 'roleDesc',
    },
    {
      title: 'RoleType',
      dataIndex: 'roleType',
      render() {
        return <span>Preset</span>
      }
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render(_text: any, _item: any, index: number) {
        return <a onClick={() => {removeRole(index)}}>Remove</a>
      }
    }
  ];
  const pre = () => {
    setStep(step - 1);
  }
  const tableDataSource = (submitData?.role || []).map(val => {
    return {
      role: val,
      roleDesc: 'test',
    };
  });
  return (
    <PageHeaderWrapper>
      {
        step === 1 && <div className="step-1">
          <FormItem label="用户组名" {...layout}>
            {
              getFieldDecorator('groupName', {
                initialValue: submitData?.groupName,
                rules: [
                  { required: true },
                  { max: 10 }
                ],
              })(<Input />)
            }
          </FormItem>
          <FormItem label="备注" {...layout}>
            {
              getFieldDecorator('note', {
                initialValue: submitData?.note,
                rules: [
                  { required: true, },
                  { max: 40 }
                ],
              })(<TextArea />)
            }
          </FormItem>
        </div>
      }
      {
        step === 2 && <div className="step-2">
          {
            getFieldDecorator('role', {
              initialValue: submitData?.role || ['User'],
              rules: [
                { required: true }
              ]
            })(<Checkbox.Group style={{ width: '100%'}}>
              <Row>
                <Col span={24}>
                  <Checkbox value="User">User</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="Admin">Admin</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>)
          }
        </div>
      }
      {
        step === 3 && <div className="step-3">
          <h1>用户组信息</h1>
          <div>
            <div>用户组名：{submitData?.groupName}</div>
            <div>备注: {submitData?.note}</div>
          </div>
          <h1>角色 ({submitData?.role.length})</h1>
          <Table dataSource={tableDataSource} columns={columns} />
        </div>
      }
      {
        step >=  2 &&
        <Button style={{marginRight: '15px'}} onClick={pre}>上一步</Button>
      }
      <Button type="primary" onClick={next}>{ step === 3 ? '完成' : '下一步'}</Button>
    </PageHeaderWrapper>
  );
}


export default Form.create<FormComponentProps>()(Group);
