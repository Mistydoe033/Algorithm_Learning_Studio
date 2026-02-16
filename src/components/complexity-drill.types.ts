export interface ComplexityCard {
  notation: string;
  name: string;
  plain: string;
  deeper: string;
}

export interface ComplexityDrillProps {
  title: string;
  cards: ComplexityCard[];
  prefix: string;
}
