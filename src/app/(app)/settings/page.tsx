'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Palette, Link as LinkIcon, Shield, Bell, LogOut, Check } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>

      <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-col h-auto bg-transparent items-stretch w-full md:w-64 gap-2">
          <TabsTrigger value="account" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3">
            <User className="w-4 h-4 mr-3" /> Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3">
            <Palette className="w-4 h-4 mr-3" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="connected" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3">
            <LinkIcon className="w-4 h-4 mr-3" /> Connected Accounts
          </TabsTrigger>
          <TabsTrigger value="privacy" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3">
            <Shield className="w-4 h-4 mr-3" /> Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3">
            <Bell className="w-4 h-4 mr-3" /> Notifications
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          {/* ACCOUNT */}
          <TabsContent value="account" className="m-0 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your profile details and public information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue="Alex Johnson" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="truptisoniya7@gmail.com" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Music lover & late night coder" className="bg-background/50" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 pt-4 flex justify-between">
                <Button variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent shadow-none">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
                <Button onClick={handleSave}>
                  {saveStatus === 'Saved successfully' ? <Check className="w-4 h-4 mr-2" /> : null}
                  {saveStatus || 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* APPEARANCE */}
          <TabsContent value="appearance" className="m-0 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Sonexa looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme Preference</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <div key={theme} className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-colors ${theme === 'Dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background/50 hover:border-primary/50'}`}>
                        <div className={`w-full h-16 rounded-md mb-2 mx-auto ${theme === 'Light' ? 'bg-white' : theme === 'Dark' ? 'bg-zinc-950' : 'bg-gradient-to-r from-white to-zinc-950'}`}></div>
                        <span className="text-sm font-medium">{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Glassmorphism UI</Label>
                    <p className="text-sm text-muted-foreground">Enable frosted glass effects across the app.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONNECTED ACCOUNTS */}
          <TabsContent value="connected" className="m-0 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage third-party integrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-500 font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Spotify</p>
                      <p className="text-sm text-muted-foreground">Connected to truptisoniya7@gmail.com</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-500 font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-sm text-muted-foreground">Connected to truptisoniya7@gmail.com</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                      <span className="text-[#5865F2] font-bold">D</span>
                    </div>
                    <div>
                      <p className="font-medium">Discord</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIVACY */}
          <TabsContent value="privacy" className="m-0 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Share Listening Activity</Label>
                    <p className="text-sm text-muted-foreground">Let friends see what you are currently listening to.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Private Profile</Label>
                    <p className="text-sm text-muted-foreground">Only approved followers can view your profile and playlists.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications" className="m-0 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications when someone mentions you.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Room Invites</Label>
                    <p className="text-sm text-muted-foreground">Get notified when a friend invites you to a listening session.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Community Updates</Label>
                    <p className="text-sm text-muted-foreground">Announcements from communities you joined.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
