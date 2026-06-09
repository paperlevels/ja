import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createAdminClient,
  createAnonClient,
  createTestUser,
  deleteTestUser,
  cleanupTestLogline,
  uniqueTestContent,
} from "../helpers";

describe("RLS Policies", () => {
  const admin = createAdminClient();
  let testUserId: string;
  let signedInClient: ReturnType<typeof createAnonClient>;
  let testLoglineId: string;
  let testCommentId: string;

  beforeAll(async () => {
    const email = `rls_test_${Date.now()}@example.com`;
    const password = "password123";
    const user = await createTestUser(email, password);
    testUserId = user.id;

    signedInClient = createAnonClient();
    const { error } = await signedInClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
  });

  afterAll(async () => {
    if (testLoglineId) {
      await cleanupTestLogline(testLoglineId);
    }
    if (testUserId) {
      await deleteTestUser(testUserId);
    }
  });

  it("case 27: anonymous SELECT is allowed on loglines and comments", async () => {
    const anon = createAnonClient();
    const { data: loglines, error: loglinesError } = await anon
      .schema("public")
      .from("loglines")
      .select("*")
      .limit(1);

    expect(loglinesError).toBeNull();
    expect(Array.isArray(loglines)).toBe(true);

    const { data: comments, error: commentsError } = await anon
      .schema("public")
      .from("comments")
      .select("*")
      .limit(1);

    expect(commentsError).toBeNull();
    expect(Array.isArray(comments)).toBe(true);
  });

  it("case 28: anonymous INSERT is allowed", async () => {
    const anon = createAnonClient();
    testLoglineId = uniqueTestContent("rls_insert");

    const { data, error } = await anon
      .schema("public")
      .from("loglines")
      .insert({ id: testLoglineId, content: testLoglineId, share_count: 0 })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.id).toBe(testLoglineId);

    // Also insert a comment for later delete tests
    const { data: commentData, error: commentError } = await anon
      .schema("public")
      .from("comments")
      .insert({ logline_id: testLoglineId, content: "comment for rls" })
      .select()
      .single();

    expect(commentError).toBeNull();
    expect(commentData).not.toBeNull();
    testCommentId = commentData!.id;
  });

  it("case 29: anonymous UPDATE is denied on loglines", async () => {
    const anon = createAnonClient();
    const { data, error } = await anon
      .schema("public")
      .from("loglines")
      .update({ share_count: 999 })
      .eq("id", testLoglineId)
      .select();

    // RLS denies silently: no error but empty data
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("case 30: anonymous DELETE is denied on loglines and comments", async () => {
    const anon = createAnonClient();
    const { data: loglineData, error: loglineError } = await anon
      .schema("public")
      .from("loglines")
      .delete()
      .eq("id", testLoglineId)
      .select();

    expect(loglineError).toBeNull();
    expect(loglineData).toHaveLength(0);

    const { data: commentData, error: commentError } = await anon
      .schema("public")
      .from("comments")
      .delete()
      .eq("id", testCommentId)
      .select();

    expect(commentError).toBeNull();
    expect(commentData).toHaveLength(0);
  });

  it("case 31: authenticated user can UPDATE loglines and DELETE loglines/comments", async () => {
    // UPDATE logline
    const { data: updateData, error: updateError } = await signedInClient
      .schema("public")
      .from("loglines")
      .update({ share_count: 42 })
      .eq("id", testLoglineId)
      .select();

    expect(updateError).toBeNull();
    expect(updateData).not.toHaveLength(0);
    expect(updateData![0].share_count).toBe(42);

    // DELETE comment
    const { data: delCommentData, error: delCommentError } = await signedInClient
      .schema("public")
      .from("comments")
      .delete()
      .eq("id", testCommentId)
      .select();

    expect(delCommentError).toBeNull();
    expect(delCommentData).not.toHaveLength(0);

    // DELETE logline
    const { data: delLoglineData, error: delLoglineError } = await signedInClient
      .schema("public")
      .from("loglines")
      .delete()
      .eq("id", testLoglineId)
      .select();

    expect(delLoglineError).toBeNull();
    expect(delLoglineData).not.toHaveLength(0);

    // Mark as cleaned up so afterAll doesn't try again
    testLoglineId = "";
    testCommentId = "";
  });
});
