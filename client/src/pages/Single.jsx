import React, { useContext, useEffect, useState } from "react";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import moment from "moment";
import axiosInstance from "../api";
import { AuthContext } from "../contexts/authContext";

const Single = () => {
  const [post, setPost] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const postId = location.pathname.split("/")[2];

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.log("Single post fetch error:", err);
      }
    };
    fetchData();
  }, [postId]);

  if (!post) return <p>Loading...</p>;

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/posts/${postId}`, {
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const username = post.username || "Unknown user";

  return (
    <div className="single">
      <div className="content">
        {post.img && (
          <img src={post.img} alt={post.title}/>
        )}

        <div className="user">
          {post.userImg && <img src={post.userImg} alt="" />}
          
          <div className="info">
            <span>{username}</span>

            <p>
              Created on:{" "}
              {post.created_at
                ? moment(post.created_at).format("MMM D, YYYY")
                : "Unknown"}
            </p>

            <br />

            <p>
              Last updated:{" "}
              {post.updated_at
                ? moment(post.updated_at).format("MMM D, YYYY")
                : "Unknown"}
            </p>
          </div>

          {currentUser?.username === post?.username && (
            <div className="edit">
              <Link to={`/Context?edit=${postId}`} state={post}>
                <img src={Edit} alt="" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="" />
            </div>
          )}
        </div>

        <h1>{post.title}</h1>

        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: post.description }}
        ></div>
      </div>

      <Menu cat={post.cat} currentPostId={post.id} />
    </div>
  );
};

export default Single;
