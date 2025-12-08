import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 mt-auto!">
      <div className="max-w-6xl mx-auto! px-6! md:px-10! py-10!">
        {/* top columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8! mb-8!">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2!">Books</h3>
            <p className="text-sm text-gray-400">
              Books Delivered. Imagination Unlimited.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3!">
              Quick Links
            </h4>
            <ul className="space-y-1.5! text-sm">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3!">Contact</h4>
            <p className="text-sm text-gray-400">Email: support@books.com</p>
            <p className="text-sm text-gray-400">Phone: +91 98765 43210</p>
            <p className="text-sm text-gray-400">
              Chennai, Tamil Nadu - 600001
            </p>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3!">
              We Accept
            </h4>
            <div className="flex items-center gap-3!">
              {/* Use your own images or simple tags */}
              <span className="px-3! py-1! bg-white text-blue-700 text-xs font-semibold rounded">
                VISA
              </span>
              <span className="px-3! py-1! bg-white text-orange-600 text-xs font-semibold rounded">
                MasterCard
              </span>
              <span className="px-3! py-1! bg-white text-blue-500 text-xs font-semibold rounded">
                RuPay
              </span>
            </div>
          </div>
        </div>

        {/* divider */}
        <hr className="border-gray-700 mb-4!" />

        {/* bottom line */}
        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Books. All rights reserved. | Made with
          <span className="text-red-500 mx-1!">♥</span> by Prem
        </div>
      </div>
    </footer>
  );
};

export default Footer;
