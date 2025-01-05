"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/design-system/components/ui/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { TableCell, TableRow } from "@repo/design-system/components/ui/table";
import AuthorForm from "./AuthorForm";
import type { Author } from "./BlogAuthors";

interface AuthorRowProps {
  author: Author;
  onSave: (author: Author) => void;
  onDelete: (id: string) => void;
}

export default function AuthorRow({ author, onSave, onDelete }: AuthorRowProps) {
  return (
    <TableRow>
      {/* Avatar */}
      <TableCell>
        {author.avatar && (
          <img
            src={author.avatar}
            alt={author.title}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </TableCell>

      {/* Name */}
      <TableCell>{author.title}</TableCell>

      {/* X Profile */}
      <TableCell>
        {author.xUrl ? (
          <a
            href={author.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {author.xUrl}
          </a>
        ) : (
          "N/A"
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex gap-2">
          {/* Edit dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Author</DialogTitle>
              </DialogHeader>
              <AuthorForm author={author} onSave={onSave} />
            </DialogContent>
          </Dialog>

          {/* Delete button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(author.id)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
} 