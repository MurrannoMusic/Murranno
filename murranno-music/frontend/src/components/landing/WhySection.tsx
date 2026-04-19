import { FeatureBadge } from "./FeatureBadge";

export const WhySection = () => {
  const features = [
    "Unlimited Music Distribution",
    "Dedicated Customer Support",
    "Playlist Campaigns",
    "Seamless International Activations",
    "Free VIPUSIPC Code Generation",
    "Royalty-free encryption",
  ];

  return (
    <section id="why" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">
            Why Murranno Music?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Industry-leading features designed for your success
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeatureBadge key={index} text={feature} />
              ))}
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <Music className="h-32 w-32 text-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Artist Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Music } from "lucide-react";
