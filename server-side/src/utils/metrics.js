/**
 * Application Metrics Tracking
 * Monitors performance, errors, and business metrics
 */

/**
 * Metrics collector
 */
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        avgResponseTime: 0,
        responseTimes: []
      },
      database: {
        queryCount: 0,
        avgQueryTime: 0,
        queryTimes: [],
        errors: 0
      },
      auth: {
        logins: 0,
        registrations: 0,
        loginFailures: 0,
        tokenRefreshes: 0
      },
      jobs: {
        total: 0,
        completed: 0,
        failed: 0,
        avgDuration: 0,
        durations: []
      },
      api: {
        endpoints: {},
        errors: {
          '400': 0,
          '401': 0,
          '403': 0,
          '404': 0,
          '500': 0,
          other: 0
        }
      },
      business: {
        coursesCreated: 0,
        examAttempts: 0,
        enrollments: 0,
        certificatesGenerated: 0,
        submissionsGraded: 0
      }
    };

    this.thresholds = {
      responseTimeWarning: 1000, // ms
      responseTimeError: 5000,
      queryTimeWarning: 500,
      queryTimeError: 2000,
      jobDurationWarning: 10000
    };
  }

  /**
   * Track HTTP request
   */
  trackRequest(method, path, statusCode, duration) {
    this.metrics.requests.total++;
    this.metrics.requests.responseTimes.push(duration);

    // Keep only last 100 response times for averaging
    if (this.metrics.requests.responseTimes.length > 100) {
      this.metrics.requests.responseTimes.shift();
    }

    this.metrics.requests.avgResponseTime = 
      this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.requests.responseTimes.length;

    if (statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Track by endpoint
    const endpoint = `${method} ${path}`;
    if (!this.metrics.api.endpoints[endpoint]) {
      this.metrics.api.endpoints[endpoint] = {
        calls: 0,
        errors: 0,
        avgTime: 0,
        slowest: 0,
        fastest: Infinity
      };
    }

    this.metrics.api.endpoints[endpoint].calls++;
    this.metrics.api.endpoints[endpoint].avgTime = 
      (this.metrics.api.endpoints[endpoint].avgTime + duration) / 2;
    this.metrics.api.endpoints[endpoint].slowest = 
      Math.max(this.metrics.api.endpoints[endpoint].slowest, duration);
    this.metrics.api.endpoints[endpoint].fastest = 
      Math.min(this.metrics.api.endpoints[endpoint].fastest, duration);

    // Track errors
    if (statusCode >= 400) {
      const errorCode = statusCode.toString();
      this.metrics.api.errors[errorCode] = (this.metrics.api.errors[errorCode] || 0) + 1;
    }
  }

  /**
   * Track database query
   */
  trackDatabaseQuery(duration, error = false) {
    this.metrics.database.queryCount++;
    this.metrics.database.queryTimes.push(duration);

    if (this.metrics.database.queryTimes.length > 100) {
      this.metrics.database.queryTimes.shift();
    }

    this.metrics.database.avgQueryTime = 
      this.metrics.database.queryTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.database.queryTimes.length;

    if (error) {
      this.metrics.database.errors++;
    }
  }

  /**
   * Track authentication event
   */
  trackAuthEvent(eventType) {
    const eventKey = eventType.toLowerCase();
    if (this.metrics.auth[eventKey] !== undefined) {
      this.metrics.auth[eventKey]++;
    }
  }

  /**
   * Track job completion
   */
  trackJobCompletion(jobName, duration, failed = false) {
    this.metrics.jobs.total++;
    this.metrics.jobs.durations.push(duration);

    if (this.metrics.jobs.durations.length > 100) {
      this.metrics.jobs.durations.shift();
    }

    this.metrics.jobs.avgDuration = 
      this.metrics.jobs.durations.reduce((a, b) => a + b, 0) / 
      this.metrics.jobs.durations.length;

    if (failed) {
      this.metrics.jobs.failed++;
    } else {
      this.metrics.jobs.completed++;
    }
  }

  /**
   * Track business event
   */
  trackBusinessEvent(eventType, count = 1) {
    const eventKey = eventType.toLowerCase();
    if (this.metrics.business[eventKey] !== undefined) {
      this.metrics.business[eventKey] += count;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      ...this.metrics
    };
  }

  /**
   * Get formatted metrics report
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: this.metrics.requests.total,
        successRate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : 'N/A',
        avgResponseTime: this.metrics.requests.avgResponseTime.toFixed(2) + 'ms',
        errorRate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.errors / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : 'N/A'
      },
      database: {
        queryCount: this.metrics.database.queryCount,
        avgQueryTime: this.metrics.database.avgQueryTime.toFixed(2) + 'ms',
        errorCount: this.metrics.database.errors
      },
      auth: {
        totalLogins: this.metrics.auth.logins,
        loginFailures: this.metrics.auth.loginFailures,
        registrations: this.metrics.auth.registrations
      },
      jobs: {
        total: this.metrics.jobs.total,
        completed: this.metrics.jobs.completed,
        failed: this.metrics.jobs.failed,
        avgDuration: this.metrics.jobs.avgDuration.toFixed(2) + 'ms'
      },
      business: this.metrics.business
    };
  }

  /**
   * Check for alerts
   */
  getAlerts() {
    const alerts = [];

    if (this.metrics.requests.avgResponseTime > this.thresholds.responseTimeError) {
      alerts.push({
        level: 'critical',
        message: `Response time avg ${this.metrics.requests.avgResponseTime.toFixed(0)}ms exceeds error threshold`,
        metric: 'avgResponseTime'
      });
    } else if (this.metrics.requests.avgResponseTime > this.thresholds.responseTimeWarning) {
      alerts.push({
        level: 'warning',
        message: `Response time avg ${this.metrics.requests.avgResponseTime.toFixed(0)}ms exceeds warning threshold`,
        metric: 'avgResponseTime'
      });
    }

    if (this.metrics.database.avgQueryTime > this.thresholds.queryTimeError) {
      alerts.push({
        level: 'critical',
        message: `Query time avg ${this.metrics.database.avgQueryTime.toFixed(0)}ms exceeds error threshold`,
        metric: 'avgQueryTime'
      });
    } else if (this.metrics.database.avgQueryTime > this.thresholds.queryTimeWarning) {
      alerts.push({
        level: 'warning',
        message: `Query time avg ${this.metrics.database.avgQueryTime.toFixed(0)}ms exceeds warning threshold`,
        metric: 'avgQueryTime'
      });
    }

    if (this.metrics.requests.errors > 0) {
      const errorRate = (this.metrics.requests.errors / this.metrics.requests.total) * 100;
      if (errorRate > 10) {
        alerts.push({
          level: 'warning',
          message: `Error rate ${errorRate.toFixed(2)}% is elevated (${this.metrics.requests.errors} errors)`,
          metric: 'errorRate'
        });
      }
    }

    if (this.metrics.jobs.failed > 0) {
      const failureRate = (this.metrics.jobs.failed / this.metrics.jobs.total) * 100;
      if (failureRate > 5) {
        alerts.push({
          level: 'warning',
          message: `Job failure rate ${failureRate.toFixed(2)}% (${this.metrics.jobs.failed} failures)`,
          metric: 'jobFailureRate'
        });
      }
    }

    return alerts;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.__init__();
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;
