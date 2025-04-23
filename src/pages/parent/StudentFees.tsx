import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Loader2, Download, Receipt } from 'lucide-react';

interface FeesSummary {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  total_fees: number;
  total_paid: number;
  balance: number;
  last_payment_date: string;
}

interface PaymentHistory {
  id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  receipt_url?: string;
}

const StudentFees: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [feesSummary, setFeesSummary] = useState<FeesSummary[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);

  useEffect(() => {
    const fetchFeesSummary = async () => {
      if (!user?.id) return;

      try {
        // First get the students associated with this parent
        const { data: students, error: studentsError } = await supabase
          .from('parent_student_relationships')
          .select('student_id')
          .eq('parent_id', user.id);

        if (studentsError) throw studentsError;

        if (!students?.length) {
          setIsLoading(false);
          return;
        }

        const studentIds = students.map(s => s.student_id);

        // Get fees summary for all associated students
        const { data: summary, error: summaryError } = await supabase
          .from('student_fees_summary')
          .select(`
            *,
            students:student_id (
              full_name,
              classes:class_id (name)
            )
          `)
          .in('student_id', studentIds)
          .order('created_at', { ascending: false });

        if (summaryError) throw summaryError;

        if (summary) {
          const formattedSummary = summary.map(item => ({
            ...item,
            student_name: item.students?.full_name || 'Unknown Student',
            class_name: item.students?.classes?.name || 'Unknown Class'
          }));
          setFeesSummary(formattedSummary);
        }

        // Get payment history
        const { data: payments, error: paymentsError } = await supabase
          .from('fee_payments')
          .select('*')
          .in('student_id', studentIds)
          .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;

        if (payments) {
          setPaymentHistory(payments);
        }
      } catch (error) {
        console.error('Error fetching fees data:', error);
        toast({
          variant: "destructive",
          title: "Failed to load fees data",
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeesSummary();
  }, [user?.id]);

  const downloadReceipt = async (payment: PaymentHistory) => {
    // Implement receipt download logic
    toast({
      title: "Download Started",
      description: "Your receipt is being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Fees</h1>
        <p className="text-muted-foreground">View your child's fees and payment history</p>
      </div>

      <div className="grid gap-6">
        {/* Fees Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ) : feesSummary.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">No fees information found</p>
              </CardContent>
            </Card>
          ) : (
            feesSummary.map((summary) => (
              <Card key={summary.id}>
                <CardHeader>
                  <CardTitle>{summary.student_name}</CardTitle>
                  <CardDescription>
                    {summary.class_name} - {summary.term}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Fees</p>
                      <p className="text-lg font-semibold">
                        KES {summary.total_fees.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        KES {summary.total_paid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="text-lg font-semibold text-red-600">
                      KES {summary.balance.toLocaleString()}
                    </p>
                  </div>
                  {summary.last_payment_date && (
                    <p className="text-sm text-muted-foreground">
                      Last payment: {new Date(summary.last_payment_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Recent payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : paymentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No payment history found
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        KES {payment.amount_paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method}
                      </TableCell>
                      <TableCell>{payment.transaction_id}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadReceipt(payment)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFees;
