# Mock Data Locations and API Integration Plan

## Current Mock Data Implementations

### 1. Dashboard Components

#### `client/src/pages/Dashboard.tsx`
**Mock Data Location:** Lines 15-65
```typescript
const mockTopics = [
  {
    id: '1',
    _id: '1',
    title: 'Python Programming Masterclass',
    description: 'Learn Python from scratch...',
    progress: 65,
    totalLessons: 42,
    completedLessons: 27,
    // ... more mock data
  }
];
```

**Required API Integration:**
- **Endpoint:** `GET /api/topics` (already exists)
- **Expected Response:**
```typescript
{
  success: boolean;
  count: number;
  topics: Topic[];
}
```

**Implementation Status:** ❌ Using mock data
**Priority:** HIGH

#### `client/src/components/Dashboard/RecentActivity.tsx`
**Mock Data Location:** Lines 12-45
```typescript
const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'lesson_completed',
    title: 'Python Basics - Variables',
    // ... mock activity data
  }
];
```

**Required API Integration:**
- **Endpoint:** `GET /api/progress/user` (already exists)
- **Implementation Status:** ❌ Using mock data
- **Priority:** MEDIUM

### 2. Progress Analytics

#### `client/src/components/Dashboard/ProgressAnalytics.tsx`
**Mock Data Location:** Component receives mock data from parent
**Required API Integration:**
- **Endpoint:** `GET /api/progress/analytics` (already exists)
- **Implementation Status:** ❌ Using mock data
- **Priority:** HIGH

#### `client/src/components/Dashboard/LearningStreakWidget.tsx`
**Mock Data Location:** Component receives mock streak data
**Required API Integration:**
- **Endpoint:** `GET /api/progress/analytics` (streak data included)
- **Implementation Status:** ❌ Using mock data
- **Priority:** MEDIUM

### 3. Learning Path Components

#### `client/src/pages/LearningPath.tsx`
**API Integration Status:** ✅ PROPERLY INTEGRATED
- Uses `learningPathsAPI.getById(id)`
- Uses `lessonsAPI.getByPath(id)`
- **Status:** GOOD - No changes needed

#### `client/src/pages/LessonViewer.tsx`
**API Integration Status:** ✅ PROPERLY INTEGRATED
- Uses `lessonsAPI.getById(id)`
- Uses `progressAPI.getLessonProgress(lessonId)`
- **Status:** GOOD - No changes needed

### 4. Authentication Components

#### `client/src/components/Auth/LoginForm.tsx`
**API Integration Status:** ✅ PROPERLY INTEGRATED
- Uses `useAuth()` context with real API calls
- **Status:** GOOD - No changes needed

## API Endpoints Documentation

### Existing Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/topics` | GET | Get user's topics | ✅ Available |
| `/api/topics/:id` | GET | Get single topic | ✅ Available |
| `/api/learning-paths/:id` | GET | Get learning path | ✅ Available |
| `/api/lessons/path/:pathId` | GET | Get lessons by path | ✅ Available |
| `/api/lessons/:id` | GET | Get single lesson | ✅ Available |
| `/api/progress/user` | GET | Get user progress | ✅ Available |
| `/api/progress/analytics` | GET | Get learning analytics | ✅ Available |
| `/api/progress/lesson/:lessonId` | GET | Get lesson progress | ✅ Available |
| `/api/assets` | GET | Get user assets | ✅ Available |
| `/api/videos/lesson/:lessonId` | GET | Get lesson videos | ✅ Available |

### Missing Endpoints Needed

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/users/me/activity` | GET | Recent user activity | HIGH |
| `/api/users/me/streak` | GET | Learning streak data | MEDIUM |
| `/api/topics/recommended` | GET | AI-recommended topics | LOW |

## Implementation Plan

### Phase 1: Critical Mock Data Removal (Week 1)

1. **Dashboard Topics Integration**
   - Replace `mockTopics` with `topicsAPI.getAll()`
   - Add loading states and error handling
   - Update TopicCard component to handle real data structure

2. **Progress Analytics Integration**
   - Connect ProgressAnalytics to `/api/progress/analytics`
   - Implement data transformation for chart components
   - Add fallback states for missing data

### Phase 2: Activity and Streak Data (Week 2)

1. **Create Missing Backend Endpoints**
   - Implement `/api/users/me/activity` endpoint
   - Implement `/api/users/me/streak` endpoint
   - Add proper data aggregation logic

2. **Frontend Integration**
   - Update RecentActivity component
   - Update LearningStreakWidget component
   - Add real-time data refresh capabilities

### Phase 3: Enhanced Features (Week 3)

1. **Real-time Updates**
   - Implement WebSocket connections for live progress updates
   - Add optimistic UI updates for better UX
   - Implement data caching strategies

2. **Error Handling & Loading States**
   - Standardize error handling across all components
   - Implement skeleton loading screens
   - Add retry mechanisms for failed requests

## Error Handling Strategy

### Standard Error Response Format
```typescript
interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: any;
}
```

### Loading State Implementation
```typescript
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any | null;
}
```

### Recommended Error Handling Pattern
```typescript
const [state, setState] = useState<LoadingState>({
  isLoading: true,
  error: null,
  data: null
});

useEffect(() => {
  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await api.getData();
      setState({ isLoading: false, error: null, data: response.data });
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: error.message || 'Failed to load data', 
        data: null 
      });
    }
  };
  
  fetchData();
}, []);
```