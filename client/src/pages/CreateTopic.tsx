import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Loader2,
  Lightbulb,
  Zap,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { topicsAPI } from '../services/api';
import Layout from '../components/Layout/Layout';

const createTopicSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  weeks: z.enum(['4', '6', '8', '12']),
  goals: z.string().optional(),
});

type CreateTopicFormData = z.infer<typeof createTopicSchema>;

const CreateTopic: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      difficulty: 'Beginner',
      weeks: '6',
      tags: [],
    },
  });

  const watchedTitle = watch('title');

  const suggestedTopics = [
    'Python Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Digital Marketing',
    'Graphic Design',
    'Photography',
    'Music Production',
  ];

  const suggestedTags = [
    'programming', 'web development', 'data science', 'machine learning',
    'design', 'business', 'marketing', 'photography', 'music', 'language'
  ];

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
    setIsGenerating(true);
    
    try {
      // Generate smart defaults if fields are empty
      const description = data.description?.trim() || `A comprehensive learning path about ${data.title} designed to help you master this subject.`;
      const goals = data.goals?.trim() || `Gain a solid understanding of ${data.title} concepts and be able to apply them in practical scenarios.`;
      
      const response = await topicsAPI.create({
        title: data.title,
        description,
        tags: tags,
        difficulty: data.difficulty,
        weeks: parseInt(data.weeks),
        goals,
      });

      if (response.success) {
        toast.success('Learning path created successfully with AI content!');
        // Navigate to the created learning path
        if (response.learningPath) {
          navigate(`/learning/${response.learningPath._id}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Topic creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create learning path. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestion = (topic: string) => {
    setValue('title', topic);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4 mb-8"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Learning Path</h1>
          <p className="text-dark-400 mt-2">Let AI create a personalized learning journey for you</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                What would you like to learn?
              </label>
              <input
                {...register('title')}
                type="text"
                className="input-field w-full"
                placeholder="e.g., Python Programming, Web Development, Data Science..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
              )}
              
              {/* Topic Suggestions */}
              {!watchedTitle && (
                <div className="mt-3">
                  <p className="text-sm text-dark-400 mb-2">Popular topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicSuggestion(topic)}
                        className="px-3 py-1 text-sm bg-dark-700 hover:bg-primary-600 text-white rounded-full transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description (optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field w-full resize-none"
                placeholder="Describe what you want to learn and your current knowledge level (we'll generate this if left empty)..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              
              {/* Tag Input */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 input-field"
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
                        className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm rounded-full border border-dark-600 hover:border-dark-500 transition-colors"
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

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                What's your current level?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <label key={level} className="relative">
                    <input
                      {...register('difficulty')}
                      type="radio"
                      value={level}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-checked:bg-opacity-10">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{level}</div>
                        <div className="text-sm text-dark-400 mt-1">
                          {level === 'Beginner' && 'New to this topic'}
                          {level === 'Intermediate' && 'Some experience'}
                          {level === 'Advanced' && 'Experienced learner'}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                How long do you want to spend learning?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: '4', label: '4 weeks', desc: 'Quick start' },
                  { value: '6', label: '6 weeks', desc: 'Balanced' },
                  { value: '8', label: '8 weeks', desc: 'Thorough' },
                  { value: '12', label: '12 weeks', desc: 'Comprehensive' },
                ].map((option) => (
                  <label key={option.value} className="relative">
                    <input
                      {...register('weeks')}
                      type="radio"
                      value={option.value}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-checked:bg-opacity-10">
                      <div className="text-center">
                        <div className="font-semibold text-white">{option.label}</div>
                        <div className="text-xs text-dark-400">{option.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                What are your learning goals? (optional)
              </label>
              <textarea
                {...register('goals')}
                rows={4}
                className="input-field w-full resize-none"
                placeholder="Describe what you want to achieve, specific skills you want to develop, or projects you want to build (we'll generate this if left empty)..."
              />
              {errors.goals && (
                <p className="mt-1 text-sm text-red-400">{errors.goals.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Generating your learning path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Create Learning Path</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* AI Features */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lexora-logo.png" 
                alt="Lexora" 
                className="h-5 w-5 object-contain"
              />
              <h3 className="text-lg font-semibold text-white">AI-Powered Learning</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <BookOpen className="h-5 w-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Structured Curriculum</p>
                  <p className="text-dark-400 text-xs">Week-by-week learning plan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Personalized Content</p>
                  <p className="text-dark-400 text-xs">Adapted to your learning style</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Progress Tracking</p>
                  <p className="text-dark-400 text-xs">Monitor your advancement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Tips for Success</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-dark-300">
                <span className="text-white font-medium">Be specific:</span> The more details you provide, the better your personalized learning path will be.
              </p>
              <p className="text-dark-300">
                <span className="text-white font-medium">Set realistic goals:</span> Choose a duration that fits your schedule and commitment level.
              </p>
              <p className="text-dark-300">
                <span className="text-white font-medium">Stay consistent:</span> Regular practice is key to mastering any skill.
              </p>
            </div>
          </div>

          {/* Generation Process */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-gradient-to-br from-primary-600 to-primary-700"
            >
              <div className="text-center">
                <img 
                  src="/lexora-logo.png" 
                  alt="Lexora" 
                  className="h-8 w-8 object-contain mx-auto mb-3 animate-pulse"
                />
                <h3 className="text-white font-semibold mb-2">Creating Your Path</h3>
                <p className="text-primary-100 text-sm">
                  Our AI is analyzing your preferences and generating a personalized learning curriculum...
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      </div>
    </Layout>
  );
};

export default CreateTopic;