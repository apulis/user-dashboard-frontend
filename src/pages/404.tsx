import { Button, Result } from 'antd';
import React from 'react';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';

// 这里应该使用 antd 的 404 result 组件，
// 但是还没发布，先来个简单的。

const NoFoundPage: React.FC<{}> = () => (
  <Result
    status="404"
    title="404"
    subTitle={formatMessage({id: 'common.page.404.title'})}
    extra={
      <Button type="primary" onClick={() => router.push('/')}>
        {
          formatMessage({id: 'common.page.404.button'})
        }
      </Button>
    }
  ></Result>
);

export default NoFoundPage;
