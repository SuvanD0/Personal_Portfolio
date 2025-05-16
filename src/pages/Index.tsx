import { useState } from 'react';
import Header from '@/components/Header';
import RoleCard from '@/components/RoleCard';
import SectionTitle from '@/components/SectionTitle';
import EyesOverlay from '@/components/EyesOverlay';
import { workExperiences, projects, albums } from '@/data/portfolioData';

const Index = () => {
  const [showEyes, setShowEyes] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerEyesOverlay = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const imgWidth = 300;
    const imgHeight = 200;
    const left = Math.random() * (vw - imgWidth);
    const top = Math.random() * (vh - imgHeight);
    setPosition({ top, left });
    setShowEyes(true);
    setTimeout(() => setShowEyes(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <EyesOverlay show={showEyes} position={position} />
      <Header onLightMode={triggerEyesOverlay} />
      
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-16">
        {/* Introduction */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold inline-flex items-center">
              <span className="mr-2">👋</span>
              Welcome to Your Portfolio
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I'm a passionate professional with experience in engineering and technology.
              Previously, I worked on innovative projects in multiple industries and now
              I'm focused on building cutting-edge solutions.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I enjoy traveling between New York and San Francisco, watching great movies,
              and exploring new culinary experiences.
            </p>
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <SectionTitle 
            title="Work Experience" 
            resumeLink="/resume.pdf" 
          />
          
          <div className="space-y-2">
            {workExperiences.map((experience, index) => (
              <RoleCard 
                key={index}
                logo={<experience.logo className="h-4 w-4" />}
                company={experience.company}
                role={experience.role}
                period={experience.period}
                location={experience.location}
                description={experience.description}
                tags={experience.tags}
              />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <SectionTitle title="Projects" />
          
          <div className="space-y-2">
            {projects.map((project, index) => (
              <RoleCard 
                key={index}
                logo={<project.logo className="h-4 w-4" />}
                title={project.title}
                description={project.description}
                year={project.year}
                link={project.link}
                details={project.details}
                tags={project.tags}
              />
            ))}
          </div>
        </section>

        {/* Albums Section */}
        <section>
          <SectionTitle title="Favorite Albums" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((album, index) => (
              <a
                key={index}
                href={album.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={album.coverUrl}
                  alt={`${album.title} by ${album.artist}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <h3 className="text-white font-semibold text-sm">{album.title}</h3>
                  <p className="text-white/80 text-xs">{album.artist}</p>
                  <p className="text-white/60 text-xs">{album.year}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
