/**
 * Structured Logging Service
 * Replaces console.log with proper logging levels and context
 * Future: Can be extended to send logs to Sentry, LogRocket, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private serviceName: string;
  private isDevelopment: boolean;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;

    if (this.isDevelopment) {
      // Colorful console output for development
      const levelColors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const color = levelColors[level];

      let output = `${color}[${level.toUpperCase()}]${reset} [${this.serviceName}] ${message}`;

      if (context && Object.keys(context).length > 0) {
        output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
      }

      if (error) {
        output += `\n  Error: ${error.message}\n  Stack: ${error.stack}`;
      }

      return output;
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify({
        service: this.serviceName,
        timestamp,
        level,
        message,
        context,
        error: error ? {
          message: error.message,
          stack: error.stack,
        } : undefined,
      });
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Output to console based on level
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }

    // Future: Send to external logging service (Sentry, LogRocket, etc.)
    // if (level === 'error' && !this.isDevelopment) {
    //   Sentry.captureException(error || new Error(message), { extra: context });
    // }
  }

  /**
   * Debug logs (only in development)
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Info logs (general information)
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Warning logs (potential issues)
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Error logs (actual errors)
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }
}

/**
 * Create a logger instance for a specific service
 * @param serviceName - Name of the service (e.g., 'VAPI Webhook', 'AI Chat', etc.)
 */
export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}

/**
 * Default logger (use when service name is not critical)
 */
export const logger = createLogger('App');
