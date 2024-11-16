import React from 'react';
import { useGLTF } from '@react-three/drei';

export function Helmet() {
    const { nodes, materials } = useGLTF('./models/helmet.glb');

    return (
        <group scale={0.01}>
            <mesh geometry={nodes.parts_parts_0.geometry} material={materials.parts} />
            <mesh geometry={nodes.parts_L2_0.geometry} material={materials.material} />
            <mesh geometry={nodes.parts_L1_0.geometry} material={materials.material_2} />
        </group>
    );
}

useGLTF.preload('./models/helmet.glb');
