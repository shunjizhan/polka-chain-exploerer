import React, {
  Dispatch, FC, MouseEventHandler, SetStateAction, useState,
} from 'react';
import ReactJson from 'react-json-view';
import { Button } from 'antd';
import {
  EyeInvisibleTwoTone, EyeTwoTone, ArrowRightOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';

interface OptionButtonProps {
  handler: Dispatch<SetStateAction<boolean>>,
  enabled: boolean,
  text: string,
}

const OptionButton: FC<OptionButtonProps> = React.memo(({ handler, enabled, text }) => (
  <Button className='data-option' onClick={ () => handler(x => !x) }>
    { text }
    {' '}
    {
      enabled
        ? <EyeTwoTone twoToneColor='#52c41a' />
        : <EyeInvisibleTwoTone twoToneColor='red' />
    }
  </Button>
));

interface DataViewerProps {
  src: Record<string, unknown>,
  isLoadingPage: boolean,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  fetchNextPage: () => void,
  fetchPrevPage: () => void,
  curPage: number,
}

const DataViewer: FC<DataViewerProps> = ({
  src, fetchNextPage, fetchPrevPage, isLoadingPage, hasNextPage, hasPrevPage, curPage,
}) => {
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

        <div id='page-options'>
          <Button
            type='primary'
            className='data-option page-button'
            onClick={ fetchPrevPage }
            loading={ isLoadingPage }
            disabled={ isLoadingPage || !hasPrevPage }
          >
            <ArrowLeftOutlined />
            Prev
          </Button>

          <div
            id='page-number'
            className='data-option page-button'
          >
            {`Page ${curPage + 1}`}
          </div>

          <Button
            type='primary'
            className='data-option page-button'
            onClick={ fetchNextPage }
            loading={ isLoadingPage }
            disabled={ isLoadingPage || !hasNextPage }
          >
            Next
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>

      <div id='result-data'>
        <ReactJson
          src={ src }
          enableClipboard={ enableClipboard }
          displayDataTypes={ displayDataTypes }
          displayObjectSize={ displayObjectSize }
          // @ts-ignore
          displayArrayKey={ displayArrayKey }
          collapseStringsAfterLength={ 68 }
          name={ null }
          indentWidth={ 4 }
        />
      </div>
    </div>
  );
};

export default React.memo(DataViewer);
