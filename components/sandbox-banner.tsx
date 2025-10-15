import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SandboxBanner() {
  return (
    <Alert className="mb-6 border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Preview Mode</AlertTitle>
      <AlertDescription>
        You are viewing demo data. Changes will not be saved. Contact the
        administrator to get full access.
      </AlertDescription>
    </Alert>
  );
}
