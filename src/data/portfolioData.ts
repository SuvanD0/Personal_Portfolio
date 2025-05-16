import { Briefcase, Building, Code, Database, Factory, Globe, Landmark, MessageSquare, PenTool, Play, Github, Linkedin, Twitter, Mail } from 'lucide-react';

export interface RoleCardData {
  logo?: any;
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

export const workExperiences: RoleCardData[] = [
  {
    logo: Building,
    company: "Amazon",
    role: "Incoming Software Development Engineer Intern",
    period: "Summer 2025",
    location: "Seattle, WA",
    description: "AWS Bedrock",
    tags: ["Java"]
  },
  {
    logo: Landmark,
    company: "J.P. Morgan Chase",
    role: "Software Engineer Intern",
    period: "Summer/Fall 2024",
    location: "Columbus, OH",
    description: "Led end-to-end product development of Blueprint, reducing load by 60% for 10,000+ daily users migrating to Next.Js from React. Decreased data pipeline latency by 40% merging 7 data ingestion APIs into 3 endpoints, added Splunk logs to monitor performance. Deployed to AWS using Cloud Foundry & Jenkins, implemented monitoring tools with 100% test coverage using Jest and J-Unit. Achieved 99.9% data pipeline reliability for 1M+ daily events by adding Kafka streams with automated error detection and recovery.",
    tags: ["TypeScript/JavaScript", "Next.js", "React", "Splunk", "AWS", "Jenkins"]
  },
  {
    logo: Database,
    company: "BlueBonnet Data",
    role: "Product Analytics Intern",
    period: "Spring/Summer 2024",
    location: "Boston, MA",
    description: "Drove 28% higher conversion rates through data-driven A/B testing and workflow optimization based on behavioral analytics. Built a React-based voter registration system processing 40,000+ constituent interactions, improving data retrieval speed by 45%. Architected real-time analytics tracking 100,000+ voter interactions, cutting reporting time by 75% through automated SQL pipelines.",
    tags: ["Python", "A/B Testing", "Data Analysis", "SQL", "React", "Behavioral Analytics"]
  },
  {
    logo: Factory,
    company: "Northwest Bancshares",
    role: "Software Engineer/Product Management Intern",
    period: "Fall 2023",
    location: "Columbus, OH",
    description: "Grew customer satisfaction by ~1 star and reduced churn by 15% by managing the GTM of an AI-powered financial support chatbot. Orchestrated chatbot deployment handling 20,000+ interactions by architecting scalable infrastructure on Azure Kubernetes Service. Streamlined eliminating 1,000+ monthly customer service calls by engineering data-driven FAQ page from chatbot analytics.",
    tags: ["AI", "Azure", "Kubernetes", "Product Management", "Data Analytics"]
  },
  {
    logo: Briefcase,
    company: "WillowTree Apps",
    role: "Software Engineer Intern",
    period: "Summer 2023",
    location: "Cincinnati, OH",
    description: "Drove 11% higher user conversion through systematic A/B testing of TypeScript-based interactive prototypes across 40 participants. Improved chatbot accuracy to 97% by experimenting with dual-LLM architecture where one model validated the other's responses. Led weekly stakeholder meetings with major QSR client, updating app design based on user feedback and testing results.",
    tags: ["TypeScript", "A/B Testing", "LLM", "UX Design", "User Testing"]
  }
];

export const projects: RoleCardData[] = [
  {
    logo: Globe,
    title: "WikiMedia (Wikipedia)",
    description: "Research Project",
    year: "2024 - Present",
    details: "Developed ML retention model analyzing 100,000+ lifecycles, boosting prediction accuracy 23% to guide feature roadmap. Discovered a 30% higher community engagement on articles with a balance bot-human edit ratio by analyzing 1M+ bot edits. Accelerated project delivery by 2 months leading 5-person consulting team by implementing Agile methodologies through Jira.",
    tags: ["Jira", "PyTorch", "Amplitude", "Machine Learning", "Agile"]
  },
  {
    logo: Landmark,
    title: "Research @ Yale Law Eviction Lab",
    description: "Research Project at Yale",
    year: "2024 - Present",
    details: "Designed gentrification prediction model analyzing 10+ years of census using TensorFlow to track geo-spatial population shifts. Co-Authoring a paper on using \"escape velocity\" approach to calculating a Gentrification Index (GI) of a given area.",
    tags: ["Pandas", "NumPy", "TensorFlow", "Python", "SQL", "Data Science"]
  },
  {
    logo: MessageSquare,
    title: "Group Me Spam Detection",
    description: "Hackathon Project - HackI/O 2023",
    year: "2023 - Present",
    details: "Successfully deleted 3000+ spam messages by building a spam-detection model and integrating it with GroupMe API using Lambda. Won 'Most Creative Hack' at HackI/O 2023 and expanded the bot to 20 group chats within 10 months, releasing 3 updates since.",
    tags: ["AWS Lambda", "scikit-learn", "NextJS", "Machine Learning", "API Integration"]
  },
  {
    logo: PenTool,
    title: "The Colors of You",
    description: "Personal Project",
    year: "2023",
    details: "Created an interactive tool for photographers to visualize their color palette preferences. The application analyzes a set of images, extracts dominant colors, and presents a visual story of the artist's unique palette. Built with React.js for the frontend and Python with OpenCV for color analysis.",
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
    title: "Twitter",
    description: "Follow me on Twitter",
    url: "https://twitter.com/yourusername"
  },
  {
    title: "Email",
    description: "Get in touch via email",
    url: "mailto:suvandommeti0@gmail.com"
  }
];

export const albums: AlbumData[] = [
  {
    title: "Blonde",
    artist: "Frank Ocean",
    year: "2016",
    coverUrl: "/albums/blonde.jpg",
    link: "https://open.spotify.com/album/3mH6qwIy9crq0I9YQbOuDf"
  },
  {
    title: "IGOR",
    artist: "Tyler, The Creator",
    year: "2019",
    coverUrl: "/albums/igor.jpg",
    link: "https://open.spotify.com/album/5zi7WsKlIiUXv09tbGLKsE"
  },
  {
    title: "Madvillainy",
    artist: "Madvillain",
    year: "2004",
    coverUrl: "/albums/madvillainy.jpg",
    link: "https://open.spotify.com/album/19bQiwEKhXUBJWY6oV3KZk"
  },
  {
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    year: "2015",
    coverUrl: "/albums/tpab.jpg",
    link: "https://open.spotify.com/album/7ycBtnsMtyVbbwTfJwRjSP"
  },
  {
    title: "The Life of Pablo",
    artist: "Kanye West",
    year: "2016",
    coverUrl: "/albums/tlop.jpg",
    link: "https://open.spotify.com/album/7gsWAHLeT0w7es6FofOXk1"
  },
  {
    title: "Channel Orange",
    artist: "Frank Ocean",
    year: "2012",
    coverUrl: "/albums/channel-orange.jpg",
    link: "https://open.spotify.com/album/392p3shh2jkxUxY2VHvlH8"
  },
  {
    title: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    year: "2010",
    coverUrl: "/albums/mbdtf.jpg",
    link: "https://open.spotify.com/album/20r762YmB5HeofjMCiPMLv"
  },
  {
    title: "good kid, m.A.A.d city",
    artist: "Kendrick Lamar",
    year: "2012",
    coverUrl: "/albums/gkmc.jpg",
    link: "https://open.spotify.com/album/6PBZN8cbwkqm1ERj2BGXJ1"
  }
];
