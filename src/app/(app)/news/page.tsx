"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InFeedAd } from "@/components/in-feed-ad";

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, "news"), where("status", "==", "Published"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNewsArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team News</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article, index) => (
          <React.Fragment key={article.id}>
            <Card className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Image
                src={article.imageUrl || "https://placehold.co/600x400.png"}
                alt={article.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={article.imageHint || "news article image"}
              />
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{article.excerpt || article.content?.substring(0, 100) + '...'}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/news/${article.id}`}>Read Full Article</Link>
                </Button>
              </CardFooter>
            </Card>
            {(index + 1) % 3 === 0 && <InFeedAd />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
