
'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, setUserRole, deleteUser, updateUserSubscription } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ShieldCheck, User, UserCog, MoreHorizontal, Trash2, Crown, Gem } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  createdAt: string;
  subscriptionPlan?: 'pro' | 'pass';
  subscriptionExpiresAt?: string;
};

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [userToModify, setUserToModify] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'role' | 'delete' | 'subscription' | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user' | null>(null);
  const [newSubscriptionPlan, setNewSubscriptionPlan] = useState<'pro' | 'pass' | 'none' | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  const openConfirmationDialog = (user: UserProfile, type: 'role' | 'delete', data?: any) => {
    setUserToModify(user);
    setActionType(type);
    if (type === 'role' && data) {
      setNewRole(data);
    }
    setIsAlertOpen(true);
  };
  
  const openSubscriptionDialog = (user: UserProfile) => {
    setUserToModify(user);
    setNewSubscriptionPlan(user.subscriptionPlan || 'none');
    setActionType('subscription');
    setIsSubscriptionDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!userToModify) return;

    if (actionType === 'role' && newRole) {
      await handleRoleChange(userToModify, newRole);
    } else if (actionType === 'delete') {
      await handleDeleteUser(userToModify);
    }
    
    setIsAlertOpen(false);
    setUserToModify(null);
    setActionType(null);
  };
  
  const handleRoleChange = async (user: UserProfile, role: 'admin' | 'user') => {
    try {
      await setUserRole(user.uid, role);
      toast({
        title: "Role Updated",
        description: `${user.displayName}'s role has been changed to ${role}.`,
      });
      fetchUsers();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error updating role",
        description: (error as Error).message,
      });
    }
  };
  
  const handleDeleteUser = async (user: UserProfile) => {
      try {
        await deleteUser(user.uid);
        toast({
            title: "User Deleted",
            description: `${user.displayName} has been permanently deleted.`,
        });
        fetchUsers();
      } catch (error) {
          toast({
            variant: "destructive",
            title: "Error deleting user",
            description: (error as Error).message,
        });
      }
  };
  
  const handleSubscriptionUpdate = async () => {
    if (!userToModify || newSubscriptionPlan === null) return;
    try {
      await updateUserSubscription(userToModify.uid, newSubscriptionPlan === 'none' ? null : newSubscriptionPlan);
      toast({
        title: "Subscription Updated",
        description: `${userToModify.displayName}'s subscription has been updated.`,
      });
      fetchUsers();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error updating subscription",
        description: (error as Error).message,
      });
    } finally {
        setIsSubscriptionDialogOpen(false);
        setUserToModify(null);
        setActionType(null);
    }
  };
  
  const getAlertDescription = () => {
    if(!userToModify) return '';
    if(actionType === 'role') return `You are about to change the role for ${userToModify.displayName} to ${newRole}.`;
    if(actionType === 'delete') return `This will permanently delete ${userToModify.displayName} and all their data. This action cannot be undone.`;
    return '';
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage user roles and subscriptions across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all registered users in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Subscription</TableHead>
                  <TableHead className="hidden lg:table-cell">Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                           <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} />
                           <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? <ShieldCheck className="mr-1.5" /> : <User className="mr-1.5" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.subscriptionPlan ? (
                        <div className="flex items-center font-medium">
                           {user.subscriptionPlan === 'pro' ? 
                             <Crown className="mr-1.5 h-4 w-4 text-yellow-500" /> : 
                             <Gem className="mr-1.5 h-4 w-4 text-blue-500" />
                           }
                           {user.subscriptionPlan === 'pro' ? 'Pass Pro' : 'Pass'}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                       {user.uid !== currentUser?.uid && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {user.role === 'admin' ? (
                                    <DropdownMenuItem onClick={() => openConfirmationDialog(user, 'role', 'user')}>
                                        <UserCog className="mr-2"/> Remove Admin
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => openConfirmationDialog(user, 'role', 'admin')}>
                                        <Shield className="mr-2"/> Make Admin
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => openSubscriptionDialog(user)}>
                                    <Crown className="mr-2"/> Manage Subscription
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog(user, 'delete')}>
                                    <Trash2 className="mr-2"/> Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{getAlertDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Subscription for {userToModify?.displayName}</DialogTitle>
              <DialogDescription>
                Upgrade or change the user's subscription plan. This will take effect immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
               <Select onValueChange={(val) => setNewSubscriptionPlan(val as any)} defaultValue={userToModify?.subscriptionPlan || 'none'}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="pro">Pass Pro</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubscriptionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubscriptionUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
