import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function AppNotFound() {
  return (
    <PageContainer>
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={Compass}
          title="Not found"
          description="That item doesn't exist or may have been deleted."
        >
          <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
        </EmptyState>
      </div>
    </PageContainer>
  );
}
