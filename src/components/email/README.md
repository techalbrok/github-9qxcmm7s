# Email System Documentation

## Overview

This email system allows sending emails using a configurable SMTP server. The configuration is stored in the Supabase database, but the actual email sending is handled by a client-side implementation that simulates sending emails.

## Components

### Email Service

The `emailService.ts` file contains the core functionality for sending emails:

- `sendEmail`: Sends a single email using the provided SMTP configuration
- `sendMassEmails`: Sends emails to multiple recipients in sequence

### Email API

The `emailApi.ts` file provides functions for interacting with the email settings in the database:

- `getEmailSettings`: Retrieves the SMTP configuration from the database
- `saveEmailSettings`: Saves SMTP configuration to the database
- `logCommunication`: Logs email communications in the database

### UI Components

- `EmailSettingsForm`: Allows users to configure SMTP settings
- `SendEmailDialog`: Dialog for sending an email to a single recipient
- `MassEmailDialog`: Dialog for sending emails to multiple recipients
- `EmailEditor`: Editor component for composing emails

## Implementation Notes

In a real production environment, the email sending would be handled by a server-side implementation. The current implementation uses a client-side mock that simulates sending emails.

To implement a real email sending system:

1. Create a server-side API endpoint that accepts email requests
2. Use a library like Nodemailer to send emails via SMTP
3. Update the `sendEmail` function to call this API endpoint

## Security Considerations

- SMTP passwords are stored in the database and should be encrypted
- In a production environment, email sending should be handled server-side to protect credentials
- Rate limiting should be implemented to prevent abuse
