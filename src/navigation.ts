import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Story', href: '#story' },
    { text: 'Journey', href: '#story' },
    { text: 'Philosophy', href: '#philosophy' },
    { text: 'ENCORE', href: 'https://www.encore-tech.com/' },
  ],
  actions: [{ text: 'Contact', href: 'mailto:sales@encore-tech.com', variant: 'primary' as const }],
};

export const footerData = {
  links: [
    { title: 'Explore', links: [
      { text: 'Founder Story', href: '#story' },
      { text: 'Philosophy', href: '#philosophy' },
      { text: 'ENCORE', href: 'https://www.encore-tech.com/' },
    ]},
    { title: 'Connect', links: [
      { text: 'Email ENCORE', href: 'mailto:sales@encore-tech.com' },
      { text: 'Visit Website', href: 'https://www.encore-tech.com/' },
    ]},
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: '&copy; 2026 ENCORE. Founder story.',
};