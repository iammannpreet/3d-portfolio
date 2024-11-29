import { Helmet } from "./Helmet";
import { useControls, Leva } from "leva";
import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/three";
import { useNavigate } from "react-router-dom";
import Overlay from "../../components/Overlay";

export const HelmetCanvas = () => {
    const navigate = useNavigate();
    const [lightIntensity, setLightIntensity] = useState({ ambient: 2.7, directional: 3 });
    const [responsiveScale, setResponsiveScale] = useState(0.6); // Default to desktop scale

    // Light controls for Y and Z positions only
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

    // Update scale based on animation state and responsive scale
    const { rotX, rotY, scale } = useSpring({
        rotX: animate ? -1.4 : 0,
        rotY: animate ? 3.14 : 0,
        scale: animate ? 3.9 : responsiveScale,
        config: { duration: 1500 },
        onRest: () => {
            if (animate) {
                setLightIntensity({ ambient: 0, directional: 0 });
                navigate("/portfolio");
            }
        },
    });

    const handleTransformClick = () => {
        setAnimate(!animate);
        if (!animate) {
            setLightIntensity({ ambient: 2.7, directional: 3 });
        }
    };

    // Responsive scale effect
    useEffect(() => {
        const updateScale = () => {
            if (window.matchMedia("(max-width: 1024px)").matches) {
                setResponsiveScale(0.5); // Tablet scale
            } else {
                setResponsiveScale(0.7); // Desktop scale
            }
        };

        updateScale(); // Set scale initially
        window.addEventListener("resize", updateScale); // Update scale on resize
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    return (
        <>
            <Leva hidden={true} />
            <ambientLight intensity={lightIntensity.ambient} />
            <directionalLight position={[0, lightY, lightZ]} intensity={lightIntensity.directional} />

            <animated.group position={[posX, posY, posZ]} rotation-x={rotX} rotation-y={rotY} scale={scale}>
                <Helmet onTransformClick={handleTransformClick} />
            </animated.group>
            <Overlay onTransformClick={handleTransformClick} />
        </>
    );
};
