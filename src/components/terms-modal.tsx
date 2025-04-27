"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/translation";
import { marked } from "marked";
import { useLatestTerms } from "@/hooks/use-latest-terms";

interface TermsModalProps {
  trigger: React.ReactNode;
  onAccept?: () => void;
}

export function TermsModal({ trigger, onAccept }: TermsModalProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { terms, isLoading, error, refetch } = useLatestTerms();

  // Fetch latest terms when modal is opened
  useEffect(() => {
    if (isOpen && !terms) {
      refetch();
    }
  }, [isOpen, terms, refetch]);

  const handleAccept = () => {
    setIsOpen(false);
    if (onAccept) {
      onAccept();
    }
  };

  // Sections for the terms of service display
  const sections = [
    { id: "privacy", title: "privacy" },
    { id: "terms", title: "service" },
    { id: "cookies", title: "legal" },
  ];

  // Parse Markdown to HTML
  const parseMarkdown = (content: string) => {
    if (!content) return "";
    return marked(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("termsOfService")}</DialogTitle>
          <DialogDescription>
            {t("termsOfServiceDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive p-4 text-center">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              {t("tryAgain")}
            </Button>
          </div>
        ) : terms ? (
          <div className="overflow-y-auto max-h-[60vh]">
            {sections.map((section) => (
              <div key={section.id} className="mb-8">
                <div className="sticky top-0 z-10 bg-background">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    {t(section.title)}
                  </h3>
                </div>
                <div className="mt-4 terms-content">
                  {terms[section.id as keyof typeof terms] ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(
                          terms[section.id as keyof typeof terms] as string
                        ),
                      }}
                    />
                  ) : (
                    <p>{t("noContentAvailable")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <p>{t("noTermsFound")}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("close")}
          </Button>
          {terms && <Button onClick={handleAccept}>{t("acceptTerms")}</Button>}
        </DialogFooter>
      </DialogContent>

      {/* Styles de base pour le contenu Markdown */}
      <style jsx global>{`
        .terms-content h1,
        .terms-content h2,
        .terms-content h3,
        .terms-content h4,
        .terms-content h5,
        .terms-content h6 {
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .terms-content h1 {
          font-size: 1.5rem;
        }

        .terms-content h2 {
          font-size: 1.25rem;
        }

        .terms-content h3 {
          font-size: 1.125rem;
        }

        .terms-content p {
          margin-bottom: 1em;
        }

        .terms-content ul,
        .terms-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }

        .terms-content ul {
          list-style-type: disc;
        }

        .terms-content ol {
          list-style-type: decimal;
        }

        .terms-content a {
          color: #3182ce;
          text-decoration: underline;
        }

        .terms-content blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }

        .terms-content code {
          font-family: monospace;
          background-color: #f1f1f1;
          padding: 0.2em 0.4em;
          border-radius: 3px;
        }

        .terms-content pre {
          background-color: #f1f1f1;
          padding: 1em;
          overflow-x: auto;
          margin-bottom: 1em;
          border-radius: 3px;
        }

        .terms-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }

        .terms-content table th,
        .terms-content table td {
          border: 1px solid #e2e8f0;
          padding: 0.5em;
          text-align: left;
        }

        .terms-content table th {
          background-color: #f1f1f1;
        }
      `}</style>
    </Dialog>
  );
}
