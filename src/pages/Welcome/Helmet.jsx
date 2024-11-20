import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei"; // Import useGLTF and OrbitControls
import { useFrame } from "@react-three/fiber"; // Import useFrame for animations

export function Helmet() {
  const { nodes, materials } = useGLTF('./models/helmet.glb'); // Load the GLTF model
  const ref = useRef();

  // Rotate the helmet
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });

  return (
    <>
      <group ref={ref} scale={0.01}>
        <mesh geometry={nodes.parts_parts_0.geometry} material={materials.parts} />
        <mesh geometry={nodes.parts_L2_0.geometry} material={materials.material} />
        <mesh geometry={nodes.parts_L1_0.geometry} material={materials.material_2} />
      </group>
    </>
  );
}

useGLTF.preload('./models/helmet.glb'); // Preload the GLTF model
