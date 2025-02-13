import { Card, CardContent } from "@/components/ui/card"

export default function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Our Love Story</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-lg mb-2">
                "From the moment I met you, I knew you were special. Your smile lights up my world, and your love gives
                me strength every day."
              </p>
              <p className="font-semibold">- Me</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-lg mb-2">
                "You've shown me what true love means. Your kindness, humor, and passion inspire me to be a better
                person. I'm so lucky to have you."
              </p>
              <p className="font-semibold">- Her</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
