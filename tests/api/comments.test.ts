import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST as postComment } from "@/pages/api/comments";
import {
  invokeAPIRoute,
  uniqueTestContent,
  createAdminClient,
  cleanupTestLogline,
} from "../helpers";

describe("POST /api/comments", () => {
  let loglineId: string;

  beforeAll(async () => {
    const admin = createAdminClient();
    loglineId = uniqueTestContent("コメント用ログライン");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
    });
  });

  afterAll(async () => {
    await cleanupTestLogline(loglineId);
  });

  it("正常コメント - コメント保存 + loglines.comment_count が+1される", async () => {
    const admin = createAdminClient();
    const { data: before } = await admin
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    const beforeCount = before?.comment_count ?? 0;
    const commentContent = uniqueTestContent("正常コメント");

    const response = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({ loglineId, content: commentContent }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.comment.logline_id).toBe(loglineId);
    expect(json.comment.content).toBe(commentContent);

    const { data: after } = await admin
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    expect(after?.comment_count).toBe(beforeCount + 1);

    await admin.schema("public").from("comments").delete().eq("id", json.comment.id);
    await admin
      .schema("public")
      .from("loglines")
      .update({ comment_count: beforeCount })
      .eq("id", loglineId);
  });

  it("空コメント - 400エラー", async () => {
    const response = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({ loglineId, content: "" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("コメントは1〜10000文字で入力してください");
  });

  it("10001文字コメント - 400エラー", async () => {
    const longContent = "a".repeat(10001);
    const response = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({ loglineId, content: longContent }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("コメントは1〜10000文字で入力してください");
  });

  it("loglineId 未指定 - 400エラー", async () => {
    const response = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({ content: "テストコメント" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("ログラインIDが必要です");
  });

  it("存在しないloglineId - 500エラー（FK制約違反）", async () => {
    const response = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({
        loglineId: "nonexistent-logline-12345",
        content: "テストコメント",
      }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("コメント投稿に失敗しました");
  });
});
