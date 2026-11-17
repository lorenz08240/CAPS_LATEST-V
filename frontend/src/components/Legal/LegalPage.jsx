import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import soundManager from "../../utilities/soundManager";
import "./LegalPage.css";

const LEGAL_DOCS = {
  privacy: {
    id: "privacy",
    tabLabel: "Privacy Policy",
    path: "/privacy",
    pageTitle: "BuildLab | Privacy Policy",
    tag: "SYSTEM // PRIVACY & DATA PROTECTION",
    title: "Privacy Policy",
    subtitle:
      "How BuildLab collects, uses, and protects learner identity data during Google OAuth sign-in and educational evaluation.",
    effectiveDate: "November 2026",
    sections: [
      {
        heading: "1. Institutional & Platform Overview",
        paragraphs: [
          "BuildLab is an interactive 2D/3D PC building, hardware compatibility validation, and computer hardware learning platform developed by Team WhiteHats at Pateros Technological College for academic instruction and research evaluation.",
          "This Privacy Policy explains what information is collected when you access BuildLab, authenticate via Google Sign-In, or participate in our student learning and certification tracks.",
        ],
      },
      {
        heading: "2. Google OAuth 2.0 Information We Collect",
        paragraphs: [
          "When you choose to link a student account in Learn Mode using Google Sign-In, BuildLab requests only basic, non-sensitive Google identity scopes (userinfo.email and userinfo.profile):",
        ],
        bullets: [
          "Google Email Address — used to uniquely identify your learner profile and associate saved builds and module unlocks.",
          "Full Legal / Display Name — used solely to personalize your workspace and generate your verified BuildLab Certificate of Completion.",
          "Profile Avatar URL — displayed inside your BuildLab navigation profile card and learner dashboard.",
          "Learning Progress & Rig Selections — unlocked track stages (build, compatibility, learn, certificate) and selected hardware configurations.",
        ],
      },
      {
        heading: "3. Google API Services User Data Policy (Limited Use)",
        paragraphs: [
          "BuildLab's use and transfer to any other app of information received from Google APIs strictly adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
          "BuildLab does not request access to your Google Drive files, Gmail inbox, Google Contacts, Calendar, or private account data. We never sell, rent, trade, or transfer learner data to third-party advertisers, analytics brokers, or external marketing platforms.",
        ],
      },
      {
        heading: "4. Academic Research & Philippine Data Privacy Act (RA 10173)",
        paragraphs: [
          "Student evaluation metrics collected during usability testing and purposive sampling (including institutional participant testing) are processed in alignment with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) strictly for educational assessment, compatibility telemetry, and academic research validation.",
        ],
      },
      {
        heading: "5. Data Retention, Self-Service Reset & Deletion Rights",
        paragraphs: [
          "Browser-stored preferences, builds, and consent tokens remain on your device only until you clear them or expire naturally. You may reset your browser session at any time using the Cookie Policy controls or by visiting the workspace reset parameter (?reset=demo).",
          "To request permanent deletion of your learner record stored in the BuildLab database, contact the development team via email at jaymark.piano06@gmail.com.",
        ],
      },
    ],
  },
  terms: {
    id: "terms",
    tabLabel: "Terms of Service",
    path: "/terms",
    pageTitle: "BuildLab | Terms of Service",
    tag: "SYSTEM // TERMS OF USE",
    title: "Terms of Service",
    subtitle:
      "Rules, hardware simulation disclaimers, and intellectual property notices governing access to BuildLab.",
    effectiveDate: "November 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms & Educational Scope",
        paragraphs: [
          "By accessing or using BuildLab—including the 2D Component Workbench, Compatibility Matrix, 3D Hardware Studio, B.O.B. Companion, and Hardware Academy—you agree to comply with these Terms of Service. BuildLab is provided free of charge for educational learning, PC architecture training, and academic research.",
        ],
      },
      {
        heading: "2. Student Accounts & Certification Integrity",
        paragraphs: [
          "Learners authenticating with Google OAuth 2.0 in Learn Mode agree to provide accurate identity details (such as their true legal name) when generating official Certificates of Completion.",
          "Unauthorized tampering, automated scraping of admin endpoints, or attempting to bypass learning stage assessments is prohibited.",
        ],
      },
      {
        heading: "3. Hardware Simulation & Electrical Safety Disclaimer",
        paragraphs: [
          "BuildLab validates common mechanical and electrical specifications such as CPU sockets (e.g., AM4, AM5, LGA1700), memory generations (DDR4 vs. DDR5), chassis form factors, and estimated Thermal Design Power (TDP) wattage headroom for instructional simulation.",
          "Before purchasing or assembling physical computer hardware, users must verify official manufacturer Qualified Vendor Lists (QVL), physical radiator/GPU clearances, and power supply safety ratings. Never mix modular power supply cables across different PSU models or manufacturers, as non-standardized pinouts can permanently damage hardware.",
        ],
      },
      {
        heading: "4. Intellectual Property & Open Hardware Attribution",
        paragraphs: [
          "BuildLab's application source code, interactive 3D studio workflow, and educational modules are developed by Team WhiteHats (Pateros Technological College). Reference hardware catalog entries incorporate community open-source specifications (such as BuildCores Open DB).",
          "All third-party manufacturer names, trademarks, and hardware imagery (including AMD, Intel, NVIDIA, ASUS, MSI, Gigabyte, Corsair, NZXT, Seasonic, and Samsung) remain the property of their respective owners and are used purely for educational identification.",
        ],
      },
      {
        heading: "5. Service Availability & Governing Law",
        paragraphs: [
          "BuildLab is provided on an 'as is' and 'as available' basis without commercial warranty. Features, component pricing estimates, or public tunnel endpoints may be updated during active academic testing. These terms are governed by the laws of the Republic of the Philippines. Questions may be directed to jaymark.piano06@gmail.com.",
        ],
      },
    ],
  },
  cookies: {
    id: "cookies",
    tabLabel: "Cookie Policy",
    path: "/cookies",
    pageTitle: "BuildLab | Cookie Policy",
    tag: "SYSTEM // COOKIES & BROWSER STORAGE",
    title: "Cookie Policy",
    subtitle:
      "Transparent breakdown of cookies, local storage, and session keys used to power BuildLab's PC builder and learner progress.",
    effectiveDate: "November 2026",
    sections: [
      {
        heading: "1. How BuildLab Uses Cookies & Browser Storage",
        paragraphs: [
          "BuildLab uses lightweight browser cookies, localStorage, and sessionStorage keys so the 2D workbench, 3D Studio, sound effects, and student certification state persist smoothly across page refreshes without requiring constant re-authentication.",
        ],
      },
      {
        heading: "2. Cookie & Storage Category Breakdown",
        storageTable: [
          {
            category: "Strictly Necessary (Always Active)",
            badgeClass: "locked",
            items: [
              {
                name: "buildlab_session",
                scope: "SESSION",
                desc: "Preserves active component selections and workspace session continuity across views.",
              },
              {
                name: "buildlab_cookie_consent / preferences",
                scope: "365 DAYS",
                desc: "Stores your selected cookie consent level so the consent banner does not reappear unnecessarily.",
              },
              {
                name: "buildlab_learner_profile / unlocked_stages",
                scope: "PERSISTENT",
                desc: "Maintains your authenticated student profile, full name, and unlocked Academy milestones.",
              },
            ],
          },
          {
            category: "Analytics & Diagnostics (Toggleable)",
            badgeClass: "analytics",
            items: [
              {
                name: "_ga / _gid",
                scope: "24H – 2Y",
                desc: "Aggregated visitor counts and navigation flows when analytics cookies are enabled.",
              },
              {
                name: "BuildLab Rig Telemetry",
                scope: "SESSION",
                desc: "Tracks compatibility validation errors and WebGL 3D studio performance diagnostics.",
              },
            ],
          },
          {
            category: "Functionality & Audio Preferences (Toggleable)",
            badgeClass: "functionality",
            items: [
              {
                name: "buildlab_audio_pref",
                scope: "365 DAYS",
                desc: "Saves your sci-fi UI sound effect mute state and audio feedback preference.",
              },
              {
                name: "buildlab_app_mode & theme",
                scope: "PERSISTENT",
                desc: "Remembers whether you are in Learn Track or Explore Mode, plus Dark/Light theme appearance.",
              },
            ],
          },
        ],
      },
      {
        heading: "3. Managing or Clearing Your Cookies",
        paragraphs: [
          "You can adjust optional Analytics and Functionality cookies at any time using the interactive Cookie Preferences panel, or reset your entire local BuildLab demo state back to a first-time visitor.",
        ],
        hasCookieControls: true,
      },
    ],
  },
};

