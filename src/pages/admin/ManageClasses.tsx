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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  PlusCircle, 
  Upload, 
  Download, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  GraduationCap
} from 'lucide-react';

// Types
interface Class {
  id: string;
  name: string;
  grade_level: string;
  section: string;
  academic_year: string;
  students_count: number;
  subjects_count: number;
  class_teacher_id?: string;
  class_teacher_name?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  grades: string;
  classes_count: number;
}

const ManageClasses: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');
  
  // Classes state
  const [isClassesLoading, setIsClassesLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  
  // Subjects state
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  
  // Modal states
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current items
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  
  // New item form states
  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: '',
    section: '',
    academic_year: new Date().getFullYear().toString(),
    class_teacher_id: ''
  });
  
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    grades: 'all'
  });
  
  // Fetch classes with counts
  const fetchClasses = async () => {
    setIsClassesLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        // Get student counts
        const { data: studentCounts, error: studentCountError } = await supabase
          .from('students')
          .select('class_id, count')
          .group('class_id');
          
        if (studentCountError) throw studentCountError;
        
        // Get subject counts
        const { data: subjectCounts, error: subjectCountError } = await supabase
          .from('class_subjects')
          .select('class_id, count')
          .group('class_id');
          
        if (subjectCountError) throw subjectCountError;
        
        // Get teacher names
        const { data: teachers, error: teachersError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher');
          
        if (teachersError) throw teachersError;
        
        // Convert counts to a map
        const studentMap: Record<string, number> = {};
        studentCounts?.forEach(item => {
          studentMap[item.class_id] = Number(item.count);
        });
        
        const subjectMap: Record<string, number> = {};
        subjectCounts?.forEach(item => {
          subjectMap[item.class_id] = Number(item.count);
        });
        
        // Convert teachers to a map
        const teacherMap: Record<string, string> = {};
        teachers?.forEach(teacher => {
          teacherMap[teacher.id] = teacher.full_name;
        });
        
        // Format class data
        const formattedClasses = data.map(cls => ({
          id: cls.id,
          name: cls.name,
          grade_level: cls.grade_level,
          section: cls.section,
          academic_year: cls.academic_year,
          students_count: studentMap[cls.id] || 0,
          subjects_count: subjectMap[cls.id] || 0,
          class_teacher_id: cls.class_teacher_id,
          class_teacher_name: cls.class_teacher_id ? teacherMap[cls.class_teacher_id] : undefined
        }));
        
        setClasses(formattedClasses);
        setFilteredClasses(formattedClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        variant: "destructive",
        title: "Failed to load classes",
        description: "Please try again later.",
      });
    } finally {
      setIsClassesLoading(false);
    }
  };
  
  // Fetch subjects with counts
  const fetchSubjects = async () => {
    setIsSubjectsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        // Get class counts for each subject
        const { data: classCounts, error: classCountError } = await supabase
          .from('class_subjects')
          .select('subject_id, count')
          .group('subject_id');
          
        if (classCountError) throw classCountError;
        
        // Convert counts to a map
        const classMap: Record<string, number> = {};
        classCounts?.forEach(item => {
          classMap[item.subject_id] = Number(item.count);
        });
        
        // Format subject data
        const formattedSubjects = data.map(subj => ({
          id: subj.id,
          name: subj.name,
          code: subj.code,
          description: subj.description,
          grades: subj.grades || 'all',
          classes_count: classMap[subj.id] || 0
        }));
        
        setSubjects(formattedSubjects);
        setFilteredSubjects(formattedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        variant: "destructive",
        title: "Failed to load subjects",
        description: "Please try again later.",
      });
    } finally {
      setIsSubjectsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'classes') {
      fetchClasses();
    } else {
      fetchSubjects();
    }
  }, [activeTab]);
  
  // Filter classes when filter settings change
  useEffect(() => {
    filterClasses();
  }, [classSearchTerm, gradeFilter, classes]);
  
  // Filter subjects when search term changes
  useEffect(() => {
    filterSubjects();
  }, [subjectSearchTerm, subjects]);
  
  // Filter classes based on search term and filters
  const filterClasses = () => {
    let filtered = [...classes];
    
    // Filter by search term
    if (classSearchTerm) {
      const term = classSearchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(term) ||
        cls.section.toLowerCase().includes(term) ||
        cls.grade_level.toLowerCase().includes(term)
      );
    }
    
    // Filter by grade level
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(cls => cls.grade_level === gradeFilter);
    }
    
    setFilteredClasses(filtered);
  };
  
  // Filter subjects based on search term
  const filterSubjects = () => {
    let filtered = [...subjects];
    
    // Filter by search term
    if (subjectSearchTerm) {
      const term = subjectSearchTerm.toLowerCase();
      filtered = filtered.filter(subj => 
        subj.name.toLowerCase().includes(term) ||
        subj.code.toLowerCase().includes(term) ||
        (subj.description && subj.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredSubjects(filtered);
  };
  
  // Handle class form input changes
  const handleClassInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle subject form input changes
  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="w-8 h-8" />
            Classes & Subjects
          </h1>
          <p className="text-muted-foreground">Manage classes, sections, and subjects</p>
        </div>
      </div>
      
      {/* Tabs for Classes and Subjects */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="classes">
            <GraduationCap className="mr-2 h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="mr-2 h-4 w-4" />
            Subjects
          </TabsTrigger>
        </TabsList>
        
        {/* Classes Tab Content */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p>Manage school classes, assign teachers, and link subjects</p>
            <div className="flex gap-2">
              <Button className="gap-1" onClick={() => {
                setNewClass({
                  name: '',
                  grade_level: '',
                  section: '',
                  academic_year: new Date().getFullYear().toString(),
                  class_teacher_id: ''
                });
                setIsAddClassModalOpen(true);
              }}>
                <PlusCircle className="h-4 w-4" />
                <span>Add Class</span>
              </Button>
              
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Search & Filters Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search"
                    placeholder="Search by class name or section..." 
                    className="pl-8 w-full"
                    value={classSearchTerm}
                    onChange={(e) => setClassSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Grade Level Filter */}
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Classes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>
                Showing {filteredClasses.length} out of {classes.length} classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Class Name</TableHead>
                      <TableHead className="w-[150px]">Grade</TableHead>
                      <TableHead className="w-[150px]">Section</TableHead>
                      <TableHead className="w-[150px]">Academic Year</TableHead>
                      <TableHead className="w-[200px]">Class Teacher</TableHead>
                      <TableHead className="w-[100px] text-center">Students</TableHead>
                      <TableHead className="w-[100px] text-center">Subjects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isClassesLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Loading classes...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <p className="text-muted-foreground">No classes found</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Try adjusting your search or filters, or add a new class
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>Grade {cls.grade_level}</TableCell>
                          <TableCell>{cls.section}</TableCell>
                          <TableCell>{cls.academic_year}</TableCell>
                          <TableCell>{cls.class_teacher_name || '-'}</TableCell>
                          <TableCell className="text-center">{cls.students_count}</TableCell>
                          <TableCell className="text-center">{cls.subjects_count}</TableCell>
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
                                    setCurrentClass(cls);
                                    setNewClass({
                                      name: cls.name,
                                      grade_level: cls.grade_level,
                                      section: cls.section,
                                      academic_year: cls.academic_year,
                                      class_teacher_id: cls.class_teacher_id || ''
                                    });
                                    setIsEditClassModalOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Manage Subjects
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
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
        </TabsContent>
        
        {/* Subjects Tab Content */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex justify-between items-center">
            <p>Manage school subjects and curriculum</p>
            <div className="flex gap-2">
              <Button className="gap-1" onClick={() => {
                setNewSubject({
                  name: '',
                  code: '',
                  description: '',
                  grades: 'all'
                });
                setIsAddSubjectModalOpen(true);
              }}>
                <PlusCircle className="h-4 w-4" />
                <span>Add Subject</span>
              </Button>
              
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search by subject name or code..." 
                  className="pl-8 w-full"
                  value={subjectSearchTerm}
                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Subjects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>
                Showing {filteredSubjects.length} out of {subjects.length} subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Subject Code</TableHead>
                      <TableHead className="w-[250px]">Subject Name</TableHead>
                      <TableHead className="w-[300px]">Description</TableHead>
                      <TableHead className="w-[180px]">Applicable Grades</TableHead>
                      <TableHead className="w-[100px] text-center">Classes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSubjectsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Loading subjects...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredSubjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <p className="text-muted-foreground">No subjects found</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Try adjusting your search or add a new subject
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{subject.description || '-'}</TableCell>
                          <TableCell>
                            {subject.grades === 'all' ? 
                              'All Grades' : 
                              subject.grades.split(',').map(g => `Grade ${g}`).join(', ')}
                          </TableCell>
                          <TableCell className="text-center">{subject.classes_count}</TableCell>
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
                                    setCurrentSubject(subject);
                                    setNewSubject({
                                      name: subject.name,
                                      code: subject.code,
                                      description: subject.description || '',
                                      grades: subject.grades
                                    });
                                    setIsEditSubjectModalOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageClasses; 