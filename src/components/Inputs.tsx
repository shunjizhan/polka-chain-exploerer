import React, { FC, ReactElement, useState } from 'react';
import { Input, Button, Form } from 'antd';
import { SyncOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { ApiPromise } from '@polkadot/api';

import { Err, NO_ERR, eventHandler } from './Scanner';
import { getLastBlock } from '../utils/chainUtils';

const SUCCESS = 'success';
const ERROR = 'error';
interface InputsProps {
  rpc: string,
  startBlock: number,
  endBlock: number,
  err: Err,
  setErr: React.Dispatch<React.SetStateAction<Err>>,
  api: ApiPromise,

  isSwitchingRpc: boolean,
  isLoading: boolean,

  fetchData: () => void,
  handleRpcChange: eventHandler,
  handleStartBlockChange: eventHandler,
  handleEndBlockChange: eventHandler,
}

const Inputs: FC<InputsProps> = ({
  rpc,
  startBlock,
  endBlock,
  err,
  setErr,
  api,

  isSwitchingRpc,
  isLoading,

  fetchData,
  handleRpcChange,
  handleStartBlockChange,
  handleEndBlockChange,
}) => {
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateFields = async () => {
    if (startBlock < 0) {
      setErr({ ...NO_ERR, start: 'start block must be greater than 0!' }); return false;
    }
    if (startBlock >= endBlock) {
      setErr({ ...NO_ERR, start: 'start block must be greater than end block!' }); return false;
    }
    if (endBlock < 0) {
      setErr({ ...NO_ERR, end: 'end block must be greater than 0!' }); return false;
    }
    if (endBlock - startBlock > 2000) {
      setErr({ ...NO_ERR, end: 'max interval is 2000!' }); return false;
    }

    const lastBlock = await getLastBlock(api);
    if (endBlock > lastBlock) {
      setErr({ ...NO_ERR, end: `end block must be less than last block ${lastBlock}!` }); return false;
    }

    return true;
  };

  const getRPCIcon = (): ReactElement => {
    if (isSwitchingRpc) return <SyncOutlined spin />;
    if (err.rpc) return <DisconnectOutlined />;
    return <WifiOutlined />;
  };

  const rpcInput: ReactElement = (
    <Form.Item
      validateStatus={ err.rpc ? ERROR : SUCCESS }
      help={ err.rpc }
    >
      <Input
        addonBefore={ (
          <div style={{ width: '100px' }}>
            { getRPCIcon() }
            RPC
          </div>
        ) }
        className='input-container__field'
        value={ rpc }
        onChange={ handleRpcChange }
        disabled={ isLoading }
        style={{ textAlign: 'center' }}
      />
    </Form.Item>
  );

  const startBlockInput: ReactElement = (
    <Form.Item
      validateStatus={ err.start ? ERROR : SUCCESS }
      help={ err.start }
    >
      <Input
        addonBefore={ (
          <div style={{ width: '100px' }}>
            Start Block
          </div>
        ) }
        className='input-container__field'
        value={ startBlock }
        onChange={ handleStartBlockChange }
        disabled={ isLoading }
        style={{ textAlign: 'center' }}
      />
    </Form.Item>
  );

  const endBlockInput: ReactElement = (
    <Form.Item
      validateStatus={ err.end ? ERROR : SUCCESS }
      help={ err.end }
    >
      <Input
        addonBefore={ (
          <div style={{ width: '100px' }}>
            {isValidating ? <SyncOutlined spin /> : 'End block'}
          </div>
        ) }
        className='input-container__field'
        value={ endBlock }
        onChange={ handleEndBlockChange }
        disabled={ isLoading }
        style={{ textAlign: 'center' }}
      />
    </Form.Item>
  );

  const handleClick = async () => {
    setIsValidating(true);
    const isFieldsValid = await validateFields();
    setIsValidating(false);

    if (isFieldsValid) fetchData();
  };

  return (
    <section id='input-container'>
      <Form>
        { rpcInput }
        { startBlockInput }
        { endBlockInput }
      </Form>

      <Button
        type='primary'
        id='input-container__button'
        onClick={ handleClick }
        loading={ isLoading }
        disabled={ isLoading }
      >
        scan
      </Button>
    </section>
  );
};

export default Inputs;
