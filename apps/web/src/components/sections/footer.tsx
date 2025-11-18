'use client';

import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-turquoise-500 to-ocean-600">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Neurastate</span>
            </div>
            <p className="text-gray-400 max-w-md">
              AI-powered real estate analytics platform delivering premium market insights for
              Miami&apos;s luxury property market.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Market Analysis', href: '#market' },
                { label: 'About Us', href: '#about' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-turquoise-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-turquoise-400 mt-0.5" />
                <span className="text-gray-400">Miami, Florida</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-turquoise-400 mt-0.5" />
                <a
                  href="mailto:info@neurastate.com"
                  className="text-gray-400 hover:text-turquoise-400"
                >
                  info@neurastate.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-turquoise-400 mt-0.5" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-turquoise-400">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Neurastate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
