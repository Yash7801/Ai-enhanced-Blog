import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api';

const Home = () => {
  const [posts, setPosts] = useState([]);

  const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log("Home fetch error:", err);
      }
    };
    fetchData();
  }, [cat]);

  return (
    <div className='home'>
      <div className="posts">
        {posts.map(post => (
          <div className="post" key={post.id}>
            
            {/* IMAGE FIX */}
            <div className="img">
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
            </div>

            <div className="content">
              <Link className='link' to={`/post/${post.id}`}>
                <h1>{post.title}</h1>
              </Link>

              {/* SAFE DESCRIPTION */}
              <p>
                {(post.description || "")
                  .replace(/<[^>]+>/g, "")
                  .slice(0, 150)
                }...
              </p>

              <Link className='link' to={`/post/${post.id}`}>
                <button>Read More</button>
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
