"use client"

import { useEffect } from "react";
import useSWR from "swr";

async function getData() {
  const response = await fetch("/api/dashboard")
  return response.json()
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("data", getData)
  
  console.log({ data, error, isLoading })
  
  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div className="container p-0">
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  );
}