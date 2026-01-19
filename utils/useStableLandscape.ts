import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

/**
 * Returns stable landscape detection that doesn't change when keyboard opens.
 * Uses screen dimensions instead of window dimensions on web.
 */
export function useStableLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(() => {
    const { width, height } = Dimensions.get('screen');
    return width > height;
  });

  useEffect(() => {
    const handleChange = ({ screen }: { screen: { width: number; height: number } }) => {
      setIsLandscape(screen.width > screen.height);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return isLandscape;
}
