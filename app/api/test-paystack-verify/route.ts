import { NextResponse } from 'next/server';

/**
 * This is a test-only endpoint that simulates a Paystack verification response
 * It should NOT be used in production!
 */
export async function POST(request: Request) {
  try {
    const { reference, amount = 10000, status = 'success' } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }
    
    console.log('Generating mock Paystack verification response for:', reference);
    
    // Return a mocked Paystack response structure
    return NextResponse.json({
      "status": true,
      "message": "Verification successful",
      "data": {
        "id": 12345678,
        "domain": "test",
        "status": status,
        "reference": reference,
        "amount": amount,
        "message": null,
        "gateway_response": "Successful",
        "paid_at": new Date().toISOString(),
        "created_at": new Date().toISOString(),
        "channel": "mobile_money",
        "currency": "GHS",
        "ip_address": "127.0.0.1",
        "metadata": {
          "name": "Test User",
          "phone": "0551234567",
          "service_id": "test-service"
        },
        "log": {
          "start_time": Math.floor(Date.now() / 1000) - 60,
          "time_spent": 60,
          "attempts": 1,
          "errors": 0,
          "success": true,
          "mobile": true,
          "input": [],
          "history": [
            {
              "type": "action",
              "message": "Attempted to pay",
              "time": Math.floor(Date.now() / 1000) - 50
            },
            {
              "type": "success",
              "message": "Payment successful",
              "time": Math.floor(Date.now() / 1000) - 10
            }
          ]
        },
        "fees": amount * 0.015,
        "fees_split": null,
        "authorization": {
          "authorization_code": "AUTH_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          "bin": "055",
          "last4": "4567",
          "exp_month": "12",
          "exp_year": "23",
          "channel": "mobile_money",
          "card_type": null,
          "bank": null,
          "country_code": "GH",
          "brand": "Mobile Money",
          "reusable": true,
          "signature": "SIG_" + Math.random().toString(36).substring(2, 10),
          "account_name": "Test Account"
        },
        "customer": {
          "id": 98765432,
          "first_name": "Test",
          "last_name": "User",
          "email": "test@example.com",
          "customer_code": "CUS_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          "phone": "0551234567",
          "metadata": null,
          "risk_action": "default",
          "international_format_phone": "+233551234567"
        },
        "plan": null,
        "split": {},
        "order_id": null,
        "paidAt": new Date().toISOString(),
        "createdAt": new Date().toISOString(),
        "requested_amount": amount,
        "transaction_date": new Date().toISOString(),
        "plan_object": {},
        "subaccount": {}
      }
    });
    
  } catch (error) {
    console.error('Error generating mock Paystack verification:', error);
    return NextResponse.json(
      { error: 'Test failed', details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 