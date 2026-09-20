import React from 'react';
import {
  Share2,
  Tv,
  Key,
  Gamepad2,
  Wand2,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  currentLang: 'ar' | 'en';
  totalProductsCount: number;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Share2':
      return <Share2 className="h-4 w-4" />;
    case 'Tv':
      return <Tv className="h-4 w-4" />;
    case 'Key':
      return <Key className="h-4 w-4" />;
    case 'Gamepad2':
      return <Gamepad2 className="h-4 w-4" />;
    case 'Wand2':
      return <Wand2 className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  currentLang,
  totalProductsCount
}) => {
  const isRtl = currentLang === 'ar';

  return (
    <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 z-20 shadow-xs rounded-2xl sm:rounded-none">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 sm:py-3 no-scrollbar scroll-smooth">
          {/* All Categories Pill */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>{isRtl ? 'جميع الخدمات والأقسام' : 'All Services'}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategoryId === null
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{isRtl ? cat.name : cat.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
