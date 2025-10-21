"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const rejectFormSchema = z.object({
  rejection_reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

type RejectFormValues = z.infer<typeof rejectFormSchema>;

interface RejectWorkEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (rejection_reason: string) => void;
  isLoading?: boolean;
}

export function RejectWorkEntryDialog({
  open,
  onOpenChange,
  onReject,
  isLoading,
}: RejectWorkEntryDialogProps) {
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejection_reason: "",
    },
  });

  const onSubmit = (values: RejectFormValues) => {
    onReject(values.rejection_reason);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <X className="h-5 w-5 text-destructive" />
            <span>Reject Work Entry</span>
          </DialogTitle>
          <DialogDescription>
            Please provide a detailed reason for rejecting this work entry. This information will be shared with the worker.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will reject the work entry and notify the worker. Please ensure you provide a clear explanation.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="rejection_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe why this work entry is being rejected (e.g., incomplete work, incorrect measurements, missing photos, safety violations...)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? "Rejecting..." : "Reject Work Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
