export interface Token {
  type: 'property' | 'operator' | 'function';
  value: string;
} 