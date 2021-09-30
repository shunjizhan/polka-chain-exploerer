import React, { FC } from 'react';
import { Line } from 'rc-progress';
import RingLoader from 'react-spinners/RingLoader';
import { CheckOutlined } from '@ant-design/icons';

const color = 'rgb(230, 0, 122)';
interface ProgressProps {
  cur: number,
  all: number,
}

const Progress: FC<ProgressProps> = ({ cur, all }) => {
  if (cur < 0) return null;

  return (
    <div id='progress'>
      <div id='progress-count'>
        <div style={{ marginRight: '10px' }}>
          {`${cur} / ${all}`}
        </div>
        <div>
          { cur === all && <CheckOutlined color={ color } />}
          { cur < all   && <RingLoader size={ 20 } color={ color } />}
        </div>
      </div>
      <Line
        percent={ (100 * cur) / all }
        strokeWidth={ 2 }
        strokeColor={ `rgba(230, 0, 122, ${0.6 + (0.4 * cur) / all})` }
      />
    </div>
  );
};

export default Progress;
