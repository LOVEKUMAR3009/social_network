import React from 'react'

const ProfileUpdate = () => {
    
  return (
    <>
        <div className="min-h-screen w-full  bg-gray-200">
        <div className="flex  justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[500px]">
            <div className="flex justify-center">
              <div className="pb-15">
                <div className="flex items-center  justify-center rounded-b-full">
                  {/* <CircleUserRound size={100} className='pb-1'/> */}
                  <CircleUserRound
                    color="#151414"
                    size={100}
                    strokeWidth={1.7}
                    absoluteStrokeWidth
                  />
                </div>
                <div className="flex justify-center items-center">
                  <button className="border-blue-400 rounded text-xs p-1 border-2 text-blue-400 font-bold">
                    Upload Profile Pic
                  </button>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup}>
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
              </div>

              <div className="mb-5">
                <label htmlFor="dob" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>

                <input
                  type="date"
                  required
                  id="dob"
                  onChange={(e) => setdateOfBirth(e.target.value)}
                  value={dateOfBirth}
                  placeholder="dd/mm/yy"
                  className="border w-full p-2 rounded focus:outline-blue-200 bg-gray-200"
                />

                {error.date_of_birth && (
                  <p className="text-red-500 text-xs">{error.date_of_birth[0]}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 text-white p-2 rounded-2xl hover:bg-blue-700"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileUpdate