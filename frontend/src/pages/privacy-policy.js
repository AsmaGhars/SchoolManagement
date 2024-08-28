import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css'; 

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | MySchool</title>
        <meta name="description" content="Privacy Policy for MySchool" />
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: 27/08/2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">1. Introduction</h2>
            <p className="text-gray-700">
              Welcome to <strong>MySchool</strong>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">2. Information We Collect</h2>
            <p className="text-gray-700">
              We collect various types of information in connection with your use of our services, including:
            </p>
            <ul className="list-disc list-inside pl-6 text-gray-700">
              <li><strong>Personal Information:</strong> Name, email address, phone number, etc.</li>
              <li><strong>Usage Data:</strong> Information about how you use our services.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> Cookies, web beacons, and similar technologies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">3. How We Use Your Information</h2>
            <p className="text-gray-700">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside pl-6 text-gray-700">
              <li>To provide and maintain our services.</li>
              <li>To improve and personalize your experience.</li>
              <li>To communicate with you and respond to your inquiries.</li>
              <li>To analyze usage and trends.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">4. Sharing Your Information</h2>
            <p className="text-gray-700">
              We do not sell or rent your personal information to third parties. However, we may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside pl-6 text-gray-700">
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who assist us in operating our services.</li>
              <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or to protect our rights.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or other business transfer, your information may be transferred as part of the transaction.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">5. Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is completely secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">6. Your Rights</h2>
            <p className="text-gray-700">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside pl-6 text-gray-700">
              <li>The right to access your personal information.</li>
              <li>The right to request correction or deletion of your information.</li>
              <li>The right to object to or restrict the processing of your information.</li>
              <li>The right to withdraw consent at any time where we rely on your consent to process your information.</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, please contact us using the details provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">7. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">8. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <address className="mt-2 text-gray-700">
              <p><strong>Grow Up Agency</strong></p>
              <p>Email: <a href="mailto:[Contact Email]" className="text-blue-600 hover:underline">contact@myschool.tn</a></p>
              <p>Phone: +216 12 345 678</p>
              <p>Address: Tunisia, Tunis</p>
            </address>
          </section>
        </div>
      </div>
    </>
  );
}
