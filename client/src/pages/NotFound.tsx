import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-4">
        <h1 className="text-6xl font-bold text-accent mb-4" style={{ fontFamily: 'Syne' }}>
          404
        </h1>

        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
          Page Not Found
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
