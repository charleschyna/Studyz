import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; 
import { 
  User, // Using User icon for teachers
  PlusCircle, 
  Upload, 
  Download, 
  Search, 
  MoreHorizontal, 
  Edit,
  XCircle, 
  Trash2, 
  UserCheck, 
  UserX,
  Lock, // For password reset
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
// Import multi-select if available or use placeholder
// import { MultiSelect } from "@/components/ui/multi-select"; // Assuming a multi-select component exists

// Form schema
const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  employeeId: z.string().min(1, {
    message: "Employee ID is required.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// --- Types --- 
interface Teacher {
  id: string;
  full_name: string;
  email: string;
  subjects: string | null;
  classes: string | null;
  employee_id: string | null;
  status: 'Active' | 'Inactive';
}

// Type for the Add Teacher form state
interface AddTeacherFormState {
  fullName: string;
  email: string;
  employeeId: string;
  subjects: string;
  classes: string;
  password?: string;
  status: 'Active' | 'Inactive';
}

// --- Component --- 
const ManageTeachers: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState<AddTeacherFormState>({
    fullName: '',
    email: '',
    employeeId: '',
    subjects: '',
    classes: '',
    password: '',
    status: 'Active',
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      employeeId: "",
      password: "",
    },
  });

  const fetchTeachers = async () => {
    setIsLoading(true);
    // Query the profiles table first
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('role', 'teacher')
      .order('full_name', { ascending: true });

    if (profilesError) {
      console.error("Error fetching teacher profiles:", profilesError);
      toast({
        variant: "destructive",
        title: "Error Fetching Teachers",
        description: profilesError.message,
      });
      setTeachers([]);
      setIsLoading(false);
      return;
    }

    // If we have teacher profiles, get their details
    if (profilesData && profilesData.length > 0) {
      // Get all teacher IDs
      const teacherIds = profilesData.map(profile => profile.id);
      
      // Get teacher details from teacher_details table
      const { data: detailsData, error: detailsError } = await supabase
        .from('teacher_details')
        .select('id, employee_id, subjects, classes, status')
        .in('id', teacherIds);
        
      if (detailsError) {
        console.error("Error fetching teacher details:", detailsError);
        // Continue with partial data
      }
      
      // Create a map of teacher details by ID for quick lookup
      const detailsMap = new Map();
      if (detailsData) {
        detailsData.forEach(detail => {
          detailsMap.set(detail.id, detail);
        });
      }
      
      // Combine profile data with details
      const combinedData = profilesData.map(profile => {
        const details = detailsMap.get(profile.id) || { 
          employee_id: null, 
          subjects: null, 
          classes: null, 
          status: 'Active' 
        };
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          employee_id: details.employee_id,
          subjects: details.subjects,
          classes: details.classes,
          status: details.status === 'Active' || details.status === 'active' ? 'Active' : 'Inactive'
        };
      });
      
      setTeachers(combinedData as Teacher[]);
    } else {
      setTeachers([]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.employee_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.subjects?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.classes?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleNewTeacherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTeacherSelectChange = (name: keyof AddTeacherFormState, value: string) => {
     if (name === 'status') {
       setNewTeacher(prev => ({ ...prev, [name]: value as 'Active' | 'Inactive' }));
     } 
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password || !newTeacher.employeeId) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill required fields.", });
      return;
    }
    if (newTeacher.password.length < 8) {
       toast({ variant: "destructive", title: "Password Too Short", description: "Password min 8 characters.", });
       return;
    }
    setIsSubmitting(true);
    let newUserId = null;
    
    try {
      // Set autoconfirm = true to bypass email confirmation for teacher accounts
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newTeacher.email,
        password: newTeacher.password, 
        options: {
          data: {
            full_name: newTeacher.fullName,
            role: 'teacher',
            employee_id: newTeacher.employeeId,
          },
          emailRedirectTo: window.location.origin + '/auth'
        }
      });
      
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("User creation failed in Supabase Auth.");
      newUserId = signUpData.user.id;

      // NOTE: Auto-confirmation of email requires Supabase service role or admin API access
      // For now, the teacher will receive a confirmation email and need to verify it
      // Add a note to the success message
      let confirmationNote = "They will need to confirm their email before logging in.";
      
      // Check if profile already exists (it likely does due to Supabase auth hooks)
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', newUserId)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking for existing profile:", profileCheckError);
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            full_name: newTeacher.fullName,
            email: newTeacher.email,
            role: 'teacher'
          });

        if (profileError) {
          console.error("Profile insert failed:", profileError);
          throw new Error(`Auth user created, but failed to save profile: ${profileError.message}`);
        }
      } else {
        // Profile exists, update it
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            full_name: newTeacher.fullName,
            email: newTeacher.email,
            role: 'teacher',
            updated_at: new Date().toISOString()
          })
          .eq('id', newUserId);

        if (profileUpdateError) {
          console.error("Profile update failed:", profileUpdateError);
          throw new Error(`Auth user created, but failed to update profile: ${profileUpdateError.message}`);
        }
      }
      
      // Insert teacher-specific details in the teacher_details table
      const { error: teacherDetailsError } = await supabase
        .from('teacher_details')
        .upsert({
          id: newUserId,
          employee_id: newTeacher.employeeId,
          subjects: newTeacher.subjects,
          classes: newTeacher.classes,
          status: newTeacher.status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (teacherDetailsError) {
        console.warn("Failed to save teacher details:", teacherDetailsError);
        // Don't throw here - the main profile was created successfully
      }
      
      toast({
        title: "Teacher Account Created Successfully",
        description: `${newTeacher.fullName} added. ${confirmationNote}`,
      });
      
      await fetchTeachers();
      
      setNewTeacher({ fullName: '', email: '', employeeId: '', subjects: '', classes: '', password: '', status: 'Active' }); 
      setIsAddModalOpen(false);
      
    } catch (error: any) {
      console.error("Error creating teacher account:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Account",
        description: error.message || "Failed to create teacher account. Please check details or console.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = () => { alert('Implement Import CSV functionality'); };
  const handleExport = () => { alert('Implement Export CSV functionality'); };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedTeachers(new Set(filteredTeachers.map(t => t.id)));
    } else {
      setSelectedTeachers(new Set());
    }
  };

  const handleSelectTeacher = (teacherId: string, checked: boolean | 'indeterminate') => {
    const newSelectedTeachers = new Set(selectedTeachers);
    if (checked) {
      newSelectedTeachers.add(teacherId);
    } else {
      newSelectedTeachers.delete(teacherId);
    }
    setSelectedTeachers(newSelectedTeachers);
  };

  const isAllSelected = filteredTeachers.length > 0 && selectedTeachers.size === filteredTeachers.length;
  const isIndeterminate = selectedTeachers.size > 0 && selectedTeachers.size < filteredTeachers.length;

  // --- JSX --- 
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Top Section: Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-7 h-7" /> {/* Changed Icon */} 
          Manage Teachers
        </h1>
        <div className="flex gap-2 flex-wrap">
          {/* Add Teacher Dialog Trigger */} 
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add Teacher</span>
              </Button>
            </DialogTrigger>
            {/* Add Teacher Dialog Content */} 
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddTeacherSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new teacher. Password can be set manually or auto-generated.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   {/* Form Fields */} 
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="fullName" className="text-right">Full Name</Label>
                     <Input id="fullName" name="fullName" value={newTeacher.fullName} onChange={handleNewTeacherInputChange} className="col-span-3" required />
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="email" className="text-right">Email</Label>
                     <Input id="email" name="email" type="email" value={newTeacher.email} onChange={handleNewTeacherInputChange} className="col-span-3" required />
      </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="employeeId" className="text-right">Employee ID</Label>
                     <Input id="employeeId" name="employeeId" value={newTeacher.employeeId} onChange={handleNewTeacherInputChange} className="col-span-3" required />
              </div>
                   {/* Subjects Input */} 
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subjects" className="text-right">Subjects</Label>
                      <Input 
                        id="subjects" 
                        name="subjects" 
                        value={newTeacher.subjects} 
                        onChange={handleNewTeacherInputChange} 
                        className="col-span-3" 
                        placeholder="e.g., Math, Physics" 
                      />
                   </div>
                   {/* Classes Input */} 
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="classes" className="text-right">Classes</Label>
                      <Input 
                        id="classes" 
                        name="classes" 
                        value={newTeacher.classes} 
                        onChange={handleNewTeacherInputChange} 
                        className="col-span-3" 
                        placeholder="e.g., Form 1, Form 3" 
                      />
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="password" className="text-right">Password</Label>
                     <Input id="password" name="password" type="password" value={newTeacher.password} onChange={handleNewTeacherInputChange} className="col-span-3" placeholder="Min 8 characters" required />
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="status" className="text-right">Status</Label>
                     <Select name="status" value={newTeacher.status} onValueChange={(value) => handleNewTeacherSelectChange('status', value)} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Teacher"}
                </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* End Add Teacher Dialog */} 
          <Button variant="outline" onClick={handleImport} className="gap-1">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
           <Button variant="outline" onClick={handleExport} className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
            </div>
            
      {/* 2. Search & Filters Bar */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2 md:col-span-1">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input 
            type="search"
            placeholder="Search Name, Email, ID..." 
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search teachers"
          />
        </div>
        {/* Subject Filter Dropdown */} 
        <Select /* Add value & onValueChange state */ >
          <SelectTrigger aria-label="Filter by subject">
            <SelectValue placeholder="🏫 Subject Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {/* Add subject filtering logic here */}
          </SelectContent>
        </Select>
        {/* Class Filter Dropdown */} 
        <Select /* Add value & onValueChange state */ >
          <SelectTrigger aria-label="Filter by class assigned">
            <SelectValue placeholder="🎓 Class Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {/* Add class filtering logic here */}
          </SelectContent>
        </Select>
        {/* Status Filter Dropdown */} 
        <Select /* Add value & onValueChange state */ >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="✅ Status" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
            </div>
            
      {/* 3. Bulk Actions (Optional & Conditional) */} 
      {selectedTeachers.size > 0 && (
         <div className="flex items-center space-x-2 py-2 border rounded-md px-3 bg-muted/50">
           <span className="text-sm font-medium text-muted-foreground">{selectedTeachers.size} selected</span>
           <div className="flex-1"/> {/* Spacer */} 
           <Button variant="outline" size="sm" disabled={true /* TODO */} ><Lock className="mr-1 h-3 w-3" /> Reset Passwords</Button>
           <Button variant="outline" size="sm" disabled={true /* TODO */} ><UserCheck className="mr-1 h-3 w-3" /> Activate</Button>
           <Button variant="outline" size="sm" disabled={true /* TODO */} ><UserX className="mr-1 h-3 w-3" /> Deactivate</Button>
           <Button variant="destructive" size="sm" disabled={true /* TODO */} ><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
            </div>
      )}

      {/* 4. Teachers Table */} 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox 
                 checked={isAllSelected || isIndeterminate}
                 onCheckedChange={handleSelectAll}
                 aria-label="Select all teachers"
              /></TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subjects Taught</TableHead>
              <TableHead>Assigned Classes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id} data-state={selectedTeachers.has(teacher.id) ? "selected" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedTeachers.has(teacher.id)}
                      onCheckedChange={(checked) => handleSelectTeacher(teacher.id, checked)}
                      aria-label={`Select ${teacher.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{teacher.full_name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.subjects || '-'}</TableCell>
                  <TableCell>{teacher.classes || '-'}</TableCell>
                   <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {teacher.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => alert('Edit action: ' + teacher.full_name)}> <Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Reset password action: ' + teacher.full_name)}> <Lock className="mr-2 h-4 w-4" /> Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Toggle status action: ' + teacher.full_name)}>{teacher.status === 'Active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />} {teacher.status === 'Active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => alert('Delete action: ' + teacher.full_name)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No teachers found {searchTerm ? 'matching your search' : ''}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* 5. Pagination */} 
       <div className="flex items-center justify-between space-x-2 pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedTeachers.size} of {filteredTeachers.length} row(s) selected.
          </div>
           <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Page 1 of 1</span> {/* TODO: Update dynamically */} 
            <Button variant="outline" size="icon" disabled={true /* TODO */} >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={true /* TODO */} >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
           </div>
        </div>

    </div>
  );
};

export default ManageTeachers;
