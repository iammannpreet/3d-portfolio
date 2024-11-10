import { OrbitControls } from "@react-three/drei";
import { Welcome } from "./Welcome";
import { useControls, Leva } from "leva"; // Import Leva
import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/three";
import Overlay from "./Overlay";

const [lightIntensity, setLightIntensity] = useState({ ambient: 2.7, directional: 3 });
const [mouseLightX, setMouseLightX] = useState(-9.5);

// Light controls for Y and Z positions only, as X will be dynamic
const { lightY, lightZ } = useControls("Lighting", {
    lightY: { value: 2.5, min: -10, max: 10, step: 0.5 },
    lightZ: { value: 10, min: -10, max: 10, step: 0.5 },
});

const { posX, posY, posZ } = useControls("Model Properties", {
    posX: { value: 0, min: -10, max: 10, step: 0.1 },
    posY: { value: 0, min: -10, max: 10, step: 0.1 },
    posZ: { value: 0, min: -10, max: 10, step: 0.1 },
});

const [animate, setAnimate] = useState(false);

const { rotX, rotY, scale } = useSpring({
    rotX: animate ? -1.4 : 0,
    rotY: animate ? 3.14 : 0,
    scale: animate ? 3.9 : 0.7,
    config: { duration: 1500 },
    onRest: () => {
        if (animate) {
            setLightIntensity({ ambient: 0, directional: 0 });
        }
    },
});

const handleTransformClick = () => {
    setAnimate(!animate);
    if (!animate) {
        setLightIntensity({ ambient: 2.7, directional: 3 });
    }
};

// Track mouse movement to update lightX position
useEffect(() => {
    const handleMouseMove = (event) => {
        // Map mouse position to a lightX value in the range of -10 to 10
        const lightX = (event.clientX / window.innerWidth) * 20 - 10;
        setMouseLightX(lightX);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);

return (
    <>
        {/* Leva UI - hidden by default */}
        <Leva hidden={true} />

        {/* Lighting */}
        <ambientLight intensity={lightIntensity.ambient} />
        <directionalLight position={[mouseLightX, lightY, lightZ]} intensity={lightIntensity.directional} />

        {/* Camera Controls */}
        <OrbitControls enableZoom={false} />

        {/* 3D Model Animation Group */}
        <animated.group position={[posX, posY, posZ]} rotation-x={rotX} rotation-y={rotY} scale={scale}>
            <Welcome onTransformClick={handleTransformClick} />
        </animated.group>

        {/* Overlay for HTML */}
        <Overlay onTransformClick={handleTransformClick} />
    </>
);
};
