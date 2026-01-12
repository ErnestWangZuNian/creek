import { ContactShadows, Environment, Loader, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Duck } from './Duck'

// Fallback component to show while model is loading
function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" wireframe />
    </mesh>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* Environment adds realistic lighting and reflections */}
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          shadow-mapSize={2048} 
          castShadow 
        />
        
        {/* Wrap Duck in Suspense to handle async loading */}
        <Suspense fallback={<LoadingFallback />}>
          <Duck position={[0, 0, 0]} />
        </Suspense>
        
        {/* Soft shadows on the ground */}
        <ContactShadows 
          resolution={1024} 
          scale={10} 
          blur={1.5} 
          opacity={0.25} 
          far={10} 
          color="#8a6246" 
        />
        
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Canvas>
      
      {/* HTML Loader overlay */}
      <Loader />
      
      <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: 'sans-serif' }}>
        <h1>React Three Fiber Demo</h1>
        <p>Click the duck to resize it!</p>
      </div>
    </div>
  )
}

export default App
