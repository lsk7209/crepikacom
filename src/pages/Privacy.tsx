import { Helmet } from "react-helmet";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>개인정보처리방침 | 크레피카</title>
        <meta 
          name="description" 
          content="크레피카 개인정보처리방침. 무료 온라인 도구 사용 시 데이터와 개인정보를 어떻게 보호하는지 알아보세요." 
        />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">개인정보처리방침</h1>
          <p className="text-lg text-muted-foreground">
            최종 업데이트: 2025년 11월 22일
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At CrePic, we take your privacy seriously. This Privacy Policy explains how we handle your information 
              when you use our website and tools. The short version: we don't collect, store, or process your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Processing</h2>
            <h3 className="text-xl font-semibold mb-3">Client-Side Processing Only</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All tools on CrePic run entirely in your web browser using JavaScript. When you use our tools:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your files and data are processed locally on your device</li>
              <li>No data is uploaded to our servers</li>
              <li>No data is stored on our servers</li>
              <li>Your information never leaves your device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CrePic uses browser localStorage to enhance your experience by saving:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your favorite tools (for quick access)</li>
              <li>Recently used tools (for convenience)</li>
              <li>User preferences (theme, language settings)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This data is stored only in your browser and never transmitted to our servers. 
              You can clear this data at any time by clearing your browser's cache and cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
            <h3 className="text-xl font-semibold mb-3">Analytics</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may use Google Analytics or similar services to understand how visitors use our website. 
              This helps us improve our tools and user experience. These analytics services may use cookies 
              to collect anonymous usage data such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pages visited</li>
              <li>Time spent on site</li>
              <li>Browser type and device information</li>
              <li>Geographic location (country/city level only)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This data is aggregated and anonymized. We do not track individual users or collect personally identifiable information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Advertising</h3>
            <p className="text-muted-foreground leading-relaxed">
              We display advertisements through Google AdSense to support the free operation of CrePic. 
              Google may use cookies to serve ads based on your prior visits to our website or other websites. 
              You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Ads Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CrePic may use the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Google AdSense:</strong> For displaying advertisements</li>
              <li><strong>Google Analytics:</strong> For understanding website usage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies. We recommend reviewing their policies to understand 
              how they collect and process data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Since we don't collect or store personal data, there is no personal information for us to modify or delete. 
              However, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Clear your browser's localStorage to remove any locally saved preferences</li>
              <li>Disable cookies in your browser settings</li>
              <li>Opt out of Google's personalized advertising</li>
              <li>Use browser extensions to block analytics tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              CrePic does not knowingly collect personal information from children under 13. 
              Our services are designed for general use and do not target children specifically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our Contact page.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
