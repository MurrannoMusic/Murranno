import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromotionCategory } from '@/types/promotion';

interface CategoryFilterProps {
  categories: PromotionCategory[];
  selectedCategory: PromotionCategory | 'all';
  onCategoryChange: (category: PromotionCategory | 'all') => void;
  serviceCounts?: Record<string, number>;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  serviceCounts = {}
}: CategoryFilterProps) => {
  return (
    <div className="w-full md:w-[200px]">
      <Select
        value={selectedCategory}
        onValueChange={(value) => onCategoryChange(value as PromotionCategory | 'all')}
      >
        <SelectTrigger className="w-full h-8 text-xs rounded-full bg-background/50 backdrop-blur-sm border-white/10">
          <SelectValue placeholder="Filter by usage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Services {serviceCounts['all'] ? `(${serviceCounts['all']})` : ''}
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category} className="text-xs">
              {category} {serviceCounts[category] ? `(${serviceCounts[category]})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
