import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErr.js"
import { User} from "../models/user.models.js"
import sendEmail from "../emailservices.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Task } from "../models/Task.js";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
  
    // Validate required fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ApiError(409, "User with this email or username already exists");
    }
  
    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase()
    });
  
    // Send confirmation email
    await sendEmail(email, 'Welcome!', 'Thank you for registering with us!');
  
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
  
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
  });

const loginUser = asyncHandler(async (req, res) =>{
   
    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
   

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});




export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, status } = req.body;
  const createdBy = req.user._id; // The logged-in user who creates the task

  try {
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
  const io = req.app.get('io');
  io.emit('taskCreated', Task);
  res.status(201).json(Task);
};

export const getTasks = async (req, res) => {
  const { filter, sortBy } = req.query; // Filtering and sorting parameters

  try {
    const tasks = await Task.find({ createdBy: req.user._id }) // Only fetch tasks created by the user
      .sort(sortBy ? { [sortBy]: 1 } : { createdAt: -1 })
      .exec();

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { status, priority, dueDate } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, createdBy: req.user._id }, // Ensure the task belongs to the user
      { status, priority, dueDate },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      createdBy: req.user._id, // Only allow deletion if the task is created by the user
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

export const assignTask = async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body; // User to assign the task to

  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: userId },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task assigned successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};

export const getFilteredTasks = async (req, res) => {
    const { status, priority, dueDate, search } = req.query;
    const filters = {};
  
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };
    if (search) filters.title = { $regex: search, $options: 'i' };
  
    try {
      const tasks = await Task.find(filters);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


export {
    registerUser,
    loginUser,
    logoutUser,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    assignTask,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getFilteredTasks
}