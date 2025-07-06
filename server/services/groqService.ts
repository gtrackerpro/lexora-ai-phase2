import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface CurriculumParams {
  topic: string;
  description: string;
  tags: string[];
  difficulty: string;
  weeks: number;
  totalHours: number;
  goals: string;
}

interface LessonContentParams {
  topic: string;
  lessonTitle: string;
  objectives: string[];
  difficulty: string;
  week: number;
  day: number;
  context: {
    description: string;
    tags: string[];
    goals: string;
  };
}

interface ScriptParams {
  content: string;
  title: string;
  objectives: string[];
  tone: 'friendly' | 'professional' | 'casual';
  style: 'conversational' | 'formal' | 'tutorial';
}

class GroqService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables');
    }
  }

  async generateDetailedCurriculum(params: CurriculumParams): Promise<any[]> {
    try {
      const prompt = `Create a detailed ${params.weeks}-week curriculum for "${params.topic}" at ${params.difficulty} level.

Topic Description: ${params.description}
Tags: ${params.tags.join(', ')}
Total Hours: ${params.totalHours}
Learning Goals: ${params.goals}

Create a day-by-day breakdown with 5 lessons per week. Each lesson should be 15-20 minutes.

Return a JSON array with this exact structure:
[
  {
    "week": 1,
    "day": 1,
    "title": "Lesson Title",
    "objectives": ["objective1", "objective2", "objective3"],
    "estimatedMinutes": 15
  }
]

Make sure:
- Lessons build upon each other progressively
- Each lesson has 3-5 clear, actionable objectives
- Content is appropriate for ${params.difficulty} level
- Practical exercises are included
- Real-world applications are emphasized`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert curriculum designer. Create structured, progressive learning paths that are engaging and practical. Always return valid JSON arrays.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from Groq API');
      }

      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // Return fallback curriculum
        return this.generateFallbackCurriculum(params);
      }
    } catch (error: any) {
      console.error('Groq Curriculum Generation Error:', error.response?.data || error.message);
      return this.generateFallbackCurriculum(params);
    }
  }

  async generateDetailedLessonContent(params: LessonContentParams): Promise<{ content: string; estimatedDuration: number }> {
    try {
      const prompt = `Create comprehensive lesson content for:

Topic: ${params.topic}
Lesson: ${params.lessonTitle}
Week ${params.week}, Day ${params.day}
Difficulty: ${params.difficulty}

Learning Objectives:
${params.objectives.map(obj => `- ${obj}`).join('\n')}

Context:
- Course Description: ${params.context.description}
- Related Tags: ${params.context.tags.join(', ')}
- Overall Goals: ${params.context.goals}

Create detailed lesson content including:
1. Introduction and motivation
2. Core concepts with clear explanations
3. Step-by-step examples
4. Practical exercises
5. Common mistakes to avoid
6. Summary and key takeaways
7. Next steps

Make it engaging, practical, and appropriate for ${params.difficulty} level learners.
Length: 800-1200 words for a 15-20 minute lesson.`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert instructor creating engaging educational content. Make lessons practical, clear, and actionable with real-world examples.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content || 'Failed to generate lesson content';
      return {
        content,
        estimatedDuration: Math.max(15, Math.min(20, Math.ceil(content.length / 50))) // Rough estimate
      };
    } catch (error: any) {
      console.error('Groq Lesson Content Error:', error.response?.data || error.message);
      return {
        content: `This lesson covers ${params.objectives.join(', ')}. Detailed content will be available shortly.`,
        estimatedDuration: 15
      };
    }
  }

  async generateNarrationScript(params: ScriptParams): Promise<string> {
    try {
      const prompt = `Convert the following lesson content into a natural, ${params.tone} ${params.style} script for video narration:

Lesson Title: ${params.title}
Learning Objectives: ${params.objectives.join(', ')}

Content:
${params.content}

Guidelines for ${params.tone} ${params.style} narration:
- Use a warm, encouraging tone
- Include natural pauses and transitions
- Make it sound like a knowledgeable instructor speaking directly to the student
- Keep it clear and easy to follow
- Add emphasis on key points
- Include encouraging remarks and motivation
- Use "you" to address the learner directly
- Add smooth transitions between sections
- Include calls to action for practice

Format as a natural speech script with appropriate pacing for video narration.`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional script writer for educational videos. Create engaging, natural-sounding narration scripts that feel like a personal tutor speaking directly to the student.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'Failed to generate narration script';
    } catch (error: any) {
      console.error('Groq Script Generation Error:', error.response?.data || error.message);
      return `Welcome to ${params.title}. In this lesson, we'll explore ${params.objectives.join(', ')}. Let's dive in and learn together!`;
    }
  }

  private generateFallbackCurriculum(params: CurriculumParams): any[] {
    const lessonsPerWeek = 5;
    const curriculum = [];
    
    for (let week = 1; week <= params.weeks; week++) {
      for (let day = 1; day <= lessonsPerWeek; day++) {
        curriculum.push({
          week,
          day,
          title: `${params.topic} - Week ${week}, Day ${day}`,
          objectives: [
            `Understand key concepts for day ${day}`,
            `Apply practical skills`,
            `Complete hands-on exercises`
          ],
          estimatedMinutes: 15
        });
      }
    }
    
    return curriculum;
  }

  async generateLearningPath(topic: string, difficulty: string, weeks: number, goals: string): Promise<any> {
    try {
      const prompt = `Create a detailed ${weeks}-week learning path for "${topic}" at ${difficulty} level.

Goals: ${goals}

Please provide a structured response with:
1. Course title and description
2. Weekly breakdown with specific topics
3. Learning objectives for each week
4. Estimated hours per week
5. Key skills to be developed
6. Practical projects or exercises

Format the response as a JSON object with the following structure:
{
  "title": "Course Title",
  "description": "Course description",
  "estimatedTotalHours": number,
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "description": "Week description",
      "topics": ["topic1", "topic2"],
      "objectives": ["objective1", "objective2"],
      "estimatedHours": number,
      "exercises": ["exercise1", "exercise2"]
    }
  ],
  "skills": ["skill1", "skill2"],
  "projects": ["project1", "project2"]
}`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational curriculum designer. Create comprehensive, practical learning paths that are engaging and achievable.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from Groq API');
      }

      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, return a structured fallback
        return {
          title: `${topic} - ${difficulty} Level`,
          description: content,
          estimatedTotalHours: weeks * 5,
          weeks: [],
          skills: [],
          projects: []
        };
      }
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate learning path');
    }
  }

  async generateLessonContent(topic: string, weekTitle: string, objectives: string[]): Promise<string> {
    try {
      const prompt = `Create detailed lesson content for:
Topic: ${topic}
Week: ${weekTitle}
Objectives: ${objectives.join(', ')}

Please provide:
1. Introduction to the topic
2. Key concepts and explanations
3. Step-by-step instructions or examples
4. Practice exercises
5. Summary and key takeaways

Make it engaging, practical, and easy to understand.`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert instructor creating engaging educational content. Make lessons practical, clear, and actionable.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'Failed to generate lesson content';
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate lesson content');
    }
  }

  async generateLessonScript(content: string): Promise<string> {
    try {
      const prompt = `Convert the following lesson content into a natural, conversational script for video narration:

${content}

Guidelines:
- Use a friendly, engaging tone
- Include natural pauses and transitions
- Make it sound like a knowledgeable instructor speaking directly to the student
- Keep it clear and easy to follow
- Add emphasis on key points
- Include encouraging remarks

Format as a script with natural speech patterns.`;

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional script writer for educational videos. Create engaging, natural-sounding narration scripts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 1200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'Failed to generate lesson script';
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate lesson script');
    }
  }
}

export default new GroqService();