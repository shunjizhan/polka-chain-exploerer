import React, { FC, ReactElement, useState, SetStateAction, ChangeEvent } from 'react';
import { Input, Button, Form, Menu, Dropdown } from 'antd';
import { SyncOutlined, WifiOutlined, DisconnectOutlined, DownOutlined } from '@ant-design/icons';
import { FetchData } from './Scanner';

const { SubMenu } = Menu;

const SUCCESS = 'success';
const ERROR = 'error';
export const DEFAULT_RPC = 'wss://rpc.polkadot.io';
// const DEFAULT_RPC = 'wss://polkadot.api.onfinality.io/public-ws';
// const DEFAULT_RPC = 'wss://kusama-rpc.dwellir.com';
// const DEFAULT_RPC = 'wss://karura.polkawallet.io';
interface InputsProps {
  updateApi: any,
  isSwitchingRpc: boolean,
  isLoading: boolean,
  modules: any,
  fetchData: FetchData,
  rpcErr: string | null,
  fetchErr: string | null,
}

type eventHandler = (e: ChangeEvent<HTMLInputElement>) => void;

const getQueryDetails = (item: any): string => {
  let suffix;
  let params;
  const { type, name } = item;
  const { map, doubleMap, plain } = type;
  if (map) {
    suffix = `${ map.value }`
    params = map.key;
  } if (doubleMap) {
    suffix = `${doubleMap.value}`
    params = `${doubleMap.key1}, ${doubleMap.key2}`;
  } else if (plain) {
    suffix = `${ plain }`
  }

  return params
    ? `${name}(${params}): ${suffix}`
    : `${name}(): ${suffix}`;
};

const getArgsLength = (item: any): number => {
  const { type: { map, doubleMap } } = item;
  if (doubleMap) {
    return 2;
  } else if (map) {
    return 1
  } else {
    return 0;
  }
};

const Inputs: FC<InputsProps> = ({
  updateApi,
  isSwitchingRpc,
  isLoading,
  modules,
  fetchData,
  rpcErr,
  fetchErr,
}) => {
  const [query, setQuery] = useState<string | null>(null);
  const [argsLength, setArgsLength] = useState<number>(0);
  const [arg1, setArg1] = useState<string>('');
  const [arg2, setArg2] = useState<string>('');
  const [rpcInput, setRpcInput] = useState<string>(DEFAULT_RPC);

  const handleRpcInput: eventHandler = (e) => {
    setRpcInput(e.target.value);
  };

  const handleRPChange = () => {
    updateApi(rpcInput);
  };

  const handleQuerySelect = ({ key }) => {
    const [queryName, argsLenght] = key.split('---');
    console.log(argsLenght);
    setQuery(queryName);
    setArgsLength(parseInt(argsLenght, 10));
  };

  const menu: ReactElement = (
    <Menu onClick={ handleQuerySelect }>
      {
        modules!.map(({ name, storage }) => {
          if (!storage) return null;

          const { items } = storage;

          return (
            <SubMenu title={ name } key={ name }>
              {
                items.map(item => {
                  const queryDetails: string = getQueryDetails(item);
                  return (
                    <Menu.Item
                      key={ `${name}.${item.name}---${getArgsLength(item)}` }
                    >
                      { `${queryDetails}` }
                    </Menu.Item>                  
                  )
                })
              } 
            </SubMenu>
          )
        })
      }
    </Menu>
  );

  const getRPCIcon = (): ReactElement => {
    if (isSwitchingRpc) return <SyncOutlined spin />;
    if (rpcErr) return <DisconnectOutlined />;
    return <WifiOutlined />;
  };

  const rpcInputElement: ReactElement = (
    <Form.Item
      validateStatus={ rpcErr ? ERROR : SUCCESS }
      help={ rpcErr }
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

  const handleFetch = () => {
    fetchData(query as string, arg1, arg2, argsLength);
  };

  const handleArg1Change = e => setArg1(e.target.value);
  const handleArg2Change = e => setArg2(e.target.value);

  const disableInputs = isLoading || isSwitchingRpc;
  return (
    <section id='input-container'>
      <Form>
        { rpcInputElement }
      </Form>

      <Button
        type='primary'
        id='rpc-button'
        onClick={ handleRPChange }
        disabled={ disableInputs }
      >
        Switch RPC
      </Button>

      <Dropdown overlay={ menu } disabled={ disableInputs }>
        <Button>
          { query || 'Select State Query' } <DownOutlined />
        </Button>
      </Dropdown>

      { argsLength > 0 && <Input value={ arg1 } onChange={ handleArg1Change } />}
      { argsLength > 1 && <Input value={ arg2 } onChange={ handleArg2Change } />}
      { query && 
        <Button
          type='primary'
          id='fetch-button'
          onClick={ handleFetch }
          loading={ isLoading }
          disabled={ disableInputs }
        >
          Fetch State Data
        </Button>
      }
      { fetchErr && <div>{ fetchErr }</div>}
    </section>
  );
};

export default Inputs;
