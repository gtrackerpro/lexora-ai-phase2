import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, BookOpen, Tag, Plus, X } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { topicsAPI } from '../services/api';

const createTopicSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type CreateTopicFormData = z.infer<typeof createTopicSchema>;

const CreateTopic: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      tags: [],
    },
  });

  const watchedTags = watch('tags');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      const newTags = [...tags, tagInput.trim().toLowerCase()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: CreateTopicFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await topicsAPI.create({
        title: data.title,
        description: data.description,
        tags: data.tags,
      });

      if (response.success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedTags = [
    'programming', 'web development', 'data science', 'machine learning',
    'design', 'business', 'marketing', 'photography', 'music', 'language'
  ];

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Topic</h1>
            <p className="text-dark-400">Start your personalized learning journey</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Topic Title */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
            <label htmlFor="title" className="block text-sm font-medium text-dark-300 mb-3">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Topic Title
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Python Programming Fundamentals"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
            <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-3">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe what you want to learn and your goals..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
            <label className="block text-sm font-medium text-dark-300 mb-3">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            
            {/* Tag Input */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-500/10 text-primary-400 text-sm rounded-full border border-primary-500/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-400 hover:text-primary-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div>
              <p className="text-xs text-dark-400 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter(tag => !tags.includes(tag))
                  .slice(0, 6)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const newTags = [...tags, tag];
                        setTags(newTags);
                        setValue('tags', newTags);
                      }}
                      className="px-3 py-1 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white text-sm rounded-full border border-dark-600 hover:border-dark-500 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>

            {errors.tags && (
              <p className="mt-2 text-sm text-red-400">{errors.tags.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-dark-800 hover:bg-dark-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Topic'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateTopic;