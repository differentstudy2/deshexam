
'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, setUserRole } from '@/lib/firebase/firestore';
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
import { Loader2, Shield, ShieldCheck, User, UserCog } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  createdAt: string;
};

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user' | null>(null);

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

  const openConfirmationDialog = (user: UserProfile, role: 'admin' | 'user') => {
    setSelectedUser(user);
    setNewRole(role);
    setIsAlertOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await setUserRole(selectedUser.uid, newRole);
      toast({
        title: "Role Updated",
        description: `${selectedUser.displayName}'s role has been changed to ${newRole}.`,
      });
      // Refresh user list
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: (error as Error).message,
      });
    } finally {
      setIsAlertOpen(false);
      setSelectedUser(null);
      setNewRole(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage user roles across the platform.
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
                  <TableHead className="hidden lg:table-cell">Created At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="hidden lg:table-cell">{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                       {user.uid !== currentUser?.uid && (
                        user.role === 'admin' ? (
                            <Button variant="outline" size="sm" onClick={() => openConfirmationDialog(user, 'user')}>
                                <UserCog className="mr-2" />
                                Remove Admin
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => openConfirmationDialog(user, 'admin')}>
                                <Shield className="mr-2" />
                                Make Admin
                            </Button>
                        )
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
            <AlertDialogDescription>
              You are about to change the role for {selectedUser?.displayName} to {newRole}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
