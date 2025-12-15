"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { Asset } from "@/types";

export default function ItemAssetsPage() {
  const params = useParams();
  const itemName = decodeURIComponent(params.item as string);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/assets/by-name?item_name=${encodeURIComponent(itemName)}`);
        if (!res.ok) throw new Error("Failed to fetch assets");
        const data = await res.json();
        setAssets(data);
        setError("");
      } catch (error) {
        setError("Failed to load assets.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAssets();
  }, [itemName]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{itemName} Assets</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Inventory #</th>
                  <th className="px-4 py-2 border">Room</th>
                  <th className="px-4 py-2 border">Floor</th>
                  <th className="px-4 py-2 border">Building</th>
                  <th className="px-4 py-2 border">Year</th>
                  <th className="px-4 py-2 border">Origin</th>
                  <th className="px-4 py-2 border">Remarks</th>
                  <th className="px-4 py-2 border">Edit</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-4 py-2 border">{asset.inventory_number}</td>
                    <td className="px-4 py-2 border">{asset.room_number}</td>
                    <td className="px-4 py-2 border">{asset.floor_number}</td>
                    <td className="px-4 py-2 border">{asset.building_block}</td>
                    <td className="px-4 py-2 border">{asset.year_of_purchase}</td>
                    <td className="px-4 py-2 border">{asset.department_origin}</td>
                    <td className="px-4 py-2 border">{asset.remarks}</td>
                    <td className="px-4 py-2 border">
                      {/* Add your edit button/modal here */}
                      <button className="text-blue-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 