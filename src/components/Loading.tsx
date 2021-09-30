import React from 'react';
import PacmanLoader from 'react-spinners/PacmanLoader';

interface LoadingProps {
  rpc: string,
}

const Loading: React.FC<LoadingProps> = ({ rpc }) => (
  <div id='loading-overlay'>
    <div id='loading-overlay__text'>
      connecting to
      <span id='loadingText'>{ rpc }</span>
    </div>

    <PacmanLoader
      color='orange'
      size={ 130 }
    />
  </div>
);

export default Loading;
