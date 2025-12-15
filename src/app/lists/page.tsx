"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { fetchAssetLists } from "@/lib/api";

export default function ListsPage() {
  const [lists, setLists] = useState<{ item_name: string; total_quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAssetLists();
        setLists(data);
        setError("");
      } catch (error) {
        setError("Failed to load asset lists.");
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Asset Lists</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {lists.map((item) => (
              <li
                key={item.item_name}
                className="flex justify-between items-center py-4 cursor-pointer hover:bg-gray-50 px-2 rounded"
                onClick={() => router.push(`/lists/${encodeURIComponent(item.item_name)}`)}
              >
                <span className="font-medium">{item.item_name}</span>
                <span className="text-gray-600">Total: {item.total_quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
} 