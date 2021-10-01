import React, { Dispatch, FC, MouseEventHandler, SetStateAction, useState } from 'react';
import ReactJson from 'react-json-view';
import { Button } from 'antd';
import { EyeInvisibleTwoTone, EyeTwoTone, ArrowRightOutlined } from '@ant-design/icons';
interface DataViewerProps {
  src: Record<string, unknown>,
  fetchNextPage: () => void,
}

interface OptionButtonProps {
  handler: Dispatch<SetStateAction<boolean>>,
  enabled: boolean,
  text: string,
}
const OptionButton: FC<OptionButtonProps> = ({ handler, enabled, text }) => (
  <Button className='data-option' onClick={ () => handler(x => !x) }>
    { text } {
      enabled
        ? <EyeTwoTone twoToneColor="#52c41a" />
        : <EyeInvisibleTwoTone twoToneColor="red" />
      }
  </Button>
);

const DataViewer: FC<DataViewerProps> = ({ src, fetchNextPage }) => {
  const [enableClipboard, setEnableClipboard] = useState<boolean>(false);
  const [displayDataTypes, setDisplayDataTypes] = useState<boolean>(false);
  const [displayObjectSize, setDisplayObjectSize] = useState<boolean>(false);
  const [displayArrayKey, setDisplayArrayKey] = useState<boolean>(false);

  return (
    <div id='data-viewer-container'>
      <div id='result-options'>
        <OptionButton
          handler={ setEnableClipboard }
          enabled={ enableClipboard }
          text='clipboard'
        />

        <OptionButton
          handler={ setDisplayDataTypes }
          enabled={ displayDataTypes }
          text='data type'
        />

        <OptionButton
          handler={ setDisplayObjectSize }
          enabled={ displayObjectSize }
          text='object size'
        />

        <OptionButton
          handler={ setDisplayArrayKey }
          enabled={ displayArrayKey }
          text='array key'
        />

        <Button className='data-option' onClick={ fetchNextPage } id='next-page-button' type='primary'>
          Next Page <ArrowRightOutlined />
        </Button>
      </div>
      <div id='result-data'>
        <ReactJson
          src={ src }
          enableClipboard={ enableClipboard }
          displayDataTypes={ displayDataTypes }
          displayObjectSize={ displayObjectSize }
          displayArrayKey={ displayArrayKey	 }
          collapseStringsAfterLength={ 68 }
          name={ null }
          indentWidth={ 4 }
        />
      </div>
    </div>
  );
};

export default DataViewer;
