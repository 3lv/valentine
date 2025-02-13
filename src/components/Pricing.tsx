import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Choose Your Love Plan</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col p-6 bg-muted rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <p className="text-muted-foreground mb-4">Basic love, no strings attached</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                <span>Nothing</span>
              </li>
            </ul>
            <Button className="mt-auto" variant="outline">
              Select Plan
            </Button>
          </div>
          <div className="flex flex-col p-6 bg-primary text-primary-foreground rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Your Love</h3>
            <p className="text-primary-foreground/90 mb-4">Full access to my heart</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                <span>Unlimited love and affection</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                <span>24/7 emotional support</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                <span>Exclusive access to romantic surprises</span>
              </li>
            </ul>
            <Button className="mt-auto" variant="secondary">
              Choose Love
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
