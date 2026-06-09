import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST as deleteLogline } from "@/pages/api/admin/delete-logline";
import { POST as deleteComment } from "@/pages/api/admin/delete-comment";
import { POST as updateCategory } from "@/pages/api/admin/update-category";
import { POST as postComment } from "@/pages/api/comments";
import {
  invokeAPIRoute,
  uniqueTestContent,
  createTestUser,
  deleteTestUser,
  getAuthCookies,
  createAdminClient,
  cleanupTestLogline,
} from "../helpers";

describe("POST /api/admin/*", () => {
  let testUserId: string;
  let authCookies: Record<string, string>;

  beforeAll(async () => {
    const user = await createTestUser("test-admin@example.com", "testpassword123");
    testUserId = user.id;
    authCookies = await getAuthCookies("test-admin@example.com", "testpassword123");
  });

  afterAll(async () => {
    await deleteTestUser(testUserId);
  });

  it("未認証で削除 - 401エラー、レコードが残る", async () => {
    const admin = createAdminClient();
    const loglineId = uniqueTestContent("未認証削除");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
    });

    const response = await invokeAPIRoute(deleteLogline, {
      method: "POST",
      body: JSON.stringify({ id: loglineId }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("認証が必要です");

    const { data: remaining } = await admin
      .schema("public")
      .from("loglines")
      .select("id")
      .eq("id", loglineId)
      .single();

    expect(remaining).not.toBeNull();

    await cleanupTestLogline(loglineId);
  });

  it("未認証でカテゴリ更新 - 401エラー", async () => {
    const response = await invokeAPIRoute(updateCategory, {
      method: "POST",
      body: JSON.stringify({ id: "some-id", category: "test" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("認証が必要です");
  });

  it("認証後の削除 - 200、レコードが消える", async () => {
    const admin = createAdminClient();
    const loglineId = uniqueTestContent("認証後削除");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
    });

    const response = await invokeAPIRoute(deleteLogline, {
      method: "POST",
      body: JSON.stringify({ id: loglineId }),
      headers: { "Content-Type": "application/json" },
      cookies: authCookies,
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    const { data: deleted } = await admin
      .schema("public")
      .from("loglines")
      .select("id")
      .eq("id", loglineId)
      .single();

    expect(deleted).toBeNull();
  });

  it("認証後のコメント削除 - loglineId を指定して削除、comment_count が-1される（0未満にならない）", async () => {
    const admin = createAdminClient();
    const loglineId = uniqueTestContent("コメント削除");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
    });

    const commentContent = uniqueTestContent("削除対象コメント");
    const commentResponse = await invokeAPIRoute(postComment, {
      method: "POST",
      body: JSON.stringify({ loglineId, content: commentContent }),
      headers: { "Content-Type": "application/json" },
    });

    expect(commentResponse.status).toBe(200);
    const commentJson = await commentResponse.json();
    const commentId = commentJson.comment.id;

    const { data: afterInsert } = await admin
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    expect(afterInsert?.comment_count).toBe(1);

    const deleteResponse = await invokeAPIRoute(deleteComment, {
      method: "POST",
      body: JSON.stringify({ id: commentId, loglineId }),
      headers: { "Content-Type": "application/json" },
      cookies: authCookies,
    });

    expect(deleteResponse.status).toBe(200);
    const deleteJson = await deleteResponse.json();
    expect(deleteJson.success).toBe(true);

    const { data: afterDelete } = await admin
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    expect(afterDelete?.comment_count).toBe(0);

    await cleanupTestLogline(loglineId);
  });

  it("認証後のカテゴリ更新 - category が更新される", async () => {
    const admin = createAdminClient();
    const loglineId = uniqueTestContent("カテゴリ更新");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
      category: null,
    });

    const response = await invokeAPIRoute(updateCategory, {
      method: "POST",
      body: JSON.stringify({ id: loglineId, category: "novel" }),
      headers: { "Content-Type": "application/json" },
      cookies: authCookies,
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    const { data: updated } = await admin
      .schema("public")
      .from("loglines")
      .select("category")
      .eq("id", loglineId)
      .single();

    expect(updated?.category).toBe("novel");

    await cleanupTestLogline(loglineId);
  });

  it("空カテゴリ更新 - category が空/空白の場合、null で更新される", async () => {
    const admin = createAdminClient();
    const loglineId = uniqueTestContent("空カテゴリ更新");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
      category: "novel",
    });

    const response = await invokeAPIRoute(updateCategory, {
      method: "POST",
      body: JSON.stringify({ id: loglineId, category: "   " }),
      headers: { "Content-Type": "application/json" },
      cookies: authCookies,
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    const { data: updated } = await admin
      .schema("public")
      .from("loglines")
      .select("category")
      .eq("id", loglineId)
      .single();

    expect(updated?.category).toBeNull();

    await cleanupTestLogline(loglineId);
  });
});
