import DomeGallery from '../components/custom/DomeGallery';

const origamiImages = [
  { src: 'https://images.unsplash.com/photo-1567359781514-81212b4d75c7?w=600', alt: 'Origami crane' },
  { src: 'https://images.unsplash.com/photo-1606103836293-0a063b7a5e89?w=600', alt: 'Origami flower' },
  { src: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600', alt: 'Origami bird' },
  { src: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600', alt: 'Paper folding' },
  { src: 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?w=600', alt: 'Origami dragon' },
  { src: 'https://images.unsplash.com/photo-1598618443855-232ee0f819f6?w=600', alt: 'Origami butterfly' },
  { src: 'https://images.unsplash.com/photo-1602081112062-4bac61ecca36?w=600', alt: 'Paper art' },
  { src: 'https://images.unsplash.com/photo-1569385210018-127685729c65?w=600', alt: 'Origami fox' },
];

const Origami = () => {
  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 60px)', position: 'relative' }}>
      <DomeGallery
        images={origamiImages}
        minRadius={1000}
        segments={24}
        grayscale={false}
        overlayBlurColor="var(--background, #ffffff)"
      />
    </div>
  );
};

export default Origami;
