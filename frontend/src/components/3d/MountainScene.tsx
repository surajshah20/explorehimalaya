import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Single mountain peak mesh
function MountainPeak({
  position,
  scale,
  color,
  speed = 0.3,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.02
  })

  // Build a mountain shape from a cone + displaced geometry
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 2.5, 6, 8)
    const positions = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      if (y < 0.8) {
        positions.setX(i, positions.getX(i) + (Math.random() - 0.5) * 0.2)
        positions.setZ(i, positions.getZ(i) + (Math.random() - 0.5) * 0.2)
      }
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh ref={meshRef} position={position} scale={scale} geometry={geometry} castShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.1}
        wireframe={false}
      />
    </mesh>
  )
}

// Snow cap on peak
function SnowCap({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.25, 0.5, 6]} />
      <meshStandardMaterial color="#e0f7fa" roughness={0.3} metalness={0.2} />
    </mesh>
  )
}

// Floating particles (ice crystals)
function IceCrystals() {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < 200; i++) {
      pts.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 + 2,
        (Math.random() - 0.5) * 20,
      )
    }
    return new Float32Array(pts)
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#14b8a6" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// Glowing orb (sun / moon)
function GlowOrb() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 4 + Math.sin(state.clock.elapsedTime * 0.4) * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
      <mesh ref={ref} position={[6, 4, -8]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={2}
          distort={0.3}
          speed={3}
          roughness={0}
        />
      </mesh>
      {/* Glow halo */}
      <mesh position={[6, 4, -8]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </Float>
  )
}

// Terrain base plane
function Terrain() {
  const ref = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 30, 40, 40)
    const pos = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const noise =
        Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.6 +
        Math.sin(x * 0.7 + 1) * 0.3 +
        Math.cos(z * 0.5) * 0.2
      pos.setY(i, noise - 1.8)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <meshStandardMaterial color="#0d2438" roughness={1} metalness={0} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#1a3a5c" />
      <directionalLight position={[6, 8, -4]} intensity={1.5} color="#fbbf24" castShadow />
      <pointLight position={[-4, 2, 4]} intensity={0.5} color="#14b8a6" />
      <pointLight position={[8, 6, -6]} intensity={0.8} color="#f97316" />
      <hemisphereLight args={['#0d2438', '#042f2e', 0.4]} />

      {/* Stars */}
      <Stars radius={80} depth={50} count={3000} factor={3} saturation={0.5} fade speed={0.5} />

      {/* Main mountain range */}
      <MountainPeak position={[0, -1, -5]} scale={[2, 2.5, 2]} color="#0f3460" speed={0.2} />
      <SnowCap position={[0, 1.8, -5]} />

      <MountainPeak position={[-3.5, -1.5, -6]} scale={[1.5, 2, 1.5]} color="#0a2744" speed={0.15} />
      <SnowCap position={[-3.5, 1.2, -6]} />

      <MountainPeak position={[3.8, -1.8, -7]} scale={[1.8, 2.2, 1.8]} color="#0c3050" speed={0.25} />
      <SnowCap position={[3.8, 1.2, -7]} />

      {/* Secondary peaks */}
      <MountainPeak position={[-6, -2, -8]} scale={[1.2, 1.6, 1.2]} color="#081d30" />
      <MountainPeak position={[6.5, -2, -9]} scale={[1.4, 1.8, 1.4]} color="#071928" />
      <MountainPeak position={[2, -2.2, -10]} scale={[1, 1.3, 1]} color="#061520" />
      <MountainPeak position={[-2, -2.5, -11]} scale={[1.1, 1.4, 1.1]} color="#050f18" />

      {/* Foreground hills */}
      <MountainPeak position={[-4, -2.5, -2]} scale={[1.2, 1, 1.2]} color="#0a1e2e" />
      <MountainPeak position={[4, -2.5, -3]} scale={[1, 0.8, 1]} color="#091a28" />

      {/* Terrain */}
      <Terrain />

      {/* Atmosphere */}
      <IceCrystals />
      <GlowOrb />

      {/* Mist clouds */}
      <Cloud position={[-4, 0, -4]} speed={0.2} opacity={0.06} color="#14b8a6" scale={3} />
      <Cloud position={[5, 1, -6]} speed={0.15} opacity={0.05} color="#1e3a5f" scale={4} />
    </>
  )
}

interface MountainSceneProps {
  className?: string
}

export default function MountainScene({ className = '' }: MountainSceneProps) {
  return (
    <div className={`canvas-container ${className}`} aria-hidden="true">
      <Canvas
        className="three-canvas"
        camera={{ position: [0, 1, 8], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
