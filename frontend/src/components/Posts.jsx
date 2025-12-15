import React, { useState } from "react";
import { Image, X, ThumbsDown, ThumbsUp, CircleUserRound } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

import convertDate from "../utils/DateConversion";
const Posts = ({ postId, post, getPosts }) => {
  const [likecount, setlikcount] = useState(post.likes_count);
  const [disLikecount, setDisLikcount] = useState(post.dislikes_count);
  const [userReaction, setUserReaction] = useState(() => post.user_reaction || "none");
  const readabledate = convertDate(post.created_at);

  const [like, setlike] = useState("none");

  const handlePostDelete = async () => {
    try {
      const response = await axiosInstance.delete(`posts/${postId}/`);
      // refresh posts after delete
      if (typeof getPosts === "function") await getPosts();
    } catch (error) {
      console.log(error?.response ?? error);
    }
  };

  const handleRaction = async (data) => {
    try {
      const response = await axiosInstance.post(`posts/${postId}/toggle-like/`, { action: data });
      const reaction = response.data.reaction;
      if (reaction === "like") {
        if (userReaction === "none") {
          setlikcount((p) => p + 1);
          setUserReaction("like");
        } else {
          setDisLikcount((p) => Math.max(0, p - 1));
          setlikcount((p) => p + 1);
          setUserReaction("like");
        }
      } else if (reaction === "dislike") {
        if (userReaction === "none") {
          setDisLikcount((p) => p + 1);
          setUserReaction("dislike");
        } else {
          setlikcount((p) => Math.max(0, p - 1));
          setDisLikcount((p) => p + 1);
          setUserReaction("dislike");
        }
      } else {
        // reaction === 'none'
        if (userReaction === "dislike") {
          setDisLikcount((p) => Math.max(0, p - 1));
          setUserReaction("none");
        } else {
          setlikcount((p) => Math.max(0, p - 1));
          setUserReaction("none");
        }
      }
    } catch (error) {
      console.log(error?.response ?? error);
    }
  };

  return (
    <>
      <div className="w-full sm:w-[70%] mb-5 rounded-xl p-5 bg-gray-50 ">
        <div className="relative flex items-start w-full gap-3">
          {/* Avatar wrapper: fixed square, rounded-full, overflow-hidden */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {!post.user_profile_picture ? (
              <CircleUserRound color="#151414" size={36} strokeWidth={1.7} absoluteStrokeWidth />
            ) : (
              <img
                src={post.user_profile_picture}
                alt={`${post.user_name ?? "avatar"}`}
                className="w-full h-full object-cover block"
              />
            )}
          </div>

          <div className="flex-1">
            <p className="mr-2.5">{post.description}</p>
            <p className="text-sm">Posted on - {readabledate}</p>
          </div>

          <X onClick={handlePostDelete} className="cursor-pointer absolute top-0 right-0" size={18} />
        </div>

        <div className="mt-4">
          <img src={post?.image} alt="" className="object-cover max-h-[300px] rounded w-full" />
        </div>

        <div className="mt-4 flex max-w-[200px] justify-between">
          <div className={`flex items-center ${userReaction === "like" ? "text-blue-600" : ""}`}>
            <ThumbsUp
              onClick={() => {
                handleRaction("like");
              }}
              className={`mr-1 cursor-pointer`}
              color="#063b74"
            />
            <p className={`p-1 ${userReaction === "like" ? "text-blue-500" : ""}`}>{`Like ${likecount}`}</p>
          </div>
          <div className={`flex items-center ${userReaction === "dislike" ? "text-blue-600" : ""}`}>
            <ThumbsDown
              onClick={() => {
                handleRaction("dislike");
              }}
              className="mr-1 cursor-pointer"
              color="#063b74"
            />
            <p className={`p-1 ${userReaction === "dislike" ? "text-blue-500" : ""}`}>{`Dislike ${disLikecount}`}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
