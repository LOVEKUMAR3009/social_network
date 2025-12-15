import React, { useContext } from "react";
import { Pen, Pencil, CircleUserRound } from "lucide-react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import convertDate from "../utils/DateConversion";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full flex flex-col items-center">
          {/* Avatar + edit icon */}
          <div className="relative mb-2">
            {/* Circular wrapper: fixed square, rounded-full, overflow-hidden */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center">
              {!user?.profile_picture ? (
                <CircleUserRound
                  onClick={() => navigate("/update")}
                  className="cursor-pointer"
                  color="#151414"
                  size={56}
                  strokeWidth={1.7}
                  absoluteStrokeWidth
                />
              ) : (
                <img
                  src={user?.profile_picture}
                  alt="profile"
                  // onClick={() => navigate("/update")}
                  className="w-full h-full object-cover block"
                />
              )}
            </div>

            {/* Pencil icon positioned over avatar (bottom-right) */}
            <Pencil
              onClick={() => navigate("/update")}
              size={20}
              strokeWidth={2.75}
              className="absolute -bottom-1 -right-2  p-0.5 cursor-pointer"
            />
          </div>

          <div className="m-2 font-bold text-2xl">{user?.full_name}</div>
          <div className="m-2 text-xl">{user?.email}</div>

          <div className="pt-3 pb-3 pl-1 pr-1 rounded flex justify-center bg-gray-200 m-2">
            <div className="relative">
              {user && (
                <>
                  <p className="ml-3 mr-5">DOB - {convertDate(user?.date_of_birth)}</p>
                  <Pencil
                    size={18}
                    onClick={() => navigate("/update")}
                    strokeWidth={2.75}
                    className="absolute bottom-1 right-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <p className="text-blue-500">Share Profile</p>
        </div>
      </div>
    </>
  );
};

export default Profile;
