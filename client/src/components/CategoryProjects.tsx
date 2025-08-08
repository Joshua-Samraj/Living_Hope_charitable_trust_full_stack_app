import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '../data/categories';
import { Project } from '../data/projects';
import { projectService } from '../services/projectService';

interface CategoryCardProps {
  category: Category;
  onClick: (keyword: string) => void;
  allProjects?: Project[]; // Optional prop to pass all projects
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, allProjects }) => {
  const [projectCount, setProjectCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Calculate project count when component mounts or category changes
  React.useEffect(() => {
    const fetchProjectCount = async () => {
      try {
        let count = 0;
        
        if (allProjects) {
          // Use passed projects if available
          count = allProjects.filter(p => p.category === category.keyword).length;
        } else {
          // Otherwise fetch from API
          const projects = await projectService.getProjectsByCategory(category.keyword);
          count = projects.length;
        }
        
        setProjectCount(count);
      } catch (error) {
        console.error('Error fetching project count:', error);
        setProjectCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectCount();
  }, [category.keyword, allProjects]);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(category.keyword)}
      className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group h-full flex flex-col"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
      
      <div className="relative z-10 px-8 pb-8 text-white flex-grow flex flex-col">
        {/* Full-width image without side padding */}
        <div className="-mx-8 relative w-auto aspect-[16/9] overflow-hidden rounded-t-lg group">
          <img 
            src={category.image} 
            alt={category.name}
            className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>

        <h3 className="text-2xl font-bold mb-2 mt-4">{category.name}</h3>

        <p className="text-white/90 mb-4 line-clamp-2 flex-grow">
          {category.description}
        </p>

        <div className="flex items-center justify-between">
          {loading ? (
            <div className="animate-pulse bg-white/20 rounded-full h-8 w-20"></div>
          ) : (
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
            </span>
          )}

          <motion.div
            className="flex items-center gap-2 text-sm font-medium"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
          >
            View Projects
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </motion.div>
  );
};

export default CategoryCard;