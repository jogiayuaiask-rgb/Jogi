import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteMetadata {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  breadcrumbs: Array<{ position: number; name: string; item: string }>;
}

const METADATA_MAP: Record<string, RouteMetadata> = {
  '/': {
    title: 'JOGI Ayu AI | Clinical Ayurveda, Panchakarma & Vector RAG Sanctuary',
    description: 'Official AI intelligence center for Jogi Ayurved Hospital, Surat. Grounded clinical consultations, Panchakarma protocols, and herbal therapeutics supervised by Dr. Devangi Jogal & Nilesh Jogal.',
    keywords: 'JOGI Ayurved, Dr Devangi Jogal, Ask Jogi Ayu, Ayurvedic Hospital Surat, Panchakarma Treatment Gujarat, Fatty Liver Ayurveda, Vibandha Constipation Cure, Ayurvedic Intelligence Center',
    canonical: 'https://jogiayurved.com/',
    ogTitle: 'JOGI Ayu AI — Clinical Ayurveda & Panchakarma Sanctuary',
    ogDescription: 'Experience 3D Ayurvedic sanctuary consultations, verified RAG medical intelligence, and authentic Panchakarma therapeutics.',
    ogType: 'website',
    breadcrumbs: [
      { position: 1, name: 'Home', item: 'https://jogiayurved.com/' }
    ]
  },
  '/admin': {
    title: 'Vaidya Pipeline Admin | JOGI Ayu AI',
    description: 'Secure clinical operations, system diagnostics, vector health telemetry, and live database synchronization for Jogi Ayurved clinical supervisors.',
    keywords: 'Vaidya, Admin, Jogi Ayurved Admin, Clinical Synced Database, Vector Database Health, RAG Pipeline Surat',
    canonical: 'https://jogiayurved.com/admin',
    ogTitle: 'Vaidya Pipeline Admin — JOGI Ayu AI',
    ogDescription: 'Manage real-time synchronized clinical data pipelines and system telemetry securely.',
    ogType: 'article',
    breadcrumbs: [
      { position: 1, name: 'Home', item: 'https://jogiayurved.com/' },
      { position: 2, name: 'Clinical Intelligence', item: 'https://jogiayurved.com/clinical/' },
      { position: 3, name: 'Vaidya Pipeline Admin', item: 'https://jogiayurved.com/admin' }
    ]
  },
  '/auth': {
    title: 'Auth Sanctuary | JOGI Ayu AI',
    description: 'Secure access gateway to JOGI Ayurved clinical data dashboard and physician-only controls.',
    keywords: 'Ayurveda Portal Login, Jogi Ayurved Auth, Secure Clinical Access',
    canonical: 'https://jogiayurved.com/auth',
    ogTitle: 'Auth Sanctuary — Secure Clinical Access',
    ogDescription: 'Secure access controls for certified Jogi Ayurved doctors and staff.',
    ogType: 'article',
    breadcrumbs: [
      { position: 1, name: 'Home', item: 'https://jogiayurved.com/' },
      { position: 2, name: 'Auth Sanctuary', item: 'https://jogiayurved.com/auth' }
    ]
  }
};

export const SEOHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching metadata or fall back to home
    const meta = METADATA_MAP[currentPath] || METADATA_MAP['/'];

    // 1. Update document title
    document.title = meta.title;

    // Helper to set or create meta elements
    const setMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link elements
    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
        : `link[rel="${rel}"]:not([hreflang])`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) {
          element.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Update Primary SEO tags
    setMetaTag('name', 'title', meta.title);
    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'keywords', meta.keywords);

    // 3. Update Canonical link & dynamic hreflangs to prevent drift
    setLinkTag('canonical', meta.canonical);
    setLinkTag('alternate', meta.canonical, 'en');
    
    // Create base path alternates
    const pathSuffix = currentPath === '/' ? '' : currentPath;
    setLinkTag('alternate', `https://jogiayurved.com/gu${pathSuffix}`, 'gu');
    setLinkTag('alternate', `https://jogiayurved.com/hi${pathSuffix}`, 'hi');
    setLinkTag('alternate', meta.canonical, 'x-default');

    // 4. Update Open Graph / Social tags
    setMetaTag('property', 'og:type', meta.ogType);
    setMetaTag('property', 'og:title', meta.ogTitle);
    setMetaTag('property', 'og:description', meta.ogDescription);
    setMetaTag('property', 'og:url', meta.canonical);

    // 5. Update Twitter tags
    setMetaTag('name', 'twitter:title', meta.ogTitle);
    setMetaTag('name', 'twitter:description', meta.ogDescription);
    setMetaTag('name', 'twitter:url', meta.canonical);

    // 6. Dynamic Unified JSON-LD Injection
    let schemaScript = document.getElementById('dynamic-seo-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'dynamic-seo-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const unifiedSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://jogiayurved.com/#website",
          "url": "https://jogiayurved.com/",
          "name": "JOGI Ayu AI Sanctuary",
          "description": "Clinical Ayurvedic Intelligence & Vector Search Sanctuary",
          "publisher": {
            "@id": "https://jogiayurved.com/#hospital"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://jogiayurved.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${meta.canonical}#breadcrumb`,
          "itemListElement": meta.breadcrumbs.map(bc => ({
            "@type": "ListItem",
            "position": bc.position,
            "name": bc.name,
            "item": bc.item
          }))
        },
        {
          "@type": "ItemList",
          "@id": "https://jogiayurved.com/#quicklinks",
          "name": "Clinical Sitelinks Navigation",
          "itemListElement": [
            {
              "@type": "SiteNavigationElement",
              "position": 1,
              "name": "Fatty Liver Therapeutics",
              "url": "https://jogiayurved.com/clinical/fatty-liver"
            },
            {
              "@type": "SiteNavigationElement",
              "position": 2,
              "name": "Cardiovascular & Arjuna",
              "url": "https://jogiayurved.com/clinical/cardio"
            },
            {
              "@type": "SiteNavigationElement",
              "position": 3,
              "name": "Parkinson's & Kampavata",
              "url": "https://jogiayurved.com/clinical/kampavata"
            },
            {
              "@type": "SiteNavigationElement",
              "position": 4,
              "name": "Panchakarma Procedures",
              "url": "https://jogiayurved.com/panchakarma/"
            }
          ]
        }
      ]
    };

    schemaScript.textContent = JSON.stringify(unifiedSchema, null, 2);

    console.log(`[SEOHandler] Dynamically updated SEO tags & schemas for path: ${currentPath}`);
  }, [location]);

  return null; // Side-effect only component
};
