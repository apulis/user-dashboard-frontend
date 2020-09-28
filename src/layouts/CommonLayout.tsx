import { ConnectState } from '@/models/connect';
import { PageLoading } from '@ant-design/pro-layout';
import { connect } from 'dva';
import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { BasicLayoutProps as ProLayoutProps } from '@ant-design/pro-layout';
import { ConfigStateType } from '@/models/config';


export interface CommonLayoutProps extends ProLayoutProps {
  dispatch: Dispatch;
  config: ConfigStateType;
}

const CommonLayout: React.FC<CommonLayoutProps> = ({ dispatch, config, children }) => {

  useEffect(() => {
    dispatch({
      type: 'config/fetchPlatformConfig'
    })
  }, [])
  if (!config.platformName) {
    return (
      <PageLoading />
    )
  }
  return <>{children}</>;

}
  
export default connect(({ config }: ConnectState) => ({ config }))(CommonLayout);