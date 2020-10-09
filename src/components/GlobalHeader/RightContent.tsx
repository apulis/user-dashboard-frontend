import { Button } from 'antd';
import React from 'react';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';

import Avatar from './AvatarDropdown';
import styles from './index.less';
import { ConfigStateType } from '@/models/config';
import SelectLang from '../SelectLang';


export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
  config: ConfigStateType;
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const { theme, layout } = props;
  let className = styles.right;
  const permissionList = JSON.parse(localStorage.authority || '[]');
  const hasDL = !(permissionList && permissionList.length === 1 && permissionList.includes('MANAGE_USER'));

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className} style={{marginRight: '30px'}}>
      {hasDL && <Button type="primary" href="/" style={{marginRight: '20px'}}>{props.config.platformName}</Button>}
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder={formatMessage({
          id: 'component.globalHeader.search',
        })}
        defaultValue=""
        dataSource={[
          formatMessage({
            id: 'component.globalHeader.search.example1',
          }),
          formatMessage({
            id: 'component.globalHeader.search.example2',
          }),
          formatMessage({
            id: 'component.globalHeader.search.example3',
          }),
        ]}
        onSearch={value => {
          console.log('input', value);
        }}
        onPressEnter={value => {
          console.log('enter', value);
        }}
      /> */}
      <Avatar />
      <SelectLang className={styles.action} />
    </div>
  );
};

export default connect(({ settings, config }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
  config: config
}))(GlobalHeaderRight);
