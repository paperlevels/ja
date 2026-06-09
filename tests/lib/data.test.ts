import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createAdminClient,
  cleanupTestLogline,
  uniqueTestContent,
} from "../helpers";
import { getLoglines, getLoglineById, getComments } from "@/lib/data";

describe("Data Layer", () => {
  const admin = createAdminClient();
  let testIds: string[] = [];

  afterAll(async () => {
    for (const id of testIds) {
      await cleanupTestLogline(id);
    }
  });

  it("case 21: sorts by share_count DESC (popular)", async () => {
    const id1 = uniqueTestContent("pop1");
    const id2 = uniqueTestContent("pop2");
    const id3 = uniqueTestContent("pop3");
    testIds.push(id1, id2, id3);

    await admin
      .schema("public")
      .from("loglines")
      .insert([
        { id: id1, content: id1, share_count: 10 },
        { id: id2, content: id2, share_count: 30 },
        { id: id3, content: id3, share_count: 20 },
      ]);

    const results = await getLoglines("popular");
    const ids = results.map((r) => r.id);

    // Expect descending by share_count: 30, 20, 10
    const idx1 = ids.indexOf(id1);
    const idx2 = ids.indexOf(id2);
    const idx3 = ids.indexOf(id3);
    expect(idx2).toBeLessThan(idx3);
    expect(idx3).toBeLessThan(idx1);
  });

  it("case 22: sorts by created_at DESC (newest)", async () => {
    const id1 = uniqueTestContent("new1");
    const id2 = uniqueTestContent("new2");
    testIds.push(id1, id2);

    await admin
      .schema("public")
      .from("loglines")
      .insert([
        { id: id1, content: id1, share_count: 0 },
      ]);

    // Small delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 100));

    await admin
      .schema("public")
      .from("loglines")
      .insert([
        { id: id2, content: id2, share_count: 0 },
      ]);

    const results = await getLoglines("newest");
    const ids = results.map((r) => r.id);

    const idx1 = ids.indexOf(id1);
    const idx2 = ids.indexOf(id2);
    expect(idx2).toBeLessThan(idx1);
  });

  it("case 23: search returns matching records (partial match)", async () => {
    const content = uniqueTestContent("searchable");
    const id = content;
    testIds.push(id);

    await admin
      .schema("public")
      .from("loglines")
      .insert({ id, content, share_count: 0 });

    const searchTerm = content.substring(5, 15);
    const results = await getLoglines("popular", searchTerm);
    const found = results.find((r) => r.id === id);
    expect(found).toBeDefined();
    expect(found?.content).toBe(content);
  });

  it("case 24: search returns empty array when no match", async () => {
    const results = await getLoglines("popular", "__no_such_content_" + Date.now());
    expect(results).toEqual([]);
  });

  it("case 25: getLoglineById returns null for non-existent id", async () => {
    const result = await getLoglineById("__nonexistent_" + Date.now());
    expect(result).toBeNull();
  });

  it("case 26: getComments returns comments ordered by created_at ASC", async () => {
    const loglineId = uniqueTestContent("comments");
    testIds.push(loglineId);

    await admin
      .schema("public")
      .from("loglines")
      .insert({ id: loglineId, content: loglineId, share_count: 0 });

    const commentsData = [
      { logline_id: loglineId, content: "first" },
      { logline_id: loglineId, content: "second" },
      { logline_id: loglineId, content: "third" },
    ];

    for (const c of commentsData) {
      await admin.schema("public").from("comments").insert(c);
      await new Promise((r) => setTimeout(r, 50));
    }

    const results = await getComments(loglineId);
    expect(results.length).toBeGreaterThanOrEqual(3);

    const contents = results.map((r) => r.content);
    const firstIdx = contents.indexOf("first");
    const secondIdx = contents.indexOf("second");
    const thirdIdx = contents.indexOf("third");

    expect(firstIdx).toBeLessThan(secondIdx);
    expect(secondIdx).toBeLessThan(thirdIdx);
  });
});
