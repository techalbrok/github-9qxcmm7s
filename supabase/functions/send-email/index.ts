// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/setup_your_environment

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
  smtpSettings: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    smtp_secure: boolean;
    from_email: string;
    from_name: string;
  };
  leadId?: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const { to, subject, content, isHtml, smtpSettings } =
      (await req.json()) as EmailRequest;

    if (!to || !subject || !content || !smtpSettings) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email address");
    }

    // Validate SMTP settings
    if (
      !smtpSettings.smtp_host ||
      !smtpSettings.smtp_port ||
      !smtpSettings.smtp_user ||
      !smtpSettings.smtp_password ||
      !smtpSettings.from_email
    ) {
      throw new Error("Invalid SMTP settings");
    }

    // In a real implementation, you would use a library like nodemailer or similar
    // For this example, we'll simulate sending an email
    console.log(`Sending email to ${to} with subject: ${subject}`);
    console.log(`From: ${smtpSettings.from_name} <${smtpSettings.from_email}>`);
    console.log(`SMTP: ${smtpSettings.smtp_host}:${smtpSettings.smtp_port}`);
    console.log(`Content type: ${isHtml ? "HTML" : "Text"}`);

    // Simulate a delay for sending the email
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
        status: 400,
      },
    );
  }
});
