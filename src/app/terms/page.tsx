import Link from 'next/link'
import {
  FileText,
  Shield,
  User,
  AlertTriangle,
  Building2,
  CreditCard,
  Lock,
  Gavel,
  XCircle,
  Globe,
  Mail,
  Briefcase,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'

export const metadata = {
  title: 'Terms of Service | TalentBridge',
  description: 'TalentBridge Terms of Service — your rights and responsibilities when using the platform.',
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
      <div className="text-sm text-tl-text-secondary leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

const TOC = [
  { href: '#agreement', label: 'Agreement to Terms' },
  { href: '#description', label: 'Service Description' },
  { href: '#account', label: 'Account Responsibilities' },
  { href: '#acceptable-use', label: 'Acceptable Use' },
  { href: '#company-responsibilities', label: 'Company Responsibilities' },
  { href: '#talent-responsibilities', label: 'Talent Responsibilities' },
  { href: '#payments', label: 'Payment Terms' },
  { href: '#ip', label: 'Intellectual Property' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#liability', label: 'Limitation of Liability' },
  { href: '#termination', label: 'Termination' },
  { href: '#governing-law', label: 'Governing Law' },
  { href: '#contact', label: 'Contact' },
]

export default function TermsPage() {
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
              Legal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">
              Terms of Service
            </h1>
            <p className="text-base text-tl-text-secondary max-w-xl mx-auto">
              These terms govern your use of the TalentBridge platform. Please read them carefully before creating an account or posting a job.
            </p>
            <p className="mt-4 text-xs text-tl-text-tertiary">
              Effective date: <strong className="text-tl-text-secondary">May 1, 2026</strong>
            </p>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* Table of contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 tl-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-tl-text-secondary mb-3">Contents</p>
                <nav className="space-y-1" aria-label="Terms of service sections">
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

              {/* 1. Agreement */}
              <Section id="agreement" icon={<FileText className="h-5 w-5 text-tl-gold" />} title="Agreement to Terms">
                <p>
                  These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and TalentBridge, Inc. (&quot;TalentBridge&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the TalentBridge platform — including any website, API, or mobile application — you confirm that you have read, understood, and agree to be bound by these Terms.
                </p>
                <p>
                  If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not have such authority, or if you do not agree with these Terms, you must not access or use the platform.
                </p>
                <p>
                  We reserve the right to update these Terms at any time. We will provide at least 14 days&apos; notice of material changes via email. Your continued use of TalentBridge after any changes take effect constitutes your acceptance of the revised Terms.
                </p>
              </Section>

              {/* 2. Service Description */}
              <Section id="description" icon={<Briefcase className="h-5 w-5 text-tl-gold" />} title="Service Description">
                <p>
                  TalentBridge is an AI-powered applicant tracking system (ATS) and talent marketplace that enables:
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong>Companies</strong> to create job postings, manage a recruitment pipeline, and discover qualified candidates using our AI matching engine.</li>
                  <li><strong>Talent (Job Seekers)</strong> to create professional profiles, upload resumes, apply to open roles, and receive match recommendations based on their skills and preferences.</li>
                  <li>Secure, asynchronous messaging between companies and candidates through the platform.</li>
                  <li>Analytics dashboards for companies to track pipeline health, hiring velocity, and team performance.</li>
                </ul>
                <p>
                  TalentBridge is a software platform only. We do not act as a recruiter, staffing agency, or employment agency, and we do not guarantee that any company will hire a specific candidate or that any candidate will receive a job offer.
                </p>
                <p>
                  We offer different subscription plans (Starter, Growth, and Enterprise) with varying feature sets and usage limits, as described on our{' '}
                  <Link href="/pricing" className="text-tl-gold hover:underline">Pricing page</Link>.
                </p>
              </Section>

              {/* 3. Account Responsibilities */}
              <Section id="account" icon={<User className="h-5 w-5 text-tl-gold" />} title="Account Responsibilities">
                <p>When you create an account on TalentBridge, you agree to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Provide accurate information:</strong> All information you provide during registration and throughout your use of the platform must be truthful, accurate, and up to date. Providing false information is a material breach of these Terms.</li>
                  <li><strong>Maintain secure credentials:</strong> You are responsible for maintaining the confidentiality of your password and access credentials. You must notify us immediately at <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a> if you suspect unauthorised access to your account.</li>
                  <li><strong>Not share accounts:</strong> Your account is personal to you. Sharing login credentials with others, or using another person&apos;s account without authorisation, is prohibited. Company plans include team member seats — please use the invite feature to add colleagues.</li>
                  <li><strong>Comply with applicable law:</strong> You are responsible for ensuring your use of TalentBridge complies with all applicable local, national, and international laws and regulations.</li>
                  <li><strong>Keep contact information current:</strong> You must maintain a valid email address on your account so we can communicate important service updates or security notices.</li>
                </ul>
                <p>
                  TalentBridge is not responsible for any loss or damage arising from your failure to maintain the security of your account.
                </p>
              </Section>

              {/* 4. Acceptable Use */}
              <Section id="acceptable-use" icon={<AlertTriangle className="h-5 w-5 text-tl-gold" />} title="Acceptable Use">
                <p>You agree not to use TalentBridge to:</p>
                <div className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-5 space-y-2">
                  {[
                    'Scrape, crawl, or extract data from TalentBridge using automated tools, bots, or scripts without our express written permission.',
                    'Send unsolicited commercial messages, spam, or bulk communications to other users.',
                    'Post false, misleading, or fraudulent information in any job posting or profile.',
                    'Harass, intimidate, or discriminate against any user on the basis of race, gender, religion, nationality, disability, sexual orientation, age, or any other protected characteristic.',
                    'Circumvent any access controls, authentication systems, or security measures on the platform.',
                    'Upload or transmit viruses, malware, or any other malicious code.',
                    'Infringe the intellectual property rights of TalentBridge or any third party.',
                    'Collect or harvest personal data of other users without their explicit consent.',
                    'Use the platform to facilitate any illegal activity, including but not limited to money laundering, identity theft, or illegal employment practices.',
                    'Impersonate any person, company, or entity, or falsely represent your affiliation with any person or entity.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <XCircle className="h-4 w-4 text-tl-rose shrink-0 mt-0.5" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
                <p>
                  Violation of these prohibitions may result in immediate account suspension or termination, and may expose you to civil or criminal liability. We reserve the right to investigate suspected violations and cooperate with law enforcement authorities.
                </p>
              </Section>

              {/* 5. Company Responsibilities */}
              <Section id="company-responsibilities" icon={<Building2 className="h-5 w-5 text-tl-gold" />} title="Company Responsibilities">
                <p>If you use TalentBridge as a company (employer), you additionally agree to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Post only lawful job opportunities:</strong> All job postings must represent genuine, currently open roles at a real company. Posting fake jobs, testing roles, or opportunities designed solely to collect candidate data is prohibited.</li>
                  <li><strong>No discriminatory postings:</strong> Job postings must comply with all applicable equal employment opportunity and anti-discrimination laws. You must not include requirements that discriminate on the basis of any protected characteristic unless a genuine occupational requirement applies and is clearly disclosed.</li>
                  <li><strong>Accurate compensation information:</strong> Where salary ranges are provided, they must accurately reflect the compensation you genuinely intend to offer.</li>
                  <li><strong>Respect candidate data:</strong> Candidate profiles and resumes shared with you through TalentBridge may only be used for the specific recruitment purpose for which they were submitted. You may not sell, share, or repurpose candidate data for any other purpose.</li>
                  <li><strong>Timely communication:</strong> We strongly encourage timely communication with candidates to maintain a fair and respectful hiring process, though we do not legally mandate specific response timelines.</li>
                  <li><strong>Compliance with employment law:</strong> You are solely responsible for ensuring your hiring practices comply with all applicable employment, immigration, and labour laws in your jurisdiction.</li>
                </ul>
              </Section>

              {/* 6. Talent Responsibilities */}
              <Section id="talent-responsibilities" icon={<User className="h-5 w-5 text-tl-gold" />} title="Talent Responsibilities">
                <p>If you use TalentBridge as a job seeker, you agree to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Provide accurate profile data:</strong> All information in your profile, resume, and applications must be truthful. Misrepresenting your qualifications, work history, or credentials is a material breach of these Terms and may result in account termination.</li>
                  <li><strong>Accurate skill representation:</strong> Skills and proficiency levels listed on your profile should accurately reflect your current abilities. Claiming expertise you do not possess harms companies relying on accurate matching and undermines the integrity of the platform.</li>
                  <li><strong>Authentic applications:</strong> Applications submitted through TalentBridge must represent your genuine interest in the role. Mass-applying without reviewing job requirements is discouraged.</li>
                  <li><strong>Professionalism:</strong> All communications with companies through the platform must be professional and respectful.</li>
                  <li><strong>Notification of changes:</strong> If your availability, location, or employment status changes significantly, you should update your profile promptly to avoid misleading potential employers.</li>
                </ul>
              </Section>

              {/* 7. Payments */}
              <Section id="payments" icon={<CreditCard className="h-5 w-5 text-tl-gold" />} title="Payment Terms">
                <p>The following payment terms apply to company subscriptions:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Subscription billing:</strong> Company plans are billed on a monthly or annual basis, as selected at checkout. All prices are listed in US dollars and are exclusive of applicable taxes.</li>
                  <li><strong>Auto-renewal:</strong> Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You can cancel at any time from your account settings.</li>
                  <li><strong>Payment processing:</strong> Payments are processed by Stripe. By subscribing, you authorise TalentBridge (via Stripe) to charge your payment method on a recurring basis.</li>
                  <li><strong>Refund policy:</strong> We offer a full refund within the first 14 days of your initial subscription if you are not satisfied with the service. After 14 days, all payments are non-refundable, including where you choose to cancel mid-period. Your access continues until the end of the paid period.</li>
                  <li><strong>Price changes:</strong> We may adjust subscription pricing with 30 days&apos; notice. Price changes will not take effect until your next renewal date.</li>
                  <li><strong>Failed payments:</strong> If payment fails, we will attempt to retry the charge three times over seven days. If payment remains unsuccessful, your account may be downgraded or suspended until the outstanding balance is resolved.</li>
                  <li><strong>Taxes:</strong> You are responsible for all applicable taxes in your jurisdiction. For EU customers, VAT may apply and will be added at checkout based on your billing address.</li>
                </ul>
              </Section>

              {/* 8. IP */}
              <Section id="ip" icon={<Lock className="h-5 w-5 text-tl-gold" />} title="Intellectual Property">
                <p>
                  <strong>TalentBridge platform:</strong> All rights, title, and interest in the TalentBridge platform — including the software, AI models, user interface, design, logos, trademarks, and all other intellectual property — are and remain the exclusive property of TalentBridge, Inc. Nothing in these Terms grants you any ownership right in the platform.
                </p>
                <p>
                  <strong>Your content:</strong> You retain full ownership of the content you submit to TalentBridge, including your job postings, candidate profiles, resumes, and messages. By submitting content to the platform, you grant TalentBridge a limited, non-exclusive, royalty-free licence to store, process, and display your content solely to provide the service to you.
                </p>
                <p>
                  <strong>Feedback:</strong> If you submit suggestions, feedback, or ideas about the platform, you grant TalentBridge an irrevocable, royalty-free licence to use that feedback without obligation or compensation to you.
                </p>
                <p>
                  <strong>Restrictions:</strong> You may not copy, modify, reverse-engineer, decompile, disassemble, or create derivative works of the TalentBridge platform or any part of it without our express written consent.
                </p>
              </Section>

              {/* 9. Privacy */}
              <Section id="privacy" icon={<Shield className="h-5 w-5 text-tl-gold" />} title="Privacy">
                <p>
                  Your privacy is important to us. Our collection, use, and protection of your personal data is governed by our{' '}
                  <Link href="/privacy" className="text-tl-gold hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                </p>
                <p>
                  By using TalentBridge, you consent to the collection and use of your information as described in the Privacy Policy. The Privacy Policy explains your data rights under GDPR and how to exercise them.
                </p>
              </Section>

              {/* 10. Liability */}
              <Section id="liability" icon={<AlertTriangle className="h-5 w-5 text-tl-gold" />} title="Limitation of Liability">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-xs leading-relaxed space-y-3">
                  <p className="font-semibold text-amber-800 uppercase tracking-wider text-[10px]">Important Legal Notice</p>
                  <p className="text-tl-text-secondary">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TALENTBRIDGE, INC. AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, BUSINESS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE PLATFORM, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                  </p>
                  <p className="text-tl-text-secondary">
                    IN NO EVENT SHALL TALENTBRIDGE&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE PLATFORM EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO TALENTBRIDGE IN THE TWELVE MONTHS IMMEDIATELY PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD $100).
                  </p>
                  <p className="text-tl-text-secondary">
                    SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU IN THEIR ENTIRETY.
                  </p>
                </div>
                <p className="text-xs mt-3">
                  TalentBridge provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant that the platform will be uninterrupted, error-free, or secure, or that any defects will be corrected. We make no warranties, express or implied, about the suitability, reliability, availability, or accuracy of the platform.
                </p>
              </Section>

              {/* 11. Termination */}
              <Section id="termination" icon={<XCircle className="h-5 w-5 text-tl-gold" />} title="Termination">
                <p>
                  <strong>By you:</strong> You may close your account at any time from your account settings or by contacting us at <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a>. Upon account closure, your data will be scheduled for deletion in accordance with our{' '}
                  <Link href="/privacy#retention" className="text-tl-gold hover:underline">Data Retention Policy</Link>.
                </p>
                <p>
                  <strong>By us:</strong> TalentBridge reserves the right to suspend or permanently terminate your account, without prior notice, if we determine in our reasonable judgement that you have:
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Violated these Terms of Service or any applicable law</li>
                  <li>Engaged in fraudulent, abusive, or harmful conduct toward other users or TalentBridge</li>
                  <li>Failed to pay amounts owed and failed to remedy the non-payment within 7 days of notice</li>
                  <li>Provided materially false information at registration or in your use of the platform</li>
                </ul>
                <p>
                  Upon termination by us for cause, your licence to use the platform will immediately cease and we may delete your account data. If we terminate your account for reasons other than your breach, we will provide a pro-rated refund for any unused prepaid subscription period.
                </p>
                <p>
                  Provisions of these Terms that by their nature should survive termination — including intellectual property, limitation of liability, and governing law — will survive termination.
                </p>
              </Section>

              {/* 12. Governing Law */}
              <Section id="governing-law" icon={<Gavel className="h-5 w-5 text-tl-gold" />} title="Governing Law & Dispute Resolution">
                <p>
                  These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of the <strong>State of Delaware, United States of America</strong>, without regard to its conflict of law principles.
                </p>
                <p>
                  <strong>Binding arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or validity thereof shall be finally settled by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall take place in Delaware. The arbitral award shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
                </p>
                <p>
                  <strong>Class action waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
                </p>
                <p>
                  <strong>Exception:</strong> Either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent actual or threatened infringement of intellectual property rights or unauthorised use of confidential information.
                </p>
                <p>
                  <strong>EU/UK consumers:</strong> If you are a consumer located in the EU or UK, mandatory consumer protection laws in your country of residence may provide you with additional rights that cannot be waived by contract.
                </p>
              </Section>

              {/* 13. Contact */}
              <Section id="contact" icon={<Mail className="h-5 w-5 text-tl-gold" />} title="Contact">
                <p>
                  If you have any questions about these Terms, wish to report a violation, or need to contact us for any legal matter, please reach us at:
                </p>
                <div className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-5 mt-2 space-y-2">
                  <p className="font-semibold text-tl-text-primary">TalentBridge, Inc.</p>
                  <p>Email: <a href="mailto:oceanbluesolutions@gmail.com" className="text-tl-gold hover:underline">oceanbluesolutions@gmail.com</a></p>
                  <p className="text-xs text-tl-text-tertiary mt-2">
                    For privacy-related requests, please use the subject line &quot;Privacy Request — [Your Name]&quot;. For legal notices, please use the subject line &quot;Legal Notice — [Matter]&quot;.
                  </p>
                </div>
                <p className="text-xs mt-3 text-tl-text-tertiary">
                  These Terms of Service were last updated on <strong className="text-tl-text-secondary">May 1, 2026</strong>. Previous versions are available upon request.
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
