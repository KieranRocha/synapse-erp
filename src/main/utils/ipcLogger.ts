// IPC Logging Utility for Development
export class IPCLogger {
  private static isEnabled = process.env.NODE_ENV === 'development'

  static logRequest(channel: string, args?: any[]) {
    if (!this.isEnabled) return

    console.log(`📥 IPC Request: ${channel}`, {
      timestamp: new Date().toISOString(),
      args: args?.length ? args : 'no args',
      channel
    })
  }

  static logResponse(channel: string, result: any, duration: number) {
    if (!this.isEnabled) return

    console.log(`📤 IPC Response: ${channel}`, {
      timestamp: new Date().toISOString(),
      duration: `${duration.toFixed(2)}ms`,
      success: true,
      resultType: Array.isArray(result) ? `array(${result.length})` : typeof result
    })
  }

  static logError(channel: string, error: Error, duration: number) {
    if (!this.isEnabled) return

    console.error(`💥 IPC Error: ${channel}`, {
      timestamp: new Date().toISOString(),
      duration: `${duration.toFixed(2)}ms`,
      error: error.message,
      stack: error.stack?.split('\n')[1]?.trim()
    })
  }
}

// Wrapper function for handlers
export const withLogging = (channel: string, handler: (...args: any[]) => Promise<any>) => {
  return async (event: any, ...args: any[]) => {
    const start = performance.now()
    
    IPCLogger.logRequest(channel, args)
    
    try {
      const result = await handler(event, ...args)
      const duration = performance.now() - start
      
      IPCLogger.logResponse(channel, result, duration)
      return result
      
    } catch (error) {
      const duration = performance.now() - start
      
      IPCLogger.logError(channel, error as Error, duration)
      throw error
    }
  }
}