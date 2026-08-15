import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BookOpen, MessageSquare, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: BookOpen, title: "Smart Journaling", desc: "Log what you learn with tags, difficulty, and study hours." },
  { icon: MessageSquare, title: "AI Q&A", desc: "Ask questions answered from your own notes via RAG." },
  { icon: BarChart3, title: "Analytics", desc: "Track streaks, topics, and study patterns over time." },
  { icon: Zap, title: "Instant Recall", desc: "Vector search finds the most relevant entries instantly." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          SmartLog
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered learning journal
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Write what you learn.
            <span className="block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Ask your notes anything.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            SmartLog combines structured journaling with retrieval-augmented AI so you never forget what you studied.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="glow">
              <Link to="/signup">
                Start for free <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              <Card className="h-full border-border/60 transition-colors hover:border-primary/30">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
