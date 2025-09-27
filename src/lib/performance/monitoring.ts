// Performance monitoring and SLA compliance system
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  url?: string;
  userId?: string;
  projectId?: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
}

interface DeviceInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  memory?: number;
  hardwareConcurrency?: number;
}

interface SLAThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
  description: string;
}

interface SLAViolation {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
  url: string;
  userId?: string;
  projectId?: string;
  autoRecoveryAction?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private sessionId: string;
  private userId?: string;
  private projectId?: string;

  // SLA thresholds based on technical specifications
  private slaThresholds: SLAThreshold[] = [
    { metric: 'FCP', warning: 1200, critical: 1500, unit: 'ms', description: 'First Contentful Paint' },
    { metric: 'LCP', warning: 2000, critical: 2500, unit: 'ms', description: 'Largest Contentful Paint' },
    { metric: 'CLS', warning: 0.08, critical: 0.1, unit: '', description: 'Cumulative Layout Shift' },
    { metric: 'FID', warning: 80, critical: 100, unit: 'ms', description: 'First Input Delay' },
    { metric: 'TBT', warning: 150, critical: 200, unit: 'ms', description: 'Total Blocking Time' },
    { metric: 'SI', warning: 2500, critical: 3000, unit: 'ms', description: 'Speed Index' },
    { metric: 'TTI', warning: 2500, critical: 3000, unit: 'ms', description: 'Time to Interactive' },
    { metric: 'TTFB', warning: 400, critical: 500, unit: 'ms', description: 'Time to First Byte' },
  ];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObservers();
    this.startMetricsCollection();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setContext(userId?: string, projectId?: string) {
    this.userId = userId;
    this.projectId = projectId;
  }

