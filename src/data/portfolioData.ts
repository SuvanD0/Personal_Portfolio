import React from 'react';
import { Briefcase, Building, Code, Database, Factory, Globe, Landmark, MessageSquare, PenTool, Play, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import AmazonLogo from '@/assets/logos/companies/Amazon.png';
import JPMorganLogo from '@/assets/logos/companies/JPMorgan.png';
import BlueBonnetLogo from '@/assets/logos/companies/BlueBonnetData.jpg';
import NorthwestLogo from '@/assets/logos/companies/NorthwestBank.png';
import WillowTreeLogo from '@/assets/logos/companies/WillowTree.jpg';

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

export const workExperiences: RoleCardData[] = [
  {
    logo: createLogo(AmazonLogo, "Amazon Logo"),
    company: "Amazon",
    role: "Incoming Software Development Engineer Intern",
    period: "Summer 2025",
    location: "Seattle, WA",
    description: "Working on request throttling and rate-limiting optimization for AWS Bedrock, aiming to reduce p99 latency by 12% across 20B+ daily API calls.",
    tags: ["Java", "Go", "Distributed Systems", "Traffic Engineering"]
  },
  {
    logo: createLogo(JPMorganLogo, "J.P. Morgan Logo"),
    company: "J.P. Morgan Chase",
    role: "Software Engineer Intern",
    period: "Summer/Fall 2024",
    location: "Columbus, OH",
    description: "Led end-to-end product development of Blueprint, reducing load by 60% for 10,000+ daily users by migrating to Next.js from React. Decreased data pipeline latency by 40% by merging 7 data ingestion APIs into 3 endpoints and added Splunk logs to monitor performance. Deployed to AWS using Cloud Foundry & Jenkins, and implemented monitoring tools with 100% test coverage using Jest and JUnit. Achieved 99.9% data pipeline reliability for 1M+ daily events by adding Kafka streams with automated error detection and recovery.",
    tags: ["TypeScript/JavaScript", "Next.js", "React", "Splunk", "AWS", "Jenkins", "Kafka", "Cloud Foundry"]
  },
  {
    logo: createLogo(BlueBonnetLogo, "BlueBonnet Data Logo"),
    company: "BlueBonnet Data",
    role: "Product Analytics Intern",
    period: "Spring/Summer 2024",
    location: "Boston, MA",
    description: "Drove 28% higher conversion rates through data-driven A/B testing and workflow optimization based on behavioral analytics. Built a React-based voter registration system processing 40,000+ constituent interactions, improving data retrieval speed by 45%. Registered 3,000+ new voters in target districts through optimized outreach strategies. Architected real-time analytics tracking 100,000+ voter interactions, cutting reporting time by 75% through automated SQL pipelines.",
    tags: ["Python", "A/B Testing", "Data Analysis", "SQL", "React", "Behavioral Analytics", "TypeScript"]
  },
  {
    logo: createLogo(NorthwestLogo, "Northwest Bank Logo"),
    company: "Northwest Bancshares",
    role: "Software Engineer/Product Management Intern",
    period: "Fall 2023",
    location: "Columbus, OH",
    description: "Grew customer satisfaction by ~1 star. Reduced churn by 15% by managing the GTM of an AI-powered financial support chatbot. Orchestrated chatbot deployment handling 20,000+ interactions by architecting scalable infrastructure on Azure Kubernetes Service. Streamlined eliminating 1,000+ monthly customer service calls by engineering data-driven FAQ page from chatbot analytics, deflecting 25% of monthly support tickets.",
    tags: ["AI", "Azure", "Kubernetes", "Product Management", "Data Analytics"]
  },
  {
    logo: createLogo(WillowTreeLogo, "WillowTree Logo"),
    company: "WillowTree Apps",
    role: "Software Engineer Intern",
    period: "Summer 2023",
    location: "Cincinnati, OH",
    description: "Raised checkout conversion by 11% through systematic A/B testing of TypeScript-based interactive prototypes across 40 participants. Improved chatbot accuracy to 97% by experimenting with dual-LLM architecture where one model validated the other's responses. Led weekly stakeholder meetings with major QSR client, updating app design based on user feedback and testing results.",
    tags: ["TypeScript", "A/B Testing", "LLM", "UX Design", "User Testing", "React Native"]
  }
];

const createIcon = (Icon: any) => {
  return React.createElement(Icon, { className: "h-8 w-8" });
};

export const projects: RoleCardData[] = [
  {
    logo: createIcon(Globe),
    title: "WikiMedia (Wikipedia)",
    description: "ML Retention/Engagement Pipeline",
    year: "2024 - Present",
    details: "Developed ML retention model analyzing 100,000+ lifecycles, boosting prediction accuracy 23% to guide feature roadmap. Discovered a 30% higher community engagement on articles with a balance bot-human edit ratio by analyzing 1M+ bot edits. Accelerated project delivery by 2 months leading 5-person consulting team by implementing Agile methodologies through Jira.",
    tags: ["Jira", "PyTorch", "Amplitude", "Machine Learning", "Agile"]
  },
  {
    logo: createIcon(Landmark),
    title: "Research @ Yale Law Eviction Lab",
    description: "Research Project at Yale",
    year: "2024 - Present",
    details: "Designed gentrification prediction model analyzing 10+ years of census using TensorFlow to track geo-spatial population shifts. Co-Authoring a paper on using \"escape velocity\" approach to calculating a Gentrification Index (GI) of a given area. Model achieved mean absolute error under 5 percentage points for rent growth predictions.",
    tags: ["Pandas", "NumPy", "TensorFlow", "Python", "SQL", "Data Science"]
  },
  {
    logo: createIcon(MessageSquare),
    title: "Group Me Spam Detection",
    description: "Hackathon Project - HackI/O 2023",
    year: "2023 - Present",
    details: "Successfully deleted 3000+ spam messages by building a spam-detection model and integrating it with GroupMe API using Lambda. Won 'Most Creative Hack' at HackI/O 2023 and expanded the bot to 20 group chats within 10 months, releasing 3 updates since.",
    tags: ["AWS Lambda", "scikit-learn", "NextJS", "Machine Learning", "API Integration", "CloudWatch"],
    link: "https://github.com/SuvanD0/groupme-spam-bot"
  },
  {
    logo: createIcon(PenTool),
    title: "The Colors of You",
    description: "Personal Project",
    year: "2023",
    details: "Created an interactive tool for photographers to visualize their color palette preferences. The application analyzes a set of images, extracts dominant colors, and presents a visual story of the artist's unique palette. Used by 150+ photographers since launch. Built with React.js for the frontend and Python with OpenCV for color analysis.",
    tags: ["React.js", "Python", "OpenCV", "Color Theory"]
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
