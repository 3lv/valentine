import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
 
export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Last-minute Halloween costumes turned into an unforgettable night. Our Morticia and Gomez moment was spectacular.",
      name: "Halloween Magic",
      designation: "Camine Regie",
      src: "/images/halloween.jpeg",
    },
    {
      quote:
        "Each dessert bite painted memories, your smile sweeter than any confection. The awkward photo inside the restaurant just makes the memory even better.",
      name: "Pink Date",
      designation: "Sweet memories",
      src: "/images/pink-desert.jpeg",
    },
    {
      quote:
        "The eternal height debate continues! Though we both know who's really taller (it's definitely me).",
      name: "Height Competition",
      designation: "In a random mirror",
      src: "/images/i-am-taller.jpeg",
    },
    {
      quote:
        "Christmas brought more than just presents - it brought us closer together. Your smile was the best gift of all.",
      name: "Christmas Joy",
      designation: "December 25th, 2024",
      src: "/images/merry-christmas.jpeg",
    },
    {
      quote:
        "Even with face masks on, we are a beautiful couple.",
      name: "Face Masks",
      designation: "Such a beautiful couple",
      src: "/images/face-masks.jpeg",
    },
    {
      quote:
        "Being silly and cringe together is what makes us special. Who cares what others think when we're having fun?",
      name: "Cismigiu Gardens",
      designation: "Where romance meets playfulness",
      src: "/images/cismigiu-rizz.jpeg",
    },
  ];
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Love Album Demo</h2>
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </section>
  );
}