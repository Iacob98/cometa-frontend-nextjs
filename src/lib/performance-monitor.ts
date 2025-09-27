"use client";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface WebVitalsMetric extends PerformanceMetric {
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/analytics/performance';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializePerformanceObserver();
      this.initializeNavigationTiming();
      this.initializeUserTiming();
    }
  }

  private initializeWebVitals() {
    // Core Web Vitals monitoring
    this.observeMetric('CLS', (entry: any) => {
      this.recordWebVital('CLS', entry.value, this.getCLSRating(entry.value));
    });

    this.observeMetric('FID', (entry: any) => {
      this.recordWebVital('FID', entry.value, this.getFIDRating(entry.value));
    });

    this.observeMetric('LCP', (entry: any) => {
      this.recordWebVital('LCP', entry.value, this.getLCPRating(entry.value));
    });

    // Additional Web Vitals
    this.observeMetric('FCP', (entry: any) => {
      this.recordWebVital('FCP', entry.value, this.getFCPRating(entry.value));
    });

    this.observeMetric('TTFB', (entry: any) => {
      this.recordWebVital('TTFB', entry.value, this.getTTFBRating(entry.value));
    });
  }

  private initializePerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.recordLongTask(entry);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }

  private initializeNavigationTiming() {
    if (document.readyState === 'complete') {
      this.recordNavigationTiming();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.recordNavigationTiming(), 0);
      });
    }
  }

  private initializeUserTiming() {
    // Monitor custom user timings
    if ('PerformanceObserver' in window) {
      const userTimingObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('user-timing', entry.duration, {
            name: entry.name,
            startTime: entry.startTime,
          });
        }
      });
      userTimingObserver.observe({ entryTypes: ['measure'] });
    }
  }

  private observeMetric(name: string, callback: (entry: any) => void) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            callback(entry);
          }
        });
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn(`Failed to observe ${name}:`, e);
      }
    }
  }

  private recordWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: WebVitalsMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      rating,
      delta: value,
    };

    this.recordMetric(`web-vitals-${name}`, value, metric);

    // Send to analytics if enabled
    if (this.isEnabled && this.shouldSendMetric(name, value)) {
      this.sendMetricToAnalytics(metric);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connect': entry.connectEnd - entry.connectStart,
      'ssl-handshake': entry.connectEnd - entry.secureConnectionStart,
      'ttfb': entry.responseStart - entry.requestStart,
      'download': entry.responseEnd - entry.responseStart,
      'dom-interactive': entry.domInteractive - entry.navigationStart,
      'dom-complete': entry.domComplete - entry.navigationStart,
      'load-complete': entry.loadEventEnd - entry.navigationStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric(`navigation-${name}`, value);
      }
    });
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    const metrics = {
      [`${resourceType}-dns`]: entry.domainLookupEnd - entry.domainLookupStart,
      [`${resourceType}-connect`]: entry.connectEnd - entry.connectStart,
      [`${resourceType}-download`]: entry.responseEnd - entry.responseStart,
      [`${resourceType}-total`]: entry.responseEnd - entry.startTime,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric(`resource-${name}`, value, {
          url: entry.name,
          size: entry.transferSize || 0,
        });
      }
    });
  }

  private recordLongTask(entry: PerformanceEntry) {
    this.recordMetric('long-task', entry.duration, {
      startTime: entry.startTime,
      attribution: (entry as any).attribution,
    });

    // Warn about long tasks
    if (entry.duration > 100) {
      console.warn(`Long task detected: ${entry.duration}ms at ${entry.startTime}ms`);
    }
  }

  private recordNavigationTiming() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      this.recordNavigationMetrics(perfData);
    }
  }

  public recordMetric(name: string, value: number, metadata: any = {}) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricList = this.metrics.get(name)!;
    metricList.push(metric);

    // Keep only last 100 metrics per type
    if (metricList.length > 100) {
      metricList.shift();
    }

    // Log performance warnings
    this.checkPerformanceThresholds(name, value);
  }

  public startTimer(operationName: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(`timer-${operationName}`, duration);

      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }

      return duration;
    };
  }

  public measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    return operation()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`async-${operationName}`, duration, { success: true });
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`async-${operationName}`, duration, {
          success: false,
          error: error.message
        });
        throw error;
      });
  }

  public getMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.get(metricName) || [];
    }

    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach((metrics) => {
      allMetrics.push(...metrics);
    });

    return allMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getAverageMetric(metricName: string, timeWindow?: number): number {
    const metrics = this.getMetrics(metricName);

    let relevantMetrics = metrics;
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantMetrics = metrics.filter(m => m.timestamp > cutoff);
    }

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  public getPerformanceReport() {
    const report = {
      webVitals: {
        CLS: this.getAverageMetric('web-vitals-CLS', 60000), // Last minute
        FID: this.getAverageMetric('web-vitals-FID', 60000),
        LCP: this.getAverageMetric('web-vitals-LCP', 60000),
        FCP: this.getAverageMetric('web-vitals-FCP', 60000),
        TTFB: this.getAverageMetric('web-vitals-TTFB', 60000),
      },
      navigation: {
        dnsLookup: this.getAverageMetric('navigation-dns-lookup'),
        tcpConnect: this.getAverageMetric('navigation-tcp-connect'),
        ttfb: this.getAverageMetric('navigation-ttfb'),
        domInteractive: this.getAverageMetric('navigation-dom-interactive'),
        loadComplete: this.getAverageMetric('navigation-load-complete'),
      },
      resources: {
        jsDownload: this.getAverageMetric('resource-script-download'),
        cssDownload: this.getAverageMetric('resource-stylesheet-download'),
        imageDownload: this.getAverageMetric('resource-image-download'),
      },
      longTasks: this.getMetrics('long-task').length,
      url: window.location.href,
      timestamp: Date.now(),
    };

    return report;
  }

  private checkPerformanceThresholds(name: string, value: number) {
    const thresholds = {
      'web-vitals-LCP': 2500,
      'web-vitals-FID': 100,
      'web-vitals-CLS': 0.1,
      'web-vitals-FCP': 1800,
      'web-vitals-TTFB': 800,
      'navigation-load-complete': 3000,
      'long-task': 50,
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value} > ${threshold}`);
    }
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  private getResourceType(url: string): string {
    if (url.includes('.js') || url.includes('javascript')) return 'script';
    if (url.includes('.css') || url.includes('stylesheet')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  private shouldSendMetric(name: string, value: number): boolean {
    // Send Web Vitals and critical metrics
    if (name.startsWith('web-vitals')) return true;

    // Send slow operations
    if (value > 1000) return true;

    // Sample other metrics (10% sampling)
    return Math.random() < 0.1;
  }

  private async sendMetricToAnalytics(metric: PerformanceMetric) {
    try {
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(this.apiEndpoint, JSON.stringify(metric));
      } else {
        fetch(this.apiEndpoint, {
          method: 'POST',
          body: JSON.stringify(metric),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {}); // Ignore errors for analytics
      }
    } catch (error) {
      // Silently fail analytics
    }
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public clearMetrics() {
    this.metrics.clear();
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startTimer = (operationName: string) =>
    performanceMonitor.startTimer(operationName);

  const measureAsync = <T>(operationName: string, operation: () => Promise<T>) =>
    performanceMonitor.measureAsyncOperation(operationName, operation);

  const recordMetric = (name: string, value: number, metadata?: any) =>
    performanceMonitor.recordMetric(name, value, metadata);

  const getReport = () => performanceMonitor.getPerformanceReport();

  return {
    startTimer,
    measureAsync,
    recordMetric,
    getReport,
  };
}