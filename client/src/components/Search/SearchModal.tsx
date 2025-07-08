import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  BookOpen, 
  Video, 
  Clock, 
  Filter,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { searchAPI, topicsAPI, lessonsAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'topic' | 'lesson' | 'video' | 'path';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  tags?: string[];
  thumbnail?: string;
  progress?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'topic' | 'lesson' | 'video' | 'path'>('all');
  const [searchError, setSearchError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Transform API results to match our SearchResult interface
  const transformApiResults = (apiResults: any): SearchResult[] => {
    if (!apiResults || !apiResults.topics) return [];
    
    return apiResults.topics.map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      description: item.description,
      type: 'topic' as const,
      difficulty: (item.difficulty?.toLowerCase() || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      duration: item.estimatedHours ? `${item.estimatedHours} hours` : undefined,
      tags: item.tags || [],
      progress: item.progress || 0
    }));
  };

  // Transform global search results to match our SearchResult interface
  const transformGlobalResults = (apiResults: any[]): SearchResult[] => {
    if (!Array.isArray(apiResults)) return [];
    
    return apiResults.map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      description: item.description || item.goal || '',
      type: item.type || 'topic',
      difficulty: (item.difficulty?.toLowerCase() || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      duration: item.estimatedTotalHours 
        ? `${item.estimatedTotalHours} hours` 
        : item.estimatedHours 
        ? `${item.estimatedHours} hours` 
        : undefined,
      tags: item.tags || [],
      progress: item.progress || 0
    }));
  };

  // Perform search using API
  const performSearch = async (searchQuery: string, filterType: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      setSearchError('');
      return;
    }

    try {
      setIsLoading(true);
      setSearchError('');
      
      let apiResults;
      
      if (filterType === 'all') {
        // Use global search API
        apiResults = await searchAPI.searchAll(searchQuery);
        setResults(transformGlobalResults(apiResults.results || []));
      } else if (filterType === 'topic') {
        // Use topic-specific search
        apiResults = await searchAPI.searchTopics(searchQuery);
        setResults(transformApiResults({ topics: apiResults.topics || [] }));
      } else {
        // For other specific types, use global search with filter
        apiResults = await searchAPI.searchAll(searchQuery, { type: filterType as any });
        setResults(transformGlobalResults(apiResults.results || []));
      }
      
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      performSearch(query, filter);
    }, 300); // Debounce search
    
    return () => clearTimeout(searchTimer);
  }, [query, filter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelect(results[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return <BookOpen className="w-4 h-4" />;
      case 'lesson':
        return <BookOpen className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'path':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-success-400 bg-success-600/20';
      case 'intermediate':
        return 'text-warning-400 bg-warning-600/20';
      case 'advanced':
        return 'text-error-400 bg-error-600/20';
      default:
        return 'text-primary-400 bg-primary-600/20';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="flex items-start justify-center min-h-screen pt-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-dark-900/95 backdrop-blur-xl border border-dark-700 rounded-2xl shadow-dark-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center p-4 border-b border-dark-800">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search topics, lessons, or anything..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-dark-400 focus:outline-none text-lg"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">Filter by:</span>
                <div className="flex space-x-2">
                  {['all', 'topic', 'lesson', 'video', 'path'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type as any)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filter === type
                          ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                          : 'bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700/50'
                      }`}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {query && (
                <span className="text-sm text-dark-400">
                  {isLoading ? 'Searching...' : `${results.length} results`}
                </span>
              )}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner w-6 h-6"></div>
                </div>
              ) : searchError ? (
                <div className="text-center py-8 text-error-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>{searchError}</p>
                  <button 
                    onClick={() => performSearch(query, filter)}
                    className="mt-3 px-4 py-2 bg-error-600/20 text-error-400 rounded-lg hover:bg-error-600/30 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : results.length === 0 && query ? (
                <div className="text-center py-8 text-dark-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-2">Try different keywords or filters</p>
                </div>
              ) : query === '' ? (
                <div className="text-center py-8 text-dark-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start typing to search</p>
                  <p className="text-sm mt-2">Find topics, lessons, videos, and learning paths</p>
                </div>
              ) : (
                <div className="p-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center p-4 rounded-xl transition-all cursor-pointer group ${
                        index === selectedIndex
                          ? 'bg-primary-600/20 border border-primary-600/30'
                          : 'hover:bg-dark-800/50'
                      }`}
                      onClick={() => {
                        onSelect(result);
                        onClose();
                      }}
                    >
                      <div className="flex-shrink-0 p-2 bg-dark-800/50 rounded-lg group-hover:bg-dark-700/50 transition-colors">
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white truncate">{result.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(result.difficulty)}`}>
                              {result.difficulty}
                            </span>
                            {result.duration && (
                              <div className="flex items-center space-x-1 text-xs text-dark-400">
                                <Clock className="w-3 h-3" />
                                <span>{result.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-dark-400 line-clamp-2 mb-2">{result.description}</p>
                        
                        {result.tags && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {result.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-0.5 text-xs bg-dark-800/50 text-dark-300 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-xs bg-dark-800/50 text-dark-300 rounded-md">
                                +{result.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {result.progress !== undefined && result.progress > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-dark-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${result.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-dark-400">{result.progress}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-dark-800 bg-dark-900/50">
              <div className="flex items-center space-x-4 text-xs text-dark-400">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-800 rounded text-xs">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-800 rounded text-xs">Enter</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-800 rounded text-xs">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
              <div className="text-xs text-dark-400">
                Powered by AI search
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
