import { Dimensions, PixelRatio } from "react-native";

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Design dimensions (base dimensions you're designing for)
// Common design dimensions: iPhone 14 Pro (393x852) or adjust based on your design
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

/**
 * Responsive width function
 * @param {number} percentage - Percentage of screen width (0-100)
 * @returns {number} - Responsive width
 */
export const wp = (percentage) => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Responsive height function
 * @param {number} percentage - Percentage of screen height (0-100)
 * @returns {number} - Responsive height
 */
export const hp = (percentage) => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Responsive font size function
 * @param {number} percentage - Percentage of screen width for font scaling (0-100)
 * @returns {number} - Responsive font size
 */
export const fp = (percentage) => {
  const fontSize = PixelRatio.roundToNearestPixel(
    (SCREEN_WIDTH * percentage) / 100
  );
  // Ensure minimum font size for readability
  return Math.max(fontSize, 8);
};

// Alternative font size function using both width and height (more conservative scaling)
export const fpAlt = (percentage) => {
  const widthBased = (SCREEN_WIDTH * percentage) / 100;
  const heightBased = (SCREEN_HEIGHT * percentage) / 100;
  const fontSize = Math.min(widthBased, heightBased); // Use smaller value for conservative sizing
  return Math.max(fontSize, 8);
};

// Utility function to get screen dimensions
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isTablet: SCREEN_WIDTH >= 768,
});

// Responsive margin/padding helpers (percentage-based)
export const spacing = {
  xs: hp(0.5), // 0.5% of screen height
  sm: hp(1), // 1% of screen height
  md: hp(2), // 2% of screen height
  lg: hp(3), // 3% of screen height
  xl: hp(4), // 4% of screen height
  xxl: hp(6), // 6% of screen height
};

// Example usage:
/*
import { wp, hp, fp } from './utils/responsive';

const styles = StyleSheet.create({
  container: {
    width: wp(90),        // 90% of screen width
    height: hp(25),       // 25% of screen height
    marginTop: hp(5),     // 5% of screen height
  },
  text: {
    fontSize: fp(4),      // 4% of screen width for font size
    lineHeight: fp(6),    // 6% of screen width for line height
  },
  button: {
    width: wp(80),        // 80% of screen width
    height: hp(7),        // 7% of screen height
    paddingHorizontal: wp(5), // 5% of screen width
  },
  fullWidth: {
    width: wp(100),       // 100% = full screen width
  },
  halfHeight: {
    height: hp(50),       // 50% = half screen height
  },
});
*/
