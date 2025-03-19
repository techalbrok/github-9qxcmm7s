import { EmailData } from "@/components/email/EmailEditor";
import { Tables } from "@/types/supabase";

type EmailSettings = Tables<"email_settings">;

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  fromEmail: string;
  fromName: string;
}

export async function sendEmail(
  emailData: EmailData,
  smtpConfig: SmtpConfig,
  leadId?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Create the email payload
    const payload = {
      to: emailData.to,
      from: {
        email: smtpConfig.fromEmail,
        name: smtpConfig.fromName,
      },
      subject: emailData.subject,
      content: [
        {
          type: emailData.isHtml ? "text/html" : "text/plain",
          value: emailData.content,
        },
      ],
      smtp: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.user,
        password: smtpConfig.password,
        secure: smtpConfig.secure,
      },
      leadId,
    };

    // Send the email using the browser's fetch API
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error sending email");
    }

    const result = await response.json();
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
}

export async function sendMassEmails(
  recipients: { id: string; email: string }[],
  emailData: Omit<EmailData, "to">,
  smtpConfig: SmtpConfig,
): Promise<{ success: boolean; message: string; failedEmails?: string[] }> {
  const failedEmails: string[] = [];

  try {
    // Send emails in sequence to avoid overwhelming the server
    for (const recipient of recipients) {
      try {
        const result = await sendEmail(
          { ...emailData, to: recipient.email },
          smtpConfig,
          recipient.id,
        );

        if (!result.success) {
          failedEmails.push(recipient.email);
        }
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        failedEmails.push(recipient.email);
      }
    }

    if (failedEmails.length === 0) {
      return { success: true, message: "All emails sent successfully" };
    } else if (failedEmails.length < recipients.length) {
      return {
        success: true,
        message: `${recipients.length - failedEmails.length} of ${recipients.length} emails sent successfully`,
        failedEmails,
      };
    } else {
      return {
        success: false,
        message: "Failed to send any emails",
        failedEmails,
      };
    }
  } catch (error) {
    console.error("Error in mass email sending:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error sending mass emails",
      failedEmails,
    };
  }
}
