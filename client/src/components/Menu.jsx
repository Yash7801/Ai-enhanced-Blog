import axiosInstance from '../api';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

export const Menu = ({ cat, currentPostId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/?cat=${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log("Menu fetch error:", err);
      }
    };
    fetchData();
  }, [cat]);

  // Remove current post
  const filteredPosts = posts.filter(p => p.id !== currentPostId);

  return (
    <div className='menu'>
      <h1>Other posts you may like</h1>

      {filteredPosts.map((post) => (
        <div className='post' key={post.id}>
          
          {/* SAFER IMAGE */}
          {post.img ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/upload/${post.img}`}
              alt={post.title}
            />
          ) : (
            <img
              src="https://placehold.co/600x400?text=No+Image"
              alt="No image"
            />
          )}

          <h2>{post.title}</h2>

          <Link className="link" to={`/post/${post.id}`}>
            <button>Read More</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Menu;
