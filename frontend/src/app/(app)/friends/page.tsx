'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Users, UserPlus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FriendsPage() {
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock invite
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Friends</h1>
        <p className="text-muted-foreground">Build your Sonexa community.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Invite a Friend
              </CardTitle>
              <CardDescription>Send an invitation email to join Sonexa.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex gap-3">
                <Input 
                  type="email" 
                  placeholder="Friend's email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
                <Button type="submit" className="shrink-0">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Requests
              </CardTitle>
              <CardDescription>Manage incoming friend requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 text-center bg-background/30 rounded-xl border border-dashed border-border/50">
                <p className="text-muted-foreground text-sm">No pending requests at the moment.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Friends List
            </CardTitle>
            <CardDescription>People you follow and connect with.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center bg-background/30 rounded-xl border border-dashed border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-1">It's quiet here</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Invite some friends to start discovering music together and seeing what they're listening to.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
