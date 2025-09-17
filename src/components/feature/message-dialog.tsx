
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from '@/lib/firebase/firestore';
import { Loader2, MessageSquare, Send } from 'lucide-react';

type MessageDialogProps = {
  profile: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
};

export function MessageDialog({ profile }: MessageDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to send a message.',
      });
      return;
    }
    if (!message.trim()) {
        toast({
            variant: 'destructive',
            title: 'Empty Message',
            description: 'You cannot send an empty message.',
        });
        return;
    }

    setIsSending(true);
    try {
      await sendMessage(profile.uid, message);
      toast({
        title: 'Message Sent!',
        description: `Your message to ${profile.displayName} has been sent.`,
      });
      setMessage('');
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Message',
        description: (error as Error).message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <MessageSquare className="mr-2"/> Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Avatar className="h-6 w-6">
                <AvatarImage src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/24/24`} />
                <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
            Message {profile.displayName}
          </DialogTitle>
          <DialogDescription>
            Compose your message below. The user will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/36/36`} />
                    <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-secondary p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm text-secondary-foreground">
                        Hi there! Feel free to send me a message about quizzes or anything else.
                    </p>
                </div>
            </div>
          <Textarea
            id="message"
            placeholder={`Write a message to ${profile.displayName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            disabled={isSending}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={isSending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSendMessage} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
