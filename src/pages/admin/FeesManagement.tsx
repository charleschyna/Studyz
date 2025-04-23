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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  Plus,
  Download,
  Upload,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';

// Types
interface FeeStructure {
  id: string;
  class_id: string;
  class_name: string;
  term: string;
  amount: number;
  description: string;
  academic_year: string;
}

interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  total_fees: number;
  balance: number;
}

const FeesManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('structure');
  const [isLoading, setIsLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Modal states
  const [isAddStructureModalOpen, setIsAddStructureModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newStructure, setNewStructure] = useState({
    class_id: '',
    term: '',
    amount: '',
    description: '',
    academic_year: new Date().getFullYear().toString(),
  });

  const [newPayment, setNewPayment] = useState({
    student_id: '',
    term: '',
    amount_paid: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
  });

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structure')
        .select(`
          *,
          classes:class_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedStructures = data.map(structure => ({
          ...structure,
          class_name: structure.classes?.name || 'Unknown Class'
        }));
        setFeeStructures(formattedStructures);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      toast({
        variant: "destructive",
        title: "Failed to load fee structures",
        description: "Please try again later.",
      });
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fees_summary')
        .select(`
          *,
          students:student_id (
            full_name,
            classes:class_id (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPayments = data.map(payment => ({
          ...payment,
          student_name: payment.students?.full_name || 'Unknown Student',
          class_name: payment.students?.classes?.name || 'Unknown Class'
        }));
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        variant: "destructive",
        title: "Failed to load payments",
        description: "Please try again later.",
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFeeStructures(), fetchPayments()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Handle adding new fee structure
  const handleAddStructure = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('fee_structure')
        .insert([
          {
            class_id: newStructure.class_id,
            term: newStructure.term,
            amount: parseFloat(newStructure.amount),
            description: newStructure.description,
            academic_year: newStructure.academic_year,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee structure added successfully.",
      });

      setIsAddStructureModalOpen(false);
      fetchFeeStructures();
    } catch (error) {
      console.error('Error adding fee structure:', error);
      toast({
        variant: "destructive",
        title: "Failed to add fee structure",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding new payment
  const handleAddPayment = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('fee_payments')
        .insert([
          {
            student_id: newPayment.student_id,
            term: newPayment.term,
            amount_paid: parseFloat(newPayment.amount_paid),
            payment_method: newPayment.payment_method,
            payment_date: newPayment.payment_date,
            status: 'success',
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });

      setIsAddPaymentModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        variant: "destructive",
        title: "Failed to record payment",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            Fees Management
          </h1>
          <p className="text-muted-foreground">Manage fee structures and payments</p>
        </div>
      </div>

      <Tabs defaultValue="structure" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="payments">Payment Records</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => setIsAddStructureModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee Structure
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>
                Current fee structure for all classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Amount (KES)</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : feeStructures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No fee structures found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeStructures.map((structure) => (
                      <TableRow key={structure.id}>
                        <TableCell>{structure.class_name}</TableCell>
                        <TableCell>{structure.term}</TableCell>
                        <TableCell>{structure.amount.toLocaleString()}</TableCell>
                        <TableCell>{structure.description}</TableCell>
                        <TableCell>{structure.academic_year}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => setIsAddPaymentModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                View and manage student payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.student_name}</TableCell>
                        <TableCell>{payment.class_name}</TableCell>
                        <TableCell>{payment.term}</TableCell>
                        <TableCell>{payment.total_fees.toLocaleString()}</TableCell>
                        <TableCell>{payment.amount_paid.toLocaleString()}</TableCell>
                        <TableCell>{payment.balance.toLocaleString()}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Fee Structure Modal */}
      <Dialog open={isAddStructureModalOpen} onOpenChange={setIsAddStructureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fee Structure</DialogTitle>
            <DialogDescription>
              Add a new fee structure for a class and term
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class_id">Class *</Label>
                <Select
                  value={newStructure.class_id}
                  onValueChange={(value) => setNewStructure(prev => ({ ...prev, class_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add class options dynamically */}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="term">Term *</Label>
                <Select
                  value={newStructure.term}
                  onValueChange={(value) => setNewStructure(prev => ({ ...prev, term: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newStructure.amount}
                  onChange={(e) => setNewStructure(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newStructure.description}
                  onChange={(e) => setNewStructure(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  value={newStructure.academic_year}
                  onChange={(e) => setNewStructure(prev => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="Enter academic year"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStructureModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStructure}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Structure'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Modal */}
      <Dialog open={isAddPaymentModalOpen} onOpenChange={setIsAddPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for a student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select
                  value={newPayment.student_id}
                  onValueChange={(value) => setNewPayment(prev => ({ ...prev, student_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add student options dynamically */}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="term">Term *</Label>
                <Select
                  value={newPayment.term}
                  onValueChange={(value) => setNewPayment(prev => ({ ...prev, term: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount_paid">Amount Paid (KES) *</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  value={newPayment.amount_paid}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount_paid: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={newPayment.payment_method}
                  onValueChange={(value) => setNewPayment(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_date">Payment Date *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPaymentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
