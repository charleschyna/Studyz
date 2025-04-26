import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, MoreVertical, Plus, Search, Filter } from 'lucide-react';

interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  parent_email: string;
  parent_phone: string;
  status: string;
  created_at: string;
}

interface NewStudent {
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  emergency_contact: string;
}

const ManageStudents: React.FC = () => {
  const { toast } = useToast();
  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string; grade_level: number }[]>([]);
  
  const [newStudent, setNewStudent] = useState<NewStudent>({
    admission_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    class_id: '',
    parent_email: '',
    parent_phone: '',
    address: '',
    emergency_contact: '',
  });

  // Fetch students with pagination
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * 10;
      const end = start + 10 - 1;

      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      // Apply filters
      if (classFilter !== 'all') {
        query = query.eq('class_id', classFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (data) {
        setStudents(data);
        setTotalPages(Math.ceil((count || 0) / 10));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Failed to load students",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [currentPage, classFilter, statusFilter]);

  // Search and filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = students.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const displayedStudents = searchQuery ? filteredStudents : students;

  // Fetch classes for the dropdown
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade_level')
        .order('grade_level', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        setClasses(data);
        console.log('Classes loaded:', data.length);
      } else {
        console.log('No classes found in database');
        // Create a default class if none exist
        const { data: newClass, error: createError } = await supabase
          .from('classes')
          .insert([
            {
              name: 'Form 1',
              grade_level: 1,
              section: 'A',
              academic_year: '2025',
              status: 'active'
            }
          ])
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating default class:', createError);
        } else if (newClass) {
          setClasses([newClass]);
          console.log('Created default class:', newClass);
        }
      }
    } catch (error) {
      console.error('Error in fetchClasses:', error);
      toast({
        variant: "destructive",
        title: "Failed to load classes",
        description: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
    // Debug log
    // Remove this after checking
    // eslint-disable-next-line no-console
    console.log('Classes:', classes);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format the date properly for PostgreSQL
      const formattedDate = newStudent.date_of_birth ? new Date(newStudent.date_of_birth).toISOString().split('T')[0] : null;
      
      // Insert the new student
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            admission_number: newStudent.admission_number,
            first_name: newStudent.first_name,
            last_name: newStudent.last_name,
            date_of_birth: formattedDate,
            gender: newStudent.gender,
            class_id: newStudent.class_id,
            parent_email: newStudent.parent_email,
            parent_phone: newStudent.parent_phone,
            address: newStudent.address || null,
            emergency_contact: newStudent.emergency_contact || null,
            status: 'active',
            admission_date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update the students list
      if (data) {
        setStudents(prev => [data, ...prev]);
        setIsAddModalOpen(false);
        setNewStudent({
          admission_number: '',
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: '',
          class_id: '',
          parent_email: '',
          parent_phone: '',
          address: '',
          emergency_contact: '',
        });
        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Failed to add student",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground">
            View and manage student records
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="p-2 space-y-2">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class</Label>
                  <Select
                    value={classFilter}
                    onValueChange={setClassFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} (Grade {cls.grade_level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>A list of all students in the school</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayedStudents.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{student.parent_phone}</div>
                          <div className="text-sm text-muted-foreground">{student.parent_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' :
                          student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          student.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Student</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      Page {currentPage} of {totalPages}
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No students found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the student's details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admission_number">Admission Number *</Label>
                <Input
                  id="admission_number"
                  name="admission_number"
                  value={newStudent.admission_number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={newStudent.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={newStudent.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={newStudent.date_of_birth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select name="gender" value={newStudent.gender} onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_id">Class *</Label>
                <Select name="class_id" value={newStudent.class_id} onValueChange={(value) => handleInputChange({ target: { name: 'class_id', value } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} (Grade {cls.grade_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email *</Label>
                <Input
                  id="parent_email"
                  name="parent_email"
                  type="email"
                  value={newStudent.parent_email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_phone">Parent Phone *</Label>
                <Input
                  id="parent_phone"
                  name="parent_phone"
                  value={newStudent.parent_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  value={newStudent.emergency_contact}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudents;