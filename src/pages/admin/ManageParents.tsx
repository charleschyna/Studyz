import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  PlusCircle, 
  Upload, 
  Download, 
  Search, 
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  Link,
  Eye,
  Loader2
} from 'lucide-react';

// Types
interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  parent_type: 'mother' | 'father' | 'guardian';
  status: 'active' | 'inactive';
  linked_students_count: number;
}

interface Student {
  id: string;
  full_name: string;
  admission_no: string;
  class_id: string;
  class_name?: string;
}

interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
}

const ManageParents: React.FC = () => {
  const { toast } = useToast();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentTypeFilter, setParentTypeFilter] = useState('all');
  const [linkedFilter, setLinkedFilter] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selection state
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  
  // Current parent and students
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  
  // New parent form state
  const [newParent, setNewParent] = useState({
    full_name: '',
    email: '',
    phone: '',
    parent_type: 'guardian',
    password: '',
    status: 'active',
  });
  
  // Fetch parents with linked students count
  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'parent');
        
      if (error) throw error;
      
      if (data) {
        // Get parent-student links to count
        const { data: parentStudentsData, error: parentStudentsError } = await supabase
          .from('parent_students')
          .select('parent_id, student_id');
          
        if (parentStudentsError) throw parentStudentsError;
        
        // Count linked students for each parent
        const parentCounts: Record<string, number> = {};
        if (parentStudentsData) {
          parentStudentsData.forEach(link => {
            parentCounts[link.parent_id] = (parentCounts[link.parent_id] || 0) + 1;
          });
        }
        
        // Format parent data
        const formattedParents = data.map(parent => ({
          id: parent.id,
          full_name: parent.full_name,
          email: parent.email,
          phone: parent.phone || '',
          parent_type: parent.parent_type || 'guardian',
          status: parent.status || 'active',
          linked_students_count: parentCounts[parent.id] || 0
        }));
        
        setParents(formattedParents);
        setFilteredParents(formattedParents);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast({
        variant: "destructive",
        title: "Failed to load parents",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch all students
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (name)
        `)
        .order('full_name');
        
      if (error) throw error;
      
      if (data) {
        const formattedStudents = data.map(student => ({
          id: student.id,
          full_name: student.full_name,
          admission_no: student.admission_no,
          class_id: student.class_id,
          class_name: student.classes?.name
        }));
        
        setAllStudents(formattedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Failed to load students",
        description: "Please try again later.",
      });
    }
  };
  
  // Fetch linked students for a parent
  const fetchLinkedStudents = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentId);
        
      if (error) throw error;
      
      if (data) {
        const studentIds = data.map(link => link.student_id);
        
        if (studentIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select(`
              *,
              classes:class_id (name)
            `)
            .in('id', studentIds);
            
          if (studentsError) throw studentsError;
          
          if (studentsData) {
            const formattedStudents = studentsData.map(student => ({
              id: student.id,
              full_name: student.full_name,
              admission_no: student.admission_no,
              class_id: student.class_id,
              class_name: student.classes?.name
            }));
            
            setLinkedStudents(formattedStudents);
            setSelectedStudents(new Set(studentIds));
          }
        } else {
          setLinkedStudents([]);
          setSelectedStudents(new Set());
        }
      }
    } catch (error) {
      console.error('Error fetching linked students:', error);
      toast({
        variant: "destructive",
        title: "Failed to load linked students",
        description: "Please try again later.",
      });
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);
  
  // Filter parents when filter settings change
  useEffect(() => {
    filterParents();
  }, [searchTerm, parentTypeFilter, linkedFilter, parents]);
  
  // Filter parents based on search term and filters
  const filterParents = () => {
    let filtered = [...parents];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(parent => 
        parent.full_name.toLowerCase().includes(term) ||
        parent.email.toLowerCase().includes(term) ||
        parent.phone.toLowerCase().includes(term)
      );
    }
    
    // Filter by parent type
    if (parentTypeFilter !== 'all') {
      filtered = filtered.filter(parent => parent.parent_type === parentTypeFilter);
    }
    
    // Filter by linked students
    if (linkedFilter === 'linked') {
      filtered = filtered.filter(parent => parent.linked_students_count > 0);
    } else if (linkedFilter === 'unlinked') {
      filtered = filtered.filter(parent => parent.linked_students_count === 0);
    }
    
    setFilteredParents(filtered);
  };
  
  // Handle parent form input changes
  const handleParentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParent(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle parent type selection
  const handleParentTypeChange = (value: string) => {
    setNewParent(prev => ({ ...prev, parent_type: value }));
  };
  
  // Handle parent status selection
  const handleStatusChange = (value: string) => {
    setNewParent(prev => ({ ...prev, status: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8" />
            Manage Parents
          </h1>
          <p className="text-muted-foreground">Add, edit, and link parents to students</p>
        </div>
        
        <div className="flex gap-2">
          {/* Add Parent Button */}
          <Button className="gap-1" onClick={() => {
            setNewParent({
              full_name: '',
              email: '',
              phone: '',
              parent_type: 'guardian',
              password: '',
              status: 'active',
            });
            setIsAddModalOpen(true);
          }}>
            <PlusCircle className="h-4 w-4" />
            <span>Add Parent</span>
          </Button>
          
          {/* Import CSV Button */}
          <Button variant="outline" className="gap-1">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
          
          {/* Export CSV Button */}
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
      
      {/* Search & Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search by name, email, or phone..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Parent Type Filter */}
            <Select value={parentTypeFilter} onValueChange={setParentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Parent Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Linked Status Filter */}
            <Select value={linkedFilter} onValueChange={setLinkedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Linked Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parents</SelectItem>
                <SelectItem value="linked">Linked to Students</SelectItem>
                <SelectItem value="unlinked">Not Linked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Accounts</CardTitle>
          <CardDescription>
            Showing {filteredParents.length} out of {parents.length} parents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Parent Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[150px]">Phone</TableHead>
                  <TableHead className="w-[150px]">Linked Students</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading parents...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredParents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <p className="text-muted-foreground">No parents found</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Try adjusting your search or filters, or add a new parent
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">{parent.full_name}</TableCell>
                      <TableCell>{parent.email}</TableCell>
                      <TableCell>{parent.phone || '-'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 h-8 font-normal"
                          onClick={() => {
                            setCurrentParent(parent);
                            fetchLinkedStudents(parent.id);
                            setIsViewStudentsModalOpen(true);
                          }}
                        >
                          {parent.linked_students_count} {parent.linked_students_count === 1 ? 'Student' : 'Students'}
                          {parent.linked_students_count > 0 && <Eye className="ml-1 h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {parent.parent_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={parent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {parent.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentParent(parent);
                                setNewParent({
                                  full_name: parent.full_name,
                                  email: parent.email,
                                  phone: parent.phone,
                                  parent_type: parent.parent_type,
                                  password: '',
                                  status: parent.status,
                                });
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentParent(parent);
                                fetchLinkedStudents(parent.id);
                                setIsLinkModalOpen(true);
                              }}
                            >
                              <Link className="mr-2 h-4 w-4" />
                              Link Students
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600"
                              onClick={() => {
                                // Handle delete
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageParents; 