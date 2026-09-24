# ATC TEFL Career Landing Page

Ready for Cloudflare Workers + D1.

## What is included
- Responsive ATC-branded landing page
- Subtle classroom/network hero animation
- Verified British Council statistics with source links
- Career-path flip cards
- Qualification pathway
- Course-benefit flip cards
- Lead form: first name + email
- Explicit marketing-consent checkbox
- Every submission saved to D1, including duplicate email addresses
- Automatic timestamp, source, country code and user-agent fields
- Immediate redirect after a successful database write to the ATC TQUK Level 5 TEFL course page
- Reduced-motion support

## Deploy

1. In Cloudflare, create a D1 database named `atc-tefl-leads`.
2. Copy its Database ID into `wrangler.toml`, replacing `PASTE_YOUR_D1_DATABASE_ID_HERE`.
3. From this project folder, initialise the table:

   npx wrangler d1 execute atc-tefl-leads --remote --file=./schema.sql

4. Deploy:

   npx wrangler deploy

If you deploy through GitHub/Cloudflare Builds, commit these files to the repository and use `npx wrangler deploy` as the deploy command.

## Export leads for Excel

Cloudflare D1 can be queried/exported. A simple query is:

SELECT id, first_name, email, submitted_at, marketing_consent, source, country_code
FROM tefl_leads
ORDER BY submitted_at DESC;

CSV output can be opened directly in Excel.

## Important pre-launch checks
- The page intentionally does not show the course price.
- Destination after form submission:
  https://www.alltrainingcourses.org/event-details/tquk-level-5-certificate-in-teaching-english-as-a-foreign-language-rqf
- Footer contact: hello@alltrainingcourses.org
- The page links to `/privacy-policy` on the ATC domain. Confirm that this is the correct live privacy-policy route.
- The career-card photos are loaded from Pexels URLs. For a production campaign, you may prefer downloading your selected licensed stock photos and placing them in `public/images/` so the site has no third-party image dependency.
- Marketing consent wording should be checked against the jurisdictions in which ATC markets and sends emails.
