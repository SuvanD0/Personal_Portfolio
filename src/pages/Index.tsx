import RoleCard from '../components/custom/RoleCard';
import SectionTitle from '../components/common/SectionTitle';
import { workExperiences, projects, albums } from '@/data/portfolioData';
import TiltedCard from '../components/custom/TiltedCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-16">
        {/* Introduction */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold inline-flex items-center">
              <span className="mr-2">👋</span>
              Welcome to My Portfolio
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I'm a student exploring engineering, product, and the systems that connect them.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I've built software at startups and large companies—sometimes to ship fast, sometimes to scale, always to solve something real. I'm especially drawn to tools that simplify workflows, surface insight, or make good ideas easier to act on.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Right now, I'm learning everything I can from the people building the next generation of products from internal developer platforms to AI tooling.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Im originally from the Midwest. I spend my free time exploring new places, listening to music, or folding origami.
            </p>
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <SectionTitle 
            title="Work Experience" 
            resumeLink="/Dommeti-Suvan-Resume.pdf" 
          />
          
          <div className="space-y-2">
            {workExperiences.map((experience, index) => (
              <RoleCard 
                key={`${experience.company ?? 'work'}-${experience.role ?? index}-${experience.period ?? index}`}
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
          
          <div className="space-y-2">
            {projects.map((project, index) => (
              <RoleCard 
                key={`${project.title ?? 'project'}-${project.year ?? index}`}
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
                className="block"
                style={{ textDecoration: 'none' }}
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
