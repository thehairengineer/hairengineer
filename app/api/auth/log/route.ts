import { NextRequest, NextResponse } from 'next/server';
import logger from '@/app/lib/logger';

/**
 * API endpoint to collect client-side auth logs
 * @param request The request object
 * @returns Empty 200 response
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for logging
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Parse the log data
    const body = await request.json();
    
    // Add client information
    const enhancedData = {
      ...body.data,
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'none',
      source: 'CLIENT'
    };
    
    // Use our logger to record the client log
    switch (body.level) {
      case 'ERROR':
        logger.auth.error(`[CLIENT] ${body.message}`, enhancedData);
        break;
      case 'WARN':
        logger.auth.warn(`[CLIENT] ${body.message}`, enhancedData);
        break;
      case 'INFO':
        logger.auth.info(`[CLIENT] ${body.message}`, enhancedData);
        break;
      default:
        logger.auth.debug(`[CLIENT] ${body.message}`, enhancedData);
    }
    
    // Return simple success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Log the error but still return 200 to not disrupt client
    logger.error('AUTH_LOG_API', 'Error processing client log', { error: String(error) });
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * Respond to OPTIONS requests for CORS
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 