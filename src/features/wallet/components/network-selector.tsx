import { NetworkIcon } from '@web3icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { networks } from '../constants';
import type { Network } from '../types';

interface NetworkSelectorProps {
  value?: Network;
  onValueChange: (value: Network) => void;
}

export function NetworkSelector({
  value,
  onValueChange,
}: NetworkSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="block text-sm font-medium">Network</div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network.value} value={network.value}>
              <div className="flex items-center gap-2">
                <NetworkIcon name={network.value} variant="branded" size="30" />
                <span>{network.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
