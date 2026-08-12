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

export const SORTS = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '인기순', value: 'reviewCount,desc' },
  { label: '평점순', value: 'avgRating,desc' },
  { label: '저가순', value: 'price,asc' },
  { label: '고가순', value: 'price,desc' }
];
