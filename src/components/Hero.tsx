"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"
import { Button } from "@/components/ui/button"

import HeartHologram from "@/components/HeartHologram"
import Link from "next/link"


export default function Hero() {
  return (
    <section className="w-full h-[calc(100vh-3.5rem)] flex items-center">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 mx-auto">
            <div className="space-y-2 sm:pt-12 md:pt-16">
              <h1 className="pb-4 text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none whitespace-nowrap">
                My Heart Beats for You
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                This Valentine's Day, I want to show you how much you mean to me. Explore our love story and the special
                features I've prepared just for you.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/love-dashboard/background">Explore Our Love</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="aspect-square rounded-xl">
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <HeartHologram />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  )
}
