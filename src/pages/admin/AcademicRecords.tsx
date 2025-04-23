import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Student = {
  id: string;
  full_name: string;
  admission_no: string;
  class_id: string;
  stream_id: string;
};

type Grade = {
  id: string;
  student_id: string;
  subject_id: string;
  term_id: string;
  score: number;
  grade_type: 'CAT' | 'midterm' | 'end_term';
  kenyan_grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'E' | null;
};

type Subject = {
  id: string;
  name: string;
};

type Term = {
  id: string;
  name: string;
  academic_year: string;
};

type AnalysisData = {
  classId: string;
  className: string;
  averageScore: number;
  totalStudents: number;
  gradeDistribution: Record<string, number>;
  subjectAverages: Array<{ subject: string; average: number }>;
  performanceTrend: Array<{ term: string; average: number }>;
};

export default function AcademicRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [newGrade, setNewGrade] = useState({
    score: '',
    grade_type: 'CAT' as const,
  });
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAnalysisData();
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      if (studentsError) throw studentsError;

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      // Fetch terms
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });

      if (termsError) throw termsError;

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (classesError) throw classesError;

      setStudents(studentsData || []);
      setSubjects(subjectsData || []);
      setTerms(termsData || []);
      setClasses(classesData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch initial data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedStudent || !selectedSubject || !selectedTerm) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', selectedStudent)
        .eq('subject_id', selectedSubject)
        .eq('term_id', selectedTerm);

      if (error) throw error;

      setGrades(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch grades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!selectedStudent || !selectedSubject || !selectedTerm || !newGrade.score) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Calculate Kenyan grade based on score
      const score = parseFloat(newGrade.score);
      let kenyanGrade: Grade['kenyan_grade'] = null;
      
      if (score >= 80) kenyanGrade = 'A';
      else if (score >= 75) kenyanGrade = 'A-';
      else if (score >= 70) kenyanGrade = 'B+';
      else if (score >= 65) kenyanGrade = 'B';
      else if (score >= 60) kenyanGrade = 'B-';
      else if (score >= 55) kenyanGrade = 'C+';
      else if (score >= 50) kenyanGrade = 'C';
      else if (score >= 45) kenyanGrade = 'C-';
      else if (score >= 40) kenyanGrade = 'D+';
      else if (score >= 35) kenyanGrade = 'D';
      else if (score >= 30) kenyanGrade = 'D-';
      else kenyanGrade = 'E';

      const { error } = await supabase
        .from('grades')
        .insert({
          student_id: selectedStudent,
          subject_id: selectedSubject,
          term_id: selectedTerm,
          score: score,
          grade_type: newGrade.grade_type,
          kenyan_grade: kenyanGrade,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Grade added successfully',
      });

      // Reset form and refresh grades
      setNewGrade({ score: '', grade_type: 'CAT' });
      fetchGrades();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add grade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisData = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);

      // Fetch all grades for the selected class
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          students!inner(
            id,
            full_name,
            class_id
          ),
          subjects(
            id,
            name
          ),
          terms(
            id,
            name,
            academic_year
          )
        `)
        .eq('students.class_id', selectedClass);

      if (gradesError) throw gradesError;

      if (!gradesData || gradesData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No grades found for the selected class',
        });
        return;
      }

      // Calculate grade distribution
      const gradeDistribution: Record<string, number> = {
        'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'E': 0
      };

      gradesData.forEach(grade => {
        if (grade.kenyan_grade) {
          gradeDistribution[grade.kenyan_grade]++;
        }
      });

      // Calculate subject averages
      const subjectScores: Record<string, number[]> = {};
      gradesData.forEach(grade => {
        const subjectName = grade.subjects?.name || 'Unknown';
        if (!subjectScores[subjectName]) {
          subjectScores[subjectName] = [];
        }
        subjectScores[subjectName].push(grade.score);
      });

      const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
        subject,
        average: scores.reduce((a, b) => a + b, 0) / scores.length
      }));

      // Calculate performance trend by term
      const termScores: Record<string, number[]> = {};
      gradesData.forEach(grade => {
        const termName = grade.terms?.name + ' ' + grade.terms?.academic_year;
        if (!termScores[termName]) {
          termScores[termName] = [];
        }
        termScores[termName].push(grade.score);
      });

      const performanceTrend = Object.entries(termScores).map(([term, scores]) => ({
        term,
        average: scores.reduce((a, b) => a + b, 0) / scores.length
      }));

      // Calculate overall class average
      const allScores = gradesData.map(grade => grade.score);
      const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

      const selectedClassData = classes.find(c => c.id === selectedClass);

      setAnalysisData({
        classId: selectedClass,
        className: selectedClassData?.name || 'Unknown Class',
        averageScore,
        totalStudents: new Set(gradesData.map(g => g.students.id)).size,
        gradeDistribution,
        subjectAverages,
        performanceTrend
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analysis data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAverage = (grades: Grade[]) => {
    if (!grades.length) return 'N/A';
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return (sum / grades.length).toFixed(2);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Academic Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList>
              <TabsTrigger value="view">View Records</TabsTrigger>
              <TabsTrigger value="entry">Grade Entry</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name} - {term.academic_year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={fetchGrades} disabled={!selectedTerm || !selectedSubject}>
                  View Grades
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Admission No</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.full_name}</TableCell>
                              <TableCell>{student.admission_no}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedStudent(student.id)}
                                >
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent && grades.length > 0 ? (
                      <div>
                        <div className="mb-4">
                          <strong>Average Score:</strong> {calculateAverage(grades)}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grades.map((grade) => (
                              <TableRow key={grade.id}>
                                <TableCell>{grade.grade_type}</TableCell>
                                <TableCell>{grade.score}</TableCell>
                                <TableCell>{grade.kenyan_grade || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {selectedStudent
                          ? 'No grades found for the selected criteria'
                          : 'Select a student to view grades'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="entry" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">1. Select Student</h3>
                        <div className="space-y-4">
                          <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <div className="h-[300px] overflow-y-auto border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Admission No</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredStudents.map((student) => (
                                  <TableRow 
                                    key={student.id}
                                    className={selectedStudent === student.id ? 'bg-muted' : ''}
                                  >
                                    <TableCell>{student.full_name}</TableCell>
                                    <TableCell>{student.admission_no}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant={selectedStudent === student.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedStudent(student.id)}
                                      >
                                        {selectedStudent === student.id ? 'Selected' : 'Select'}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">2. Enter Grade Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Term</label>
                              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                  {terms.map((term) => (
                                    <SelectItem key={term.id} value={term.id}>
                                      {term.name} - {term.academic_year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Subject</label>
                              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Grade Type</label>
                              <Select 
                                value={newGrade.grade_type} 
                                onValueChange={(value) => setNewGrade(prev => ({ ...prev, grade_type: value as 'CAT' | 'midterm' | 'end_term' }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CAT">CAT</SelectItem>
                                  <SelectItem value="midterm">Midterm</SelectItem>
                                  <SelectItem value="end_term">End Term</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Score (0-100)</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={newGrade.score}
                                onChange={(e) => setNewGrade(prev => ({ ...prev, score: e.target.value }))}
                                placeholder="Enter score"
                              />
                            </div>

                            <Button 
                              onClick={handleGradeSubmit}
                              disabled={loading || !selectedStudent || !selectedSubject || !selectedTerm || !newGrade.score}
                            >
                              {loading ? 'Saving...' : 'Save Grade'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {selectedStudent && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Current Grades</h3>
                          {grades.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Score</TableHead>
                                  <TableHead>Grade</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {grades.map((grade) => (
                                  <TableRow key={grade.id}>
                                    <TableCell>{grade.grade_type}</TableCell>
                                    <TableCell>{grade.score}</TableCell>
                                    <TableCell>{grade.kenyan_grade || 'N/A'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No grades found for the selected criteria
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">Loading analysis data...</div>
                  ) : analysisData ? (
                    <div className="space-y-8">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {analysisData.averageScore.toFixed(2)}%
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {analysisData.totalStudents}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Most Common Grade</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Object.entries(analysisData.gradeDistribution)
                                .sort(([,a], [,b]) => b - a)[0][0]}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Grade Distribution Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Grade Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={Object.entries(analysisData.gradeDistribution).map(([grade, count]) => ({
                                  grade,
                                  count
                                }))}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="grade" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Subject Performance Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Subject Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analysisData.subjectAverages}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="average" fill="#82ca9d" name="Average Score" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Performance Trend Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analysisData.performanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="term" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="average"
                                  stroke="#8884d8"
                                  name="Class Average"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a class to view analysis
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
