import { Logger } from '@nestjs/common';

export class ErrorHandler {
  private static logger = new Logger('ErrorHandler');

  static handle(error: Error, context?: string) {
    const errorContext = context ? `[${context}] ` : '';
    this.logger.error(`${errorContext}${error.message}`, error.stack);
    
    if (this.shouldAlert(error)) {
      this.sendAlert(error, context);
    }
  }

  private static shouldAlert(error: Error): boolean {
    return [
      'Database',
      'Connection',
      'Failed',
      'Timeout'
    ].some(keyword => error.name.includes(keyword) || 
       error.message.includes(keyword));
  }

  private static sendAlert(error: Error, context?: string) {
    // Implement your alert logic (Slack/Email/SMS)
    // Example: SlackService.sendToOpsChannel()
    console.error(`🚨 CRITICAL ${context} ALERT:`, error);
  }
}