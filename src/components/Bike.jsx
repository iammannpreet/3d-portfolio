import { useAnimations, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import bikeScene from "../assets/3d/bike.glb";


const Bike = ({ scale, position, rotation }) => {
    const bikeRef = useRef();
    const { scene, animations } = useGLTF(bikeScene);
    const { actions } = useAnimations(animations, bikeRef);

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.metalness = 1;
                child.material.roughness = 0.2;
            }
        });

        if (actions && actions["Idle"]) actions["Idle"].play();
    }, [actions, scene]);

    return (
        <mesh ref={bikeRef} position={position} scale={scale} rotation={rotation}>
            <primitive object={scene} />
        </mesh>
    );
};

const BikeCanvas = () => {
    const [rotation, setRotation] = useState([-3.1, 5.35, 3.1]); // Initial rotation
    const [scale, setScale] = useState([1, 1, 1]); // Reduced initial scale
    const [position, setPosition] = useState([0.2, -0.7, 0]);
    useEffect(() => {
        const startRotation = [-3.1, 5, 3.2];
        const endRotation = [-3.08, 5, 3.18];
        let direction = 1;
        let interval;

        const animateRotation = () => {
            interval = setInterval(() => {
                setRotation((prevRotation) => {
                    const progress = 0.015 * direction; // Adjust this speed value to control the pace
                    const newRotation = [
                        prevRotation[0] + (endRotation[0] - startRotation[0]) * progress,
                        prevRotation[1] + (endRotation[1] - startRotation[1]) * progress,
                        prevRotation[2] + (endRotation[2] - startRotation[2]) * progress,
                    ];

                    // Check if we've reached the end rotation and reverse direction
                    if (direction === 1 && newRotation[0] >= endRotation[0]) {
                        direction = -1;
                    } else if (direction === -1 && newRotation[0] <= startRotation[0]) {
                        direction = 1;
                    }

                    return newRotation;
                });
            }, 10); // Update rotation every 10ms
        };

        animateRotation();

        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;

            // Define start and end rotations
            const startRotation = [-3.1, 5.35, 3.1];
            const endRotation = [-3.1, 3, 3.1];

            // Define scroll range for the rotation change
            const startY = 0;
            const endY = 500;

            // Calculate progress based on scroll position
            const progress = Math.min(Math.max((scrollTop - startY) / (endY - startY), 0), 1);

            // Interpolate rotation values based on progress
            const newRotation = [
                startRotation[0] + (endRotation[0] - startRotation[0]) * progress,
                startRotation[1] + (endRotation[1] - startRotation[1]) * progress,
                startRotation[2] + (endRotation[2] - startRotation[2]) * progress,
            ];

            setRotation(newRotation);
        };

        const handleResize = () => {
            if (window.innerWidth < 768) {
                setScale([3, 3, 3]);
                setPosition([0, 0, 0]);
            } else if (window.innerWidth < 1024) {
                setScale([0.555, 0.555, 0.555]);
                setPosition([0, 0, 0]);
            } else if (window.innerWidth < 1280) {
                setScale([0.61, 0.61, 0.61]);
                setPosition([0, 0, 0]);
            } else if (window.innerWidth < 1536) {
                setScale([0.665, 0.665, 0.665]);
                setPosition([0, 0, 0]);
            } else {
                setScale([0.725, 0.725, 0.725]);
                setPosition([0, 0, 0]);
            }
        };

        handleResize();
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <Canvas style={{
            height: "25%",
            width: "100%"
        }} className="bg-transparent z-10" camera={{ near: 0.1, far: 1000 }}>
            <Suspense fallback={null}>
                <directionalLight position={[5, 5, 5]} intensity={3} />
                <ambientLight intensity={1.3} />
                <pointLight position={[2, 2, 2]} intensity={2} />
                <spotLight position={[0, 5, 10]} angle={0.3} penumbra={0.5} intensity={5} />
                <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={3.8} />
                <Bike rotation={rotation} scale={scale} position={position} />
            </Suspense>
        </Canvas>
    );
};

export default BikeCanvas;
