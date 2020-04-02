import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Breadcrumb } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';


const FormItem = Form.Item;
const { TextArea } = Input;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 12 },
};

const Group: React.FC<FormComponentProps> = ({ form }) => {
  const { getFieldDecorator, validateFields } = form;
  const [step, setStep] = useState<number>(1);
  const next = () => {
    if (step === 1) {
      validateFields((err, values) => {
        if (!err) {
          console.log('err', err)
          setStep(step + 1);
        }
      })
    } else if (step === 2) {
      //
    } else if (step === 3) {
      //
    }
  }
  return (
    <PageHeaderWrapper>
      {
        step === 1 && <div className="step-1">
          <FormItem label="用户组名" {...layout}>
            {
              getFieldDecorator('groupName', {
                rules: [
                  { required: true },
                  { max: 10 }
                ],
              })(<Input />)
            }
          </FormItem>
          <FormItem label="备注"{...layout}>
            {
              getFieldDecorator('desc', {
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

        </div>
      }
      
      
      <Button type="primary" onClick={next}>下一步</Button>
    </PageHeaderWrapper>
  );
}


export default Form.create<FormComponentProps>()(Group);
