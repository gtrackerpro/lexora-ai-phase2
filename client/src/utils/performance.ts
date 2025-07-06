// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  // Initialize performance observers
  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', { 
            loadTime: lastEntry.startTime,
            renderTime: 0,
            interactionTime: 0
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric('fid', {
              loadTime: 0,
              renderTime: 0,
              interactionTime: entry.processingStart - entry.startTime
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Record navigation metrics
  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.navigationStart,
      renderTime: entry.domContentLoadedEventEnd - entry.navigationStart,
      interactionTime: entry.domInteractive - entry.navigationStart
    };

    this.recordMetric('navigation', metrics);
  }

  // Record a performance metric
  recordMetric(name: string, metrics: PerformanceMetrics) {
    this.metrics.set(name, metrics);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.trackPerformance(name, metrics.loadTime, 'page_load');
    }
  }

  // Measure component render time
  measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    this.recordMetric(`component_${componentName}`, {
      loadTime: 0,
      renderTime: endTime - startTime,
      interactionTime: 0
    });

    return result;
  }

  // Measure async operation
  async measureAsync<T>(
    operationName: string,
    asyncFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await asyncFunction();
      const endTime = performance.now();
      
      this.recordMetric(`async_${operationName}`, {
        loadTime: endTime - startTime,
        renderTime: 0,
        interactionTime: 0
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`async_${operationName}_error`, {
        loadTime: endTime - startTime,
        renderTime: 0,
        interactionTime: 0
      });
      throw error;
    }
  }

  // Get memory usage (if available)
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return undefined;
  }

  // Get all recorded metrics
  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Get specific metric
  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
  }

  // Generate performance report
  generateReport(): {
    summary: Record<string, number>;
    details: Record<string, PerformanceMetrics>;
    recommendations: string[];
  } {
    const details: Record<string, PerformanceMetrics> = {};
    const summary: Record<string, number> = {};
    const recommendations: string[] = [];

    // Convert metrics to plain objects
    this.metrics.forEach((metrics, name) => {
      details[name] = metrics;
      summary[`${name}_load_time`] = metrics.loadTime;
      summary[`${name}_render_time`] = metrics.renderTime;
      summary[`${name}_interaction_time`] = metrics.interactionTime;
    });

    // Generate recommendations
    const navMetrics = this.metrics.get('navigation');
    if (navMetrics) {
      if (navMetrics.loadTime > 3000) {
        recommendations.push('Page load time is slow (>3s). Consider optimizing assets and reducing bundle size.');
      }
      if (navMetrics.renderTime > 1500) {
        recommendations.push('DOM content loaded time is slow (>1.5s). Consider code splitting and lazy loading.');
      }
    }

    const lcpMetrics = this.metrics.get('lcp');
    if (lcpMetrics && lcpMetrics.loadTime > 2500) {
      recommendations.push('Largest Contentful Paint is slow (>2.5s). Optimize images and critical rendering path.');
    }

    const fidMetrics = this.metrics.get('fid');
    if (fidMetrics && fidMetrics.interactionTime > 100) {
      recommendations.push('First Input Delay is high (>100ms). Reduce JavaScript execution time.');
    }

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage && memoryUsage > 50) {
      recommendations.push('High memory usage detected (>50MB). Check for memory leaks and optimize data structures.');
    }

    return { summary, details, recommendations };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    measureRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  };
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            img.onload = () => resolve();
            img.onerror = reject;
            observer.unobserve(img);
          }
        });
      });
      observer.observe(img);
    });
  },

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get connection speed
  getConnectionSpeed(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  },

  // Check if device has limited resources
  isLowEndDevice(): boolean {
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory < 4; // Less than 4GB RAM
    }
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency < 4; // Less than 4 CPU cores
    }
    return false;
  }
};

export default performanceMonitor;