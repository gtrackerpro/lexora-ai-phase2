import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class GroqService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables');
    }
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