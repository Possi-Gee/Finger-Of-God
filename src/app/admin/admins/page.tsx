'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Users, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';

type AdminUser = {
  id: string; // This will be the UID from Firebase Auth
  email: string;
  role: 'admin' | 'superadmin';
  expiresAt?: Date;
};

const addAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid expiration date." }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  const functions = getFunctions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
  });

  useEffect(() => {
    setLoading(true);
    const adminsColRef = collection(db, 'admins');
    const unsubscribe = onSnapshot(adminsColRef, (snapshot) => {
      const adminsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt ? new Date(doc.data().expiresAt) : undefined,
      })) as AdminUser[];
      setAdmins(adminsData);
      setLoading(false);
    }, (error) => {
        console.error("Failed to fetch admins:", error);
        setLoading(false);
        toast({
            title: 'Error',
            description: 'Could not fetch the list of admins.',
            variant: 'destructive'
        });
    });

    return () => unsubscribe();
  }, [toast]);

  const onSubmit = async (data: AddAdminFormValues) => {
    const createAdminUser = httpsCallable(functions, 'createAdminUser');
    try {
      const result = await createAdminUser({
        email: data.email,
        password: data.password,
        expiresAt: new Date(data.expiresAt).toISOString(),
      });

      if ((result.data as any).success) {
        toast({
          title: 'Admin Created',
          description: `User ${data.email} has been granted admin access.`,
        });
        setIsDialogOpen(false);
        reset();
      } else {
        throw new Error((result.data as any).message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Failed to create admin user:', error);
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      // Note: This only removes them from the 'admins' collection, revoking their access.
      // It does not delete their Firebase Auth user record. You can extend this with a cloud function if needed.
      await deleteDoc(doc(db, 'admins', adminToDelete.id));
      toast({
        title: 'Admin Removed',
        description: `Access for ${adminToDelete.email} has been revoked.`,
        variant: 'destructive',
      });
    } catch (error) {
        console.error("Failed to remove admin:", error);
        toast({ title: 'Error', description: 'Could not remove admin.', variant: 'destructive'});
    }
    setIsDeleteConfirmOpen(false);
    setAdminToDelete(null);
  };
  
  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Users className="h-8 w-8" />
           <div>
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <p className="text-muted-foreground">Create and manage temporary admin users.</p>
           </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              New Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Temporary Admin</DialogTitle>
              <DialogDescription>
                This will create a new user with temporary admin access. They can log in with the email and password you provide.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} id="add-admin-form" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
               <div>
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input id="expiresAt" type="datetime-local" {...register('expiresAt')} />
                {errors.expiresAt && <p className="text-sm text-destructive mt-1">{errors.expiresAt.message}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-admin-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Current Admins</CardTitle>
            <CardDescription>
                List of users with admin privileges.
            </CardDescription>
         </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                   <TableCell>
                    {admin.expiresAt ? format(admin.expiresAt, "PPP p") : 'Never'}
                   </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteClick(admin)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Revoke Access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {admins.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No temporary admins found.</div>
           )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke admin access for "{adminToDelete?.email}". They will no longer be able to access the dashboard. This does not delete their login account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
