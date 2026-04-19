import { TestimonialCard } from "./TestimonialCard";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Murranno Music has completely transformed how I distribute my music. The platform is incredibly easy to use and their support team is always there when I need them.",
      author: "Kidiamope",
    },
    {
      quote: "I've been using Murranno Music for over a year now, and I couldn't be happier. The analytics dashboard helps me understand my audience better and make informed decisions.",
      author: "Obinna M.S Wealth",
    },
    {
      quote: "The promotional tools and playlist campaigns have helped me reach audiences I never thought possible. Murranno Music is a game-changer for independent artists.",
      author: "Telewas",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Real Stories from Artists
          </h2>
          <p className="text-xl text-muted-foreground">
            Our story told by our clients
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
