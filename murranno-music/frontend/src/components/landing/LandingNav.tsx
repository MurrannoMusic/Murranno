import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Menu, X } from "lucide-react";
import mmLogo from "@/assets/mm_logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={mmLogo} alt="Murranno Music" className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('home')} className="text-white hover:text-primary transition-colors font-medium">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-white hover:text-primary transition-colors font-medium">
              Distribution
            </button>
            <button onClick={() => scrollToSection('why')} className="text-white hover:text-primary transition-colors font-medium">
              Promotions
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-white hover:text-primary transition-colors font-medium">
              Blog
            </button>
            <button onClick={() => scrollToSection('footer')} className="text-white hover:text-primary transition-colors font-medium">
              Support
            </button>

            {user ? (
              userRole?.tier === 'admin' ? (
                <Link to="/admin">
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button onClick={handleSignOut} variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Sign Out
                </Button>
              )
            ) : (
              <Link to="/login">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-background/95 backdrop-blur-xl border-l border-border/50 animate-slide-in-right"
            >
              <div className="flex flex-col gap-6 mt-8 animate-fade-in">
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-foreground hover:text-primary transition-all duration-200 font-medium text-left text-lg hover:translate-x-1"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('services')}
                  className="text-foreground hover:text-primary transition-all duration-200 font-medium text-left text-lg hover:translate-x-1"
                >
                  Distribution
                </button>
                <button
                  onClick={() => scrollToSection('why')}
                  className="text-foreground hover:text-primary transition-all duration-200 font-medium text-left text-lg hover:translate-x-1"
                >
                  Promotions
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-foreground hover:text-primary transition-all duration-200 font-medium text-left text-lg hover:translate-x-1"
                >
                  Blog
                </button>
                <button
                  onClick={() => scrollToSection('footer')}
                  className="text-foreground hover:text-primary transition-all duration-200 font-medium text-left text-lg hover:translate-x-1"
                >
                  Support
                </button>

                {user ? (
                  userRole?.tier === 'admin' ? (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gap-2 hover-scale bg-primary text-white">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={handleSignOut} variant="outline" className="w-full gap-2 border-white/20 hover:bg-white/10">
                      Sign Out
                    </Button>
                  )
                ) : (
                  <Link to="/login" className="mt-4" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 hover-scale">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
