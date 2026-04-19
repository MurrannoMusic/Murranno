import { Music, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LandingFooter = () => {
  return (
    <footer id="footer" className="bg-background border-t border-border/20">
      {/* Artist Images Banner */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/promotions" className="text-muted-foreground hover:text-primary transition-colors">Promotions</Link></li>
              <li><Link to="/releases" className="text-muted-foreground hover:text-primary transition-colors">Distribution</Link></li>
              <li><Link to="/analytics" className="text-muted-foreground hover:text-primary transition-colors">Artist RPMs</Link></li>
            </ul>
          </div>
          
          {/* Column 2 - Company */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Career</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          {/* Column 3 - Support */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Condition</Link></li>
            </ul>
          </div>
          
          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Subscribe to Our Newsletter</h3>
            <div className="flex gap-2 mb-4">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-card"
              />
              <Button>Subscribe</Button>
            </div>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Murranno Music</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Copyright © 2025 Murranno Music Ltd. All Rights Reserved
          </p>
          
          <div className="flex gap-4 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
