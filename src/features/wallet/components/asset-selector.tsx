import { TokenIcon } from '@web3icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { assets } from '../constants';
import type { Asset } from '../types';

interface AssetSelectorProps {
  value?: Asset;
  onValueChange: (value: Asset) => void;
}

export function AssetSelector({ value, onValueChange }: AssetSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="block text-sm font-medium">Asset</div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select asset" />
        </SelectTrigger>
        <SelectContent>
          {assets.map((asset) => (
            <SelectItem key={asset.value} value={asset.value}>
              <div className="flex items-center gap-2">
                <TokenIcon symbol={asset.value} variant="branded" size="30" />
                <span>{asset.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
