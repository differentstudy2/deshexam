'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mb-6">
                Customize your DeshExam experience.
            </p>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Manage your notification preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <Switch id="email-notifications" defaultChecked/>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Receive emails about your account, new tests, and platform updates.
                        </p>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <Switch id="push-notifications" disabled/>
                        </div>
                         <p className="text-sm text-muted-foreground">
                            Get push notifications on your devices (coming soon).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div>
                                <Label>Change Password</Label>
                                <p className="text-sm text-muted-foreground">
                                    Set a new password for your account.
                                </p>
                            </div>
                            <Button variant="outline">Change Password</Button>
                        </div>
                        <div className="flex items-center justify-between border-t pt-4 border-destructive/20">
                             <div>
                                <Label className="text-destructive">Delete Account</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <Button variant="destructive">Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
