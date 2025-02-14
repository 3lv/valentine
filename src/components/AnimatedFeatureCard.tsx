import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  direction: "left" | "right";
}

export function AnimatedFeatureCard({ icon: Icon, title, description, direction }: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ x: direction === "left" ? -100 : 100, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      exit={{ x: direction === "left" ? 100 : -100, opacity: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center space-y-4 text-center"
    >
      <div className="p-4 bg-primary/10 rounded-full">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
} 