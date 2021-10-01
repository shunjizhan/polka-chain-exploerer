import React, { FC, ReactElement, useState, SetStateAction, ChangeEvent } from 'react';
import { Input, Button, Form, Menu, Dropdown } from 'antd';
import { SyncOutlined, WifiOutlined, DisconnectOutlined, DownOutlined } from '@ant-design/icons';
import { FetchData } from './Scanner';
import {
  getQueryDetails,
  getArgsLength,
} from '../utils/inputsUtils';
import { getArgNames } from '../utils/inputsUtils';

const { SubMenu } = Menu;

const SUCCESS = 'success';
const ERROR = 'error';
// export const DEFAULT_RPC = 'wss://rpc.polkadot.io';
// export const DEFAULT_RPC = 'wss://polkadot.api.onfinality.io/public-ws';
// export const DEFAULT_RPC = 'wss://kusama-rpc.dwellir.com';
// export const DEFAULT_RPC = 'wss://karura.polkawallet.io';
export const DEFAULT_RPC = 'wss://shiden.api.onfinality.io/public-ws';
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
  const [arg1Name, setArg1Name] = useState<string>('');
  const [arg2Name, setArg2Name] = useState<string>('');
  const [rpcInput, setRpcInput] = useState<string>(DEFAULT_RPC);

  const handleRpcInput: eventHandler = (e) => {
    setRpcInput(e.target.value);
  };

  const handleRPChange = () => {
    updateApi(rpcInput);
  };

  // when select a query from dropdown
  const handleQuerySelect = ({ key }) => {
    const [queryName, argsLenght, argNames] = key.split('---');
    const [arg1Name, arg2Name] = argNames.split(',');
    
    // reset inputs
    setArg1('');
    setArg2('');

    // set query related data
    setArg1Name(arg1Name);
    setArg2Name(arg2Name);
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
                      key={ `${name}.${item.name}---${getArgsLength(item)}---${getArgNames(item)}` }
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

      <Dropdown
        overlay={ menu }
        disabled={ disableInputs }
        trigger={['click']}
        className='query-selector'
      >
        <Button>
          { query || 'Select State Query' } <DownOutlined />
        </Button>
      </Dropdown>

      { argsLength > 0 && 
        <Input
          value={ arg1 }
          onChange={ handleArg1Change }
          placeholder='leave empty will use default arg'
          addonBefore={ arg1Name }
          style={{ textAlign: 'center' }}
        />
      }
      { argsLength > 1 && 
        <Input
          value={ arg2 }
          onChange={ handleArg2Change }
          placeholder='leave empty will use default arg'
          addonBefore={ arg2Name }
          style={{ textAlign: 'center' }}
        />
      }
      { query && 
        <Button
          type='primary'
          id='fetch-button'
          onClick={ handleFetch }
          loading={ isLoading }
          disabled={ disableInputs }
        >
          Fetch Data
        </Button>
      }
      { fetchErr && <div className='err-msg'>{ fetchErr }</div>}
    </section>
  );
};

export default Inputs;
