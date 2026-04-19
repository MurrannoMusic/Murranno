import { Columns, Layers, Folder, CreditCard, List, Square } from "lucide-react";
import { ServiceCard } from "./ServiceCard";

export const ServicesSection = () => {
  const services = [
    { 
      icon: Columns, 
      title: "Music Distribution", 
      description: "Get your music on Spotify, Apple Music, TikTok, YouTube, and more. Free and 100% royalties available",
      variant: "primary" as const 
    },
    { 
      icon: Layers, 
      title: "Promotion", 
      description: "Boost your music reach with targeted campaigns across social media and streaming platforms",
      variant: "secondary" as const 
    },
    { 
      icon: Folder, 
      title: "Streaming Analytics", 
      description: "Track your performance with detailed insights on streams, listeners, and engagement metrics",
      variant: "primary" as const 
    },
    { 
      icon: CreditCard, 
      title: "Artist Profile Creation", 
      description: "Build your professional artist presence with optimized profiles across all major platforms",
      variant: "secondary" as const 
    },
    { 
      icon: List, 
      title: "Artist Support", 
      description: "Get dedicated support from music industry experts to help grow your career",
      variant: "primary" as const 
    },
    { 
      icon: Square, 
      title: "Cover Arts & Videos", 
      description: "Professional design services for album covers, promotional videos, and visual content",
      variant: "secondary" as const 
    },
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-6xl mx-auto">
          <p className="text-sm font-semibold tracking-wider text-foreground/60 mb-2">
            FOCUS AREAS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Music Business Solutions
          </h2>
          <p className="text-foreground/70 max-w-2xl">
            We empower artists from every background to thrive in today's digital and interconnected global music industry.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              variant={service.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
