import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "@/lib/translation";
import Link from "next/link";

interface CreateProjectCardProps {
  organizationId: string;
}

export function CreateProjectCard({ organizationId }: CreateProjectCardProps) {
  const { t } = useTranslation();

  return (
    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PlusIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">{t("createProject")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("addNewProject")}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/create?organizationId=${organizationId}`}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("createProject")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
