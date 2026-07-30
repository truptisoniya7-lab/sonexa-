'use client';

import { usePlayer } from '@/context/PlayerContext';
import { useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { HeroDesktop } from './HeroDesktop';
import { HeroMobile } from './HeroMobile';

export function HeroPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  
  const [dominantColor, setDominantColor] = useState('139, 92, 246'); // Default purple rgb
  const [recentSong, setRecentSong] = useState<any>(null);
  const [userName, setUserName] = useState<string>('Guest');
  const [greeting, setGreeting] = useState<string>('Good Evening');

  useEffect(() => {
    // Dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Get user from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name.split(' ')[0]); // first name
      } catch(e) {}
    }
  }, []);

  const defaultSong = {
    song_uri: 'spotify:track:default',
    song_title: 'Espresso',
    song_artist: 'Sabrina Carpenter',
    song_image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'
  };

  useEffect(() => {
    // Fetch last played song
    const userId = '1'; // Mock user id
    fetch(`/api/history/recent/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setRecentSong({
            song_uri: data[0].uri,
            song_title: data[0].title,
            song_artist: data[0].artist,
            song_image: data[0].image
          });
        }
      })
      .catch(err => console.error('Failed to load recent song', err));
  }, []);

  const activeSong = currentSong || recentSong || defaultSong;

  useEffect(() => {
    if (activeSong.song_image) {
      const fac = new FastAverageColor();
      fac.getColorAsync(activeSong.song_image, { algorithm: 'dominant' })
        .then(color => {
          // Update global CSS variable for the 700ms smooth transition
          const rgb = `${color.value[0]}, ${color.value[1]}, ${color.value[2]}`;
          document.documentElement.style.setProperty('--dominant-color', rgb);
          setDominantColor(rgb);
        })
        .catch(e => console.error('Error extracting color:', e));
    }
  }, [currentSong?.song_image]);

  // 3D Parallax Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const sharedProps = {
    activeSong,
    currentSong,
    isPlaying,
    togglePlay,
    dominantColor,
    greeting,
    userName,
    handleMouseMove,
    handleMouseLeave,
    rotateX,
    rotateY
  };

  return (
    <>
      <HeroDesktop {...sharedProps} />
      <HeroMobile {...sharedProps} />
    </>
  );
}
