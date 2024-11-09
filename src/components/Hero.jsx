import { BikeCanvas } from ".";

const Hero = ({ scrollContainer }) => {
    return (
        <div id="hero">
            <h1>Boiler Plate Hero</h1>
            <BikeCanvas scrollContainer={scrollContainer} />

            {/* Dummy content to increase scrollable area */}
            <div style={{ padding: "20px", fontSize: "1.5rem", color: "#666" }}>
            </div>
        </div>
    );
};

export default Hero;
