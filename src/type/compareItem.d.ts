export interface CompareItem {
  selector: string; // 选择器
  figmaUrl: string; // figma 地址
  path: string; // 路径 pathanme
  offset: { x: number; y: number }; // 偏移量
}
