import { Html } from '@react-three/drei';
import React from 'react';

const Overlay = ({ onTransformClick }) => {
    return (
        <Html fullscreen>
            <div className="font-bruno">
                <h1>Hello</h1>
                <button onClick={onTransformClick}>
                    Transform Helmet
                </button>
            </div>
        </Html>
    );
};

export default Overlay;