export default function LegalPage({ docType = "privacy" }) {
  const doc = LEGAL_DOCS[docType] || LEGAL_DOCS.privacy;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = doc.pageTitle;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
  }, [doc.pageTitle]);

  const handleCopyUrl = async () => {
    try {
      soundManager.click();
    } catch {}
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      setCopied(false);
    }
  };

  const handleOpenPreferences = () => {
    try {
      soundManager.click();
    } catch {}
    window.dispatchEvent(new CustomEvent("buildlab:open-cookie-preferences"));
  };

  const handleResetDemo = () => {
    try {
      soundManager.click();
    } catch {}
    window.location.assign("/?reset=demo");
  };

  return (
    <div className="legal-page">
      <div className="legal-grid-backdrop" aria-hidden="true" />

      <div className="legal-container">
        <div className="legal-topbar">
          <Link
            to="/"
            className="legal-back-link"
            onClick={() => {
              try {
                soundManager.click();
              } catch {}
            }}
          >
            &larr; Back to BuildLab
          </Link>

          <nav className="legal-tabs" aria-label="Legal Documents">
            {Object.values(LEGAL_DOCS).map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`legal-tab-pill ${doc.id === item.id ? "active" : ""}`}
                onClick={() => {
                  try {
                    soundManager.click();
                  } catch {}
                }}
              >
                {item.tabLabel}
              </Link>
            ))}
          </nav>

          <button type="button" className="legal-copy-btn" onClick={handleCopyUrl}>
            {copied ? "✓ Link Copied" : "Copy Public Link"}
          </button>
        </div>

        <header className="legal-hero-card">
          <div className="legal-cyber-tag">
            <span className="legal-tag-dot" />
            <span>{doc.tag}</span>
          </div>
          <h1 className="legal-title">{doc.title}</h1>
          <p className="legal-subtitle">{doc.subtitle}</p>
          <div className="legal-meta-row">
            <span className="legal-meta-badge">Effective: {doc.effectiveDate}</span>
            <span className="legal-meta-badge">Developer: Team WhiteHats · PTC</span>
            <span className="legal-meta-badge">Contact: jaymark.piano06@gmail.com</span>
          </div>
        </header>

        <div className="legal-sections">
          {doc.sections.map((section) => (
            <section key={section.heading} className="legal-section-card">
              <h2 className="legal-section-heading">{section.heading}</h2>

              {section.paragraphs?.map((text, idx) => (
                <p key={idx} className="legal-paragraph">
                  {text}
                </p>
              ))}

              {section.bullets && (
                <ul className="legal-bullet-list">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}

              {section.storageTable && (
                <div className="legal-storage-groups">
                  {section.storageTable.map((group) => (
                    <div key={group.category} className="legal-storage-group">
                      <div className="storage-group-head">
                        <h3>{group.category}</h3>
                        <span className={`storage-badge ${group.badgeClass}`}>
                          {group.badgeClass === "locked" ? "REQUIRED" : "OPTIONAL"}
                        </span>
                      </div>
                      <div className="legal-storage-grid">
                        {group.items.map((item) => (
                          <div key={item.name} className="legal-storage-item">
                            <div className="storage-item-head">
                              <code className="storage-key">{item.name}</code>
                              <span className="storage-expiry">{item.scope}</span>
                            </div>
                            <p className="storage-desc">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.hasCookieControls && (
                <div className="legal-cookie-controls">
                  <button
                    type="button"
                    className="legal-btn-primary"
                    onClick={handleOpenPreferences}
                  >
                    Manage Cookie Preferences
                  </button>
                  <button
                    type="button"
                    className="legal-btn-secondary"
                    onClick={handleResetDemo}
                  >
                    Reset Session &amp; Clear All Cookies
                  </button>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
