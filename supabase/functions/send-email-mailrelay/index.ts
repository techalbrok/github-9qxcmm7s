// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/setup_your_environment

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  leadId?: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
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
    const {
      to,
      subject,
      content,
      isHtml,
      apiKey,
      fromEmail,
      fromName,
      leadId,
    } = (await req.json()) as EmailRequest;

    if (!to || !subject || !content) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email address");
    }

    // Default API key if not provided
    const mailrelayApiKey =
      apiKey || "jEYpBnAqnFRaQWfeCskvWDqTKvZ8vLkMhiws24jR";

    // Prepare the request to Mailrelay API
    const mailrelayEndpoint = "https://api.mailrelay.com/v1/send_emails";

    const mailrelayPayload = {
      to: [{ email: to }],
      from_email: fromEmail,
      from_name: fromName,
      subject: subject,
      html: isHtml ? content : null,
      text: !isHtml ? content : null,
    };

    console.log(
      "Sending email via Mailrelay API:",
      JSON.stringify(mailrelayPayload, null, 2),
    );

    // Send the request to Mailrelay API
    const response = await fetch(mailrelayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": mailrelayApiKey,
      },
      body: JSON.stringify(mailrelayPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Mailrelay API error: ${JSON.stringify(responseData)}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully via Mailrelay",
        data: responseData,
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
    console.error("Error sending email via Mailrelay:", error.message);
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
