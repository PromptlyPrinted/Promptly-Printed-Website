'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card } from "@repo/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Button } from "@repo/design-system/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { formatDistance } from "date-fns";
import { useState, useEffect } from "react";
import type { Log } from "@prisma/client";

async function getLogs() {
  const response = await fetch('/api/admin/logs');
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
}

export default function LogsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");

  const { data: logs = [], error } = useSWR<Log[]>('/api/admin/logs', getLogs);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return null;
  }

  // Client-side filtering
  const filteredLogs = logs.filter((log) => {
    if (level !== "all" && log.level !== level) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && 
        !log.level.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        {process.env.NEXT_PUBLIC_BETTERSTACK_API_KEY && (
          <Button
            variant="outline"
            onClick={() => window.open("https://logs.betterstack.com", "_blank")}
          >
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            View in BetterStack
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="p-4 flex gap-4">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Metadata</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      log.level === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {log.level}
                  </span>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(log.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 