import { CSSProperties } from 'react';
import TLink from '@/components/common/TLink';
import NudgeArrow from '@/components/common/NudgeArrow';
import RoleCard from '../components/custom/RoleCard';
import SectionTitle from '../components/common/SectionTitle';
import { workExperiences, projects, albums } from '@/data/portfolioData';
import TiltedCard from '../components/custom/TiltedCard';
import { useSpotify } from '@/hooks/useSpotify';

const Index = () => {
  const { data: spotifyData, isLoading: spotifyLoading } = useSpotify();

  const getSpotifyText = () => {
    // [F6] shimmer while the first fetch is in flight
    if (spotifyLoading) {
      return <span className="text-shimmer" data-fb="F6">Checking what's playing…</span>;
    }
    if (!spotifyData || !spotifyData.title) {
      return "Not currently listening to anything";
    }

    if (spotifyData.isPlaying) {
      return (
        <>
          Currently listening to{' '}
          <a
            href={spotifyData.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-0.5 text-sage-moss hover:opacity-80 transition-opacity font-medium"
          >
            {spotifyData.title}<NudgeArrow className="h-3 w-3" />
          </a>
          {' '}by {spotifyData.artist}
        </>
      );
    }

    return (
      <>
        Last played{' '}
        <a
          href={spotifyData.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sage-moss hover:opacity-80 transition-opacity font-medium"
        >
          {spotifyData.title}
        </a>
        {' '}by {spotifyData.artist}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-16">
        {/* Introduction */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="font-heading text-3xl font-semibold inline-flex items-center">
              <span className="mr-2">👋</span>
              Welcome to My Portfolio
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I'm a student exploring engineering, product, and the systems that connect them.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I've built software at startups and large companies, sometimes to ship fast, sometimes to scale, always to solve something real. I'm especially drawn to tools that simplify workflows, surface insight, or make good ideas easier to act on.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Right now, I'm learning everything I can from the people building the next generation of products, from internal developer platforms to AI tooling.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I'm originally from the Midwest. Somewhere along the way I started tracking parts of my life, and it stuck. Some of it is about optimizing what I care about most, like my <TLink to="/whoop" data-fb="F3" className="font-semibold text-sage-moss hover:opacity-80 transition-opacity">health and fitness</TLink>. Some of it is just making sure I'm still doing the things I love, like <TLink to="/origami" className="font-semibold text-sage-moss hover:opacity-80 transition-opacity">origami</TLink> and <TLink to="/stats" className="font-semibold text-sage-moss hover:opacity-80 transition-opacity">music</TLink>.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {getSpotifyText()}
            </p>
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <SectionTitle 
            title="Work Experience" 
            resumeLink="/Suvan_Dommeti_Resume.pdf" 
          />
          
          {/* [F2] staggered reveal; [F4] expand mechanics live in RoleCard */}
          <div className="space-y-2" data-fb="F2">
            {workExperiences.map((experience, index) => (
              <RoleCard 
                key={`${experience.company ?? 'work'}-${experience.role ?? index}-${experience.period ?? index}`}
                className="row-in"
                style={{ '--row': index } as CSSProperties}
                data-fb={index === 0 ? 'F4' : undefined}
                logo={experience.logo}
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
          
          {/* [F8] reverted: same expand as Work Experience */}
          <div className="space-y-2" data-fb="F8">
            {projects.map((project, index) => (
              <RoleCard 
                key={`${project.title ?? 'project'}-${project.year ?? index}`}
                className="row-in"
                style={{ '--row': index } as CSSProperties}
                logo={project.logo}
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
                key={`${album.title}-${album.artist}`}
                href={album.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block row-in pressable"
                style={{ textDecoration: 'none', '--row': index } as CSSProperties}
              >
                <TiltedCard
                  imageSrc={album.coverUrl}
                  altText={`${album.title} by ${album.artist}`}
                  containerHeight="160px"
                  containerWidth="160px"
                  imageHeight="160px"
                  imageWidth="160px"
                  // Add a thin border
                  scaleOnHover={1.08}
                  rotateAmplitude={14}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={false}
                />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
