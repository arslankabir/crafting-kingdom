import winston from 'winston';
import path from 'path';

// Create a custom logger with multiple transports
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'crafting-kingdoms' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    // File transport for combined logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    })
  ]
});

// Custom error handler
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
const globalErrorHandler = (err: Error, req: any, res: any, next: Function) => {
  const error = err instanceof AppError ? err : new AppError(err.message);
  
  // Log the error
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    statusCode: (error as AppError).statusCode
  });

  // Send response
  res.status((error as AppError).statusCode).json({
    status: 'error',
    message: error.isOperational ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export { 
  logger, 
  AppError, 
  globalErrorHandler 
};
