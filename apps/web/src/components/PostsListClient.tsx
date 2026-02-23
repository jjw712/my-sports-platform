'use client';

import { apiGet, apiPost, apiDelete, apiPatch } from '@/lib/api';
import type { Post } from "@/lib/schemas";
import { PostsPageSchema, PostSchema } from "@/lib/schemas";
import LikeDislikeButtons from "./LikeDislikeButtons";
import { useEffect, useState } from "react";


import type { PostsPage } from "@/lib/schemas";

type Props = { initial: PostsPage };



export default function PostsListClient({ initial }: Props) {
  const [meKey, setMeKey] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setMeKey(localStorage.getItem("meKey"));
    read();
    const t = setTimeout(read, 300);
    return () => clearTimeout(t);
  }, []);

  const [items, setItems] = useState<Post[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<number | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);

  const [uiError, setUiError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  

 
  


  // Create
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
 
  console.log("PostsListClient rendered");
  


  function markDeleting(id: number, on: boolean) {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function isDeleting(id: number) {
    return deletingIds.has(id);
  }

  async function createPost() {
    if (creating) return;
    if (!title.trim() || !content.trim()) {
      setUiError('title/content required');
      return;
    }

    setCreating(true);
    setUiError(null);

    try {
      const newPost = await apiPost(
        '/api/posts',
        { title: title.trim(), content: content.trim() },
        PostSchema,
      );

      setItems((prev) => [newPost, ...prev]);
      setTitle('');
      setContent('');
    } catch (e) {
      setUiError(e instanceof Error ? e.message : 'create failed');
    } finally {
      setCreating(false);
    }
  }

  async function deletePost(id: number) {
    if (isDeleting(id)) return;
    if (!confirm('삭제?')) return;

    markDeleting(id, true);
    setUiError(null);

    try {
      await apiDelete(`/api/posts/${id}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setUiError(e instanceof Error ? e.message : 'delete failed');
    } finally {
      markDeleting(id, false);
    }
  }

  function startEdit(p: Post) {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditContent(p.content);
    setUiError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setUiError(null);
  }

  async function saveEdit(id: number) {
    if (updating) return;

    if (!editTitle.trim() || !editContent.trim()) {
      setUiError('title/content required');
      return;
    }

    setUpdating(true);
    setUiError(null);

    try {
      const updated = await apiPatch(
        `/api/posts/${id}`,
        { title: editTitle.trim(), content: editContent.trim() },
        PostSchema,
      );

      setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
      cancelEdit();
    } catch (e) {
      setUiError(e instanceof Error ? e.message : 'update failed');
    } finally {
      setUpdating(false);
    }
  }

  async function loadMore() {
    if (loading || nextCursor === null) return;

    setLoading(true);
    setUiError(null);

    try {
      const data = await apiGet(
        `/api/posts?take=20&cursor=${nextCursor}`,
        PostsPageSchema,
      );

      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const p of data.items) {
          if (!seen.has(p.id)) merged.push(p);
        }
        return merged;
      });

      setNextCursor(data.nextCursor);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : 'load failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Create Form */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="content"
            style={{ flex: 1, minHeight: 80 }}
          />
          <button onClick={createPost} disabled={creating} style={{ height: 40 }}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </section>

      {/* One error place */}
      {uiError && <p style={{ color: 'crimson' }}>{uiError}</p>}

      {/* List */}
      <ul>
        {items.map((p) => {
          console.log("meKey=", meKey, "authorKey=", p.authorKey);

          const isEditing = editingId === p.id;
          const del = isDeleting(p.id);
          const canEdit = !!meKey && p.authorKey === meKey; 

          return (
            <li key={p.id} style={{ borderBottom: '1px solid #333', padding: '10px 0' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <b>{p.title}</b> - {p.content}
                  </div>
                  <LikeDislikeButtons postId={p.id} 
                  initialLike={p.likeCount} 
                  initialDislike={p.dislikeCount} 
                  />

 {canEdit && (
  <>
                  <button 
                  onClick={() => startEdit(p)} 
                  disabled={del || creating || updating}>
                    Edit
                  </button>

                  <button
                    onClick={() => deletePost(p.id)}
                    disabled={del || creating || updating}
                    style={{ opacity: del ? 0.6 : 1, whiteSpace: 'nowrap' }}
                  >
                    {del ? 'Deleting...' : 'Delete'}
                  </button>
                  </>
 )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ flex: 1, minHeight: 70 }}
                    />
                    {canEdit && (
  <>
                    <button onClick={() => saveEdit(p.id)} disabled={updating} style={{ height: 40 }}>
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={cancelEdit} disabled={updating} style={{ height: 40 }}>
                      Cancel
                    </button>
                     </>
 )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {nextCursor !== null ? (
        <button onClick={loadMore} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      ) : (
        <p style={{ marginTop: 16, opacity: 0.7 }}>No more posts</p>
      )}
    </>
  );
}
