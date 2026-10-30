// Subnet Calculator (desktop window). "Run in Terminal" opens the Terminal
// with the same address, using the subnet command.
import { SubnetView } from './SubnetView';
import { openApp } from '../../os/actions';
import { useTermQueue } from '../terminal/queue';

export default function SubnetApp() {
  return (
    <SubnetView
      onRunInTerminal={(cmd) => {
        useTermQueue.getState().send({ cmd });
        openApp('terminal');
      }}
    />
  );
}
