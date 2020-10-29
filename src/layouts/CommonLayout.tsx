import { ConnectState, SettingModelState } from '@/models/connect';
import { connect } from 'dva';
import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { BasicLayoutProps as ProLayoutProps, PageLoading } from '@ant-design/pro-layout';
import { ConfigStateType } from '@/models/config';


export interface CommonLayoutProps extends ProLayoutProps {
  dispatch: Dispatch;
  config: ConfigStateType;
  settings: SettingModelState;
}

const CommonLayout: React.FC<CommonLayoutProps> = ({ dispatch, config, children, settings }) => {

  useEffect(() => {
    dispatch({
      type: 'config/fetchPlatformConfig'
    })
  }, [])

  useEffect(() => {
    
    dispatch({
      type: 'settings/changeSetting',
      payload: {
        ...settings,
        title: config.platformName
      }
    })
    
  }, [config])
  if (!config.platformName) {
    return (
      <PageLoading />
    )
  }
  return <>{children}</>;

}
  
export default connect(({ config, settings }: ConnectState) => ({ config, settings }))(CommonLayout);