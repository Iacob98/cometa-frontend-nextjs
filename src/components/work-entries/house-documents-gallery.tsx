"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Download, ExternalLink, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HouseDocument {
  id: string;
  house_id: string;
  doc_type?: string | null;
  filename?: string | null;
  file_path?: string | null;
  upload_date?: string | null;
  uploaded_by?: string | null;
  created_at?: string;
}

interface HouseDocumentsGalleryProps {
  documents: HouseDocument[];
}

export function HouseDocumentsGallery({ documents }: HouseDocumentsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Categorize documents
  const categorizeDocuments = () => {
    const categories: Record<string, HouseDocument[]> = {
      plans: [],
      schemes: [],
      photos: [],
      other: [],
    };

    documents.forEach((doc) => {
      const docType = (doc.doc_type || "").toLowerCase();
      const filename = (doc.filename || "").toLowerCase();

      if (docType.includes("plan") || filename.includes("plan")) {
        categories.plans.push(doc);
      } else if (
        docType.includes("scheme") ||
        docType.includes("diagram") ||
        filename.includes("scheme") ||
        filename.includes("diagram")
      ) {
        categories.schemes.push(doc);
      } else if (
        docType.includes("photo") ||
        docType.includes("image") ||
        filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ) {
        categories.photos.push(doc);
      } else {
        categories.other.push(doc);
      }
    });

    return categories;
  };

  const categories = categorizeDocuments();
  const totalDocuments = documents.length;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "plans":
        return "Plans";
      case "schemes":
        return "Schemes";
      case "photos":
        return "Photos";
      case "other":
        return "Other";
      default:
        return "All";
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === "all") return totalDocuments;
    return categories[category as keyof typeof categories]?.length || 0;
  };

  const getDocumentsForCategory = (category: string) => {
    if (category === "all") return documents;
    return categories[category as keyof typeof categories] || [];
  };

  const handleDownload = (doc: HouseDocument) => {
    if (doc.file_path) {
      // Construct Supabase Storage public URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const bucketName = "house-documents"; // Assuming documents are in this bucket
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${doc.file_path}`;

      window.open(publicUrl, "_blank");
    }
  };

  const isImageFile = (filename: string | null | undefined) => {
    if (!filename) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  if (totalDocuments === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>House Documents</span>
          </CardTitle>
          <CardDescription>Pre-loaded plans, schemes, and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No documents found for this house.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <span>House Documents</span>
          <Badge variant="secondary">{totalDocuments}</Badge>
        </CardTitle>
        <CardDescription>Pre-loaded plans, schemes, and photos</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({totalDocuments})
            </TabsTrigger>
            <TabsTrigger value="plans">
              Plans ({getCategoryCount("plans")})
            </TabsTrigger>
            <TabsTrigger value="schemes">
              Schemes ({getCategoryCount("schemes")})
            </TabsTrigger>
            <TabsTrigger value="photos">
              Photos ({getCategoryCount("photos")})
            </TabsTrigger>
            <TabsTrigger value="other">
              Other ({getCategoryCount("other")})
            </TabsTrigger>
          </TabsList>

          {["all", "plans", "schemes", "photos", "other"].map((category) => {
            const categoryDocs = getDocumentsForCategory(category);

            return (
              <TabsContent key={category} value={category} className="mt-4">
                {categoryDocs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No {getCategoryLabel(category).toLowerCase()} found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-0.5">
                              {isImageFile(doc.filename) ? (
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {doc.filename || "Untitled Document"}
                              </p>
                              {doc.doc_type && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {doc.doc_type}
                                </p>
                              )}
                              {doc.upload_date && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(doc.upload_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 h-8 w-8"
                            onClick={() => handleDownload(doc)}
                            title="Download/View"
                          >
                            {isImageFile(doc.filename) ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
