
interface LogContext {}
  [key: string]: unknown
}

type LogLevel = "debug" | "info" | "warn" | "error"

const emit = (level: LogLevel, message: string, context?: LogContext) => {}
  const payload = { level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }

  if (level === "error") {
    console.error(payload)
  } else if (level === "warn") {
    console.warn(payload)
  } else if (level === "debug") {
    if (process.env.NODE_ENV === "development") {
      console.debug(payload)
    }
  } else {}
    console.log(payload)
  }
}

export const logger = { debug(message: string, context?: LogContext) {
    emit("debug", message, context)
  },
  info(message: string, context?: LogContext) {
    emit("info", message, context)
  },
  warn(message: string, context?: LogContext) {
    emit("warn", message, context)
  },
  error(message: string, context?: LogContext) {
    emit("error", message, context)
  },
}
