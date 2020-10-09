import { GlobalOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

import { ClickParam } from 'antd/es/menu';
import React from 'react';
import classNames from 'classnames';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { setI18n, getI18n } from '@/utils/utils';
import { ConnectProps, ConnectState } from '@/models/connect';
import { connect } from 'dva';

interface SelectLangProps {
  className?: string;
}
const SelectLang: React.FC<SelectLangProps & ConnectProps & ConnectState> = props => {
  const { className } = props;
  const selectedLang = getI18n();
  const changeLang = ({ key }: ClickParam): void => {
    setI18n(key);
    props.dispatch({
      type: 'config/setLang',
      payload: {
        language: key
      }
    })
  };
  const locales = ['zh-CN', 'en-US'];
  const languageLabels = {
    'zh-CN': '简体中文',
    'en-US': 'English',
  };
  const languageIcons = {
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
  };
  const langMenu = (
    <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={changeLang}>
      {locales.map(locale => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[locale]}>
            {languageIcons[locale]}
          </span>{' '}
          {languageLabels[locale]}
        </Menu.Item>
      ))}
    </Menu>
  );
  if (props.config.i18n === true) {
    return (
      <HeaderDropdown overlay={langMenu} placement="bottomRight">
        <span className={classNames(styles.dropDown, className)}>
          <GlobalOutlined title={formatMessage({ id: 'navBar.lang' })} />
        </span>
      </HeaderDropdown>
    );
  }
  return null;
};

export default connect(({ config }: ConnectState) => ({ config }))(SelectLang);
