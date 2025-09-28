import { NextResponse } from 'next/server'

export async function GET() {}
  try {}
    // Basic health check;
    const healthCheck = { status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {}
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }

    return NextResponse.json(healthCheck)
  } catch {}
    return NextResponse.json({status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString() 
      },
      { status: 500 }
    )
  }
}
