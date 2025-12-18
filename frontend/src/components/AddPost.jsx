import React, { useState, useEffect } from "react";
import { Image, X } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const AddPost = ({ getposts,post }) => {
  const [imageUrl, setImageUrl] = useState(null); // preview URL
  const [image, setImage] = useState(null); // actual File
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG files are allowed!");
      e.target.value = "";
      return;
    }

    // Optionally check size here (e.g., max 5MB)
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Image must be <= ${MAX_MB} MB`);
      e.target.value = "";
      return;
    }

    // revoke previous preview if any
    if (imageUrl) URL.revokeObjectURL(imageUrl);

    const preview = URL.createObjectURL(file);
    setImage(file);
    setImageUrl(preview);
    e.target.value = ""; // allow same file re-selection later
  };

  const removeImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImage(null);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      alert("Add Image or Text");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // field names must match what your backend expects
      formData.append("description", text.trim());

      // append file only if exists; backend expects `image` by default here
      if (image) {
        formData.append("image", image);
        // if backend expects 'age' or some other key, use that key instead:
        // formData.append("age", image)
      }

      // DO NOT set Content-Type manually; let the browser/axios add the boundary
      const response = await axiosInstance.post("/posts/", formData);

      // Accept 201 Created or 200 OK depending on your backend
      if (response.status === 201 || response.status === 200) {
        alert("Post created");
        // cleanup
        removeImage();
        setText("");
        getposts()
      } else {
        console.warn("Unexpected response", response);
        alert("Unexpected server response");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // try to show server message if available
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data ||
        err?.message ||
        "Upload failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full sm:w-[70%] mb-5 mt-2 rounded-xl p-5 bg-gray-50" onSubmit={handlePost}>
      <div className="flex items-center w-full font-bold text-2xl">Add Post</div>

      <div className="w-full p-5 border rounded bg-blue-50 border-blue-300 mt-3">
        <div className="mb-2 ">
          <textarea
            className="
              w-full p-3 rounded 
              bg-blue-50 
              border-0 
              focus:outline-none focus:ring-0 focus:border-0 
              resize-none
              overflow-hidden
            "
            rows={3}
            placeholder="Write your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="relative mt-2 w-full overflow-hidden rounded">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="preview"
                className="w-full max-h-[300px] object-cover bg-white rounded"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-50 rounded-full p-1 cursor-pointer shadow"
                aria-label="remove image"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            // fallback: show post?.image if provided
            post?.image && (
              <img
                src={post.image}
                alt="post default"
                className="w-full max-h-[300px] object-contain bg-white rounded"
              />
            )
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center mt-3 justify-between w-full gap-4 flex-wrap">
        <button
          type="submit"
          disabled={loading || (!text.trim() && !image)}
          className={`flex justify-center items-center rounded px-6 py-2 text-white font-bold ${
            loading || (!text.trim() && !image) ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"
          }`}
        >
          {loading ? "Posting..." : "Post"}
        </button>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Image color="#063b74" />
            <span className="text-blue-600 font-bold">Add Image</span>

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleImage}
            />
          </label>
        </div>
      </div>
    </form>
  );
};

export default AddPost;
