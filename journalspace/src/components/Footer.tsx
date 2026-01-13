import { BookOpen, Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Privacy", href: "#privacy" },
    { name: "Pricing", href: "#pricing" },
    { name: "Download", href: "#download" },
  ],
  resources: [
    { name: "Blog", href: "#blog" },
    { name: "Journaling Guide", href: "#guide" },
    { name: "Help Center", href: "#help" },
    { name: "Community", href: "#community" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
    { name: "Press Kit", href: "#press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy-policy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "#twitter", icon: Twitter },
  { name: "GitHub", href: "#github", icon: Github },
  { name: "LinkedIn", href: "#linkedin", icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="bg-sage-900 text-sage-200" role="contentinfo">
      <div className="container-max section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-sage-700 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold text-white">
                JournalSpace
              </span>
            </a>
            <p className="text-sage-400 leading-relaxed mb-6 max-w-xs">
              Your private digital sanctuary for reflection, growth, and
              self-discovery. Write your story, one day at a time.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 bg-sage-800 rounded-lg hover:bg-sage-700 transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-5 w-5 text-sage-300" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sage-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sage-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sage-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sage-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-sage-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sage-500 text-sm">
            &copy; {new Date().getFullYear()} JournalSpace. All rights reserved.
          </p>
          <p className="text-sage-500 text-sm">
            Made with care for thoughtful writers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
