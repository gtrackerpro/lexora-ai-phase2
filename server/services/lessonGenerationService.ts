import groqService from './groqService';
import Lesson from '../models/Lesson';
import LearningPath from '../models/LearningPath';
import Topic from '../models/Topic';
import mongoose from 'mongoose';

interface LessonPlan {
  week: number;
  day: number;
  title: string;
  objectives: string[];
  estimatedMinutes: number;
}

interface GeneratedLessonContent {
  content: string;
  script: string;
  objectives: string[];
  estimatedDuration: number;
}

class LessonGenerationService {
  /**
   * Generate a complete curriculum for a learning path
   */
  async generateCurriculum(learningPathId: string): Promise<LessonPlan[]> {
    try {
      const learningPath = await LearningPath.findById(learningPathId)
        .populate('topicId', 'title description tags');

      if (!learningPath) {
        throw new Error('Learning path not found');
      }

      const topic = learningPath.topicId as any;
      
      // Generate curriculum using AI
      const curriculum = await groqService.generateDetailedCurriculum({
        topic: topic.title,
        description: topic.description,
        tags: topic.tags,
        difficulty: learningPath.difficulty,
        weeks: learningPath.weeks,
        totalHours: learningPath.estimatedTotalHours,
        goals: learningPath.goal
      });

      return curriculum;
    } catch (error) {
      console.error('Curriculum Generation Error:', error);
      throw new Error('Failed to generate curriculum');
    }
  }

  /**
   * Generate all lessons for a learning path
   */
  async generateAllLessons(learningPathId: string, userId: mongoose.Types.ObjectId): Promise<any[]> {
    try {
      const learningPath = await LearningPath.findById(learningPathId)
        .populate('topicId', 'title description tags');

      if (!learningPath) {
        throw new Error('Learning path not found');
      }

      // Check if lessons already exist
      const existingLessons = await Lesson.find({ learningPathId });
      if (existingLessons.length > 0) {
        console.log(`Lessons already exist for learning path ${learningPathId}`);
        return existingLessons;
      }

      // Generate curriculum
      const curriculum = await this.generateCurriculum(learningPathId);
      const lessons = [];

      // Generate lessons in batches to avoid overwhelming the AI service
      const batchSize = 3;
      for (let i = 0; i < curriculum.length; i += batchSize) {
        const batch = curriculum.slice(i, i + batchSize);
        const batchPromises = batch.map(lessonPlan => 
          this.generateSingleLesson(learningPath, lessonPlan, userId)
        );
        
        const batchResults = await Promise.all(batchPromises);
        lessons.push(...batchResults);

        // Add delay between batches to respect API rate limits
        if (i + batchSize < curriculum.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`Generated ${lessons.length} lessons for learning path ${learningPathId}`);
      return lessons;
    } catch (error) {
      console.error('Lesson Generation Error:', error);
      throw new Error('Failed to generate lessons');
    }
  }

  /**
   * Generate a single lesson with content and script
   */
  private async generateSingleLesson(
    learningPath: any, 
    lessonPlan: LessonPlan, 
    userId: mongoose.Types.ObjectId
  ): Promise<any> {
    try {
      const topic = learningPath.topicId;
      
      // Generate detailed lesson content
      const lessonContent = await groqService.generateDetailedLessonContent({
        topic: topic.title,
        lessonTitle: lessonPlan.title,
        objectives: lessonPlan.objectives,
        difficulty: learningPath.difficulty,
        week: lessonPlan.week,
        day: lessonPlan.day,
        context: {
          description: topic.description,
          tags: topic.tags,
          goals: learningPath.goal
        }
      });

      // Generate narration script
      const script = await groqService.generateNarrationScript({
        content: lessonContent.content,
        title: lessonPlan.title,
        objectives: lessonPlan.objectives,
        tone: 'friendly',
        style: 'conversational'
      });

      // Create lesson in database
      const lesson = await Lesson.create({
        learningPathId: learningPath._id,
        topicId: learningPath.topicId._id,
        userId,
        title: lessonPlan.title,
        week: lessonPlan.week,
        day: lessonPlan.day,
        content: lessonContent.content,
        script,
        objectives: lessonPlan.objectives,
        status: 'finalized'
      });

      return lesson;
    } catch (error) {
      console.error(`Error generating lesson "${lessonPlan.title}":`, error);
      
      // Create a basic lesson if AI generation fails
      const fallbackLesson = await Lesson.create({
        learningPathId: learningPath._id,
        topicId: learningPath.topicId._id,
        userId,
        title: lessonPlan.title,
        week: lessonPlan.week,
        day: lessonPlan.day,
        content: `This lesson covers: ${lessonPlan.objectives.join(', ')}. Content will be generated shortly.`,
        script: `Welcome to ${lessonPlan.title}. In this lesson, we'll explore ${lessonPlan.objectives.join(', ')}.`,
        objectives: lessonPlan.objectives,
        status: 'draft'
      });

      return fallbackLesson;
    }
  }

  /**
   * Regenerate content for an existing lesson
   */
  async regenerateLesson(lessonId: string): Promise<any> {
    try {
      const lesson = await Lesson.findById(lessonId)
        .populate('learningPathId')
        .populate('topicId');

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      const learningPath = lesson.learningPathId as any;
      const topic = lesson.topicId as any;

      // Regenerate content
      const lessonContent = await groqService.generateDetailedLessonContent({
        topic: topic.title,
        lessonTitle: lesson.title,
        objectives: lesson.objectives,
        difficulty: learningPath.difficulty,
        week: lesson.week,
        day: lesson.day,
        context: {
          description: topic.description,
          tags: topic.tags,
          goals: learningPath.goal
        }
      });

      // Regenerate script
      const script = await groqService.generateNarrationScript({
        content: lessonContent.content,
        title: lesson.title,
        objectives: lesson.objectives,
        tone: 'friendly',
        style: 'conversational'
      });

      // Update lesson
      lesson.content = lessonContent.content;
      lesson.script = script;
      lesson.status = 'finalized';
      await lesson.save();

      return lesson;
    } catch (error) {
      console.error('Lesson Regeneration Error:', error);
      throw new Error('Failed to regenerate lesson');
    }
  }

  /**
   * Generate lessons for a specific week
   */
  async generateWeekLessons(learningPathId: string, week: number, userId: mongoose.Types.ObjectId): Promise<any[]> {
    try {
      const curriculum = await this.generateCurriculum(learningPathId);
      const weekLessons = curriculum.filter(lesson => lesson.week === week);
      
      const learningPath = await LearningPath.findById(learningPathId)
        .populate('topicId', 'title description tags');

      if (!learningPath) {
        throw new Error('Learning path not found');
      }

      const lessons = [];
      for (const lessonPlan of weekLessons) {
        const lesson = await this.generateSingleLesson(learningPath, lessonPlan, userId);
        lessons.push(lesson);
        
        // Add small delay between lessons
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return lessons;
    } catch (error) {
      console.error('Week Lessons Generation Error:', error);
      throw new Error('Failed to generate week lessons');
    }
  }
}

export default new LessonGenerationService();