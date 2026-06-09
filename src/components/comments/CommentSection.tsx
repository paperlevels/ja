"use client";

import { useState } from "react";
import type { Comment } from "@/types/database";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  initialComments: Comment[];
  loglineId: string;
}

export function CommentSection({ initialComments, loglineId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <>
      <div className="mt-6">
        <CommentList comments={comments} />
      </div>
      <div className="mt-4">
        <CommentForm loglineId={loglineId} onSuccess={handleCommentAdded} />
      </div>
    </>
  );
}
