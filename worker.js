const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/lead' && request.method === 'POST') {
      return saveLead(request, env);
    }

    if (url.pathname === '/api/lead') {
      return json({ error: 'Method not allowed' }, 405);
    }

    return env.ASSETS.fetch(request);
  }
};

async function saveLead(request, env) {
  try {
    const body = await request.json();

    const firstName = String(body.firstName || '')
      .trim()
      .slice(0, 80);

    const email = String(body.email || '')
      .trim()
      .toLowerCase()
      .slice(0, 254);

    const source = String(
      body.source || 'TEFL Landing Page'
    )
      .trim()
      .slice(0, 100);

    const marketingConsent =
      body.marketingConsent === true ? 1 : 0;

    if (
      !firstName ||
      !EMAIL_RE.test(email) ||
      !marketingConsent
    ) {
      return json(
        { error: 'Invalid submission' },
        400
      );
    }

    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const ipCountry =
      request.cf?.country || null;

    const userAgent =
      (request.headers.get('user-agent') || '')
        .slice(0, 500);

    // Every valid submission is stored as a new row.
    // Repeat email addresses are allowed.
    await env.DB
      .prepare(`
        INSERT INTO tefl_leads
        (
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
        'v1-2026-09-24',
        source,
        ipCountry,
        userAgent
      )
      .run();

    return json(
      {
        ok: true,
        id
      },
      201
    );

  } catch (error) {
    console.error(
      'Lead save failed:',
      error
    );

    return json(
      {
        error: 'Unable to save lead'
      },
      500
    );
  }
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'content-type':
          'application/json; charset=utf-8',

        'cache-control':
          'no-store',

        'x-content-type-options':
          'nosniff'
      }
    }
  );
}
