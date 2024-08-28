import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css'; 

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service | MySchool</title>
        <meta name="description" content="Terms of Service for Your Application Name" />
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-6">Last Updated: 27/08/2024</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">1. Introduction</h2>
            <p className="text-gray-700">
              Welcome to <strong>MySchool</strong>, a comprehensive school management application designed for private educational institutions. By accessing or using our services, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">2. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By using <strong>MySchool</strong>, you acknowledge that you have read, understood, and agreed to these Terms of Service. If you do not agree with these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">3. Services Provided</h2>
            <ul className="list-disc list-inside pl-4 text-gray-700">
              <li>User-friendly interfaces for school management.</li>
              <li>Integration for communication between parents, teachers, and administration.</li>
              <li>Reporting tools for academic and financial performance.</li>
              <li>Financial management features including billing and payment tracking.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">4. User Responsibilities</h2>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the services in accordance with applicable laws and regulations and to refrain from:
            </p>
            <ul className="list-disc list-inside pl-4 text-gray-700">
              <li>Unauthorized access to or use of our services.</li>
              <li>Transmitting any content that is unlawful, defamatory, or harmful.</li>
              <li>Attempting to disrupt or interfere with our services.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">5. Data Privacy and Security</h2>
            <p className="text-gray-700">
              We are committed to protecting your data. Our <Link href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link> outlines how we collect, use, and safeguard your personal information. By using our services, you consent to our data collection practices as described in the Privacy Policy.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">6. Intellectual Property</h2>
            <p className="text-gray-700">
              All content and materials available through <strong>MySchool</strong> are the property of <strong>Grow Up Agency</strong> and are protected by intellectual property laws. You may not reproduce, distribute, or modify any content without our prior written consent.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">7. Limitations of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, <strong>Grow Up Agency</strong> is not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services. Our total liability is limited to the amount paid for the services in question.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">8. Termination</h2>
            <p className="text-gray-700">
              We reserve the right to terminate or suspend your access to our services at our sole discretion if you breach these Terms of Service or engage in conduct that we deem inappropriate.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms of Service from time to time. The updated terms will be effective when posted on our website. Continued use of our services after changes have been made constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">10. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions or concerns regarding these Terms of Service, please contact us at:
            </p>
            <address className="mt-2 text-gray-700">
              <p><strong>Grow Up Agency</strong></p>
              <p>Email: <a href="mailto:[Contact Email]" className="text-blue-500 hover:underline">contact@myschool.tn</a></p>
              <p>Phone: +216 12 345 678</p>
              <p>Address: Tunisia, Tunis</p>
            </address>
          </section>
        </div>
      </div>
    </>
  );
}
