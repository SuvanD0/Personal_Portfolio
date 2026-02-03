import React from 'react';
import { Briefcase, Building, Code, Database, Factory, Globe, Landmark, MessageSquare, PenTool, Play, Github, Linkedin, Twitter, Mail, Award, Users, BookOpen } from 'lucide-react';
import AmazonLogo from '@/assets/logos/companies/Amazon.jpg';
import JPMorganLogo from '@/assets/logos/companies/JPMorgan.png';
import BlueBonnetLogo from '@/assets/logos/companies/BlueBonnetData.jpg';
import NorthwestLogo from '@/assets/logos/companies/NorthwestBank.png';
import WillowTreeLogo from '@/assets/logos/companies/WillowTree.jpg';
import GroupMeLogo from '@/assets/logos/projects/GroupMe.jpg';
import WikimediaLogo from '@/assets/logos/projects/Wikimedia.png';
import YaleLawSchoolLogo from '@/assets/logos/projects/YaleLawSchool.png';

export interface RoleCardData {
  logo?: React.ReactNode;
  title?: string;
  company?: string;
  role?: string;
  year?: string;
  period?: string;
  link?: string;
  location?: string;
  description?: string;
  details?: string;
  tags?: string[];
}

export interface PersonalLink {
  title: string;
  description: string;
  url: string;
}

export interface AlbumData {
  title: string;
  artist: string;
  year: string;
  coverUrl: string;
  link?: string;
}

export interface LeadershipData {
  logo?: React.ReactNode;
  title: string;
  organization: string;
  period: string;
  description: string;
  achievements?: string[];
  tags?: string[];
}

const createLogo = (src: string, alt: string) => {
  return React.createElement('img', {
    src,
    alt,
    style: {
      width: '32px',
      height: '32px',
      objectFit: 'contain',
      borderRadius: '8px'
    }
  });
};

const createProjectLogo = (src: string, alt: string) => {
  return React.createElement('img', {
    src,
    alt,
    style: {
      width: '32px',
      height: '32px',
      objectFit: 'contain',
      borderRadius: '8px'
    }
  });
};

export const workExperiences: RoleCardData[] = [
  {
    logo: createLogo(AmazonLogo, "Amazon Logo"),
    company: "Amazon Web Services (AWS)",
    role: "Software Development Engineer Intern",
    period: "May 2025 – Aug 2025",
    location: "Seattle, WA",
    description: "Integrated OpenSearch into Bedrock's throttling control plane, enabling complex searches across 100,000+ rate limiting rule sets. Implemented real-time anomaly detection to flag hostile rule patterns, preventing 200+ potential service disruptions per quarter. Engineered reusable CloudFormation templates for network-layer alert monitoring via AWS CloudWatch, now used by 3 teams. Launched a Quicksight dashboard for throttling rule sets, saving ~5 engineer-hours/week by eliminating manual database queries.",
    tags: ["Java", "Go", "AWS", "OpenSearch", "CloudFormation", "CloudWatch", "Quicksight", "Distributed Systems"]
  },
  {
    logo: createLogo(JPMorganLogo, "J.P. Morgan Logo"),
    company: "J.P. Morgan Chase",
    role: "Software Engineer Intern",
    period: "May 2024 – Dec 2024",
    location: "Columbus, OH",
    description: "Migrated React app to Next.js with TypeScript, improving Core Web Vitals by 50%, adding WCAG 2.1 accessibility for 10,000+ users. Built 7 reusable TypeScript/React components with full keyboard navigation and ARIA support, deployed across 2 production apps. Improved data pipeline latency by 40% merging 7 data ingestion APIs into 3 endpoints, added Splunk logs to monitor performance. Achieved full test coverage deploying applications to AWS via Cloud Foundry and Jenkins, monitored by Jest and JUnit.",
    tags: ["TypeScript/JavaScript", "Next.js", "React", "Splunk", "AWS", "Jenkins", "Cloud Foundry", "WCAG 2.1", "ARIA"]
  },
  {
    logo: createLogo(YaleLawSchoolLogo, "Yale Law School Logo"),
    company: "Yale Law School Eviction Lab",
    role: "Research Assistant",
    period: "May 2024 – Present",
    location: "New Haven, CT",
    description: "Developing an open-source Python library to predict demographic shifts and gentrification patterns, now used by ~500 researchers. Created ML models with 92% accuracy in predicting neighborhood gentrification, leveraging TensorFlow and historical datasets. Engineered a data scraper to automate housing data collection, transforming 1M+ listings into structured datasets for model training.",
    tags: ["Python", "Machine Learning", "TensorFlow", "Data Science", "Open Source", "Research"]
  },
  {
    logo: createLogo(NorthwestLogo, "Northwest Bank Logo"),
    company: "Northwest Bancshares",
    role: "Software Engineer/Product Management Intern",
    period: "Aug 2023 – Dec 2023",
    location: "Columbus, OH",
    description: "Deployed chatbot infrastructure on Azure Kubernetes Service for customer support automation, scaling to 500+ daily interactions. Eliminated 300+ monthly customer service calls by building a dynamic FAQ system sourced from real-time chatbot queries.",
    tags: ["Azure", "Kubernetes", "Product Management", "Chatbot", "FAQ System", "Customer Support"]
  },
  {
    logo: createLogo(WillowTreeLogo, "WillowTree Logo"),
    company: "WillowTree Apps",
    role: "Software Engineer Intern",
    period: "Jun 2023 – Sep 2023",
    location: "Cincinnati, OH",
    description: "Prototyped mobile features with design/product teams, iterating on 100+ user feedback sessions to improve satisfaction by 25%. Built and deployed 3 features in Kotlin for the production android app, fully integrated with backend services and client infrastructure.",
    tags: ["Kotlin", "Android", "Mobile Development", "User Experience", "Prototyping", "Backend Integration"]
  }
];

