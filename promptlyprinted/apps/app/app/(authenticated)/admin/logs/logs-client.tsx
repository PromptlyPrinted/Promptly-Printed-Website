'use client';

import type { Log } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { formatDistance } from 'date-fns';
import { ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';

interface LogsClientProps {
  initialLogs: Log[];
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');

  // Client-side filtering
  const filteredLogs = logs.filter((log) => {
    if (level && log.level !== level) return false;
    if (
      search &&
      !log.message.toLowerCase().includes(search.toLowerCase()) &&
      !log.level.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">System Logs</h1>
        {process.env.NEXT_PUBLIC_BETTERSTACK_API_KEY && (
          <Button
            variant="outline"
            onClick={() =>
              window.open('https://logs.betterstack.com', '_blank')
            }
          >
            <ExternalLinkIcon className="mr-2 h-4 w-4" />
            View in BetterStack
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex gap-4 p-4">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
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
                    className={`rounded-full px-2 py-1 text-xs ${
                      log.level === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.level}
                  </span>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <pre className="whitespace-pre-wrap text-xs">
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
