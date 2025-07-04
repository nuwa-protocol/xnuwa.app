import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import type React from 'react';
import type { Category } from '../utils/model-utils';

interface CategoryGridProps {
    categories: Category[];
    onCategorySelect: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategorySelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
                <motion.div
                    key={category.id}
                    className="p-6 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onCategorySelect(category.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.count} models</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};