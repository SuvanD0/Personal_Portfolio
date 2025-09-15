import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Resume = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Resume - Portfolio';
  }, []);

  const handleDownload = () => {
    // Open the resume PDF in a new tab
    window.open('/Dommeti-Suvan-Resume.pdf', '_blank');
  };

  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Resume</h1>
          <p className="text-muted-foreground">
            View or download my resume to learn more about my experience and skills.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            View Resume
          </Button>
          
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
        
        <div className="pt-4">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Resume; 
