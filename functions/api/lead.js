const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Check D1 binding
    if (!env.DB) {
      console.error("D1 binding 'DB' is missing.");

      return json(
        { error: "Database is not configured." },
        500
      );
    }

    // Read submitted data
    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { error: "Invalid submission." },
        400
      );
    }

    // Clean values
    const firstName = String(body.firstName || "")
      .trim()
      .slice(0, 80);

    const email = String(body.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 254);

    const source = String(
      body.source || "TEFL Landing Page"
    )
      .trim()
      .slice(0, 100);

    const marketingConsent =
      body.marketingConsent === true ? 1 : 0;

    // Validate
    if (!firstName) {
      return json(
        { error: "First name is required." },
        400
      );
    }

    if (!EMAIL_RE.test(email)) {
      return json(
        { error: "Please enter a valid email address." },
        400
      );
    }

    if (!marketingConsent) {
      return json(
        { error: "Consent is required." },
        400
      );
    }

    // Information stored automatically
    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const countryCode =
      request.cf?.country || null;

    const userAgent = String(
      request.headers.get("user-agent") || ""
    ).slice(0, 500);

    // Save every submission.
    // Duplicate email addresses are intentionally allowed.
    await env.DB
      .prepare(`
        INSERT INTO tefl_leads (
          id,
          first_name,
          email,
          submitted_at,
          marketing_consent,
          consent_text_version,
          source,
          country_code,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        firstName,
        email,
        submittedAt,
        marketingConsent,
        "v1",
        source,
        countryCode,
        userAgent
      )
      .run();

    return json(
      {
        success: true,
        id: id
      },
      201
    );

  } catch (error) {
    console.error("Lead save failed:", error);

    return json(
      {
        error:
          "We could not save your details. Please try again."
      },
      500
    );
  }
}

export async function onRequest(context) {
  return json(
    { error: "Method not allowed." },
    405
  );
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",
        "Cache-Control":
          "no-store",
        "X-Content-Type-Options":
          "nosniff"
      }
    }
  );
}
