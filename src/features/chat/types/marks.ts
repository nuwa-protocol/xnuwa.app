import type { LocalCap } from '@/features/cap-studio/types';
import type { Cap } from '@/shared/types';

// Payload carried in UI message parts when the model starts responding
export type OnResponseDataMark = {
  mark: 'onResponse';
  // Full cap object associated with this response
  cap: Cap | LocalCap;
};

// A UI message part representing the onResponse data mark
export type OnResponseDataMarkPart = {
  type: 'data-mark';
  data: OnResponseDataMark;
};

export function isOnResponseDataMark(data: any): data is OnResponseDataMark {
  return !!data && typeof data === 'object' && data.mark === 'onResponse';
}

export function isOnResponseDataMarkPart(part: any): part is OnResponseDataMarkPart {
  return !!part && part.type === 'data-mark' && isOnResponseDataMark(part.data);
}
