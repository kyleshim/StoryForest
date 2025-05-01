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

const childFormSchema = z.object({
  name: z.string().min(2, {
    message: "Child's name must be at least 2 characters.",
  }),
  age: z.coerce.number().int().min(0, {
    message: "Age must be 0 or higher.",
  }).max(10, {
    message: "Age must be 10 or lower.",
  }),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

interface ChildFormProps {
  onSuccess?: () => void;
}

export function ChildForm({ onSuccess }: ChildFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: "",
      age: 0,
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
        
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="10" {...field} />
              </FormControl>
              <FormDescription>
                Your child's current age. This helps us provide age-appropriate book recommendations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
