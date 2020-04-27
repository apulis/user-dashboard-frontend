import React from 'react';

import styles from './IconMicrosoft.less';
import image1 from '@/assets/microsoft-1.png';
import image2 from '@/assets/microsoft-2.png';

interface IconMicrosoftProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => any;
  style?: React.CSSProperties;
}

const IconMicrosoft: React.FC<IconMicrosoftProps> = (props) => {
  return (
    <span style={props.style} onClick={(e) => props.onClick && props.onClick(e)} className={styles.microsoft}>
      <img
        src={image1}
        className={styles.active} 
        height="20px" 
        width="20px"
        alt="microsoft"
      /> 
      <img 
        src={image2}
        className={styles.disactive}
        height="20px"
        width="20px"
        alt="microsoft"
      />
    </span>
  )
}


export default IconMicrosoft;