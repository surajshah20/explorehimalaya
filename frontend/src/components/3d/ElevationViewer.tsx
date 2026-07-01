import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { ElevationPoint } from '@/types'

function ElevationPath({ points }: { points: ElevationPoint[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15
    }
  })

  if (!points.length) return null

  const maxAlt = Math.max(...points.map((p) => p.altitude))
  const minAlt = Math.min(...points.map((p) => p.altitude))
  const range  = maxAlt - minAlt || 1

  // Normalize to 3D coords
  const linePoints = points.map((p, i) => {
    const nx = (i / (points.length - 1)) * 6 - 3
    const ny = ((p.altitude - minAlt) / range) * 2.5 - 0.5
    return new THREE.Vector3(nx, ny, 0)
  })

  // Fill area under curve
  const fillPoints: THREE.Vector3[] = []
  linePoints.forEach((p) => fillPoints.push(p, new THREE.Vector3(p.x, -0.5, 0)))

  return (
    <group ref={groupRef}>
      {/* Grid lines */}
      {[0, 1, 2].map((i) => (
        <Line
          key={i}
          points={[[-3.2, i * 0.8 - 0.3, 0], [3.2, i * 0.8 - 0.3, 0]]}
          color="#14b8a6"
          lineWidth={0.3}
          transparent
          opacity={0.15}
        />
      ))}

      {/* Main elevation path */}
      <Line
        points={linePoints}
        color="#14b8a6"
        lineWidth={2.5}
        transparent
        opacity={0.9}
      />

      {/* Glow line */}
      <Line
        points={linePoints}
        color="#5eead4"
        lineWidth={6}
        transparent
        opacity={0.15}
      />

      {/* Peak markers */}
      {points.map((p, i) => {
        const pos = linePoints[i]
        const isPeak = p.altitude === maxAlt
        return (
          <group key={i} position={pos}>
            <mesh>
              <sphereGeometry args={[isPeak ? 0.08 : 0.05, 8, 8]} />
              <meshBasicMaterial color={isPeak ? '#f97316' : '#14b8a6'} />
            </mesh>
            {isPeak && (
              <>
                <mesh>
                  <sphereGeometry args={[0.18, 8, 8]} />
                  <meshBasicMaterial color="#f97316" transparent opacity={0.2} />
                </mesh>
                <Text
                  position={[0, 0.22, 0]}
                  fontSize={0.14}
                  color="#f97316"
                  anchorX="center"
                  anchorY="bottom"
                >
                  {p.altitude.toLocaleString()}m
                </Text>
                <Text
                  position={[0, 0.08, 0]}
                  fontSize={0.1}
                  color="#fdba74"
                  anchorX="center"
                  anchorY="bottom"
                >
                  {p.location}
                </Text>
              </>
            )}
          </group>
        )
      })}

      {/* Day labels on x-axis */}
      {points.map((p, i) => (
        <Text
          key={i}
          position={[linePoints[i].x, -0.75, 0]}
          fontSize={0.1}
          color="rgba(255,255,255,0.3)"
          anchorX="center"
        >
          D{p.day}
        </Text>
      ))}

      {/* Base line */}
      <Line
        points={[[-3.2, -0.5, 0], [3.2, -0.5, 0]]}
        color="#1e3a5f"
        lineWidth={1}
      />
    </group>
  )
}

interface ElevationViewerProps {
  points: ElevationPoint[]
  className?: string
}

export default function ElevationViewer({ points, className = '' }: ElevationViewerProps) {
  return (
    <div className={`h-40 ${className}`} aria-label="Elevation profile chart">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1} />
        <ElevationPath points={points} />
      </Canvas>
    </div>
  )
}
