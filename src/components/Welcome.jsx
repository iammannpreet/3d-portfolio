import React from 'react';
import { useGLTF, Html } from '@react-three/drei';

export function Welcome({ onTransformClick }) {
    const { nodes, materials } = useGLTF('./models/helmet.glb');

    return (

        <group dispose={null}>
            {/* Helmet 3D Model */}
            <group scale={0.01}>
                <group position={[-2.634, -17.631, -33.11]}>
                    <mesh geometry={nodes.parts_parts_0.geometry} material={materials.parts} />
                    <mesh geometry={nodes.parts_L2_0.geometry} material={materials.material} />
                    <mesh geometry={nodes.parts_L1_0.geometry} material={materials.material_2} />
                </group>
            </group>

            {/* Button as an Html overlay inside the 3D scene */}
            <Html className='font-bruno'>
                <div>
                    <div className='bg-white'>
                        <button onClick={onTransformClick}>
                            Transform Helmet
                        </button>
                    </div>
                    <div className='bg-pink-100'>
                        <button onClick={onTransformClick}>
                            Transform Helmet
                        </button>

                    </div>
                </div>
            </Html>

        </group>
    );
}

useGLTF.preload('./models/helmet.glb');
