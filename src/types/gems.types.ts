export interface GemTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  description_pt: string | null;
  balance_after: number;
  created_at: string;
}

export interface ShopItem {
  id: string;
  item_code: string;
  name_pt: string;
  description_pt: string;
  category: string;
  gem_cost: number;
  icon: string;
  is_active: boolean;
  max_per_user: number | null;
  already_owned: boolean;
}

export interface GemsBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const SHOP_CATEGORIES: Record<string, string> = {
  streak: 'Ofensiva',
  boost: 'Boost',
  cosmetic: 'Cosmético',
};
