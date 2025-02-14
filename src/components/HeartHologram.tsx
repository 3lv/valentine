"use client"

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Shape, ExtrudeGeometry, Vector3 } from 'three'
import * as THREE from 'three'

export default function HeartHologram(props: any) {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate slowly
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3

      // Create heartbeat effect using sine wave
      const heartbeat = Math.sin(state.clock.elapsedTime * 4) // Frequency of heartbeat
      const baseScale = 1
      const pulseIntensity = 0.1 // How much it pulses
      
      // Create a double-beat effect by modifying the sine wave
      const modifiedHeartbeat = Math.pow(heartbeat, 2) * (heartbeat > 0 ? 1 : 0.3)
      
      // Apply scale pulse
      meshRef.current.scale.setScalar(baseScale + modifiedHeartbeat * pulseIntensity)

      // Update material color based on pulse, but only when expanding
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        const baseColor = new THREE.Color(0xff1493) // Deep pink
        const pulseColor = new THREE.Color(0xff69b4) // Hot pink
        
        // Only pulse color when heartbeat is positive (during expansion)
        const colorIntensity = heartbeat > 0 ? modifiedHeartbeat : 0
        meshRef.current.material.color.lerpColors(baseColor, pulseColor, colorIntensity)
      }
    }
  })

  const heartShape = new Shape()
  heartShape.moveTo(0, 0.5)
  heartShape.bezierCurveTo(0, 0.5, -0.1, 0, -0.5, 0)
  heartShape.bezierCurveTo(-1.1, 0, -1.1, 0.7, -1.1, 0.7)
  heartShape.bezierCurveTo(-1.1, 1.1, -0.8, 1.54, 0, 1.9)
  heartShape.bezierCurveTo(0.7, 1.54, 1.1, 1.1, 1.1, 0.7)
  heartShape.bezierCurveTo(1.1, 0.7, 1.1, 0, 0.5, 0)
  heartShape.bezierCurveTo(0.2, 0, 0, 0.5, 0, 0.5)

  const extrudeSettings = {
    steps: 2,
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.1,
    bevelSegments: 3
  }

  return (
    <mesh {...props} ref={meshRef} scale={[1, 1, 1]} position={[0, 0, 0]}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial color="#ff1493" wireframe opacity={1} transparent />
    </mesh>
  )
}