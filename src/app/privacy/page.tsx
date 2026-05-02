import Link from 'next/link'
import { Shield, Mail, Database, Lock, Eye, Download, Trash2, Globe, Cookie, RefreshCw, Users } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { CookieSettingsButton } from '@/components/shared/cookie-settings-button'

export const metadata = {
  title: 'Privacy Policy | TalentBridge',
  description: 'How TalentBridge collects, uses, and protects your personal data. GDPR-compliant privacy policy.',
}

interface SectionProps {
  id: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ id, icon, title, children }: SectionProps) {
  return (
    <section id={id} className="tl-card p-8 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tl-gold/10">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-tl-text-primary">{title}</h2>
      </div>
      <div className="prose-content text-sm text-tl-text-secondary leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

const TOC = [
  { href: '#introduction', label: 'Introduction' },
  { href: '#data-collected', label: 'Data We Collect' },
  { href: '#how-we-use', label: 'How We Use Your Data' },
  { href: '#legal-basis', label: 'Legal Basis' },
  { href: '#retention', label: 'Data Retention' },
  { href: '#your-rights', label: 'Your Rights (GDPR)' },
  { href: '#third-parties', label: 'Third-Party Services' },
  { href: '#cookies', label: 'Cookies' },
  { href: '#international', label: 'International Transfers' },
  { href: '#contact', label: 'Contact / DPO' },
  { href: '#updates', label: 'Updates' },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-tl-bg-base pt-24 pb-0">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-16 px-6">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[420px] w-[420px] rounded-full bg-tl-gold opacity-[0.04] blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto mb-4">
              GDPR Compliant
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">
              Privacy Policy
            </h1>
            <p className="text-base text-tl-text-secondary max-w-xl mx-auto">
              We believe your personal data belongs to you. This policy explains exactly what we collect, why we collect it, and how you can exercise your rights at any time.
            </p>
            <p className="mt-4 text-xs text-tl-text-tertiary">
              Last updated: <strong className="text-tl-text-secondary">May 1, 2026</strong>
            </p>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* Table of contents — sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 tl-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-tl-text-secondary mb-3">Contents</p>
                <nav className="space-y-1" aria-label="Privacy policy sections">
                  {TOC.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      className="block text-xs text-tl-text-secondary hover:text-tl-gold transition-colors py-1 pl-2 border-l-2 border-transparent hover:border-tl-gold/40"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="space-y-6">

              {/* 1. Introduction */}
              <Section id="introduction" icon={<Shield className="h-5 w-5 text-tl-gold" />} title="Introduction">
                <p>
                  TalentBridge (&quot;TalentBridge&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the TalentBridge platform — an AI-powered applicant tracking and talent matching service — available at talentbridge.io.
                </p>
                <p>
                  TalentBridge acts as the <strong>data controller</strong> for personal data processed through the platform. As controller, we determine the purposes and means by which your personal data is processed, and we are accountable for doing so lawfully under the EU General Data Protection Regulation (GDPR) and any applicable national data protection laws.
                </p>
                <p>
                  This Privacy Policy applies to all users of the TalentBridge platform, including company administrators (&quot;Companies&quot;), job seekers (&quot;Talent&quot;), and visitors to our website. If you have questions about this policy or wish to exercise your data rights, you can reach our Data Protection Officer at{' '}
                  <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a>.
                </p>
                <p>
                  By creating an account or using the TalentBridge platform, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </Section>

              {/* 2. Data We Collect */}
              <Section id="data-collected" icon={<Database className="h-5 w-5 text-tl-gold" />} title="Data We Collect">
                <p>We collect different categories of data depending on how you use TalentBridge:</p>

                <div className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-5 space-y-4 mt-2">
                  <div>
                    <p className="font-semibold text-tl-text-primary text-xs uppercase tracking-wider mb-2">For Companies</p>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>Account information: full name, work email address, job title</li>
                      <li>Company details: company name, industry, size, website, and logo</li>
                      <li>Job postings: role titles, descriptions, salary ranges, location, and requirements</li>
                      <li>Billing information: subscription plan, billing cycle. Payment card data is handled exclusively by Stripe and is never stored on TalentBridge servers.</li>
                      <li>Communication data: messages exchanged with candidates via the TalentBridge messaging system</li>
                      <li>Team member data: names and email addresses of colleagues invited to your company workspace</li>
                    </ul>
                  </div>
                  <div className="border-t border-tl-border-default pt-4">
                    <p className="font-semibold text-tl-text-primary text-xs uppercase tracking-wider mb-2">For Talent (Job Seekers)</p>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>Account information: full name, email address, location</li>
                      <li>Professional profile: headline, biography, skills, years of experience, work history, and education</li>
                      <li>Resume: uploaded PDF or document containing your career history</li>
                      <li>Job applications: roles applied to, application status, and recruiter notes visible to you</li>
                      <li>Preferences: salary expectations, work arrangement preferences (remote/hybrid/on-site), availability</li>
                      <li>Communication data: messages exchanged with companies via the platform</li>
                    </ul>
                  </div>
                  <div className="border-t border-tl-border-default pt-4">
                    <p className="font-semibold text-tl-text-primary text-xs uppercase tracking-wider mb-2">Automatically Collected</p>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>IP address and approximate geographic location (country/city)</li>
                      <li>Browser type, version, and operating system</li>
                      <li>Pages visited, features used, and time spent on the platform</li>
                      <li>Referring URLs and search terms that led you to TalentBridge</li>
                      <li>Session identifiers and authentication tokens (stored in secure, HTTP-only cookies)</li>
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-tl-text-tertiary">
                  We do not intentionally collect or process special categories of personal data (such as racial or ethnic origin, religious beliefs, health data, or sexual orientation). Please do not include such information in your profile or job postings.
                </p>
              </Section>

              {/* 3. How We Use */}
              <Section id="how-we-use" icon={<Users className="h-5 w-5 text-tl-gold" />} title="How We Use Your Data">
                <p>We use the personal data we collect for the following purposes:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Service delivery:</strong> Providing the TalentBridge platform, including AI-powered candidate matching, applicant tracking, and messaging features.</li>
                  <li><strong>Account management:</strong> Creating and maintaining your account, verifying your identity, and managing your subscription.</li>
                  <li><strong>Recruitment matching:</strong> Our AI engine analyses talent profiles and job requirements to generate match scores and surface relevant opportunities. No fully automated decisions with legal effect are made without human review.</li>
                  <li><strong>Payments and billing:</strong> Processing subscription payments, issuing invoices, and managing renewals via Stripe.</li>
                  <li><strong>Communications:</strong> Sending transactional emails (account verification, password resets, application status updates) and, where you have consented, product updates and announcements.</li>
                  <li><strong>Platform improvement:</strong> Analysing usage patterns to identify bugs, improve features, and personalise your experience.</li>
                  <li><strong>Security and fraud prevention:</strong> Detecting and preventing unauthorised access, abuse, and fraudulent activity.</li>
                  <li><strong>Legal compliance:</strong> Retaining records as required by applicable law and responding to lawful requests from regulatory authorities.</li>
                </ul>
              </Section>

              {/* 4. Legal Basis */}
              <Section id="legal-basis" icon={<Lock className="h-5 w-5 text-tl-gold" />} title="Legal Basis for Processing (GDPR Article 6)">
                <p>Where GDPR applies, we rely on the following legal bases for processing your personal data:</p>
                <div className="space-y-3 mt-2">
                  {[
                    {
                      basis: 'Contractual Necessity (Art. 6(1)(b))',
                      desc: 'Processing required to perform our contract with you — account creation, job posting, candidate matching, and messaging. Without this processing, we cannot provide the service.',
                    },
                    {
                      basis: 'Legitimate Interests (Art. 6(1)(f))',
                      desc: 'Processing for our legitimate business interests, such as improving the platform, preventing fraud, and maintaining security, where these interests are not overridden by your rights. You may object to this processing at any time.',
                    },
                    {
                      basis: 'Consent (Art. 6(1)(a))',
                      desc: 'Where we rely on your consent — for example, optional analytics cookies or marketing emails — you may withdraw your consent at any time without affecting the lawfulness of prior processing.',
                    },
                    {
                      basis: 'Legal Obligation (Art. 6(1)(c))',
                      desc: 'Processing required to comply with applicable law, such as financial record-keeping obligations or responding to court orders.',
                    },
                  ].map(({ basis, desc }) => (
                    <div key={basis} className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                      <p className="font-semibold text-tl-text-primary text-sm mb-1">{basis}</p>
                      <p className="text-xs">{desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* 5. Retention */}
              <Section id="retention" icon={<RefreshCw className="h-5 w-5 text-tl-gold" />} title="Data Retention">
                <p>We retain your personal data for as long as necessary to fulfil the purposes described in this policy:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Active accounts:</strong> Data is retained for the duration of your account. If your subscription lapses, we retain your data for an additional 90 days to allow account reinstatement.</li>
                  <li><strong>Deleted accounts:</strong> When you request account deletion, we schedule permanent erasure of all personal data within 30 days of your request. Anonymised, aggregated statistics derived from your data (with no link back to you) may be retained indefinitely.</li>
                  <li><strong>Financial records:</strong> Invoice and payment records are retained for 7 years as required by applicable tax law.</li>
                  <li><strong>Audit logs:</strong> Security and access logs are retained for 90 days for fraud detection and compliance purposes.</li>
                  <li><strong>Backup data:</strong> Our encrypted backups are purged on a rolling 30-day cycle, meaning deleted data is fully removed from all backups within 30 days of the primary deletion.</li>
                </ul>
              </Section>

              {/* 6. Rights */}
              <Section id="your-rights" icon={<Eye className="h-5 w-5 text-tl-gold" />} title="Your Rights (GDPR Articles 15–22)">
                <p>If you are located in the European Economic Area (EEA) or United Kingdom, you have the following rights regarding your personal data:</p>
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  {[
                    {
                      title: 'Right to Access (Art. 15)',
                      desc: 'Request a copy of the personal data we hold about you.',
                    },
                    {
                      title: 'Right to Rectification (Art. 16)',
                      desc: 'Request correction of inaccurate or incomplete personal data.',
                    },
                    {
                      title: 'Right to Erasure (Art. 17)',
                      desc: '"Right to be forgotten" — request deletion of your personal data where there is no compelling reason for continued processing.',
                    },
                    {
                      title: 'Right to Data Portability (Art. 20)',
                      desc: 'Receive your data in a structured, machine-readable format, or request transfer to another controller.',
                    },
                    {
                      title: 'Right to Object (Art. 21)',
                      desc: 'Object to processing based on legitimate interests or for direct marketing purposes.',
                    },
                    {
                      title: 'Right to Restrict Processing (Art. 18)',
                      desc: 'Request that we limit how we use your data in certain circumstances.',
                    },
                  ].map(({ title, desc }) => (
                    <div key={title} className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                      <p className="font-semibold text-tl-text-primary text-sm mb-1">{title}</p>
                      <p className="text-xs">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-5 mt-4 space-y-3">
                  <p className="font-semibold text-tl-text-primary text-sm">Exercise Your Rights</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/api/account/export"
                      className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-lg"
                    >
                      <Download className="h-4 w-4" />
                      Export My Data
                    </Link>
                    <Link
                      href="/api/account/delete-request"
                      className="flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-lg border border-tl-rose/30 text-tl-rose bg-tl-rose/5 hover:bg-tl-rose/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Request Account Deletion
                    </Link>
                  </div>
                  <p className="text-xs text-tl-text-tertiary">
                    You may also contact us directly at{' '}
                    <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a>{' '}
                    to exercise any of your rights. We will respond within 30 days. If you are unsatisfied with our response, you have the right to lodge a complaint with your local supervisory authority.
                  </p>
                </div>
              </Section>

              {/* 7. Third Parties */}
              <Section id="third-parties" icon={<Globe className="h-5 w-5 text-tl-gold" />} title="Third-Party Services">
                <p>We work with a limited number of carefully selected third-party service providers. We share personal data with them only to the extent necessary to operate the platform:</p>
                <div className="space-y-3 mt-2">
                  {[
                    {
                      name: 'Amazon Web Services (AWS)',
                      purpose: 'Cloud infrastructure, server hosting, database storage, and file storage (S3). All data is stored in the AWS US-East-1 (Northern Virginia) region.',
                      link: 'https://aws.amazon.com/privacy/',
                    },
                    {
                      name: 'Stripe',
                      purpose: 'Payment processing and subscription billing. Stripe processes payment card data directly and is PCI-DSS Level 1 certified. TalentBridge never stores raw card numbers.',
                      link: 'https://stripe.com/privacy',
                    },
                    {
                      name: 'PostHog',
                      purpose: 'Product analytics — understanding how features are used to improve the platform. Analytics are only loaded if you have granted consent via our cookie preferences.',
                      link: 'https://posthog.com/privacy',
                    },
                  ].map(({ name, purpose, link }) => (
                    <div key={name} className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-tl-text-primary text-sm">{name}</p>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-tl-gold hover:underline shrink-0">Privacy Policy →</a>
                      </div>
                      <p className="text-xs mt-1">{purpose}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2">
                  We do not sell your personal data to third parties, nor do we share it with advertisers. We may disclose data to law enforcement agencies if required to do so by applicable law.
                </p>
              </Section>

              {/* 8. Cookies */}
              <Section id="cookies" icon={<Cookie className="h-5 w-5 text-tl-gold" />} title="Cookies">
                <p>TalentBridge uses cookies and similar tracking technologies. We categorise these as:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Essential cookies:</strong> Strictly necessary for the platform to function — authentication tokens, session management, and security tokens. These cannot be disabled.</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how users interact with the platform (e.g., PostHog). Only loaded with your explicit consent.</li>
                  <li><strong>Marketing cookies:</strong> Used to show you relevant content. Only loaded with your explicit consent.</li>
                </ul>
                <p className="mt-2">
                  You can manage your cookie preferences at any time using our{' '}
                  <CookieSettingsButton />{' '}
                  panel. Withdrawing consent does not affect the lawfulness of any processing already carried out.
                </p>
              </Section>

              {/* 9. International Transfers */}
              <Section id="international" icon={<Globe className="h-5 w-5 text-tl-gold" />} title="International Transfers">
                <p>
                  TalentBridge is headquartered in the United States. If you are located in the EEA, UK, or Switzerland, your personal data will be transferred to and processed in the United States, which may not have data protection laws equivalent to those in your jurisdiction.
                </p>
                <p>
                  We safeguard these transfers using the following mechanisms:
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong>Standard Contractual Clauses (SCCs):</strong> We rely on the European Commission-approved Standard Contractual Clauses for transfers from the EEA to third countries.</li>
                  <li><strong>AWS Data Processing Addendum:</strong> AWS has agreed to the SCCs and operates under a Data Processing Addendum that governs how they process data on our behalf.</li>
                  <li><strong>UK International Data Transfer Agreement (IDTA):</strong> For transfers from the UK, we rely on the UK IDTA where applicable.</li>
                </ul>
                <p>
                  All data is stored in the <strong>AWS US-East-1 (Northern Virginia) region</strong>. Enterprise customers may request EU data residency — contact us at <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a> for details.
                </p>
              </Section>

              {/* 10. Contact */}
              <Section id="contact" icon={<Mail className="h-5 w-5 text-tl-gold" />} title="Contact / Data Protection Officer">
                <p>
                  For any questions, concerns, or requests related to this Privacy Policy or the processing of your personal data, please contact our Data Protection Officer:
                </p>
                <div className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-5 mt-2 space-y-2">
                  <p className="font-semibold text-tl-text-primary">TalentBridge Data Protection Officer</p>
                  <p>Email: <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a></p>
                  <p>Subject line: &quot;Privacy Request — [Your Name]&quot;</p>
                  <p className="text-xs text-tl-text-tertiary mt-2">We aim to respond to all data rights requests within <strong>30 calendar days</strong>. Complex requests may require up to 90 days, in which case we will notify you of the extension and reason.</p>
                </div>
                <p className="text-xs mt-3">
                  If you believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your national supervisory authority. In the EU, you can find your local authority via{' '}
                  <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-tl-gold hover:underline">edpb.europa.eu</a>.
                </p>
              </Section>

              {/* 11. Updates */}
              <Section id="updates" icon={<RefreshCw className="h-5 w-5 text-tl-gold" />} title="Updates to This Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Update the &quot;Last updated&quot; date at the top of this page</li>
                  <li>Send a notification to registered users via email at least 14 days before the changes take effect</li>
                  <li>Display a banner on the platform announcing the update</li>
                </ul>
                <p>
                  Your continued use of TalentBridge after the effective date of any updated Privacy Policy constitutes your acceptance of the revised policy. If you do not agree with the changes, you may close your account before the effective date.
                </p>
                <p className="font-medium text-tl-text-primary mt-2">
                  This policy was last updated on <strong>May 1, 2026</strong>.
                </p>
              </Section>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
