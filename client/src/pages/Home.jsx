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
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  return (
    <div className='home'>
      <div className="posts">
        {posts.map(post => (
          <div className="post" key={post.id}>
            
            <div className="img">
              <img src={`https://axelblaze-api.onrender.com/upload/${image}`}/>
            </div>

            <div className="content">
              <Link className='link' to={`/post/${post.id}`}>
                <h1>{post.title}</h1>
              </Link>

              {/* Teaser preview */}
              <p>
                {post.description
                  ?.replace(/<[^>]+>/g, "")     // remove HTML tags
                  .slice(0, 150)                // limit teaser
                }...
              </p>

              {/* Working Read More Button */}
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
