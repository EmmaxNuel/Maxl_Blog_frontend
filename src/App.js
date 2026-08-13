import React, { useState, useEffect } from 'react';

const API_URL = '/api/posts/';

const formatDate = (value) => {
  if (!value) return 'No date';

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError('Failed to connect to the backend API. Make sure the Django server is running.');
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const addPost = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to create post');
      }

      const data = await res.json();
      setPosts((currentPosts) => [data, ...currentPosts]);
      setTitle('');
      setContent('');
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to create post');
    }
  };

  const deletePost = async (id) => {
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Unable to delete post');
      }

      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to delete post');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h1>Blog</h1>
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f6f8fa', borderRadius: '8px' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Post content"
          rows={3}
          style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
        />
        <button
          onClick={addPost}
          style={{ padding: '8px 16px', background: '#0f3460', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Create Post
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {posts.length === 0 && !error ? (
        <p style={{ color: '#666' }}>No posts yet. Create the first one.</p>
      ) : null}

      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small style={{ color: '#888' }}>{formatDate(post.created_at)}</small>
          <button
            onClick={() => deletePost(post.id)}
            style={{ marginLeft: '12px', background: '#cb2431', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
