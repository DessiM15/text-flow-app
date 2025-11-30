import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function GET(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 })
    }

    const client = twilio(accountSid, authToken)
    
    // Get account info to check if it's a trial account
    const account = await client.api.accounts(accountSid).fetch()
    
    // Get recent messages to check status
    const messages = await client.messages.list({ limit: 10 })
    
    // Get detailed info for each message
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          const details = await client.messages(msg.sid).fetch()
          return {
            sid: details.sid,
            to: details.to,
            from: details.from,
            status: details.status,
            errorCode: details.errorCode,
            errorMessage: details.errorMessage,
            dateCreated: details.dateCreated,
            dateSent: details.dateSent,
            dateUpdated: details.dateUpdated,
            price: details.price,
            priceUnit: details.priceUnit,
            uri: details.uri,
            // Additional diagnostic info
            direction: details.direction,
            numSegments: details.numSegments,
          }
        } catch (err: any) {
          return {
            sid: msg.sid,
            to: msg.to,
            from: msg.from,
            status: msg.status,
            errorCode: msg.errorCode,
            errorMessage: msg.errorMessage,
            error: err.message,
          }
        }
      })
    )
    
    // Check Twilio phone number
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
    let phoneNumberInfo = null
    if (twilioPhoneNumber) {
      try {
        const incomingNumbers = await client.incomingPhoneNumbers.list({ phoneNumber: twilioPhoneNumber })
        if (incomingNumbers.length > 0) {
          phoneNumberInfo = {
            phoneNumber: incomingNumbers[0].phoneNumber,
            friendlyName: incomingNumbers[0].friendlyName,
            capabilities: incomingNumbers[0].capabilities,
          }
        }
      } catch (err) {
        // Ignore errors fetching phone number info
      }
    }
    
    return NextResponse.json({
      accountType: account.type,
      accountStatus: account.status,
      twilioPhoneNumber: twilioPhoneNumber,
      phoneNumberInfo: phoneNumberInfo,
      recentMessages: detailedMessages,
      diagnostics: {
        note: 'Error code 30032 usually means: unreachable handset, carrier filtering, or toll-free verification needed',
        trialAccountNote: account.type === 'Trial' ? 'Trial accounts can only send to verified numbers' : null,
      }
    })
  } catch (error: any) {
    console.error('Error checking Twilio status:', error)
    return NextResponse.json({
      error: error.message,
      details: error
    }, { status: 500 })
  }
}

