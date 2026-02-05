"use client";
import { useParams } from "next/navigation";

export default function LegacyHistoryRedirect() {
  const { id } = useParams<{ id: string }>();
  if (typeof window !== "undefined") {
    window.location.href = `/history/dot-probe/${id}`;
  }
  return null;
}
