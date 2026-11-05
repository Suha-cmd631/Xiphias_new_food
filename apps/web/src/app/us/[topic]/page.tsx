import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPage } from "@/components/market/topic-page";
import { loadTopicProducts, topicMetadata } from "@/lib/market-data";
import { topicBySlug } from "@/lib/market-topics";

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  return topic ? topicMetadata("us", topic) : { title: "Not found" };
}

export default async function UsTopicPage({ params }: Props) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const products = await loadTopicProducts("us", topic);
  return <TopicPage market="us" topic={topic} products={products} />;
}
