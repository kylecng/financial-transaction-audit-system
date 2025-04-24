import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons'; // Or your preferred icon library

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useTransactionStore,
  LogTransactionData,
} from '@/stores/transactionStore'; // Import store and type
// import { useAuthStore } from '@/stores/authStore'; // Role check handled by routing/AuthGuard
import { useNavigate } from 'react-router-dom'; // To redirect after success

// Define Zod schema for validation
const formSchema = z.object({
  transactionType: z.string().min(1, 'Transaction type is required'),
  amount: z.coerce // Use coerce to convert input string to number
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  currency: z
    .string()
    .min(1, 'Currency is required')
    .length(3, 'Use 3-letter currency code (e.g., USD)'),
  accountId: z.string().min(1, 'Account ID is required'),
  transactionTimestamp: z.date({
    required_error: 'Transaction date/time is required.',
  }),
  description: z.string().optional(),
  sourceSystem: z.string().optional(),
});

// Define some example options (replace with actual data source if needed)
const transactionTypeOptions = ['Credit', 'Debit', 'Transfer', 'Payment'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY']; // Example currencies

const LogTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const { logTransaction, isLogging, logError, logSuccess, resetLogStatus } =
    useTransactionStore();
  // const { user } = useAuthStore(); // Role check handled by routing/AuthGuard

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: '',
      amount: undefined, // Use undefined for number inputs initially
      currency: '',
      accountId: '',
      transactionTimestamp: undefined,
      description: '',
      sourceSystem: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert date to ISO string for the API
    const transactionData: LogTransactionData = {
      ...values,
      amount: Number(values.amount), // Ensure amount is number
      transactionTimestamp: values.transactionTimestamp.toISOString(),
    };
    console.log('Submitting transaction:', transactionData);
    const success = await logTransaction(transactionData);
    if (success) {
      // Optionally reset form or navigate away
      // form.reset(); // Reset form fields
      // Consider navigating to the transaction list page after a short delay
      setTimeout(() => {
        navigate('/transactions'); // Redirect to transaction list
      }, 1500); // Delay to show success message
    }
  }

  // Reset log status when component unmounts or before submitting again
  useEffect(() => {
    // Reset status on mount in case user navigates back
    resetLogStatus();
    // Cleanup function to reset on unmount
    return () => {
      resetLogStatus();
    };
  }, [resetLogStatus]);

  // Redirect if not a transactor (though AuthGuard should handle this)
  // This is an extra layer of safety or could be used if AuthGuard isn't implemented yet
  // useEffect(() => {
  //   if (user?.role !== 'transactor') {
  //     navigate('/'); // Redirect to home or login if not authorized
  //   }
  // }, [user, navigate]);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Log New Transaction</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLogging}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01" // Allow decimals
                    placeholder="e.g., 100.50"
                    {...field}
                    disabled={isLogging}
                    // react-hook-form handles valueAsNumber, but zod coerce helps too
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : +e.target.value
                      )
                    }
                    value={field.value ?? ''} // Handle undefined for controlled input
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLogging}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency (e.g., USD)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Use 3-letter currency code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account ID */}
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter account identifier"
                    {...field}
                    disabled={isLogging}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transaction Timestamp */}
          <FormField
            control={form.control}
            name="transactionTimestamp"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLogging}
                      >
                        {field.value ? (
                          format(field.value, 'PPP HH:mm:ss') // Format includes time
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() ||
                        date < new Date('1900-01-01') ||
                        isLogging
                      }
                      initialFocus
                      // Need to add time selection capability if required
                      // This basic calendar only selects the date.
                      // For time, you might need a separate time input or a more complex date-time picker component.
                      // For now, it sets the time to the beginning of the selected day.
                    />
                    {/* Basic Time Input - Consider a dedicated library/component for better UX */}
                    <div className="p-2 border-t">
                      <Input
                        type="time"
                        step="1" // Allow seconds
                        disabled={!field.value || isLogging}
                        value={
                          field.value ? format(field.value, 'HH:mm:ss') : ''
                        }
                        onChange={(e) => {
                          if (field.value) {
                            const [hours, minutes, seconds] = e.target.value
                              .split(':')
                              .map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours, minutes, seconds);
                            field.onChange(newDate);
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date and time the transaction occurred.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description (Optional) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a brief description..."
                    className="resize-none"
                    {...field}
                    disabled={isLogging}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source System (Optional) */}
          <FormField
            control={form.control}
            name="sourceSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source System (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., POS, Online Banking"
                    {...field}
                    disabled={isLogging}
                  />
                </FormControl>
                <FormDescription>
                  Identifier of the system generating the transaction.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feedback Messages */}
          {logSuccess && (
            <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded-md">
              Transaction logged successfully! Redirecting...
            </div>
          )}
          {logError && (
            <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
              Error: {logError}
            </div>
          )}

          <Button type="submit" disabled={isLogging} className="w-full">
            {isLogging ? 'Logging...' : 'Log Transaction'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LogTransactionPage;
