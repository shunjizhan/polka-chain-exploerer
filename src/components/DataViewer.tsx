import React, { FC } from 'react';
import ReactJson from 'react-json-view';

interface DataViewerProps {
  src: Record<string, unknown>,
}

const DataViewer: FC<DataViewerProps> = ({ src }) => (
  <div id='data-viewer-container'>
    <ReactJson
      src={ src }
      enableClipboard={ false }
      displayDataTypes={ false }
      collapseStringsAfterLength={ 68 }
    />
  </div>
);

export default DataViewer;
