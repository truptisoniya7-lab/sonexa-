const { supabase } = require('../config/db');

exports.getCommunities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*, users!communities_owner_id_fkey(name), communitymembers(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedData = data.map(c => {
      const owner_name = c.users?.name;
      const member_count = c.communitymembers?.[0]?.count || 0;
      const { users, communitymembers, ...rest } = c;
      return { ...rest, owner_name, member_count };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, owner_id } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({ error: 'name and owner_id are required' });
    }

    const { data: newCommunity, error: communityError } = await supabase
      .from('communities')
      .insert([{ name, description, owner_id }])
      .select()
      .single();

    if (communityError) throw communityError;

    const { error: memberError } = await supabase
      .from('communitymembers')
      .insert([{ community_id: newCommunity.id, user_id: owner_id, role: 'owner' }]);

    if (memberError) {
      await supabase.from('communities').delete().eq('id', newCommunity.id);
      throw memberError;
    }

    res.status(201).json(newCommunity);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data: checkResult, error: checkError } = await supabase
      .from('communitymembers')
      .select('*')
      .eq('community_id', id)
      .eq('user_id', user_id);

    if (checkError) throw checkError;

    if (checkResult && checkResult.length > 0) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('communitymembers')
      .insert([{ community_id: id, user_id: user_id, role: 'member' }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(insertResult);
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCommunitySongs = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('communitysongs')
      .select('*')
      .eq('community_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching community songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addCommunitySong = async (req, res) => {
  try {
    const { id } = req.params;
    const { song_uri, song_title, song_artist, song_image, added_by } = req.body;

    const { data, error } = await supabase
      .from('communitysongs')
      .insert([{ community_id: id, song_uri, song_title, song_artist, song_image, added_by }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding song to community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeCommunitySong = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const { data, error } = await supabase
      .from('communitysongs')
      .delete()
      .eq('id', songId)
      .eq('community_id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Song not found in community' });
    }

    res.json({ message: 'Song removed successfully' });
  } catch (error) {
    console.error('Error removing song from community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
