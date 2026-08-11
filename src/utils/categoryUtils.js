export const PRODUCT_CATEGORIES = ['슬라임', '슬랑이', '말랑이', '스퀴시', '왁뿌'];
export const CATEGORIES = ['전체', ...PRODUCT_CATEGORIES];

export const getCategoryApiValue = (activeCategory) => {
  if (activeCategory === '전체' || !activeCategory) return '';
  if (activeCategory === '슬라임') return 'SLIME';
  if (activeCategory === '슬랑이') return 'SLANGY';
  if (activeCategory === '말랑이') return 'MALLANGI';
  if (activeCategory === '스퀴시') return 'SQUISHY';
  if (activeCategory === '왁뿌') return 'WAKPPU';
  return '';
};
