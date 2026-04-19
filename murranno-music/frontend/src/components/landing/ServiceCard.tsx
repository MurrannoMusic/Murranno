import { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "primary" | "secondary";
}

export const ServiceCard = ({ icon: Icon, title, description, variant = "primary" }: ServiceCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const bgColor = variant === "primary" 
    ? "bg-[#E5D4F5]" 
    : "bg-[#B99FE5]";
  
  return (
    <Card 
      ref={cardRef}
      className={`group ${bgColor} px-10 py-9 border-0 rounded-xl cursor-pointer flex flex-col justify-between transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex flex-col gap-6">
        <div className="w-fit mb-2">
          <Icon className="h-8 w-8 text-[#7C3AED]" strokeWidth={2.5} />
        </div>
        <h3 className="text-[18px] leading-snug font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-xs md:text-sm text-[#111827] leading-relaxed opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          {description}
        </p>
      </div>
      <button className="mt-6 flex items-center gap-2 text-sm font-medium text-[#111827] transition-all group-hover:gap-3">
        Learn More <ArrowRight className="h-4 w-4" />
      </button>
    </Card>
  );
};
