"use client";

import Image from "next/image";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (params.id) {
      const articleDoc = doc(db, "news", params.id);
      const unsubscribe = onSnapshot(articleDoc, (doc) => {
        if (doc.exists()) {
          setArticle({ id: doc.id, ...doc.data() });
        } else {
          // Handle article not found
          setArticle(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [params.id]);

  if (loading) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
            </div>
        </div>
      )
  }

  if (!article) {
    return <div className="text-center">Article not found.</div>;
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{article.title}</h1>
        <div className="flex items-center space-x-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.authorAvatar || "https://placehold.co/40x40.png"} alt={article.author} data-ai-hint="person portrait" />
              <AvatarFallback>{article.author?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{article.author}</span>
          </div>
          <span>•</span>
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8 shadow-lg">
        <Image
          src={article.imageUrl || "https://placehold.co/1200x600.png"}
          alt={article.title}
          layout="fill"
          objectFit="cover"
          data-ai-hint={article.imageHint || "stadium celebration"}
        />
      </div>
      <div
        className="prose prose-lg dark:prose-invert max-w-none space-y-4"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      {article.tags && <div className="mt-8">
        {article.tags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="mr-2">
            {tag}
          </Badge>
        ))}
      </div>}
    </article>
  );
}
