import { Smartphone, Image } from "lucide-react"
import { AnimatedFeatureCard } from "./AnimatedFeatureCard"

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Special Features for You</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <AnimatedFeatureCard
            icon={Smartphone}
            title="Shared Background Experience"
            description="Surprise each other by changing your partner's phone and PC backgrounds with romantic images, creating daily moments of connection."
            direction="left"
          />
          <AnimatedFeatureCard
            icon={Image}
            title="Our Love Photo Album (Coming Soon)"
            description="Soon you'll be able to relive our precious moments with a curated photo album of your journey together."
            direction="right"
          />
        </div>
      </div>
    </section>
  )
}
