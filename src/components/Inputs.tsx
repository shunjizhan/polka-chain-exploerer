import React, { FC, ReactElement, useState, SetStateAction, ChangeEvent } from 'react';
import { Input, Button, Form, Menu, Dropdown } from 'antd';
import { SyncOutlined, WifiOutlined, DisconnectOutlined, DownOutlined } from '@ant-design/icons';
import { AnyJson } from '@polkadot/types/types';

const { SubMenu } = Menu;

const SUCCESS = 'success';
const ERROR = 'error';
export const DEFAULT_RPC = 'wss://rpc.polkadot.io';
// const DEFAULT_RPC = 'wss://polkadot.api.onfinality.io/public-ws';
// const DEFAULT_RPC = 'wss://kusama-rpc.dwellir.com';
interface InputsProps {
  updateApi: any,
  isSwitchingRpc: boolean,
  isLoading: boolean,
  modules: AnyJson,
}

type eventHandler = (e: ChangeEvent<HTMLInputElement>) => void;

const Inputs: FC<InputsProps> = ({
  updateApi,
  isSwitchingRpc,
  isLoading,
  modules,
}) => {
  const [query, setQuery] = useState<string | null>(null);
  const [rpcInput, setRpcInput] = useState<string>(DEFAULT_RPC);
  const [err, setErr] = useState<string | null>(null);

  const handleRpcInput: eventHandler = (e) => {
    setRpcInput(e.target.value);
  };

  const handleRPChange = () => {
    updateApi(rpcInput);
  };

  const handleQuerySelect = ({ key }) => {
    console.log(key);
    setQuery(key);
  };

  const menu: ReactElement = (
    <Menu onClick={ handleQuerySelect }>
      {
        modules!.map(({ name, storage }) => {
          if (!storage) return null;

          const { prefix, items } = storage;

          return (
            <SubMenu title={ name } key={ name }>
              {
                items.map(i =>
                  <Menu.Item
                    key={ `${name}.${i.name}` }
                  >
                    { i.name }
                  </Menu.Item>
                )
              } 
            </SubMenu>
          )
        })
      }
    </Menu>
  );

  const getRPCIcon = (): ReactElement => {
    if (isSwitchingRpc) return <SyncOutlined spin />;
    if (err) return <DisconnectOutlined />;
    return <WifiOutlined />;
  };

  const rpcInputElement: ReactElement = (
    <Form.Item
      validateStatus={ err ? ERROR : SUCCESS }
      help={ err }
    >
      <Input
        addonBefore={ (
          <div style={{ width: '100px' }}>
            { getRPCIcon() }
            RPC
          </div>
        ) }
        className='input-container__field'
        value={ rpcInput }
        onChange={ handleRpcInput }
        disabled={ isLoading }
        style={{ textAlign: 'center' }}
      />
    </Form.Item>
  );

  return (
    <section id='input-container'>
      <Form>
        { rpcInputElement }
      </Form>

      <Button
        type='primary'
        id='input-container__button'
        onClick={ handleRPChange }
        loading={ isLoading }
        disabled={ isLoading }
      >
        Switch RPC
      </Button>

      <Dropdown overlay={ menu }>
        <Button>
          { query || 'Select State Query' } <DownOutlined />
        </Button>
      </Dropdown>
    </section>
  );
};

export default Inputs;
