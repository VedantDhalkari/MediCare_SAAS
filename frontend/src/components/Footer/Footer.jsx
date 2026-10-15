import React from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Heart,
} from "lucide-react";
import { footerStyles } from "../../assets/dummyStyles";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Doctors", href: "/doctors" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
  { name: "Appointments", href: "/appointment" },
];

const services = [
  { name: "Blood Pressure Check", href: "/services" },
  { name: "Blood Sugar Test", href: "/services" },
  { name: "Full Blood Count", href: "/services" },
  { name: "X-Ray Scan", href: "/services" },
  { name: "Health Consultation", href: "/services" },
];

const socialLinks = [
  {
    Icon: Facebook,
    color: footerStyles.facebookColor,
    name: "Facebook",
    href: "https://www.facebook.com/",
  },
  {
    Icon: Twitter,
    color: footerStyles.twitterColor,
    name: "Twitter",
    href: "https://twitter.com/",
  },
  {
    Icon: Instagram,
    color: footerStyles.instagramColor,
    name: "Instagram",
    href: "https://instagram.com/",
  },
  {
    Icon: Linkedin,
    color: footerStyles.linkedinColor,
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
  },
  {
    Icon: Youtube,
    color: footerStyles.youtubeColor,
    name: "YouTube",
    href: "https://youtube.com/",
  },
];

export default function Footer() {
  return (
    <footer className={footerStyles.footerContainer}>
      <style>{footerStyles.animationStyles}</style>

      {/* Floating background decorative icons */}
      <div className={footerStyles.floatingIcon1}>
        <Stethoscope className={footerStyles.stethoscopeIcon} />
      </div>
      <div className={footerStyles.floatingIcon2}>
        <Activity className={footerStyles.activityIcon} />
      </div>

      <div className={footerStyles.mainContent}>
        <div className={footerStyles.gridContainer}>
          {/* Company section */}
          <div className={footerStyles.companySection}>
            <div className={footerStyles.logoContainer}>
              <div>
                <h2 className={footerStyles.companyName}>MediCare</h2>
                <p className={footerStyles.companyTagline}>Compassionate Healthcare Solutions</p>
              </div>
            </div>
            <p className={footerStyles.companyDescription}>
              Providing top-quality medical consultations and specialized health checkups with trusted professionals.
            </p>
            <div className={footerStyles.contactContainer}>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Phone className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>+91 98765 43210</span>
              </div>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Mail className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>support@medicare.com</span>
              </div>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <MapPin className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>Healthcare Boulevard, Medical District</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Quick Links</h3>
            <ul className={footerStyles.linksList}>
              {quickLinks.map((link) => (
                <li key={link.name} className={footerStyles.linkItem}>
                  <Link to={link.href} className={footerStyles.quickLink}>
                    <div className={footerStyles.quickLinkIconWrapper}>
                      <ChevronRight className={footerStyles.quickLinkIcon} />
                    </div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Healthcare Services */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Health Services</h3>
            <ul className={footerStyles.linksList}>
              {services.map((service, index) => (
                <li key={index} className={footerStyles.linkItem}>
                  <Link to={service.href} className={footerStyles.serviceLink}>
                    <span className={footerStyles.serviceIcon} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter and Social */}
          <div className={footerStyles.newsletterSection}>
            <h3 className={footerStyles.newsletterTitle}>Stay Connected</h3>
            <p className={footerStyles.newsletterDescription}>
              Subscribe for wellness updates, tips, and health insights delivered directly to you.
            </p>

            <div className={footerStyles.newsletterForm}>
              <div className={footerStyles.mobileNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={footerStyles.emailInput}
                />
                <button type="button" className={footerStyles.mobileSubscribeButton}>
                  <Send className={footerStyles.mobileButtonIcon} />
                  Subscribe
                </button>
              </div>

              <div className={footerStyles.desktopNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={footerStyles.desktopEmailInput}
                />
                <button type="button" className={footerStyles.desktopSubscribeButton}>
                  <Send className={footerStyles.desktopButtonIcon} />
                  <span className={footerStyles.desktopButtonText}>Subscribe</span>
                </button>
              </div>
            </div>

            <div className={footerStyles.socialContainer}>
              {socialLinks.map(({ Icon, color, name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerStyles.socialLink}
                >
                  <div className={footerStyles.socialIconBackground} />
                  <Icon className={`${footerStyles.socialIcon} ${color}`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={footerStyles.bottomSection}>
          <p className={footerStyles.copyright}>
            © {new Date().getFullYear()} MediCare SAAS. All rights reserved.
          </p>
          <p className={footerStyles.designerText}>
            Built with <Heart size={16} className="text-rose-500 fill-rose-500 inline mx-1" /> for better healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
}