const createIcon = (Icon: any) => {
  return React.createElement(Icon, { className: "h-8 w-8" });
};

export const projects: RoleCardData[] = [
  {
    logo: createProjectLogo(WikimediaLogo, "Wikimedia Logo"),
    title: "WikiMedia (Wikipedia)",
    description: "ML Content Classification & Engagement Analysis",
    year: "Aug 2024 – Present",
    details: "Built an ML model to classify AI vs human generated content, improving content attribution accuracy by 23% across 100,000+ articles. Discovered a 30% higher community engagement on articles with a balanced bot-human edit ratio by analyzing 1M+ bot edits.",
    tags: ["Machine Learning", "Content Analysis", "Data Science", "Python", "Big Data", "Community Engagement"]
  },
  {
    logo: createProjectLogo(GroupMeLogo, "GroupMe Logo"),
    title: "GroupMe Spam Detection Bot",
    description: "AI-Powered Spam Filtering System",
    year: "Dec 2023 – Present",
    details: "Successfully deleted 3000+ spam messages by building a spam-detection model and integrating it with GroupMe API using Lambda. Won 'Most Creative Hack' at HackI/O 2023 and expanded the bot to 20 group chats within 10 months, releasing 3 updates since.",
    tags: ["AWS Lambda", "Machine Learning", "API Integration", "Spam Detection", "Bot Development", "Hackathon Winner"]
  }
];

export const leadershipExperience: LeadershipData[] = [
  {
    logo: createIcon(Award),
    title: "College Talent Fellow",
    organization: "a16z",
    period: "Aug 2024 – Present",
    description: "Selected as a fellow in Andreessen Horowitz's prestigious college talent program, gaining insights into venture capital and startup ecosystem.",
    tags: ["Venture Capital", "Startup Ecosystem", "Leadership", "Networking"]
  },
  {
    logo: createIcon(Users),
    title: "President",
    organization: "Big Data & Analytics Association",
    period: "Jan 2024 – Present",
    description: "Expanded sponsor base from 2 to 11 companies by leading partnership outreach and hosting 20+ events with Fortune 500 firms. Launched a weekly lecture series on machine learning and data science, reaching 100+ students and ending in a 400-person gala. Organized two tech career fairs (1,000+ attendees each) and hosted DataI/O, a 2 day intercollegiate analytics & data hackathon.",
    achievements: [
      "Expanded sponsor base from 2 to 11 companies",
      "Hosted 20+ events with Fortune 500 firms",
      "Launched weekly ML/DS lecture series reaching 100+ students",
      "Organized 400-person gala event",
      "Hosted two tech career fairs (1,000+ attendees each)",
      "Organized DataI/O intercollegiate hackathon"
    ],
    tags: ["Leadership", "Event Planning", "Partnership Development", "Data Science", "Community Building"]
  }
];

export const personalLinks: PersonalLink[] = [
  {
    title: "GitHub",
    description: "Connect with me on GitHub",
    url: "https://github.com/SuvanD0"
  },
  {
    title: "LinkedIn",
    description: "Connect with me on LinkedIn",
    url: "https://www.linkedin.com/in/suvan-dommeti/"
  },
  {
    title: "Email",
    description: "Get in touch via email",
    url: "mailto:suvandommeti0@gmail.com"
  }
];

export const albums: AlbumData[] = [
  {
    title: "Beta",
    artist: "Peter Cat Recording Co.",
    year: "2024",
    coverUrl: "/albums/Beta.jpg",
    link: "https://open.spotify.com/album/5RyDQJIkTOl0QMeFZz8UGe"
  },
  {
    title: "Bread",
    artist: "The Alchemist",
    year: "2018",
    coverUrl: "/albums/Bread.jpg",
    link: "https://open.spotify.com/album/6HB5Nq7lSjvTs3gJom6BXI"
  },
  {
    title: "Either/Or",
    artist: "Elliott Smith",
    year: "1997",
    coverUrl: "/albums/Either_Or.jpg",
    link: "https://open.spotify.com/album/5bmpvyP7UGqB4VuXmrJUMy"
  },
  {
    title: "England Made Me",
    artist: "Black Box Recorder",
    year: "1998",
    coverUrl: "/albums/England_Made_Me.jpg",
    link: "https://open.spotify.com/album/1PVtgkCZPW8AVll0gKsHDS"
  },
  {
    title: "Folklore",
    artist: "Taylor Swift",
    year: "2020",
    coverUrl: "/albums/Folklore.jpg",
    link: "https://open.spotify.com/album/2fenSS68JI1h4Fo296JfGr"
  },
  {
    title: "In Rainbows",
    artist: "Radiohead",
    year: "2007",
    coverUrl: "/albums/In_Rainbows.jpg",
    link: "https://open.spotify.com/album/5vkqYmiPBYLaalcmjujWxK"
  },
  {
    title: "Pink Moon",
    artist: "Nick Drake",
    year: "1972",
    coverUrl: "/albums/Pink_Moon.jpg",
    link: "https://open.spotify.com/album/5mwOo1zikswhmfHvtqVSXg"
  },
  {
    title: "Vampire Weekend",
    artist: "Vampire Weekend",
    year: "2008",
    coverUrl: "/albums/Vampire_Weekend.jpg",
    link: "https://open.spotify.com/album/7n8NJkGKAl2np1bXiRn0CY"
  }
];
