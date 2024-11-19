import { CompareItem } from '@/type/compareItem';

export default function getCompareId(item: CompareItem) {
  return `${item.path}-${item.selector}-${item.figmaUrl}`;
}
