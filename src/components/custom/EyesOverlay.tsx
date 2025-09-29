// Use public asset path to avoid bundling issues in production

interface EyesOverlayProps {
  show: boolean;
  position: { top: number; left: number };
}

const EyesOverlay = ({ show, position }: EyesOverlayProps) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      <img
        src={'/EyesBurning.png'}
        alt="Eyes Burning"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          width: '200px',
          height: 'auto',
          boxShadow: '0 0 40px 10px #fff',
          pointerEvents: 'none',
          transition: 'none',
        }}
      />
    </div>
  );
};

export default EyesOverlay; 
