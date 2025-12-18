import React, { useContext, useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthProvider";

const UpdateProfile = () => {
  const {user,setUser} = useContext(AuthContext)
  const [imageUrl, setImageUrl] = useState(user.profile_picture); // preview URL
  const [image, setImage] = useState(null); // actual File
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);

  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth);
  const [error, setError] = useState({}); // server or validation errors
  const navigate = useNavigate();

  // Clean up object URL on unmount or when imageUrl changes
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  // ------------- IMAGE HANDLER -------------
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG files are allowed!");
      e.target.value = "";
      return;
    }

    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Image must be <= ${MAX_MB} MB`);
      e.target.value = "";
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const preview = URL.createObjectURL(file);
    setImage(file);
    setImageUrl(preview);
    e.target.value = "";
  };

  // ------------- DATE VALIDATION -------------
  // Returns true if valid; sets error state when invalid
    const handleDateValidation = (dateString) => {
    // clear previous date error
    setError((prev) => {
      const copy = { ...prev };
      delete copy.date_of_birth;
      return copy;
    });

    if (!dateString) {
      setError((prev) => ({
        ...prev,
        date_of_birth: ["Date of birth is required."],
      }));
      return false;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      setError((prev) => ({
        ...prev,
        date_of_birth: ["Invalid date format."],
      }));
      return false;
    }

    // Normalize to local date (ignore time) to avoid timezone issues
    const given = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (given > today) {
      setError((prev) => ({
        ...prev,
        date_of_birth: ["Date of birth cannot be in the future."],
      }));
      return false;
    }


    // valid -> ensure date error removed
    setError((prev) => {
      const copy = { ...prev };
      delete copy.date_of_birth;
      return copy;
    });
    return true;
  };





  // ------------- SIGNUP SUBMIT -------------
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError({}); // clear previous server errors

    // local date validation
    const dateValid = handleDateValidation(dateOfBirth);
    if (!dateValid) return;



    // Build form data to send image correctly
    const formData = new FormData();
    formData.append("date_of_birth", dateOfBirth);
    formData.append("full_name", fullName);
    if (image) formData.append("profile_picture", image);

    try {
      console.log(formData);

      const response = await axiosInstance.put("/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // success — redirect to login
      console.log("Data Updated Successfully", response.data);
      setUser(response.data.user)
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const respData = err?.response?.data;
      if (respData) {
        setError(respData);
      } else {
        setError({ non_field_errors: ["Something went wrong. Try again."] });
      }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gray-200">
        <div className="text-center p-5 text-3xl font-bold">
          <h1>Join Social Network</h1>
        </div>

        <div className="flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[500px]">
            <div className="flex justify-center">
              <div className="pb-15">
                {/* circular avatar wrapper */}
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUserRound
                      color="#151414"
                      size={100}
                      strokeWidth={1.7}
                      absoluteStrokeWidth
                    />
                  )}
                </div>

                <div className="flex justify-center items-center border-blue-400 cursor-pointer rounded text-xs p-1 border-2 text-blue-400 font-bold mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-blue-600 font-bold">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleImage}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleUpdate}>
              <div className="mb-5 ">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>

                <input
                  type="text"
                  id="name"
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  placeholder="Full Name"
                  className="border w-full p-2 bg-gray-200 rounded focus:outline-blue-200"
                />
                {error.full_name && (
                  <p className="text-red-500 text-xs">{error.full_name[0]}</p>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="dob" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>

                <input
                  type="date"
                  required
                  id="dob"
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    // live-validate date on change
                    handleDateValidation(e.target.value);
                  }}
                  value={dateOfBirth}
                  placeholder="dd/mm/yy"
                  className="border w-full p-2 rounded focus:outline-blue-200 bg-gray-200"
                />

                {error.date_of_birth && (
                  <p className="text-red-500 text-xs">
                    {error.date_of_birth[0]}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  required
                  disabled
                  value={email}
                  placeholder="Email"
                  className="border bg-gray-200 w-full p-2 rounded focus:outline-blue-200"
                />
              </div>

              {error.non_field_errors && (
                <p className="text-red-500 text-xs">
                  {error.non_field_errors[0]}
                </p>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer    mt-2 bg-blue-600 text-white p-2 rounded-2xl hover:bg-blue-700"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;
