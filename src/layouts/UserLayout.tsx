import { MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet } from 'react-helmet';
import { Link } from 'umi';
import React from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

import SelectLang from '@/components/SelectLang';
import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './UserLayout.less';
import image1 from '@/assets/image1.jpeg';
import image2 from '@/assets/image2.jpeg';
import image3 from '@/assets/image3.jpeg';

export interface UserLayoutProps extends ConnectProps {
  breadcrumbNameMap: { [path: string]: MenuDataItem };
}

const UserLayout: React.FC<UserLayoutProps> = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    formatMessage,
    ...props,
  });
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>


      <Row>
        <Col span={15}>
          <div className={styles.container} style={{
            backgroundImage: `url(${[image1, image2, image3][Date.now() % 3]})`,
            backgroundSize: "cover",
            backgroundPosition: "right"}}>
            <div className={styles.content}>
              <div className={styles.left}></div>
            </div>
          </div>
        </Col>
        <Col span={9}>
          <div className={styles.lang}>
            <SelectLang />
          </div>
          <Link to="/">
            <div className={styles.title}>Deep Learning Workspace</div>
          </Link>
          {children}
        </Col>
       
      </Row>
    </>
  );
};

export default connect(({ settings }: ConnectState) => ({
  ...settings,
}))(UserLayout);
