import DomeGallery from '../components/custom/DomeGallery';
import { useTheme } from '../hooks/useTheme';

const origamiImages = [
  { src: 'https://picsum.photos/seed/ori1/600/800', alt: 'Origami 1' },
  { src: 'https://picsum.photos/seed/ori2/600/800', alt: 'Origami 2' },
  { src: 'https://picsum.photos/seed/ori3/600/800', alt: 'Origami 3' },
  { src: 'https://picsum.photos/seed/ori4/600/800', alt: 'Origami 4' },
  { src: 'https://picsum.photos/seed/ori5/600/800', alt: 'Origami 5' },
];

const BG_COLORS: Record<string, string> = {
  dark: '#1E1F1E',
  light: '#ECE7DA',
  fun: '#fefce8',
};

const Origami = () => {
  const { theme } = useTheme();
  const bg = BG_COLORS[theme] ?? '#1E1F1E';

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 73px)', position: 'relative', overflow: 'hidden' }}>
      {/* Fade from header into gallery */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(to bottom, ${bg}, transparent)`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      <DomeGallery
        images={origamiImages}
        segments={12}
        minRadius={300}
        maxRadius={480}
        grayscale={false}
        overlayBlurColor={bg}
      />
    </div>
  );
};

export default Origami;
