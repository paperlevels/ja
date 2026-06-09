"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types/database";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  initialComments: Comment[];
  loglineId: string;
}

export function CommentSection({ initialComments, loglineId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
    setHighlightId(newComment.id);
  };

  return (
    <>
      <div className="mt-6">
        <CommentList comments={comments} highlightId={highlightId} />
      </div>
      <div className="mt-4">
        <CommentForm loglineId={loglineId} onSuccess={handleCommentAdded} />
      </div>
    </>
  );
}
