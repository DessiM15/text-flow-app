# TextFlow App

A modern messaging application built with Next.js, Supabase, and Twilio for sending and receiving SMS messages.

## Features

- Send and receive SMS messages via Twilio
- Real-time message updates with polling
- Conversation list with last message preview
- Message history stored in Supabase
- Responsive design for mobile and desktop

## Setup Instructions

### 1. Database Setup (Supabase)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create the necessary tables:
   - `messages` - stores all sent and received messages
   - `contacts` - optional table for contact management

### 2. Environment Variables

Make sure your `.env.local` file has all the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Twilio Webhook Configuration

To receive incoming messages, configure your Twilio webhook:

1. Go to your Twilio Console
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Click on your Twilio phone number
4. Under "Messaging", set the webhook URL to:
   ```
   https://your-domain.com/api/twilio/webhook
   ```
   (For local development, use a tool like ngrok to expose your local server)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── config/          # API endpoint for app configuration
│   │   ├── conversations/   # API endpoint for fetching conversations
│   │   ├── messages/        # API endpoints for messages (GET, POST)
│   │   └── twilio/
│   │       └── webhook/     # Twilio webhook handler for incoming messages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main messaging interface
│   └── globals.css          # Global styles
├── components/
│   ├── ConversationList.tsx # Sidebar with conversation list
│   ├── MessageInput.tsx    # Message input component
│   └── MessageList.tsx     # Message display component
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Client-side Supabase client
│   │   ├── server.ts       # Server-side Supabase client
│   │   └── types.ts        # TypeScript types
│   └── twilio.ts           # Twilio client and utilities
└── supabase-schema.sql     # Database schema

```

## API Endpoints

### GET `/api/conversations`
Returns a list of all conversations with the last message and timestamp.

### GET `/api/messages?phoneNumber={phoneNumber}`
Returns messages for a specific phone number conversation.

### POST `/api/messages/send`
Sends an SMS message.
```json
{
  "to": "+1234567890",
  "message": "Hello, world!"
}
```

### POST `/api/twilio/webhook`
Webhook endpoint for Twilio to send incoming messages. Configure this in your Twilio console.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel's project settings
4. Update your Twilio webhook URL to point to your Vercel deployment

## Future Enhancements

- [ ] User authentication
- [ ] Contact management with names
- [ ] Message read receipts
- [ ] File attachments (MMS)
- [ ] Message search
- [ ] Real-time updates with Supabase Realtime
- [ ] Message templates
- [ ] Scheduled messages

