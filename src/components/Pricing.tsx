import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Choose Your Love Plan</h2>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          {/* Free Plan with regular Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Free</CardTitle>
              <CardDescription>Life without your love is like a broken pencil - pointless</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <X className="mr-2 h-4 w-4 text-destructive" />
                  <span>Nothing</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="mt-32">
              <Button className="w-full" variant="outline" disabled>Select Plan</Button>
            </CardFooter>
          </Card>
          {/* Free Plan with regular Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">200$</CardTitle>
              <CardDescription>Still pointless</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <X className="mr-2 h-4 w-4 text-destructive" />
                  <span>Nothing</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="mt-32">
              <Button className="w-full" variant="outline" disabled>Select Plan</Button>
            </CardFooter>
          </Card>

          {/* Your Love Plan with 3D Card */}
          <CardContainer className="w-full h-full inter-var">
            <CardBody className="bg-primary relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.1] rounded-xl p-6 w-full h-full flex flex-col">
              <div className="flex-1">
                <CardItem
                  translateZ="50"
                  className="text-2xl font-bold text-primary-foreground"
                >
                  Your Love
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-primary-foreground/90 mt-2"
                >
                  Full access to my heart
                </CardItem>
                <CardItem translateZ="80" className="mt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center text-primary-foreground">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Unlimited love and affection</span>
                    </li>
                    <li className="flex items-center text-primary-foreground">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>24/7 emotional support</span>
                    </li>
                    <li className="flex items-center text-primary-foreground">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Exclusive access to romantic surprises</span>
                    </li>
                  </ul>
                </CardItem>
              </div>
              <CardItem
                translateZ="100"
                className="w-full mt-6"
              >
                <Button className="w-full" variant="secondary">Choose Love</Button>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    </section>
  )
}