  private setupPerformanceObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              this.recordMetric({
                name: 'LCP',
                value: entry.startTime,
                timestamp: new Date(),
                url: window.location.href,
              });
            }
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'first-input') {
              this.recordMetric({
                name: 'FID',
                value: entry.processingStart - entry.startTime,
                timestamp: new Date(),
                url: window.location.href,
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          if (clsValue > 0) {
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              timestamp: new Date(),
              url: window.location.href,
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // Navigation Timing Observer
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'navigation') {
              // TTFB
              this.recordMetric({
                name: 'TTFB',
                value: entry.responseStart - entry.requestStart,
                timestamp: new Date(),
                url: window.location.href,
              });

              // DOM Content Loaded
              this.recordMetric({
                name: 'DCL',
                value: entry.domContentLoadedEventEnd - entry.navigationStart,
                timestamp: new Date(),
                url: window.location.href,
              });

              // Load Event
              this.recordMetric({
                name: 'Load',
                value: entry.loadEventEnd - entry.navigationStart,
                timestamp: new Date(),
                url: window.location.href,
              });
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Paint Timing Observer
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              this.recordMetric({
                name: entry.name === 'first-contentful-paint' ? 'FCP' : entry.name,
                value: entry.startTime,
                timestamp: new Date(),
                url: window.location.href,
              });
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  private startMetricsCollection() {
    // Collect initial metrics
    this.collectInitialMetrics();

    // Collect metrics periodically
    setInterval(() => {
      this.collectRuntimeMetrics();
    }, 30000); // Every 30 seconds

    // Collect metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.collectFinalMetrics();
      this.sendMetricsBeacon();
    });

    // Collect metrics on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.collectRuntimeMetrics();
        this.sendMetricsBeacon();
      }
    });
  }

  private collectInitialMetrics() {
    const deviceInfo = this.getDeviceInfo();

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'JSHeapSize',
        value: memory.usedJSHeapSize / (1024 * 1024), // MB
        timestamp: new Date(),
        url: window.location.href,
        deviceInfo,
      });
    }

    // Connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric({
        name: 'ConnectionRTT',
        value: connection.rtt,
        timestamp: new Date(),
        url: window.location.href,
        deviceInfo,
      });

      this.recordMetric({
        name: 'ConnectionDownlink',
        value: connection.downlink,
        timestamp: new Date(),
        url: window.location.href,
        deviceInfo,
      });
    }
  }

  private collectRuntimeMetrics() {
    // Resource timing
    const resources = performance.getEntriesByType('resource');
    const recentResources = resources.filter(
      (resource) => resource.startTime > Date.now() - 30000 // Last 30 seconds
    );

    if (recentResources.length > 0) {
      const avgLoadTime = recentResources.reduce((sum, resource) => sum + resource.duration, 0) / recentResources.length;

      this.recordMetric({
        name: 'AvgResourceLoadTime',
        value: avgLoadTime,
        timestamp: new Date(),
        url: window.location.href,
      });
    }

    // Long tasks
    const longTasks = performance.getEntriesByType('longtask');
    if (longTasks.length > 0) {
      const totalBlockingTime = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);

      this.recordMetric({
        name: 'TBT',
        value: totalBlockingTime,
        timestamp: new Date(),
        url: window.location.href,
      });
    }
  }

  private collectFinalMetrics() {
    // Session duration
    const sessionDuration = Date.now() - parseInt(this.sessionId.split('_')[1]);
    this.recordMetric({
      name: 'SessionDuration',
      value: sessionDuration,
      timestamp: new Date(),
      url: window.location.href,
    });

    // Page views
    this.recordMetric({
      name: 'PageViews',
      value: 1,
      timestamp: new Date(),
      url: window.location.href,
    });
  }

  private getDeviceInfo(): DeviceInfo {
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      deviceInfo.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    if ('deviceMemory' in navigator) {
      deviceInfo.memory = (navigator as any).deviceMemory;
    }

    if ('hardwareConcurrency' in navigator) {
      deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency;
    }

    return deviceInfo;
  }

  private recordMetric(metric: PerformanceMetric) {
    const enrichedMetric = {
      ...metric,
      userId: this.userId,
      projectId: this.projectId,
      sessionId: this.sessionId,
      deviceInfo: metric.deviceInfo || this.getDeviceInfo(),
    };

    this.metrics.push(enrichedMetric);

    // Check SLA compliance
    this.checkSLACompliance(enrichedMetric);

    // Keep only recent metrics in memory
    const cutoffTime = Date.now() - 5 * 60 * 1000; // 5 minutes
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);
  }

  private checkSLACompliance(metric: PerformanceMetric) {
    const threshold = this.slaThresholds.find(t => t.metric === metric.name);
    if (!threshold) return;

    let violation: SLAViolation | null = null;

    if (metric.value > threshold.critical) {
      violation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric: metric.name,
        value: metric.value,
        threshold: threshold.critical,
        severity: 'critical',
        timestamp: metric.timestamp,
        url: metric.url || window.location.href,
        userId: metric.userId,
        projectId: metric.projectId,
        autoRecoveryAction: this.getAutoRecoveryAction(metric.name),
      };
    } else if (metric.value > threshold.warning) {
      violation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric: metric.name,
        value: metric.value,
        threshold: threshold.warning,
        severity: 'warning',
        timestamp: metric.timestamp,
        url: metric.url || window.location.href,
        userId: metric.userId,
        projectId: metric.projectId,
      };
    }

    if (violation) {
      this.handleSLAViolation(violation);
    }
  }

  private getAutoRecoveryAction(metric: string): string | undefined {
    const actions: Record<string, string> = {
      'LCP': 'preload_critical_resources',
      'FCP': 'optimize_critical_path',
      'CLS': 'reserve_space_for_dynamic_content',
      'FID': 'defer_non_essential_javascript',
      'TBT': 'break_up_long_tasks',
      'TTFB': 'optimize_server_response',
    };

    return actions[metric];
  }

  private handleSLAViolation(violation: SLAViolation) {
    // Log violation
    console.warn('SLA Violation:', violation);

    // Send to monitoring service
    this.sendViolationAlert(violation);

    // Execute auto-recovery action if available
    if (violation.autoRecoveryAction) {
      this.executeAutoRecovery(violation.autoRecoveryAction, violation);
    }
  }

  private sendViolationAlert(violation: SLAViolation) {
    // Send to external monitoring service
    fetch('/api/performance/violations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(violation),
    }).catch(error => {
      console.error('Failed to send SLA violation alert:', error);
    });
  }

  private executeAutoRecovery(action: string, violation: SLAViolation) {
    switch (action) {
      case 'preload_critical_resources':
        this.preloadCriticalResources();
        break;
      case 'optimize_critical_path':
        this.optimizeCriticalPath();
        break;
      case 'defer_non_essential_javascript':
        this.deferNonEssentialJavaScript();
        break;
      default:
        console.log(`Auto-recovery action "${action}" not implemented`);
    }
  }

  private preloadCriticalResources() {
    // Identify and preload critical resources
    const criticalResources = [
      '/fonts/main.woff2',
      '/css/critical.css',
      '/js/critical.js',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = this.getResourceType(resource);
      document.head.appendChild(link);
    });
  }

  private optimizeCriticalPath() {
    // Inline critical CSS and defer non-critical stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach((sheet: any) => {
      if (!sheet.media || sheet.media === 'all') {
        sheet.media = 'print';
        sheet.onload = () => {
          sheet.media = 'all';
        };
      }
    });
  }

  private deferNonEssentialJavaScript() {
    // Add defer attribute to non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script: any) => {
      if (!script.src.includes('critical') && !script.defer && !script.async) {
        script.defer = true;
      }
    });
  }

  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'style';
    if (url.includes('.js')) return 'script';
    if (url.includes('.woff') || url.includes('.woff2')) return 'font';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) return 'image';
    return 'fetch';
  }

  private sendMetricsBeacon() {
    if (this.metrics.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      projectId: this.projectId,
      metrics: this.metrics.slice(), // Copy array
      timestamp: new Date().toISOString(),
    };

    // Use sendBeacon for reliable delivery
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/performance/metrics', JSON.stringify(payload));
    } else {
      // Fallback for older browsers
      fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(error => {
        console.error('Failed to send performance metrics:', error);
      });
    }

    // Clear sent metrics
    this.metrics = [];
  }

  // Public methods
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getSLAStatus(): { compliant: boolean; violations: number } {
    const recentViolations = this.metrics.filter(metric => {
      const threshold = this.slaThresholds.find(t => t.metric === metric.name);
      return threshold && metric.value > threshold.warning;
    });

    return {
      compliant: recentViolations.length === 0,
      violations: recentViolations.length,
    };
  }

  public startCustomMeasurement(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric({
        name,
        value: endTime - startTime,
        timestamp: new Date(),
        url: window.location.href,
      });
    };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.sendMetricsBeacon();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getSLAStatus: () => performanceMonitor.getSLAStatus(),
    startMeasurement: (name: string) => performanceMonitor.startCustomMeasurement(name),
    setContext: (userId?: string, projectId?: string) => performanceMonitor.setContext(userId, projectId),
  };
}