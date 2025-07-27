
"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Newspaper, Calendar, ShoppingCart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const carouselItems = [
  { 
    src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55", 
    alt: "Players on the field", 
    hint: "football players",
    description: "Your ultimate destination for team news, scores, and exclusive merchandise.",
    buttonText: "View Schedule",
    buttonLink: "/schedule"
  },
  { 
    src: "https://images.unsplash.com/photo-1434648957308-5e6a859697e8", 
    alt: "Stadium lights", 
    hint: "stadium lights",
    description: "Get the latest match reports, player interviews, and club announcements.",
    buttonText: "Read News",
    buttonLink: "/news"
  },
  { 
    src: "https://images.unsplash.com/photo-1517747614396-d21a78b850e8", 
    alt: "Football on grass", 
    hint: "football grass",
    description: "Meet the players, view detailed stats, and follow your favorite stars.",
    buttonText: "Explore Roster",
    buttonLink: "/roster"
  },
  { 
    src: "https://plus.unsplash.com/premium_photo-1723852833346-ac8e405d6488",
    alt: "Football on a field", 
    hint: "football field",
    description: "Check the latest league table and track the team's progress.",
    buttonText: "View Standings",
    buttonLink: "/standings"
  },
  { 
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377", 
    alt: "Soccer ball in a net", 
    hint: "soccer goal",
    description: "Get the official team kits and merchandise from our store.",
    buttonText: "Shop Now",
    buttonLink: "/store"
  }
];


export default function HomePage() {
  const [latestNews, setLatestNews] = React.useState<any>(null);
  const [upcomingMatch, setUpcomingMatch] = React.useState<any>(null);
  const [featuredProduct, setFeaturedProduct] = React.useState<any>(null);

  React.useEffect(() => {
    // Fetch latest news
    const newsQuery = query(collection(db, "news"), where("status", "==", "Published"));
    const unsubNews = onSnapshot(newsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date on the client side to find the latest
        articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLatestNews(articles[0]);
      }
    });

    // Fetch upcoming match
    const matchQuery = query(collection(db, "matches"), where("status", "==", "Upcoming"));
    const unsubMatch = onSnapshot(matchQuery, (snapshot) => {
        if (!snapshot.empty) {
            const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by date on the client side
            matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setUpcomingMatch(matches[0]);
        }
    });

    // Fetch featured product
    const productQuery = query(collection(db, "products"), limit(1));
    const unsubProduct = onSnapshot(productQuery, (snapshot) => {
        if (!snapshot.empty) {
            setFeaturedProduct({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
    });

    return () => {
      unsubNews();
      unsubMatch();
      unsubProduct();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
       <section className="w-full rounded-lg overflow-hidden">
        <Carousel
          className="w-full"
          plugins={[
            Autoplay({
              delay: 7000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={index} className="relative w-full h-[50vh] md:h-[70vh]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  layout="fill"
                  objectFit="cover"
                  className="z-0"
                  data-ai-hint={item.hint}
                  priority={index === 0}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 z-10">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Welcome to CHM</h1>
                    <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
                        {item.description}
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href={item.buttonLink}>{item.buttonText} <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Newspaper /> Latest News</CardTitle>
            <CardDescription>Stay updated with the latest club announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestNews ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Image src={latestNews.imageUrl || "https://placehold.co/80x80.png"} alt={latestNews.title} width={80} height={80} className="rounded-md" data-ai-hint="player celebrating" />
                  <div>
                    <h3 className="font-semibold">{latestNews.title}</h3>
                    <p className="text-sm text-muted-foreground">{latestNews.excerpt || latestNews.content.substring(0,50)}...</p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/news/${latestNews.id}`}>Read More <ArrowRight className="ml-2" /></Link>
                </Button>
              </div>
            ) : (
                <p className="text-muted-foreground">No recent news.</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar /> Upcoming Match</CardTitle>
            <CardDescription>Don't miss the next big game.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {upcomingMatch ? (
                <>
                    <div className="flex justify-around items-center">
                        <div className="flex flex-col items-center gap-2">
                            <Image src={upcomingMatch.chmLogo || "https://placehold.co/64x64.png"} alt="Club Logo" width={64} height={64} data-ai-hint="team logo" />
                            <span className="font-semibold">CHM FC</span>
                        </div>
                        <span className="text-2xl font-bold">VS</span>
                        <div className="flex flex-col items-center gap-2">
                            <Image src={upcomingMatch.opponentLogo || "https://placehold.co/64x64.png"} alt={`${upcomingMatch.opponent} Logo`} width={64} height={64} data-ai-hint="sports logo" />
                            <span className="font-semibold">{upcomingMatch.opponent}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-4">{new Date(upcomingMatch.date).toLocaleDateString('en-US', { weekday: 'long' })}, {upcomingMatch.time}</p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/schedule">View Full Schedule <ArrowRight className="ml-2" /></Link>
                    </Button>
                </>
            ) : (
                 <p className="text-muted-foreground">No upcoming matches scheduled.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart /> Team Store</CardTitle>
            <CardDescription>Get the latest official kits and merchandise.</CardDescription>
          </CardHeader>
          <CardContent>
            {featuredProduct ? (
                <>
                    <div className="flex items-center gap-4">
                        <Image src={featuredProduct.imageUrl || "https://placehold.co/100x100.png"} alt={featuredProduct.name} width={100} height={100} className="rounded-md" data-ai-hint="soccer jersey"/>
                        <div>
                            <h3 className="font-semibold">{featuredProduct.name}</h3>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full">
                    <Link href="/store">Kit showcase <ArrowRight className="ml-2" /></Link>
                    </Button>
                </>
            ) : (
                <p className="text-muted-foreground">Store is currently empty.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
