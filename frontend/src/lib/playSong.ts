export const playSong = async (track: any, router: any) => {
  try {
    const resRoom = await fetch(`/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Private Session', host_id: 1, isPublic: 0 })
    });
    const room = await resRoom.json();

    if (room.id) {
      await fetch(`/api/rooms/${room.id}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          song_uri: track.uri, 
          song_title: track.title, 
          song_artist: track.artist, 
          song_image: track.image, 
          added_by: 1 
        })
      });
      router.push(`/room/${room.id}`);
    }
  } catch (error) { 
    console.error('Failed to start solo room', error); 
  }
};
