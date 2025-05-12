import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Current year for validation
const currentYear = new Date().getFullYear();

const childFormSchema = z.object({
  name: z.string().min(2, {
    message: "Child's name must be at least 2 characters.",
  }),
  birthMonth: z.coerce.number().int().min(1, {
    message: "Month is required.",
  }).max(12, {
    message: "Month must be valid (1-12).",
  }),
  birthYear: z.coerce.number().int().min(currentYear - 10, {
    message: "Year must be within the last 10 years.",
  }).max(currentYear, {
    message: "Year cannot be in the future.",
  }),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

interface ChildFormProps {
  onSuccess?: () => void;
}

export function ChildForm({ onSuccess }: ChildFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Generate array of years for the dropdown (current year and 10 years back)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);
  
  // Months for the dropdown
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: "",
      birthMonth: new Date().getMonth() + 1, // Current month as default
      birthYear: currentYear, // Current year as default
    },
  });
  
  const createChildMutation = useMutation({
    mutationFn: async (values: ChildFormValues) => {
      await apiRequest("POST", "/api/children", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Child profile created",
        description: "The child profile has been created successfully.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create child profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: ChildFormValues) {
    if (!user) return;
    createChildMutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your child's name" {...field} />
              </FormControl>
              <FormDescription>
                This is how your child's profile will appear in the app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="birthMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Month</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your child's birth month.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Year</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your child's birth year.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={createChildMutation.isPending}
          >
            {createChildMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
