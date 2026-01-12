import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Mesh } from 'three'

export function Duck(props: any) {
  const { scene } = useGLTF('/duck.glb')
  const ref = useRef<Mesh>(null!)
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)

  useFrame((state, delta) => {
    // Make the duck rotate slowly
    ref.current.rotation.y += delta * 0.5
    // Make it float up and down
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
  })

  return (
    <primitive
      object={scene}
      ref={ref}
      {...props}
      scale={clicked ? 1.5 : 1}
      onClick={(event: any) => click(!clicked)}
      onPointerOver={(event: any) => hover(true)}
      onPointerOut={(event: any) => hover(false)}
    />
  )
}
