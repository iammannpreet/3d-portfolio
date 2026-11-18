import { Color } from 'three'

/**
 * Scene colours in linear space (what shaders and materials work in). Values above 1 are meant
 * to glow: the bloom pass picks up anything brighter than about 0.85.
 */
export const EMBER = new Color('#fe5e0e')
export const ION = new Color('#38e1ff')

/** Sky at the top of the dome: dusk, then night. */
export const SKY_TOP = { dusk: new Color(0.006, 0.008, 0.03), night: new Color(0.0015, 0.002, 0.006) }
/** Sky right at the horizon. The fog uses the same colour so the floor melts into the sky. */
export const SKY_HORIZON = { dusk: new Color(0.05, 0.022, 0.04), night: new Color(0.008, 0.011, 0.022) }
/** Extra warm glow sitting on the horizon at dusk. */
export const SKY_GLOW = { dusk: new Color(0.3, 0.075, 0.02), night: new Color(0.004, 0.006, 0.014) }
/** Below the horizon (only seen past the edge of the floor). */
export const SKY_BELOW = new Color(0.004, 0.004, 0.006)
