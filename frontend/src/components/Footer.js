import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray text-center py-4 px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
        <p className="mb-4 md:mb-0">&copy; 2024 School Management System. All rights reserved.</p>
        <ul className="flex space-x-4">
          <li>
            <Link href="/terms-of-service" className="hover:text-blue-500">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy" className="hover:text-blue-500">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
