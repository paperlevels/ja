import { describe, it, expect, afterEach } from "vitest";
import { createAdminClient, cleanupTestLogline, uniqueTestContent } from "../helpers";

describe("Schema Constraints & Triggers", () => {
  const admin = createAdminClient();
  let testIds: string[] = [];

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestLogline(id);
    }
    testIds = [];
  });

  it("case 32: inserting 141 characters violates length constraint", async () => {
    const id = uniqueTestContent("toolong");
    const longContent = "a".repeat(141);

    const { error } = await admin
      .schema("public")
      .from("loglines")
      .insert({ id, content: longContent, share_count: 0 });

    expect(error).not.toBeNull();
  });

  it("case 33: updated_at changes on update via trigger", async () => {
    const id = uniqueTestContent("trigger");
    testIds.push(id);

    const { data: insertData, error: insertError } = await admin
      .schema("public")
      .from("loglines")
      .insert({ id, content: id, share_count: 0 })
      .select()
      .single();

    expect(insertError).toBeNull();
    const originalUpdatedAt = insertData!.updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise((r) => setTimeout(r, 100));

    const { data: updateData, error: updateError } = await admin
      .schema("public")
      .from("loglines")
      .update({ share_count: 99 })
      .eq("id", id)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updateData!.updated_at).not.toBe(originalUpdatedAt);
    expect(new Date(updateData!.updated_at).getTime()).toBeGreaterThan(
      new Date(originalUpdatedAt).getTime()
    );
  });

  it("case 34: deleting logline cascades to comments", async () => {
    const id = uniqueTestContent("cascade");
    testIds.push(id);

    await admin
      .schema("public")
      .from("loglines")
      .insert({ id, content: id, share_count: 0 });

    const { data: commentData } = await admin
      .schema("public")
      .from("comments")
      .insert({ logline_id: id, content: "cascade comment" })
      .select()
      .single();

    const commentId = commentData!.id;

    // Verify comment exists
    const { data: beforeDelete } = await admin
      .schema("public")
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single();

    expect(beforeDelete).not.toBeNull();

    // Delete logline
    await admin.schema("public").from("loglines").delete().eq("id", id);

    // Verify comment is gone
    const { data: afterDelete, error: afterError } = await admin
      .schema("public")
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .maybeSingle();

    expect(afterDelete).toBeNull();
  });
});
