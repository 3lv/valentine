import { Smartphone, Image } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Special Features for You</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Shared Background Experience</h3>
            <p className="text-muted-foreground">
              Surprise each other by changing your partner's phone and PC backgrounds with romantic images, creating daily moments of connection.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Image className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Our Love Photo Album (Coming Soon)</h3>
            <p className="text-muted-foreground">
              Soon you'll be able to relive our precious moments with a curated photo album of your journey together.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
